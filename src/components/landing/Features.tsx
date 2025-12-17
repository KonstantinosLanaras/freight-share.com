import { Route, Truck, CreditCard, MessageSquare, Star, FileText } from 'lucide-react';

const features = [
  {
    icon: Route,
    title: 'Direct Matching',
    description: 'Our algorithm connects your loads with carriers already traveling your route.',
  },
  {
    icon: Truck,
    title: 'Post Routes & Loads',
    description: 'Carriers post routes with capacity, shippers post loads with requirements.',
  },
  {
    icon: CreditCard,
    title: 'Escrow Payments',
    description: 'Payment held securely until delivery is confirmed by both parties.',
  },
  {
    icon: MessageSquare,
    title: 'In-App Messaging',
    description: 'Communicate directly with your shipper or carrier through the platform.',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews',
    description: 'Build your reputation and choose partners based on real feedback.',
  },
  {
    icon: FileText,
    title: 'Digital Contracts',
    description: 'Automatic agreement generation when payment is confirmed.',
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Built for{' '}
            <span className="text-primary">Direct Connections</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to find the right match and complete transactions smoothly.
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
