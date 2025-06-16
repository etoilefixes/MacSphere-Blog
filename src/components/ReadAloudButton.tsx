
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Speaker, PauseCircle, PlayCircle } from 'lucide-react';

interface ReadAloudButtonProps {
  textToRead: string;
}

export function ReadAloudButton({ textToRead }: ReadAloudButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const handleSpeak = () => {
    if (!speechSynthesis || !textToRead) return;

    if (speechSynthesis.speaking) {
      if (isSpeaking) { // If currently speaking this utterance, pause it
        speechSynthesis.pause();
        setIsSpeaking(false);
      } else { // If paused or speaking another utterance, cancel and start new
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToRead);
        const voices = speechSynthesis.getVoices();
        // Prefer Chinese voice if available
        let preferredVoice = voices.find(voice => voice.lang.startsWith('zh-CN') || voice.lang.startsWith('zh-HK') || voice.lang.startsWith('zh-TW'));
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => voice.name.toLowerCase().includes('siri') || voice.lang.startsWith('en-US'));
        }
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        utterance.lang = preferredVoice?.lang || 'zh-CN'; // Set lang for better pronunciation
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false); // Handle errors too
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else { // Not speaking anything, or was paused and now resuming/starting
      if (speechSynthesis.paused && isSpeaking === false) { // Resuming
         speechSynthesis.resume();
         setIsSpeaking(true);
      } else { // Starting new
        const utterance = new SpeechSynthesisUtterance(textToRead);
        const voices = speechSynthesis.getVoices();
        let preferredVoice = voices.find(voice => voice.lang.startsWith('zh-CN') || voice.lang.startsWith('zh-HK') || voice.lang.startsWith('zh-TW'));
         if (!preferredVoice) {
          preferredVoice = voices.find(voice => voice.name.toLowerCase().includes('siri') || voice.lang.startsWith('en-US'));
        }
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        utterance.lang = preferredVoice?.lang || 'zh-CN';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };
  
  useEffect(() => {
    // Cleanup: cancel speech when component unmounts or text changes
    return () => {
      if (speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [speechSynthesis, textToRead]);


  if (!speechSynthesis) {
    return <p className="text-sm text-muted-foreground">语音合成功能不可用。</p>;
  }

  return (
    <Button onClick={handleSpeak} variant="outline" className="button-spring">
      {isSpeaking && speechSynthesis?.speaking && !speechSynthesis?.paused ? <PauseCircle className="mr-2 h-5 w-5" /> : <PlayCircle className="mr-2 h-5 w-5" />}
      {isSpeaking && speechSynthesis?.speaking && !speechSynthesis?.paused ? '暂停朗读' : (speechSynthesis?.paused && !isSpeaking ? '继续朗读' : '朗读文章')}
    </Button>
  );
}
