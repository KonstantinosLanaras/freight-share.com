import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Truck, 
  ShieldCheck, 
  TrendingUp,
  Target,
  Heart,
  Globe,
  ArrowRight
} from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">
                About FreightShare
              </h1>
              <p className="text-xl text-muted-foreground">
                We're building the future of freight logistics by connecting shippers and carriers directly, 
                eliminating unnecessary intermediaries, and creating a fairer marketplace for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4">
                  FreightShare was founded with a simple belief: freight logistics doesn't have to be complicated, 
                  expensive, or opaque. Too many small and medium-sized businesses struggle to find reliable 
                  transport at fair prices, while carriers often drive with empty space.
                </p>
                <p className="text-muted-foreground mb-4">
                  We're changing that by creating direct connections between shippers who need to move goods 
                  and carriers who have available capacity. No brokers taking a cut. No hidden fees. 
                  Just transparent, efficient freight matching.
                </p>
                <p className="text-muted-foreground">
                  Our platform ensures secure payments through escrow, verified business partners, and 
                  a trusted resolution center when issues arise. We're the neutral third party that 
                  makes direct connections safe and reliable.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">Direct</div>
                    <div className="text-sm text-muted-foreground">Connections</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">Secure</div>
                    <div className="text-sm text-muted-foreground">Payments</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">Fair</div>
                    <div className="text-sm text-muted-foreground">Pricing</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-foreground">Europe</div>
                    <div className="text-sm text-muted-foreground">Wide Coverage</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
              Our Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  No hidden fees, no surprises. What you see is what you pay. 
                  Both shippers and carriers know exactly what they're getting.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Fairness</h3>
                <p className="text-muted-foreground">
                  We believe in fair access for SMEs and small carriers. 
                  Everyone deserves the opportunity to compete on equal footing.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Efficiency</h3>
                <p className="text-muted-foreground">
                  Better utilization of existing transport capacity means fewer empty trucks, 
                  lower costs, and a smaller environmental footprint.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 lg:p-12 text-center">
                <h2 className="text-3xl font-heading font-bold mb-4">
                  Ready to Ship Smarter?
                </h2>
                <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                  Join thousands of businesses already using FreightShare to connect directly 
                  with trusted partners across Europe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg" asChild>
                    <Link to="/auth?mode=signup&role=shipper">
                      I'm a Shipper
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link to="/auth?mode=signup&role=carrier">
                      I'm a Carrier
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
