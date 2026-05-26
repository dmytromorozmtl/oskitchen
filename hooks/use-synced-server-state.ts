'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * Keeps client state in sync with server props after `router.refresh()`.
 * Without this, `useState(initial)` freezes the first RSC payload forever.
 */
export function useSyncedServerState<T>(serverValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(serverValue);

  useEffect(() => {
    setValue(serverValue);
  }, [serverValue]);

  return [value, setValue];
}
