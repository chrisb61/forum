'use client';

export default function VeraCharacter({ mood = 'neutral' }: { mood?: 'neutral' | 'happy' | 'thinking' }) {
  return (
    <svg
      width="130"
      height="100"
      viewBox="0 0 130 100"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-xl"
    >
      {/* ── Body lounging to the right ── */}
      <ellipse cx="88" cy="78" rx="36" ry="14" fill="#f0ede8" stroke="#c8b89a" strokeWidth="1.2" />
      <ellipse cx="88" cy="75" rx="24" ry="9" fill="#faf8f5" />

      {/* ── Tail curled up ── */}
      <path d="M118 72 Q130 62 126 54 Q122 48 116 53"
        fill="none" stroke="#e8ddd0" strokeWidth="6" strokeLinecap="round" />
      <path d="M118 72 Q130 62 126 54 Q122 48 116 53"
        fill="none" stroke="#f0ede8" strokeWidth="3.5" strokeLinecap="round" />

      {/* ── Front paws — shifted left to make room for head ── */}
      <ellipse cx="38" cy="86" rx="13" ry="7" fill="#f0ede8" stroke="#c8b89a" strokeWidth="1" />
      <ellipse cx="53" cy="88" rx="11" ry="6" fill="#f0ede8" stroke="#c8b89a" strokeWidth="1" />
      {/* Toes */}
      <ellipse cx="30" cy="89" rx="3" ry="2" fill="#e8ddd0" stroke="#c8b89a" strokeWidth="0.6" />
      <ellipse cx="36" cy="91" rx="3" ry="2" fill="#e8ddd0" stroke="#c8b89a" strokeWidth="0.6" />
      <ellipse cx="43" cy="91" rx="3" ry="2" fill="#e8ddd0" stroke="#c8b89a" strokeWidth="0.6" />

      {/* ── Left ear ── */}
      <ellipse cx="32" cy="52" rx="10" ry="20"
        fill="#e8c98a" stroke="#c8a870" strokeWidth="1.2" />
      <ellipse cx="32" cy="52" rx="6" ry="15" fill="#f0d8a0" />

      {/* ── Right ear — partially behind body, looks natural ── */}
      <ellipse cx="80" cy="52" rx="10" ry="20"
        fill="#e8c98a" stroke="#c8a870" strokeWidth="1.2" />
      <ellipse cx="80" cy="52" rx="6" ry="15" fill="#f0d8a0" />

      {/* ── Head — shifted right so it sits on the body ── */}
      <ellipse cx="56" cy="44" rx="24" ry="22"
        fill="#f0ede8" stroke="#c8b89a" strokeWidth="1.4" />

      {/* ── Muzzle ── */}
      <ellipse cx="56" cy="55" rx="14" ry="10"
        fill="#f5e8c8" stroke="#c8b89a" strokeWidth="1" />

      {/* ── Big round black nose ── */}
      <circle cx="56" cy="50" r="7" fill="#1a1a1a" />
      <circle cx="53.5" cy="47.5" r="2" fill="#444" />
      <circle cx="53" cy="47" r="1" fill="#666" />

      {/* ── Eyes symmetric around head centre x=56 ── */}
      <ellipse cx="43" cy="38" rx="8" ry="7" fill="white" stroke="#c8b89a" strokeWidth="0.8" />
      <ellipse cx="69" cy="38" rx="8" ry="7" fill="white" stroke="#c8b89a" strokeWidth="0.8" />

      <circle cx="43" cy="38" r="5" fill="#a8c8e8" />
      <circle cx="69" cy="38" r="5" fill="#a8c8e8" />

      <circle cx="43" cy="37" r="3" fill="#1a1a1a" />
      <circle cx="69" cy="37" r="3" fill="#1a1a1a" />

      <circle cx="41.5" cy="35.5" r="1.4" fill="white" />
      <circle cx="67.5" cy="35.5" r="1.4" fill="white" />

      {/* ── Heavy droopy eyelids ── */}
      {mood === 'happy' ? (
        <>
          <path d="M35 36 Q43 30 51 36" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
          <path d="M61 36 Q69 30 77 36" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <path d="M35 35 Q43 31 51 36" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
          <path d="M61 33 Q69 29 77 34" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
        </>
      ) : (
        <>
          <path d="M35 37 Q43 32 51 37" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
          <path d="M61 37 Q69 32 77 37" fill="#f0ede8" stroke="#c8b89a" strokeWidth="0.8" />
        </>
      )}

      {/* ── Eyelashes ── */}
      <line x1="36" y1="33" x2="34" y2="30" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="40" y1="31" x2="39" y2="28" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="45" y1="30" x2="45" y2="27" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="31" x2="51" y2="28" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />

      <line x1="62" y1="33" x2="61" y2="30" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="66" y1="31" x2="65" y2="28" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="71" y1="30" x2="71" y2="27" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="76" y1="31" x2="77" y2="28" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />

      {/* ── Mouth ── */}
      {mood === 'happy' ? (
        <path d="M46 62 Q56 69 66 62" stroke="#c8a870" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M47 62 Q51 65 56 64 Q61 65 65 62"
          stroke="#c8a870" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}

      {/* ── Teal hair tuft ── */}
      <path d="M49 22 Q47 10 52 6 Q54 13 57 8 Q59 14 63 9 Q62 17 66 14 Q64 21 59 20"
        fill="#2dd4bf" stroke="#1aaa99" strokeWidth="0.8" />
      <path d="M51 21 Q50 13 54 9 Q56 15 59 11 Q60 17 63 14 Q62 20 57 20"
        fill="#4de8d4" />

      {/* ── Teal bow ── */}
      <path d="M51 19 Q45 13 48 19 Q50 22 52 20" fill="#2dd4bf" stroke="#1aaa99" strokeWidth="0.8" />
      <path d="M59 19 Q65 13 62 19 Q60 22 58 20" fill="#2dd4bf" stroke="#1aaa99" strokeWidth="0.8" />
      <circle cx="55" cy="19" r="3" fill="#2dd4bf" stroke="#1aaa99" strokeWidth="0.8" />
      <circle cx="55" cy="19" r="1.5" fill="#1aaa99" />

      {/* ── Blush ── */}
      <ellipse cx="34" cy="50" rx="4" ry="2.5" fill="#ffb8b8" fillOpacity="0.4" />
      <ellipse cx="78" cy="50" rx="4" ry="2.5" fill="#ffb8b8" fillOpacity="0.4" />
    </svg>
  );
}
