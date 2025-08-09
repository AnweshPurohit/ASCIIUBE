
"use client";

import { useState, useEffect, useRef } from "react";
import { useAsciiTumble } from "@/hooks/use-ascii-tumble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const containerRef = useRef<HTMLPreElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [text, setText] = useState(".,-~:;=!*#$@");
  const [renderText, setRenderText] = useState(text);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const setDimensions = () => {
      const fixedWidth = 160;
      const fixedHeight = 40;
      setDims({ width: fixedWidth, height: fixedHeight });
    };
    
    setDimensions();
  }, []);

  const screen = useAsciiTumble(dims.width, dims.height, 1, renderText);

  const screenString = dims.width > 0 ? screen.reduce((acc, char, index) => {
    return acc + char + ((index + 1) % dims.width === 0 ? "\n" : "");
  }, "") : "";

  const handleRender = () => {
    setRenderText(text);
  };

  return (
    <main className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <div className={`flex-grow flex items-center justify-center transition-all duration-500 ${isFocused ? 'blur-md' : 'blur-none'}`}>
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
      </div>
      <div className="p-4">
        <div className="group w-full max-w-4xl mx-auto p-2 rounded-full flex items-center space-x-2 animate-glowing-border bg-black/10 backdrop-blur-sm border border-primary/20 opacity-50 focus-within:opacity-100 transition-all duration-300">
          <Input
            id="cube-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="ASCII field"
            className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
          />
          <Button onClick={handleRender} className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-shadow duration-300 hover:shadow-[0_0_15px_2px_hsl(var(--primary)/0.4)]">
            beep!
          </Button>
        </div>
      </div>
    </main>
  );
}
