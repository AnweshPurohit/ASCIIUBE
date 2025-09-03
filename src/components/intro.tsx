
"use client";

import { useState, useEffect } from 'react';

const TypingAnimation = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 50); 
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span className="text-xl font-body">{displayText}</span>;
};

const DeletingAnimation = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
    const [displayText, setDisplayText] = useState(text);
    
    useEffect(() => {
      let currentIndex = text.length;
      const interval = setInterval(() => {
        if (currentIndex >= 0) {
          setDisplayText(text.substring(0, currentIndex));
          currentIndex--;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 50);
        }
      }, 30);
  
      return () => clearInterval(interval);
    }, [text, onComplete]);
  
    return <span className="text-xl font-body">{displayText}</span>;
  };

const Intro = ({ onFinished }: { onFinished: () => void }) => {
  const [step, setStep] = useState(0);

  const handleStepComplete = () => {
    setStep(prev => prev + 1);
  };

  useEffect(() => {
    if (step === 3) {
        setTimeout(onFinished, 50);
    }
  }, [step, onFinished]);

  return (
    <div className="flex items-center justify-center h-screen bg-background text-primary">
      {step === 0 && <TypingAnimation text="ASCIIUBE" onComplete={handleStepComplete} />}
      {step === 1 && <DeletingAnimation text="ASCIIUBE" onComplete={handleStepComplete} />}
      {step === 2 && <TypingAnimation text="Hello there!" onComplete={handleStepComplete} />}
    </div>
  );
};

export default Intro;
