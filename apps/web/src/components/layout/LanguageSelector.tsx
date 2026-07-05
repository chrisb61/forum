'use client';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文 (Mandarin)' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('English');

  const translate = (code: string, label: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = code === 'en' ? '' : code;
      select.dispatchEvent(new Event('change'));
    }
    setCurrent(label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-border"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => translate(code, label)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${current === label ? 'text-primary font-medium' : 'text-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
