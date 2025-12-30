import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

const Impact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <header className="container mx-auto px-4 mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Impact & Responsibility
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed italic">
              FreightShare is inspired by the belief that improving access to European markets for SMEs strengthens competition and contributes to fairer prices for households.
            </p>
          </div>
        </header>

        {/* Article Content */}
        <article className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">

            {/* Section 1: Economic Context */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                Economic Context: Why Competition Matters
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Small and medium enterprises account for over <strong className="text-foreground">99%</strong> of non-financial businesses in the European Union and form the backbone of the European economy. The COVID-19 pandemic and its aftermath exposed the vulnerability of this segment: many small and self-employed businesses were forced to close, while surviving firms often faced revenue declines of <strong className="text-foreground">20–40%</strong> during peak disruption. These shocks reduced the ability of SMEs to compete, invest, and access markets on equal terms.
                </p>
                <p>
                  At the same time, households across the Eurozone experienced rising living costs. Prices for food and essential goods increased by <strong className="text-foreground">20–30%</strong> in parts of Europe between 2019 and 2023, while real household purchasing power declined in several member states as inflation outpaced income growth. These pressures were felt most acutely by lower-income households, which allocate a larger share of spending to essentials. Improving competition and reducing structural inefficiencies in supply chains are among the mechanisms that can help support price discipline and economic resilience, without guaranteeing specific outcomes.
                </p>
                <p className="text-sm italic">
                  Sources: European Commission, Eurostat, European Central Bank, Financial Times
                </p>
              </div>
            </section>

            {/* Section 2: The Market Problem */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                The Market Problem
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  European road freight is highly fragmented. Over <strong className="text-foreground">90%</strong> of road haulage firms in the EU operate fewer than ten vehicles, resulting in a dispersed supply base with limited visibility into available capacity. This fragmentation makes it difficult for smaller shippers to identify suitable carriers and benchmark prices effectively.
                </p>
                <p>
                  Industry estimates suggest that <strong className="text-foreground">20–30%</strong> of truck-kilometres in Europe are driven empty or with partial loads. This represents a structural mismatch between available capacity and demand, increasing costs per shipment and leading to unnecessary fuel consumption.
                </p>
                <p>
                  Small and medium enterprises typically pay <strong className="text-foreground">15–30%</strong> more for equivalent logistics services than larger shippers. This premium reflects reduced bargaining power, limited access to spot capacity, and reliance on intermediaries to source transport. Pricing in road freight remains largely opaque, with rates often negotiated bilaterally. Intermediary margins of <strong className="text-foreground">10–25%</strong> are common in brokered transactions, adding cost without adding transport capacity.
                </p>
              </div>
            </section>

            {/* Section 3: Design Choices */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                Design Choices
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  The platform's architecture reflects a set of deliberate structural decisions intended to address these inefficiencies. These are not features in the marketing sense, but mechanisms that shape how transactions occur.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">Direct matching</p>
                    <p>Shippers and carriers transact directly, without an intermediary layer capturing margin between the parties. This reduces transaction costs and improves price visibility.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">Visible pricing</p>
                    <p>Pricing is disclosed before commitment. Shippers can compare offers, and carriers compete on price and reliability rather than access to closed networks.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">Pallet-level granularity</p>
                    <p>Shipments can be posted at pallet level rather than full truckloads only. This allows carriers to consolidate partial loads and enables SMEs with smaller volumes to access professional logistics services.</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-foreground">Route-based matching</p>
                    <p>Carriers can publish planned routes and receive matching load requests. This prioritises filling existing capacity over creating additional trips.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: What Changes in Practice */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                What Changes in Practice
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">For SMEs and carriers</p>
                <p>
                  By enabling direct access to a pool of verified carriers, the platform reduces the structural disadvantage faced by SMEs. Smaller shippers can access the same market as larger players without requiring dedicated logistics staff, long-standing broker relationships, or volume commitments.
                </p>
                <p>
                  Greater price visibility benefits both sides. Shippers can see and compare multiple offers, while carriers compete based on observable pricing and service quality rather than exclusivity. This improves pricing transparency and makes prices easier to compare across participants.
                </p>
                <p>
                  Disintermediation also means that a larger share of transaction value remains with shippers and carriers. This is particularly relevant for independent carriers, who often depend on brokers for load access and accept lower net rates as a result.
                </p>
              </div>
            </section>

            {/* Section 5: Environmental Benefits */}
            <section className="mb-14">
              <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-2">
                Environmental Benefits
              </h2>
              <div className="h-px bg-border mb-6" />
              
              <div className="space-y-5 text-muted-foreground leading-relaxed">
                <p>
                  Road freight accounts for approximately <strong className="text-foreground">6%</strong> of total EU greenhouse gas emissions and around <strong className="text-foreground">27%</strong> of transport-related CO₂ emissions. Efficiency gains in this sector therefore have direct environmental relevance.
                </p>
                <p>
                  Matching loads to existing routes improves vehicle utilisation. Higher load factors mean fewer vehicle-kilometres are required to move the same volume of goods. Route-based matching also reduces empty running by enabling carriers to identify backhaul opportunities after deliveries.
                </p>
                <p>
                  These efficiency gains translate into lower emissions per tonne-kilometre. Importantly, this effect is achieved through better use of existing vehicles and routes, rather than by adding transport capacity. Environmental benefits arise as a consequence of operational efficiency, not as a separate sustainability initiative.
                </p>
              </div>
            </section>

            {/* Subtle text link footer */}
            <footer className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Learn more about how the platform works:{' '}
                <Link to="/how-it-works" className="text-primary hover:underline">
                  How It Works
                </Link>
              </p>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default Impact;
