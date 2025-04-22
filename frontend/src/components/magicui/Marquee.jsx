import React, { useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";

export const Marquee = memo(React.forwardRef(
  (
    {
      className,
      reverse,
      pauseOnHover = false,
      vertical = false,
      gap = "4px",
      style = {},
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const scrollerRef = useRef(null);
    
    useEffect(() => {
      if (!scrollerRef.current || !containerRef.current) return;
      
      try {
        // Clone children to create smooth looping effect
        const childNodes = Array.from(scrollerRef.current.children);
        if (childNodes.length === 0) return;
        
        // Clone a few items for the loop effect
        childNodes.slice(0, Math.min(2, childNodes.length)).forEach((item) => {
          const clone = item.cloneNode(true);
          scrollerRef.current.appendChild(clone);
        });
        
        // Add pauseOnHover functionality
        if (pauseOnHover && containerRef.current) {
          const handlePause = () => {
            scrollerRef.current.style.animationPlayState = 'paused';
          };
          
          const handlePlay = () => {
            scrollerRef.current.style.animationPlayState = 'running';
          };
          
          containerRef.current.addEventListener('mouseenter', handlePause);
          containerRef.current.addEventListener('mouseleave', handlePlay);
          
          return () => {
            containerRef.current?.removeEventListener('mouseenter', handlePause);
            containerRef.current?.removeEventListener('mouseleave', handlePlay);
          };
        }
      } catch (e) {
        console.warn('Animation setup error', e);
      }
    }, [pauseOnHover]);

    return (
      <div
        ref={containerRef}
        className={cn(
          "scroller relative z-10 flex overflow-hidden",
          vertical ? "h-full flex-col" : "w-full flex-row",
          className
        )}
        style={{
          boxSizing: "border-box",
          maxWidth: "100%",
          overflow: "hidden",
          ...props.style
        }}
        {...props}
      >
        <div
          ref={scrollerRef}
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap,
            padding: vertical ? '0 4px' : '4px 0',
            flexShrink: 0,
            animation: `${vertical ? 'scroll-vertical' : 'scroll'} ${style.animationDuration || '20s'} linear infinite ${reverse ? 'reverse' : 'normal'}`,
            transform: 'translateZ(0)',
            ...style
          }}
        >
          {children}
        </div>
      </div>
    );
  }
));

Marquee.displayName = "Marquee";

// Add this to your tailwind.config.js for animation:
// theme: {
//   extend: {
//     keyframes: {
//       marquee: {
//         '0%': { transform: 'translateX(0%)' },
//         '100%': { transform: 'translateX(-100%)' },
//       },
//     },
//     animation: {
//       marquee: 'marquee 10s linear infinite',
//     },
//   },
// }, 