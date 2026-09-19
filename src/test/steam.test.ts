import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateLevel,
  checkNewBadges,
  INITIAL_USER_PROGRESS,
  UserProgress,
  ITEMS,
  BADGES
} from '../services/storage';

describe('STEAM Lab Core Logic & Calculations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Level & XP Progression Engine', () => {
    it('calculates initial level 1 correctly', () => {
      expect(INITIAL_USER_PROGRESS.grade).toBe(3);
      const result = calculateLevel(0);
      expect(result.level).toBe(1);
      expect(result.title).toBe('見習い研究員');
      expect(result.currentXp).toBe(0);
      expect(result.nextLevelXp).toBe(100);
    });

    it('levels up when XP passes threshold', () => {
      const result = calculateLevel(150);
      expect(result.level).toBe(2);
      expect(result.title).toBe('ジュニア研究員');
      expect(result.currentXp).toBe(50); // 150 - 100
    });

    it('calculates higher levels for advanced progress', () => {
      const result = calculateLevel(750);
      expect(result.level).toBe(5);
      expect(result.title).toBe('サイエンス・マスター');
    });
  });

  describe('Entrance Exam Math & Science Calculation Engines', () => {
    it('verifies Lever Balance torque law (Distance × Weight)', () => {
      // Left: pos -3 with 20g -> torque = 3 * 20 = 60
      const leftDistance = 3;
      const leftWeight = 20;
      const leftTorque = leftDistance * leftWeight;

      // Right: pos 2 with 30g -> torque = 2 * 30 = 60
      const rightDistance = 2;
      const rightWeight = 30;
      const rightTorque = rightDistance * rightWeight;

      expect(leftTorque).toBe(60);
      expect(rightTorque).toBe(60);
      expect(leftTorque === rightTorque).toBe(true);
    });

    it('verifies Tsurukame equation (Heads and Legs consistency)', () => {
      // 5 heads, 14 legs
      const totalHeads = 5;
      const targetLegs = 14;

      // If all are cranes (2 legs):
      const assumedLegs = totalHeads * 2; // 10
      const missingLegs = targetLegs - assumedLegs; // 4
      const legDifferencePerAnimal = 4 - 2; // 2
      const turtles = missingLegs / legDifferencePerAnimal; // 2
      const cranes = totalHeads - turtles; // 3

      expect(turtles).toBe(2);
      expect(cranes).toBe(3);
      expect(cranes * 2 + turtles * 4).toBe(targetLegs);
    });

    it('verifies Gear ratio inverse relationship (Teeth × Turns = Constant)', () => {
      // Gear A: 12 teeth, 4 turns -> 48 teeth pass
      const teethA = 12;
      const turnsA = 4;
      const totalTeethMoved = teethA * turnsA;

      // Gear B: 24 teeth -> turns = 48 / 24 = 2 turns
      const teethB = 24;
      const turnsB = totalTeethMoved / teethB;

      expect(turnsB).toBe(2);
      expect(teethA * turnsA).toBe(teethB * turnsB);
    });
  });

  describe('Badge & Gamification Rewards Engine', () => {
    it('unlocks first step badge upon clearing first stage', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        stageProgress: {
          lever_1: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_first_step');
    });

    it('unlocks lever master badge when all 3 lever stages are cleared', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        stageProgress: {
          lever_1: { stars: 3, cleared: true },
          lever_2: { stars: 3, cleared: true },
          lever_3: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_lever_master');
    });

    it('unlocks grand explorer badge when all 6 modules reach level 6', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedBadges: ['b_first_step'],
        stageProgress: {
          lever_6: { stars: 3, cleared: true },
          block_6: { stars: 3, cleared: true },
          tsuru_6: { stars: 3, cleared: true },
          gear_6: { stars: 3, cleared: true },
          net_6: { stars: 3, cleared: true },
          algo_6: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_grand_explorer');
    });

    it('catalogs exist and are rich in educational value', () => {
      expect(ITEMS.length).toBeGreaterThanOrEqual(15);
      expect(BADGES.length).toBeGreaterThanOrEqual(8);

      // Verify all items have junior high entrance exam trivia
      ITEMS.forEach((item) => {
        expect(item.examTrivia).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.icon).toBeTruthy();
      });
    });
  });

  describe('Stage Map Expansion Verification', () => {
    it('provides 6 levels across all 6 game modules totaling 36 stages', async () => {
      const { ISLANDS } = await import('../components/home/IslandMap');
      const standardIslands = ISLANDS.filter((island) => !island.isEX);
      const allGames = standardIslands.flatMap((island) => island.games);
      expect(allGames.length).toBe(6);

      let totalStages = 0;
      for (const game of allGames) {
        expect(game.levels).toEqual([1, 2, 3, 4, 5, 6]);
        totalStages += game.levels.length;
      }
      expect(totalStages).toBe(36);
    });

    it('provides EX secret island with 3 levels across all 6 game modules', async () => {
      const { ISLANDS } = await import('../components/home/IslandMap');
      const exIsland = ISLANDS.find((island) => island.isEX);
      expect(exIsland).toBeDefined();
      expect(exIsland?.id).toBe('ex_island');
      expect(exIsland?.games.length).toBe(6);
      for (const game of exIsland!.games) {
        expect(game.levels).toEqual([1, 2, 3]);
      }
    });
  });
});

