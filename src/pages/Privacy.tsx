import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'who-we-are', title: '1. Who We Are' },
  { id: 'scope', title: '2. Scope of this Policy' },
  { id: 'data-we-collect', title: '3. Personal Data We Collect' },
  { id: 'how-we-use', title: '4. How We Use Your Data' },
  { id: 'sharing', title: '5. Who We Share Data With' },
  { id: 'transfers', title: '6. International Data Transfers' },
  { id: 'retention', title: '7. Data Retention' },
  { id: 'security', title: '8. Security' },
  { id: 'cookies', title: '9. Cookies and Similar Technologies' },
  { id: 'your-rights', title: '10. Your Rights' },
  { id: 'children', title: '11. Children’s Privacy' },
  { id: 'changes', title: '12. Changes to this Policy' },
  { id: 'contact', title: '13. Contact Us' },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-6">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">FreightShare</p>
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground mb-6">Last updated: 21 July 2026</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This Privacy Policy explains how FreightShare collects, uses, shares, and protects
                personal data when you use the FreightShare platform at freight-share.com (the
                "Platform"), in accordance with the General Data Protection Regulation (EU) 2016/679
                ("GDPR").
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto grid md:grid-cols-[220px_1fr] gap-12">
              <nav aria-label="Table of contents" className="hidden md:block">
                <div className="sticky top-24">
                  <p className="text-sm font-heading font-semibold text-foreground mb-3">Contents</p>
                  <ul className="space-y-2 text-sm">
                    {SECTIONS.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>

              <div className="space-y-10 text-foreground/90">
                <div id="who-we-are" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">1. Who We Are</h2>
                  <p className="leading-relaxed">
                    FreightShare, of Strassen, Luxembourg, is the data controller responsible for the
                    personal data described in this Policy. You can reach us at{' '}
                    <a href="mailto:contact@freight-share.com" className="text-primary hover:underline">contact@freight-share.com</a>{' '}
                    for any privacy question or to exercise the rights described in Section 10.
                  </p>
                </div>

                <div id="scope" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">2. Scope of this Policy</h2>
                  <p className="leading-relaxed">
                    This Policy applies to Shippers, Carriers, and visitors to the Platform. It does not
                    apply to Stripe's own processing of your payment card details, which is governed by
                    Stripe's privacy policy — FreightShare never receives or stores your full card number.
                  </p>
                </div>

                <div id="data-we-collect" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">3. Personal Data We Collect</h2>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>
                      <strong>Account and profile data:</strong> name, email address, phone number,
                      password, avatar, and role (Shipper or Carrier).
                    </li>
                    <li>
                      <strong>Business and verification data:</strong> company details, VAT number, and,
                      where applicable, identity documents, road haulage operator authorisations, and
                      insurance certificates you upload for verification.
                    </li>
                    <li>
                      <strong>Transaction data:</strong> details of loads, routes, offers, and shipments,
                      including origin and destination, cargo description, weight and dimensions, and
                      pricing.
                    </li>
                    <li>
                      <strong>Payment metadata:</strong> transaction amounts, status, and Stripe references
                      needed to reconcile payments — not your card number, which Stripe handles directly.
                    </li>
                    <li>
                      <strong>Location data:</strong> the cities and countries you post as pickup/drop-off
                      points, and, where you use delivery evidence capture, a best-effort GPS coordinate and
                      photo/signature attached to that specific pickup or delivery event.
                    </li>
                    <li>
                      <strong>Communications:</strong> messages you send to other users through the
                      Platform's messaging feature.
                    </li>
                    <li>
                      <strong>Usage and device data:</strong> log data, device and browser information, and
                      cookie data as described in Section 9.
                    </li>
                  </ul>
                </div>

                <div id="how-we-use" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">4. How We Use Your Data</h2>
                  <p className="leading-relaxed mb-3">We use personal data for the following purposes and legal bases:</p>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>
                      <strong>To provide the Platform</strong> — matching loads and routes, facilitating
                      offers, and processing payments — necessary for performance of our contract with you.
                    </li>
                    <li>
                      <strong>To verify identity and review submitted authorisations/insurance</strong> —
                      necessary for performance of our contract with you and our legitimate interest in
                      platform trust and safety.
                    </li>
                    <li>
                      <strong>To prevent fraud and secure the Platform</strong> — our legitimate interest in
                      protecting FreightShare and its users.
                    </li>
                    <li>
                      <strong>To communicate with you</strong> about your account or transactions —
                      necessary for performance of our contract with you.
                    </li>
                    <li>
                      <strong>To run analytics cookies</strong> — only where you consent via our cookie
                      banner, described further in Section 9.
                    </li>
                    <li>
                      <strong>To comply with legal obligations</strong>, such as tax, accounting, and
                      responding to lawful requests from authorities.
                    </li>
                  </ul>
                </div>

                <div id="sharing" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">5. Who We Share Data With</h2>
                  <p className="leading-relaxed mb-3">We do not sell your personal data. We share it only with:</p>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>
                      <strong>The other party to a transaction</strong> — for example, a Carrier sees the
                      Shipper's relevant contact and shipment details necessary to complete a booking, and
                      vice versa.
                    </li>
                    <li>
                      <strong>Service providers acting on our behalf</strong>, currently Stripe (payment
                      processing and Carrier payouts) and Supabase (hosting, database, and file storage),
                      each acting as an independent processor or controller under its own terms for the
                      services it provides.
                    </li>
                    <li>
                      <strong>Professional advisors</strong>, such as auditors or legal counsel, where
                      necessary.
                    </li>
                    <li>
                      <strong>Authorities</strong>, where required by law or to protect FreightShare's or a
                      user's legal rights.
                    </li>
                  </ul>
                </div>

                <div id="transfers" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">6. International Data Transfers</h2>
                  <p className="leading-relaxed">
                    Some of our service providers may process data outside the European Economic Area.
                    Where this happens, we rely on appropriate safeguards recognised under GDPR, such as the
                    European Commission's Standard Contractual Clauses, or transfers to countries the
                    Commission has recognised as providing an adequate level of protection.
                  </p>
                </div>

                <div id="retention" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">7. Data Retention</h2>
                  <p className="leading-relaxed">
                    We keep account and transaction data for as long as your account is active, and for a
                    further period afterward as needed to meet legal, accounting, and tax retention
                    obligations, or to establish, exercise, or defend legal claims (including delivery
                    evidence, which we retain for a period aligned with the limitation period applicable to
                    carriage claims). We delete or anonymise data once these purposes no longer apply.
                  </p>
                </div>

                <div id="security" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">8. Security</h2>
                  <p className="leading-relaxed">
                    We use technical and organisational measures appropriate to the risk, including
                    encryption of data in transit, access controls that restrict data to what each user and
                    system component needs, and restricted administrative access to verification documents
                    and payment metadata. No system is completely secure, and we encourage you to use a
                    strong, unique password for your account.
                  </p>
                </div>

                <div id="cookies" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">9. Cookies and Similar Technologies</h2>
                  <p className="leading-relaxed">
                    We use essential cookies needed to keep you signed in and to operate the Platform
                    securely; these do not require consent. We use analytics cookies only if you accept them
                    through the cookie banner shown on your first visit — you can change your choice at any
                    time by clearing your browser's local storage for this site or contacting us. Rejecting
                    analytics cookies does not affect your ability to use the Platform.
                  </p>
                </div>

                <div id="your-rights" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">10. Your Rights</h2>
                  <p className="leading-relaxed mb-3">Under GDPR, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>access the personal data we hold about you;</li>
                    <li>request correction of inaccurate data;</li>
                    <li>request erasure of your data, subject to our legal retention obligations;</li>
                    <li>request restriction of, or object to, certain processing;</li>
                    <li>request a portable copy of data you provided to us;</li>
                    <li>withdraw consent at any time where processing is based on consent (such as analytics cookies);</li>
                    <li>
                      lodge a complaint with your local data protection supervisory authority, or with the
                      Luxembourg National Commission for Data Protection (CNPD).
                    </li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    To exercise any of these rights, contact us at{' '}
                    <a href="mailto:contact@freight-share.com" className="text-primary hover:underline">contact@freight-share.com</a>.
                  </p>
                </div>

                <div id="children" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">11. Children&rsquo;s Privacy</h2>
                  <p className="leading-relaxed">
                    The Platform is a business-to-business service and is not directed at, or intended for
                    use by, individuals under 18 years of age. We do not knowingly collect personal data from
                    children.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">12. Changes to this Policy</h2>
                  <p className="leading-relaxed">
                    We may update this Policy from time to time to reflect changes in our practices or legal
                    requirements. We will update the "Last updated" date above, and for material changes we
                    will provide more prominent notice, such as an in-app notification.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">13. Contact Us</h2>
                  <p className="leading-relaxed">
                    FreightShare<br />
                    Strassen, Luxembourg<br />
                    Email: <a href="mailto:contact@freight-share.com" className="text-primary hover:underline">contact@freight-share.com</a><br />
                    Phone: <a href="tel:+393480567378" className="text-primary hover:underline">+39 348 056 7378</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
