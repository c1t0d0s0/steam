import React from 'react';
import { X, Trophy, Flame, CheckCircle2, Play, Lock, Sparkles, Award } from 'lucide-react';
import { UserProgress } from '../../services/storage';
import { sound } from '../../services/audio';

interface DailyChallengeModalProps {
  progress: UserProgress;
  onPlayQuestion: (questionIndex: number) => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  progress,
  onPlayQuestion,
  onClose
}) => {
  const dailyState = progress.dailyChallenge;
  const questions = dailyState?.questions || [];
  const clearedSet = new Set(dailyState?.clearedIndices || []);
  const isAllCompleted = dailyState?.completed || clearedSet.size >= 5;

  // Format today's date in Japanese
  const todayStr = dailyState?.date || new Date().toISOString().split('T')[0];
  const [year, month, day] = todayStr.split('-');
  const formattedDate = `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`;

  // Determine current active question (first uncleared question)
  let activeQuestionIndex = 0;
  for (let i = 0; i < 5; i++) {
    if (!clearedSet.has(i)) {
      activeQuestionIndex = i;
      break;
    }
  }

  // 7-day streak progress (1 to 7 cycle)
  const currentStreak = progress.dailyStreak || 0;
  const streakCycle = currentStreak % 7 === 0 && currentStreak > 0 ? 7 : currentStreak % 7;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-400 shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative flex flex-col my-auto max-h-[95vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-200 hover:bg-amber-300 active:scale-95 flex items-center justify-center text-amber-900 transition-all shadow-sm z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-full text-xs font-black mb-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{formattedDate} のデイリーミッション</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
            <span>🎯</span>
            <span>ひらめき5島横断ラリー！</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
            毎日それぞれの島から1問ずつ出題！過去に解いた問題と重複しない特別生成パズル！
          </p>
        </div>

        {/* 7-Day Streak & Medal Track */}
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-3.5 sm:p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
              <span className="text-sm font-black text-slate-800">
                連続達成ストリーク: <strong className="text-orange-600 text-base">{currentStreak}</strong> 日継続中！
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>7日連続で 🥇 1週間マスターメダル！</span>
            </div>
          </div>

          {/* 7-Day Dots Indicator */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
            {Array.from({ length: 7 }).map((_, idx) => {
              const dayNum = idx + 1;
              const isAchieved = dayNum <= streakCycle;
              const isMedalDay = dayNum === 7;

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border-2 transition-all ${
                    isAchieved
                      ? 'bg-gradient-to-b from-orange-400 to-amber-500 text-white border-orange-500 shadow-sm'
                      : isMedalDay
                      ? 'bg-amber-50 border-dashed border-amber-400 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-black mb-0.5">
                    {dayNum}日目
                  </span>
                  {isMedalDay ? (
                    <span className="text-lg">🥇</span>
                  ) : isAchieved ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300 my-1"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Questions List */}
        <div className="space-y-2.5 mb-4">
          {questions.map((q, idx) => {
            const isCleared = clearedSet.has(idx);
            const isNext = !isCleared && idx === activeQuestionIndex;
            const isLocked = !isCleared && idx > activeQuestionIndex;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!isLocked) {
                    sound.playClick();
                    onPlayQuestion(idx);
                  }
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition-all ${
                  isCleared
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm cursor-pointer hover:bg-emerald-100/70'
                    : isNext
                    ? 'bg-white border-amber-400 ring-2 ring-amber-300 shadow-md cursor-pointer hover:border-amber-500'
                    : 'bg-slate-100 border-slate-200 text-slate-400 opacity-80 cursor-not-allowed'
                }`}
              >
                {/* Left: Island Icon & Title */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      isCleared
                        ? 'bg-emerald-100'
                        : isNext
                        ? 'bg-gradient-to-tr from-amber-300 to-yellow-200'
                        : 'bg-slate-200'
                    }`}
                  >
                    {q.islandIcon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2 py-0.2 rounded-full bg-black/10">
                        第{idx + 1}問 / 全5問
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {q.islandName}
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-800">
                      {q.title}
                    </div>
                  </div>
                </div>

                {/* Right Action / Status */}
                <div className="shrink-0">
                  {isCleared ? (
                    <div className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>クリア！</span>
                    </div>
                  ) : isNext ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onPlayQuestion(idx);
                      }}
                      className="flex items-center gap-1 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-3.5 py-1.5 rounded-xl shadow-md active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>挑戦する！</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400 px-2 py-1">
                      <Lock className="w-4 h-4" />
                      <span>ロック</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Celebration or Next Action */}
        {isAllCompleted ? (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 text-center shadow-lg border-2 border-emerald-400 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-xl font-black mb-1">
              <Award className="w-6 h-6 text-yellow-300" />
              <span>本日のデイリーミッション完全制覇！</span>
              <Award className="w-6 h-6 text-yellow-300" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-100">
              全5問のSTEAMパズルを解き明かしました！今日の努力がひらめきマスターへの大きな一歩です！
            </p>
            <div className="inline-flex items-center gap-3 mt-3 px-4 py-1.5 bg-white/20 rounded-full text-xs font-black text-white">
              <span>獲得報酬: ⭐+100コイン & +80XP</span>
              <span>•</span>
              <span>明日も新しい問題が出題されます</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onPlayQuestion(activeQuestionIndex);
            }}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>第{activeQuestionIndex + 1}問に挑戦する！（{questions[activeQuestionIndex]?.islandName}）</span>
          </button>
        )}
      </div>
    </div>
  );
};
