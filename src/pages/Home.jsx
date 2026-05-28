import { lazy, Suspense } from 'react';
import Hero from '../components/Hero';

// Lazy load below-fold sections — reduces initial JS parse time on mobile
const Services       = lazy(() => import('../components/Services'));
const MockTests      = lazy(() => import('../components/MockTests'));
const Features       = lazy(() => import('../components/Features'));
const LearningTools  = lazy(() => import('../components/LearningTools'));
const About          = lazy(() => import('../components/About'));
const AuthPreview    = lazy(() => import('../components/AuthPreview'));
const Contact        = lazy(() => import('../components/Contact'));

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <Services />
        <MockTests />
        <Features />
        <LearningTools />
        <About />
        <AuthPreview />
        <Contact />
      </Suspense>
    </>
  );
}
