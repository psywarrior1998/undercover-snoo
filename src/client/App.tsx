import React, { useEffect, useState, useMemo } from 'react';
import { telemetry } from '@devvit/analytics/client/reddit';
import confetti from 'canvas-confetti';
import { sfx } from './sound';

interface CommentCard {
  id: string;
  author: string;
  karma: string;
  text: string;
  isImposter?: boolean;
  explanation?: string;
}

interface SolvedData {
  score: number;
  votedCardId: string;
  correct: boolean;
  isMaverick?: boolean;
  maverickBonus?: number;
  imposterCardId?: string;
}

export function App() {
  const [started, setStarted] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [subreddit, setSubreddit] = useState('');
  const [prompt, setPrompt] = useState('');
  const [cards, setCards] = useState<CommentCard[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [totalSolves, setTotalSolves] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [result, setResult] = useState<SolvedData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Load daily scenario on mount
  useEffect(() => {
    fetch('/api/daily')
      .then((res) => res.json())
      .then((data) => {
        setDateStr(data.date || new Date().toISOString().slice(0, 10));
        setDayNumber(data.dayNumber || 1);
        setSubreddit(data.subreddit || 'r/AskReddit');
        setPrompt(data.prompt || 'Classified Daily Investigation');
        setCards(data.cards || []);
        setVoteCounts(data.voteCounts || {});
        setStreak(data.streak || 0);
        setTotalSolves(data.totalSolves || 0);

        if (data.completed && data.completedData) {
          setStarted(true);
          setResult(data.completedData);
          setSelectedCardId(data.completedData.votedCardId);
        }
      })
      .catch((err) => console.error('Failed to load Undercover Snoo scenario:', err));
  }, []);

  const totalVotes = useMemo(() => {
    return Object.values(voteCounts).reduce((acc, curr) => acc + Number(curr || 0), 0);
  }, [voteCounts]);

  const handleStart = async () => {
    sfx.playCardSelect();
    setStarted(true);
    try {
      if (typeof telemetry !== 'undefined' && telemetry.startJourney) {
        await telemetry.startJourney();
      }
    } catch (err) {
      console.warn('Telemetry journey error:', err);
    }
  };

  const handleCardClick = (cardId: string) => {
    if (result || submitting) return;
    sfx.playCardSelect();
    setSelectedCardId(cardId);
  };

  const handleVoteSubmit = async () => {
    if (!selectedCardId || result || submitting) return;

    setSubmitting(true);
    sfx.playCardSelect();

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: selectedCardId }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (data.cards) {
        setCards(data.cards);
      }
      if (data.voteCounts) {
        setVoteCounts(data.voteCounts);
      }
      if (data.streak !== undefined) {
        setStreak(data.streak);
      }

      setResult({
        score: data.score,
        votedCardId: selectedCardId,
        correct: data.correct,
        isMaverick: data.isMaverick,
        maverickBonus: data.maverickBonus,
        imposterCardId: data.imposterCardId,
      });

      if (data.correct) {
        sfx.playVictory();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF4500', '#F59E0B', '#10B981', '#6366F1'],
        });
      } else {
        sfx.playBuzzer();
      }
    } catch (err) {
      console.error('Vote submission error:', err);
      setSubmitting(false);
    }
  };

  const handleShareComment = async () => {
    if (!result || shared) return;
    sfx.playCardSelect();

    try {
      const res = await fetch('/api/share-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: result.score,
          streak,
          isMaverick: result.isMaverick,
          correct: result.correct,
          votedCardId: result.votedCardId,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setShared(true);
      }
    } catch (err) {
      console.error('Comment share error:', err);
    }
  };

  const handleCopyClipboard = () => {
    if (!result) return;
    sfx.playCardSelect();

    const verdict = result.correct ? '🔍 CAUGHT' : '❌ FOOLED';
    const text = [
      `🕵️‍♂️ Undercover Snoo Daily #${dayNumber} (${dateStr})`,
      `Investigation: ${verdict} | Card [${result.votedCardId}]`,
      `Score: ${result.score} pts | Streak: 🔥 ${streak}d`,
      `reddit.com/r/devvit`,
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSound = () => {
    const next = sfx.toggleSound();
    setSoundOn(next);
  };

  // 1. Mission Brief / Start Screen
  if (!started) {
    return (
      <div className="w-full min-h-[580px] bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between p-6 sm:p-8 font-sans selection:bg-orange-500 selection:text-white">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-[11px] font-mono tracking-widest text-orange-500 uppercase font-bold">
            Reddit AI Imposter Dossier • Day #{dayNumber} • {dateStr}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalSolves > 0 ? `${totalSolves} Detectives Today` : 'Midnight UTC Rollover'}
          </span>
        </div>

        <div className="my-auto text-center flex flex-col items-center max-w-lg mx-auto py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/60 border border-orange-500/40 rounded-full text-xs font-mono font-bold text-orange-400 mb-4 radar-glow">
            <span>● LIVE INVESTIGATION</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
            UNDERCOVER SNOO
          </h1>
          <p className="text-xs uppercase font-mono tracking-wider text-orange-400 mb-4 font-bold">
            Spot the AI Imposter Hiding in Reddit Comments
          </p>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            An advanced language model has disguised itself as a Redditor. Below are 4 comments from a viral <strong className="text-white">{subreddit}</strong> thread. 
            <br className="hidden sm:inline" />
            <strong className="text-emerald-400">3 are authentic high-karma Redditors</strong>. 
            <strong className="text-orange-400 ml-1">1 is an AI bot</strong>. 
            Can you deduce the imposter?
          </p>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-lg shadow-orange-950/50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Begin Investigation</span>
            <span>→</span>
          </button>
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>Heat-map displays subreddit vote consensus</span>
          <span>1 Investigation per day</span>
        </div>
      </div>
    );
  }

  // 2. Active Game & Solved Investigation View
  return (
    <div className="w-full min-h-[580px] bg-[#0B0F19] text-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 font-sans selection:bg-orange-500">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-orange-400 bg-orange-950/60 px-2.5 py-0.5 rounded border border-orange-500/40 font-mono">
            {subreddit}
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Day #{dayNumber} • {dateStr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-xs font-bold text-slate-400 hover:text-white w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            title="Field Manual"
          >
            ?
          </button>
          <button
            onClick={toggleSound}
            className="text-xs font-mono text-slate-400 hover:text-white w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Rules Modal */}
      {showHelp && (
        <div className="my-2 p-4 bg-slate-900 border border-orange-500/40 rounded-xl text-xs leading-relaxed text-slate-300 animate-reveal-pop shadow-xl">
          <div className="flex justify-between items-center font-bold text-white border-b border-slate-800 pb-2 mb-2">
            <span>DETECTIVE FIELD MANUAL</span>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-white font-mono">✕</button>
          </div>
          <p className="mb-1.5">• <strong>The Objective:</strong> Select the 1 comment written by the AI bot.</p>
          <p className="mb-1.5">• <strong>Subreddit Consensus:</strong> After voting, each card shows the percentage of the community who accused that comment.</p>
          <p>• <strong>Maverick Bonus (+250 pts):</strong> Awarded when you correctly catch the imposter while over 65% of the subreddit was fooled by the real comments!</p>
        </div>
      )}

      {/* Scenario Thread Prompt */}
      <div className="my-2 p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
          ORIGINAL THREAD PROMPT:
        </div>
        <div className="text-sm sm:text-base font-bold text-white leading-snug">
          &ldquo;{prompt}&rdquo;
        </div>
      </div>

      {/* 4 Comment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-2">
        {cards.map((card) => {
          const isSelected = selectedCardId === card.id;
          const isImposter = card.isImposter;
          const votes = Number(voteCounts[card.id] || 0);
          const votePct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

          // Card Border and Background Styling based on state
          let cardStyle = 'bg-slate-900/70 border-slate-800 hover:border-slate-700';
          if (!result && isSelected) {
            cardStyle = 'bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/30';
          } else if (result) {
            if (isImposter) {
              cardStyle = 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40';
            } else if (isSelected && !result.correct) {
              cardStyle = 'bg-red-950/40 border-red-500 ring-2 ring-red-500/40';
            }
          }

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${cardStyle}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      [{card.id}]
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      u/{card.author}
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-400 font-mono">
                    ▲ {card.karma}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-3">
                  &ldquo;{card.text}&rdquo;
                </p>
              </div>

              {/* Reveal Stats & Tells (After Vote) */}
              {result && (
                <div className="border-t border-slate-800/80 pt-2 mt-auto">
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="font-bold">
                      {isImposter ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          🤖 UNDERCOVER SNOO (BOT)
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          ✓ Authentic Redditor
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {votePct}% Accusations
                    </span>
                  </div>

                  {/* Heatmap Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isImposter ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${votePct}%` }}
                    />
                  </div>

                  {/* Tell Note */}
                  {card.explanation && (
                    <p className="text-[10px] text-slate-400 italic">
                      {card.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Action Area: Accuse Button OR Result Bar */}
      {!result ? (
        <div className="pt-2">
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedCardId || submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              selectedCardId
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500 active:scale-95 shadow-orange-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {selectedCardId
                ? `ACCUSE COMMENT [${selectedCardId}] AS THE IMPOSTER`
                : 'SELECT A COMMENT ABOVE TO ACCUSE'}
            </span>
            {selectedCardId && <span>→</span>}
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-reveal-pop mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  result.correct
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-red-950 text-red-400 border border-red-500/40'
                }`}
              >
                {result.correct ? '🎯 Imposter Identified' : '❌ Fooled by the Bot'}
              </span>
              {result.isMaverick && (
                <span className="text-[10px] uppercase font-bold tracking-wider bg-orange-950 text-orange-400 px-2 py-0.5 rounded border border-orange-500/40">
                  🦅 Maverick Detective (+{result.maverickBonus} pts)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 font-mono">
              <strong className="text-white text-sm">{result.score} pts</strong> • 🔥 {streak} Day Streak
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareComment}
              disabled={shared}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                shared
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
              }`}
            >
              {shared ? '✓ Posted to Thread!' : 'Post Badge to Comments'}
            </button>
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? 'Copied!' : '📋'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
