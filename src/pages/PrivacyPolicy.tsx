import { Link } from 'react-router-dom'
import { Activity, ArrowLeft, Shield, Mail, MapPin, User } from 'lucide-react'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">Pulse Analyzer</span>
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-8 border-b border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
                                <p className="text-slate-500">Personal Data Protection Act (PDPA) Compliance</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500">Last updated: January 2026</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Pulse Analyzer ("we", "our", or "us") is committed to protecting your personal data in accordance with the Personal Data Protection Act 2010 (PDPA) of Malaysia. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our survey analytics platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>We may collect the following types of personal data:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Account Information:</strong> Name, email address, password (encrypted), and organization details when you create an account.</li>
                                    <li><strong>Survey Data:</strong> Survey responses, feedback comments, and analytics data that you upload or generate through our platform.</li>
                                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including pages visited, features used, and time spent.</li>
                                    <li><strong>Technical Data:</strong> IP address, browser type, device information, and other technical identifiers.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>Your personal data is used for the following purposes:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>To provide and maintain our survey analytics services</li>
                                    <li>To process and analyze survey data using AI-powered tools</li>
                                    <li>To improve and personalize your experience on our platform</li>
                                    <li>To communicate with you about your account and our services</li>
                                    <li>To ensure the security and integrity of our platform</li>
                                    <li>To comply with legal obligations and enforce our terms of service</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Processing and AI</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our platform uses artificial intelligence (AI) to analyze survey responses and generate insights. When you use AI-powered features such as theme detection or narrative generation, your survey data may be processed through third-party AI services (such as OpenAI). We ensure that all data processing is conducted in compliance with applicable data protection laws and that appropriate safeguards are in place.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure data storage, access controls, and regular security assessments. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Survey data and analytics may be retained for the duration of your subscription plus a reasonable period thereafter. You may request deletion of your data at any time, subject to our legal obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Disclosure of Information</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>We may disclose your personal data to:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating our platform (e.g., cloud hosting, AI processing)</li>
                                    <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                </ul>
                                <p>We do not sell your personal data to third parties for marketing purposes.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Your Rights Under PDPA</h2>
                            <div className="space-y-4 text-slate-600 leading-relaxed">
                                <p>Under the Personal Data Protection Act 2010, you have the following rights:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Right of Access:</strong> Request access to your personal data held by us</li>
                                    <li><strong>Right of Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
                                    <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for processing at any time</li>
                                    <li><strong>Right to Limit Processing:</strong> Request limitation on how we process your data</li>
                                </ul>
                                <p>To exercise any of these rights, please contact us using the information provided below.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Cookies and Tracking</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Our platform may use cookies and similar tracking technologies to enhance your experience. These technologies help us understand how you use our platform and allow us to improve our services. You can control cookie preferences through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Changes to This Policy</h2>
                            <p className="text-slate-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we protect your data.
                            </p>
                        </section>

                        <section className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">11. Contact Us</h2>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Kadosh AI</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Email</p>
                                        <a href="mailto:asha@kadoshai.com" className="text-blue-600 hover:underline">asha@kadoshai.com</a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Address</p>
                                        <p className="text-slate-900">Petaling Jaya, Malaysia</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Data Protection Officer</p>
                                        <p className="text-slate-900">Colin Benedict Raj</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        2026 Pulse Analyzer. All rights reserved.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">Powered by</span>
                        <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="h-5 w-auto" />
                    </div>
                </div>
            </main>
        </div>
    )
}
