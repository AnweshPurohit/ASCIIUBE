"use client";

import { useState, useEffect, useRef } from "react";
import { useAsciiTumble } from "@/hooks/use-ascii-tumble";

export default function Home() {
  const containerRef = useRef<HTMLPreElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const setDimensions = () => {
      // Set fixed dimensions for the ASCII art canvas
      // A responsive grid is complex, so we use a large fixed size
      // that works well on most desktop screens.
      const fixedWidth = 140;
      const fixedHeight = 50;
      setDims({ width: fixedWidth, height: fixedHeight });
    };
    
    setDimensions();
    // No resize listener to keep it simple and performant
  }, []);


  const screen = useAsciiTumble(dims.width, dims.height, 7); // Render 7 cubes

  const screenString = dims.width > 0 ? screen.reduce((acc, char, index) => {
    return acc + char + ((index + 1) % dims.width === 0 ? "\n" : "");
  }, "") : "";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <div className="text-center mb-6">
        <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary mb-2 tracking-wider">
          Turing Tumble
        </h1>
        <p className="text-accent text-sm md:text-base font-code">
          An ASCII art 3D cube rendering experiment
        </p>
      </div>
      <div className="w-full flex justify-center">
        {dims.width > 0 && (
          <pre
            ref={containerRef}
            className="font-code text-primary leading-tight text-center text-[10px] sm:text-[12px] md:text-[14px]"
            style={{ width: `${dims.width}ch`, height: `${dims.height}em`}}
          >
            {screenString}
          </pre>
        )}
      </div>
    </main>
  );
}
