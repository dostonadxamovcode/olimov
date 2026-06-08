const MAX_ATTEMPTS = 40;
const RETRY_DELAY_MS = 50;

function getFixedHeaderOffset() {
  const header = document.querySelector('[data-app-header]');
  return header?.getBoundingClientRect().height || 0;
}

// Scrolls so the target sits roughly centered in the viewport area below the
// fixed header, then focuses it (without re-triggering a scroll jump) so
// keyboard/screen-reader users land there too.
function focusAndCenter(el) {
  const headerOffset = getFixedHeaderOffset();
  const rect = el.getBoundingClientRect();
  const visibleHeight = window.innerHeight - headerOffset;
  const centeredTop =
    rect.top + window.scrollY - headerOffset - Math.max((visibleHeight - rect.height) / 2, 0);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({ top: Math.max(centeredTop, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  if (typeof el.focus === 'function') {
    el.focus({ preventScroll: true });
  }
}

// Guards against stale retries: if the user navigates to a different section
// before a lazily-loaded target finishes mounting, the older request bows out
// instead of hijacking the scroll once its element finally appears.
let activeRequestId = 0;

// Scrolls to an element by id, retrying briefly so it works even when the
// target is inside a lazily-loaded (Suspense) section that hasn't mounted yet.
export function scrollToSection(id) {
  if (!id) return;

  const requestId = ++activeRequestId;

  const attempt = (count) => {
    if (requestId !== activeRequestId) return;

    const el = document.getElementById(id);
    if (el) {
      focusAndCenter(el);
      return;
    }

    if (count < MAX_ATTEMPTS) {
      setTimeout(() => attempt(count + 1), RETRY_DELAY_MS);
    }
  };

  attempt(0);
}
