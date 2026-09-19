import { GameModuleType } from '../components/home/IslandMap';

export interface ExPuzzleDefinition {
  title: string;
  badge: string;
  puzzle: any;
}

export const EX_PUZZLES: Record<GameModuleType, Record<number, ExPuzzleDefinition>> = {
  lever: {
    1: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        targetPos: 4,
        initialWeights: [
          { pos: -4, weight: 30, locked: true },
          { pos: -2, weight: 20, locked: true }
        ],
        availableWeights: [15, 25, 35, 40],
        explanation: '左側のトルク合計は「4×30(120) + 2×20(40) = 160」！右側の距離4におもりを吊るすので、160 ÷ 4 = 40g が正解です！',
        examTip: '【多重モーメントの足し算】支点の左側に複数のおもりがある時は、それぞれの「距離×重さ」を足し算して合計モーメントを計算しよう！'
      }
    },
    2: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        targetPos: 2,
        initialWeights: [
          { pos: -3, weight: 30, locked: true },
          { pos: -4, weight: 10, locked: true }
        ],
        availableWeights: [45, 55, 60, 65],
        explanation: '左側のトルク合計は「3×30(90) + 4×10(40) = 130」！右側の距離2におもりを吊るすので、130 ÷ 2 = 65g が正解です！',
        examTip: '【逆比の極意】支点からの距離が近ければ近いほど、釣り合わせるためには大きなおもりが必要になります！'
      }
    },
    3: {
      title: '多重モーメント・連鎖天秤パズル (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        targetPos: 3,
        initialWeights: [
          { pos: -3, weight: 50, locked: true },
          { pos: -4, weight: 15, locked: true }
        ],
        availableWeights: [55, 60, 65, 70],
        explanation: '左側のトルク合計は「3×50(150) + 4×15(60) = 210」！右側の距離3におもりを吊るすので、210 ÷ 3 = 70g が正解です！',
        examTip: '【STEAM天秤マスター認定】左右のモーメント総和（Σ 距離×重さ）を瞬時に見抜く計算力は中学受験物理の強力な武器です！'
      }
    }
  },
  block: {
    1: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 },
          { x: 2, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 },
          { x: 0, y: 2, z: 0 }
        ],
        answer: 10,
        options: [8, 9, 10, 11],
        explanation: '1段目（底面）に6個、2段目に3個、3段目に1個あり、合計「10個」です！',
        examTip: '【段ごとのスライス計算法】下から1段目、2段目、3段目と水平にスライスして数えると、隠れた積み木も見逃しません！'
      }
    },
    2: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 2 },
          { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
          { x: 2, y: 1, z: 0 },
          { x: 0, y: 2, z: 0 }
        ],
        answer: 14,
        options: [12, 13, 14, 15],
        explanation: '1段目に7個、2段目に5個、3段目に2個あり、合計「14個」です！奥の柱の陰にあるブロックも正確にカウントしましょう。',
        examTip: '【上から見た図の数字書き込み】各マスのブロックの高さを書き込む「見取り図解法」は中学受験の超頻出テクニックです！'
      }
    },
    3: {
      title: '超立体キューブ要塞・幻影積み木 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        blocks: [
          { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: 2 },
          { x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 0, z: 2 },
          { x: 2, y: 0, z: 0 }, { x: 2, y: 0, z: 1 }, { x: 2, y: 0, z: 2 },
          { x: 0, y: 1, z: 0 }, { x: 0, y: 1, z: 1 },
          { x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 1 },
          { x: 2, y: 1, z: 0 }, { x: 2, y: 1, z: 1 },
          { x: 0, y: 2, z: 0 },
          { x: 1, y: 2, z: 0 },
          { x: 2, y: 2, z: 0 }
        ],
        answer: 18,
        options: [16, 17, 18, 19],
        explanation: '1段目に9個（全面）、2段目に6個、3段目に3個あり、合計「18個」です！立体要塞の空間構成を完璧に把握できました！',
        examTip: '【立体の三面図把握】上から・正面から・右横からの3つの視点を組み合わせることで、どんな複雑な立体も完全攻略できます！'
      }
    }
  },
  tsurukame: {
    1: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        totalHeads: 50,
        totalLegs: 140,
        correctCranes: 30,
        correctTurtles: 20,
        explanation: 'もし全員ツルなら足は 50×2=100本。実際の140本より40本足りない。40÷(4-2) = 20匹のカメ！ツルは 50-20 = 30羽です！',
        examTip: '【もしも全員〜なら（仮定算）】全員が足の少ないツルだと仮定して、不足分をカメと入れ替えていくのがつるかめ算の神髄です！'
      }
    },
    2: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        totalHeads: 60,
        totalLegs: 176,
        correctCranes: 32,
        correctTurtles: 28,
        explanation: 'もし全員ツルなら足は 60×2=120本。176-120=56本足りない。56÷2 = 28匹のカメ！ツルは 60-28 = 32羽です！',
        examTip: '【差集め算への応用】足の差「2本」に着目して、合計の差を1匹あたりの差で割る思考法を身につけよう！'
      }
    },
    3: {
      title: '究極のつるかめ算ビジュアルアリーナ (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        totalHeads: 100,
        totalLegs: 268,
        correctCranes: 66,
        correctTurtles: 34,
        explanation: 'もし全員カメなら 100×4=400本。400-268=132本多い。132÷2 = 66羽のツル！カメは 100-66 = 34匹です！',
        examTip: '【面積図マスター】頭数×足の数の長方形の差をイメージできるようになると、どんな大頭数のつるかめ算も秒速で解けます！'
      }
    }
  },
  gear: {
    1: {
      title: '超遊星からくり大歯車機構 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        question: '動力ギアA（時計回り）から連動する5連ギア機構があるよ。5番目のギアEはどちら向きに回るかな？',
        targetDirection: 'CW',
        gears: [
          { label: 'A (時計)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#38bdf8' },
          { label: 'B', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#f43f5e' },
          { label: 'C', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#10b981' },
          { label: 'D', teeth: 12, radius: 36, isCW: false, speedSec: 4, color: '#f59e0b' },
          { label: 'E (?)', teeth: 12, radius: 36, isCW: true, speedSec: 4, color: '#8b5cf6' }
        ],
        explanation: '噛み合う歯車は回る向きが交互に反転します！A(時計) → B(反時計) → C(時計) → D(反時計) → E(時計回り) となります！',
        examTip: '【奇数番目の法則】1枚目(A)が時計回りなら、3枚目(C)や5枚目(E)など奇数番目のギアはすべて同じ時計回りに回転します！'
      }
    },
    2: {
      title: '超遊星からくり大歯車機構 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        question: '歯数24のギアA（時計回り）が1回転するとき、噛み合っている歯数8のギアBは何回転するかな？',
        isRatioPuzzle: true,
        correctTurns: 3,
        options: [1, 2, 3, 4],
        gears: [
          { label: 'A (24枚)', teeth: 24, radius: 48, isCW: true, speedSec: 6, color: '#38bdf8' },
          { label: 'B (8枚)', teeth: 8, radius: 24, isCW: false, speedSec: 2, color: '#f43f5e' }
        ],
        explanation: '歯数の比が 24 : 8 = 3 : 1 なので、回転数の比は逆比の 1 : 3！ギアAが1回転するとギアBは「3回転」します！',
        examTip: '【歯数と回転数の反比例】歯数が 1/3 になると、回転数は 3倍 にスピードアップします！'
      }
    },
    3: {
      title: '超遊星からくり大歯車機構 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        question: '歯数32のギアAが1回転するとき、アイドラギアB(16枚)を経て回るギアC(8枚)は何回転するかな？',
        isRatioPuzzle: true,
        correctTurns: 4,
        options: [2, 3, 4, 6],
        gears: [
          { label: 'A (32枚)', teeth: 32, radius: 48, isCW: true, speedSec: 8, color: '#38bdf8' },
          { label: 'B (16枚)', teeth: 16, radius: 32, isCW: false, speedSec: 4, color: '#10b981' },
          { label: 'C (8枚)', teeth: 8, radius: 20, isCW: true, speedSec: 2, color: '#f59e0b' }
        ],
        explanation: '中継ギアBの歯数は全体の回転比に影響しません！最初と最後の歯車比 32 ÷ 8 = 4回転 が正解です！',
        examTip: '【中継アイドラギアの性質】間にあるギアは回転方向を中継するだけで、全体の回転比は最初と最後のギアの歯数だけで決まります！'
      }
    }
  },
  cube_net: {
    1: {
      title: '立体超幾何・究極展開図マスター (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        question: '【EX裏 3-3型展開図】この正統な3-3型展開図で、面「A」と平行に向かい合う面はどれかな？',
        correctAnswer: '面C',
        options: ['面B', '面C', '面D', '面E'],
        explanation: '正解は「面C」！上段3枚並びの両端である「A」と「C」が、組み立てると平行に向かい合う対面になります！',
        examTip: '【3-3型の対面ペア】上段の両端(A-C)、下段の両端(D-F)、そして中央同士(B-E)の3組が向かい合います！',
        gridCols: 5,
        grid: [
          { label: 'A', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          { label: 'B', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: 'C', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          null,
          null,
          null,
          null,
          { label: 'D', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: 'E', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: 'F', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' }
        ]
      }
    },
    2: {
      title: '立体超幾何・究極展開図マスター (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        question: '【EX裏 2-2-2型ギザギザ階段】この展開図で、面「B」と平行に向かい合う面はどれかな？',
        correctAnswer: '面E',
        options: ['面A', '面C', '面D', '面E'],
        explanation: '正解は「面E」！上段右の「B」と下段左の「E」が、2段差を越えて平行に向かい合う対面になります！',
        examTip: '【2-2-2型の対面ペア】AとD、BとE、CとF！階段の段差を挟んで互い違いに向かい合う3組のペアになります！',
        gridCols: 4,
        grid: [
          { label: 'A', bg: 'bg-cyan-400', border: 'border-cyan-600', textClass: 'text-cyan-950' },
          { label: 'B', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          null,
          null,
          null,
          { label: 'C', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' },
          { label: 'D', bg: 'bg-cyan-300', border: 'border-cyan-500', textClass: 'text-cyan-950' },
          null,
          null,
          null,
          { label: 'E', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' },
          { label: 'F', bg: 'bg-cyan-200', border: 'border-cyan-400', textClass: 'text-cyan-950' }
        ]
      }
    },
    3: {
      title: '立体超幾何・究極展開図マスター (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        question: '【EX裏 和が7のサイコロ】上の面が「2」のとき、底面になる「？」に入る数字は何かな？',
        correctAnswer: '5',
        options: ['3', '4', '5', '6'],
        explanation: '正解は「5」！向かい合う面の目の和が7になるので、7 - 2 = 5 になります！',
        examTip: '【サイコロの基本定理】向かい合う面の合計は必ず「7」！1と6、2と5、3と4 が対面ペアです！',
        gridCols: 4,
        grid: [
          null,
          { label: '2', bg: 'bg-amber-400', border: 'border-amber-600', textClass: 'text-amber-950' },
          null,
          null,
          { label: '1', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: '3', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          { label: '6', bg: 'bg-sky-400', border: 'border-sky-600', textClass: 'text-sky-950' },
          { label: '4', bg: 'bg-sky-300', border: 'border-sky-500', textClass: 'text-sky-950' },
          null,
          null,
          { label: '?', bg: 'bg-rose-400', border: 'border-rose-600', textClass: 'text-white' },
          null
        ]
      }
    }
  },
  algo_maze: {
    1: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.1)',
      badge: 'EX裏 Lv.1',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 0, dir: 'RIGHT' },
        goal: { x: 4, y: 4 },
        walls: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 }
        ],
        maxCommands: 14,
        explanation: '壁の位置を把握し、最少コマンドで右下のゴールへ到達せよ！',
        examTip: '【アルゴリズムの最短経路】壁の位置を把握し、回転回数を最小限に抑えるルートを組み立てましょう！'
      }
    },
    2: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.2)',
      badge: 'EX裏 Lv.2',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 4, dir: 'UP' },
        goal: { x: 4, y: 0 },
        walls: [
          { x: 0, y: 2 },
          { x: 1, y: 2 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 0 },
          { x: 2, y: 4 }
        ],
        maxCommands: 16,
        explanation: '中央の遮断壁を迂回し、最少コマンドで右上の量子コアへ進め！',
        examTip: '【順次処理の精密化】「進む」と「向きを変える」の連続を頭の中でシミュレーションしてプログラミングしよう！'
      }
    },
    3: {
      title: '超難解AIアルゴリズム量子迷路 (EX Lv.3)',
      badge: 'EX裏 Lv.3',
      puzzle: {
        gridSize: 5,
        start: { x: 0, y: 2, dir: 'RIGHT' },
        goal: { x: 4, y: 2 },
        walls: [
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 }
        ],
        maxCommands: 18,
        explanation: 'S字型迷路を完全制覇し、ゴールへ到達せよ！',
        examTip: '【天才プログラマー認定】無駄な方向転換を省いた完璧なアルゴリズムの構築に成功しました！'
      }
    }
  }
};

export const getExPuzzle = (type: GameModuleType, level: number): ExPuzzleDefinition | null => {
  return EX_PUZZLES[type]?.[level] || EX_PUZZLES[type]?.[1] || null;
};
