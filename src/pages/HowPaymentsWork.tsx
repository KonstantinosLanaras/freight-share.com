import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  CheckCircle, 
  Shield, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  FileCheck,
  Users,
  Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HowPaymentsWork() {
  const paymentSteps = [
    {
      icon: Users,
      title: "Offer Accepted",
      description: "When a shipper accepts a carrier's offer, payment is authorised but not captured. Funds remain with the shipper via our payment partner.",
      status: "Authorised"
    },
    {
      icon: CreditCard,
      title: "Delivery In Progress",
      description: "The carrier completes the delivery and marks it as delivered in the platform. The shipment moves to 'In Process' status.",
      status: "In Process"
    },
    {
      icon: CheckCircle,
      title: "Delivery Confirmed",
      description: "Payment is executed when delivery is confirmed through one of the approved triggers. Funds transfer directly from shipper to carrier.",
      status: "Executed"
    }
  ];

  const confirmationTriggers = [
    {
      icon: CheckCircle,
      title: "Shipper Confirms Delivery",
      description: "The shipper explicitly confirms delivery via the platform"
    },
    {
      icon: FileCheck,
      title: "CMR/eCMR Uploaded",
      description: "A signed CMR or electronic CMR is uploaded as proof of delivery"
    },
    {
      icon: Clock,
      title: "Automatic Confirmation",
      description: "If no dispute is raised within 48 hours of carrier-marked delivery"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
                How Payments Work
              </h1>
              <p className="text-lg text-muted-foreground">
                FreightShare facilitates conditional payment execution between shippers and carriers. 
                Here's how the process works, simply and transparently.
              </p>
            </div>
          </div>
        </section>

        {/* Payment Flow */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
                Payment Flow
              </h2>
              
              <div className="space-y-6">
                {paymentSteps.map((step, index) => (
                  <Card key={step.title} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <step.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {index + 1}. {step.title}
                            </h3>
                            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                              {step.status}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      {index < paymentSteps.length - 1 && (
                        <div className="absolute left-[2.25rem] top-[4.5rem] h-6 w-0.5 bg-border" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Confirmation Triggers */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4 text-center">
                Delivery Confirmation Triggers
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Payment is executed when any one of the following conditions is met:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {confirmationTriggers.map((trigger) => (
                  <Card key={trigger.title}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <trigger.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{trigger.title}</h3>
                      <p className="text-sm text-muted-foreground">{trigger.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Fee */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-primary/20">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                        Platform Fee
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        FreightShare charges a <strong>2% platform fee</strong> on executed payments. 
                        This fee is automatically deducted at the time of payment execution and is 
                        always disclosed before you confirm a booking.
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">
                          <strong>Example:</strong> For a €1,000 shipment, the carrier receives €980 
                          and the platform fee is €20.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Disputes */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    Dispute Resolution
                  </h2>
                  <p className="text-muted-foreground">
                    If there's an issue with your delivery, you can raise a dispute within <strong>48 hours</strong> of 
                    carrier-marked delivery.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">When a Dispute is Raised</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        Payment execution is paused
                      </li>
                      <li className="flex items-start gap-2">
                        <FileCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        Both parties may be asked for documentation
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        Shipment remains in 'In Process' status
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Platform's Role in Disputes</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        We verify if payment trigger conditions were met
                      </li>
                      <li className="flex items-start gap-2">
                        <Ban className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        We do not assess cargo condition or damage
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        Complex disputes may require external resolution
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Important Clarifications */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
                Important Clarifications
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      FreightShare Does Not:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Hold or custody any funds</li>
                      <li>• Act as a bank or payment institution</li>
                      <li>• Provide escrow services</li>
                      <li>• Guarantee delivery or cargo condition</li>
                      <li>• Act as an arbitrator in disputes</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      FreightShare Does:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Facilitate conditional payment execution</li>
                      <li>• Verify that trigger conditions occurred</li>
                      <li>• Process payments via licensed payment partner</li>
                      <li>• Provide transparent fee structure</li>
                      <li>• Enable secure communication between parties</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-heading font-bold text-background mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-background/70 mb-8">
                Join FreightShare and experience transparent, conditional payments for your logistics needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/auth?mode=signup">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-background/80 text-background hover:bg-background/10" asChild>
                  <Link to="/terms">View Terms of Service</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
