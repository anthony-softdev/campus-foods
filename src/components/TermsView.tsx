import React from 'react';

export default function TermsView() {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      <div className="border-b border-orange-100 pb-4">
        <h1 className="text-3xl font-display font-extrabold text-[#1a1a1a]">Terms of Service</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">Last updated: July 24, 2024</p>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed space-y-6 text-sm">
        <p>Welcome to Campus Foods! These terms and conditions outline the rules and regulations for the use of Campus Foods's Website, located at this domain.</p>
        
        <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Campus Foods if you do not agree to take all of the terms and conditions stated on this page.</p>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">1. General Terms</h2>
          <p>Our service is designed to connect university students with local food vendors for delivery within the campus. By placing an order, you agree to pay the full amount for the items and any applicable delivery fees.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">2. Accounts</h2>
          <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. We are not liable for any loss or damage arising from your failure to comply with the above.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">3. Orders and Payments</h2>
          <p>All orders are subject to availability. We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">4. Intellectual Property</h2>
          <p>The Service and its original content, features and functionality are and will remain the exclusive property of Campus Foods and its licensors. The Service is protected by copyright, trademark, and other laws of both Nigeria and foreign countries.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">5. Limitation Of Liability</h2>
          <p>In no event shall Campus Foods, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">6. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us via the contact page.</p>
        </div>
      </div>
    </div>
  );
}