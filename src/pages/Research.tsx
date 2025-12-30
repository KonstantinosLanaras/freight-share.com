import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const Research = () => {
  // Placeholder URL - to be replaced with actual Google Forms link
  const surveyUrl = "#";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          
          <h1 className="text-3xl font-heading font-bold text-foreground mb-8">
            Help Validate FreightShare
          </h1>

          {/* Intro */}
          <div className="space-y-4 text-muted-foreground mb-10">
            <p>
              FreightShare is a B2B freight marketplace focused on matching palletised shipments to existing truck routes.
            </p>
            <p>
              We are currently validating a number of assumptions with shippers and carriers to ensure the platform reflects real operational constraints and pricing realities.
            </p>
            <p>
              Your input will directly shape the platform's design and functionality.
            </p>
          </div>

          {/* What this involves */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What this involves
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Short questionnaire (5–7 minutes)</li>
              <li>No sales call</li>
              <li>No commitment</li>
              <li>Responses used for research only</li>
            </ul>
          </section>

          {/* Who this is for */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              This is relevant if you are:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>A shipper moving palletised goods</li>
              <li>A carrier operating fixed or semi-fixed routes</li>
              <li>An SME involved in road freight (domestic or cross-border)</li>
            </ul>
          </section>

          {/* Survey section */}
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Research questionnaire
            </h2>
            <p className="text-muted-foreground mb-6">
              The questionnaire covers your current freight operations and challenges.
            </p>
            <Button 
              size="lg"
              onClick={() => window.open(surveyUrl, '_blank', 'noopener,noreferrer')}
            >
              Open the questionnaire
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </section>

          {/* Incentive */}
          <p className="text-sm text-muted-foreground mb-10">
            Participants may receive early visibility into platform design or be invited to follow-up discussions.
          </p>

          {/* Trust & data use */}
          <section className="text-sm text-muted-foreground border-t border-border pt-6">
            <p>
              All responses are confidential and used solely for research purposes. 
              You will not receive any marketing communications unless you explicitly opt in.
            </p>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Research;
