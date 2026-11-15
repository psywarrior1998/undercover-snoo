import { Hono } from 'hono';
import { redis, reddit, context, createServer, getServerPort } from '@devvit/web/server';
import { telemetry } from '@devvit/analytics/server/reddit';
import { getRequestListener } from '@hono/node-server';
import { getDailyScenario, Scenario } from './scenarios.js';

const app = new Hono();

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// -------------------------------------------------------------
// 1. Fetch Today's Scenario & Community Consensus Stats
// -------------------------------------------------------------
app.get('/api/daily', async (c) => {
  const today = getTodayKey();
  const scenario: Scenario = getDailyScenario(today);
  const userId = context.userId ?? 'guest';

  try {
    const [voteCounts, streak, completed, totalSolves] = await Promise.all([
      redis ? redis.hGetAll(`undercover_votes:${today}`) : Promise.resolve({}),
      userId !== 'guest' && redis ? redis.get(`undercover_streak:${userId}`) : Promise.resolve('0'),
      userId !== 'guest' && redis ? redis.get(`undercover_done:${today}:${userId}`) : Promise.resolve(null),
      redis ? redis.get(`undercover_solves:${today}`) : Promise.resolve('0'),
    ]);

    let parsedCompleted = null;
    if (completed) {
      try {
        parsedCompleted = JSON.parse(completed);
      } catch {
        parsedCompleted = { score: 1000, votedCardId: 'A', correct: true };
      }
    }

    // Hide imposter flags unless the user has already voted today
    const sanitizedCards = scenario.cards.map((card) => {
      if (parsedCompleted) {
        return card;
      }
      return {
        id: card.id,
        author: card.author,
        karma: card.karma,
        text: card.text,
        isImposter: false, // hidden until solve
        explanation: '',
      };
    });

    return c.json({
      date: today,
      dayNumber: scenario.dayNumber,
      subreddit: scenario.subreddit,
      prompt: scenario.prompt,
      cards: sanitizedCards,
      voteCounts: voteCounts ?? {},
      streak: Number(streak ?? 0),
      completed: Boolean(completed),
      completedData: parsedCompleted,
      totalSolves: Number(totalSolves ?? 0),
    });
  } catch (err) {
    console.error('Error fetching scenario:', err);
    return c.json({
      date: today,
      dayNumber: scenario.dayNumber,
      subreddit: scenario.subreddit,
      prompt: scenario.prompt,
      cards: scenario.cards.map((card) => ({
        id: card.id,
        author: card.author,
        karma: card.karma,
        text: card.text,
        isImposter: false,
        explanation: '',
      })),
      voteCounts: {},
      streak: 0,
      completed: false,
      totalSolves: 0,
    });
  }
});

// -------------------------------------------------------------
// 2. Submit Guess / Vote for Imposter Card
// -------------------------------------------------------------
app.post('/api/vote', async (c) => {
  const journeyId = c.req.header('x-devvit-journey-id') ?? '';
  const { cardId } = await c.req.json<{ cardId: string }>();

  const today = getTodayKey();
  const scenario: Scenario = getDailyScenario(today);
  const userId = context.userId ?? 'guest';

  const selectedCard = scenario.cards.find((c) => c.id === cardId);
  const imposterCard = scenario.cards.find((c) => c.isImposter);

  if (!selectedCard || !imposterCard) {
    return c.json({ ok: false, error: 'Invalid card' }, 400);
  }

  const isCorrect = selectedCard.isImposter;

  let totalVotes = 1;
  let imposterVotes = 1;
  const currentVoteCounts: Record<string, number> = {};

  try {
    if (redis) {
      await redis.hIncrBy(`undercover_votes:${today}`, cardId, 1);
      await redis.incrBy(`undercover_solves:${today}`, 1);

      const allVotes = await redis.hGetAll(`undercover_votes:${today}`);
      for (const [k, v] of Object.entries(allVotes || {})) {
        currentVoteCounts[k] = Number(v);
        totalVotes += Number(v);
      }
      imposterVotes = currentVoteCounts[imposterCard.id] ?? 1;
    }
  } catch (err) {
    console.error('Redis voting error:', err);
  }

  // Maverick Detective Bonus: If <35% of the subreddit correctly spotted the imposter, you beat the crowd!
  const imposterVotePct = totalVotes > 0 ? (imposterVotes / totalVotes) * 100 : 0;
  const isMaverick = isCorrect && imposterVotePct <= 35;
  const maverickBonus = isMaverick ? 250 : 0;
  const score = isCorrect ? 1000 + maverickBonus : 200;

  let newStreak = 1;
  try {
    if (redis && userId !== 'guest') {
      const streakKey = `undercover_streak:${userId}`;
      if (isCorrect) {
        newStreak = await redis.incrBy(streakKey, 1);
      } else {
        await redis.set(streakKey, '0');
        newStreak = 0;
      }

      await redis.set(
        `undercover_done:${today}:${userId}`,
        JSON.stringify({
          score,
          votedCardId: cardId,
          correct: isCorrect,
          isMaverick,
          maverickBonus,
          imposterCardId: imposterCard.id,
        })
      );
    }
  } catch (err) {
    console.error('Streak update error:', err);
  }

  // Instrument Devvit Journeys
  if (journeyId && telemetry) {
    try {
      await telemetry.endJourney({
        journeyId,
        complete: true,
        game: { win: isCorrect, score },
      });
    } catch (err) {
      console.warn('Telemetry error:', err);
    }
  }

  return c.json({
    correct: isCorrect,
    score,
    isMaverick,
    maverickBonus,
    streak: newStreak,
    imposterCardId: imposterCard.id,
    cards: scenario.cards, // Reveal all true answers & tell notes
    voteCounts: currentVoteCounts,
  });
});

// -------------------------------------------------------------
// 3. Post Spoiler-Free Strategy Badge to Thread Comments
// -------------------------------------------------------------
app.post('/api/share-comment', async (c) => {
  const { score, streak, isMaverick, correct, votedCardId } = await c.req.json<{
    score: number;
    streak: number;
    isMaverick?: boolean;
    correct: boolean;
    votedCardId: string;
  }>();

  if (!context.postId) {
    return c.json({ ok: false, error: 'No postId available' }, 400);
  }

  const today = getTodayKey();
  const scenario = getDailyScenario(today);
  const maverickBadge = isMaverick ? ' 🦅 **Maverick Detective (Beat the Crowd!)**' : '';
  const statusEmoji = correct ? '🔍 **IMPOSTER CAUGHT**' : '❌ **FOOLED BY SNOO**';

  const commentText = [
    `🕵️‍♂️ **Undercover Snoo Daily #${scenario.dayNumber} — ${today}**`,
    `Verdict: ${statusEmoji}`,
    `Score: **${score} pts** | Streak: 🔥 **${streak} days**${maverickBadge}`,
    `Voted for Comment **[${votedCardId}]** on ${scenario.subreddit}`,
    `*(Zero spoilers — launch the interactive investigation in the post above to play!)*`,
  ].join('\n\n');

  try {
    if (reddit) {
      await reddit.submitComment({
        id: context.postId,
        text: commentText,
      });
      return c.json({ ok: true });
    }
  } catch (err) {
    console.error('Error submitting comment to Reddit:', err);
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// -------------------------------------------------------------
// 4. Moderator Menu Action: Generate Daily Post (Strict UiResponse)
// -------------------------------------------------------------
app.post('/internal/menu/post-create', async (c) => {
  try {
    const subreddit = context.subredditName ?? 'subtext_game_2026';
    const today = getTodayKey();
    const scenario = getDailyScenario(today);

    const post = await reddit.submitPost({
      title: `🕵️‍♂️ Undercover Snoo Daily #${scenario.dayNumber} [${today}] — ${scenario.subreddit}`,
      subredditName: subreddit,
      preview: {
        entry: 'dist/client/index.html',
      },
    });

    return c.json({
      showToast: `Created Undercover Snoo Daily #${scenario.dayNumber} post!`,
      navigateTo: post.url,
    });
  } catch (err) {
    console.error('Error creating Undercover Snoo post:', err);
    return c.json({
      showToast: `Failed to create post: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});

// -------------------------------------------------------------
// 5. Automated Midnight UTC Scheduler
// -------------------------------------------------------------
app.post('/internal/scheduler/daily-post', async (c) => {
  try {
    const subreddit = context.subredditName ?? 'subtext_game_2026';
    const today = getTodayKey();
    const scenario = getDailyScenario(today);

    await reddit.submitPost({
      title: `🕵️‍♂️ Undercover Snoo Daily #${scenario.dayNumber} [${today}] — ${scenario.subreddit}`,
      subredditName: subreddit,
      preview: {
        entry: 'dist/client/index.html',
      },
    });

    return c.json({ ok: true });
  } catch (err) {
    console.error('Scheduler error:', err);
    return c.json({ ok: false }, 500);
  }
});

// -------------------------------------------------------------
// Devvit Web Node.js Server Adapter
// -------------------------------------------------------------
const port = getServerPort();
const listener = getRequestListener(app.fetch);
const server = createServer(listener);
server.listen(port);
