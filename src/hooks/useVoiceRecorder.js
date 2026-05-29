import { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const phrases = [
  "Escuchando",
  "Me quedan 5 latas de atún Gomes da Costa...",
  "Me quedan 5 latas de atún Gomes da Costa, 3 kilos de arroz Gallo...",
  "Me quedan 5 latas de atún Gomes da Costa, 3 kilos de arroz Gallo doble, y 2 paquetes de servilletas Elite blancas grandes.",
];

const updates = [
  { id: 'atun-gomes', stock: 5 },
  { id: 'arroz-gallo', stock: 3 },
  { id: 'servilletas-elite', stock: 2 },
];

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);
  const { applyVoiceUpdate } = useApp();

  const stop = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRecording(false);
  }, []);

  const start = useCallback(() => {
    if (recording) {
      stop();
      setTranscript('');
      setDone(false);
      return;
    }
    setRecording(true);
    setDone(false);
    setTranscript('');

    phrases.forEach((phrase, i) => {
      const t = setTimeout(() => setTranscript(phrase), 600 + i * 1100);
      timersRef.current.push(t);
    });

    const finalT = setTimeout(() => {
      setDone(true);
      setRecording(false);
      applyVoiceUpdate(updates);
    }, 600 + phrases.length * 1100);
    timersRef.current.push(finalT);
  }, [recording, stop, applyVoiceUpdate]);

  return { recording, transcript, done, toggle: start, updates };
}
