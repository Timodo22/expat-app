import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Users, CheckCircle2, MessageCircle, ArrowRight, Star, 
  Instagram, Linkedin, Facebook, Home, Key, Briefcase, ShieldCheck, Zap
} from 'lucide-react';
import logoEH from '../assets/logoEH.png'; // Jouw eigen logo

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-[#84B5A5] selection:text-white scroll-smooth">
      {/* SEO Meta Tags (Geoptimaliseerd voor vindbaarheid) */}
      <title>Expat Housing Brainport | Rent or Buy Homes in Eindhoven</title>
      <meta name="description" content="Seamless relocation to the Brainport region. We digitize and automate the housing workflow for expats and corporate clients in Eindhoven. Start your automated intake today." />
      <meta name="keywords" content="Expat housing, Eindhoven, Brainport, Renting, Buying, Corporate housing, Relocation services, Real estate" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoEH} alt="Expat Housing Brainport Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-lg text-[#0C3C4C] tracking-tight leading-none">Expat Housing Brainport</span>
              <span className="text-[10px] text-[#84B5A5] font-semibold tracking-wider uppercase mt-1">
                Where international talent finds home
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#services" className="hover:text-[#84B5A5] transition-colors">Services</a>
            <a href="#how-it-works" className="hover:text-[#84B5A5] transition-colors">How it works</a>
            <a href="#reviews" className="hover:text-[#84B5A5] transition-colors">Reviews</a>
            <Link to="/auth" className="text-[#0C3C4C] hover:text-[#84B5A5] transition-colors">Client Portal Login</Link>
          </div>

          <div className="flex gap-3">
            <Link to="/intake" className="bg-[#0C3C4C] hover:bg-[#0a2f3b] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Start Intake <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-16 px-6 bg-gradient-to-b from-white to-[#F9FAFB]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#84B5A5]/10 text-[#84B5A5] text-sm font-semibold mb-4">
            <ShieldCheck size={16} />
            Automated & hassle-free housing process
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#0C3C4C] tracking-tight leading-[1.1]">
            Where international talent <br className="hidden md:block" />
            <span className="text-[#84B5A5] relative whitespace-nowrap">
              finds home.
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#84B5A5]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We digitize and automate the housing workflow for expats and corporate clients. Fast-track your relocation to the Brainport region with our smart client portals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/intake?type=rent" className="w-full sm:w-auto bg-[#0C3C4C] text-white text-lg font-medium px-8 py-4 rounded-xl hover:bg-[#0a2f3b] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              <Home size={20} /> I want to Rent
            </Link>
            <Link to="/intake?type=buy" className="w-full sm:w-auto bg-white text-[#0C3C4C] border-2 border-gray-100 text-lg font-medium px-8 py-4 rounded-xl hover:border-[#84B5A5] hover:text-[#84B5A5] transition-all flex items-center justify-center gap-2 shadow-sm">
              <Key size={20} /> I want to Buy
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-y border-gray-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 text-gray-400 font-medium text-sm">
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[#84B5A5]" size={20} /> 100% Digital Intake</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[#84B5A5]" size={20} /> Direct Assignment Access</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[#84B5A5]" size={20} /> B2C & B2B Portals</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="text-[#84B5A5]" size={20} /> Brainport Region Experts</div>
        </div>
      </section>

      {/* Services & Portals */}
      <section id="services" className="py-24 bg-[#F9FAFB] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0C3C4C] mb-4">Tailored Housing Solutions</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Log in to your dedicated portal to manage documents, track progress, or onboard new employees instantly.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Expat Card */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#84B5A5]/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-[#0C3C4C] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0C3C4C] mb-4">Expat Portal (B2C)</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Your personal housing dashboard. Complete your intake in 2 minutes, securely upload required documents, and track your property matches and contract status in real-time.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> Smart document upload & verification</li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> Track viewings & offers</li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> Digital contract signing</li>
              </ul>
              <Link to="/auth" className="text-[#0C3C4C] font-semibold flex items-center gap-2 hover:text-[#84B5A5] transition-colors">
                Log in as Expat <ArrowRight size={18} />
              </Link>
            </div>

            {/* Corporate Card */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0C3C4C]/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
              <div className="w-14 h-14 bg-[#84B5A5] rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Briefcase className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0C3C4C] mb-4">Corporate Portal (B2B)</h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                Streamline employee relocation. HR departments can easily add new employees, initiate housing requests, and monitor the housing status of their entire expat workforce.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> 1-click employee onboarding</li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> Dashboard overview of all cases</li>
                <li className="flex items-center gap-3 text-sm font-medium text-gray-700"><CheckCircle2 size={18} className="text-[#84B5A5]" /> Automated billing & compliance</li>
              </ul>
              <Link to="/auth" className="text-[#0C3C4C] font-semibold flex items-center gap-2 hover:text-[#84B5A5] transition-colors">
                Log in as Corporate <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Automated Process */}
      <section id="how-it-works" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0C3C4C] mb-4">Automated & Effortless</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Our digitized workflow ensures you spend less time on paperwork and more time settling into your new home.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-100 -z-10"></div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-white border-4 border-[#84B5A5] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Zap size={32} className="text-[#84B5A5]" />
              </div>
              <h3 className="text-xl font-bold text-[#0C3C4C] mb-3">1. Fast Digital Intake</h3>
              <p className="text-gray-500">Fill out our smart form in minutes. Provide your basic details and let our system automatically set up your client portal.</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-[#84B5A5] rounded-full flex items-center justify-center mb-6 shadow-md text-white">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0C3C4C] mb-3">2. Upload & Match</h3>
              <p className="text-gray-500">Upload your documents securely in the portal. We directly assign matching properties based on your verified profile.</p>
            </div>
            
            <div className="text-center relative">
              <div className="w-20 h-20 mx-auto bg-[#0C3C4C] rounded-full flex items-center justify-center mb-6 shadow-md text-white">
                <Home size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0C3C4C] mb-3">3. Sign & Move In</h3>
              <p className="text-gray-500">View homes, sign contracts digitally, and get your utilities connected automatically. Welcome home.</p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/intake" className="inline-flex items-center gap-2 bg-[#84B5A5] text-white font-medium px-8 py-4 rounded-xl hover:bg-[#729c8e] transition-all shadow-md">
              Start your automated process <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-24 bg-[#F9FAFB] px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#0C3C4C] mb-16">Trusted by Expats & Corporates</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Elena R.", role: "ASML Engineer", text: "The portal made uploading my documents so easy. Found an apartment in 2 weeks with minimal conditions required!" },
              { name: "Mark T.", role: "Philips Expat", text: "Buying a house in a new country is scary, but their digital purchase workflow and guidance was incredibly transparent and fast." },
              { name: "Sarah J.", role: "HR Manager", text: "The B2B portal saves our HR team hours of work. We can track all our new hires' housing status in one clean dashboard." }
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="absolute top-8 right-8 text-gray-100">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <div className="flex text-[#84B5A5] mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} size={18} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed relative z-10">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[#0C3C4C]">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#0C3C4C] text-sm">{review.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={logoEH} alt="Expat Housing Brainport Logo" className="h-10 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[#0C3C4C] tracking-tight leading-none">Expat Housing Brainport</span>
                <span className="text-[10px] text-[#84B5A5] font-semibold tracking-wider uppercase mt-1">
                  Where international talent finds home
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm max-w-sm mb-6 leading-relaxed">
              Digitizing the relocation journey. The smartest way to rent, buy, or manage housing for international talent in the Brainport area.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#0C3C4C] hover:text-white transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#0C3C4C] hover:text-white transition-all"><Linkedin size={18} /></a>
              <a href="#" className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#0C3C4C] hover:text-white transition-all"><Facebook size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#0C3C4C] mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <span className="block font-semibold text-gray-900 mb-1">Floor Hoeks</span>
                Founder / Buyer's Agent / Rental Agent
              </li>
              <li>
                Frederiklaan 10E<br />
                5616 NH Eindhoven
              </li>
              <li>
                <a href="tel:0403403839" className="hover:text-[#84B5A5] transition-colors">040 340 38 39</a>
              </li>
              <li>
                <a href="mailto:info@expathousingbrainport.nl" className="hover:text-[#84B5A5] transition-colors">info@expathousingbrainport.nl</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#0C3C4C] mb-6">Portals & Links</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/auth" className="hover:text-[#84B5A5] transition-colors">Expat Portal Login</Link></li>
              <li><Link to="/auth" className="hover:text-[#84B5A5] transition-colors">Corporate Portal Login</Link></li>
              <li><Link to="/intake" className="hover:text-[#84B5A5] transition-colors">Start Intake</Link></li>
              <li><a href="https://www.expathousingbrainport.nl" target="_blank" rel="noreferrer" className="hover:text-[#84B5A5] transition-colors">Main Website</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Expat Housing Brainport. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/31403403839" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all z-50 group"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={28} />
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Questions? WhatsApp us!
        </span>
      </a>
    </div>
  );
}