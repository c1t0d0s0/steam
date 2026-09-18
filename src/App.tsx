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
import {
  UserProgress,
  getStoredProgress,
  saveUserProgress,
  calculateLevel,
  checkNewBadges,
  BADGES
} from './services/storage';
import { sound } from './services/audio';

export const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(getStoredProgress);
  const [activeGame, setActiveGame] = useState<{ type: GameModuleType; level: number } | null>(null);

  // Modals
  const [isStampOpen, setIsStampOpen] = useState(false);
  const [isGachaOpen, setIsGachaOpen] = useState(false);
  const [isMuseumOpen, setIsMuseumOpen] = useState(false);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);

  // Toast for newly unlocked badge
  const [unlockedBadgeToast, setUnlockedBadgeToast] = useState<string | null>(null);

  useEffect(() => {
    sound.enabled = progress.soundEnabled;
  }, [progress.soundEnabled]);

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

  const getStageKey = (type: GameModuleType, lvl: number) => {
    switch (type) {
      case 'lever':
        return `lever_${lvl}`;
      case 'block':
        return `block_${lvl}`;
      case 'tsurukame':
        return `tsuru_${lvl}`;
      case 'gear':
        return `gear_${lvl}`;
      case 'cube_net':
        return `net_${lvl}`;
      case 'algo_maze':
        return `algo_${lvl}`;
    }
  };

  const handleGameComplete = (stars: number) => {
    if (!activeGame) return;
    const stageKey = getStageKey(activeGame.type, activeGame.level);
    const existingStars = progress.stageProgress[stageKey]?.stars || 0;
    const isFirstClear = !progress.stageProgress[stageKey]?.cleared;

    const earnedCoins = isFirstClear ? 30 : 10;
    const earnedXp = isFirstClear ? 50 : 15;

    const newStageProgress = {
      ...progress.stageProgress,
      [stageKey]: {
        stars: Math.max(existingStars, stars),
        cleared: true
      }
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
    if (activeGame.level < 3) {
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
          onLaunchGame={(type, level) => setActiveGame({ type, level })}
        />
      </main>

      {/* Active Game Overlay */}
      {activeGame && (
        <>
          {activeGame.type === 'lever' && (
            <LeverBalanceGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}

          {activeGame.type === 'block' && (
            <BlockCountGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}

          {activeGame.type === 'tsurukame' && (
            <TsurukameGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}

          {activeGame.type === 'gear' && (
            <GearChainGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}

          {activeGame.type === 'cube_net' && (
            <CubeNetGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}

          {activeGame.type === 'algo_maze' && (
            <AlgoMazeGame
              level={activeGame.level}
              onComplete={handleGameComplete}
              onBack={() => setActiveGame(null)}
              onNextLevel={activeGame.level < 3 ? handleNextLevel : undefined}
            />
          )}
        </>
      )}

      {/* Gamification Modals */}
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
