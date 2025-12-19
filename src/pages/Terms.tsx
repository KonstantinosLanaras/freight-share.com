import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>

              <Card>
                <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-0">
                    1. Agreement to Terms
                  </h2>
                  <p className="text-muted-foreground">
                    By accessing or using the FreightShare platform ("Platform"), you agree to be bound by these 
                    Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Platform.
                  </p>
                  <p className="text-muted-foreground">
                    FreightShare operates as a marketplace connecting shippers with carriers. We facilitate 
                    transactions but are not a party to the transport agreements between users.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    2. User Roles and Responsibilities
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-foreground">2.1 Shippers</h3>
                  <p className="text-muted-foreground">As a Shipper, you agree to:</p>
                  <ul className="text-muted-foreground">
                    <li>Provide accurate and complete information about your loads</li>
                    <li>Ensure goods are properly packaged and ready for pickup</li>
                    <li>Pay for services through our secure payment system</li>
                    <li>Confirm delivery in a timely manner to release carrier payments</li>
                    <li>Comply with all applicable laws regarding the goods being shipped</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground">2.2 Carriers</h3>
                  <p className="text-muted-foreground">As a Carrier, you agree to:</p>
                  <ul className="text-muted-foreground">
                    <li>Complete business verification before accepting paid shipments</li>
                    <li>Maintain valid transport licenses, insurance, and vehicle registrations</li>
                    <li>Provide accurate route and capacity information</li>
                    <li>Handle goods with due care and professionalism</li>
                    <li>Complete deliveries within agreed timeframes</li>
                    <li>Maintain appropriate insurance coverage for transported goods</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    3. Payment Terms and Escrow
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare uses an escrow payment system to protect both parties:
                  </p>
                  <ul className="text-muted-foreground">
                    <li><strong>Payment Holding:</strong> When a shipper accepts an offer, payment is securely held in escrow</li>
                    <li><strong>Release Conditions:</strong> Payment is released to the carrier upon delivery confirmation by the shipper</li>
                    <li><strong>Disputes:</strong> In case of disputes, funds remain in escrow until resolution</li>
                    <li><strong>Platform Fees:</strong> FreightShare charges a service fee on completed transactions, disclosed at booking</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    4. Dispute Resolution
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare acts as a neutral third party in disputes between shippers and carriers:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Disputes must be reported through the Resolution Center within 48 hours of delivery</li>
                    <li>Both parties must provide documentation and evidence when requested</li>
                    <li>FreightShare will review disputes and make fair determinations</li>
                    <li>Our decisions on payment disputes are binding while using our platform</li>
                    <li>Users retain the right to pursue legal remedies independently</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    5. Liability Boundaries
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare provides a platform for connecting users but:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Is not responsible for the actions of shippers or carriers</li>
                    <li>Does not guarantee the condition, legality, or safety of goods transported</li>
                    <li>Is not liable for delays, damage, or loss during transport</li>
                    <li>Carriers are responsible for their own insurance and liability coverage</li>
                    <li>Maximum platform liability is limited to fees paid to FreightShare</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    6. Prohibited Activities
                  </h2>
                  <p className="text-muted-foreground">Users may not:</p>
                  <ul className="text-muted-foreground">
                    <li>Ship illegal or prohibited goods</li>
                    <li>Provide false or misleading information</li>
                    <li>Circumvent platform payments to avoid fees</li>
                    <li>Harass, threaten, or defraud other users</li>
                    <li>Create multiple accounts to manipulate the system</li>
                    <li>Use the platform for any unlawful purpose</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    7. Account Termination
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare reserves the right to suspend or terminate accounts that violate these Terms. 
                    Users may also close their accounts at any time, subject to completion of any pending transactions.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    8. Modifications to Terms
                  </h2>
                  <p className="text-muted-foreground">
                    We may modify these Terms at any time. Users will be notified of material changes and 
                    continued use of the platform constitutes acceptance of modified Terms.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    9. Governing Law
                  </h2>
                  <p className="text-muted-foreground">
                    These Terms are governed by the laws of the Netherlands. Any disputes will be subject to the 
                    exclusive jurisdiction of the courts of Rotterdam, Netherlands.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    10. Contact
                  </h2>
                  <p className="text-muted-foreground">
                    For questions about these Terms, contact us at:<br />
                    Email: legal@freightshare.eu<br />
                    Address: FreightShare B.V., 123 Logistics Ave, Rotterdam, Netherlands
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
