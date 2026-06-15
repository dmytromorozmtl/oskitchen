"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const globalCache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function fetchJson<T>(url: string): Promise<T> {
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const request = fetch(url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<T>;
  });

  inflight.set(url, request);
  try {
    const data = await request;
    globalCache.set(url, data);
    return data;
  } finally {
    inflight.delete(url);
  }
}

type CachedDataResult<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => Promise<T | undefined>;
};

export function useCachedData<T>(key: string | null): CachedDataResult<T> {
  const [data, setData] = useState<T | undefined>(() =>
    key ? (globalCache.get(key) as T | undefined) : undefined,
  );
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(Boolean(key && !globalCache.has(key)));
  const keyRef = useRef(key);

  const load = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const next = await fetchJson<T>(url);
      if (keyRef.current !== url) return next;
      setData(next);
      return next;
    } catch (err) {
      if (keyRef.current === url) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
      return undefined;
    } finally {
      if (keyRef.current === url) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    keyRef.current = key;
    if (!key) {
      setData(undefined);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    const cached = globalCache.get(key) as T | undefined;
    if (cached !== undefined) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    void load(key);
  }, [key, load]);

  const mutate = useCallback(async () => {
    if (!key) return undefined;
    globalCache.delete(key);
    return load(key);
  }, [key, load]);

  return { data, error, isLoading, mutate };
}
