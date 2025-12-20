import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Package,
  Route,
  ArrowRight,
  Truck,
  Euro,
  Users,
  Leaf,
  TrendingUp,
  Globe,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Target,
  ShoppingCart
} from 'lucide-react';

const WhyFreightShare = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* SECTION 1: Introduction */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-primary font-medium mb-4 uppercase tracking-wide text-sm">Why FreightShare</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-8 leading-tight">
              European logistics infrastructure for SMEs and carriers
            </h1>
            <div className="text-lg text-muted-foreground space-y-4 max-w-2xl mx-auto">
              <p>
                Small and medium businesses struggle to access efficient national and international transport at small volumes. Meanwhile, carriers operate with significant unused capacity on existing routes.
              </p>
              <p>
                FreightShare connects these two realities directly — without intermediaries, without complexity.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: The Scale of Inefficiency */}
        <section className="bg-secondary/5 py-20 mb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  The scale of inefficiency
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  European road logistics operates far below its potential. These gaps create cost and competitive disadvantages across the supply chain.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">20–30%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    of truck capacity in Europe runs empty or underutilized on average
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Source: European Commission, IRU
                  </p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-accent/10 w-fit mb-4">
                    <Euro className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">~30%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    more per unit — what SMEs pay for transport compared to large shippers
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Source: EU SME logistics studies
                  </p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-destructive/10 w-fit mb-4">
                    <Users className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">10–25%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    of logistics value captured by intermediaries as margin
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Source: Freight forwarding reports
                  </p>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-4xl font-heading font-bold text-foreground mb-2">Major</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Road freight is one of the largest contributors to transport-related CO₂
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Source: European Commission, Eurostat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: What FreightShare Changes (Mechanism) */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                How FreightShare works
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A straightforward mechanism that connects available capacity with shipping demand.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">SMEs ship by pallet</h3>
                  <p className="text-muted-foreground text-sm">
                    Post any shipment size — from a single pallet to partial loads. No full truckload required.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                    <Route className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Carriers post routes</h3>
                  <p className="text-muted-foreground text-sm">
                    Transport companies publish existing routes with available pallet capacity.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Loads match to routes</h3>
                  <p className="text-muted-foreground text-sm">
                    Shipments are matched onto routes already running — no new trucks added.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-muted-foreground/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative">
                <div className="bg-card border border-border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Transparent payment</h3>
                  <p className="text-muted-foreground text-sm">
                    Pricing is visible upfront. Payments are processed securely on the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Efficiency → Competitiveness → Lower Emissions */}
        <section className="bg-primary/5 py-20 mb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  Efficiency drives lower emissions
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Environmental benefits are a direct consequence of optimization — not a separate initiative.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Visual Comparison */}
                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="font-semibold text-foreground mb-6">Truck utilization impact</h3>
                  
                  <div className="space-y-6">
                    {/* Current State */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Current average utilization</span>
                        <span className="font-medium text-foreground">~70%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>

                    {/* Improved State */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">With +10% utilization</span>
                        <span className="font-medium text-primary">~80%</span>
                      </div>
                      <div className="h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estimated CO₂ reduction</p>
                        <p className="font-semibold text-foreground">5–10% per shipment</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Better load factors</h4>
                      <p className="text-muted-foreground text-sm">
                        When trucks run closer to capacity, fewer empty kilometers are traveled per unit shipped.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">No additional vehicles</h4>
                      <p className="text-muted-foreground text-sm">
                        FreightShare fills capacity on trucks already running. We don't add new vehicles to the road.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2 h-fit rounded-lg bg-primary/10 shrink-0">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Lower emissions per unit</h4>
                      <p className="text-muted-foreground text-sm">
                        Increasing average truck utilization by just 10% reduces CO₂ emissions per unit shipped proportionally.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Value for SMEs and Carriers */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Value for both sides
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                FreightShare creates opportunities for SME shippers and carriers equally.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* SMEs Column */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground">For SME Shippers</h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Access national and international markets</p>
                      <p className="text-sm text-muted-foreground">Ship to destinations across Europe without needing full truckloads</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Ship smaller volumes competitively</p>
                      <p className="text-sm text-muted-foreground">Pallet-level shipping at rates previously reserved for large shippers</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Predictable pricing and visibility</p>
                      <p className="text-sm text-muted-foreground">See prices upfront. Track shipments. No hidden fees.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Carriers Column */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Truck className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground">For Carriers</h3>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Monetize unused capacity</p>
                      <p className="text-sm text-muted-foreground">Turn empty pallet positions into revenue on routes you're already running</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Improve route profitability</p>
                      <p className="text-sm text-muted-foreground">Increase revenue per trip without adding operational complexity</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Access SME demand directly</p>
                      <p className="text-sm text-muted-foreground">Connect with shippers who need your routes — no intermediary required</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Downstream Effects */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/30 border border-border rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-4">
                Downstream effects
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                More efficient logistics lowers distribution costs. Improved market access increases product availability. More resilient supply chains benefit end consumers indirectly.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: CTA */}
        <section className="container mx-auto px-4 mb-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-secondary rounded-2xl p-10 md:p-14 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary-foreground mb-4">
                Start shipping competitively across Europe
              </h2>
              <p className="text-secondary-foreground/70 mb-8 max-w-xl mx-auto">
                Join the platform that connects SME shippers with carriers directly. No intermediaries, no hidden fees.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="default" asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/auth?mode=signup&role=shipper" className="gap-2">
                    Post a Load
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
                  <Link to="/auth?mode=signup&role=carrier" className="gap-2">
                    Post a Route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: Sources */}
        <section className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="border-t border-border pt-8">
              <h4 className="text-sm font-medium text-muted-foreground mb-4">Sources</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground/70">
                <p>• European Commission (transport & emissions data)</p>
                <p>• International Road Transport Union (IRU)</p>
                <p>• EU SME logistics market studies</p>
                <p>• Industry freight forwarding reports</p>
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
