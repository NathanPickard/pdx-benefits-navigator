'use client';
import { useCallback, useEffect, useState } from 'react';

export type AppStatus = 'not_started' | 'in_progress' | 'applied';
const KEY = 'pdx_app_status';
type StatusMap = Record<string, AppStatus>;

function read(): StatusMap {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as StatusMap; } catch { return {}; }
}

export function useApplicationStatus() {
  const [map, setMap] = useState<StatusMap>({});
  // Reading localStorage in a useEffect is the standard SSR-safe hydration pattern.
  // The single synchronous setState here is an intentional one-time mount hydration,
  // not the cascading-render anti-pattern the rule targets.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setMap(read()); }, []); // hydrate after mount (avoids SSR mismatch)
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((next: StatusMap) => {
    setMap(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* non-fatal */ }
  }, []);

  const setStatus = useCallback((id: string, s: AppStatus) => {
    persist({ ...read(), [id]: s });
  }, [persist]);

  const clearAll = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* non-fatal */ }
    setMap({});
  }, []);

  const statusFor = (id: string): AppStatus => map[id] ?? 'not_started';
  const values = Object.values(map);
  const counts = {
    applied: values.filter((s) => s === 'applied').length,
    in_progress: values.filter((s) => s === 'in_progress').length,
    not_started: 0, // computed against eligible list by the caller
  };
  return { statusFor, setStatus, clearAll, counts };
}
