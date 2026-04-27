import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import DeckGMM2026 from './DeckGMM2026';

const PageVerticalDeck = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Design width for vertical 2:3 ratio
        const designWidth = 1080;
        const actualWidth = containerRef.current.offsetWidth;
        const newScale = actualWidth / designWidth;
        setScale(newScale);
      }
    };
    
    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-slate-950 overflow-hidden">
       {/* 2:3 Aspect Ratio Container */}
       <div 
         className="relative aspect-[2/3] bg-white shadow-[0_0_150px_rgba(34,211,238,0.2)] overflow-hidden"
         style={{ 
           width: 'min(100vw, calc(100vh * 0.6666667))',
           height: 'min(100vh, calc(100vw * 1.5))'
         }}
       >
          <div 
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
          >
             {/* 
               Scaling Wrapper for Vertical Presentation
               Design dimensions: 1080x1620 (2:3)
             */}
             <div 
               style={{
                 width: '1080px',
                 height: '1620px',
                 transform: `scale(${scale})`,
                 transformOrigin: 'top left',
                 position: 'absolute',
                 top: 0,
                 left: 0
               }}
             >
                <DeckGMM2026 isPortrait={true} />
             </div>
          </div>
       </div>
    </div>
  );
};

export default PageVerticalDeck;
