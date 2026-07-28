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
                  Small and medium enterprises account for <strong className="text-foreground">99.8%</strong> of non-financial businesses in the European Union and form the backbone of the European economy (
                  <a href="https://publications.jrc.ec.europa.eu/repository/handle/JRC138678" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">European Commission, Annual Report on European SMEs 2023/2024</a>
                  ). The COVID-19 pandemic exposed the vulnerability of this segment: across the surveys tracked in the OECD's COVID-19 SME policy monitoring, many affected firms reported revenue declines in the region of <strong className="text-foreground">30–50%</strong> during peak disruption (
                  <a href="https://www.oecd.org/content/dam/oecd/en/publications/reports/2021/04/one-year-of-sme-and-entrepreneurship-policy-responses-to-covid-19-lessons-learned-to-build-back-better_ea2f606a/9a230220-en.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OECD, One Year of SME and Entrepreneurship Policy Responses to COVID-19, 2021</a>
                  ). These shocks reduced the ability of SMEs to compete, invest, and access markets on equal terms.
                </p>
                <p>
                  At the same time, households across the Eurozone experienced rising living costs, with food and energy prices a significant driver of headline inflation in several member states between 2021 and 2023 (
                  <a href="https://ec.europa.eu/eurostat/web/hicp" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Eurostat, Harmonised Index of Consumer Prices</a>
                  ). These pressures were felt most acutely by lower-income households, which allocate a larger share of spending to essentials. Improving competition and reducing structural inefficiencies in supply chains are among the mechanisms that can help support price discipline and economic resilience, without guaranteeing specific outcomes.
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
                  European road freight is highly fragmented. <strong className="text-foreground">80%</strong> of EU road haulage firms employ fewer than ten people (
                  <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex:52014DC0222" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">European Commission, Report on the State of the EU Road Haulage Market, 2014</a>
                  ), resulting in a dispersed supply base with limited visibility into available capacity. This fragmentation makes it difficult for smaller shippers to identify suitable carriers and benchmark prices effectively.
                </p>
                <p>
                  Around <strong className="text-foreground">21%</strong> of road freight kilometres in the EU are driven empty (
                  <a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Road_freight_transport_by_journey_characteristics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Eurostat, Road freight transport by journey characteristics, 2024 data</a>
                  ). This represents a structural mismatch between available capacity and demand, increasing costs per shipment and leading to unnecessary fuel consumption.
                </p>
                <p>
                  Pricing in road freight also remains largely opaque, with rates typically negotiated bilaterally rather than benchmarked against a visible market rate. Because smaller shippers have less bargaining power and no direct access to spot capacity, they typically rely on intermediaries to source transport — intermediaries who add a margin without adding transport capacity. This structural disadvantage, rather than a single precise cost figure, is the mechanism that direct, visible-pricing matching is designed to reduce.
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
                  Heavy-duty trucks account for approximately <strong className="text-foreground">6%</strong> of total EU greenhouse gas emissions and just over <strong className="text-foreground">27%</strong> of road transport emissions specifically (
                  <a href="https://www.eea.europa.eu/publications/co2-emissions-of-new-heavy/reducing-greenhouse-gas-emissions-from" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">European Environment Agency, Reducing Greenhouse Gas Emissions from Heavy-Duty Vehicles in Europe</a>
                  ). Efficiency gains in this sector therefore have direct environmental relevance.
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
