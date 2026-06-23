import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { saveContactMessageToDb } from '../firebase';

export default function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitErrorSummary, setSubmitErrorSummary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setSubmitErrorSummary('');

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. support@campusfoods.ng)';
    }

    if (!message.trim()) {
      newErrors.message = 'Message details cannot be empty';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long for our team to assist you';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitErrorSummary('Failed to submit. Please correct the highlighted fields below.');
      return;
    }

    try {
      setErrors({});
      await saveContactMessageToDb({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Contact form error:', err);
      setSubmitErrorSummary('Failed to send message. Please check your network and try again.');
    }
  };

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
      
      {/* Header title block */}
      <div className="border-b border-orange-100 pb-4">
        <h1 className="text-3xl font-display font-extrabold text-[#1a1a1a]">Get in Touch 📞</h1>
        <p className="text-sm text-gray-500 font-sans mt-1">
          Have queries about orders, vendor partnerships, or wish to join our dispatch rider team? Reach out!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT: CONTACT FORMS */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-orange-100/60 shadow-sm space-y-6">
          <h2 className="text-lg font-display font-bold text-brand-dark flex items-center gap-1.5 -mb-2">
            Leave Us a Message ✉️
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Expect an official email reply from hello@campusfoods.ng within 24 hours.
          </p>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
              <h3 className="font-display font-bold text-lg text-emerald-800">Message Sent Successfully!</h3>
              <p className="text-xs font-sans text-emerald-600">
                Thank you for contacting Campus Foods! Your submission has been received and our admin team will reply to you shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs underline text-emerald-800 font-semibold cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitErrorSummary && (
                <div id="contact-error-summary" className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs font-sans text-red-600 font-bold animate-shake">
                  ⚠️ {submitErrorSummary}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="font-sans space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Name *</label>
                  <input
                    type="text"
                    placeholder=""
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all ${
                      errors.name ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                    }`}
                  />
                  {errors.name && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {errors.name}</p>}
                </div>

                {/* Email */}
                <div className="font-sans space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="text"
                    placeholder=""
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full min-w-0 bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div className="font-sans space-y-1">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wide">Message Details *</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you need help with..."
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
                  }}
                  className={`w-full min-w-0 break-words bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs font-sans font-semibold text-[#1a1a1a] p-3.5 rounded-2xl border outline-none transition-all resize-none ${
                    errors.message ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' : 'border-orange-100 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange'
                  }`}
                />
                {errors.message && <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ {errors.message}</p>}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-[#e07f00] text-white font-sans font-extrabold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-orange-200 hover:scale-[1.01] active:scale-95 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} />
                Send Message
              </button>
            </form>
          )}

        </div>

        {/* RIGHT: CONTACT DETAILS, WHATSAPP & MAP PLACEHOLDER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Details list */}
          <div className="bg-white border border-orange-100/60 p-6 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-base font-display font-extrabold text-[#1a1a1a] pb-2 border-b border-orange-50">
              Campus Support Desk
            </h2>

            <div className="space-y-4 text-xs font-sans text-gray-650">
              {/* Phone item */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-100/60 text-brand-orange flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Call Support Helpline</h4>
                  <a
                    href="tel:+2348113860805"
                    className="mt-0.5 font-bold text-brand-orange hover:underline flex items-center gap-1.5 group"
                  >
                    08113860805
                    <span className="text-[10px] text-gray-400 group-hover:text-brand-orange transition-colors">(Tap to call)</span>
                  </a>
                </div>
              </div>

              {/* Email item */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-100/60 text-brand-orange flex items-center justify-center shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Send Inquiries</h4>
                  <p className="mt-0.5 select-all text-gray-550 font-semibold font-mono">hello@campusfoods.ng</p>
                </div>
              </div>

              {/* Address item */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-orange-100/60 text-brand-orange flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1a1a]">Operations Hub</h4>
                  <p className="mt-0.5 text-gray-550 leading-relaxed font-semibold">Student Union Building Block A, University Campus, Nigeria</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/2348113860805?text=Hello%20Campus%20Foods!%20I%20need%20help%20with%20my%20order."
                target="_blank"
                rel="noreferrer"
                className="w-full text-center bg-[#10b981] hover:bg-[#059669] text-white font-sans font-extrabold py-3.5 px-6 rounded-2xl transition-all shadow-md shadow-emerald-250 hover:scale-[1.02] text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white text-[10px]">🟢</div>
                Chat Us on WhatsApp
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
