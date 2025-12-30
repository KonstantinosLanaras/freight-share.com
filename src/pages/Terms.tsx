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
              <p className="text-sm text-muted-foreground mb-2">FreightShare B.V.</p>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
                Terms of Service
              </h1>

              <Card>
                <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-0">
                    1. Agreement to Terms
                  </h2>
                  <p className="text-muted-foreground">
                    By accessing or using the FreightShare platform (the "Platform"), you agree to be bound by these 
                    Terms of Service (the "Terms"). If you do not agree to these Terms, you may not access or use the Platform.
                  </p>
                  <p className="text-muted-foreground">
                    The Platform is intended exclusively for business users acting in the course of their trade or profession.
                  </p>
                  <p className="text-muted-foreground">
                    FreightShare operates a digital marketplace connecting shippers with carriers. FreightShare facilitates 
                    interactions and provides technical tools but is not a party to transport, logistics, or carriage 
                    agreements entered into between users.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    2. User Roles and Responsibilities
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-foreground">2.1 Shippers</h3>
                  <p className="text-muted-foreground">As a shipper, you agree to:</p>
                  <ul className="text-muted-foreground">
                    <li>Provide accurate and complete information about shipments</li>
                    <li>Ensure goods are properly packaged and ready for collection</li>
                    <li>Pay for services through the Platform's payment flow</li>
                    <li>Confirm delivery in a timely manner where required</li>
                    <li>Comply with all applicable laws and regulations relating to the goods shipped</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Shippers remain solely responsible for the legality, classification, and documentation of goods.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">2.2 Carriers</h3>
                  <p className="text-muted-foreground">As a carrier, you agree to:</p>
                  <ul className="text-muted-foreground">
                    <li>Complete business verification prior to accepting paid shipments</li>
                    <li>Maintain valid licenses, insurance, and vehicle registrations</li>
                    <li>Provide accurate route, capacity, and availability information</li>
                    <li>Handle goods with due care and professional diligence</li>
                    <li>Complete deliveries within agreed timeframes</li>
                    <li>Maintain appropriate insurance coverage at all times</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Carriers remain solely responsible for compliance with applicable transport, safety, and regulatory requirements.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    3. Payment Terms
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-foreground">3.1 Platform Payment Model</h3>
                  <p className="text-muted-foreground">
                    FreightShare provides technical tools that enable conditional payment execution via a licensed 
                    third-party payment service provider.
                  </p>
                  <p className="text-muted-foreground">FreightShare:</p>
                  <ul className="text-muted-foreground">
                    <li>does not process, store, safeguard, or control user funds</li>
                    <li>does not have access to payment credentials</li>
                    <li>is not a bank, payment institution, escrow agent, or guarantor</li>
                  </ul>
                  <p className="text-muted-foreground">Payment mechanics:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Payment authorisation:</strong> when a shipper accepts an offer, payment is authorised but not captured</li>
                    <li><strong>Conditional execution:</strong> payment is executed by the payment service provider upon confirmation of agreed trigger conditions</li>
                    <li><strong>Direct transfer:</strong> funds transfer directly from shipper to carrier</li>
                    <li><strong>Platform fee:</strong> a transparent service fee is deducted at execution and disclosed prior to booking</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold text-foreground">3.2 Delivery Confirmation Triggers</h3>
                  <p className="text-muted-foreground">
                    Payment execution is triggered by one of the following predefined conditions:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Digital delivery confirmation by the shipper via the Platform</li>
                    <li>Upload of a signed CMR or eCMR</li>
                    <li>Automatic confirmation if no dispute is raised within 48 hours of carrier-marked delivery</li>
                  </ul>
                  <p className="text-muted-foreground">
                    FreightShare verifies only whether the agreed trigger condition occurred. FreightShare does not 
                    verify the physical condition, completeness, or quality of goods, nor the legal validity of 
                    uploaded documents, and relies on user representations.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-foreground">3.3 Platform Role Clarification</h3>
                  <p className="text-muted-foreground">
                    FreightShare operates as a technical facilitator of conditional payment execution. FreightShare 
                    does not guarantee delivery, payment, cargo condition, or regulatory compliance.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    4. Dispute Resolution
                  </h2>
                  <ul className="text-muted-foreground">
                    <li>Disputes must be raised within 48 hours of carrier-marked delivery</li>
                    <li>If a dispute is raised, payment execution is paused</li>
                    <li>Both parties may be required to provide documentation</li>
                  </ul>
                  <p className="text-muted-foreground">
                    FreightShare determines only whether payment trigger conditions were met. Such determinations 
                    apply solely for payment execution on the Platform and do not limit either party's right to 
                    pursue independent legal remedies.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    5. Liability Boundaries
                  </h2>
                  <p className="text-muted-foreground">FreightShare:</p>
                  <ul className="text-muted-foreground">
                    <li>is not responsible for actions or omissions of users</li>
                    <li>does not guarantee legality, condition, or safety of goods</li>
                    <li>is not liable for delay, loss, or damage during transport</li>
                  </ul>
                  <p className="text-muted-foreground">To the maximum extent permitted by law:</p>
                  <ul className="text-muted-foreground">
                    <li>FreightShare excludes liability for indirect, incidental, or consequential damages</li>
                    <li>FreightShare's total liability is limited to fees paid to FreightShare in the preceding 12 months</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    6. Prohibited Activities
                  </h2>
                  <p className="text-muted-foreground">Users may not:</p>
                  <ul className="text-muted-foreground">
                    <li>Ship illegal or prohibited goods</li>
                    <li>Provide false or misleading information</li>
                    <li>Circumvent Platform payments or fees</li>
                    <li>Harass, threaten, or defraud other users</li>
                    <li>Scrape, reverse engineer, or automate access to the Platform</li>
                    <li>Use the Platform for unlawful purposes</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    7. Account Termination
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare may suspend or terminate accounts at its sole discretion for violations of these Terms. 
                    Users may close accounts subject to completion of pending transactions.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    8. Modifications to Terms
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare may update these Terms. Material changes will be notified. Continued use constitutes acceptance.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    9. Governing Law and Jurisdiction
                  </h2>
                  <p className="text-muted-foreground">
                    These Terms are governed by the laws of the Netherlands. Exclusive jurisdiction lies with the 
                    courts of Rotterdam, Netherlands.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    10. Contact
                  </h2>
                  <p className="text-muted-foreground">
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
