'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 컴포넌트 언마운트 시 음성 중단
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 기존 음성 중단
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // 한국어 음성 자동 선택
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith('ko'));
    if (koVoice) utterance.voice = koVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const toggle = useCallback(
    (text: string) => {
      if (isSpeaking) {
        stop();
      } else {
        speak(text);
      }
    },
    [isSpeaking, speak, stop],
  );

  return { speak, stop, toggle, isSpeaking };
}
