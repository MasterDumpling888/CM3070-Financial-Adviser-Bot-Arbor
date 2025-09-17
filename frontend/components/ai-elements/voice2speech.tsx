'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, MicOff, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceInputButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscription, disabled }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true); // Assume supported initially
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [fallbackEnabled, setFallbackEnabled] = useState(false);

  // After a certain number of network errors, offer a fallback
  useEffect(() => {
    if (error === 'network') {
      // After 2 network errors, suggest fallback
      const networkErrorCount = localStorage.getItem('networkErrorCount') || 0;
      const newCount = parseInt(networkErrorCount) + 1;
      localStorage.setItem('networkErrorCount', newCount.toString());
      
      if (newCount >= 2) {
        toast("Voice Input Unavailable",{
          description: "Using alternative method. Voice accuracy may be reduced.",
        });
        setFallbackEnabled(true);
      }
    }
  }, [error]);

  useEffect(() => {
    const checkSupport = () => {
      try {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          setIsSupported(false);
          setError('Browser not supported');
          return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          onTranscription(transcript);
          setIsListening(false);
          setError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          let errorMessage = 'Speech recognition error';
          switch (event.error) {
            case 'network':
              errorMessage = 'Network connection failed. Please check your internet connection.';
              break;
            case 'not-allowed':
              errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
              break;
            case 'audio-capture':
              errorMessage = 'No microphone found or microphone not working.';
              break;
            default:
              errorMessage = `Error: ${event.error}`;
          }
          
          setError(errorMessage);
          toast(
            "Speech Recognition Error",
            { 
              description: errorMessage,
              action: {
                label: "Ok",
                onClick: () => console.log("Exited toast"),
              },
            }
          );
        };

        recognitionRef.current = recognition;
        setIsSupported(true);
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err);
        setIsSupported(false);
        setError('Failed to initialize speech recognition');
      }
    };

    checkSupport();

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription]);

  const checkMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      toast("Microphone Access Required",{
        description: "Please allow microphone access to use voice input",
      });
      return false;
    }
  };

  const startListening = async () => {
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to start listening');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  };

  // Show different states based on support and errors
  if (!isSupported) {
    return (
      <Button type="button" variant="outline" size="icon" disabled title="Speech recognition not supported">
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  if (error?.includes('Network')) {
    return (
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        onClick={startListening}
        disabled
        title="Network error - Click to retry"
      >
        <WifiOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={isListening ? stopListening : startListening}
      disabled={disabled || !isSupported}
      title={isListening ? "Stop listening" : "Start voice input"}
      className='drop-shadow-none'
    >
      {isListening ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
