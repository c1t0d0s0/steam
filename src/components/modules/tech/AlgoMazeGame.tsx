import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Play, ArrowUp, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

interface AlgoMazeGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: MazePuzzle[];
  customTitle?: string;
  customBadge?: string;
}

type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
type Command = 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT';
interface MazePuzzle {
  gridSize: number;
  start: { x: number; y: number; dir: Direction };
  goal: { x: number; y: number };
  walls: { x: number; y: number }[];
  maxCommands: number;
  explanation: string;
  examTip: string;
}

export const AlgoMazeGame: React.FC<AlgoMazeGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number): MazePuzzle[] => {
    switch (lvl) {
      case 1:
        return [
          {
            gridSize: 4,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 2, y: 2 },
            walls: [{ x: 1, y: 1 }, { x: 0, y: 2 }],
            maxCommands: 6,
            explanation: 'コンピュータは指示された命令を1行ずつ順番に実行します（順次処理）。前に2歩進み、右を向いて、また2歩進むことでゴールできました！',
            examTip: '【プログラミング思考の基本】複雑な目標も、「小さな命令（順次・分岐・反復）」に細かく分解すると必ず実現できます！'
          },
          {
            gridSize: 4,
            start: { x: 0, y: 0, dir: 'DOWN' as Direction },
            goal: { x: 2, y: 2 },
            walls: [{ x: 1, y: 1 }, { x: 2, y: 0 }],
            maxCommands: 6,
            explanation: '下を向いた状態からスタート！まず前に進み、左折してからゴールへ到達できました。',
            examTip: 'ロボットの現在の向き（正面）を常に意識することがプログラムの基本です！'
          },
          {
            gridSize: 4,
            start: { x: 0, y: 3, dir: 'RIGHT' as Direction },
            goal: { x: 2, y: 1 },
            walls: [{ x: 1, y: 2 }, { x: 0, y: 1 }],
            maxCommands: 6,
            explanation: '進んでから左を向いて上へ進むルートを正確にプログラミングできました！',
            examTip: 'ゴールから逆にたどる「逆算思考」を使うと最短の手順が見つかりやすいです！'
          }
        ];
      case 2:
        return [
          {
            gridSize: 4,
            start: { x: 0, y: 3, dir: 'UP' as Direction },
            goal: { x: 3, y: 0 },
            walls: [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 1 }],
            maxCommands: 8,
            explanation: '目の前の岩を避けるため、「右を向く」「進む」「左を向く」と的確に方向転換の命令を組み立てられました！',
            examTip: '【アルゴリズムの最短経路】迷路を解くときは「ロボットの視点（主観）」になって左右を判断するのがポイントです！'
          },
          {
            gridSize: 4,
            start: { x: 3, y: 3, dir: 'LEFT' as Direction },
            goal: { x: 0, y: 0 },
            walls: [{ x: 2, y: 2 }, { x: 1, y: 1 }, { x: 2, y: 0 }],
            maxCommands: 8,
            explanation: '左向きからスタートし、障害物の隙間を抜けて北西のゴールへ導くことができました！',
            examTip: '障害物の配置を見て、行けないマス（デッドエンド）を消去法で見分けましょう。'
          },
          {
            gridSize: 4,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 3, y: 3 },
            walls: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
            maxCommands: 8,
            explanation: '中央の岩の塊を迂回して右回りでゴールへ！回り道を選ぶ判断力が見事です。',
            examTip: '最短ルートが塞がれているときは、遠回りでも確実に通れる道を選ぶ柔軟性が大切です。'
          }
        ];
      case 3:
        return [
          {
            gridSize: 5,
            start: { x: 0, y: 4, dir: 'UP' as Direction },
            goal: { x: 4, y: 0 },
            walls: [
              { x: 0, y: 2 },
              { x: 1, y: 2 },
              { x: 2, y: 4 },
              { x: 2, y: 2 },
              { x: 3, y: 1 },
              { x: 4, y: 3 }
            ],
            maxCommands: 10,
            explanation: '入り組んだ障害物迷路を見事に突破！条件に合わせて最適な手順を計画する「論理的思考力」がしっかり身についています。',
            examTip: '思考力入試・適性検査頻出！「指示されたルール通りに状態がどう変化するか」を丁寧に追跡（トレース）する練習になります！'
          },
          {
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 4, y: 4 },
            walls: [
              { x: 2, y: 0 },
              { x: 2, y: 1 },
              { x: 1, y: 3 },
              { x: 2, y: 3 },
              { x: 3, y: 3 }
            ],
            maxCommands: 10,
            explanation: '5×5の広大なフィールドで、縦横の障害壁をくぐり抜けて対角線のゴールへ到達！',
            examTip: 'マス目が大きくなっても、1手先、2手先の状態を予測しながら命令を並べましょう！'
          },
          {
            gridSize: 5,
            start: { x: 4, y: 0, dir: 'DOWN' as Direction },
            goal: { x: 0, y: 4 },
            walls: [
              { x: 4, y: 2 },
              { x: 3, y: 2 },
              { x: 2, y: 2 },
              { x: 1, y: 3 }
            ],
            maxCommands: 10,
            explanation: '下向きスタートから中央の防壁を回り込んで南西ゴールへ見事にゴールイン！',
            examTip: '複雑なコースも「曲がるポイント」をあらかじめ決めておくとミスが減ります！'
          }
        ];
      case 4:
        return [
          {
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 4, y: 4 },
            walls: [
              { x: 1, y: 1 },
              { x: 2, y: 1 },
              { x: 3, y: 1 },
              { x: 1, y: 3 },
              { x: 2, y: 3 },
              { x: 3, y: 3 }
            ],
            maxCommands: 12,
            explanation: 'S字状の二重の壁をジグザグにすり抜けるコースをクリア！',
            examTip: '【パターンの繰り返し】「進んで右、進んで左」の繰り返し（ループ）思考が入試で問われます！'
          },
          {
            gridSize: 5,
            start: { x: 0, y: 4, dir: 'RIGHT' as Direction },
            goal: { x: 4, y: 0 },
            walls: [
              { x: 1, y: 3 },
              { x: 2, y: 3 },
              { x: 3, y: 3 },
              { x: 1, y: 1 },
              { x: 2, y: 1 },
              { x: 3, y: 1 }
            ],
            maxCommands: 12,
            explanation: '下から上へと登っていくジグザグ経路を見事にプログラミングしました！',
            examTip: 'アルゴリズムの基本構造「順次・選択・反復」のうち、繰り返しパターンの見立てがポイントです！'
          },
          {
            gridSize: 5,
            start: { x: 4, y: 4, dir: 'UP' as Direction },
            goal: { x: 0, y: 0 },
            walls: [
              { x: 3, y: 3 },
              { x: 2, y: 3 },
              { x: 1, y: 3 },
              { x: 3, y: 1 },
              { x: 2, y: 1 },
              { x: 1, y: 1 }
            ],
            maxCommands: 12,
            explanation: '逆走コースのS字迷路も落ち着いてロボットの主観視点で左右を判断できました！',
            examTip: 'ロボットが上向きの時と下向きの時で、左右の旋回方向が逆になる感覚をマスターしましょう！'
          }
        ];
      case 5:
        return [
          {
            gridSize: 6,
            start: { x: 0, y: 5, dir: 'UP' as Direction },
            goal: { x: 5, y: 0 },
            walls: [
              { x: 2, y: 2 },
              { x: 2, y: 3 },
              { x: 3, y: 2 },
              { x: 3, y: 3 },
              { x: 1, y: 4 },
              { x: 4, y: 1 }
            ],
            maxCommands: 14,
            explanation: '広大な6×6フィールド！中央の巨大要塞を大きく外回りしてゴール達成！',
            examTip: '【最短経路の組み合わせ】算数の「道順の場合の数」と直結！効率的な最短ステップを考えましょう。'
          },
          {
            gridSize: 6,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 5, y: 5 },
            walls: [
              { x: 2, y: 1 },
              { x: 2, y: 2 },
              { x: 3, y: 3 },
              { x: 3, y: 4 },
              { x: 1, y: 3 },
              { x: 4, y: 2 }
            ],
            maxCommands: 14,
            explanation: '互い違いに配置された防壁の狭間をくぐり抜ける高度なプログラムです！',
            examTip: 'プログラミングでは、命令数が上限を超えないように無駄な旋回を省く最適化が重要です！'
          },
          {
            gridSize: 6,
            start: { x: 5, y: 5, dir: 'UP' as Direction },
            goal: { x: 0, y: 0 },
            walls: [
              { x: 3, y: 3 },
              { x: 3, y: 2 },
              { x: 2, y: 3 },
              { x: 2, y: 2 },
              { x: 4, y: 1 },
              { x: 1, y: 4 }
            ],
            maxCommands: 14,
            explanation: '南東から北西へと対角線を横断するダイナミックなロングルートを突破！',
            examTip: '命令キューを1つずつ頭の中でデバッグ（誤り探し）する力がしっかり鍛えられています！'
          }
        ];
      case 6:
      default:
        return [
          {
            gridSize: 6,
            start: { x: 0, y: 0, dir: 'RIGHT' as Direction },
            goal: { x: 5, y: 5 },
            walls: [
              { x: 1, y: 0 },
              { x: 1, y: 1 },
              { x: 1, y: 2 },
              { x: 1, y: 3 },
              { x: 3, y: 2 },
              { x: 3, y: 3 },
              { x: 3, y: 4 },
              { x: 4, y: 2 }
            ],
            maxCommands: 16,
            explanation: 'スパイラル状に回り込む最難関の迷宮を完全攻略！見事なアルゴリズムマスターです！',
            examTip: '【達人級・自律走行アルゴリズム】自動運転車やロボット掃除機も、この探索手順の組み合わせで動いています！'
          },
          {
            gridSize: 6,
            start: { x: 5, y: 0, dir: 'LEFT' as Direction },
            goal: { x: 0, y: 5 },
            walls: [
              { x: 4, y: 0 },
              { x: 4, y: 1 },
              { x: 4, y: 2 },
              { x: 4, y: 3 },
              { x: 2, y: 2 },
              { x: 2, y: 3 },
              { x: 2, y: 4 },
              { x: 1, y: 2 }
            ],
            maxCommands: 16,
            explanation: '迷路を逆から巻き込むような最深ルートを正確にトレースできました！',
            examTip: '大学入試情報や思考力入試で出題される迷路探索アルゴリズムの基礎を完全マスター！'
          },
          {
            gridSize: 6,
            start: { x: 0, y: 5, dir: 'RIGHT' as Direction },
            goal: { x: 5, y: 0 },
            walls: [
              { x: 1, y: 5 },
              { x: 1, y: 4 },
              { x: 1, y: 3 },
              { x: 1, y: 2 },
              { x: 3, y: 3 },
              { x: 3, y: 2 },
              { x: 3, y: 1 },
              { x: 4, y: 3 }
            ],
            maxCommands: 16,
            explanation: '長大な迷路の最後までバグ（不具合）なく走り切る緻密な論理設計ができました！',
            examTip: 'コンピュータに意図通りに指示を与えるプログラミング思考は、これからのすべての学びの土台になります！'
          }
        ];
    }
  };

  const mazes = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const maze = mazes[problemIndex % mazes.length];

  const [commands, setCommands] = useState<Command[]>([]);
  const [botState, setBotState] = useState({
    x: maze.start.x,
    y: maze.start.y,
    dir: maze.start.dir
  });
  const [isRunning, setIsRunning] = useState(false);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('命令カードを並べてロボットを星まで導こう！');

  const DIR_DEG: Record<Direction, number> = {
    UP: 0,
    RIGHT: 90,
    DOWN: 180,
    LEFT: 270
  };

  const DIR_LABEL: Record<Direction, { text: string; icon: string }> = {
    UP: { text: '上（北）', icon: '⬆️' },
    RIGHT: { text: '右（東）', icon: '➡️' },
    DOWN: { text: '下（南）', icon: '⬇️' },
    LEFT: { text: '左（西）', icon: '⬅️' }
  };

  const switchProblem = (idx: number) => {
    if (isRunning) return;
    const nextIdx = idx % mazes.length;
    const nextM = mazes[nextIdx];
    setProblemIndex(nextIdx);
    setCommands([]);
    setExecutingIndex(null);
    setBotState({
      x: nextM.start.x,
      y: nextM.start.y,
      dir: nextM.start.dir
    });
    setIsCompleted(false);
    setFeedback('命令カードを並べてロボットを星まで導こう！');
  };

  const addCommand = (cmd: Command) => {
    if (commands.length >= maze.maxCommands || isRunning) return;
    sound.playClick();
    setCommands([...commands, cmd]);
  };

  const clearCommands = () => {
    if (isRunning) return;
    sound.playClick();
    setCommands([]);
    setExecutingIndex(null);
    resetBot();
  };

  const resetBot = () => {
    setBotState({
      x: maze.start.x,
      y: maze.start.y,
      dir: maze.start.dir
    });
  };

  const turnDir = (current: Direction, turn: 'LEFT' | 'RIGHT'): Direction => {
    const dirs: Direction[] = ['UP', 'RIGHT', 'DOWN', 'LEFT'];
    const idx = dirs.indexOf(current);
    if (turn === 'RIGHT') {
      return dirs[(idx + 1) % 4];
    } else {
      return dirs[(idx + 3) % 4];
    }
  };

  const runProgram = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    setFeedback('プログラム実行中...');
    let curX = maze.start.x;
    let curY = maze.start.y;
    let curDir = maze.start.dir;

    setBotState({ x: curX, y: curY, dir: curDir });

    for (let i = 0; i < commands.length; i++) {
      setExecutingIndex(i);
      await new Promise((r) => setTimeout(r, 450));
      const cmd = commands[i];

      if (cmd === 'TURN_LEFT') {
        sound.playClick();
        curDir = turnDir(curDir, 'LEFT');
      } else if (cmd === 'TURN_RIGHT') {
        sound.playClick();
        curDir = turnDir(curDir, 'RIGHT');
      } else if (cmd === 'FORWARD') {
        sound.playClick();
        let nextX = curX;
        let nextY = curY;
        if (curDir === 'UP') nextY -= 1;
        if (curDir === 'RIGHT') nextX += 1;
        if (curDir === 'DOWN') nextY += 1;
        if (curDir === 'LEFT') nextX -= 1;

        // Check boundary
        if (nextX < 0 || nextX >= maze.gridSize || nextY < 0 || nextY >= maze.gridSize) {
          sound.playWrong();
          setFeedback('コースの外に飛び出してしまった！プログラムを直そう。');
          setIsRunning(false);
          setExecutingIndex(null);
          return;
        }

        // Check wall
        if (maze.walls.some((w) => w.x === nextX && w.y === nextY)) {
          sound.playWrong();
          setFeedback('岩にぶつかってしまった！別のルートを考えてみよう。');
          setIsRunning(false);
          setExecutingIndex(null);
          return;
        }

        curX = nextX;
        curY = nextY;
      }

      setBotState({ x: curX, y: curY, dir: curDir });
    }

    setExecutingIndex(null);
    await new Promise((r) => setTimeout(r, 300));

    if (curX === maze.goal.x && curY === maze.goal.y) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('ゴール達成！見事なプログラムです！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('ゴールに届かなかったよ！命令を追加するか直してみてね。');
    }
    setIsRunning(false);
  };

  return (
    <GameModalWrapper
      title={customTitle || "プログラミング迷路"}
      badgeTag={customBadge || `テック研究所 Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={maze.explanation}
      examTip={maze.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={mazes.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setCommands([]);
        resetBot();
        setIsCompleted(false);
        setFeedback('命令カードを並べてロボットを星まで導こう！');
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-sky-50 border border-sky-200 rounded-2xl mb-2.5 font-extrabold text-sky-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Direction Status & Compass Banner */}
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-900 border-2 border-indigo-500/50 rounded-2xl text-xs sm:text-sm font-black text-white shadow-md mb-3">
          <span className="text-slate-300">🤖 ロボットの正面の向き:</span>
          <span className="px-2.5 py-0.5 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 shadow">
            <span className="text-base">{DIR_LABEL[botState.dir].icon}</span>
            <span>{DIR_LABEL[botState.dir].text}</span>
          </span>
        </div>

        {/* Maze Grid Stage */}
        <div
          className="grid gap-1.5 p-3 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-xl mb-4"
          style={{
            gridTemplateColumns: `repeat(${maze.gridSize}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: maze.gridSize }).map((_, y) => (
            <React.Fragment key={y}>
              {Array.from({ length: maze.gridSize }).map((_, x) => {
                const isBot = botState.x === x && botState.y === y;
                const isGoal = maze.goal.x === x && maze.goal.y === y;
                const isWall = maze.walls.some((w) => w.x === x && w.y === y);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-black relative transition-all duration-300 overflow-visible ${
                      isWall
                        ? 'bg-slate-700 border-2 border-slate-600 shadow-inner'
                        : 'bg-slate-900/80 border border-slate-700/50'
                    }`}
                  >
                    {isWall && <span className="text-xl">🪨</span>}
                    {isGoal && (
                      <span className="text-2xl sm:text-3xl animate-pulse-subtle filter drop-shadow">
                        ⭐
                      </span>
                    )}
                    {isBot && (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Rotating Directional Robot Container */}
                        <div
                          className="relative flex items-center justify-center transition-transform duration-300 ease-out"
                          style={{
                            transform: `rotate(${DIR_DEG[botState.dir]}deg)`
                          }}
                        >
                          {/* Front Direction Indicator Arrow pointing UP (rotates with robot) */}
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-amber-300 animate-pulse drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                          </div>

                          {/* Robot Body */}
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-sky-400 via-indigo-500 to-indigo-700 border-2 border-white shadow-lg flex flex-col items-center justify-center text-white relative">
                            {/* Antenna at front */}
                            <div className="absolute -top-2 w-1.5 h-2 bg-amber-400 rounded-t-sm flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-amber-300 -mt-1 shadow-[0_0_5px_#fde047]" />
                            </div>
                            {/* Headlights / Eyes facing forward */}
                            <div className="flex gap-1.5 mb-0.5 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_5px_#fde047] border border-amber-100" />
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_5px_#fde047] border border-amber-100" />
                            </div>
                            {/* Chest visor */}
                            <div className="w-3.5 h-1 bg-sky-200/80 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Command Queue Box */}
        <div className="w-full max-w-md bg-slate-100 border-2 border-slate-300 rounded-2xl p-2.5 sm:p-3 mb-3">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-xs font-black text-slate-600">
              命令キュー ({commands.length}/{maze.maxCommands})
            </span>
            <button
              onClick={clearCommands}
              disabled={isRunning || commands.length === 0}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>クリア</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[44px] bg-white p-2 rounded-xl border border-slate-200">
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm transition-all ${
                  executingIndex === idx
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300 scale-110 z-10'
                    : 'bg-sky-500 text-white border border-sky-600'
                }`}
              >
                <span>{idx + 1}.</span>
                {cmd === 'FORWARD' && <span>⬆️ すすむ</span>}
                {cmd === 'TURN_LEFT' && <span>↩️ ひだり</span>}
                {cmd === 'TURN_RIGHT' && <span>↪️ みぎ</span>}
              </div>
            ))}
            {commands.length === 0 && (
              <span className="text-xs text-slate-400 font-bold self-center">
                下のカードを押して命令を追加してね！
              </span>
            )}
          </div>
        </div>

        {/* Available Action Cards Bar */}
        <div className="w-full max-w-md grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => addCommand('FORWARD')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2 px-2 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowUp className="w-5 h-5 text-sky-600" />
            <span>前にすすむ</span>
            <span className="text-[10px] text-sky-600/80 font-normal">正面へ1マス</span>
          </button>
          <button
            onClick={() => addCommand('TURN_LEFT')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2 px-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowLeft className="w-5 h-5 text-amber-600" />
            <span>左を向く</span>
            <span className="text-[10px] text-amber-700/80 font-normal">左に90°回転</span>
          </button>
          <button
            onClick={() => addCommand('TURN_RIGHT')}
            disabled={isRunning || commands.length >= maze.maxCommands}
            className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowRight className="w-5 h-5 text-indigo-600" />
            <span>右を向く</span>
            <span className="text-[10px] text-indigo-700/80 font-normal">右に90°回転</span>
          </button>
        </div>

        {/* Execute Button */}
        <button
          onClick={runProgram}
          disabled={isRunning || commands.length === 0}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>プログラムを実行する！</span>
        </button>
      </div>
    </GameModalWrapper>
  );
};
