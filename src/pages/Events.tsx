import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Calendar, MapPin, Image as ImageIcon, Clock, X, ExternalLink, Share2, Play, Check, ArrowRight } from 'lucide-react';
import { Event, EventModal } from '../components/EventModal';

const eventsData: Event[] = [
  {
    id: "2nd-gmm-2026-techx",
    title: "TechX Summit 2026: Creating What’s Next — Empowering Future Tech Innovators",
    subtitle: "October 15, 2026 | Technological Institute of the Philippines – Quezon City",
    date: "2026-10-15",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/itap_borad.png",
    venue: "T.I.P. Quezon City Anniversary Hall | 8:00 AM – 5:00 PM",
    videoUrl: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TIP%20-%20iTAP%20Summit%202026%20-%20TechX_2.mp4",
    overview: `**October 15, 2026 | Technological Institute of the Philippines – Quezon City**

The **TechX Summit 2026: Creating What’s Next** successfully brought together students, educators, industry leaders, and technology professionals for a day of innovation, collaboration, and knowledge sharing at the Technological Institute of the Philippines (T.I.P.) – Quezon City.

The summit was officially launched by **T.I.P. President Angelo Quirino Lahoz** and **Infocomm Technology Association of the Philippines (ITAP) President Sunver Z. Bastes**, who also serves as President of Total Information Management Corporation (TIM), reinforcing their shared commitment to bridging academic excellence and industry innovation.

### Industry Experts Shaping the Future of Technology

The summit featured distinguished industry leaders who shared their expertise on emerging technologies, cybersecurity, leadership, and future career opportunities:

- **Sherwin Pelayo**, Executive Director of the Analytics & AI Association of the Philippines, delivered the opening keynote, *“The Future of Tech Careers in the AI Era.”*
- **Bernice Gretchel P. Garcia-Rama**, CEO of Digital Edge Philippines, discussed *“AI-Ready Data Centers: Powering the Future of Intelligent Technology.”*
- **Martin Mondejar**, President & CEO of Black Bear Security Inc., and **Erwin V. Cayco**, Managed Service Monitoring and Operations Head at TIM, led the live demonstration, *“Cybersecurity Live: Attack & Defense Simulation.”*
- **Sunver Z. Bastes**, President of ITAP and TIM, shared leadership insights through *“Leading High-Performing Tech Teams: Communication, Collaboration & Leadership.”*
- **Kristian Rey R. Trinidad**, Chief Risk and Information Security Officer at TIM, discussed *“Trust by Design: IT Governance, Risk & Responsible Technology.”*
- **Karla Congson**, Founder & CEO of Agentiiv, explored *“Human in the Lead: The Evolving AI Landscape.”*

The summit also featured an industry roundtable on **“The Next 5 Years of Tech Careers: AI, Cloud, Cybersecurity, Data & Digital Innovation,”** with **Michael Ngan** of Lenovo Philippines, **Walter So** of HPE Philippines, **Romulo P. Cambaliza** of CIOs Philippines, and **Kristian Rey R. Trinidad** of TIM.

Through expert-led discussions, interactive demonstrations, and industry engagement, participants gained valuable perspectives on emerging technologies and the skills needed to thrive in an increasingly digital world.

Guided by its four pillars — **Network, Collaborate, Innovate, and Transform** — TechX Summit 2026 highlighted the importance of academe-industry collaboration in developing future-ready Filipino technology professionals.

**Through initiatives like TechX Summit, ITAP continues to champion innovation, strengthen industry-academic partnerships, and empower the next generation of technology leaders to create what’s next.**`,
    eventPhotos: [
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/techx_students.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/lahoz.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/itap_borad.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/partners.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/garcia-rama.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/szb.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/trinidad.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/pelayo.png",
      "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/TechX/event%20photos/mondejar.png"
    ]
  },
  {
    id: "12th-golf-2026",
    title: "ITAP 12th Golf Tournament: Swing for a Cause",
    date: "2026-08-03",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/12th%20ITAP%20Golf%202026.jpg",
    venue: "Sta. Elena Golf & Country Club, Sta. Rosa, Laguna",
    videoUrl: "https://www.youtube.com/watch?v=4xsEpoetelQ",
    overview: `Grounded in the spirit of purpose and partnership, "Swing for a Cause" brought together tech leaders and visionaries to turn passion into purpose. Beyond the friendly rivalry on the greens, the event highlighted the industry’s shared commitment to making a lasting impact off the course.

Event Highlights:

• The Ceremonial Drive: The energy was high from first light as key ITAP leaders officially set the event in motion at Hole #1, signaling the start of a dynamic day of competitive play and high spirits across the course.

• Driving Impact & Connection: Beyond the front and back nine, the afternoon shifted focus toward giving back—featuring key corporate social responsibility highlights from ITAP leadership and well-deserved recognition for our dedicated sponsors.

• Victories, Prizes & Celebration: The day reached a high note as champions were crowned across all categories, major raffle prizes were awarded, and participants wrapped up the occasion celebrating shared wins and lasting industry ties.`
  },
  {
    id: "1st-gmm-2026",
    title: "ITAP Sets the Pace for 2026 at Its 1st General Membership Meeting",
    date: "2026-04-28",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/1st-GMM2026.jpg",
    venue: "Manila Golf and Country Club | 2:00 PM – 5:00 PM",
    overview: `The Infocomm Technology Association of the Philippines (ITAP) successfully held its 1st General Membership Meeting for 2026, bringing together industry leaders, members, and partners to introduce its “Framework for 2026” focused on innovation, collaboration, and digital excellence.

One of the major highlights of the event was the introduction of the 2026 Board of Directors, reinforcing ITAP’s commitment to advancing the Philippine ICT industry through stronger leadership and industry collaboration.

ITAP also officially launched its newly redesigned website, providing members and partners with a more modern and integrated digital platform for updates, programs, and engagement opportunities.

Another key milestone was the presentation of the EDGE Program in partnership with Technological Institute of the Philippines. T.I.P. President Angelo Quirino Lahoz joined the ITAP Board in commemorating the initiative, which aims to strengthen collaboration between academia and the technology industry.

The event also welcomed new members into the ITAP community, including Shield Core and New York Global Consultants Inc., further expanding the organization’s growing network of technology partners.

The successful gathering highlighted ITAP’s vision of building a stronger, more connected, and future-ready Philippine tech industry.`
  },
  {
    id: "gmm-christmas-2025",
    title: "General Membership Meeting (GMM) and Christmas Party",
    date: "2025-11-19",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/itap 2025 gmm.jpg",
    venue: "East-West Room, Manila Golf and Country Club",
    overview: `Time: 10:00 AM – 3:00 PM
Theme: "Explore Forward-Looking Strategies for Digital Advancement"

The Infocomm Technology Association of the Philippines successfully concluded its General Membership Meeting (GMM) and Christmas Party on November 19, 2025, at the Manila Golf and Country Club.

Event Highlights:

Strategic Insights: Keynote speaker DICT Secretary Henry Aguda discussed national digital advancement, while Michelle Alarcon (President, AAP) presented on building a robust AI ecosystem for the future.

Governance & Growth: The event marked a pivotal moment for the organization with the election of new officers and the induction of new members, strengthening ITAP’s role as the sole Philippine partner of WITSA.

Holiday Fellowship: Members transitioned from high-level tech discussions to a festive year-end celebration, fostering community and professional networking.

Under the leadership of President Michael Ngan, the event reinforced ITAP's commitment to driving digital innovation and collaboration within the Philippine ICT sector.`
  },
  {
    id: "11th-golf-2025",
    title: "11th ITAP & Friends Golf Tournament: A Celebration of Camaraderie and Connection",
    date: "2025-06-23",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg",
    venue: "Sta. Elena Golf & Country Club, Sta. Rosa, Laguna",
    overview: `Centered around the theme "Swinging for Camaraderie and Friendship," the event was far more than a sporting competition; it was a powerful day of networking, community building, and shared passion among leaders in the ICT industry.

Event Highlights:

The Tee-Off: Players from across the industry gathered for a high-spirited start, showcasing both competitive drive and great sportsmanship.

Networking on the Green: The lush backdrop of Sta. Elena provided the perfect setting for strengthening professional bonds and forging new friendships.

Awards & Recognition: The day concluded with a heartfelt awards ceremony, celebrating the standout performances of our spirited players and acknowledging the teamwork that made the day possible.

Recap Video: https://youtu.be/EFsuvbBv8AM`
  },
  {
    id: "gmm-christmas-2024",
    title: "The ITAP GMM and Christmas Party",
    date: "2024-11-21",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/The ITAP GMM and Christmas Party.jpg",
    venue: "Manila Golf and Country Club",
    overview: "The ITAP GMM and Christmas Party on November 21 at the Manila Golf Country Club was a resounding success. We were honored to induct new members and are deeply grateful to our esteemed speakers, Paul Skaria from AMD and Ms. Abba Valbuena from Microsoft, who spoke on the future of responsible AI: Emerging Trends and Technology. A sincere thank you to all attendees and sponsors for their contributions to the success of the event."
  },
  {
    id: "dict-ilcdb-2024",
    title: "ITAP Forum Group Discussion with DICT – ILCDB",
    date: "2024-10-28",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Forum Group Discussion with DICT – ILCDB.png",
    venue: "Lenovo Office, Bonifacio Global City, Taguig",
    overview: "N/A"
  },
  {
    id: "meralco-tree-planting-2024",
    title: "ITAP Tree Planting Activity with One Meralco Foundation",
    date: "2024-09-10",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Tree Planting Activity with One Meralco Foundation.jpg",
    venue: "Siniloan Laguna",
    overview: "In partnership with One Meralco Foundation, we held a successful tree planting activity in Siniloan, Laguna, to support reforestation and environmental sustainability. Volunteers from both organizations and the IT community came together for a day focused on teamwork, environmental learning, and impactful action. The event included educational sessions on conservation, highlighting the vital role trees play in sustaining our planet. Sincere thanks to our sponsors from the IT community for making this initiative possible—together, we’re taking steps toward a greener future!"
  },
  {
    id: "1st-gmm-2024",
    title: "ITAP 1st General Membership Meeting 2024",
    date: "2024-08-16",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP 1st General Membership Meeting 2024.jpg",
    venue: "Manila Golf & Country Club",
    overview: "The first General Membership Meeting of 2024 was a resounding success. The event featured Mr. Dondi Mapa, former Deputy Privacy Commissioner of the Philippines’ National Privacy Commission (NPC) and former Commissioner for Information and Communication Technology, as the keynote speaker. Mr. Mapa delivered an insightful presentation on “Building a Culture of Responsible AI,” sharing his expertise and forward-looking perspectives on AI's role in shaping the future.\n\nThe meeting also included a live demonstration of Microsoft Copilot by the VST-ECS team, highlighting how the tool enhances productivity through seamless integration with Microsoft 365 applications. Attendees were impressed by Copilot’s ability to assist with various tasks—from drafting emails and generating reports to managing schedules—through intuitive, AI-powered interactions.\n\nSpecial thanks go out to everyone who participated and contributed to the success of this event."
  },
  {
    id: "10th-golf-2024",
    title: "10th ITAP Golf Tournament",
    date: "2024-04-29",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg",
    venue: "Sta. Elena Golf & Country Club",
    overview: "The 10th ITAP Golf Event is a prestigious gathering hosted by the Infocomm Technology Association of the Philippines (ITAP). Bringing together key players and thought leaders in the technology sector, this event serves as both a networking platform and a recreational occasion for industry influencers, executives, and ICT professionals."
  },
  {
    id: "golf-2015",
    title: "ITAP Golf Tournament 2015",
    date: "2015-06-26",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Golf Tournament 2015.jpg",
    venue: "Wack Wack Golf and Country Club (West Course)",
    overview: "This Golf Tournament is being organized not only to provide a venue for fun and networking for ITAP members and friends but also to raise funds for ITAP CSR programs.\n\nWe would like to invite you to help us make this golf tournament special while we help you in increasing exposure for your company in an ITAP event by considering being a major sponsor.\n\nYou may also participate in our golf tournament as a player! Sponsorship Package and Player Reservation form may be requested through the ITAP secretariat at secretariat@itahpil.com"
  },
  {
    id: "1st-gmm-2015",
    title: "1st General Membership Meeting",
    date: "2015-04-27",
    image: null,
    venue: "N/A",
    overview: "We are pleased to invite you to our 1st General Membership Meeting!\n\nWe have invited Honorable Mario G. Montejo, Secretary of the Department of Science and Technology as speaker and to induct the 2015 ITAP Board of Directors:\n• Yvonne Flores - President\n• Agnes Espino - Vice President\n• Sheila Arbulante- Corporate Secretary\n• Kathleen Kho - Treasurer\n• Ronnie Latinazo - Director\n• Chris Papa - Director\n• Jerry Bongco – Director"
  }
];

const EventCard: React.FC<{ event: Event, index: number, onOpen: () => void }> = ({ event, index, onOpen }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${event.id}`;
    const shareText = `Check out this ITAP event: ${event.title}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group bg-slate-900/95 rounded-[28px] overflow-hidden border border-slate-800/90 hover:border-brand-cyan/50 hover:bg-slate-900 transition-all duration-500 cursor-pointer flex flex-col h-full shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-xl"
      onClick={onOpen}
    >
      <div className="relative h-56 overflow-hidden shrink-0 bg-slate-950">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-950 flex items-center justify-center p-8">
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
              alt="ITAP Logo Placeholder" 
              className="max-h-full max-w-full object-contain opacity-20 transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center">
          <div className="bg-slate-950/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-2 border border-white/10 shadow-lg">
            <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
            {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          {event.eventPhotos && event.eventPhotos.length > 0 && (
            <div className="bg-slate-950/80 backdrop-blur-md text-brand-cyan px-2.5 py-1.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5 border border-white/10 shadow-lg">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{event.eventPhotos.length}</span>
            </div>
          )}
          {event.videoUrl && (
            <div className="bg-slate-950/80 backdrop-blur-md text-brand-cyan px-2.5 py-1.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5 border border-white/10 shadow-lg">
              <Play className="w-3 h-3 fill-brand-cyan" />
              <span>Video</span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <button 
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-white/10 hover:bg-brand-cyan hover:text-brand-ink transition-colors shadow-lg flex items-center justify-center relative"
            title="Share Event"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copied && (
              <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-7 flex flex-col flex-grow bg-slate-900/95">
        <h3 className="text-xl font-display font-bold text-white tracking-tight leading-snug mb-2.5 group-hover:text-brand-cyan transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        {event.subtitle && (
          <p className="text-xs font-mono text-slate-300 mb-4 line-clamp-2 leading-relaxed">
            {event.subtitle}
          </p>
        )}
        
        <div className="mt-auto pt-5 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-mono min-w-0">
            <MapPin className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
            <span className="truncate">{event.venue !== 'N/A' ? event.venue : 'TBA'}</span>
          </div>
          <div className="text-brand-cyan text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const ref = useRef(null);
  
  // Initial check for event id in URL
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (eventId) {
      const event = eventsData.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, []);

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setSearchParams({ id: event.id });
  };

  const handleCloseEvent = () => {
    setSelectedEvent(null);
    setSearchParams({});
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={ref} className="mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-mono uppercase tracking-[0.3em] mb-6"
          >
            ITAP Archives
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-bold text-white mb-8 tracking-tighter"
          >
            ITAP <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">EVENTS</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl text-lg leading-relaxed mx-auto"
          >
            A chronological journey through the gatherings, forums, and community initiatives that define our association's impact.
          </motion.p>
        </div>

        <motion.div style={{ y }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsData.map((event, index) => (
            <EventCard 
              key={index} 
              event={event} 
              index={index} 
              onOpen={() => handleOpenEvent(event)}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={handleCloseEvent} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
