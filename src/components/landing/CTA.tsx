import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Route } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 md:p-16">
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6">
              <Route className="h-4 w-4" />
              Start shipping smarter today
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
              Ready to Connect
              <br />
              <span className="text-accent">Directly?</span>
            </h2>

            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Join FreightShare and find the right carriers or loads for your business. 
              No middlemen, secure payments, fair pricing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                variant="accent" 
                asChild
              >
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20"
                asChild
              >
                <a href="/#how-it-works">
                  See How It Works
                </a>
              </Button>
            </div>

            <p className="text-sm text-white/60 mt-6">
              Already have an account?{' '}
              <Link to="/auth" className="text-white hover:underline font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
