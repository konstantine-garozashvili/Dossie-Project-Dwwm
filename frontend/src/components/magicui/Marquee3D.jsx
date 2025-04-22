import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";

// Sample reviews data - creating more cards
const reviewContent = [
  {
    name: "Michael Johnson",
    username: "Business Owner",
    body: "They saved my laptop when I thought all my data was lost. Fast service, fair prices!",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sarah Thompson",
    username: "Graphic Designer",
    body: "I rely on my workstation for my career, and their team keeps it running flawlessly.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "David Rodriguez",
    username: "Student",
    body: "Same-day repair saved my final project when my laptop crashed before submission.",
    img: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    name: "Emily Chen",
    username: "Software Developer",
    body: "Professional diagnosis and repair of my custom PC build. Highly recommended!",
    img: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

// Generate more reviews by duplicating with small variations
const reviews = [
  ...reviewContent,
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Alex ${String.fromCharCode(65 + i)}`,
    body: "The team fixed my computer in record time. Great customer service!",
    img: `https://randomuser.me/api/portraits/men/${20 + i}.jpg`,
  })),
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Jessica ${String.fromCharCode(69 + i)}`,
    body: "Very professional service. They diagnosed and fixed my laptop issues quickly.",
    img: `https://randomuser.me/api/portraits/women/${30 + i}.jpg`,
  })),
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Ryan ${String.fromCharCode(73 + i)}`,
    body: "Excellent service! They recovered all my important files after a hard drive failure.",
    img: `https://randomuser.me/api/portraits/men/${40 + i}.jpg`,
  })),
];

// Create columns with different cards for variety
const firstColumn = reviews.slice(0, 8);
const secondColumn = reviews.slice(8, 16);
const thirdColumn = reviews.slice(4, 12);

// Review card component with larger size
const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure
      className={cn(
        "relative w-64 min-w-64 max-w-64 cursor-pointer overflow-hidden rounded-xl border border-slate-700/20 p-5 mb-5",
        "bg-[#111827]/80 shadow-lg",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img 
          className="rounded-full w-10 h-10" 
          width="40" 
          height="40" 
          alt="" 
          src={img} 
          loading="lazy"
        />
        <div className="flex flex-col">
          <figcaption className="text-base font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-cyan-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed text-gray-300">{body}</blockquote>
    </figure>
  );
};

// Main component with enhanced 3D transformation
export function Marquee3D() {
  // Use the same animation duration for all columns
  const animationDuration = "25s";
  
  return (
    <div className="relative flex h-[600px] w-full flex-row items-center justify-center overflow-hidden" 
         style={{ perspective: "400px" }}>
      <div
        className="absolute flex flex-row items-center gap-6 h-full"
        style={{
          transform: "translateX(-70px) translateY(0px) translateZ(-100px) rotateX(20deg) rotateY(-15deg) rotateZ(5deg)",
          transformOrigin: "center center",
          left: "0",
          right: "0",
          height: "100%",
        }}
      >
        <Marquee 
          pauseOnHover 
          vertical 
          className="h-full optimized-animation" 
          style={{ animationDuration }}
        >
          {firstColumn.map((review, idx) => (
            <ReviewCard key={`${review.username}-1-${idx}`} {...review} />
          ))}
        </Marquee>
        
        <Marquee 
          reverse 
          pauseOnHover 
          vertical 
          className="h-full optimized-animation" 
          style={{ animationDuration: "28s" }}
        >
          {secondColumn.map((review, idx) => (
            <ReviewCard key={`${review.username}-2-${idx}`} {...review} />
          ))}
        </Marquee>
        
        <Marquee 
          pauseOnHover 
          vertical 
          className="h-full optimized-animation" 
          style={{ animationDuration: "22s" }}
        >
          {thirdColumn.map((review, idx) => (
            <ReviewCard key={`${review.username}-3-${idx}`} {...review} />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
