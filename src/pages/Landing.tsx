import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, CheckCircle2, MessageCircle, ArrowRight, Star, Instagram, Linkedin, Facebook } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-[#84B5A5] selection:text-white">
      {/* SEO Meta Tags (Simulated for React) */}
      <title>Expat Housing Brainport | Rent or Buy Homes in Eindhoven</title>
      <meta name="description" content="Seamless relocation to the Brainport region. We digitize and automate the housing workflow for expats and corporate clients in Eindhoven." />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-semibold text-xl text-[#0C3C4C] tracking-tight">Expat Housing</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-[#0C3C4C] transition-colors">Services</a>
            <a href="#reviews" className="hover:text-[#0C3C4C] transition-colors">Reviews</a>
            <Link to="/auth" className="hover:text-[#0C3C4C] transition-colors">Login / Register</Link>
          </div>
          <Link to="/intake" className="btn-primary text-sm px-5 py-2.5">
            Start Intake
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold text-[#0C3C4C] tracking-tight leading-[1.1]">
            Seamless Relocation to the <span className="text-[#84B5A5]">Brainport Region.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We digitize and automate the housing workflow for expats and corporate clients. Find your perfect home in Eindhoven and surroundings without the hassle.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/intake?type=rent" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2">
              I want to Rent
              <ArrowRight size={20} />
            </Link>
            <Link to="/intake?type=buy" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
              I want to Buy
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="services" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-apple">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-[#0C3C4C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0C3C4C] mb-3">For Expats</h3>
              <p className="text-gray-500 leading-relaxed">
                A streamlined portal to upload documents, track your housing status, and manage viewings securely.
              </p>
            </div>
            <div className="card-apple">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="text-[#0C3C4C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0C3C4C] mb-3">For Corporates</h3>
              <p className="text-gray-500 leading-relaxed">
                Easily onboard new employees and monitor their relocation progress through our dedicated B2B dashboard.
              </p>
            </div>
            <div className="card-apple">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="text-[#0C3C4C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0C3C4C] mb-3">Automated Process</h3>
              <p className="text-gray-500 leading-relaxed">
                From intake to key handover, our platform automates emails, document checks, and utility connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-[#F9FAFB] px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0C3C4C] mb-12">What our clients say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Elena R.", role: "ASML Engineer", text: "The portal made uploading my documents so easy. Found an apartment in 2 weeks!" },
              { name: "Mark T.", role: "Philips Expat", text: "Buying a house in a new country is scary, but their purchase workflow and guidance was incredible." },
              { name: "Sarah J.", role: "HR Manager", text: "The B2B portal saves us hours of work. We can track all our new hires' housing status in one place." }
            ].map((review, i) => (
              <div key={i} className="card-apple">
                <div className="flex text-[#84B5A5] mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-[#0C3C4C]">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer with Socials */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg text-[#0C3C4C] tracking-tight">Expat Housing Brainport</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-[#0C3C4C] transition-colors"><Instagram size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-[#0C3C4C] transition-colors"><Linkedin size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-[#0C3C4C] transition-colors"><Facebook size={24} /></a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
