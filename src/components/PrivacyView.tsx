import React from 'react';

export default function PrivacyView() {
  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      <div className="border-b border-orange-100 pb-4">
        <h1 className="text-3xl font-display font-extrabold text-[#1a1a1a]">Privacy Policy</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">Last updated: July 24, 2024</p>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed space-y-6 text-sm">
        <p>Campus Foods ("us", "we", or "our") operates this website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
        
        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">1. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you. Types of Data Collected include:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to: Email address, First name and last name, Phone number, Address (Hostel, Room Number).</li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data").</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">2. Use of Data</h2>
          <p>Campus Foods uses the collected data for various purposes:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">3. Data Security</h2>
          <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-brand-dark pt-2">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </div>
    </div>
  );
}