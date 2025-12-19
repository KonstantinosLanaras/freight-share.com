import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2024
              </p>

              <Card>
                <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-0">
                    1. Introduction
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare B.V. ("FreightShare", "we", "us", "our") is committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                    you use our platform.
                  </p>
                  <p className="text-muted-foreground">
                    We comply with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    2. Data Controller
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare B.V. is the data controller for your personal data. You can contact us at:<br />
                    Email: privacy@freightshare.eu<br />
                    Address: 123 Logistics Ave, Rotterdam, Netherlands
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    3. Information We Collect
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-foreground">3.1 Information You Provide</h3>
                  <ul className="text-muted-foreground">
                    <li><strong>Account Information:</strong> Name, email address, phone number, company name, country</li>
                    <li><strong>Business Details:</strong> VAT number, business registration, legal company name, billing address</li>
                    <li><strong>Verification Documents:</strong> Transport licenses, insurance certificates, vehicle registrations (for carriers)</li>
                    <li><strong>Transaction Data:</strong> Load details, route information, pricing, payment information</li>
                    <li><strong>Communications:</strong> Messages between users, support requests</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-foreground">3.2 Information Collected Automatically</h3>
                  <ul className="text-muted-foreground">
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                    <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                    <li><strong>Cookies:</strong> Essential cookies for functionality and analytics cookies for improvement</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    4. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground">We use your information to:</p>
                  <ul className="text-muted-foreground">
                    <li>Provide and maintain our platform services</li>
                    <li>Process transactions and send related information</li>
                    <li>Verify user identities and business credentials</li>
                    <li>Facilitate communication between shippers and carriers</li>
                    <li>Provide customer support and resolve disputes</li>
                    <li>Send important notices about your account and transactions</li>
                    <li>Improve our platform and develop new features</li>
                    <li>Comply with legal obligations</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    5. Legal Basis for Processing
                  </h2>
                  <p className="text-muted-foreground">We process your data based on:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Contract Performance:</strong> To provide our services to you</li>
                    <li><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</li>
                    <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
                    <li><strong>Consent:</strong> For optional communications and certain cookies</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    6. Information Sharing
                  </h2>
                  <p className="text-muted-foreground">We may share your information with:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Other Users:</strong> Necessary details to complete transactions (e.g., carrier name to shipper)</li>
                    <li><strong>Service Providers:</strong> Payment processors, cloud hosting, analytics providers</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We do not sell your personal data to third parties.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    7. Data Retention
                  </h2>
                  <p className="text-muted-foreground">
                    We retain your personal data for as long as necessary to provide our services and comply with 
                    legal obligations. Account data is retained for the duration of your account plus 7 years for 
                    legal and tax purposes. Transaction records are retained for 10 years.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    8. Your Rights (GDPR)
                  </h2>
                  <p className="text-muted-foreground">Under GDPR, you have the right to:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                    <li><strong>Restriction:</strong> Limit how we process your data</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Object:</strong> Object to certain processing activities</li>
                    <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
                  </ul>
                  <p className="text-muted-foreground">
                    To exercise these rights, contact us at privacy@freightshare.eu.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    9. Data Security
                  </h2>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your data, including:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure payment processing through certified providers</li>
                    <li>Access controls and authentication</li>
                    <li>Regular security assessments</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    10. International Transfers
                  </h2>
                  <p className="text-muted-foreground">
                    Your data is primarily processed within the European Economic Area (EEA). If data is transferred 
                    outside the EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    11. Cookies
                  </h2>
                  <p className="text-muted-foreground">
                    We use essential cookies for platform functionality and optional analytics cookies to improve 
                    our services. You can manage cookie preferences through your browser settings.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    12. Changes to This Policy
                  </h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of significant changes 
                    via email or platform notification.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    13. Supervisory Authority
                  </h2>
                  <p className="text-muted-foreground">
                    You have the right to lodge a complaint with the Dutch Data Protection Authority 
                    (Autoriteit Persoonsgegevens) or your local supervisory authority.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground">
                    14. Contact Us
                  </h2>
                  <p className="text-muted-foreground">
                    For privacy-related inquiries:<br />
                    Email: privacy@freightshare.eu<br />
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
