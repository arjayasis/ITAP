import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Calendar, MapPin, Image as ImageIcon, Clock, X, ExternalLink } from 'lucide-react';
import { Event, EventModal } from '../components/EventModal';

const eventsData: Event[] = [
  {
    title: "General Membership Meeting (GMM) and Christmas Party",
    date: "2025-11-19",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/itap 2025 gmm.jpg",
    venue: "East-West Room, Manila Golf and Country Club",
    overview: `Time: 10:00 AM – 3:00 PM
Theme: "Explore Forward-Looking Strategies for Digital Advancement"

The ITAP Convergence Alliance Inc. successfully concluded its General Membership Meeting (GMM) and Christmas Party on November 19, 2025, at the Manila Golf and Country Club.

Event Highlights:

Strategic Insights: Keynote speaker DICT Secretary Henry Aguda discussed national digital advancement, while Michelle Alarcon (President, AAP) presented on building a robust AI ecosystem for the future.

Governance & Growth: The event marked a pivotal moment for the organization with the election of new officers and the induction of new members, strengthening ITAP’s role as the sole Philippine partner of WITSA.

Holiday Fellowship: Members transitioned from high-level tech discussions to a festive year-end celebration, fostering community and professional networking.

Under the leadership of President Michael Ngan, the event reinforced ITAP's commitment to driving digital innovation and collaboration within the Philippine ICT sector.`
  },
  {
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
    title: "The ITAP GMM and Christmas Party",
    date: "2024-11-21",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/The ITAP GMM and Christmas Party.jpg",
    venue: "Manila Golf and Country Club",
    overview: "The ITAP GMM and Christmas Party on November 21 at the Manila Golf Country Club was a resounding success. We were honored to induct new members and are deeply grateful to our esteemed speakers, Paul Skaria from AMD and Ms. Abba Valbuena from Microsoft, who spoke on the future of responsible AI: Emerging Trends and Technology. A sincere thank you to all attendees and sponsors for their contributions to the success of the event."
  },
  {
    title: "ITAP Forum Group Discussion with DICT – ILCDB",
    date: "2024-10-28",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Forum Group Discussion with DICT – ILCDB.png",
    venue: "Lenovo Office, Bonifacio Global City, Taguig",
    overview: "N/A"
  },
  {
    title: "ITAP Tree Planting Activity with One Meralco Foundation",
    date: "2024-09-10",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Tree Planting Activity with One Meralco Foundation.jpg",
    venue: "Siniloan Laguna",
    overview: "In partnership with One Meralco Foundation, we held a successful tree planting activity in Siniloan, Laguna, to support reforestation and environmental sustainability. Volunteers from both organizations and the IT community came together for a day focused on teamwork, environmental learning, and impactful action. The event included educational sessions on conservation, highlighting the vital role trees play in sustaining our planet. Sincere thanks to our sponsors from the IT community for making this initiative possible—together, we’re taking steps toward a greener future!"
  },
  {
    title: "ITAP 1st General Membership Meeting 2024",
    date: "2024-08-16",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP 1st General Membership Meeting 2024.jpg",
    venue: "Manila Golf & Country Club",
    overview: "The first General Membership Meeting of 2024 was a resounding success. The event featured Mr. Dondi Mapa, former Deputy Privacy Commissioner of the Philippines’ National Privacy Commission (NPC) and former Commissioner for Information and Communication Technology, as the keynote speaker. Mr. Mapa delivered an insightful presentation on “Building a Culture of Responsible AI,” sharing his expertise and forward-looking perspectives on AI's role in shaping the future.\n\nThe meeting also included a live demonstration of Microsoft Copilot by the VST-ECS team, highlighting how the tool enhances productivity through seamless integration with Microsoft 365 applications. Attendees were impressed by Copilot’s ability to assist with various tasks—from drafting emails and generating reports to managing schedules—through intuitive, AI-powered interactions.\n\nSpecial thanks go out to everyone who participated and contributed to the success of this event."
  },
  {
    title: "10th ITAP Golf Tournament",
    date: "2024-04-29",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/10th ITAP Golf Tournament.jpg",
    venue: "Sta. Elena Golf & Country Club",
    overview: "The 10th ITAP Golf Event is a prestigious gathering hosted by the Infocomm Technology Association of the Philippines (ITAP). Bringing together key players and thought leaders in the technology sector, this event serves as both a networking platform and a recreational occasion for industry influencers, executives, and ICT professionals."
  },
  {
    title: "ITAP Golf Tournament 2015",
    date: "2015-06-26",
    image: "https://marketing.timcorp.net.ph/hubfs/ITAP/itap%20events/ITAP Golf Tournament 2015.jpg",
    venue: "Wack Wack Golf and Country Club (West Course)",
    overview: "This Golf Tournament is being organized not only to provide a venue for fun and networking for ITAP members and friends but also to raise funds for ITAP CSR programs.\n\nWe would like to invite you to help us make this golf tournament special while we help you in increasing exposure for your company in an ITAP event by considering being a major sponsor.\n\nYou may also participate in our golf tournament as a player! Sponsorship Package and Player Reservation form may be requested through the ITAP secretariat at secretariat@itahpil.com"
  },
  {
    title: "1st General Membership Meeting",
    date: "2015-04-27",
    image: null,
    venue: "N/A",
    overview: "We are pleased to invite you to our 1st General Membership Meeting!\n\nWe have invited Honorable Mario G. Montejo, Secretary of the Department of Science and Technology as speaker and to induct the 2015 ITAP Board of Directors:\n• Yvonne Flores - President\n• Agnes Espino - Vice President\n• Sheila Arbulante- Corporate Secretary\n• Kathleen Kho - Treasurer\n• Ronnie Latinazo - Director\n• Chris Papa - Director\n• Jerry Bongco – Director"
  }
];

const EventCard: React.FC<{ event: Event, index: number, onOpen: () => void }> = ({ event, index, onOpen }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group glass rounded-[32px] overflow-hidden border-white/10 hover:border-brand-cyan/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
      onClick={onOpen}
    >
      <div className="relative h-56 overflow-hidden shrink-0">
        {event.image ? (
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-950 flex items-center justify-center p-8">
            <img 
              src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
              alt="ITAP Logo Placeholder" 
              className="max-h-full max-w-full object-contain opacity-20 transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4">
          <div className="bg-slate-950/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-2 border border-white/10">
            <Calendar className="w-3 h-3 text-brand-cyan" />
            {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-display font-bold text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-brand-cyan transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">{event.venue !== 'N/A' ? event.venue : 'TBA'}</span>
          </div>
          <div className="text-brand-cyan text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            View Details
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const ref = useRef(null);
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
              onOpen={() => setSelectedEvent(event)}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
