import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';
import SEO from '../components/SEO';

const HOME_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "CEFR Preparation Services",
  "url": "https://olimov.vercel.app",
  "description": "Full suite of CEFR preparation services including listening, reading, writing, speaking, and mock tests.",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://olimov.vercel.app/services/listening", "name": "Listening Practice" },
    { "@type": "ListItem", "position": 2, "url": "https://olimov.vercel.app/services/reading",   "name": "Reading Drills" },
    { "@type": "ListItem", "position": 3, "url": "https://olimov.vercel.app/services/writing",   "name": "Writing Coaching" },
    { "@type": "ListItem", "position": 4, "url": "https://olimov.vercel.app/services/speaking",  "name": "Speaking Sessions" },
    { "@type": "ListItem", "position": 5, "url": "https://olimov.vercel.app/services/mock-tests","name": "Mock Tests" }
  ]
})

// Individual Suspense per section — each mounts as soon as its chunk loads
// instead of all waiting for the slowest one.
const Services       = lazy(() => import('../components/Services'));
const Features       = lazy(() => import('../components/Features'));
const IELTSMockTests = lazy(() => import('../components/IELTSMockTests'));
const About          = lazy(() => import('../components/About'));
const Contact        = lazy(() => import('../components/Contact'));

export default function Home() {
  return (
    <>
      <SEO
        title="CEFR Preparation Platform"
        description="Master CEFR with mock tests, expert feedback, vocabulary tools, and real-time progress tracking. Trusted by 12k+ students in Uzbekistan."
        canonical="https://olimov.vercel.app/"
        schema={HOME_SCHEMA}
      />
      <Hero />
      <Suspense fallback={null}><Services /></Suspense>
      <Suspense fallback={null}><Features /></Suspense>
      <Suspense fallback={null}><IELTSMockTests /></Suspense>
      <Suspense fallback={null}><About /></Suspense>
      <Suspense fallback={null}><Contact /></Suspense>
    </>
  );
}
