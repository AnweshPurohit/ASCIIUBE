
"use client";

import { useState, useEffect, useRef } from "react";
import { useAsciiTumble } from "@/hooks/use-ascii-tumble";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Home() {
  const containerRef = useRef<HTMLPreElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [text, setText] = useState(".,-~:;=!*#$@");
  const [renderText, setRenderText] = useState(text);

  useEffect(() => {
    const setDimensions = () => {
      const fixedWidth = 180;
      const fixedHeight = 50;
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
    <main className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4 py-8 overflow-hidden">
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
      <div className="w-full max-w-md mt-8 space-y-4">
        <Label htmlFor="cube-text">Text to build the cube</Label>
        <Textarea
          id="cube-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here to build the cube..."
          className="bg-background"
        />
        <Button onClick={handleRender} className="w-full">
          Render Cube
        </Button>
      </div>
    </main>
  );
}
