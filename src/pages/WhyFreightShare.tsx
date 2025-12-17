import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  TrendingDown, 
  Building2, 
  Leaf, 
  Users, 
  ArrowRight,
  Package,
  Route,
  ShieldCheck,
  Ban
} from 'lucide-react';

const WhyFreightShare = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
              Why FreightShare Exists
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building fairer logistics infrastructure for small and medium businesses — not another intermediary layer.
            </p>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                The Problem: Fragmented Logistics
              </h2>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <p className="text-foreground leading-relaxed">
                Small and medium-sized businesses (SMEs) and local markets struggle to ship internationally because logistics are fragmented. Unlike large corporations that can negotiate dedicated transport contracts, SMEs ship small volumes and rarely have enough cargo to fill full trucks.
              </p>
              
              <p className="text-foreground leading-relaxed">
                This forces them to rely on intermediaries — export agents, freight forwarders, and aggregators — who capture significant margins without adding proportional value. These intermediaries operate with limited transparency, often consolidating shipments in ways that prioritize their own efficiency over shipper needs.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-destructive">
                <p className="text-foreground font-medium">
                  The result: SMEs pay higher logistics costs per unit, lose margin on every transaction, and often forfeit access to international markets entirely — not because demand doesn't exist, but because the logistics economics don't work at their scale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Facts Section */}
        <section className="bg-secondary/5 py-16 mb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                  The Facts
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">20–30%</div>
                  <p className="text-muted-foreground">
                    of truck capacity in Europe runs empty or underutilized on any given route
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">Up to 30%</div>
                  <p className="text-muted-foreground">
                    more per unit — what SMEs can pay for logistics compared to large shippers
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">10–25%</div>
                  <p className="text-muted-foreground">
                    of transport value captured by logistics intermediaries as margin
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-3xl font-heading font-bold text-accent mb-2">Major contributor</div>
                  <p className="text-muted-foreground">
                    Road freight is a significant source of transport-related CO₂ emissions, largely driven by inefficiencies
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Sources: European Commission transport statistics, IRU industry reports, logistics market analyses
              </p>
            </div>
          </div>
        </section>

        {/* What FreightShare Changes Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                What FreightShare Changes
              </h2>
            </div>
            
            <div className="grid gap-6">
              <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">SMEs ship by pallet, not by truck</h3>
                  <p className="text-muted-foreground">
                    Post any shipment size — from a single pallet to partial loads. No minimum volume requirements, no aggregation fees.
                  </p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Direct access to carriers</h3>
                  <p className="text-muted-foreground">
                    Connect directly with transport companies. No exclusive contracts, no forced intermediaries, no hidden fees between you and the carrier.
                  </p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-accent/10 shrink-0">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Transparent pricing and secure payment</h3>
                  <p className="text-muted-foreground">
                    All pricing is visible upfront. Payments are processed inside FreightShare, protecting both parties until delivery is confirmed.
                  </p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-carrier/10 shrink-0">
                  <TrendingDown className="h-5 w-5 text-carrier rotate-180" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Carriers monetize unused capacity</h3>
                  <p className="text-muted-foreground">
                    Post available routes and fill empty space. Optimize existing routes instead of running partially loaded trucks.
                  </p>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-carrier/10 shrink-0">
                  <Building2 className="h-5 w-5 text-carrier" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Smaller carriers gain market access</h3>
                  <p className="text-muted-foreground">
                    Independent transport companies access demand previously dominated by large logistics players and established networks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Impact Section */}
        <section className="bg-carrier/5 py-16 mb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-carrier/10">
                  <Leaf className="h-6 w-6 text-carrier" />
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                  Environmental Impact
                </h2>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
                <p className="text-foreground leading-relaxed">
                  <strong>FreightShare does not create additional transport.</strong> We don't add trucks to the road or generate new logistics activity. Instead, we improve the utilization of vehicles that are already running.
                </p>
                
                <p className="text-foreground leading-relaxed">
                  When a carrier posts a route from Madrid to Hamburg, that truck is already making the journey. FreightShare helps fill available pallet space that would otherwise travel empty.
                </p>
                
                <div className="bg-carrier/10 rounded-lg p-4 border-l-4 border-carrier">
                  <p className="text-foreground font-medium">
                    Better load factors mean fewer empty kilometers, lower emissions per unit shipped, and more efficient use of existing infrastructure. Every pallet matched is capacity that was previously wasted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Don't Do Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-muted">
                <Ban className="h-6 w-6 text-muted-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
                What FreightShare Does NOT Do
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <p className="text-foreground">No exclusive contracts that lock in shippers or carriers</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <p className="text-foreground">No forced intermediaries between parties</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <p className="text-foreground">No value extraction from market inefficiency</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                <p className="text-foreground">No prioritization of large incumbents over small players</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground mb-4">
                Ready to Ship Smarter?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join the marketplace that puts shippers and carriers first. No intermediaries, no hidden fees, just direct connections.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="accent" asChild>
                  <Link to="/auth?mode=signup&role=shipper" className="gap-2">
                    Post a Load
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link to="/auth?mode=signup&role=carrier" className="gap-2">
                    Post a Route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default WhyFreightShare;
