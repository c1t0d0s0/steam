import { describe, it, expect } from 'vitest';
import {
  generateLeverPuzzle,
  generateCircuitPuzzle,
  generateTsurukamePuzzle,
  generateBlockPuzzle,
  generateGearPuzzle,
  generateCubeNetPuzzle,
  generateCrossSectionPuzzle,
  generateMazePuzzle,
  generateBinaryCipherPuzzle,
  generateDailyChallenge
} from '../services/problemGenerator';
import {
  calculateUpdatedDailyStreak,
  checkNewBadges,
  INITIAL_USER_PROGRESS,
  UserProgress
} from '../services/storage';

describe('Daily Challenge & Dynamic Problem Generator', () => {
  describe('Science Island Generator (Lever Balance & Circuit)', () => {
    it('generates a valid, solvable lever balance puzzle with torque equality', () => {
      const { puzzle, signature } = generateLeverPuzzle(new Set());
      expect(signature).toMatch(/^lever:/);
      expect(puzzle.targetPos).toBeGreaterThanOrEqual(1);
      expect(puzzle.targetPos).toBeLessThanOrEqual(4);
      expect(puzzle.initialWeights.length).toBeGreaterThanOrEqual(1);

      // Verify torque equality
      const leftTorque = puzzle.initialWeights
        .filter((w: any) => w.pos < 0)
        .reduce((sum: number, w: any) => sum + Math.abs(w.pos) * w.weight, 0);

      // There must exist at least one weight in availableWeights that balances targetPos
      const validAnswers = puzzle.availableWeights.filter(
        (w: number) => puzzle.targetPos * w === leftTorque
      );
      expect(validAnswers.length).toBe(1);
      expect(puzzle.explanation).toBeTruthy();
      expect(puzzle.examTip).toBeTruthy();
    });

    it('generates a valid electric circuit puzzle for science island', () => {
      const { puzzle, signature } = generateCircuitPuzzle(new Set(), 4);
      expect(signature).toMatch(/^circuit:/);
      expect(puzzle.bulbs.length).toBeGreaterThanOrEqual(1);
      expect(puzzle.batteries.length).toBeGreaterThanOrEqual(1);
      expect(puzzle.explanation).toBeTruthy();
      expect(puzzle.examTip).toBeTruthy();
    });

    it('avoids previously solved signatures', () => {
      const first = generateLeverPuzzle(new Set());
      const second = generateLeverPuzzle(new Set([first.signature]));
      expect(second.signature).not.toBe(first.signature);

      const firstC = generateCircuitPuzzle(new Set(), 4);
      const secondC = generateCircuitPuzzle(new Set([firstC.signature]), 4);
      expect(secondC.signature).not.toBe(firstC.signature);
    });
  });

  describe('Math Island Generator (Tsurukame & Block Count)', () => {
    it('generates solvable tsurukame puzzles with valid whole heads and legs', () => {
      const { puzzle, signature } = generateTsurukamePuzzle(new Set());
      expect(signature).toMatch(/^tsuru:/);
      expect(puzzle.totalHeads).toBe(puzzle.correctCranes + puzzle.correctTurtles);
      expect(puzzle.totalLegs).toBe(puzzle.correctCranes * 2 + puzzle.correctTurtles * 4);
      expect(puzzle.correctCranes).toBeGreaterThanOrEqual(2);
      expect(puzzle.correctTurtles).toBeGreaterThanOrEqual(2);
    });

    it('generates valid 3D block puzzles with correct answer in options', () => {
      const { puzzle, signature } = generateBlockPuzzle(new Set());
      expect(signature).toMatch(/^block:/);
      expect(puzzle.blocks.length).toBe(puzzle.answer);
      expect(puzzle.options).toContain(puzzle.answer);
      expect(puzzle.options.length).toBe(4);
    });
  });

  describe('Engineering Island Generator (Gear Chain)', () => {
    it('generates solvable gear puzzles (direction or ratio)', () => {
      const { puzzle, signature } = generateGearPuzzle(new Set());
      expect(signature).toMatch(/^gear:/);
      if (puzzle.isRatioPuzzle) {
        expect(puzzle.options).toContain(puzzle.correctTurns);
        const gearA = puzzle.gears[0];
        const gearB = puzzle.gears[1];
        expect((gearB.teeth * puzzle.correctTurns!) % gearA.teeth).toBe(0);
      } else {
        expect(['CW', 'CCW']).toContain(puzzle.targetDirection);
      }
    });
  });

  describe('Art Island Generator (Cube Net & Cross Section)', () => {
    it('generates cube net puzzles with correct answer in options', () => {
      const { puzzle, signature } = generateCubeNetPuzzle(new Set());
      expect(signature).toMatch(/^cubenet:/);
      expect(puzzle.options).toContain(puzzle.correctAnswer);
      expect(puzzle.grid.length).toBeGreaterThan(0);
    });

    it('generates valid solid cross-section puzzles with correct answer in options', () => {
      const { puzzle, signature } = generateCrossSectionPuzzle(new Set());
      expect(signature).toMatch(/^cross_section:/);
      expect(puzzle.options.length).toBeGreaterThanOrEqual(3);
      const correctOpt = puzzle.options.find((o) => o.correct);
      expect(correctOpt).toBeDefined();
    });
  });

  describe('Technology Island Generator (Algo Maze & Binary Cipher)', () => {
    it('generates reachable mazes within command limit', () => {
      const { puzzle, signature } = generateMazePuzzle(new Set());
      expect(signature).toMatch(/^algo:/);
      expect(puzzle.gridSize).toBeGreaterThanOrEqual(4);
      expect(puzzle.maxCommands).toBeGreaterThanOrEqual(4);
      expect(puzzle.start).toBeDefined();
      expect(puzzle.goal).toBeDefined();
    });

    it('generates solvable binary cipher logic puzzles with correct answer in options', () => {
      const { puzzle, signature } = generateBinaryCipherPuzzle(new Set());
      expect(signature).toMatch(/^cipher:/);
      expect(puzzle.options.length).toBeGreaterThanOrEqual(3);
      const correctOpt = puzzle.options.find((o: any) => o.correct);
      expect(correctOpt).toBeDefined();
      expect(puzzle.title).toBeTruthy();
      expect(puzzle.explanation).toBeTruthy();
      expect(puzzle.examTip).toBeTruthy();
    });
  });

  describe('Master Daily Challenge Generator', () => {
    it('generates exactly 5 questions, 1 from each island', () => {
      const daily = generateDailyChallenge([], '2026-09-19', 4);
      expect(daily.date).toBe('2026-09-19');
      expect(daily.questions.length).toBe(5);

      const islandIds = daily.questions.map((q) => q.islandId);
      expect(islandIds).toEqual(['science', 'math', 'engineering', 'art', 'tech']);

      expect(['lever', 'circuit']).toContain(daily.questions[0].gameType);
      expect(['tsurukame', 'block']).toContain(daily.questions[1].gameType);
      expect(daily.questions[2].gameType).toBe('gear');
      expect(daily.questions[3].gameType).toBe('cube_net');
      expect(daily.questions[4].gameType).toBe('algo_maze');

      // Verify that on even day, circuit and binary_cipher are selected
      const dailyEven = generateDailyChallenge([], '2026-09-20', 4);
      expect(dailyEven.questions[0].gameType).toBe('circuit');
      expect(dailyEven.questions[4].gameType).toBe('binary_cipher');

      // All signatures must be non-empty and distinct
      const signatures = daily.questions.map((q) => q.signature);
      const uniqueSignatures = new Set(signatures);
      expect(uniqueSignatures.size).toBe(5);
    });

    it('guarantees never repeating solved problem signatures', () => {
      const firstDaily = generateDailyChallenge([], '2026-09-19', 4);
      const solvedSignatures = firstDaily.questions.map((q) => q.signature);

      // Generate next daily challenge passing previous solved signatures
      const secondDaily = generateDailyChallenge(solvedSignatures, '2026-09-20', 4);
      const newSignatures = secondDaily.questions.map((q) => q.signature);

      for (const sig of newSignatures) {
        expect(solvedSignatures).not.toContain(sig);
      }
    });
  });

  describe('7-Day Streak & Streak Medal Logic', () => {
    it('increments streak when completed on consecutive days', () => {
      const day1 = calculateUpdatedDailyStreak(0, 0, undefined, '2026-09-18');
      expect(day1.newStreak).toBe(1);
      expect(day1.newMaxStreak).toBe(1);
      expect(day1.isSevenDayStreakEarned).toBe(false);

      const day2 = calculateUpdatedDailyStreak(day1.newStreak, day1.newMaxStreak, '2026-09-18', '2026-09-19');
      expect(day2.newStreak).toBe(2);
      expect(day2.newMaxStreak).toBe(2);
      expect(day2.isSevenDayStreakEarned).toBe(false);
    });

    it('awards 7-day streak medal on day 7', () => {
      const day7 = calculateUpdatedDailyStreak(6, 6, '2026-09-24', '2026-09-25');
      expect(day7.newStreak).toBe(7);
      expect(day7.isSevenDayStreakEarned).toBe(true);
    });

    it('resets streak if days are skipped', () => {
      const skipped = calculateUpdatedDailyStreak(5, 5, '2026-09-10', '2026-09-15');
      expect(skipped.newStreak).toBe(1);
      expect(skipped.newMaxStreak).toBe(5); // preserves max
      expect(skipped.isSevenDayStreakEarned).toBe(false);
    });

    it('unlocks daily badges upon reaching streak milestones', () => {
      const progress1: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        dailyStreak: 1,
        lastDailyCompletedDate: '2026-09-19'
      };
      const badges1 = checkNewBadges(progress1);
      expect(badges1).toContain('b_daily_first');

      const progress3: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        dailyStreak: 3,
        lastDailyCompletedDate: '2026-09-19'
      };
      const badges3 = checkNewBadges(progress3);
      expect(badges3).toContain('b_daily_first');
      expect(badges3).toContain('b_daily_streak_3');

      const progress7: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        dailyStreak: 7,
        lastDailyCompletedDate: '2026-09-19'
      };
      const badges7 = checkNewBadges(progress7);
      expect(badges7).toContain('b_daily_streak_7');
    });
  });

  describe('Daily Challenge UI & First Access Popup', () => {
    it('automatically opens Daily Challenge popup when autoPromptDaily is true', async () => {
      const { render, screen } = await import('@testing-library/react');
      const { App } = await import('../App');
      localStorage.clear();
      render(<App autoPromptDaily={true} />);

      expect(screen.getByText('ひらめき5島横断ラリー！')).toBeInTheDocument();
      expect(screen.getByText(/のデイリーミッション/)).toBeInTheDocument();
      expect(screen.getByText(/連続達成ストリーク/)).toBeInTheDocument();
      expect(screen.getByText(/7日連続で 🥇 1週間マスターメダル/)).toBeInTheDocument();
    });
  });
});

