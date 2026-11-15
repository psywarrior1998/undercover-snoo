# Reddit Game of the Day Hackathon 2026 — Devpost Submission Guide

> **Project Name:** Undercover Snoo — Daily AI Imposter & Community Consensus  
> **Tagline:** A daily 60-second deduction game where Redditors spot the AI bot hiding among authentic high-karma comments.

---

## 📋 Devpost Submission Fields (Copy-Paste Ready)

### 1. Elevator Pitch / Short Description
> *Undercover Snoo is a daily 60-second AI Imposter & Community Consensus game built on Devvit Web. Every day, Redditors examine 4 comments from a viral Reddit thread: 3 are authentic high-karma comments, and 1 is an AI bot disguised as a human. Players vote to accuse the imposter, watch live subreddit voting heat-maps reveal community consensus, earn the Maverick Detective bonus for beating the crowd, and share spoiler-free deduction badges directly into the post's comments!*

---

### 2. About the Project / Inspiration
The Reddit Game of the Day Hackathon prompt challenged developers to build games that celebrate Reddit's core identity—comments, community culture, witty banter, and collective intelligence. 

With generative AI models increasingly mimicking human writing styles across the web, we asked: **Can a subreddit’s collective intuition tell an authentic Redditor apart from an AI bot?**

This sparked **Undercover Snoo**:
Every midnight UTC, players are dropped into an active crime scene from an iconic subreddit thread (r/AskReddit, r/Showerthoughts, r/explainlikeimfive, r/TIFU, etc.). Four comments are presented under identical Reddit UI formatting. Three are authentic, top-voted comments from real Redditors; one is an "Undercover Snoo"—an AI agent attempting to blend in using slightly uncanny phrasing. 

When players cast their accusation, real-time Devvit Redis counters show the entire subreddit's voting consensus, creating an instant social debate in the comment section.

---

### 3. What It Does
* **The 60-Second Investigation Loop:** Every day, players receive a scenario card with the original thread prompt and 4 suspect comments (Cards A, B, C, D).
* **Tactile Accusation:** Players read the nuances, comedic tells, and syntax before selecting one comment to accuse as the bot.
* **Live Community Heat-Map:** Upon voting, an atomic Redis counter updates a live percentage breakdown on each card, showing what portion of the subreddit accused each comment (`68% Accusations`, `18% Accusations`, etc.).
* **The Maverick Detective Bonus:** Players who successfully identify the bot while over 65% of the subreddit was fooled by the human comments earn the **Maverick Detective Bonus (+250 pts)**!
* **Humorous "Tells" & Explanations:** When the cards flip, each suspect reveals why it was authentic or what subtle robotic phrasing gave the AI bot away.
* **In-Thread Viral Comment Loop:** With 1 click, players post their spoiler-free verdict (`🕵️‍♂️ Undercover Snoo Daily #1: 🔍 IMPOSTER CAUGHT | Score: 1250 pts | Streak: 🔥 3d`) directly into the Reddit post's comment thread.

---

### 4. How We Built It
* **Frontend:** Built with **Devvit Web**, **React 19**, **TypeScript**, and **Tailwind CSS**. Designed with a high-contrast cyber-noir detective palette (`#0B0F19` deep space slate, `#FF4500` Reddit Orangered, emerald and amber status rings).
* **Audio Synthesis:** Zero-dependency **Web Audio API** engine providing tactile card clicks, a dramatic low-frequency buzzer on wrong accusations, and an ascending four-note harmonic arpeggio on imposter capture.
* **Backend Runtime:** Node.js server powered by **Hono** adapted via `@hono/node-server` to Devvit's native `createServer` and `getServerPort()`.
* **Real-time State & Persistence:**
  * `redis.hIncrBy`: Real-time atomic vote counters for all 4 suspect cards.
  * `redis.incrBy`: Real-time tracking of community solve numbers and individual detective streaks.
  * `redis.set`: Persistent daily completion state preventing repeat voting on the same day.
* **10-Year (3,650-Day) Deterministic Engine:** Catalog of curated multi-genre scenarios spanning Reddit lore, paired with a deterministic date hashing algorithm from `2026-11-13` to `2036-11-13` with randomized card position shuffling.
* **Telemetry & Analytics:** Full instrumentation using **Devvit Journeys** (`@devvit/analytics`):
  * `telemetry.startJourney()` on investigation start.
  * `telemetry.endJourney()` with win/score metadata on verdict.
* **Moderator Menu Tool:** Custom menu action (`/internal/menu/post-create`) strictly adhering to Devvit's `UiResponse` schema (`{ showToast, navigateTo }`).

---

### 5. Challenges We Ran Into
1. **Preventing Client-Side Cheating:** If card data sent from `/api/daily` contained the `isImposter` flag, savvy players could inspect the network tab. We implemented a server-side sanitization layer that strips all imposter flags and explanations until the player registers a vote in Redis.
2. **Deterministic Shuffling:** Ensuring the imposter wasn't predictably placed on Card D required building a seed-based Fisher-Yates shuffle that yields identical card orders for all players on a given calendar day.
3. **Viewport Optimization:** Fitting 4 rich comment cards, prompt banner, and voting controls into Reddit's embedded viewport required an ultra-clean 2x2 grid layout on desktop and single-column stacked view on mobile.

---

### 6. Built With Tags (Up to 25)
`reddit`, `devvit`, `react`, `typescript`, `tailwind-css`, `redis`, `hono`, `nodejs`, `web-audio-api`, `vite`, `canvas-confetti`, `hackathon`, `ai-deduction`, `game-of-the-day`

---

### 7. Official Submission Links
* **GitHub Repository:** `https://github.com/psywarrior1998/undercover-snoo`
* **App Listing Link:** `https://developers.reddit.com/apps/undercover-snoo`
* **Test Subreddit:** `https://www.reddit.com/r/subtext_game_2026`
* **Demo Post Link:** `https://www.reddit.com/r/subtext_game_2026` (Generated via Devvit)

---

## 👤 Created by / Describe your contribution

```text
Solo architect, developer, and designer for Undercover Snoo. Designed the core game concept: a daily 60-second social deduction and Turing-test puzzle where Redditors identify AI bots hiding among authentic Reddit comments. 

Architected the full-stack Reddit Devvit application using React 19, TypeScript, Tailwind CSS, Hono Node.js backend, and Devvit Redis KV state. Engineered the 10-year (3,650-day) deterministic scenario bank and shuffling engine, designed the high-contrast cyber-noir detective UI, integrated Devvit Journeys analytics telemetry, and built the procedural Web Audio sound synthesizer and in-thread spoiler-free comment sharing integration.
```
