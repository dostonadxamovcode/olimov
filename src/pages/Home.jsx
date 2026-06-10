import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';

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
      <Hero />
      <Suspense fallback={null}><Services /></Suspense>
      <Suspense fallback={null}><Features /></Suspense>
      <Suspense fallback={null}><IELTSMockTests /></Suspense>
      <Suspense fallback={null}><About /></Suspense>
      <Suspense fallback={null}><Contact /></Suspense>
    </>
  );
}
