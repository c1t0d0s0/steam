import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Eye } from 'lucide-react';

interface BlockCountGameProps {
  level: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: BlockPuzzle[];
  customTitle?: string;
  customBadge?: string;
}

interface BlockCoord {
  x: number; // 0 to 2
  y: number; // 0 to 2 (depth)
  z: number; // 0 to 2 (height)
}

interface BlockPuzzle {
  blocks: BlockCoord[];
  answer: number;
  options: number[];
  explanation: string;
  examTip: string;
}

export const BlockCountGame: React.FC<BlockCountGameProps> = ({
  level,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  // Preset block structures per level (3 variations per level = 18 problems total)
  const getLevelPuzzles = (lvl: number): BlockPuzzle[] => {
    switch (lvl) {
      case 1:
        return [
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 }
            ],
            answer: 7,
            options: [5, 6, 7, 8],
            explanation: '1段目（底）に 5個、2段目に 2個で、合計「5 + 2 = 7個」です！',
            examTip: '【受験の必勝技】積み木は「1段目、2段目、3段目…」と段ごとにスライスして数えると、隠れたブロックも見落としません！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 }
            ],
            answer: 6,
            options: [4, 5, 6, 7],
            explanation: '1段目に 4個、2段目に 2個で、合計「4 + 2 = 6個」です！',
            examTip: 'まずは底面にブロックが何個敷き詰められているかを確認しましょう！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 }
            ],
            answer: 8,
            options: [6, 7, 8, 9],
            explanation: '1段目に 6個、2段目に 2個で、合計「6 + 2 = 8個」です！',
            examTip: '段ごとに色分けや数字で整理すると、数え間違いを防げます！'
          }
        ];
      case 2:
        return [
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 }
            ],
            answer: 11,
            options: [9, 10, 11, 12],
            explanation: '1段目に 6個、2段目に 4個、3段目に 1個あります。合計「6 + 4 + 1 = 11個」です！見えない一番奥の下にも土台ブロックが存在します。',
            examTip: '【中学受験の常識】上の段にブロックが乗っているなら、その真下には必ず支えるブロックが存在します！宙には浮きません。'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 }
            ],
            answer: 10,
            options: [8, 9, 10, 12],
            explanation: '1段目に 5個、2段目に 4個、3段目に 1個。合計「5 + 4 + 1 = 10個」です！',
            examTip: '奥の高いタワーの足元にあるブロックを忘れないようにしましょう！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 }
            ],
            answer: 12,
            options: [10, 11, 12, 13],
            explanation: '1段目: 6個、2段目: 5個、3段目: 1個。6 + 5 + 1 = 12個です！',
            examTip: '「真上からの高さ図」ボタンを押すと、各マスの積み重なり段数が一目で分かります！'
          }
        ];
      case 3:
        return [
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 }
            ],
            answer: 16,
            options: [14, 15, 16, 18],
            explanation: '1段目: 8個、2段目: 5個、3段目: 3個。8 + 5 + 3 = 16個です！上から見た図に各タワーの高さを書き込むと瞬時に解けます。',
            examTip: '難関校の積み木問題は「上から見た図」の各マスに高さを「3, 3, 2…」と数字で記入して合計するのが最も速く正確な解き方です！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 }
            ],
            answer: 15,
            options: [13, 14, 15, 16],
            explanation: '1段目: 8個、2段目: 5個、3段目: 2個で合計 15個です！',
            examTip: '階段状に積み上がったブロックは段ごとの法則性を意識しましょう。'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 }
            ],
            answer: 17,
            options: [15, 16, 17, 18],
            explanation: '1段目: 9個、2段目: 5個、3段目: 3個。9 + 5 + 3 = 17個です！',
            examTip: '底面が3×3の9個すべて埋まっているパターンです！'
          }
        ];
      case 4:
        return [
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 2, y: 2, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 2, y: 2, z: 2 }
            ],
            answer: 13,
            options: [11, 12, 13, 14],
            explanation: 'くぼみのあるU字型の立体。1段目: 7個、2段目: 4個、3段目: 2個。合計 7 + 4 + 2 = 13個です！',
            examTip: '【見えない死角の注意点】中央が空洞になっている形では、向こう側の柱の高さを確認することが大切です！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 2, y: 2, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 2, y: 2, z: 2 }
            ],
            answer: 14,
            options: [12, 13, 14, 15],
            explanation: '真ん中(1,1)が穴になったドーナツ型ベース。1段目: 8個、2段目: 4個、3段目: 2個で 8 + 4 + 2 = 14個！',
            examTip: '穴の空いた立体は、3×3=9個のベースから穴の1個を引いて8個と計算するとスピーディーです。'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 }
            ],
            answer: 12,
            options: [10, 11, 12, 14],
            explanation: 'L字型に広がる立体。1段目: 6個、2段目: 4個、3段目: 2個で 6 + 4 + 2 = 12個！',
            examTip: '上から見た図に「3, 2, 0」のように列ごとに高さを書くとミスゼロになります！'
          }
        ];
      case 5:
        return [
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 }
            ],
            answer: 18,
            options: [16, 17, 18, 20],
            explanation: '密集ピラミッドタワー。1段目: 9個、2段目: 6個、3段目: 3個。9 + 6 + 3 = 18個！',
            examTip: '【ピラミッド数列】段が増えるごとにブロックの数が一定の規則で増えていく関係に着目しましょう！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 }
            ],
            answer: 19,
            options: [17, 18, 19, 21],
            explanation: '1段目: 9個、2段目: 7個、3段目: 3個。9 + 7 + 3 = 19個です！',
            examTip: '階層ごとのブロックの数を足し算する基本をしっかり守りましょう！'
          },
          {
            blocks: [
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 },
              { x: 1, y: 1, z: 2 }
            ],
            answer: 20,
            options: [18, 19, 20, 22],
            explanation: '1段目: 9個、2段目: 7個、3段目: 4個。9 + 7 + 4 = 20個です！',
            examTip: '上から見た図の各列の合計が全体の個数と一致するか検算しましょう。'
          }
        ];
      case 6:
      default:
        return [
          {
            blocks: [
              // 3x3x3 cube (27) with 6 missing -> 21 blocks
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              // Layer 2: 7 blocks (missing (1,1) and (2,2))
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 1, y: 2, z: 1 },
              // Layer 3: 5 blocks
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 2, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 },
              { x: 0, y: 2, z: 2 }
            ],
            answer: 21,
            options: [19, 20, 21, 23],
            explanation: '1段目: 9個、2段目: 7個、3段目: 5個。合計 21個！「3×3×3=27個 から欠けている6個を引く」余事象のワザを使うと 27 - 6 = 21個 と瞬時に求まります！',
            examTip: '【達人技・全体から引く】難関校入試では、数えるより「欠けている穴の数」を数えて引き算する方が圧倒的に速くミスも防げます！'
          },
          {
            blocks: [
              // 3x3x3 cube with 5 missing -> 22 blocks
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              // Layer 2: 8 blocks (missing (1,1))
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 1, y: 2, z: 1 },
              { x: 2, y: 2, z: 1 },
              // Layer 3: 5 blocks
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 2, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 },
              { x: 0, y: 2, z: 2 }
            ],
            answer: 22,
            options: [20, 21, 22, 24],
            explanation: '1段目: 9個、2段目: 8個、3段目: 5個で合計 22個！全体 27 - 欠け 5 = 22個です！',
            examTip: '大きな立方体からの引き算ワザを使いこなせれば、最難関中の空間図形問題も怖くありません！'
          },
          {
            blocks: [
              // 3x3x3 cube with 3 missing -> 24 blocks
              { x: 0, y: 0, z: 0 },
              { x: 1, y: 0, z: 0 },
              { x: 2, y: 0, z: 0 },
              { x: 0, y: 1, z: 0 },
              { x: 1, y: 1, z: 0 },
              { x: 2, y: 1, z: 0 },
              { x: 0, y: 2, z: 0 },
              { x: 1, y: 2, z: 0 },
              { x: 2, y: 2, z: 0 },
              // Layer 2: 8 blocks
              { x: 0, y: 0, z: 1 },
              { x: 1, y: 0, z: 1 },
              { x: 2, y: 0, z: 1 },
              { x: 0, y: 1, z: 1 },
              { x: 1, y: 1, z: 1 },
              { x: 2, y: 1, z: 1 },
              { x: 0, y: 2, z: 1 },
              { x: 1, y: 2, z: 1 },
              // Layer 3: 7 blocks
              { x: 0, y: 0, z: 2 },
              { x: 1, y: 0, z: 2 },
              { x: 2, y: 0, z: 2 },
              { x: 0, y: 1, z: 2 },
              { x: 1, y: 1, z: 2 },
              { x: 0, y: 2, z: 2 },
              { x: 1, y: 2, z: 2 }
            ],
            answer: 24,
            options: [21, 22, 24, 25],
            explanation: '1段目: 9個、2段目: 8個、3段目: 7個。合計 24個！全体 27 - 欠け 3 = 24個です！',
            examTip: '空間認識能力は、実際にブロックを頭の中で組み立てたり削ったりするイメージトレーニングで鍛えられます！'
          }
        ];
    }
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>('立方体のブロックは全部で何個あるかな？');
  const [activeLayerFilter, setActiveLayerFilter] = useState<number | null>(null); // null = all layers
  const [showHeightMap, setShowHeightMap] = useState(false);

  const switchProblem = (idx: number) => {
    const nextIdx = idx % puzzles.length;
    setProblemIndex(nextIdx);
    setSelectedAnswer(null);
    setIsCompleted(false);
    setActiveLayerFilter(null);
    setShowHeightMap(false);
    setFeedback('立方体のブロックは全部で何個あるかな？');
  };

  // Isometric 2D projection parameters
  const isoX = (x: number, y: number) => (x - y) * 36;
  const isoY = (x: number, y: number, z: number) => (x + y) * 18 - z * 38;

  // Filter blocks by layer if specified
  const visibleBlocks = activeLayerFilter === null
    ? puzzle.blocks
    : puzzle.blocks.filter((b) => b.z === activeLayerFilter);

  // Sort blocks back-to-front (depth first) for painter's algorithm
  const sortedBlocks = [...visibleBlocks].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.z - b.z;
  });

  const handleSelectAnswer = (ans: number) => {
    setSelectedAnswer(ans);
    if (ans === puzzle.answer) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(`正解！ピッタリ ${ans}個 です！お見事！`);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback(`ざんねん！ ${ans}個 ではありません。ヒントボタンや層別ビューを使ってみよう！`);
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "立体ブロック積み木数え"}
      badgeTag={customBadge || `算数アリーナ Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={puzzle.explanation}
      examTip={puzzle.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={puzzles.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setSelectedAnswer(null);
        setIsCompleted(false);
        setFeedback('立方体のブロックは全部で何個あるかな？');
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-sky-50 border border-sky-200 rounded-2xl mb-3 font-extrabold text-sky-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* View Toggle Bar (Layer slices & Height Map) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayerFilter(null);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeLayerFilter === null ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              全体
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayerFilter(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayerFilter === 0 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              1段目
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayerFilter(1);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayerFilter === 1 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              2段目
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveLayerFilter(2);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayerFilter === 2 ? 'bg-amber-400 text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              3段目
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowHeightMap(!showHeightMap);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
              showHeightMap
                ? 'bg-indigo-500 text-white border-indigo-600 shadow'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>真上からの高さ図（受験ワザ）</span>
          </button>
        </div>

        {/* 3D Isometric View Canvas */}
        <div className="w-full h-64 sm:h-72 bg-gradient-to-b from-sky-50 via-slate-50 to-amber-50/50 rounded-3xl border-2 border-slate-200 relative flex items-center justify-center overflow-hidden shadow-inner mb-5">
          <svg viewBox="-180 -140 360 280" className="w-full h-full max-w-md">
            <defs>
              {/* Top Face Gradient */}
              <linearGradient id="topFace" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              {/* Left Face Gradient */}
              <linearGradient id="leftFace" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              {/* Right Face Gradient */}
              <linearGradient id="rightFace" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>

            {/* Base grid shadow */}
            <ellipse cx="0" cy="50" rx="130" ry="40" fill="rgba(0,0,0,0.06)" />

            {/* Render each block in sorted order */}
            {sortedBlocks.map((b, idx) => {
              const cx = isoX(b.x, b.y);
              const cy = isoY(b.x, b.y, b.z);
              const w = 36;
              const h = 20;
              const blockHeight = 36;

              // Top face polygon
              const topPoints = `${cx},${cy - blockHeight - h} ${cx + w},${cy - blockHeight} ${cx},${cy - blockHeight + h} ${cx - w},${cy - blockHeight}`;
              // Left face polygon
              const leftPoints = `${cx - w},${cy - blockHeight} ${cx},${cy - blockHeight + h} ${cx},${cy + h} ${cx - w},${cy}`;
              // Right face polygon
              const rightPoints = `${cx},${cy - blockHeight + h} ${cx + w},${cy - blockHeight} ${cx + w},${cy} ${cx},${cy + h}`;

              return (
                <g key={`${b.x}-${b.y}-${b.z}-${idx}`} className="transition-all duration-300">
                  {/* Left Face */}
                  <polygon points={leftPoints} fill="url(#leftFace)" stroke="#1e3a8a" strokeWidth="1.5" />
                  {/* Right Face */}
                  <polygon points={rightPoints} fill="url(#rightFace)" stroke="#1e3a8a" strokeWidth="1.5" />
                  {/* Top Face */}
                  <polygon points={topPoints} fill="url(#topFace)" stroke="#1e3a8a" strokeWidth="1.5" />
                </g>
              );
            })}
          </svg>

          {/* Overlay Height Map Guide if toggled */}
          {showHeightMap && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border-2 border-indigo-300 rounded-2xl p-2.5 shadow-lg text-center animate-pulse-subtle">
              <span className="text-[10px] font-black text-indigo-800 block mb-1">
                真上から見た高さ（段数）
              </span>
              <div className="grid grid-cols-3 gap-1 bg-indigo-50 p-1.5 rounded-xl border border-indigo-200">
                {[0, 1, 2].map((y) => (
                  <React.Fragment key={y}>
                    {[0, 1, 2].map((x) => {
                      const count = puzzle.blocks.filter((b) => b.x === x && b.y === y).length;
                      return (
                        <div
                          key={`${x}-${y}`}
                          className={`w-6 h-6 flex items-center justify-center font-black text-xs rounded ${
                            count > 0 ? 'bg-indigo-600 text-white shadow' : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          {count > 0 ? count : '-'}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="w-full max-w-md">
          <span className="text-xs font-black text-slate-600 block text-center mb-2">
            答えを選んでね！
          </span>
          <div className="grid grid-cols-4 gap-2.5">
            {puzzle.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectAnswer(opt)}
                className={`py-3 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-md border-2 ${
                  selectedAnswer === opt
                    ? opt === puzzle.answer
                      ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-200'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {opt} 個
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
