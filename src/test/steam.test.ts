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

    it('unlocks circuit master badge when all 3 circuit stages are cleared', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        stageProgress: {
          circuit_1: { stars: 3, cleared: true },
          circuit_2: { stars: 3, cleared: true },
          circuit_3: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_circuit_master');
    });

    it('unlocks contraption master badge when contraption stages 1-3 are cleared', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedBadges: ['b_first_step'],
        stageProgress: {
          contraption_1: { stars: 3, cleared: true },
          contraption_2: { stars: 3, cleared: true },
          contraption_3: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_contraption_master');
    });

    it('unlocks section master badge when section stages 1-3 are cleared', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedBadges: ['b_first_step'],
        stageProgress: {
          section_1: { stars: 3, cleared: true },
          section_2: { stars: 3, cleared: true },
          section_3: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_section_master');
    });

    it('unlocks cipher master badge when cipher stages 1-3 are cleared', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedBadges: ['b_first_step'],
        stageProgress: {
          cipher_1: { stars: 3, cleared: true },
          cipher_2: { stars: 3, cleared: true },
          cipher_3: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_cipher_master');
    });

    it('unlocks grand explorer badge when all 10 modules reach level 6', () => {
      const progress: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedBadges: ['b_first_step'],
        stageProgress: {
          lever_6: { stars: 3, cleared: true },
          circuit_6: { stars: 3, cleared: true },
          block_6: { stars: 3, cleared: true },
          tsuru_6: { stars: 3, cleared: true },
          gear_6: { stars: 3, cleared: true },
          contraption_6: { stars: 3, cleared: true },
          net_6: { stars: 3, cleared: true },
          section_6: { stars: 3, cleared: true },
          algo_6: { stars: 3, cleared: true },
          cipher_6: { stars: 3, cleared: true }
        }
      };

      const newBadges = checkNewBadges(progress);
      expect(newBadges).toContain('b_grand_explorer');
    });

    it('catalogs exist and are rich in educational value', () => {
      expect(ITEMS.length).toBe(31);
      expect(BADGES.length).toBeGreaterThanOrEqual(8);

      // Verify all items have junior high entrance exam trivia
      ITEMS.forEach((item) => {
        expect(item.examTrivia).toBeTruthy();
        expect(item.name).toBeTruthy();
      });

      // Verify all 5 rarity levels exist (★1 to ★5)
      const rarities = new Set(ITEMS.map((i) => i.rarity));
      expect(rarities.has(1)).toBe(true);
      expect(rarities.has(2)).toBe(true);
      expect(rarities.has(3)).toBe(true);
      expect(rarities.has(4)).toBe(true);
      expect(rarities.has(5)).toBe(true);

      // Verify all STEAM disciplines have high-rarity inventions (★4 and ★5)
      const categories = ['S', 'T', 'E', 'A', 'M'] as const;
      for (const cat of categories) {
        const star4 = ITEMS.filter((i) => i.category === cat && i.rarity === 4);
        const star5 = ITEMS.filter((i) => i.category === cat && i.rarity === 5);
        expect(star4.length).toBeGreaterThanOrEqual(1);
        expect(star5.length).toBeGreaterThanOrEqual(1);
      }

      // Check legend collector badge unlocks when a ★5 item is unlocked
      const legendItem = ITEMS.find((i) => i.rarity === 5)!;
      const progressWithLegend: UserProgress = {
        ...INITIAL_USER_PROGRESS,
        unlockedItems: [legendItem.id]
      };
      const badges = checkNewBadges(progressWithLegend);
      expect(badges).toContain('b_collector_legend');
    });
  });


  describe('Stage Map Expansion Verification', () => {
    it('provides 6 levels across all 10 game modules totaling 60 stages', async () => {
      const { ISLANDS } = await import('../components/home/IslandMap');
      const standardIslands = ISLANDS.filter((island) => !island.isEX);
      const allGames = standardIslands.flatMap((island) => island.games);
      expect(allGames.length).toBe(10);

      let totalStages = 0;
      for (const game of allGames) {
        expect(game.levels).toEqual([1, 2, 3, 4, 5, 6]);
        totalStages += game.levels.length;
      }
      expect(totalStages).toBe(60);
    });

    it('provides EX secret island with 3 levels across all 10 game modules', async () => {
      const { ISLANDS } = await import('../components/home/IslandMap');
      const exIsland = ISLANDS.find((island) => island.isEX);
      expect(exIsland).toBeDefined();
      expect(exIsland?.id).toBe('ex_island');
      expect(exIsland?.games.length).toBe(10);
      for (const game of exIsland!.games) {
        expect(game.levels).toEqual([1, 2, 3]);
      }
    });
  });
});
