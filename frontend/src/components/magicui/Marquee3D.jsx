import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";

// Sample reviews data - creating more cards
const reviewContent = [
  {
    name: "Michel Dupont",
    username: "Chef d'Entreprise",
    body: "Ils ont sauvé mon ordinateur portable quand je pensais que toutes mes données étaient perdues. Service rapide, prix justes !",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sophie Martin",
    username: "Designer Graphique",
    body: "Je compte sur ma station de travail pour ma carrière, et leur équipe la maintient en parfait état de fonctionnement.",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "David Moreau",
    username: "Étudiant",
    body: "La réparation le jour même a sauvé mon projet final quand mon ordinateur portable a planté avant la soumission.",
    img: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    name: "Émilie Chen",
    username: "Développeuse Logiciel",
    body: "Diagnostic et réparation professionnels de mon PC sur mesure. Hautement recommandé !",
    img: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

// Generate more reviews by duplicating with small variations
const reviews = [
  ...reviewContent,
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Alexandre ${String.fromCharCode(65 + i)}`,
    body: "L'équipe a réparé mon ordinateur en un temps record. Excellent service client !",
    img: `https://randomuser.me/api/portraits/men/${20 + i}.jpg`,
  })),
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Juliette ${String.fromCharCode(69 + i)}`,
    body: "Service très professionnel. Ils ont diagnostiqué et résolu mes problèmes d'ordinateur portable rapidement.",
    img: `https://randomuser.me/api/portraits/women/${30 + i}.jpg`,
  })),
  ...reviewContent.map((review, i) => ({
    ...review,
    username: `${review.username}`,
    name: `Raphaël ${String.fromCharCode(73 + i)}`,
    body: "Service excellent ! Ils ont récupéré tous mes fichiers importants après une panne de disque dur.",
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
