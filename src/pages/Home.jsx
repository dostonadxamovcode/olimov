import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';

// Lazy load below-fold sections — reduces initial JS parse time on mobile
const Services        = lazy(() => import('../components/Services'));
const Features        = lazy(() => import('../components/Features'));
const IELTSMockTests  = lazy(() => import('../components/IELTSMockTests'));
const About           = lazy(() => import('../components/About'));
const Contact         = lazy(() => import('../components/Contact'));

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <Services />
        <Features />
        <IELTSMockTests />
        <About />
        <Contact />
      </Suspense>
    </>
  );
}
