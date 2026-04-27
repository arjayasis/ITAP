import React from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, X, ExternalLink } from 'lucide-react';

export interface Event {
  title: string;
  date: string;
  image: string | null;
  venue: string;
  overview: string;
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

export const EventModal = ({ event, onClose }: EventModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 sm:h-72 md:h-96 shrink-0">
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center p-12">
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
                alt="ITAP Logo Placeholder" 
                className="max-h-full max-w-full object-contain opacity-20"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-950/50 text-white hover:bg-brand-cyan hover:text-brand-ink transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-6">
            <div className="bg-brand-cyan text-brand-ink px-4 py-1.5 rounded-full text-sm font-mono font-bold flex items-center gap-2 shadow-lg">
              <Calendar className="w-4 h-4" />
              {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 tracking-tight leading-tight">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-5 h-5 text-brand-cyan" />
                    <span className="text-sm">{event.venue !== 'N/A' ? event.venue : 'To be announced'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-5 h-5 text-brand-cyan" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-brand-cyan font-bold">Quick Overview</h3>
                <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">
                  {event.overview !== 'N/A' ? event.overview : 'No additional details available for this event.'}
                </div>
              </div>
            </div>

            <div className="md:w-64 shrink-0 space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">Event Status</h4>
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              </div>
              <button 
                className="w-full py-4 rounded-xl bg-brand-cyan text-brand-ink font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                onClick={() => alert('Event registration is closed.')}
              >
                Inquire Details <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
