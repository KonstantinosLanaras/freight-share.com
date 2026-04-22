import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, Mail } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name').max(100),
  companyName: z.string().trim().min(1, 'Please enter your company name').max(100),
  role: z.enum(['carrier', 'shipper'], { required_error: 'Please select a role' }),
  email: z.string().trim().email('Please enter a valid email').max(255),
  challenge: z.string().trim().max(500).optional(),
});

export const EarlyAccess = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    role: '' as 'carrier' | 'shipper' | '',
    email: '',
    challenge: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Please review the form');
      return;
    }
    // Demo: log locally, no backend call
    setSubmitted(true);
  };

  return (
    <section id="early-access" className="py-20 bg-background scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
              <Mail className="h-4 w-4" />
              Early Access
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Get Early Access
            </h2>
            <p className="text-lg text-muted-foreground">
              FreightShare is launching soon. Join the list and we will be in touch personally before launch.
            </p>
          </div>

          {submitted ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                You are on the list.
              </h3>
              <p className="text-muted-foreground">
                Expect a personal message from the FreightShare team shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ea-name">Full Name</Label>
                  <Input
                    id="ea-name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    maxLength={100}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ea-company">Company Name</Label>
                  <Input
                    id="ea-company"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    maxLength={100}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>I am a</Label>
                <RadioGroup
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as 'carrier' | 'shipper' })}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="carrier" id="ea-carrier" />
                    <Label htmlFor="ea-carrier" className="font-normal cursor-pointer">Carrier</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="shipper" id="ea-shipper" />
                    <Label htmlFor="ea-shipper" className="font-normal cursor-pointer">Shipper</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="ea-email">Email Address</Label>
                <Input
                  id="ea-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ea-challenge">
                  What is your biggest freight challenge right now?{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="ea-challenge"
                  value={form.challenge}
                  onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button type="submit" variant="accent" size="lg" className="w-full">
                Request Early Access
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
