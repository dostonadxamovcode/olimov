/**
 * SEO — lightweight <head> manager for the SPA.
 *
 * Sets title, description, canonical, robots, Open Graph, Twitter Card, and
 * an optional page-specific JSON-LD script on every navigation.  No external
 * dependency needed because Googlebot renders JavaScript; static fallback tags
 * in index.html cover social-card scrapers that don't execute JS.
 *
 * Usage:
 *   <SEO title="Listening Practice" description="..." />
 *   <SEO title="Login" noindex />
 *   <SEO title="Home" description="..." schema={HOME_SCHEMA_STRING} />
 *
 * schema must be a pre-serialised JSON string (create it at module level so the
 * reference is stable and the useEffect dependency check doesn't re-fire on
 * every render).
 */
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE     = 'https://olimov.vercel.app'
const SITENAME = 'Olimov CEFR'
const OG_IMAGE = `${SITE}/IMG_0723.JPG`

// ── Imperative <head> helpers ────────────────────────────────────────────────

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${CSS.escape(key)}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SEO({
  title,
  description,
  canonical,
  noindex  = false,
  ogType   = 'website',
  ogImage  = OG_IMAGE,
  schema,          // pre-serialised JSON-LD string or undefined
}) {
  const { pathname } = useLocation()
  const pageUrl   = canonical ?? `${SITE}${pathname}`
  const fullTitle = title
    ? `${title} | ${SITENAME}`
    : `${SITENAME} — CEFR Preparation Platform`

  useEffect(() => {
    // ── Title ─────────────────────────────────────────────────────────────
    document.title = fullTitle

    // ── Standard meta ─────────────────────────────────────────────────────
    if (description) setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')

    // ── Canonical ─────────────────────────────────────────────────────────
    setCanonical(pageUrl)

    // ── Open Graph ────────────────────────────────────────────────────────
    setMeta('property', 'og:title',       fullTitle)
    setMeta('property', 'og:description', description ?? '')
    setMeta('property', 'og:url',         pageUrl)
    setMeta('property', 'og:image',       ogImage)
    setMeta('property', 'og:type',        ogType)
    setMeta('property', 'og:site_name',   SITENAME)

    // ── Twitter Card ──────────────────────────────────────────────────────
    setMeta('name', 'twitter:title',       fullTitle)
    setMeta('name', 'twitter:description', description ?? '')
    setMeta('name', 'twitter:image',       ogImage)

    // ── Page-specific JSON-LD ─────────────────────────────────────────────
    let ldEl = document.getElementById('ld-json-page')
    if (schema) {
      if (!ldEl) {
        ldEl = document.createElement('script')
        ldEl.id   = 'ld-json-page'
        ldEl.type = 'application/ld+json'
        document.head.appendChild(ldEl)
      }
      ldEl.textContent = schema
    } else {
      ldEl?.remove()
    }
  }, [fullTitle, description, pageUrl, noindex, ogImage, ogType, schema])

  return null
}
