"use client";

import { loadStripeTerminal } from "@stripe/terminal-js";
import type { Reader, Terminal } from "@stripe/terminal-js/types/terminal";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  connectTerminalReader,
  discoverTerminalReaders,
  disconnectTerminalReader,
  fetchTerminalConnectionToken,
  mapReaderStatus,
  nextReconnectDelayMs,
  processTerminalCardPayment,
  type StripeTerminalReaderStatus,
  useSimulatedTerminalReaders,
} from "@/lib/payments/stripe-terminal-client";

export type UseStripeTerminalOptions = {
  autoConnect?: boolean;
  maxReconnectAttempts?: number;
  onUnexpectedDisconnect?: () => void;
};

export type UseStripeTerminalResult = {
  terminal: Terminal | null;
  reader: Reader | null;
  status: StripeTerminalReaderStatus;
  discoveredReaders: Reader[];
  error: string | null;
  processing: boolean;
  initialize: () => Promise<void>;
  discoverReaders: () => Promise<Reader[]>;
  connectReader: (readerId?: string) => Promise<Reader | null>;
  disconnectReader: () => Promise<void>;
  processPayment: (params: {
    amount: number;
    orderId: string;
    currency?: string;
  }) => Promise<unknown>;
  getReaderStatus: () => StripeTerminalReaderStatus;
};

export function useStripeTerminal(options: UseStripeTerminalOptions = {}): UseStripeTerminalResult {
  const { autoConnect = true, maxReconnectAttempts = 3, onUnexpectedDisconnect } = options;

  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [reader, setReader] = useState<Reader | null>(null);
  const [discoveredReaders, setDiscoveredReaders] = useState<Reader[]>([]);
  const [status, setStatus] = useState<StripeTerminalReaderStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const readerRef = useRef<Reader | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const getReaderStatus = useCallback((): StripeTerminalReaderStatus => {
    return mapReaderStatus({
      connected: Boolean(readerRef.current),
      processing,
      readerStatus: readerRef.current?.status ?? null,
    });
  }, [processing]);

  const scheduleReconnect = useCallback(
    (term: Terminal) => {
      if (reconnectAttemptRef.current >= maxReconnectAttempts) return;
      clearReconnectTimer();
      const delay = nextReconnectDelayMs(reconnectAttemptRef.current);
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = setTimeout(() => {
        void (async () => {
          try {
            setStatus("connecting");
            const readers = await discoverTerminalReaders(term, useSimulatedTerminalReaders());
            if (readers.length === 0) {
              setStatus("offline");
              return;
            }
            const preferred =
              readers.find((r) => r.id === readerRef.current?.id) ?? readers[0] ?? null;
            if (!preferred) {
              setStatus("offline");
              return;
            }
            const connected = await connectTerminalReader(term, preferred);
            readerRef.current = connected;
            setReader(connected);
            reconnectAttemptRef.current = 0;
            setStatus(mapReaderStatus({ connected: true, processing: false, readerStatus: connected.status }));
          } catch {
            setStatus("offline");
          }
        })();
      }, delay);
    },
    [clearReconnectTimer, maxReconnectAttempts],
  );

  const initialize = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      const StripeTerminal = await loadStripeTerminal();
      if (!StripeTerminal) throw new Error("Stripe Terminal.js failed to load");

      const term = StripeTerminal.create({
        onFetchConnectionToken: fetchTerminalConnectionToken,
        onUnexpectedReaderDisconnect: () => {
          readerRef.current = null;
          setReader(null);
          setStatus("offline");
          onUnexpectedDisconnect?.();
          if (terminalRef.current) scheduleReconnect(terminalRef.current);
        },
      });

      terminalRef.current = term;
      setTerminal(term);
      setStatus("disconnected");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terminal initialization failed";
      setError(message);
      setStatus("disconnected");
      throw err;
    }
  }, [onUnexpectedDisconnect, scheduleReconnect]);

  const discoverReaders = useCallback(async (): Promise<Reader[]> => {
    const term = terminalRef.current;
    if (!term) throw new Error("Terminal not initialized");
    setError(null);
    const readers = await discoverTerminalReaders(term, useSimulatedTerminalReaders());
    setDiscoveredReaders(readers);
    return readers;
  }, []);

  const connectReader = useCallback(async (readerId?: string): Promise<Reader | null> => {
    const term = terminalRef.current;
    if (!term) throw new Error("Terminal not initialized");
    setError(null);
    setStatus("connecting");
    try {
      let candidates = discoveredReaders;
      if (candidates.length === 0) {
        candidates = await discoverTerminalReaders(term, useSimulatedTerminalReaders());
        setDiscoveredReaders(candidates);
      }
      if (candidates.length === 0) {
        setStatus("offline");
        return null;
      }
      const target =
        (readerId ? candidates.find((r) => r.id === readerId) : null) ?? candidates[0] ?? null;
      if (!target) {
        setStatus("offline");
        return null;
      }
      const connected = await connectTerminalReader(term, target);
      readerRef.current = connected;
      setReader(connected);
      reconnectAttemptRef.current = 0;
      const nextStatus = mapReaderStatus({
        connected: true,
        processing: false,
        readerStatus: connected.status,
      });
      setStatus(nextStatus);
      return connected;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reader connection failed";
      setError(message);
      setStatus("offline");
      throw err;
    }
  }, [discoveredReaders]);

  const disconnectReader = useCallback(async () => {
    clearReconnectTimer();
    reconnectAttemptRef.current = 0;
    const term = terminalRef.current;
    if (term) {
      await disconnectTerminalReader(term);
    }
    readerRef.current = null;
    setReader(null);
    setStatus("disconnected");
  }, [clearReconnectTimer]);

  const processPayment = useCallback(
    async (params: { amount: number; orderId: string; currency?: string }) => {
      const term = terminalRef.current;
      if (!term) throw new Error("Terminal not initialized");
      if (!readerRef.current) {
        await connectReader();
      }
      if (!readerRef.current) {
        throw new Error("No card reader connected");
      }

      setProcessing(true);
      setStatus("processing");
      setError(null);
      try {
        const result = await processTerminalCardPayment({
          terminal: term,
          amount: params.amount,
          orderId: params.orderId,
          currency: params.currency,
        });
        setStatus(
          mapReaderStatus({
            connected: true,
            processing: false,
            readerStatus: readerRef.current?.status ?? "online",
          }),
        );
        return result.transaction;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Terminal payment failed";
        setError(message);
        setStatus(
          mapReaderStatus({
            connected: Boolean(readerRef.current),
            processing: false,
            readerStatus: readerRef.current?.status ?? null,
          }),
        );
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [connectReader],
  );

  useEffect(() => {
    let cancelled = false;
    const shouldAutoConnect = autoConnect;

    void (async () => {
      try {
        await initialize();
        if (cancelled || !shouldAutoConnect || !terminalRef.current) return;
        const readers = await discoverTerminalReaders(
          terminalRef.current,
          useSimulatedTerminalReaders(),
        );
        if (cancelled || readers.length === 0) {
          if (!cancelled) setStatus("offline");
          return;
        }
        setDiscoveredReaders(readers);
        const connected = await connectTerminalReader(terminalRef.current, readers[0]!);
        if (cancelled) return;
        readerRef.current = connected;
        setReader(connected);
        setStatus(
          mapReaderStatus({ connected: true, processing: false, readerStatus: connected.status }),
        );
      } catch {
        if (!cancelled) setStatus("offline");
      }
    })();

    return () => {
      cancelled = true;
      clearReconnectTimer();
      void terminalRef.current?.disconnectReader();
    };
    // Mount-only bootstrap — reconnect handlers use refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    terminal,
    reader,
    status,
    discoveredReaders,
    error,
    processing,
    initialize,
    discoverReaders,
    connectReader,
    disconnectReader,
    processPayment,
    getReaderStatus,
  };
}
