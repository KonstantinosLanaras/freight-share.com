import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-6">
                <FileText className="h-7 w-7" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">FreightShare B.V.</p>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                Privacy Policy — Coming Soon
              </h1>
              <p className="text-lg text-muted-foreground">
                Currently drafting. Our full Privacy Policy will be published here shortly,
                ahead of the platform's public launch.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
