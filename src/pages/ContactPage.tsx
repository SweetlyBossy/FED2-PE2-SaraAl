import React from "react";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-inter pb-20" role="main">
      
      {/* Curved Hero Section */}
      <div 
        className="relative h-64 md:h-80 w-full bg-cover bg-center rounded-b-[4rem] md:rounded-b-[6rem] shadow-md flex items-center justify-center pt-16"
        style={{ backgroundImage: "url('/background.png')" }} 
        role="banner"
      >
        <div className="absolute inset-0 bg-slate-900/40 rounded-b-[4rem] md:rounded-b-[6rem]" aria-hidden="true"></div>
        <h1 className="relative z-10 text-3xl md:text-5xl font-bold text-white tracking-wide">
          Get in Touch
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-6 mt-16 text-slate-800" aria-label="Contact Information">
        
        {/* Intro Text */}
        <div className="text-center mb-16 max-w-2xl mx-auto" aria-labelledby="contact-intro-heading">
          <h2 id="contact-intro-heading" className="text-2xl font-bold mb-4">We are here to help.</h2>
          <p className="text-slate-500 leading-relaxed">
            Whether you have a question about booking a venue, managing your hosting profile, or just want to say hello, our team at Nordic Stay is always ready to assist you.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          
          {/* Location Card */}
          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow text-center" role="listitem">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Headquarters</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nordic Stay AS<br />
              Karl Johans gate 1<br />
              0154 Oslo, Norway
            </p>
          </div>

          {/* Email Card */}
          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow text-center" role="listitem">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Email Us</h3>
            <p className="text-sm text-slate-500 mb-4">
              We aim to respond to all inquiries within 24 hours.
            </p>
            <a href="mailto:support@nordicstay.no" className="text-teal-600 font-semibold hover:underline mt-auto" aria-label="Send email to support@nordicstay.no">
              support@nordicstay.no
            </a>
          </div>

          {/* Phone Card */}
          <div className="flex flex-col items-center p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow text-center" role="listitem">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Call Us</h3>
            <p className="text-sm text-slate-500 mb-4">
              Mon-Fri from 08:00 to 16:00 (CET).
            </p>
            <a href="tel:+4722002222" className="text-teal-600 font-semibold hover:underline mt-auto" aria-label="Call us at +47 22 00 22 22">
              +47 22 00 22 22
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;