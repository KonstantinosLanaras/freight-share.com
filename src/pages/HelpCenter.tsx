import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Truck,
  Package,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const helpCategories = [
  {
    id: 'shipment',
    title: 'Shipment Issues',
    description: 'Problems with pickup, delivery, or tracking',
    icon: Truck,
  },
  {
    id: 'payment',
    title: 'Payment & Billing',
    description: 'Payment disputes, refunds, or invoice issues',
    icon: CreditCard,
  },
  {
    id: 'dispute',
    title: 'Disputes & Conflicts',
    description: 'Issues between shipper and carrier',
    icon: AlertTriangle,
  },
  {
    id: 'verification',
    title: 'Verification Help',
    description: 'Account verification and document issues',
    icon: ShieldCheck,
  },
  {
    id: 'load',
    title: 'Load & Route Issues',
    description: 'Problems with posted loads or routes',
    icon: Package,
  },
  {
    id: 'other',
    title: 'Other',
    description: 'General questions and feedback',
    icon: HelpCircle,
  },
];

const faqs = [
  {
    question: 'How does payment protection work?',
    answer: 'FreightShare holds all payments securely until delivery is confirmed. Once the shipper confirms delivery, payment is released to the carrier. This protects both parties.',
  },
  {
    question: 'What happens if my shipment is damaged?',
    answer: 'Report the damage immediately through the Resolution Center. Document with photos and contact both the carrier and FreightShare support. We act as a trusted third party to help resolve disputes.',
  },
  {
    question: 'How do I get verified as a carrier?',
    answer: 'Go to your Carrier Dashboard and click "Get Verified". Submit your business documents (insurance, transport license, or vehicle registration) for review. Verification typically takes 1-2 business days.',
  },
  {
    question: 'Can I cancel a shipment?',
    answer: 'Cancellation policies depend on the shipment status. Before pickup, cancellations are usually allowed with full refund. Contact support immediately if you need to cancel.',
  },
];

export default function HelpCenter() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    shipmentId: '',
    subject: '',
    description: '',
  });

  // Pre-populate shipment ID from URL params
  useEffect(() => {
    const shipmentId = searchParams.get('shipment');
    if (shipmentId) {
      setSelectedCategory('shipment');
      setFormData(prev => ({ ...prev, category: 'shipment', shipmentId }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Your request has been submitted. Our team will respond within 24 hours.');
    setFormData({ category: '', shipmentId: '', subject: '', description: '' });
    setSelectedCategory(null);
    setIsSubmitting(false);
  };

  // Determine back link based on user role
  const getBackLink = () => {
    if (!user) return '/';
    return role === 'carrier' ? '/dashboard/carrier' : '/dashboard/shipper';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={getBackLink()}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                Help & Resolution Center
              </h1>
              <p className="text-sm text-muted-foreground">FreightShare is here to help resolve any issues</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Trust Banner */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  FreightShare: Your Trusted Third Party
                </h2>
                <p className="text-muted-foreground">
                  We act as a neutral intermediary between shippers and carriers. All payments are secured through our platform, and we're here to help resolve any disputes fairly and quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">How can we help you?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {helpCategories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setFormData({ ...formData, category: category.id });
                      }}
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Contact Form */}
            {selectedCategory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Submit a Request
                  </CardTitle>
                  <CardDescription>
                    Tell us about your issue and we'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {(selectedCategory === 'shipment' || selectedCategory === 'payment' || selectedCategory === 'dispute') && (
                      <div>
                        <Label htmlFor="shipmentId">Shipment Reference (if applicable)</Label>
                        <Input
                          id="shipmentId"
                          placeholder="e.g., SHP-12345"
                          className="mt-1"
                          value={formData.shipmentId}
                          onChange={(e) => setFormData({ ...formData, shipmentId: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        className="mt-1"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide as much detail as possible..."
                        className="mt-1 min-h-[150px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedCategory(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Request
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - FAQs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                    <h4 className="font-medium text-foreground mb-1">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Urgent Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  For time-sensitive issues related to active shipments or payments, our support team is available:
                </p>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Monday - Friday</p>
                  <p className="text-muted-foreground">9:00 AM - 6:00 PM CET</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Email: <span className="text-foreground">support@freightshare.eu</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
