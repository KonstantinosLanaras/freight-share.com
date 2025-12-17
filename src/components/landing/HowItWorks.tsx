import { Package, Search, CreditCard, Truck, CheckCircle, Route } from 'lucide-react';

const shipperSteps = [
  { icon: Package, title: 'Post Your Load', description: 'Enter route, dates, pallets, and set your price or accept offers.' },
  { icon: Search, title: 'Get Matched', description: 'Carriers on matching routes see your load and make offers.' },
  { icon: CreditCard, title: 'Pay to Confirm', description: 'Your payment is held in escrow until delivery.' },
  { icon: CheckCircle, title: 'Confirm & Release', description: 'Confirm delivery and payment goes to the carrier.' },
];

const carrierSteps = [
  { icon: Truck, title: 'Post Your Route', description: 'Share your upcoming journey and available pallet space.' },
  { icon: Route, title: 'Get Load Matches', description: 'See loads that fit your route automatically.' },
  { icon: Package, title: 'Make an Offer', description: 'Set your price and win the job.' },
  { icon: CreditCard, title: 'Deliver & Get Paid', description: 'Complete delivery and receive your payment.' },
];

export const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple process, direct connections, secure transactions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Shipper Flow */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-shipper/10 rounded-full text-shipper text-sm font-medium mb-6">
              <Package className="h-4 w-4" />
              For Shippers
            </div>
            <div className="space-y-6">
              {shipperSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-shipper/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-shipper" />
                    </div>
                    {index < shipperSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carrier Flow */}
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-carrier/10 rounded-full text-carrier text-sm font-medium mb-6">
              <Truck className="h-4 w-4" />
              For Carriers
            </div>
            <div className="space-y-6">
              {carrierSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-carrier/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-carrier" />
                    </div>
                    {index < carrierSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
