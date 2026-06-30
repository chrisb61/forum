'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import VeraCharacter from './VeraCharacter';

type Mood = 'neutral' | 'happy' | 'thinking';

interface VeraMessage {
  text: string;
  mood: Mood;
  action?: { label: string; href: string };
}

const PAGE_SCRIPTS: Record<string, VeraMessage[]> = {
  '/': [
    {
      text: "Hello! I'm Vera — your guide to the ESG Intelligence Network. Welcome.",
      mood: 'happy',
    },
    {
      text: "This platform is built for non-executive directors, board advisors, and ESG professionals.",
      mood: 'neutral',
    },
    {
      text: "Click 'Enter the Network' to explore the community, or let me show you around first.",
      mood: 'neutral',
      action: { label: 'Show me the guide', href: '/guide' },
    },
  ],
  '/guide': [
    {
      text: "Great — you've found the guide! I helped write it.",
      mood: 'happy',
    },
    {
      text: "Start by creating your account. Your profile becomes your professional reputation record.",
      mood: 'neutral',
      action: { label: 'Register', href: '/register' },
    },
    {
      text: "Every post you make, every reaction you receive — it all builds your reputation score.",
      mood: 'thinking',
    },
    {
      text: "The platform is growing fast. Check the roadmap at the bottom of this page to see what's coming.",
      mood: 'neutral',
    },
  ],
  '/leaderboard': [
    {
      text: "This is the leaderboard — the most respected voices in the network.",
      mood: 'neutral',
    },
    {
      text: "Reputation is earned through quality contributions: posts, threads, and peer reactions.",
      mood: 'thinking',
    },
    {
      text: "From Newcomer all the way to Luminary — where will you land?",
      mood: 'happy',
    },
  ],
  '/forums': [
    {
      text: "These are the community forums — structured by professional discipline.",
      mood: 'neutral',
    },
    {
      text: "Join a discussion, start a thread, or ask a question. Every contribution counts.",
      mood: 'happy',
    },
  ],
  '/register': [
    {
      text: "Excellent — you're joining the network! Fill in your details below.",
      mood: 'happy',
    },
    {
      text: "Use your professional email. Your profile will grow with every contribution you make.",
      mood: 'neutral',
    },
  ],
  '/login': [
    {
      text: "Welcome back! Sign in to continue building your professional record.",
      mood: 'happy',
    },
  ],
};

const DEFAULT_MESSAGES: VeraMessage[] = [
  {
    text: "I'm Vera — need help navigating? Visit the guide anytime.",
    mood: 'neutral',
    action: { label: 'Open guide', href: '/guide' },
  },
];

const STORAGE_KEY = 'vera-dismissed-pages';
const VOICE_KEY = 'vera-voice-enabled';

function pickFemaleVoice(voices: SpeechSynthesisVoice[]) {
  return voices.find(v =>
    v.name.toLowerCase().includes('female') ||
    v.name.includes('Zira') ||
    v.name.includes('Eva') ||
    v.name.includes('Hazel') ||
    v.name.includes('Susan') ||
    v.name.includes('Hedda') ||
    v.name.includes('Samantha') ||
    v.name.includes('Victoria') ||
    v.name.includes('Karen') ||
    v.name.includes('Moira') ||
    v.name.includes('Tessa') ||
    v.name.includes('Veena') ||
    v.name.includes('Fiona')
  );
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.92;
  utter.pitch = 1.15;
  utter.volume = 0.9;

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const female = pickFemaleVoice(voices);
    if (female) utter.voice = female;
    window.speechSynthesis.speak(utter);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
  }
}

export default function Vera() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const messages = PAGE_SCRIPTS[pathname] ?? DEFAULT_MESSAGES;
  const current = messages[step] ?? messages[0];

  const getDismissed = useCallback((): string[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); } catch { return []; }
  }, []);

  useEffect(() => {
    try { setVoiceOn(localStorage.getItem(VOICE_KEY) === 'true'); } catch {}
  }, []);

  useEffect(() => {
    setStep(0);
    setMinimised(false);
    window.speechSynthesis?.cancel();
    const dismissed = getDismissed();
    if (pathname === '/' || !dismissed.includes(pathname)) {
      const timer = setTimeout(() => { setVisible(true); setPulse(true); }, 1200);
      return () => clearTimeout(timer);
    }
  }, [pathname, getDismissed]);

  useEffect(() => {
    if (pulse) {
      const t = setTimeout(() => setPulse(false), 2000);
      return () => clearTimeout(t);
    }
  }, [pulse]);

  const dismiss = () => {
    setVisible(false);
    const dismissed = getDismissed();
    if (!dismissed.includes(pathname)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed, pathname]));
    }
  };

  const minimise = () => setMinimised(true);
  const expand = () => { setMinimised(false); setPulse(false); };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    try { localStorage.setItem(VOICE_KEY, String(next)); } catch {}
    if (next) speak(current.text);
    else window.speechSynthesis?.cancel();
  };

  const next = () => {
    if (step < messages.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        const nextStep = step + 1;
        setStep(nextStep);
        setAnimating(false);
        if (voiceOn) speak(messages[nextStep].text);
      }, 150);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        const prevStep = step - 1;
        setStep(prevStep);
        setAnimating(false);
        if (voiceOn) speak(messages[prevStep].text);
      }, 150);
    }
  };

  // Speak when Vera first appears
  useEffect(() => {
    if (visible && !minimised && voiceOn) speak(current.text);
  }, [visible]); // eslint-disable-line

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Speech bubble */}
      {!minimised && (
        <div
          className={`bg-card border border-primary/40 rounded-2xl rounded-br-sm shadow-2xl p-4 max-w-xs w-72 transition-all duration-200 ${
            animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">Vera</span>
            <div className="flex gap-1 items-center">
              <button
                onClick={toggleVoice}
                className={`transition-colors p-0.5 rounded ${voiceOn ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label={voiceOn ? 'Mute Vera' : 'Unmute Vera'}
                title={voiceOn ? 'Voice on — click to mute' : 'Click to hear Vera'}
              >
                {voiceOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={minimise}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                aria-label="Minimise"
              >
                <span className="text-xs leading-none">—</span>
              </button>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm leading-relaxed text-foreground mb-3">{current.text}</p>

          {/* Action button */}
          {current.action && (
            <a
              href={current.action.href}
              className="inline-block text-xs font-semibold text-primary border border-primary/40 rounded-full px-3 py-1 hover:bg-primary/10 transition-colors mb-3"
            >
              {current.action.label}
            </a>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {messages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === step ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="p-1 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {step < messages.length - 1 ? (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                ) : (
                  'Done ✓'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vera avatar button */}
      <button
        onClick={minimised ? expand : minimise}
        className="relative focus:outline-none group"
        aria-label={minimised ? 'Open Vera' : 'Minimise Vera'}
      >
        {/* Pulse ring when first appearing */}
        {pulse && (
          <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-60" />
        )}
        <div className="transition-transform duration-200 group-hover:scale-105">
          <VeraCharacter mood={current.mood} />
        </div>
        {minimised && (
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-primary rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

    </div>
  );
}
