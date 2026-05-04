export interface VisemeData {
  phoneme: string;
  jawPosition: number;
  mouthWidth: number;
  lipRounding: number;
  duration: number;
}

export interface PhonemeData {
  phoneme: string;
  startTime: number; // absolute start time in ms
  duration: number;
  viseme: VisemeData;
}

export interface LipSyncResult {
  phonemes: PhonemeData[];
  totalDuration: number;
}

const VISEME_MAP: Record<string, VisemeData> = {
  'a': { phoneme: 'a', jawPosition: 0.8, mouthWidth: 0.9, lipRounding: 0.3, duration: 150 },
  'e': { phoneme: 'e', jawPosition: 0.6, mouthWidth: 0.8, lipRounding: 0.2, duration: 140 },
  'i': { phoneme: 'i', jawPosition: 0.4, mouthWidth: 0.6, lipRounding: 0.1, duration: 130 },
  'o': { phoneme: 'o', jawPosition: 0.7, mouthWidth: 0.7, lipRounding: 0.8, duration: 150 },
  'u': { phoneme: 'u', jawPosition: 0.5, mouthWidth: 0.5, lipRounding: 0.9, duration: 140 },
  'b': { phoneme: 'b', jawPosition: 0.1, mouthWidth: 0.3, lipRounding: 0.5, duration: 100 },
  'p': { phoneme: 'p', jawPosition: 0.1, mouthWidth: 0.3, lipRounding: 0.5, duration: 100 },
  'm': { phoneme: 'm', jawPosition: 0.2, mouthWidth: 0.4, lipRounding: 0.6, duration: 120 },
  'f': { phoneme: 'f', jawPosition: 0.3, mouthWidth: 0.2, lipRounding: 0.1, duration: 110 },
  'v': { phoneme: 'v', jawPosition: 0.3, mouthWidth: 0.3, lipRounding: 0.2, duration: 110 },
  's': { phoneme: 's', jawPosition: 0.2, mouthWidth: 0.1, lipRounding: 0.0, duration: 100 },
  'z': { phoneme: 'z', jawPosition: 0.2, mouthWidth: 0.2, lipRounding: 0.1, duration: 100 },
  't': { phoneme: 't', jawPosition: 0.1, mouthWidth: 0.2, lipRounding: 0.0, duration: 90 },
  'd': { phoneme: 'd', jawPosition: 0.1, mouthWidth: 0.3, lipRounding: 0.1, duration: 90 },
  'k': { phoneme: 'k', jawPosition: 0.1, mouthWidth: 0.2, lipRounding: 0.0, duration: 100 },
  'g': { phoneme: 'g', jawPosition: 0.1, mouthWidth: 0.3, lipRounding: 0.1, duration: 100 },
  'h': { phoneme: 'h', jawPosition: 0.3, mouthWidth: 0.4, lipRounding: 0.2, duration: 110 },
  'l': { phoneme: 'l', jawPosition: 0.4, mouthWidth: 0.5, lipRounding: 0.3, duration: 120 },
  'r': { phoneme: 'r', jawPosition: 0.3, mouthWidth: 0.4, lipRounding: 0.4, duration: 110 },
  'w': { phoneme: 'w', jawPosition: 0.5, mouthWidth: 0.6, lipRounding: 0.7, duration: 130 },
  'y': { phoneme: 'y', jawPosition: 0.4, mouthWidth: 0.5, lipRounding: 0.6, duration: 120 },
  'default': { phoneme: 'default', jawPosition: 0.1, mouthWidth: 0.3, lipRounding: 0.2, duration: 100 },
};

function extractPhonemes(text: string): PhonemeData[] {
  const phonemes: PhonemeData[] = [];
  const words = text.toLowerCase().split(' ');
  let cursor = 0;

  words.forEach((word, wordIndex) => {
    word.split('').forEach((char, charIndex) => {
      const viseme = VISEME_MAP[char] ?? VISEME_MAP['default'];
      phonemes.push({
        phoneme: char,
        startTime: cursor,
        duration: viseme.duration,
        viseme,
      });
      cursor += viseme.duration;

      // Small inter-character gap
      if (charIndex < word.length - 1) {
        phonemes.push({
          phoneme: 'pause',
          startTime: cursor,
          duration: 30,
          viseme: { ...VISEME_MAP['default'], phoneme: 'pause', jawPosition: 0 },
        });
        cursor += 30;
      }
    });

    // Inter-word gap
    if (wordIndex < words.length - 1) {
      phonemes.push({
        phoneme: 'word_pause',
        startTime: cursor,
        duration: 80,
        viseme: { ...VISEME_MAP['default'], phoneme: 'word_pause', jawPosition: 0 },
      });
      cursor += 80;
    }
  });

  return phonemes;
}

export function generateLipSync(text: string): LipSyncResult {
  const phonemes = extractPhonemes(text);
  const last = phonemes[phonemes.length - 1];
  const totalDuration = last ? last.startTime + last.duration : 0;
  return { phonemes, totalDuration };
}

export function useLipSync() {
  return { generateSync: generateLipSync };
}