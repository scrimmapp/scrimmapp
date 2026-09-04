// A small, deliberately blunt server-side profanity filter for public-facing free text
// (Pitch-Side Chat comments, listing notes). Youth-soccer coaches writing to each other, not a
// general chat product, so a maintained word list beats pulling in a heavyweight NLP dependency.
const BLOCKED_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "dick",
  "piss",
  "damn",
  "crap",
  "slut",
  "whore",
  "faggot",
  "retard",
  "nigger",
  "nigga",
];

const BLOCKED_PATTERN = new RegExp(
  `\\b(${BLOCKED_WORDS.map((w) => w.split("").join("[\\W_]*")).join("|")})\\b`,
  "i",
);

export function containsProfanity(text: string): boolean {
  return BLOCKED_PATTERN.test(text);
}
