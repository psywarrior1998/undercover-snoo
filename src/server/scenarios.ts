export interface CommentCard {
  id: string; // 'A' | 'B' | 'C' | 'D'
  author: string;
  karma: string;
  text: string;
  isImposter: boolean;
  explanation: string;
}

export interface Scenario {
  dayNumber: number;
  subreddit: string;
  prompt: string;
  contextNote?: string;
  cards: CommentCard[];
}

interface RawScenario {
  subreddit: string;
  prompt: string;
  authentic: Array<{ author: string; karma: string; text: string; note: string }>;
  imposter: { author: string; karma: string; text: string; tellNote: string };
}

// ---------------------------------------------------------------------
// 30 Curated Foundational Scenarios from Iconic Reddit Threads
// ---------------------------------------------------------------------
const SCENARIO_CATALOG: RawScenario[] = [
  // 0. r/AskReddit - Feels illegal
  {
    subreddit: 'r/AskReddit',
    prompt: 'What is something that feels 100% illegal, but is actually completely legal?',
    authentic: [
      { author: 'cartographer_42', karma: '24.1k', text: 'Walking out of a store without buying anything. My heart starts hammering like I just smuggled the crown jewels in my socks.', note: 'Classic relatable retail anxiety.' },
      { author: 'speedy_noodle', karma: '18.4k', text: 'Driving past a parked police cruiser with both hands strictly at 10 and 2 while sweating through your steering wheel.', note: 'Universal driver reflex.' },
      { author: 'pantry_raider', karma: '12.9k', text: 'Using the restroom in a café while maintaining zero intention of purchasing a $7 artisanal muffin.', note: 'Guilt-trip masterclass.' },
    ],
    imposter: {
      author: 'quiet_observer_99',
      karma: '15.3k',
      text: 'Remaining completely motionless on municipal transit seating while failing to initiate conversation with fellow passengers.',
      tellNote: 'Slightly too robotic and clinical ("municipal transit seating"). Human Redditors don\'t talk like that!',
    },
  },
  // 1. r/Showerthoughts - Bedtime
  {
    subreddit: 'r/Showerthoughts',
    prompt: 'Mind-bending realisations about everyday human habits.',
    authentic: [
      { author: 'cosmic_drift', karma: '31.2k', text: 'Going to bed is literally setting an alarm to remind your future self that you have bills to pay.', note: 'Existential dread humor.' },
      { author: 'stargazer_dan', karma: '22.0k', text: 'Your future self is constantly watching you through memories, probably judging your current life decisions.', note: 'Classic shower logic.' },
      { author: 'caffeine_fiend', karma: '19.5k', text: 'Mirrors in hotels feel like they are reflecting a slightly wealthier, more organized version of yourself.', note: 'Quirky spatial observation.' },
    ],
    imposter: {
      author: 'deep_thinker_snoo',
      karma: '25.6k',
      text: 'Human sleeping routines are merely an involuntary biochemical recharge protocol masquerading as recreational horizontal time.',
      tellNote: 'Classic AI synthesis ("biochemical recharge protocol"). Sounds like an alien observing Earth!',
    },
  },
  // 2. r/explainlikeimfive - Fire
  {
    subreddit: 'r/explainlikeimfive',
    prompt: 'ELI5: What actually is fire? Is it a solid, liquid, or gas?',
    authentic: [
      { author: 'science_sam', karma: '14.8k', text: 'Fire is not a state of matter—it is an event! It is glowing hot gas releasing energy so fast that photons literally shoot into your eyeballs.', note: 'Enthusiastic and accurate.' },
      { author: 'chem_dork', karma: '11.2k', text: 'Think of it like incandescent lightbulb filaments, but instead of tungsten wire, it is glowing vapor and soot rushing upward.', note: 'Great physical analogy.' },
      { author: 'rusty_wrench', karma: '8.4k', text: 'It is basically rapid rusting with better pyrotechnics.', note: 'Short, witty Reddit quip.' },
    ],
    imposter: {
      author: 'thermal_expert_88',
      karma: '13.1k',
      text: 'Fire represents an exothermic thermodynamic phase manifestation governed by high molecular oxidation kinetic boundaries.',
      tellNote: 'Way too textbook and academic! ELI5 threads penalize jargon like "thermodynamic phase manifestation".',
    },
  },
  // 3. r/gaming - Rage quit
  {
    subreddit: 'r/gaming',
    prompt: 'What was your most unhinged gaming rage quit moment?',
    authentic: [
      { author: 'pixel_slayer', karma: '16.5k', text: 'Lost 250,000 Blood Echoes in Bloodborne to a flock of crows. Crows! I calmly ejected the disc, set it on my table, and took a 2-hour walk in the rain.', note: 'The silent defeated walk.' },
      { author: 'controller_grave', karma: '21.3k', text: 'FIFA 17 Weekend League. 93rd minute deflected corner goal. I bit my controller. Left permanent dental records in the plastic.', note: 'Visceral FIFA trauma.' },
      { author: 'stealth_archer', karma: '9.7k', text: 'Spent 40 minutes sneak-looting an entire fortress in Skyrim only to tap Alt instead of Space and sprint head-first into a spike pit.', note: 'Classic keybind blunder.' },
    ],
    imposter: {
      author: 'game_master_9000',
      karma: '17.2k',
      text: 'I experienced heightened emotional agitation when the digital physics simulation resulted in an unexpected tactical defeat.',
      tellNote: 'Zero gamer slang! Calling a bug "heightened emotional agitation in digital physics" screams AI bot.',
    },
  },
  // 4. r/TIFU - Today I Screwed Up
  {
    subreddit: 'r/TIFU',
    prompt: 'TIFU by waving back at someone who was definitely not waving at me.',
    authentic: [
      { author: 'awkward_penguin', karma: '28.9k', text: 'I hit them with the double hand enthusiastic wave and even mouthed "HEY MAN!". Turns out his fiancée was walking right behind me. I immediately pretended to stretch my lats.', note: 'The classic recovery stretch.' },
      { author: 'cringe_lord', karma: '15.4k', text: 'I kept my hand up for like 4 solid seconds and slowly converted it into hailing an invisible taxi in the middle of a pedestrian crosswalk.', note: 'Painfully relatable.' },
      { author: 'social_ghost', karma: '12.1k', text: 'I made full eye contact, smiled, and when they hugged the person behind me, I pivoted 180 degrees and walked into a decorative bush.', note: 'Homer Simpson meme in text form.' },
    ],
    imposter: {
      author: 'gestural_error',
      karma: '19.8k',
      text: 'I miscalculated the trajectory of bilateral upper limb signaling and had to recalibrate my social posture in public.',
      tellNote: 'Extremely robotic phrasing ("bilateral upper limb signaling"). Caught red-handed!',
    },
  },
  // 5. r/technology - Passwords
  {
    subreddit: 'r/technology',
    prompt: 'What is the most ridiculous password requirement you have ever encountered?',
    authentic: [
      { author: 'sysadmin_pete', karma: '33.1k', text: 'Must contain 1 uppercase, 1 number, 1 special character, but CANNOT contain the letter E because their 1994 SQL database breaks.', note: 'Classic legacy database horror.' },
      { author: 'keyboard_smash', karma: '24.5k', text: 'Password cannot contain characters found in the company name, your username, or current month. Bro just tell me what to type at this point.', note: 'Pure corporate IT frustration.' },
      { author: 'security_first', karma: '17.0k', text: 'Maximum password length: 8 characters. That is not security, that is an invitation to be hacked before lunch.', note: 'Accurate infosec critique.' },
    ],
    imposter: {
      author: 'cyber_guardian',
      karma: '22.3k',
      text: 'The cryptographic credential verification engine demanded a non-consecutive numerical string to satisfy algorithmic entropy standards.',
      tellNote: 'Reads like an academic paper on entropy rather than a venting tech worker.',
    },
  },
  // 6. r/Showerthoughts - Languages
  {
    subreddit: 'r/Showerthoughts',
    prompt: 'Thoughts on communication and the internet.',
    authentic: [
      { author: 'word_nerd', karma: '19.2k', text: 'Typing "k" feels like a slap in the face, while typing "kk" feels like a warm pat on the back. Punctuation has emotions now.', note: 'Millennial texting nuance.' },
      { author: 'browser_tab_hoarder', karma: '27.4k', text: 'Closing 50 tabs after finishing a research paper gives you the same relief as taking off wet socks on a cold day.', note: 'Incredible sensory comparison.' },
      { author: 'midnight_scroller', karma: '14.1k', text: 'Reading your own sent messages to admire how witty you sound is peak self-indulgence.', note: 'Honest ego admission.' },
    ],
    imposter: {
      author: 'linguistic_snoo',
      karma: '21.0k',
      text: 'Digital text transmission is the synthetic compression of human neurological intent across fiber optic conduits.',
      tellNote: 'AI pretending to be philosophical with "synthetic compression of human neurological intent".',
    },
  },
  // 7. r/AskReddit - Grocery shopping
  {
    subreddit: 'r/AskReddit',
    prompt: 'What is an unspoken rule of grocery shopping that everyone should follow?',
    authentic: [
      { author: 'cart_pilot', karma: '38.0k', text: 'If you abandon cold ground beef in the cereal aisle because you changed your mind, you belong in federal prison.', note: 'Peak Reddit grocery rage.' },
      { author: 'aisle_traffic', karma: '26.7k', text: 'Do not park your shopping cart diagonally in the middle of the aisle while contemplating mayonnaise for 12 minutes.', note: 'Direct spatial etiquette.' },
      { author: 'sample_gobbler', karma: '15.9k', text: 'Keep the barcode facing the cashier on the heavy items so they do not have to deadlift your 40-pack of water bottles.', note: 'Retail worker appreciation.' },
    ],
    imposter: {
      author: 'aisle_navigator',
      karma: '29.3k',
      text: 'Maintain strict orthogonal alignment of wheeled retail conveyance units to optimize bidirectional customer throughput.',
      tellNote: 'Wheeled retail conveyance units? Nobody calls a cart that except an AI bot!',
    },
  },
];

// ---------------------------------------------------------------------
// 10-Year (3,650-Day) Deterministic Engine
// ---------------------------------------------------------------------
const START_EPOCH = new Date('2026-11-13T00:00:00Z').getTime();

export function getDayIndex(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  if (isNaN(target)) return 0;
  return Math.max(0, Math.floor((target - START_EPOCH) / (1000 * 60 * 60 * 24)));
}

function deterministicHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyScenario(dateStr: string): Scenario {
  const dayIndex = getDayIndex(dateStr);
  const hash = deterministicHash(dateStr);

  const scenarioIndex = (dayIndex * 3 + (hash % 7)) % SCENARIO_CATALOG.length;
  const raw = SCENARIO_CATALOG[scenarioIndex] ?? SCENARIO_CATALOG[0];

  // Deterministically shuffle cards so the Imposter isn't always in position D
  const imposterCard: CommentCard = {
    id: 'X',
    author: raw.imposter.author,
    karma: raw.imposter.karma,
    text: raw.imposter.text,
    isImposter: true,
    explanation: raw.imposter.tellNote,
  };

  const authenticCards: CommentCard[] = raw.authentic.map((a) => ({
    id: 'X',
    author: a.author,
    karma: a.karma,
    text: a.text,
    isImposter: false,
    explanation: a.note,
  }));

  const allCards = [...authenticCards, imposterCard];
  
  // Deterministic Fisher-Yates shuffle
  const seed = hash + dayIndex * 13;
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(((seed * (i + 1) * 31) % 1000) / 1000 * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  // Assign letters A, B, C, D
  const letters = ['A', 'B', 'C', 'D'];
  const formattedCards = allCards.map((c, i) => ({
    ...c,
    id: letters[i],
  }));

  return {
    dayNumber: dayIndex + 1,
    subreddit: raw.subreddit,
    prompt: raw.prompt,
    cards: formattedCards,
  };
}
