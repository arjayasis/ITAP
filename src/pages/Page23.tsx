import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DeckGMM2026 from './DeckGMM2026';

const Page23 = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // The upper 40% area's width
        const actualWidth = containerRef.current.offsetWidth;
        // We target a base width of 1920px for the deck content to preserve design scale
        const newScale = actualWidth / 1920;
        setScale(newScale);
      }
    };
    
    // Initial calculation
    handleResize();
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-950 overflow-hidden">
       {/* 
          Fixed 2:3 Aspect Ratio Container 
          Centered in the middle of the screen
          Occupies maximum possible space (100% of available viewport) while maintaining ratio
       */}
       <div 
         className="relative aspect-[2/3] bg-white shadow-[0_0_150px_rgba(34,211,238,0.15)] overflow-hidden flex flex-col"
         style={{ 
           width: 'min(100vw, calc(100vh * 0.6666667))',
           height: 'min(100vh, calc(100vw * 1.5))'
         }}
       >
         {/* Upper Part (Deck) - 2/5 of total height (40%) */}
         <div 
           ref={containerRef}
           className="h-[40%] w-full border-b border-slate-200 relative overflow-hidden bg-slate-50"
         >
            {/* 
              Scaling Wrapper
              Preserves the 16:9ish layout of the deck while fitting into the 5:3 container area
            */}
            <div 
              style={{
                width: '1920px',
                height: '1152px', // 40% of (1920 * 1.5)
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
               <DeckGMM2026 />
            </div>
         </div>
         
         {/* Lower Part (Logo) - 3/5 of total height (60%) */}
         <div className="h-[60%] w-full flex flex-col items-center justify-center p-6 md:p-12 bg-white relative">
            {/* Soft decorative tech-grid */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
              style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <img 
                src="https://marketing.timcorp.net.ph/hubfs/ITAP/ITAPAsset 6@4x.png" 
                alt="ITAP Logo" 
                className="max-h-[60%] max-w-[70%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-12"
                referrerPolicy="no-referrer"
              />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-8 bg-slate-200" />
                <span className="text-brand-cyan font-mono text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase">Est. 1984</span>
                <div className="h-px w-8 bg-slate-200" />
              </div>
              
              <p className="max-w-xs text-center text-slate-400 text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] leading-relaxed">
                The Prime Mover of ICT <br /> in the Philippines
              </p>
            </motion.div>
            
            {/* Bottom Accent */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent rounded-full" />
         </div>
       </div>
    </div>
  );
};

export default Page23;
