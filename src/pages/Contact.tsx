import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  Loader2,
  MessageSquare,
  Building,
  Scale,
  User,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const supportContact = {
  name: 'Support Team',
  company: 'FreightShare',
  email: 'contact@freight-share.com',
  phone: '+39 348 056 7378',
  referenceId: 'SUP-2024',
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    department: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Your message has been sent. We\'ll get back to you within 1-2 business days.');
    setFormData({ name: '', email: '', subject: '', department: '', message: '' });
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const ContactWidget = () => (
    <Card className="sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Quick Contact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">{supportContact.name}</div>
            <div className="text-sm text-muted-foreground">{supportContact.company}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground text-xs">{supportContact.email}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyToClipboard(supportContact.email, 'Email')}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{supportContact.phone}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyToClipboard(supportContact.phone, 'Phone')}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground mb-1">Reference ID</div>
          <code className="text-sm font-mono text-foreground">{supportContact.referenceId}</code>
        </div>
        <div className="pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Mon-Fri: 9:00 - 18:00 CET
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6">Contact Us</h1>
              <p className="text-xl text-muted-foreground">Have questions or need assistance? We're here to help.</p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><MessageSquare className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">General Support</h3>
                        <a href="mailto:contact@freight-share.com" className="text-primary hover:underline text-sm">contact@freight-share.com</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Building className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Business Inquiries</h3>
                        <a href="mailto:contact@freight-share.com" className="text-primary hover:underline text-sm">contact@freight-share.com</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Scale className="h-6 w-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Legal & Disputes</h3>
                        <a href="mailto:contact@freight-share.com" className="text-primary hover:underline text-sm">contact@freight-share.com</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Reach us</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-primary" /><a href="tel:+393480567378" className="text-muted-foreground hover:text-foreground">+39 348 056 7378</a></div>
                      <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary" /><span className="text-muted-foreground">Mon-Fri: 9:00 - 18:00 CET</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll respond within 1-2 business days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="name">Your Name</Label><Input id="name" placeholder="John Doe" className="mt-1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                        <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="john@company.com" className="mt-1" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="department">Department</Label><Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}><SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value="support">General Support</SelectItem><SelectItem value="business">Business Inquiries</SelectItem><SelectItem value="legal">Legal & Disputes</SelectItem><SelectItem value="technical">Technical Support</SelectItem></SelectContent></Select></div>
                        <div><Label htmlFor="subject">Subject</Label><Input id="subject" placeholder="Brief subject" className="mt-1" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required /></div>
                      </div>
                      <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="Please describe your question..." className="mt-1 min-h-[180px]" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required /></div>
                      <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <><Send className="h-4 w-4" />Send Message</>}</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="hidden lg:block"><ContactWidget /></div>
            </div>
          </div>
        </section>

        <Sheet open={mobileContactOpen} onOpenChange={setMobileContactOpen}>
          <SheetTrigger asChild>
            <Button className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40 lg:hidden" size="icon"><User className="h-6 w-6" /></Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader><SheetTitle>Quick Contact</SheetTitle></SheetHeader>
            <div className="mt-4"><ContactWidget /></div>
          </SheetContent>
        </Sheet>
      </main>
      <Footer />
    </div>
  );
}
