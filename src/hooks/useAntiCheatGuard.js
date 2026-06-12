import { useEffect, useRef } from 'react';

/**
 * Arms a tab-switch / page-hide guard while `active` is true.
 * Calls `onViolation` exactly once on the first detected violation.
 *
 * Covered events:
 *   visibilitychange → hidden   tab switch, alt-tab, window minimise
 *   pagehide                    browser back / tab close
 *
 * @param {object}   opts
 * @param {boolean}  opts.active        Guard is armed only when true.
 * @param {Function} opts.onViolation   Called once on the first violation.
 * @param {number}   [opts.gracePeriod] Ignore events within N ms of arming (default 500).
 */
export function useAntiCheatGuard({ active, onViolation, gracePeriod = 500 }) {
  // Set at hook creation — used as the "armed at" timestamp.
  const armedAtRef  = useRef(Date.now());
  const firedRef    = useRef(false);
  // Callback ref so we always call the latest version without re-subscribing.
  const callbackRef = useRef(onViolation);
  useEffect(() => { callbackRef.current = onViolation; });

  useEffect(() => {
    if (!active) return;

    // Reset arm time and fired flag each time the guard is (re-)armed.
    armedAtRef.current = Date.now();
    firedRef.current   = false;

    const trigger = () => {
      if (firedRef.current) return;
      if (Date.now() - armedAtRef.current < gracePeriod) return;
      firedRef.current = true;
      callbackRef.current?.();
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') trigger();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', trigger);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', trigger);
    };
  }, [active, gracePeriod]);
}
