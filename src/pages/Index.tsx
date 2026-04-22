import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { HowItWorksPreview } from '@/components/landing/HowItWorksPreview';
import { ImpactSection } from '@/components/landing/ImpactSection';
import { CTA } from '@/components/landing/CTA';
import { EarlyAccess } from '@/components/landing/EarlyAccess';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorksPreview />
        <ImpactSection />
        <CTA />
        <EarlyAccess />
      </main>
      <Footer />
    </div>
  );
};

export default Index;