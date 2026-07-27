import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

const SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance of these Terms' },
  { id: 'who-we-are', title: '2. Who We Are and What FreightShare Does' },
  { id: 'eligibility', title: '3. Eligibility and Account Registration' },
  { id: 'carrier-requirements', title: '4. Carrier Requirements' },
  { id: 'using-platform', title: '5. Using the Platform' },
  { id: 'fees-payments', title: '6. Fees and Payments' },
  { id: 'delivery-disputes', title: '7. Delivery Confirmation and Disputes' },
  { id: 'insurance', title: '8. Cargo Protection and Insurance' },
  { id: 'prohibited', title: '9. Prohibited Goods and Conduct' },
  { id: 'ip', title: '10. Intellectual Property' },
  { id: 'data-protection', title: '11. Data Protection' },
  { id: 'liability', title: '12. Limitation of Liability' },
  { id: 'indemnification', title: '13. Indemnification' },
  { id: 'suspension', title: '14. Suspension and Termination' },
  { id: 'changes', title: '15. Changes to these Terms' },
  { id: 'complaints', title: '16. Complaints and Mediation' },
  { id: 'governing-law', title: '17. Governing Law and Disputes' },
  { id: 'general', title: '18. General Provisions' },
  { id: 'contact', title: '19. Contact' },
];

export default function Terms() {
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
              <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Terms of Service</h1>
              <p className="text-sm text-muted-foreground mb-6">Last updated: 21 July 2026</p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                These Terms of Service ("Terms") govern access to and use of the FreightShare platform
                at freight-share.com (the "Platform"), operated by FreightShare
                ("FreightShare", "we", "us"). By creating an account or otherwise using the Platform,
                you agree to be bound by these Terms.
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
                <div id="acceptance" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">1. Acceptance of these Terms</h2>
                  <p className="leading-relaxed">
                    These Terms form a binding agreement between you and FreightShare. If you are using the
                    Platform on behalf of a company or other legal entity, you represent that you have the
                    authority to bind that entity, and "you" refers to that entity. If you do not agree to
                    these Terms, do not register for or use the Platform.
                  </p>
                </div>

                <div id="who-we-are" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">2. Who We Are and What FreightShare Does</h2>
                  <p className="leading-relaxed mb-3">
                    FreightShare operates an online marketplace that connects businesses seeking to ship
                    freight ("Shippers") with road haulage businesses offering transport capacity ("Carriers")
                    across the European Union, the European Economic Area, the United Kingdom, Switzerland,
                    and neighbouring markets.
                  </p>
                  <p className="leading-relaxed mb-3">
                    FreightShare is a technology facilitator. We provide tools to list loads and routes, match
                    Shippers with Carriers by proximity and cargo compatibility, exchange offers, process
                    payment authorisation and release, and capture delivery documentation. <strong>FreightShare
                    is not a carrier, freight forwarder, or logistics operator, and is not a party to the
                    contract of carriage.</strong> That contract — including the rights, obligations, and
                    liability of the parties for the carriage itself — is formed directly between the Shipper
                    and the Carrier, and, where the shipment is international road transport, is generally
                    governed by the Convention on the Contract for the International Carriage of Goods by Road
                    (CMR) and applicable national law.
                  </p>
                  <p className="leading-relaxed">
                    FreightShare does not take possession, custody, or control of any goods listed or
                    transported through the Platform at any point.
                  </p>
                </div>

                <div id="eligibility" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">3. Eligibility and Account Registration</h2>
                  <p className="leading-relaxed mb-3">
                    The Platform is intended for use by businesses and self-employed professionals acting in
                    a commercial or professional capacity, not by consumers acting for personal purposes. You
                    must be legally capable of entering into binding contracts and must provide accurate,
                    current, and complete information when registering, including business identification
                    details where applicable (such as a VAT number).
                  </p>
                  <p className="leading-relaxed mb-3">
                    We may ask you to verify your identity and, where relevant, your business registration,
                    before you can post loads or routes, send offers, or accept a payment. You are responsible
                    for keeping your account credentials confidential and for all activity that occurs under
                    your account.
                  </p>
                  <p className="leading-relaxed">
                    We may decline to register an account, or may request additional verification at any time,
                    at our reasonable discretion.
                  </p>
                </div>

                <div id="carrier-requirements" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">4. Carrier Requirements</h2>
                  <p className="leading-relaxed mb-3">
                    If you register as a Carrier, you represent and warrant on an ongoing basis that you:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>
                      hold all licences, permits, and authorisations required to lawfully operate as a road
                      haulage undertaking in the jurisdictions in which you operate, including a valid
                      Community Licence or equivalent national authorisation where required under Regulation
                      (EC) No 1072/2009 and Regulation (EC) No 1071/2009;
                    </li>
                    <li>
                      maintain carrier liability insurance appropriate to the goods you transport, and any
                      other insurance required by applicable law;
                    </li>
                    <li>
                      will provide accurate, current documentation evidencing the above when requested, and
                      will notify us promptly if any such licence, authorisation, or insurance lapses, is
                      suspended, or is revoked.
                    </li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    Documents you submit for verification (including insurance certificates) are reviewed for
                    completeness but their submission and any "verified" status shown on the Platform does not
                    constitute a guarantee, endorsement, or warranty by FreightShare that your authorisations
                    or insurance remain valid, adequate, or in force at any given time. Shippers should
                    exercise their own diligence before entrusting valuable or sensitive cargo to a Carrier.
                  </p>
                </div>

                <div id="using-platform" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">5. Using the Platform</h2>
                  <p className="leading-relaxed mb-3">
                    Shippers may post loads describing cargo, origin, destination, and required capacity.
                    Carriers may post routes describing available capacity, origin, destination, and any
                    intermediate stops. The Platform surfaces potential matches based on geographic proximity,
                    cargo type, and declared capacity, and displays a proximity indicator to help you assess
                    fit — this indicator is a convenience tool and does not itself constitute an offer, a
                    booking, or a guarantee of compatibility; you remain responsible for confirming that a
                    match is suitable before accepting it.
                  </p>
                  <p className="leading-relaxed mb-3">
                    Offers exchanged through the Platform become binding between the Shipper and the Carrier
                    only once expressly accepted through the Platform's acceptance flow. Neither party is
                    obliged to send, receive, or accept any offer.
                  </p>
                  <p className="leading-relaxed">
                    You agree to provide accurate information about cargo (including weight, dimensions,
                    nature of goods, and any special handling requirements) and about available transport
                    capacity. Inaccurate declarations that cause a mismatch, delay, or loss are between the
                    Shipper and Carrier and are not FreightShare's responsibility.
                  </p>
                </div>

                <div id="fees-payments" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">6. Fees and Payments</h2>
                  <p className="leading-relaxed mb-3">
                    Payments between Shippers and Carriers are processed through our third-party payment
                    processor, Stripe. When a Shipper accepts an offer, payment is authorised on the Shipper's
                    card but not yet captured. Funds are captured and released to the Carrier once delivery is
                    confirmed — by explicit Shipper confirmation, by upload of a signed CMR/eCMR, by
                    completion of the Platform's delivery evidence flow, or automatically after 48 hours from
                    carrier-marked delivery if no dispute has been raised.
                  </p>
                  <p className="leading-relaxed mb-3">
                    FreightShare charges a service fee, disclosed to you before you accept an offer, which is
                    currently 2% of the transaction value and is deducted from the amount released to the
                    Carrier. We may change this fee for future transactions on notice as described in Section
                    15.
                  </p>
                  <p className="leading-relaxed">
                    Carrier payouts are made via Stripe Connect to a connected account that each Carrier sets
                    up directly with Stripe. FreightShare does not hold client funds in its own account beyond
                    the momentary routing of a transaction, and does not itself provide payment or e-money
                    services — those are provided by Stripe under Stripe's own terms, which you separately
                    agree to when you connect a Stripe account.
                  </p>
                </div>

                <div id="delivery-disputes" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">7. Delivery Confirmation and Disputes</h2>
                  <p className="leading-relaxed mb-3">
                    The Platform lets Carriers capture delivery evidence (such as a photo, condition notes, and
                    a recipient signature) at pickup and at delivery. This evidence, together with any
                    CMR/eCMR uploaded, is intended to support — not replace — the parties' own record-keeping
                    obligations under applicable transport law.
                  </p>
                  <p className="leading-relaxed">
                    If a Shipper disputes that a shipment was delivered as described, they may raise a dispute
                    within 48 hours of the Carrier marking the shipment delivered, which pauses automatic
                    release of funds pending resolution between the parties. FreightShare may, at its
                    discretion, help facilitate communication between the parties but does not adjudicate
                    disputes about the condition, timeliness, or loss of goods — those claims are governed by
                    the contract of carriage between the Shipper and Carrier and applicable law (including
                    CMR, where it applies).
                  </p>
                </div>

                <div id="insurance" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">8. Cargo Protection and Insurance</h2>
                  <p className="leading-relaxed mb-3">
                    Under CMR, a Carrier's liability for loss or damage to goods is capped by reference to the
                    weight of the shipment, and is fault-based. This cap can be lower than the actual value of
                    the goods carried. The Platform displays an estimate of this cap and any resulting coverage
                    gap for informational purposes only; the figures shown are approximations and are not a
                    substitute for a proper valuation or insurance advice.
                  </p>
                  <p className="leading-relaxed mb-3">
                    Where the Platform offers an optional "Cargo Protection" feature, this is illustrative only
                    and does not constitute a contract of insurance, does not create a binding policy, and does
                    not obligate FreightShare or any third party to indemnify you for any loss, unless and
                    until FreightShare expressly identifies a named, licensed insurer or registered insurance
                    intermediary underwriting that specific cover at the time you use the feature. Until then,
                    Shippers who wish to insure cargo above the CMR liability cap should arrange their own
                    cargo (all-risk) insurance directly with a licensed insurer.
                  </p>
                  <p className="leading-relaxed">
                    Any carrier liability insurance details shown on a Carrier's profile are self-declared by
                    that Carrier, as described in Section 4, and are not independently underwritten or
                    guaranteed by FreightShare.
                  </p>
                </div>

                <div id="prohibited" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">9. Prohibited Goods and Conduct</h2>
                  <p className="leading-relaxed mb-3">You must not use the Platform to list, request, or transport:</p>
                  <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                    <li>illegal goods, or goods whose transport requires a licence you do not hold;</li>
                    <li>
                      dangerous or hazardous goods regulated under ADR (the European Agreement concerning the
                      International Carriage of Dangerous Goods by Road) unless you hold the required
                      authorisations and declare them accurately;
                    </li>
                    <li>live animals, human remains, or weapons, without our prior written consent;</li>
                    <li>counterfeit goods or goods infringing third-party intellectual property rights.</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    You must not misrepresent your identity, licences, insurance, or the nature of your cargo;
                    attempt to circumvent the Platform's payment flow to avoid fees; or interfere with the
                    Platform's operation or security.
                  </p>
                </div>

                <div id="ip" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">10. Intellectual Property</h2>
                  <p className="leading-relaxed">
                    The Platform, including its software, design, and branding, is owned by FreightShare or its
                    licensors and protected by intellectual property law. We grant you a limited,
                    non-exclusive, non-transferable licence to access and use the Platform for its intended
                    purpose. You retain ownership of content you submit (such as load descriptions and
                    photos), and grant FreightShare a licence to use it as needed to operate the Platform.
                  </p>
                </div>

                <div id="data-protection" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">11. Data Protection</h2>
                  <p className="leading-relaxed">
                    Our collection and use of personal data is described in our{' '}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which forms
                    part of these Terms.
                  </p>
                </div>

                <div id="liability" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">12. Limitation of Liability</h2>
                  <p className="leading-relaxed mb-3">
                    Because FreightShare is not a party to the contract of carriage, we are not liable for the
                    loss, damage, delay, or misdelivery of any goods transported through the Platform, for a
                    Carrier's failure to perform, or for a Shipper's failure to load or provide accurate cargo
                    information. Those matters are between the Shipper and Carrier.
                  </p>
                  <p className="leading-relaxed mb-3">
                    To the maximum extent permitted by applicable law, FreightShare's total liability arising
                    out of or relating to your use of the Platform itself (as distinct from the underlying
                    carriage) is limited to the greater of (a) the fees you paid to FreightShare in the three
                    months preceding the event giving rise to the claim, or (b) €500. Nothing in these Terms
                    excludes liability that cannot lawfully be excluded, such as liability for our own fraud or
                    gross negligence.
                  </p>
                  <p className="leading-relaxed">
                    The Platform is provided "as is." We do not guarantee that matches shown will be available,
                    accurate, or suitable, or that the Platform will be uninterrupted or error-free.
                  </p>
                </div>

                <div id="indemnification" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">13. Indemnification</h2>
                  <p className="leading-relaxed">
                    You agree to indemnify and hold FreightShare harmless from claims, losses, and expenses
                    (including reasonable legal fees) arising from your breach of these Terms, your violation
                    of applicable law, or your provision of inaccurate information on the Platform, except to
                    the extent caused by FreightShare's own breach or negligence.
                  </p>
                </div>

                <div id="suspension" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">14. Suspension and Termination</h2>
                  <p className="leading-relaxed mb-3">
                    You may close your account at any time. We may suspend or terminate your account if you
                    breach these Terms, if we reasonably suspect fraud or illegal activity, or if required by
                    law. Where reasonably possible, we will give you advance notice and a statement of reasons
                    before suspending or terminating a business account; we may act without prior notice where
                    there is a legal obligation to do so, or where notice would undermine the purpose of the
                    action (for example, in cases of suspected fraud).
                  </p>
                  <p className="leading-relaxed">
                    Sections that by their nature should survive termination (including Sections 6, 12, 13, and
                    17) remain in effect after your account is closed.
                  </p>
                </div>

                <div id="changes" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">15. Changes to these Terms</h2>
                  <p className="leading-relaxed">
                    We may update these Terms from time to time. For changes that materially affect business
                    users, we will give at least 15 days' notice before the change takes effect, except where
                    a shorter period is necessary to comply with a legal requirement or to address an
                    identified security risk. Continued use of the Platform after a change takes effect
                    constitutes acceptance of the updated Terms.
                  </p>
                </div>

                <div id="complaints" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">16. Complaints and Mediation</h2>
                  <p className="leading-relaxed">
                    If you have a complaint about the Platform itself, contact us at{' '}
                    <a href="mailto:contact@freight-share.com" className="text-primary hover:underline">contact@freight-share.com</a>{' '}
                    and we will investigate and respond within a reasonable time. If a complaint cannot be
                    resolved directly, you may seek mediation before an independent mediator, at which point we
                    will discuss suitable mediators with you in good faith.
                  </p>
                </div>

                <div id="governing-law" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">17. Governing Law and Disputes</h2>
                  <p className="leading-relaxed">
                    These Terms are governed by the laws of Luxembourg, without regard to conflict-of-law
                    rules, and the courts of Luxembourg have exclusive jurisdiction over any dispute arising
                    from these Terms, save where applicable law gives you the right to bring proceedings
                    elsewhere.
                  </p>
                </div>

                <div id="general" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">18. General Provisions</h2>
                  <p className="leading-relaxed mb-3">
                    If any provision of these Terms is found unenforceable, the remaining provisions continue
                    in full force. Our failure to enforce a provision is not a waiver of it. You may not assign
                    your rights under these Terms without our consent; we may assign ours in connection with a
                    merger, acquisition, or sale of assets. Neither party is liable for delay or failure to
                    perform caused by circumstances beyond its reasonable control. These Terms, together with
                    the Privacy Policy and any other policies referenced here, constitute the entire agreement
                    between you and FreightShare regarding the Platform.
                  </p>
                </div>

                <div id="contact" className="scroll-mt-24">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-3">19. Contact</h2>
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
