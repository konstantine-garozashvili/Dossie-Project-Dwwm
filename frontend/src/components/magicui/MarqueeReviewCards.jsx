import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";

const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
    color: "from-green-400 to-green-500"
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
    color: "from-purple-400 to-pink-500"
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
    color: "from-pink-400 to-orange-500"
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
    color: "from-purple-500 to-indigo-500"
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
    color: "from-blue-500 to-green-500"
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({ img, name, username, body, color }) => (
  <figure
    className={cn(
      "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
      "border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10"
    )}
    onClick={(e) => {
      // Pause animation by changing parent animation-play-state
      const parent = e.currentTarget.closest('[data-marquee-container]');
      if (parent) {
        const scroller = parent.querySelector('[data-marquee-scroller]');
        if (scroller) {
          if (scroller.style.animationPlayState === 'paused') {
            scroller.style.animationPlayState = 'running';
          } else {
            scroller.style.animationPlayState = 'paused';
          }
        }
      }
    }}
  >
    <div className="flex flex-row items-center gap-2">
      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center overflow-hidden`}>
        <img className="rounded-full w-full h-full" alt="" src={img} />
      </div>
      <div className="flex flex-col">
        <figcaption className="text-sm font-medium text-white">
          {name}
        </figcaption>
        <p className="text-xs font-medium text-gray-400">{username}</p>
      </div>
    </div>
    <blockquote className="mt-2 text-sm text-gray-300">{body}</blockquote>
  </figure>
);

// Helper function to generate random gradient colors for avatars
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA69E', 
    '#9896F1', '#88D498', '#FF8C42', '#A78BFA',
    '#34D399', '#F87171', '#60A5FA', '#FBBF24'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function MarqueeReviewCards() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-6 py-8">
      <div data-marquee-container>
        <Marquee className="[--duration:40s]" data-marquee-scroller>
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
      <div data-marquee-container>
        <Marquee reverse className="[--duration:35s]" data-marquee-scroller>
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
      </div>
      {/* Fading edges for effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-transparent to-transparent"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-transparent to-transparent"></div>
    </div>
  );
} 