import { Shield, Truck, CreditCard, MessageSquare, Star, Clock } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Full payment held in escrow until delivery confirmation. Your money is protected.',
  },
  {
    icon: Truck,
    title: 'Smart Matching',
    description: 'Our algorithm matches your loads with available routes for optimal efficiency.',
  },
  {
    icon: CreditCard,
    title: 'Instant Contracts',
    description: 'Digital agreements generated automatically when payment is confirmed.',
  },
  {
    icon: MessageSquare,
    title: 'In-App Chat',
    description: 'Communicate directly with shippers or carriers through our secure messaging.',
  },
  {
    icon: Star,
    title: 'Verified Ratings',
    description: 'Make informed decisions with our transparent review system.',
  },
  {
    icon: Clock,
    title: 'Real-Time Tracking',
    description: 'Follow your shipment through every stage from pickup to delivery.',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Everything You Need for{' '}
            <span className="text-primary">Secure Shipping</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            FreightShare handles the complexity so you can focus on your business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
