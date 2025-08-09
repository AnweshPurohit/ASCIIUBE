
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
      const fixedWidth = 180;
      const fixedHeight = 50;
      setDims({ width: fixedWidth, height: fixedHeight });
    };
    
    setDimensions();
    // No resize listener to keep it simple and performant
  }, []);


  const screen = useAsciiTumble(dims.width, dims.height, 1); // Render 1 cube

  const screenString = dims.width > 0 ? screen.reduce((acc, char, index) => {
    return acc + char + ((index + 1) % dims.width === 0 ? "\n" : "");
  }, "") : "";

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4 overflow-hidden">
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
