import React, { useState, useRef, useEffect } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { RotateCw, RotateCcw } from 'lucide-react';

interface GearChainGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: GearPuzzle[];
  customTitle?: string;
  customBadge?: string;
}
interface GearDef {
  label: string;
  teeth: number;
  radius: number;
  isCW: boolean;
  speedSec: number;
  color: string;
}

interface GearPuzzle {
  question: string;
  targetDirection?: 'CW' | 'CCW';
  isRatioPuzzle?: boolean;
  correctTurns?: number;
  options?: number[];
  gears: GearDef[];
  explanation: string;
  examTip: string;
}

const GRADE_GEAR_PUZZLES: Record<number, Record<number, GearPuzzle[]>> = {
  "3": {
    "1": [
      {
        "question": "動力ギアA（時計回り）と、噛み合っているギアBがあるよ。ギアBはどちら向きに回るかな？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 12,
            "radius": 36,
            "isCW": true,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (?)",
            "teeth": 12,
            "radius": 36,
            "isCW": false,
            "speedSec": 4,
            "color": "#f43f5e"
          }
        ],
        "explanation": "噛み合っている2つの歯車は、必ず「反対向き」に回転します！Aが時計回りなら、Bは「反時計回り」です。",
        "examTip": "【歯車の基本中の基本】隣り合う歯車どうしは、必ず互いに逆向きに回ります！"
      },
      {
        "question": "動力ギアAが「反時計回り」に回っています。噛み合っているギアBはどちら向きに回る？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (反時計)",
            "teeth": 12,
            "radius": 36,
            "isCW": false,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (?)",
            "teeth": 12,
            "radius": 36,
            "isCW": true,
            "speedSec": 4,
            "color": "#4ade80"
          }
        ],
        "explanation": "Aが反時計回りなので、噛み合うBは反対の「時計回り」になります！",
        "examTip": "歯車が2個のときは、向きが入れ替わります。"
      },
      {
        "question": "ギアA（時計回り）に小さなギアBが噛み合っています。ギアBの回転方向は？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計・大)",
            "teeth": 16,
            "radius": 44,
            "isCW": true,
            "speedSec": 5,
            "color": "#38bdf8"
          },
          {
            "label": "B (?・小)",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 2.5,
            "color": "#f43f5e"
          }
        ],
        "explanation": "歯車の大きさが違っても、噛み合っているなら必ず逆向き（反時計回り）に回ります！",
        "examTip": "歯車の大小は速さには関係しますが、回転する向きのルール（逆向き）には影響しません！"
      }
    ],
    "2": [
      {
        "question": "3つの歯車がつながっているよ！ギアA（時計回り）から力を伝えると、最後のギアCはどちら向きに回る？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 12,
            "radius": 34,
            "isCW": true,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (反時計)",
            "teeth": 12,
            "radius": 34,
            "isCW": false,
            "speedSec": 4,
            "color": "#fbbf24"
          },
          {
            "label": "C (?)",
            "teeth": 12,
            "radius": 34,
            "isCW": true,
            "speedSec": 4,
            "color": "#4ade80"
          }
        ],
        "explanation": "A(時計) → B(反時計) → C(時計) と向きが交互に入れ替わります。3個目は「時計回り」です！",
        "examTip": "奇数個（3個）の歯車列では、最初と最後が必ず「同じ向き」になります！"
      },
      {
        "question": "3つの歯車で、ギアAが「反時計回り」のとき、最後のギアCはどちら向き？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (反時計)",
            "teeth": 12,
            "radius": 34,
            "isCW": false,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (時計)",
            "teeth": 12,
            "radius": 34,
            "isCW": true,
            "speedSec": 4,
            "color": "#fbbf24"
          },
          {
            "label": "C (?)",
            "teeth": 12,
            "radius": 34,
            "isCW": false,
            "speedSec": 4,
            "color": "#f43f5e"
          }
        ],
        "explanation": "A(反時計) → B(時計) → C(反時計) となり、Aと同じ「反時計回り」です！",
        "examTip": "奇数個の歯車は最初と最後が同じ向きになる法則を覚えましょう！"
      },
      {
        "question": "真ん中の歯車Bだけ大きいよ！ギアAが「時計回り」のとき、最後のギアCは？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B (大)",
            "teeth": 16,
            "radius": 44,
            "isCW": false,
            "speedSec": 4.8,
            "color": "#fbbf24"
          },
          {
            "label": "C (?)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#4ade80"
          }
        ],
        "explanation": "途中の歯車がどんな大きさでも、3個目のギアCはAと同じ「時計回り」になります！",
        "examTip": "大きさに関わらず、1つ挟むごとに向きが反転します。"
      }
    ],
    "3": [
      {
        "question": "4つの歯車がつながっているよ！ギアA（時計回り）のとき、一番右のギアDはどちら向きに回るかな？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D (?)",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 3,
            "color": "#f43f5e"
          }
        ],
        "explanation": "4個（偶数個）のギア列なので、最後は最初と逆向きの「反時計回り」になります！",
        "examTip": "【偶数と奇数の秘密】偶数個なら逆向き、奇数個なら同じ向き！"
      },
      {
        "question": "4つの歯車で、最初のギアAが「反時計回り」のとき、最後のギアDはどちら向き？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (反時計)",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D (?)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3,
            "color": "#4ade80"
          }
        ],
        "explanation": "4個（偶数個）なので逆向きになります。反時計回りの逆で「時計回り」です！",
        "examTip": "頭の中で指差し確認：反時計→時計→反時計→時計！"
      },
      {
        "question": "歯数がバラバラな4つの歯車列！ギアAが「時計回り」のとき、ギアDは？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 12,
            "radius": 34,
            "isCW": false,
            "speedSec": 3.75,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 3.1,
            "color": "#a78bfa"
          },
          {
            "label": "D (?)",
            "teeth": 14,
            "radius": 38,
            "isCW": false,
            "speedSec": 4.4,
            "color": "#f43f5e"
          }
        ],
        "explanation": "歯数に関係なく、偶数個（4個）なら最後は「反時計回り」です！",
        "examTip": "歯数に惑わされず、個数を数えるのが向き判定のコツです。"
      }
    ],
    "4": [
      {
        "question": "5つの歯車がつながっているよ！最初のギアAが「時計回り」のとき、最後のギアEはどちら向き？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 3,
            "color": "#f43f5e"
          },
          {
            "label": "E (?)",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 3,
            "color": "#4ade80"
          }
        ],
        "explanation": "5個（奇数個）の歯車列なので、最初と最後は同じ向きの「時計回り」になります！",
        "examTip": "奇数個なら最初と同じ向き！一瞬で見分けられます。"
      },
      {
        "question": "5つの歯車で、最初のギアAが「反時計回り」のとき、一番右のギアEの回転方向は？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (反時計)",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 3,
            "color": "#f43f5e"
          },
          {
            "label": "E (?)",
            "teeth": 8,
            "radius": 26,
            "isCW": false,
            "speedSec": 3,
            "color": "#4ade80"
          }
        ],
        "explanation": "5個（奇数個）なのでAと同じ「反時計回り」になります！",
        "examTip": "長いギア列の入試問題も、個数を数えるだけで1秒で解けます！"
      },
      {
        "question": "ギアA（時計回り）から5つのギアがつながっています。ギアEはどちら向き？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 12,
            "radius": 32,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 2,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 10,
            "radius": 28,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 14,
            "radius": 36,
            "isCW": false,
            "speedSec": 3.5,
            "color": "#f43f5e"
          },
          {
            "label": "E (?)",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 2,
            "color": "#4ade80"
          }
        ],
        "explanation": "奇数番目のギア（1, 3, 5番目）はすべて時計回りになります！",
        "examTip": "1番目が時計回りなら、3番目、5番目、7番目…も時計回りです！"
      }
    ],
    "5": [
      {
        "question": "6つの歯車がつながっています！最初のギアAが「時計回り」のとき、最後のギアFはどちら向き？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#f43f5e"
          },
          {
            "label": "E",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#34d399"
          },
          {
            "label": "F (?)",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "6個（偶数個）の歯車列なので、最後は最初と逆向きの「反時計回り」になります！",
        "examTip": "時計 ⇄ 反時計 が6回入れ替わるので、偶数番目は反時計です！"
      },
      {
        "question": "6つの歯車で、最初のギアAが「反時計回り」のとき、最後のギアFは？",
        "targetDirection": "CW",
        "gears": [
          {
            "label": "A (反時計)",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#f43f5e"
          },
          {
            "label": "E",
            "teeth": 8,
            "radius": 24,
            "isCW": false,
            "speedSec": 3,
            "color": "#34d399"
          },
          {
            "label": "F (?)",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "反時計回りの逆なので「時計回り」になります！",
        "examTip": "偶数個なら最初と逆向きの法則がバッチリ定着しました！"
      },
      {
        "question": "大小さまざまな6つの歯車列！ギアAが「時計回り」のとき、最後のギアFは？",
        "targetDirection": "CCW",
        "gears": [
          {
            "label": "A (時計)",
            "teeth": 10,
            "radius": 28,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B",
            "teeth": 14,
            "radius": 36,
            "isCW": false,
            "speedSec": 4.2,
            "color": "#fbbf24"
          },
          {
            "label": "C",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 2.4,
            "color": "#a78bfa"
          },
          {
            "label": "D",
            "teeth": 12,
            "radius": 32,
            "isCW": false,
            "speedSec": 3.6,
            "color": "#f43f5e"
          },
          {
            "label": "E",
            "teeth": 8,
            "radius": 24,
            "isCW": true,
            "speedSec": 2.4,
            "color": "#34d399"
          },
          {
            "label": "F (?)",
            "teeth": 16,
            "radius": 40,
            "isCW": false,
            "speedSec": 4.8,
            "color": "#f59e0b"
          }
        ],
        "explanation": "歯数に関係なく、6個（偶数個）なので反時計回りです！",
        "examTip": "回転方向の奇偶判定は小3マスターレベル達成です！"
      }
    ],
    "6": [
      {
        "question": "歯車A（歯数 10枚）が 4回転 すると、噛み合っている大きな歯車B（歯数 20枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          4,
          8
        ],
        "gears": [
          {
            "label": "A (10枚・4回転)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚・?回転)",
            "teeth": 20,
            "radius": 44,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "歯数 10 × 4回転 = 40枚分の歯が送られます。歯数20の歯車Bは「40 ÷ 20 = 2回転」します！歯数が2倍なので回転数は半分の2回転です。",
        "examTip": "【歯車と回転比の入門】歯数が増えるとゆっくり回ります！歯数が2倍なら回転数は1/2！"
      },
      {
        "question": "歯車A（歯数 12枚）が 2回転 すると、歯数 24枚 の大きな歯車Bは何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 1,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (12枚・2回転)",
            "teeth": 12,
            "radius": 32,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": false,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "12 × 2 = 24枚。24 ÷ 24 = 1回転します！",
        "examTip": "歯数が2倍（12から24）なら、回転数は半分（2から1）です！"
      },
      {
        "question": "歯車A（歯数 8枚）が 4回転 すると、歯数 16枚 の歯車Bは何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (8枚・4回転)",
            "teeth": 8,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (16枚・?回転)",
            "teeth": 16,
            "radius": 40,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "8 × 4 = 32枚。32 ÷ 16 = 2回転します！",
        "examTip": "小学3年生の工学パズル全問制覇！歯車の回転比の基礎も完璧です！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "question": "歯車A（歯数 10枚）が 6回転 すると、噛み合っている歯車B（歯数 20枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (10枚・6回転)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚・?回転)",
            "teeth": 20,
            "radius": 44,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "10枚 × 6回転 = 60枚分の歯が噛み合います。歯数20の歯車Bは 60 ÷ 20 = 3回転します！",
        "examTip": "歯数比 10:20 = 1:2 なので、回転数の比は逆比の 2:1 になります（6回転 × 1/2 = 3回転）。"
      },
      {
        "question": "歯車A（歯数 12枚）が 4回転 すると、歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (12枚・4回転)",
            "teeth": 12,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "12 × 4 = 48枚。48 ÷ 24 = 2回転します！",
        "examTip": "歯数が2倍なら回転数は1/2！"
      },
      {
        "question": "歯車A（歯数 15枚）が 4回転 すると、歯車B（歯数 30枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (15枚・4回転)",
            "teeth": 15,
            "radius": 34,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 4 = 60枚。60 ÷ 30 = 2回転します！",
        "examTip": "歯数×回転数が常に一定になることを確認しましょう。"
      }
    ],
    "2": [
      {
        "question": "歯車A（歯数 8枚）が 6回転 すると、噛み合っている歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (8枚・6回転)",
            "teeth": 8,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 48,
            "isCW": false,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "8枚 × 6回転 = 48枚。48 ÷ 24 = 2回転！歯数が3倍（8:24=1:3）なので、回転数は1/3（6×1/3=2回転）になります！",
        "examTip": "【3倍の逆比】歯数が3倍になると、回転数は「1/3」になります！"
      },
      {
        "question": "歯車A（歯数 10枚）が 9回転 すると、歯車B（歯数 30枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (10枚・9回転)",
            "teeth": 10,
            "radius": 30,
            "isCW": true,
            "speedSec": 1.8,
            "color": "#38bdf8"
          },
          {
            "label": "B (30枚・?回転)",
            "teeth": 30,
            "radius": 50,
            "isCW": false,
            "speedSec": 5.4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "10 × 9 = 90枚。90 ÷ 30 = 3回転します！",
        "examTip": "歯数比 10:30 = 1:3 なので回転数は 9 × 1/3 = 3回転です！"
      },
      {
        "question": "歯車A（歯数 7枚）が 6回転 すると、歯車B（歯数 21枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (7枚・6回転)",
            "teeth": 7,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (21枚・?回転)",
            "teeth": 21,
            "radius": 46,
            "isCW": false,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "7 × 6 = 42枚。42 ÷ 21 = 2回転します！",
        "examTip": "素数の歯数でも掛け算と割り算で確実に解けます！"
      }
    ],
    "3": [
      {
        "question": "大きな歯車A（歯数 24枚）が 2回転 すると、小さな歯車B（歯数 12枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (24枚・2回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": true,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚・?回転)",
            "teeth": 12,
            "radius": 32,
            "isCW": false,
            "speedSec": 2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "大きな歯車から小さな歯車へ！24 × 2 = 48枚。48 ÷ 12 = 4回転します！歯数が半分になると、回転数は2倍に増速します。",
        "examTip": "【増速ギアの仕組み】大ギアで小ギアを回すと、スピードがアップします（自転車の高速段）！"
      },
      {
        "question": "大きな歯車A（歯数 30枚）が 2回転 すると、小さな歯車B（歯数 10枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 6,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (30枚・2回転)",
            "teeth": 30,
            "radius": 50,
            "isCW": true,
            "speedSec": 6,
            "color": "#38bdf8"
          },
          {
            "label": "B (10枚・?回転)",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "30 × 2 = 60枚。60 ÷ 10 = 6回転！歯数が1/3なので回転数は3倍です！",
        "examTip": "歯数比 30:10 = 3:1 なので回転数は 2 × 3 = 6回転！"
      },
      {
        "question": "歯車A（歯数 20枚）が 3回転 すると、歯車B（歯数 10枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 6,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (20枚・3回転)",
            "teeth": 20,
            "radius": 44,
            "isCW": true,
            "speedSec": 4,
            "color": "#38bdf8"
          },
          {
            "label": "B (10枚・?回転)",
            "teeth": 10,
            "radius": 30,
            "isCW": false,
            "speedSec": 2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "20 × 3 = 60枚。60 ÷ 10 = 6回転します！",
        "examTip": "増速の計算も自由自在になりました！"
      }
    ],
    "4": [
      {
        "question": "歯車A（歯数 16枚）が 3回転 すると、噛み合っている歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (16枚・3回転)",
            "teeth": 16,
            "radius": 34,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 44,
            "isCW": false,
            "speedSec": 3.75,
            "color": "#f59e0b"
          }
        ],
        "explanation": "16枚 × 3回転 = 48枚。歯車Bは 48 ÷ 24 = 2回転します！歯数比 16:24 = 2:3 なので、回転数比は逆比の 3:2 です。",
        "examTip": "【2:3の比率】分数や比を使った中学受験典型の回転計算です！"
      },
      {
        "question": "歯車A（歯数 18枚）が 2回転 すると、歯車B（歯数 12枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・2回転)",
            "teeth": 18,
            "radius": 38,
            "isCW": true,
            "speedSec": 3,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚・?回転)",
            "teeth": 12,
            "radius": 30,
            "isCW": false,
            "speedSec": 2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 2 = 36枚。36 ÷ 12 = 3回転！",
        "examTip": "歯数比 18:12 = 3:2 → 回転数比は 2:3！2回転の1.5倍で3回転です。"
      },
      {
        "question": "歯車A（歯数 12枚）が 6回転 すると、歯車B（歯数 18枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (12枚・6回転)",
            "teeth": 12,
            "radius": 30,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・?回転)",
            "teeth": 18,
            "radius": 40,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "12 × 6 = 72枚。72 ÷ 18 = 4回転します！",
        "examTip": "72枚分の歯数を両方の歯車で照合しましょう。"
      }
    ],
    "5": [
      {
        "question": "歯車A（歯数 9枚）が 4回転 すると、噛み合っている歯車B（歯数 18枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (9枚・4回転)",
            "teeth": 9,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・?回転)",
            "teeth": 18,
            "radius": 42,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "9 × 4 = 36枚。36 ÷ 18 = 2回転！歯数が2倍なので回転数は半分です。",
        "examTip": "反比例の性質をしっかり捉えています！"
      },
      {
        "question": "歯車A（歯数 6枚）が 8回転 すると、噛み合っている歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (6枚・8回転)",
            "teeth": 6,
            "radius": 26,
            "isCW": true,
            "speedSec": 1.8,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 48,
            "isCW": false,
            "speedSec": 7.2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "6 × 8 = 48枚。48 ÷ 24 = 2回転！歯数が4倍なので回転数は1/4です。",
        "examTip": "自転車のペダルとタイヤのギア比もこの計算式です！"
      },
      {
        "question": "歯車A（歯数 14枚）が 4回転 すると、歯車B（歯数 28枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (14枚・4回転)",
            "teeth": 14,
            "radius": 34,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (28枚・?回転)",
            "teeth": 28,
            "radius": 48,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "14 × 4 = 56枚。56 ÷ 28 = 2回転！",
        "examTip": "小学4年生の歯車計算を完全マスター！"
      }
    ],
    "6": [
      {
        "question": "歯車A（10枚）が 6回転 するとき、中間の歯車B（15枚）を経由してつながる歯車C（30枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          5
        ],
        "gears": [
          {
            "label": "A (10枚・6回転)",
            "teeth": 10,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (15枚・中間)",
            "teeth": 15,
            "radius": 36,
            "isCW": false,
            "speedSec": 3,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": true,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "中間の歯車Bの歯数は比率に関係ありません！10 × 6 = 60枚分の歯が送られるので、歯車Cは 60 ÷ 30 = 2回転します！",
        "examTip": "【アイドラギアの初登場】途中に挟んだ歯車は向きを変えるだけで、回転数比には影響しません！"
      },
      {
        "question": "歯車A（12枚）が 5回転 するとき、中間ギアB（18枚）を通る歯車C（20枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (12枚・5回転)",
            "teeth": 12,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.4,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・中間)",
            "teeth": 18,
            "radius": 38,
            "isCW": false,
            "speedSec": 3.6,
            "color": "#94a3b8"
          },
          {
            "label": "C (20枚・?回転)",
            "teeth": 20,
            "radius": 42,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "送られる歯数は 12 × 5 = 60枚。歯車Cは 60 ÷ 20 = 3回転します！中間ギアBは無視して計算！",
        "examTip": "難関校の引っ掛け問題も中間ギアを無視すれば楽勝です！"
      },
      {
        "question": "歯車A（8枚）が 9回転 するとき、中間ギアB（16枚）を通る歯車C（24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (8枚・9回転)",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (16枚・中間)",
            "teeth": 16,
            "radius": 36,
            "isCW": false,
            "speedSec": 4,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": true,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "8 × 9 = 72枚。歯車Cは 72 ÷ 24 = 3回転します！",
        "examTip": "小4でアイドラギアを完全攻略！素晴らしい工学的思考力です！"
      }
    ]
  },
  "5": {
    "1": [
      {
        "question": "歯車A（歯数 15枚）が 6回転 すると、噛み合っている歯車B（歯数 30枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (15枚・6回転)",
            "teeth": 15,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 6 = 90枚。90 ÷ 30 = 3回転します！歯数が2倍なので回転数は半分です。",
        "examTip": "【小5反比例の応用】歯数×回転数＝一定！"
      },
      {
        "question": "歯車A（歯数 14枚）が 6回転 すると、歯車B（歯数 21枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (14枚・6回転)",
            "teeth": 14,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (21枚・?回転)",
            "teeth": 21,
            "radius": 42,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "14 × 6 = 84枚。84 ÷ 21 = 4回転！歯数比 14:21 = 2:3 → 回転数比 3:2（6 × 2/3 = 4回転）。",
        "examTip": "7の倍数を含む入試頻出比率。約分してから逆比を取ると暗算できます！"
      },
      {
        "question": "歯車A（歯数 18枚）が 4回転 すると、歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・4回転)",
            "teeth": 18,
            "radius": 36,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": false,
            "speedSec": 3.33,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 4 = 72枚。72 ÷ 24 = 3回転！歯数比 18:24 = 3:4 → 回転数比 4:3。",
        "examTip": "3:4の比率。機械工学でよく使われる標準ギア比です！"
      }
    ],
    "2": [
      {
        "question": "歯車A（歯数 16枚）が 6回転 すると、歯車B（歯数 32枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (16枚・6回転)",
            "teeth": 16,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (32枚・?回転)",
            "teeth": 32,
            "radius": 50,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "16 × 6 = 96枚。96 ÷ 32 = 3回転！",
        "examTip": "16:32 = 1:2 の半減回転！"
      },
      {
        "question": "歯車A（歯数 20枚）が 6回転 すると、歯車B（歯数 24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 5,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (20枚・6回転)",
            "teeth": 20,
            "radius": 38,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・?回転)",
            "teeth": 24,
            "radius": 44,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "20 × 6 = 120枚。120 ÷ 24 = 5回転！歯数比 20:24 = 5:6 → 回転数比 6:5。",
        "examTip": "微妙なギア比（5:6）でも積を120と求めて即割り算！"
      },
      {
        "question": "歯車A（歯数 15枚）が 8回転 すると、歯車B（歯数 20枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 6,
        "options": [
          4,
          5,
          6,
          7
        ],
        "gears": [
          {
            "label": "A (15枚・8回転)",
            "teeth": 15,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚・?回転)",
            "teeth": 20,
            "radius": 40,
            "isCW": false,
            "speedSec": 2.67,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 8 = 120枚。120 ÷ 20 = 6回転！",
        "examTip": "120枚の歯が噛み合う関係を素早く見抜きましょう。"
      }
    ],
    "3": [
      {
        "question": "歯車A（12枚）が 6回転 するとき、中間歯車B（16枚）を経由してつながる歯車C（24枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (12枚・6回転)",
            "teeth": 12,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (16枚・中間)",
            "teeth": 16,
            "radius": 34,
            "isCW": false,
            "speedSec": 2.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "中間車Bの歯数は比率に影響しません！12 × 6 = 72枚。歯車Cは 72 ÷ 24 = 3回転します！",
        "examTip": "【アイドラギアの計算法】Bを消して「Aの歯数×回転数 ÷ Cの歯数」で即答！"
      },
      {
        "question": "歯車A（15枚）が 6回転 するとき、中間ギアB（20枚）を通る歯車C（30枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (15枚・6回転)",
            "teeth": 15,
            "radius": 30,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚・中間)",
            "teeth": 20,
            "radius": 38,
            "isCW": false,
            "speedSec": 2.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 6 = 90枚。90 ÷ 30 = 3回転します！",
        "examTip": "中間ギアに惑わされない入試テクニックを確立！"
      },
      {
        "question": "歯車A（18枚）が 5回転 するとき、中間ギアB（12枚）を通る歯車C（30枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・5回転)",
            "teeth": 18,
            "radius": 32,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚・中間)",
            "teeth": 12,
            "radius": 26,
            "isCW": false,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": true,
            "speedSec": 4.17,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 5 = 90枚。90 ÷ 30 = 3回転します！中間ギアBが小さくても比率は不変です。",
        "examTip": "中間の歯車の大きさにかかわらず、最初と最後だけで決まります。"
      }
    ],
    "4": [
      {
        "question": "歯車A（10枚）が 8回転 するとき、中間ギアB（14枚）を通る歯車C（16枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 5,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (10枚・8回転)",
            "teeth": 10,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (14枚・中間)",
            "teeth": 14,
            "radius": 34,
            "isCW": false,
            "speedSec": 2.8,
            "color": "#94a3b8"
          },
          {
            "label": "C (16枚・?回転)",
            "teeth": 16,
            "radius": 38,
            "isCW": true,
            "speedSec": 3.2,
            "color": "#f59e0b"
          }
        ],
        "explanation": "10 × 8 = 80枚。80 ÷ 16 = 5回転します！",
        "examTip": "80 ÷ 16 = 5回転！"
      },
      {
        "question": "歯車A（16枚）が 6回転 するとき、中間ギアB（24枚）を通る歯車C（32枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (16枚・6回転)",
            "teeth": 16,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・中間)",
            "teeth": 24,
            "radius": 42,
            "isCW": false,
            "speedSec": 3,
            "color": "#94a3b8"
          },
          {
            "label": "C (32枚・?回転)",
            "teeth": 32,
            "radius": 50,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "16 × 6 = 96枚。96 ÷ 32 = 3回転します！",
        "examTip": "難関校レベルのギア比計算も即答できるようになりました！"
      },
      {
        "question": "歯車A（20枚）が 6回転 するとき、中間ギアB（15枚）を通る歯車C（24枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 5,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (20枚・6回転)",
            "teeth": 20,
            "radius": 36,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (15枚・中間)",
            "teeth": 15,
            "radius": 30,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚・?回転)",
            "teeth": 24,
            "radius": 42,
            "isCW": true,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "20 × 6 = 120枚。120 ÷ 24 = 5回転します！",
        "examTip": "120 ÷ 24 = 5！"
      }
    ],
    "5": [
      {
        "question": "4つの歯車がつながっています！A(12枚・6回転) → B(18枚) → C(15枚) → D(24枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (12枚・6回転)",
            "teeth": 12,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・中間)",
            "teeth": 18,
            "radius": 34,
            "isCW": false,
            "speedSec": 3,
            "color": "#94a3b8"
          },
          {
            "label": "C (15枚・中間)",
            "teeth": 15,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#94a3b8"
          },
          {
            "label": "D (24枚・?回転)",
            "teeth": 24,
            "radius": 42,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "途中に中間車が何個あっても、最初と最後の歯車だけで決まります！12 × 6 = 72枚。72 ÷ 24 = 3回転します！回転向きは偶数個（4個）なので反時計回りです。",
        "examTip": "【多段アイドラギア】BとCの歯数は一切無関係！AとDだけで 72÷24=3回転！"
      },
      {
        "question": "4つの歯車トレイン！A(15枚・4回転) → B(10枚) → C(20枚) → D(30枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          4
        ],
        "gears": [
          {
            "label": "A (15枚・4回転)",
            "teeth": 15,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (10枚・中間)",
            "teeth": 10,
            "radius": 24,
            "isCW": false,
            "speedSec": 1.33,
            "color": "#94a3b8"
          },
          {
            "label": "C (20枚・中間)",
            "teeth": 20,
            "radius": 36,
            "isCW": true,
            "speedSec": 2.67,
            "color": "#94a3b8"
          },
          {
            "label": "D (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 4 = 60枚。歯車Dは 60 ÷ 30 = 2回転します！中間ギアB, Cは無視！",
        "examTip": "入試の長大なギア列も最初と最後の歯数積だけで一瞬で片付けられます！"
      },
      {
        "question": "4つの歯車！A(16枚・5回転) → B(12枚) → C(14枚) → D(20枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (16枚・5回転)",
            "teeth": 16,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.4,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚・中間)",
            "teeth": 12,
            "radius": 26,
            "isCW": false,
            "speedSec": 1.8,
            "color": "#94a3b8"
          },
          {
            "label": "C (14枚・中間)",
            "teeth": 14,
            "radius": 28,
            "isCW": true,
            "speedSec": 2.1,
            "color": "#94a3b8"
          },
          {
            "label": "D (20枚・?回転)",
            "teeth": 20,
            "radius": 36,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "16 × 5 = 80枚。80 ÷ 20 = 4回転します！",
        "examTip": "中間ギア定理の完全な理解を達成！"
      }
    ],
    "6": [
      {
        "question": "歯車A（18枚）が 4回転 するとき、中間ギアB（27枚）を経由してつながる歯車C（24枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・4回転)",
            "teeth": 18,
            "radius": 32,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (27枚・中間)",
            "teeth": 27,
            "radius": 42,
            "isCW": false,
            "speedSec": 3.75,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚・?回転)",
            "teeth": 24,
            "radius": 38,
            "isCW": true,
            "speedSec": 3.33,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 4 = 72枚。歯車Cは 72 ÷ 24 = 3回転します！",
        "examTip": "小5工学マスター！機械の減速・増速設計のプロフェッショナルです！"
      },
      {
        "question": "歯車A（21枚）が 4回転 するとき、中間ギアB（14枚）を経由する歯車C（28枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (21枚・4回転)",
            "teeth": 21,
            "radius": 34,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (14枚・中間)",
            "teeth": 14,
            "radius": 28,
            "isCW": false,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (28枚・?回転)",
            "teeth": 28,
            "radius": 44,
            "isCW": true,
            "speedSec": 3.33,
            "color": "#f59e0b"
          }
        ],
        "explanation": "21 × 4 = 84枚。84 ÷ 28 = 3回転します！",
        "examTip": "7の倍数を自在に操る計算力！"
      },
      {
        "question": "歯車A（24枚）が 5回転 するとき、中間ギアB（18枚）を通る歯車C（30枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (24枚・5回転)",
            "teeth": 24,
            "radius": 36,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・中間)",
            "teeth": 18,
            "radius": 30,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 46,
            "isCW": true,
            "speedSec": 3.13,
            "color": "#f59e0b"
          }
        ],
        "explanation": "24 × 5 = 120枚。120 ÷ 30 = 4回転します！",
        "examTip": "最高峰の歯車計算力！中学受験の理科物理分野で大きな得点源になります！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "question": "歯車A（10枚）が 6回転 するとき、中間の歯車B（15枚）を経由してつながる歯車C（30枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 2,
        "options": [
          1,
          2,
          3,
          5
        ],
        "gears": [
          {
            "label": "A (10枚・6回転)",
            "teeth": 10,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (15枚・中間)",
            "teeth": 15,
            "radius": 36,
            "isCW": false,
            "speedSec": 3,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": true,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "間の歯車Bの歯数に関わらず、最初と最後の関係だけで決まります！10 × 6 = 60枚分の歯が送られるので、歯車Cは 60 ÷ 30 = 2回転します！",
        "examTip": "【アイドラギアの法則】途中に挟まれた歯車は「回転の向きを変えるだけ」で、最初と最後の回転比には影響しません！入試の頻出ひっかけです。"
      },
      {
        "question": "歯車A（12枚）が 5回転 するとき、中間ギアB（18枚）を通る歯車C（20枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (12枚・5回転)",
            "teeth": 12,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.4,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・中間)",
            "teeth": 18,
            "radius": 38,
            "isCW": false,
            "speedSec": 3.6,
            "color": "#94a3b8"
          },
          {
            "label": "C (20枚・?回転)",
            "teeth": 20,
            "radius": 42,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "送られる歯数は 12 × 5 = 60枚。歯車Cは 60 ÷ 20 = 3回転します！中間ギアBの歯数は計算に使わなくてOK！",
        "examTip": "難関校の引っかけ問題でも、中間ギアを無視して「Aの歯数×回転数 ÷ Cの歯数」で即答しましょう！"
      },
      {
        "question": "歯車A（8枚）が 9回転 するとき、中間ギアB（16枚）を通る歯車C（24枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          6
        ],
        "gears": [
          {
            "label": "A (8枚・9回転)",
            "teeth": 8,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (16枚・中間)",
            "teeth": 16,
            "radius": 36,
            "isCW": false,
            "speedSec": 4,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚・?回転)",
            "teeth": 24,
            "radius": 46,
            "isCW": true,
            "speedSec": 6,
            "color": "#f59e0b"
          }
        ],
        "explanation": "8 × 9 = 72枚。歯車Cは 72 ÷ 24 = 3回転します！工学機械のギアトレインの計算をマスターしました！",
        "examTip": "【達人級の物理工学】時計のムーブメントや車のトランスミッションも、すべてこの歯車比の計算で設計されています！"
      }
    ],
    "2": [
      {
        "question": "歯車A（14枚）が 6回転 するとき、中間ギアB（21枚）を通る歯車C（28枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (14枚・6回転)",
            "teeth": 14,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (21枚・中間)",
            "teeth": 21,
            "radius": 40,
            "isCW": false,
            "speedSec": 3.75,
            "color": "#94a3b8"
          },
          {
            "label": "C (28枚・?回転)",
            "teeth": 28,
            "radius": 48,
            "isCW": true,
            "speedSec": 5,
            "color": "#f59e0b"
          }
        ],
        "explanation": "14 × 6 = 84枚。歯車Cは 84 ÷ 28 = 3回転します！中間ギアBは計算不要！",
        "examTip": "中間ギアの歯数がどんな数字でも、惑わされずにAとCの関係だけに注目しましょう！"
      },
      {
        "question": "歯車A（15枚）が 8回転 するとき、中間ギアB（25枚）を通る歯車C（30枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (15枚・8回転)",
            "teeth": 15,
            "radius": 30,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (25枚・中間)",
            "teeth": 25,
            "radius": 42,
            "isCW": false,
            "speedSec": 3.33,
            "color": "#94a3b8"
          },
          {
            "label": "C (30枚・?回転)",
            "teeth": 30,
            "radius": 48,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "15 × 8 = 120枚。120 ÷ 30 = 4回転します！",
        "examTip": "120 ÷ 30 = 4回転！"
      },
      {
        "question": "歯車A（18枚）が 6回転 するとき、中間ギアB（20枚）を通る歯車C（36枚）は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・6回転)",
            "teeth": 18,
            "radius": 32,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚・中間)",
            "teeth": 20,
            "radius": 36,
            "isCW": false,
            "speedSec": 2.78,
            "color": "#94a3b8"
          },
          {
            "label": "C (36枚・?回転)",
            "teeth": 36,
            "radius": 52,
            "isCW": true,
            "speedSec": 5,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 6 = 108枚。108 ÷ 36 = 3回転します！",
        "examTip": "歯数比 18:36 = 1:2 なので回転数は半分の3回転です！"
      }
    ],
    "3": [
      {
        "question": "4連歯車トレイン！A(15枚・6回転) → B(10枚) → C(25枚) → D(30枚・?回転) は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (15枚・6回転)",
            "teeth": 15,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (10枚・中間)",
            "teeth": 10,
            "radius": 22,
            "isCW": false,
            "speedSec": 1.33,
            "color": "#94a3b8"
          },
          {
            "label": "C (25枚・中間)",
            "teeth": 25,
            "radius": 38,
            "isCW": true,
            "speedSec": 3.33,
            "color": "#94a3b8"
          },
          {
            "label": "D (30枚・?回転)",
            "teeth": 30,
            "radius": 44,
            "isCW": false,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "中間に2個の歯車があっても、最初Aと最後Dだけで決まります！15 × 6 = 90枚。90 ÷ 30 = 3回転します！偶数個（4個）なので反時計回りです。",
        "examTip": "【多段アイドラギア定理】中間の歯車が何連あっても、最初と最後だけで計算！入試の超頻出トラップです。"
      },
      {
        "question": "4連歯車トレイン！A(20枚・6回転) → B(12枚) → C(16枚) → D(24枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 5,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (20枚・6回転)",
            "teeth": 20,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚・中間)",
            "teeth": 12,
            "radius": 24,
            "isCW": false,
            "speedSec": 1.5,
            "color": "#94a3b8"
          },
          {
            "label": "C (16枚・中間)",
            "teeth": 16,
            "radius": 28,
            "isCW": true,
            "speedSec": 2,
            "color": "#94a3b8"
          },
          {
            "label": "D (24枚・?回転)",
            "teeth": 24,
            "radius": 36,
            "isCW": false,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "20 × 6 = 120枚。歯車Dは 120 ÷ 24 = 5回転します！",
        "examTip": "120 ÷ 24 = 5回転！難関中受験生必須のスピード処理です。"
      },
      {
        "question": "4連歯車！A(24枚・4回転) → B(18枚) → C(12枚) → D(32枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (24枚・4回転)",
            "teeth": 24,
            "radius": 34,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (18枚・中間)",
            "teeth": 18,
            "radius": 28,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (12枚・中間)",
            "teeth": 12,
            "radius": 24,
            "isCW": true,
            "speedSec": 1.25,
            "color": "#94a3b8"
          },
          {
            "label": "D (32枚・?回転)",
            "teeth": 32,
            "radius": 42,
            "isCW": false,
            "speedSec": 3.33,
            "color": "#f59e0b"
          }
        ],
        "explanation": "24 × 4 = 96枚。96 ÷ 32 = 3回転します！",
        "examTip": "歯数比 24:32 = 3:4 → 回転数比 4:3！"
      }
    ],
    "4": [
      {
        "question": "5連歯車トレイン！A(16枚・6回転) → B(12枚) → C(20枚) → D(10枚) → E(32枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (16枚・6回転)",
            "teeth": 16,
            "radius": 26,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (12枚)",
            "teeth": 12,
            "radius": 22,
            "isCW": false,
            "speedSec": 1.5,
            "color": "#94a3b8"
          },
          {
            "label": "C (20枚)",
            "teeth": 20,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#94a3b8"
          },
          {
            "label": "D (10枚)",
            "teeth": 10,
            "radius": 20,
            "isCW": false,
            "speedSec": 1.25,
            "color": "#94a3b8"
          },
          {
            "label": "E (32枚・?回転)",
            "teeth": 32,
            "radius": 42,
            "isCW": true,
            "speedSec": 4,
            "color": "#f59e0b"
          }
        ],
        "explanation": "どんなに中間車が増えても恐れるに足りません！16 × 6 = 96枚。96 ÷ 32 = 3回転します！奇数個（5個）なのでAと同じ時計回りです。",
        "examTip": "【最難関中の名問】中間ギアが3個あっても全て無視！16×6 ÷ 32 = 3回転！"
      },
      {
        "question": "5連歯車！A(18枚・5回転) → B(15枚) → C(24枚) → D(12枚) → E(30枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 3,
        "options": [
          2,
          3,
          4,
          5
        ],
        "gears": [
          {
            "label": "A (18枚・5回転)",
            "teeth": 18,
            "radius": 28,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (15枚)",
            "teeth": 15,
            "radius": 24,
            "isCW": false,
            "speedSec": 2.08,
            "color": "#94a3b8"
          },
          {
            "label": "C (24枚)",
            "teeth": 24,
            "radius": 34,
            "isCW": true,
            "speedSec": 3.33,
            "color": "#94a3b8"
          },
          {
            "label": "D (12枚)",
            "teeth": 12,
            "radius": 22,
            "isCW": false,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "E (30枚・?回転)",
            "teeth": 30,
            "radius": 42,
            "isCW": true,
            "speedSec": 4.17,
            "color": "#f59e0b"
          }
        ],
        "explanation": "18 × 5 = 90枚。90 ÷ 30 = 3回転します！",
        "examTip": "送られる全歯数（90枚）がそのままEに届きます。"
      },
      {
        "question": "5連歯車！A(24枚・6回転) → B(16枚) → C(20枚) → D(18枚) → E(36枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (24枚・6回転)",
            "teeth": 24,
            "radius": 30,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (16枚)",
            "teeth": 16,
            "radius": 24,
            "isCW": false,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (20枚)",
            "teeth": 20,
            "radius": 28,
            "isCW": true,
            "speedSec": 2.08,
            "color": "#94a3b8"
          },
          {
            "label": "D (18枚)",
            "teeth": 18,
            "radius": 26,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "E (36枚・?回転)",
            "teeth": 36,
            "radius": 42,
            "isCW": true,
            "speedSec": 3.75,
            "color": "#f59e0b"
          }
        ],
        "explanation": "24 × 6 = 144枚。144 ÷ 36 = 4回転します！",
        "examTip": "144 ÷ 36 = 4！"
      }
    ],
    "5": [
      {
        "question": "歯車A（28枚）が 6回転 するとき、中間ギアB（35枚）を通る歯車C（42枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (28枚・6回転)",
            "teeth": 28,
            "radius": 34,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (35枚・中間)",
            "teeth": 35,
            "radius": 40,
            "isCW": false,
            "speedSec": 3.13,
            "color": "#94a3b8"
          },
          {
            "label": "C (42枚・?回転)",
            "teeth": 42,
            "radius": 48,
            "isCW": true,
            "speedSec": 3.75,
            "color": "#f59e0b"
          }
        ],
        "explanation": "28 × 6 = 168枚。歯車Cは 168 ÷ 42 = 4回転します！",
        "examTip": "7の倍数（28, 35, 42）で構成された御三家レベルの良問！28:42 = 2:3 → 6 × 2/3 = 4回転！"
      },
      {
        "question": "歯車A（32枚）が 6回転 するとき、中間ギアB（24枚）を通る歯車C（48枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (32枚・6回転)",
            "teeth": 32,
            "radius": 36,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (24枚・中間)",
            "teeth": 24,
            "radius": 30,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (48枚・?回転)",
            "teeth": 48,
            "radius": 50,
            "isCW": true,
            "speedSec": 3.75,
            "color": "#f59e0b"
          }
        ],
        "explanation": "32 × 6 = 192枚。192 ÷ 48 = 4回転します！歯数比 32:48 = 2:3 → 回転数比 3:2（6 × 2/3 = 4）。",
        "examTip": "16で約分して 2:3 を導き出せば暗算で解けます！"
      },
      {
        "question": "歯車A（36枚）が 5回転 するとき、中間ギアB（27枚）を通る歯車C（45枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 4,
        "options": [
          3,
          4,
          5,
          6
        ],
        "gears": [
          {
            "label": "A (36枚・5回転)",
            "teeth": 36,
            "radius": 38,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (27枚・中間)",
            "teeth": 27,
            "radius": 32,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (45枚・?回転)",
            "teeth": 45,
            "radius": 48,
            "isCW": true,
            "speedSec": 3.13,
            "color": "#f59e0b"
          }
        ],
        "explanation": "36 × 5 = 180枚。180 ÷ 45 = 4回転します！歯数比 36:45 = 4:5 → 回転数比 5:4（5 × 4/5 = 4）。",
        "examTip": "9の倍数の比率（4:5）も瞬時に計算！"
      }
    ],
    "6": [
      {
        "question": "歯車A（40枚）が 6回転 するとき、中間ギアB（30枚）を通る歯車C（48枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 5,
        "options": [
          4,
          5,
          6,
          7
        ],
        "gears": [
          {
            "label": "A (40枚・6回転)",
            "teeth": 40,
            "radius": 40,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (30枚・中間)",
            "teeth": 30,
            "radius": 34,
            "isCW": false,
            "speedSec": 1.88,
            "color": "#94a3b8"
          },
          {
            "label": "C (48枚・?回転)",
            "teeth": 48,
            "radius": 48,
            "isCW": true,
            "speedSec": 3,
            "color": "#f59e0b"
          }
        ],
        "explanation": "40 × 6 = 240枚。240 ÷ 48 = 5回転します！歯数比 40:48 = 5:6 → 回転数比 6:5（6 × 5/6 = 5回転）。",
        "examTip": "【機械工学の最高峰】8で約分して 5:6 を見抜く超高速解法！"
      },
      {
        "question": "5連複合トレイン！A(30枚・8回転) → B(20枚) → C(25枚) → D(15枚) → E(40枚・?回転) は何回転？",
        "isRatioPuzzle": true,
        "correctTurns": 6,
        "options": [
          4,
          5,
          6,
          8
        ],
        "gears": [
          {
            "label": "A (30枚・8回転)",
            "teeth": 30,
            "radius": 32,
            "isCW": true,
            "speedSec": 2,
            "color": "#38bdf8"
          },
          {
            "label": "B (20枚)",
            "teeth": 20,
            "radius": 24,
            "isCW": false,
            "speedSec": 1.33,
            "color": "#94a3b8"
          },
          {
            "label": "C (25枚)",
            "teeth": 25,
            "radius": 28,
            "isCW": true,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "D (15枚)",
            "teeth": 15,
            "radius": 20,
            "isCW": false,
            "speedSec": 1,
            "color": "#94a3b8"
          },
          {
            "label": "E (40枚・?回転)",
            "teeth": 40,
            "radius": 42,
            "isCW": true,
            "speedSec": 2.67,
            "color": "#f59e0b"
          }
        ],
        "explanation": "30 × 8 = 240枚。歯車Eは 240 ÷ 40 = 6回転します！中間車B, C, Dはすべて無関係！",
        "examTip": "【全国最難関入試完全制圧】何個中間車があっても 30×8 ÷ 40 = 6回転 で10秒殺！"
      },
      {
        "question": "歯車A（42枚）が 6回転 するとき、中間ギアB（28枚）を通る歯車C（36枚）は何回転するかな？",
        "isRatioPuzzle": true,
        "correctTurns": 7,
        "options": [
          5,
          6,
          7,
          8
        ],
        "gears": [
          {
            "label": "A (42枚・6回転)",
            "teeth": 42,
            "radius": 42,
            "isCW": true,
            "speedSec": 2.5,
            "color": "#38bdf8"
          },
          {
            "label": "B (28枚・中間)",
            "teeth": 28,
            "radius": 32,
            "isCW": false,
            "speedSec": 1.67,
            "color": "#94a3b8"
          },
          {
            "label": "C (36枚・?回転)",
            "teeth": 36,
            "radius": 38,
            "isCW": true,
            "speedSec": 2.14,
            "color": "#f59e0b"
          }
        ],
        "explanation": "42 × 6 = 252枚。252 ÷ 36 = 7回転します！歯数比 42:36 = 7:6 → 回転数比 6:7（6 × 7/6 = 7回転）。",
        "examTip": "【歯車マスターの頂点】252枚の歯数計算も完全制覇！機械工学の未来を担う天才です！"
      }
    ]
  }
};

export const GearChainGame: React.FC<GearChainGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number, gNum: number = 3): GearPuzzle[] => {
    const gradeData = GRADE_GEAR_PUZZLES[gNum] || GRADE_GEAR_PUZZLES[3];
    return gradeData[lvl] || gradeData[1];
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level, grade);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [selectedDirection, setSelectedDirection] = useState<'CW' | 'CCW' | null>(null);
  const [selectedTurns, setSelectedTurns] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  const switchProblem = (idx: number) => {
    const nextIdx = idx % puzzles.length;
    const nextP = puzzles[nextIdx];
    setProblemIndex(nextIdx);
    setSelectedDirection(null);
    setSelectedTurns(null);
    setIsCompleted(false);
    setFeedback(nextP.question);
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // When problem, level, or grade changes, reset scroll to start so Gear A is always in view
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [problemIndex, level, grade]);

  const gearCount = puzzle.gears.length;

  // Responsive gear sizes based on count so trains of 5-6 gears fit without overflow on desktop
  const getGearSizeClass = () => {
    if (gearCount <= 3) return 'w-20 h-20 sm:w-24 sm:h-24';
    if (gearCount === 4) return 'w-16 h-16 sm:w-20 sm:h-20';
    // 5 or 6 gears: compact size
    return 'w-13 h-13 sm:w-16 sm:h-16 md:w-18 md:h-18';
  };

  const getGapClass = () => {
    if (gearCount <= 3) return 'gap-2 sm:gap-4';
    if (gearCount === 4) return 'gap-1.5 sm:gap-3';
    return 'gap-1 sm:gap-2';
  };

  const getArrowClass = () => {
    if (gearCount <= 3) return 'text-amber-400 font-black text-lg sm:text-xl shrink-0 select-none';
    if (gearCount === 4) return 'text-amber-400 font-black text-sm sm:text-base shrink-0 select-none';
    return 'text-amber-400 font-black text-xs sm:text-sm md:text-base shrink-0 select-none';
  };

  // SVG Gear Component with rotating animation
  const renderGear = (
    teeth: number,
    radius: number,
    isCW: boolean,
    speedSec = 4,
    color = '#f59e0b',
    label = 'A',
    isSpinning = true,
    isTarget = false,
    isDriver = false
  ) => {
    const sizeClass = getGearSizeClass();

    return (
      <div className="flex flex-col items-center shrink-0">
        <div className="relative flex items-center justify-center">
          <svg
            viewBox="-60 -60 120 120"
            className={`${sizeClass} drop-shadow-md`}
            style={{
              animation: isSpinning
                ? `${isCW ? 'spin' : 'spin-reverse'} ${speedSec}s linear infinite`
                : 'none'
            }}
          >
            <style>{`
              @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
            `}</style>
            {/* Teeth */}
            {Array.from({ length: teeth }).map((_, i) => {
              const angle = (i * 360) / teeth;
              return (
                <rect
                  key={i}
                  x="-5"
                  y={-radius - 8}
                  width="10"
                  height="12"
                  rx="2"
                  fill={color}
                  transform={`rotate(${angle})`}
                />
              );
            })}
            {/* Main Body */}
            <circle cx="0" cy="0" r={radius} fill={color} stroke="#78350f" strokeWidth="2" />
            {/* Inner cutout holes */}
            {[0, 90, 180, 270].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * (radius * 0.5)}
                cy={Math.sin((deg * Math.PI) / 180) * (radius * 0.5)}
                r={radius * 0.2}
                fill="#ffffff"
                stroke="#78350f"
                strokeWidth="1.5"
              />
            ))}
            {/* Center Axle */}
            <circle cx="0" cy="0" r="12" fill="#475569" stroke="#1e293b" strokeWidth="2" />
            <circle cx="0" cy="0" r="4" fill="#fbbf24" />
          </svg>

          {/* Overlaid Question mark for target gear when not completed */}
          {isTarget && !isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`${gearCount >= 5 ? 'w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-base' : 'w-8 h-8 text-base'} rounded-full bg-rose-500 text-white font-black flex items-center justify-center shadow-lg border-2 border-white animate-pulse`}>
                ?
              </div>
            </div>
          )}

          {/* Driver indicator for source gear */}
          {isDriver && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 border border-amber-500 text-[9px] sm:text-[10px] font-black text-amber-950 shadow-sm flex items-center gap-0.5 whitespace-nowrap z-10">
              <span>⚡</span>
              <span>{isCW ? '時計回り' : '反時計回り'}</span>
            </div>
          )}
        </div>

        <span className="mt-2 font-black text-[10px] sm:text-xs px-2 py-0.5 bg-white border border-slate-300 rounded-full shadow-sm text-slate-800 flex items-center gap-1 shrink-0 whitespace-nowrap">
          <span>ギア {label}</span>
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">({teeth}歯)</span>
        </span>
      </div>
    );
  };

  const handleDirectionAnswer = (dir: 'CW' | 'CCW') => {
    setSelectedDirection(dir);
    if (dir === puzzle.targetDirection) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('大正解！歯車の回転方向を正確に読み解きました！すべてのギアが連動して回ります！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！隣り合う歯車は必ず「逆向き」に噛み合います。1つずつたどってみよう！');
    }
  };

  const handleTurnsAnswer = (turns: number) => {
    setSelectedTurns(turns);
    if (turns === puzzle.correctTurns) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(`大正解！正解は「${turns}回転」です！連動して回る様子を確認しよう！`);
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！「歯数 × 回転数」が同じになる関係を計算してみよう！');
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "歯車（ギア）伝達パズル"}
      badgeTag={customBadge || `エンジニア工場 Lv.${level}`}
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
        setSelectedDirection(null);
        setSelectedTurns(null);
        setIsCompleted(false);
        setFeedback(puzzle.question);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 font-extrabold text-amber-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Gear Train Simulation Stage */}
        <div
          ref={scrollContainerRef}
          className="w-full min-h-[195px] bg-slate-900 rounded-3xl p-3 sm:p-5 mb-3 overflow-x-auto shadow-inner border-2 border-slate-700"
        >
          <div className={`w-max min-w-full flex items-center justify-center ${getGapClass()} px-4 sm:px-6 py-4`}>
            {puzzle.gears.map((g, idx) => {
              const isDriver = idx === 0;
              const isTarget = idx === puzzle.gears.length - 1;
              // Only driver spins initially for direction puzzles; all spin once completed
              const isSpinning = isCompleted || (isDriver && !puzzle.isRatioPuzzle);

              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className={getArrowClass()}>⇄</div>}
                  {renderGear(
                    g.teeth,
                    g.radius,
                    g.isCW,
                    g.speedSec,
                    g.color,
                    g.label,
                    isSpinning,
                    isTarget,
                    isDriver
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile scroll guide when there are 5 or more gears */}
        {gearCount >= 5 && (
          <div className="sm:hidden text-[11px] font-bold text-slate-500 mb-3 flex items-center gap-1">
            <span>👉</span>
            <span>左右にスワイプしてギア列全体を確認できるよ</span>
          </div>
        )}

        {/* User Interaction Controls */}
        {!puzzle.isRatioPuzzle ? (
          <div className="w-full max-w-md">
            <span className="text-xs font-black text-slate-600 block text-center mb-3">
              最後のギアはどっち向きに回る？
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDirectionAnswer('CW')}
                className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-md ${
                  selectedDirection === 'CW'
                    ? puzzle.targetDirection === 'CW'
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <RotateCw className="w-5 h-5 text-amber-500" />
                <span>時計回り (右まわり)</span>
              </button>

              <button
                onClick={() => handleDirectionAnswer('CCW')}
                className={`py-3.5 px-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 border-2 transition-all active:scale-95 shadow-md ${
                  selectedDirection === 'CCW'
                    ? puzzle.targetDirection === 'CCW'
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <RotateCcw className="w-5 h-5 text-indigo-500" />
                <span>反時計回り (左まわり)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <span className="text-xs font-black text-slate-600 block text-center mb-2">
              歯車の回転数を選んでね！
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {(puzzle.options || [1, 2, 3, 4]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleTurnsAnswer(opt)}
                  className={`py-3 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-md border-2 ${
                    selectedTurns === opt
                      ? opt === puzzle.correctTurns
                        ? 'bg-emerald-500 text-white border-emerald-300'
                        : 'bg-rose-500 text-white border-rose-300'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  {opt} 回転
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameModalWrapper>
  );
};
