const MAX_ATTEMPTS = 40;
const RETRY_DELAY_MS = 50;
const HIGHLIGHT_CLASS = 'scroll-highlight';
const HIGHLIGHT_DURATION_MS = 2000;
const SCROLL_SETTLE_FALLBACK_MS = 1200;

// Guards against stale retries/highlights: if the user navigates to a different
// section before a lazily-loaded target finishes mounting, the older request
// bows out instead of hijacking the scroll once its element finally appears.
let activeRequestId = 0;

function getFixedHeaderOffset() {
  const header = document.querySelector('[data-app-header]');
  return header?.getBoundingClientRect().height || 0;
}

// True once the section already sits in the visible band below the fixed
// header — there's nothing to scroll to, just confirm the destination.
function isAlreadyInView(rect, headerOffset) {
  const center = rect.top + rect.height / 2;
  return center >= headerOffset && center <= window.innerHeight;
}

// Briefly glows/scales the section's content card (glow + border accent +
// subtle scale, see `.scroll-highlight` in index.css) to confirm where the
// user landed after a navbar smooth-scroll.
function flashHighlight(el) {
  const target = el.querySelector('.premium-card') || el;
  target.classList.remove(HIGHLIGHT_CLASS);
  void target.offsetWidth; // restart the animation if it's re-triggered mid-flight
  target.classList.add(HIGHLIGHT_CLASS);
  setTimeout(() => target.classList.remove(HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS);
}

// Resolves once the smooth scroll has settled, via the `scrollend` event where
// supported and a fixed fallback delay everywhere else.
function whenScrollSettles(onSettled) {
  if (!('onscrollend' in window)) {
    setTimeout(onSettled, SCROLL_SETTLE_FALLBACK_MS);
    return;
  }
  let settled = false;
  const finish = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener('scrollend', finish);
    onSettled();
  };
  window.addEventListener('scrollend', finish);
  setTimeout(finish, SCROLL_SETTLE_FALLBACK_MS);
}

// Centers the target in the viewport area below the fixed header, focuses it
// for a11y, and — once the scroll settles (or immediately, if already in view) —
// gives sections opted in via `data-scroll-highlight` a brief landing flash.
function landOn(el, requestId) {
  const shouldHighlight = el.hasAttribute('data-scroll-highlight');
  const headerOffset = getFixedHeaderOffset();
  const rect = el.getBoundingClientRect();

  if (typeof el.focus === 'function') {
    el.focus({ preventScroll: true });
  }

  if (isAlreadyInView(rect, headerOffset)) {
    if (shouldHighlight) flashHighlight(el);
    return;
  }

  const visibleHeight = window.innerHeight - headerOffset;
  const centeredTop =
    rect.top + window.scrollY - headerOffset - Math.max((visibleHeight - rect.height) / 2, 0);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({ top: Math.max(centeredTop, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  if (shouldHighlight) {
    whenScrollSettles(() => {
      if (requestId === activeRequestId) flashHighlight(el);
    });
  }
}

// Scrolls to an element by id, retrying briefly so it works even when the
// target is inside a lazily-loaded (Suspense) section that hasn't mounted yet.
export function scrollToSection(id) {
  if (!id) return;

  const requestId = ++activeRequestId;

  const attempt = (count) => {
    if (requestId !== activeRequestId) return;

    const el = document.getElementById(id);
    if (el) {
      landOn(el, requestId);
      return;
    }

    if (count < MAX_ATTEMPTS) {
      setTimeout(() => attempt(count + 1), RETRY_DELAY_MS);
    }
  };

  attempt(0);
}
