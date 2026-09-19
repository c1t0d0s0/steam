import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { IslandMap, GameModuleType } from './components/home/IslandMap';
import { LeverBalanceGame } from './components/modules/science/LeverBalanceGame';
import { BlockCountGame } from './components/modules/math/BlockCountGame';
import { TsurukameGame } from './components/modules/math/TsurukameGame';
import { GearChainGame } from './components/modules/engineering/GearChainGame';
import { CubeNetGame } from './components/modules/art/CubeNetGame';
import { AlgoMazeGame } from './components/modules/tech/AlgoMazeGame';
import { StampBookModal } from './components/gamification/StampBookModal';
import { GachaModal } from './components/gamification/GachaModal';
import { MuseumModal } from './components/gamification/MuseumModal';
import { BadgeListModal } from './components/gamification/BadgeListModal';
import { DailyChallengeModal } from './components/gamification/DailyChallengeModal';
import {
  UserProgress,
  getStoredProgress,
  saveUserProgress,
  calculateLevel,
  checkNewBadges,
  calculateUpdatedDailyStreak,
  DailyChallengeState,
  BADGES,
  getStageKey,
  getLegacyStageKey,
  getStageProgressData
} from './services/storage';
import { generateDailyChallenge } from './services/problemGenerator';
import { sound } from './services/audio';

interface AppProps {
  autoPromptDaily?: boolean;
}

export const App: React.FC<AppProps> = ({ autoPromptDaily }) => {
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress);
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<{
    type: GameModuleType;
    level: number;
    isDaily?: boolean;
    dailyIndex?: number;
    customPuzzle?: any;
    customTitle?: string;
    customBadge?: string;
  } | null>(null);

  // Modals
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [isMuseumOpen, setIsMuseumOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);

  // Toast for newly unlocked badge
  const [unlockedBadgeToast, setUnlockedBadgeToast] = useState<string | null>(null);

  useEffect(() => {
    sound.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

  // Daily Challenge initialization & Auto-popup on first visit of the day
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let currentProgress = progress;
    let needsSave = false;

    // Check or generate today's daily challenge
    if (!currentProgress.dailyChallenge || currentProgress.dailyChallenge.date !== today) {
      const newDaily = generateDailyChallenge(
        currentProgress.solvedDailySignatures || [],
        today,
        currentProgress.grade
      );
      currentProgress = {
        ...currentProgress,
        dailyChallenge: newDaily
      };
      needsSave = true;
    }

    // First visit of the day: automatically open Daily Challenge popup!
    const shouldPrompt =
      autoPromptDaily !== undefined
        ? autoPromptDaily
        : typeof process === 'undefined' || process.env?.NODE_ENV !== 'test';

    if (shouldPrompt && currentProgress.lastDailyPromptDate !== today) {
      currentProgress = {
        ...currentProgress,
        lastDailyPromptDate: today
      };
      needsSave = true;
      setIsDailyOpen(true);
    }

    if (needsSave) {
      setProgress(currentProgress);
      saveUserProgress(currentProgress);
    }
  }, []);

  const updateProgressState = (newProgress: UserProgress) => {
    // Check level up
    const prevLevel = calculateLevel(progress.xp).level;
    const nextLevel = calculateLevel(newProgress.xp).level;
    if (nextLevel > prevLevel) {
      sound.playLevelUp();
      newProgress.level = nextLevel;
    }

    // Check new badges
    const newBadges = checkNewBadges(newProgress);
    if (newBadges.length > 0) {
      newProgress.unlockedBadges = [...newProgress.unlockedBadges, ...newBadges];
      const badgeInfo = BADGES.find((b) => b.id === newBadges[0]);
      if (badgeInfo) {
        setUnlockedBadgeToast(badgeInfo.title);
        setTimeout(() => setUnlockedBadgeToast(null), 4000);
      }
    }

    setProgress(newProgress);
    saveUserProgress(newProgress);
  };

  const handlePlayDailyQuestion = (questionIndex: number) => {
    if (!progress.dailyChallenge) return;
    const q = progress.dailyChallenge.questions[questionIndex];
    if (!q) return;

    setIsDailyOpen(false);
    setActiveGame({
      type: q.gameType,
      level: 1,
      isDaily: true,
      dailyIndex: questionIndex,
      customPuzzle: q.puzzle,
      customTitle: `📅 デイリー 第${questionIndex + 1}問 / 全5問`,
      customBadge: `第${questionIndex + 1}問 (${q.islandName})`
    });
  };

  const handleDailyNext = () => {
    if (!activeGame || !activeGame.isDaily || typeof activeGame.dailyIndex !== 'number') return;
    const nextIdx = activeGame.dailyIndex + 1;
    if (nextIdx < 5) {
      handlePlayDailyQuestion(nextIdx);
    } else {
      setActiveGame(null);
      setIsDailyOpen(true);
    }
  };

  const handleGameComplete = (stars: number) => {
    if (!activeGame) return;

    // Handle Daily Challenge game completion
    if (activeGame.isDaily && typeof activeGame.dailyIndex === 'number' && progress.dailyChallenge) {
      const idx = activeGame.dailyIndex;
      const currentDaily = progress.dailyChallenge;
      const clearedSet = new Set(currentDaily.clearedIndices);
      clearedSet.add(idx);
      const newClearedIndices = Array.from(clearedSet).sort((a, b) => a - b);
      const isNowAllCleared = newClearedIndices.length >= 5;

      // Add signature to solved list (never repeat)
      const solvedSig = currentDaily.questions[idx]?.signature;
      const newSolvedSigs = solvedSig
        ? Array.from(new Set([...progress.solvedDailySignatures, solvedSig]))
        : progress.solvedDailySignatures;

      let extraCoins = 20; // 20 coins per daily question
      let extraXp = 25;
      let newStreak = progress.dailyStreak;
      let newMaxStreak = progress.maxDailyStreak;
      let lastDailyCompletedDate = progress.lastDailyCompletedDate;

      if (isNowAllCleared && !currentDaily.completed) {
        // Grand reward for completing all 5 questions
        extraCoins += 100;
        extraXp += 80;
        const today = currentDaily.date;
        const streakRes = calculateUpdatedDailyStreak(
          progress.dailyStreak,
          progress.maxDailyStreak,
          progress.lastDailyCompletedDate,
          today
        );
        newStreak = streakRes.newStreak;
        newMaxStreak = streakRes.newMaxStreak;
        lastDailyCompletedDate = today;

        if (streakRes.isSevenDayStreakEarned) {
          extraCoins += 200; // 7-day streak medal bonus!
        }
      }

      const updatedDaily: DailyChallengeState = {
        ...currentDaily,
        clearedIndices: newClearedIndices,
        completed: currentDaily.completed || isNowAllCleared,
        completedAt: isNowAllCleared ? new Date().toISOString() : currentDaily.completedAt
      };

      const newProgress: UserProgress = {
        ...progress,
        coins: progress.coins + extraCoins,
        xp: progress.xp + extraXp,
        solvedDailySignatures: newSolvedSigs,
        dailyChallenge: updatedDaily,
        dailyStreak: newStreak,
        maxDailyStreak: newMaxStreak,
        lastDailyCompletedDate
      };

      updateProgressState(newProgress);
      return;
    }

    // Standard Stage Map Game Completion
    const currentGrade = progress.grade || 3;
    const stageKey = getStageKey(activeGame.type, activeGame.level, currentGrade);
    const stageData = getStageProgressData(progress.stageProgress, activeGame.type, activeGame.level, currentGrade);
    const existingStars = stageData.stars;
    const isFirstClear = !stageData.cleared;

    const earnedCoins = isFirstClear ? 30 : 10;
    const earnedXp = isFirstClear ? 50 : 15;

    const newStageProgress = {
      ...progress.stageProgress,
      [stageKey]: {
        stars: Math.max(existingStars, stars),
        cleared: true
      },
      // If grade is 3, also update legacy key for backward compatibility
      ...(currentGrade === 3 ? {
        [getLegacyStageKey(activeGame.type, activeGame.level)]: {
          stars: Math.max(existingStars, stars),
          cleared: true
        }
      } : {})
    };

    const newProgress: UserProgress = {
      ...progress,
      xp: progress.xp + earnedXp,
      coins: progress.coins + earnedCoins,
      stageProgress: newStageProgress
    };

    updateProgressState(newProgress);
  };

  const handleNextLevel = () => {
    if (!activeGame) return;
    if (activeGame.level < 6) {
      setActiveGame({ type: activeGame.type, level: activeGame.level + 1 });
    } else {
      setActiveGame(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50 select-none">
      {/* Header */}
      <Header
        progress={progress}
        onOpenDaily={() => setIsDailyOpen(true)}
        onOpenStamps={() => setIsStampOpen(true)}
        onOpenGacha={() => setIsGachaOpen(true)}
        onOpenMuseum={() => setIsMuseumOpen(true)}
        onOpenBadges={() => setIsBadgeOpen(true)}
        onToggleSound={() => {
          const toggled = !progress.soundEnabled;
          sound.enabled = toggled;
          const updated = { ...progress, soundEnabled: toggled };
          setProgress(updated);
          saveUserProgress(updated);
        }}
        onChangeGrade={(grade) => {
          const updated = { ...progress, grade };
          setProgress(updated);
          saveUserProgress(updated);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center">
        <IslandMap
          progress={progress}
          selectedIslandId={selectedIslandId}
          onSelectIslandId={setSelectedIslandId}
          onOpenDaily={() => setIsDailyOpen(true)}
          onLaunchGame={(type, level) => {
            const gameToIsland: Record<GameModuleType, string> = {
              lever: 'science',
              block: 'math',
              tsurukame: 'math',
              gear: 'engineering',
              cube_net: 'art',
              algo_maze: 'tech'
            };
            setSelectedIslandId(gameToIsland[type]);
            setActiveGame({ type, level });
          }}
        />
      </main>

      {/* Active Game Overlay */}
      {activeGame && (
        <>
          {activeGame.type === 'lever' && (
            <LeverBalanceGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}

          {activeGame.type === 'block' && (
            <BlockCountGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}

          {activeGame.type === 'tsurukame' && (
            <TsurukameGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}

          {activeGame.type === 'gear' && (
            <GearChainGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}

          {activeGame.type === 'cube_net' && (
            <CubeNetGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}

          {activeGame.type === 'algo_maze' && (
            <AlgoMazeGame
              level={activeGame.level}
              grade={progress.grade}
              onComplete={handleGameComplete}
              onBack={() => {
                setActiveGame(null);
                if (activeGame.isDaily) setIsDailyOpen(true);
              }}
              onNextLevel={activeGame.isDaily ? handleDailyNext : (activeGame.level < 6 ? handleNextLevel : undefined)}
              customPuzzles={activeGame.customPuzzle ? [activeGame.customPuzzle] : undefined}
              customTitle={activeGame.customTitle}
              customBadge={activeGame.customBadge}
            />
          )}
        </>
      )}

      {/* Gamification Modals */}
      {isDailyOpen && (
        <DailyChallengeModal
          progress={progress}
          onPlayQuestion={handlePlayDailyQuestion}
          onClose={() => setIsDailyOpen(false)}
        />
      )}

      {isStampOpen && (
        <StampBookModal
          progress={progress}
          onUpdateProgress={updateProgressState}
          onClose={() => setIsStampOpen(false)}
        />
      )}

      {isGachaOpen && (
        <GachaModal
          progress={progress}
          onUpdateProgress={updateProgressState}
          onClose={() => setIsGachaOpen(false)}
        />
      )}

      {isMuseumOpen && (
        <MuseumModal progress={progress} onClose={() => setIsMuseumOpen(false)} />
      )}

      {isBadgeOpen && (
        <BadgeListModal progress={progress} onClose={() => setIsBadgeOpen(false)} />
      )}

      {/* Toast Notification for Unlocked Badge */}
      {unlockedBadgeToast && (
        <div className="fixed bottom-6 right-6 z-70 bg-white border-2 border-amber-400 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-bounce">
          <span className="text-3xl">🏆</span>
          <div>
            <span className="text-[10px] font-black text-amber-700 block">
              新しいバッジを獲得！
            </span>
            <span className="text-sm font-black text-slate-800">{unlockedBadgeToast}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-slate-500 border-t border-amber-200/60 mt-8 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full gap-2">
        <p className="font-bold">
          © 2026 STEAM探検隊 〜めざせ！ひらめきマスター〜（小学校3〜6年・中学受験対策）
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.confirm('学習記録とコレクションデータを初期状態にリセットしますか？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline"
          >
            データをリセット
          </button>
        </div>
      </footer>
    </div>
  );
};
