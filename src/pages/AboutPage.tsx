import React from "react";
import { Link } from "react-router-dom";

const AboutPage: React.FC = () => {
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
          Our Story
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 mt-16 text-slate-800" aria-label="About Nordic Stay">
        
        {/* Intro Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24" aria-labelledby="intro-heading">
          <div>
            <h2 id="intro-heading" className="text-3xl font-bold mb-6">Discover the extraordinary.</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Founded in the heart of Norway, Nordic Stay was built on a simple premise: everyone should have access to authentic, unforgettable experiences. We bridge the gap between passionate hosts and travelers seeking more than just a place to sleep.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Whether it is a secluded cabin overlooking a tranquil fjord, a modern apartment in bustling Oslo, or a cozy retreat in Enebakk, our platform empowers property owners to effortlessly manage their venues while giving guests a seamless booking experience.
            </p>
          </div>
          <div className="relative">
            {/* A nice image placeholder for the About page */}
            <img 
              src="/box-filler.png" 
              alt="Nordic landscape" 
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
              onError={(e) => { (e.target as HTMLImageElement).src = "/fallback-image.jpg"; }}
            />
            {/* Decorative accent block */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-teal-50 rounded-2xl -z-10" aria-hidden="true"></div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="text-center mb-16" aria-labelledby="values-heading">
          <h2 id="values-heading" className="text-3xl font-bold mb-4">Our Core Values</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            We believe in creating a platform that is secure, intuitive, and beneficial for both our guests and our dedicated venue managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20" role="list" aria-labelledby="values-heading">
          
          {/* Value 1 */}
          <div className="flex flex-col p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow" role="listitem">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Trust & Security</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              Every venue and user is part of a verified ecosystem. We prioritize your privacy and ensure every booking is handled securely.
            </p>
          </div>

          {/* Value 2 */}
          <div className="flex flex-col p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow" role="listitem">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Seamless Experience</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              From finding the perfect getaway to managing your hosting dashboard, our platform is designed to be frictionless and beautiful.
            </p>
          </div>

          {/* Value 3 */}
          <div className="flex flex-col p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow" role="listitem">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6" aria-hidden="true">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-xl mb-3">Community Driven</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              We succeed when our hosts and guests succeed. Nordic Stay is built on a foundation of mutual respect and shared adventures.
            </p>
          </div>

        </div>

        {/* Call to Action */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden" aria-labelledby="cta-heading">
          <div className="relative z-10">
            <h2 id="cta-heading" className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Whether you are looking to explore a new city or list your own property to guests around the world, you belong here.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/venues" 
                className="bg-mint-green text-slate-900 font-bold py-3 px-8 rounded-full text-sm hover:opacity-90 transition-opacity"
                aria-label="Explore Venues"
              >
                Explore Venues
              </Link>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" aria-hidden="true"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" aria-hidden="true"></div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;