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
              <p className="text-sm text-muted-foreground mb-2">FreightShare B.V.</p>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-8">
                Privacy Policy
              </h1>

              <Card>
                <CardContent className="p-8 prose prose-neutral dark:prose-invert max-w-none">
                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-0">
                    1. Introduction
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare B.V. ("FreightShare") is committed to protecting personal data. This Privacy Policy 
                    explains how personal data is collected, used, and protected when using the Platform.
                  </p>
                  <p className="text-muted-foreground">
                    This Policy applies exclusively to business users. FreightShare complies with the General Data 
                    Protection Regulation (GDPR) and applicable EU data protection laws.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    2. Data Controller
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare B.V. is the data controller.
                  </p>
                  <p className="text-muted-foreground">
                    Email: privacy@freightshare.eu<br />
                    Address: 123 Logistics Ave, Rotterdam, Netherlands
                  </p>
                  <p className="text-muted-foreground">
                    FreightShare has not appointed a Data Protection Officer, as this is not required under Article 37 GDPR.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    3. Personal Data Collected
                  </h2>
                  
                  <h3 className="text-xl font-semibold text-foreground">3.1 Data Provided by Users</h3>
                  <ul className="text-muted-foreground">
                    <li><strong>Account data:</strong> name, email, phone number, company name, country</li>
                    <li><strong>Business data:</strong> VAT number, legal name, billing address</li>
                    <li><strong>Verification documents:</strong> licenses, insurance certificates (carriers)</li>
                    <li><strong>Transaction data:</strong> shipment details, routes, pricing</li>
                    <li><strong>Communications:</strong> platform messages and support requests</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Payment credentials are processed exclusively by third-party payment service providers. 
                    FreightShare does not store payment card or bank details.
                  </p>

                  <h3 className="text-xl font-semibold text-foreground">3.2 Data Collected Automatically</h3>
                  <ul className="text-muted-foreground">
                    <li><strong>Usage data:</strong> pages visited, features used</li>
                    <li><strong>Device data:</strong> IP address, browser, operating system</li>
                    <li><strong>Cookies:</strong> essential cookies and optional analytics cookies (with consent)</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    4. Purposes of Processing
                  </h2>
                  <p className="text-muted-foreground">Personal data is processed to:</p>
                  <ul className="text-muted-foreground">
                    <li>Provide and operate the Platform</li>
                    <li>Facilitate transactions and communications</li>
                    <li>Verify users and prevent fraud</li>
                    <li>Provide customer support and dispute handling</li>
                    <li>Improve Platform functionality</li>
                    <li>Comply with legal obligations</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    5. Legal Basis
                  </h2>
                  <p className="text-muted-foreground">Processing is based on:</p>
                  <ul className="text-muted-foreground">
                    <li>Contract performance</li>
                    <li>Legitimate interests (platform security, fraud prevention)</li>
                    <li>Legal obligations</li>
                    <li>Consent, where required</li>
                  </ul>
                  <p className="text-muted-foreground">
                    FreightShare ensures legitimate interests do not override user rights.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    6. Data Sharing
                  </h2>
                  <p className="text-muted-foreground">Personal data may be shared with:</p>
                  <ul className="text-muted-foreground">
                    <li>Other users, where necessary for transactions</li>
                    <li>Service providers (payment, hosting, analytics)</li>
                    <li>Authorities, when legally required</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Each user acts as an independent data controller for data received from other users.
                  </p>
                  <p className="text-muted-foreground">
                    FreightShare does not sell personal data.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    7. Data Retention
                  </h2>
                  <p className="text-muted-foreground">Data is retained only as long as necessary:</p>
                  <ul className="text-muted-foreground">
                    <li>Account data: duration of account + 7 years</li>
                    <li>Transaction data: up to 10 years</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Retention is based on commercial, tax, and transport law obligations.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    8. User Rights (GDPR)
                  </h2>
                  <p className="text-muted-foreground">
                    Users have rights to access, rectify, erase, restrict, port, object, and withdraw consent.
                  </p>
                  <p className="text-muted-foreground">
                    Requests are handled within one month.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    9. Security Measures
                  </h2>
                  <p className="text-muted-foreground">FreightShare implements:</p>
                  <ul className="text-muted-foreground">
                    <li>Encryption in transit and at rest</li>
                    <li>Access controls</li>
                    <li>Secure payment processing via certified providers</li>
                    <li>Incident response procedures</li>
                  </ul>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    10. International Transfers
                  </h2>
                  <p className="text-muted-foreground">
                    Data is processed primarily within the EEA. Transfers outside the EEA use appropriate 
                    safeguards, including Standard Contractual Clauses.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    11. Cookies
                  </h2>
                  <p className="text-muted-foreground">
                    Essential cookies are required for Platform functionality. Analytics cookies are used only 
                    with consent and managed via a cookie consent tool.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    12. Children
                  </h2>
                  <p className="text-muted-foreground">
                    The Platform is not intended for individuals under 18. FreightShare does not knowingly 
                    collect data from children.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    13. Automated Decision-Making
                  </h2>
                  <p className="text-muted-foreground">
                    FreightShare does not engage in automated decision-making or profiling under Article 22 GDPR.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    14. Policy Changes
                  </h2>
                  <p className="text-muted-foreground">
                    Material changes will be communicated via email or platform notification.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    15. Supervisory Authority
                  </h2>
                  <p className="text-muted-foreground">
                    Users may lodge complaints with the Autoriteit Persoonsgegevens or their local authority.
                  </p>

                  <h2 className="text-2xl font-heading font-semibold text-foreground mt-8">
                    16. Contact
                  </h2>
                  <p className="text-muted-foreground">
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
