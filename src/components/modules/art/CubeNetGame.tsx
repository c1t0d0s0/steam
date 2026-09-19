import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';


interface CubeNetGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: CubeNetPuzzle[];
  customTitle?: string;
  customBadge?: string;
}
interface NetCell {
  label?: string;
  bg?: string;
  border?: string;
  textClass?: string;
}

interface CubeNetPuzzle {
  question: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  examTip: string;
  gridCols: number;
  grid: (NetCell | null)[];
}

const GRADE_CUBE_NET_PUZZLES: Record<number, Record<number, CubeNetPuzzle[]>> = {
  "3": {
    "1": [
      {
        "question": "展開図を組み立てたとき、黄色い面「B」と向かい合う（平行になる）面はどれ？",
        "correctAnswer": "F",
        "options": [
          "A",
          "C",
          "D",
          "F"
        ],
        "explanation": "十字型の展開図では、上下に飛び出た「B」と「F」が向かい合う面（対面）になります！また、横に4枚並んだ面は1つ飛ばしで向かい合います（AとD、CとE）。",
        "examTip": "【展開図の超基本技】1列に3枚以上並んでいる面は「1マス飛ばし」が必ず向かい合う面になります！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この展開図で、青い面「A」と向かい合う面はどれかな？",
        "correctAnswer": "D",
        "options": [
          "B",
          "C",
          "D",
          "E"
        ],
        "explanation": "横に並んだ A-C-D-E では、1マス飛ばしになる「AとD」が向かい合います！",
        "examTip": "1列に並んだ4枚は、隣どうしが直角に折れ曲がり、1マス飛ばしの面どうしが平行に向かい合います！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この展開図で、青い面「C」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "A",
          "B",
          "D",
          "E"
        ],
        "explanation": "1マス飛ばしの法則により、Cの1つ飛ばしである「E」が向かい合う面になります！",
        "examTip": "AとD、CとE、BとF の3組の対面ペアを素早く見抜くのが展開図攻略の基本です！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      }
    ],
    "2": [
      {
        "question": "サイコロの向かい合う面は足して「7」！上の面が「1」のとき、底になる「？」は何？",
        "correctAnswer": "6",
        "options": [
          "4",
          "5",
          "6",
          "7"
        ],
        "explanation": "7 - 1 = 6 です！サイコロの向かい合う面は和が7になります。",
        "examTip": "【サイコロの原則】1と6、2と5、3と4 が向かい合います！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "2",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "3",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "5",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "4",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      },
      {
        "question": "上の面が「2」のとき、向かい合う底の「？」に入る数字は？（和が7）",
        "correctAnswer": "5",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 2 = 5 が正解です！",
        "examTip": "サイコロは向かい合う面を足すと必ず「7」になります！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "3",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "6",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "4",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      },
      {
        "question": "上の面が「3」のとき、向かい合う底の「？」に入る数字は？（和が7）",
        "correctAnswer": "4",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ],
        "explanation": "7 - 3 = 4 が正解です！",
        "examTip": "「1-6」「2-5」「3-4」の3組を覚えましょう！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "2",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "6",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "5",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      }
    ],
    "3": [
      {
        "question": "この展開図は、正しく組み立てて立方体（サイコロ）にできるかな？",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "この展開図は右の2つの面が重なってしまい、底の面が足りなくなります！",
        "examTip": "面が重なってしまう形は立方体になりません！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-purple-400",
            "border": "border-purple-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-purple-400",
            "border": "border-purple-600",
            "textClass": "text-white"
          },
          null,
          {
            "label": "3",
            "bg": "bg-purple-300",
            "border": "border-purple-500",
            "textClass": "text-purple-950"
          },
          {
            "label": "4",
            "bg": "bg-purple-300",
            "border": "border-purple-500",
            "textClass": "text-purple-950"
          },
          {
            "label": "5",
            "bg": "bg-purple-300",
            "border": "border-purple-500",
            "textClass": "text-purple-950"
          },
          {
            "label": "6",
            "bg": "bg-purple-300",
            "border": "border-purple-500",
            "textClass": "text-purple-950"
          }
        ]
      },
      {
        "question": "この展開図は組み立てて立方体にできるかな？（横に5マス並んでいるよ）",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "1列に5マス並んでしまうと、巻いたときに面が重複して立方体になりません！",
        "examTip": "【最大4マスの法則】立方体の展開図で、1列に並ぶ正方形は最大「4マス」までです！",
        "gridCols": 5,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "2",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      },
      {
        "question": "この展開図（T字型）は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できる！」です。代表的な1-4-1型で、綺麗な立方体になります！",
        "examTip": "上下のフタが1マスずつ互い違いについていれば必ず立方体になります！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          {
            "label": "2",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "3",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "4",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "5",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      }
    ],
    "4": [
      {
        "question": "この1-4-1変形型で、青い面「C」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "A",
          "D",
          "E",
          "F"
        ],
        "explanation": "横4マス列（B, C, D, E）の中で1マス飛ばしになるので、Cの対面は「E」です！",
        "examTip": "上下のフタの位置がズレていても、真ん中4マスの1マス飛ばしの原則はそのまま使えます！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この1-4-1変形型で、黄色い面「A」と向かい合う面はどれかな？",
        "correctAnswer": "F",
        "options": [
          "B",
          "C",
          "E",
          "F"
        ],
        "explanation": "真ん中の4枚が側面になり、上下にある「A」と「F」が上蓋と底面になって向かい合います！",
        "examTip": "上下に1枚ずつ出ている面は、必ず向かい合う「対面」になります！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この1-4-1変形型で、面「B」と向かい合う面はどれかな？",
        "correctAnswer": "D",
        "options": [
          "A",
          "C",
          "D",
          "F"
        ],
        "explanation": "B-C-D-E の1マス飛ばしにより、Bと向かい合うのは「D」です！",
        "examTip": "3組の対面（A-F, B-D, C-E）をすべて把握できれば満点です！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      }
    ],
    "5": [
      {
        "question": "この展開図で「4」の対面（向かい合う面）にある数字は何かな？",
        "correctAnswer": "2",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "横に並んだ 1-4-5-2 の1マス飛ばしで、4と向かい合うのは「2」です！",
        "examTip": "1マス飛ばしの法則を使えば一瞬で見つかります！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "4",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "5",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "2",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      },
      {
        "question": "この展開図で「3」と向かい合う面にある数字は何かな？",
        "correctAnswer": "6",
        "options": [
          "1",
          "2",
          "5",
          "6"
        ],
        "explanation": "上下に出ている「3」と「6」が上蓋と底面になって向かい合います！",
        "examTip": "上下のフタどうしが向かい合います！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "4",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "5",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "2",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      },
      {
        "question": "この展開図で「1」と向かい合う面にある数字は何かな？",
        "correctAnswer": "5",
        "options": [
          "2",
          "4",
          "5",
          "6"
        ],
        "explanation": "1-4-5-2 の1マス飛ばしにより、「1」と向かい合うのは「5」です！",
        "examTip": "1マス飛ばしペア：1と5、4と2！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "4",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "5",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "2",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      }
    ],
    "6": [
      {
        "question": "この「田の字」が含まれる展開図は、立方体にできるかな？",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」！2×2の田の字型が含まれていると、面が重なってしまい絶対に立方体になりません！",
        "examTip": "【田の字NGの法則】展開図の中に2×2のカタマリがあるものは絶対に立方体になりません！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      },
      {
        "question": "この展開図は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」が大正解！1-4-1型のフタが両端にあるパターンで、綺麗にサイコロが完成します！",
        "examTip": "1-4-1型は両端にフタがあっても互い違いなら組み立て可能です！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "2",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "3",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "4",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "5",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          }
        ]
      },
      {
        "question": "小学3年生の展開図マスター！この十字型で「緑の面」の対面はどれ？",
        "correctAnswer": "黄色",
        "options": [
          "青",
          "赤",
          "黄色",
          "紫"
        ],
        "explanation": "上下に出ている黄色と緑が向かい合う面になります！",
        "examTip": "展開図の基本（対面・1マス飛ばし・できる形）を完全マスターしました！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "黄色",
            "bg": "bg-yellow-400",
            "border": "border-yellow-600",
            "textClass": "text-yellow-950"
          },
          null,
          null,
          {
            "label": "青",
            "bg": "bg-blue-400",
            "border": "border-blue-600",
            "textClass": "text-white"
          },
          {
            "label": "赤",
            "bg": "bg-red-400",
            "border": "border-red-600",
            "textClass": "text-white"
          },
          {
            "label": "紫",
            "bg": "bg-purple-400",
            "border": "border-purple-600",
            "textClass": "text-white"
          },
          {
            "label": "橙",
            "bg": "bg-orange-400",
            "border": "border-orange-600",
            "textClass": "text-white"
          },
          null,
          {
            "label": "緑",
            "bg": "bg-green-400",
            "border": "border-green-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      }
    ]
  },
  "4": {
    "1": [
      {
        "question": "この1-4-1型展開図で、面「C」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "A",
          "D",
          "E",
          "F"
        ],
        "explanation": "横に並んだ B-C-D-E で1マス飛ばしになるので「E」です！",
        "examTip": "1マス飛ばしの法則を活用しましょう！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この1-4-1型展開図で、面「B」と向かい合う面はどれかな？",
        "correctAnswer": "D",
        "options": [
          "A",
          "C",
          "D",
          "F"
        ],
        "explanation": "B-C-D-E の1マス飛ばしで「D」です！",
        "examTip": "BとD、CとE、AとFがそれぞれ向かい合います。",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この1-4-1型展開図で、面「A」と向かい合う面はどれかな？",
        "correctAnswer": "F",
        "options": [
          "B",
          "C",
          "D",
          "F"
        ],
        "explanation": "上下のフタになる「A」と「F」が向かい合います！",
        "examTip": "上下に1枚ずつある面は必ず対面になります！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null
        ]
      }
    ],
    "2": [
      {
        "question": "和が「7」のサイコロを作りたい！「？」に入る数字は何かな？",
        "correctAnswer": "3",
        "options": [
          "1",
          "3",
          "4",
          "6"
        ],
        "explanation": "向かい合う面が「4」なので、7 - 4 = 3 が正解です！",
        "examTip": "4の対面は3！和が7になる関係です。",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      },
      {
        "question": "このサイコロ展開図で「？」に入る数字は何かな？（和が7）",
        "correctAnswer": "5",
        "options": [
          "2",
          "3",
          "4",
          "5"
        ],
        "explanation": "向かい合う面が「2」なので、7 - 2 = 5 です！",
        "examTip": "2の対面は5！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      },
      {
        "question": "このサイコロ展開図で「？」に入る数字は何かな？（和が7）",
        "correctAnswer": "6",
        "options": [
          "1",
          "4",
          "5",
          "6"
        ],
        "explanation": "上の面が「1」なので、向かい合う底の面は 7 - 1 = 6 です！",
        "examTip": "1の対面は6！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null
        ]
      }
    ],
    "3": [
      {
        "question": "この展開図は組み立てて立方体にできるかな？（階段状に2枚ずつ並んでいるよ）",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」が大正解！これは「2-3-1型」の展開図で、綺麗な立方体を作ることができます！",
        "examTip": "【展開図11種類】2-3-1型は中学受験で頻出のパターンです！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "2",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "4",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "5",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      },
      {
        "question": "この展開図は立方体にできるかな？（同じ列の上下に面があるよ）",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」！上下の面が同じ位置にあると、巻いたときに重なってしまいます！",
        "examTip": "フタになる面が同じ側に向かい合うと重複します！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "2",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      },
      {
        "question": "この展開図は立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」です！1-4-1型の両端フタ配置で、綺麗な立方体になります。",
        "examTip": "互い違いのフタは重ならずに上下の底面になります！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          null,
          {
            "label": "1",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "2",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "3",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "4",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "5",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null
        ]
      }
    ],
    "4": [
      {
        "question": "2-3-1型の展開図でサイコロを作りたい！「4」と向かい合う「？」に入る数字は何？",
        "correctAnswer": "3",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 4 = 3 が正解です！2-3-1型を組み立てると、4の面と向かい合うのは「3」になります。",
        "examTip": "【2-3-1型サイコロ】真ん中の3枚のうち両端と、上下の面がそれぞれどう折れるかをイメージしましょう！",
        "gridCols": 4,
        "grid": [
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「5」と向かい合う対面に入る数字は何？（和が7）",
        "correctAnswer": "2",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "explanation": "7 - 5 = 2 が正解です！組み立てたとき「2」と「5」が向かい合います。",
        "examTip": "サイコロの対面の和は7！組み立てたときの面の位置関係を確実に推理しましょう。",
        "gridCols": 4,
        "grid": [
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「6」と向かい合う対面に入る数字は何？（和が7）",
        "correctAnswer": "1",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 6 = 1 が正解です！1行に並んだ面で「1」と「6」が向かい合います。",
        "examTip": "難関校の図形問題で差がつく2-3-1型の空間把握を完全マスター！",
        "gridCols": 4,
        "grid": [
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "6",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      }
    ],
    "5": [
      {
        "question": "この2-3-1型展開図で、面「A」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "B",
          "C",
          "D",
          "E"
        ],
        "explanation": "2-3-1型を組み立てると、一番上の「A」と下の「E」が向かい合う対面になります！",
        "examTip": "2-3-1型の対面ペア：AとE、BとD、CとF！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          {
            "label": "F",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型展開図で、面「B」と向かい合う面はどれかな？",
        "correctAnswer": "D",
        "options": [
          "A",
          "C",
          "D",
          "F"
        ],
        "explanation": "上の「B」と真ん中の「D」が平行に向かい合います！",
        "examTip": "頭の中で箱を組み立ててみましょう！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "F",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型展開図で、面「C」と向かい合う面はどれかな？",
        "correctAnswer": "F",
        "options": [
          "A",
          "B",
          "D",
          "F"
        ],
        "explanation": "横に並んだ面で「C」と一番下の「F」が向かい合います！",
        "examTip": "3組の対面をすべて特定できれば完璧です！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      }
    ],
    "6": [
      {
        "question": "このギザギザ階段型（2-2-2型）の展開図は、立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できる！」です！2枚ずつのギザギザ階段（2-2-2型）も、立方体を組み立てることができる貴重な1種類です！",
        "examTip": "【11種類の希少型】2-2-2型は1種類しか存在しない特別な展開図です！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "4",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      },
      {
        "question": "この階段型（3-3型）の展開図は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」が大正解！一見重なりそうに見えますが、3枚ずつの階段型（3-3型）は立方体を作ることができる有名な11種類の1つです！",
        "examTip": "【展開図11種類の名問】3-3型は入試で「できない」と誤答しやすいワナ問題として最もよく出題されます！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "3",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "4",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          }
        ]
      },
      {
        "question": "このU字型展開図は、立方体にできるかな？",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」！U字型に折ると角の面が重なり合ってしまい、箱のフタが足りなくなります！",
        "examTip": "U字型や環状に折れる形は重複するため立方体になりません！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "2",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      }
    ]
  },
  "5": {
    "1": [
      {
        "question": "2-3-1型サイコロで「4」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "3",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 4 = 3 が正解です！2-3-1型を組み立てると、4の面と向かい合うのは「3」になります。",
        "examTip": "【2-3-1型サイコロ】真ん中の3枚のうち両端と、上下の面がそれぞれどう折れるかをイメージしましょう！",
        "gridCols": 4,
        "grid": [
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「5」と向かい合う対面に入る数字は何？（和が7）",
        "correctAnswer": "2",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "explanation": "7 - 5 = 2 が正解です！組み立てたとき「2」と「5」が向かい合います。",
        "examTip": "サイコロの対面の和は7！組み立てたときの面の位置関係を確実に推理しましょう。",
        "gridCols": 4,
        "grid": [
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「6」と向かい合う対面に入る数字は何？（和が7）",
        "correctAnswer": "1",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 6 = 1 が正解です！1行に並んだ面で「1」と「6」が向かい合います。",
        "examTip": "難関校の図形問題で差がつく2-3-1型の空間把握を完全マスター！",
        "gridCols": 4,
        "grid": [
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "6",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null
        ]
      }
    ],
    "2": [
      {
        "question": "この2-3-1型（反転形）サイコロで、「1」と向かい合う対面の「？」は何？",
        "correctAnswer": "6",
        "options": [
          "2",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 1 = 6 が正解です！",
        "examTip": "反転した2-3-1型でも、対面の関係は変わりません！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「2」と向かい合う対面の「？」は何？",
        "correctAnswer": "5",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 2 = 5 が正解です！",
        "examTip": "対面の和＝7を活用しましょう！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "3",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この2-3-1型サイコロで、「3」と向かい合う対面の「？」は何？",
        "correctAnswer": "4",
        "options": [
          "1",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 3 = 4 が正解です！",
        "examTip": "3の対面は4です！",
        "gridCols": 4,
        "grid": [
          null,
          null,
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "5",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null,
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          null
        ]
      }
    ],
    "3": [
      {
        "question": "この階段型（3-3型）の展開図は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」が大正解！3枚ずつの階段型（3-3型）は立方体を作ることができる有名な11種類の1つです！",
        "examTip": "【展開図11種類の名問】3-3型は入試で「できない」と誤答しやすいワナ問題として最もよく出題されます！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "3",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "4",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          }
        ]
      },
      {
        "question": "このギザギザ階段型（2-2-2型）の展開図は、立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できる！」です！2枚ずつのギザギザ階段（2-2-2型）も、立方体を組み立てることができる貴重な1種類です！",
        "examTip": "【11種類の希少型】2-2-2型と3-3型はそれぞれ1種類ずつしか存在しない特別な展開図です！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "4",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      },
      {
        "question": "この展開図は立方体にできるかな？（同じ列の上下に面が突き出ているよ）",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」！上下の面が同じ側に重なってしまい、底面が足りなくなります。",
        "examTip": "【達人の直感】フタになる面が同じ場所で向かい合うと必ず重なります。",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "2",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      }
    ],
    "4": [
      {
        "question": "この3-3型展開図で、面「A」と向かい合う面はどれかな？",
        "correctAnswer": "C",
        "options": [
          "B",
          "C",
          "D",
          "E"
        ],
        "explanation": "3-3型を組み立てると、3枚並びの両端にある「A」と「C」が向かい合います！",
        "examTip": "【3-3型の対面ペア】3枚並びの両端（AとC、DとF）、そして真ん中同士（BとE）が向かい合います！",
        "gridCols": 5,
        "grid": [
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          null,
          {
            "label": "D",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "F",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          }
        ]
      },
      {
        "question": "この3-3型展開図で、面「B」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "A",
          "C",
          "D",
          "E"
        ],
        "explanation": "上の段の真ん中「B」と、下の段の真ん中「E」が平行に向かい合います！",
        "examTip": "それぞれの段の真ん中の面同士（BとE）が向かい合うペアになります！",
        "gridCols": 5,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          null,
          {
            "label": "D",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "E",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "F",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          }
        ]
      },
      {
        "question": "この3-3型展開図で、面「D」と向かい合う面はどれかな？",
        "correctAnswer": "F",
        "options": [
          "A",
          "B",
          "E",
          "F"
        ],
        "explanation": "下の段も3枚並びの両端である「D」と「F」が向かい合います！",
        "examTip": "3-3型は、3枚並びの両端同士（AとC、DとF）と真ん中同士（BとE）の3ペアです！",
        "gridCols": 5,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          null,
          {
            "label": "D",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "E",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          }
        ]
      }
    ],
    "5": [
      {
        "question": "2-2-2型ギザギザ展開図で、面「A」と向かい合う面はどれかな？",
        "correctAnswer": "D",
        "options": [
          "B",
          "C",
          "D",
          "E"
        ],
        "explanation": "2-2-2型を組み立てると、「A」と向かい合うのは「D」です！",
        "examTip": "2-2-2型の対面ペア：AとD、BとE、CとF！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "E",
            "bg": "bg-sky-200",
            "border": "border-sky-400",
            "textClass": "text-sky-950"
          },
          {
            "label": "F",
            "bg": "bg-sky-200",
            "border": "border-sky-400",
            "textClass": "text-sky-950"
          }
        ]
      },
      {
        "question": "2-2-2型ギザギザ展開図で、面「B」と向かい合う面はどれかな？",
        "correctAnswer": "E",
        "options": [
          "A",
          "C",
          "D",
          "E"
        ],
        "explanation": "「B」と向かい合うのは下段左の「E」です！",
        "examTip": "それぞれの段差で互い違いに向かい合います！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "E",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "F",
            "bg": "bg-sky-200",
            "border": "border-sky-400",
            "textClass": "text-sky-950"
          }
        ]
      },
      {
        "question": "2-2-2型ギザギザ展開図で、面「C」と向かい合う面はどれかな？",
        "correctAnswer": "F",
        "options": [
          "A",
          "B",
          "D",
          "F"
        ],
        "explanation": "中段左の「C」と向かい合うのは一番右下の「F」です！",
        "examTip": "2-2-2型の空間把握を完全マスター！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "D",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "E",
            "bg": "bg-sky-200",
            "border": "border-sky-400",
            "textClass": "text-sky-950"
          },
          {
            "label": "F",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          }
        ]
      }
    ],
    "6": [
      {
        "question": "この3-3型でサイコロを作りたい！「4」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "3",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 4 = 3 が正解です！3枚並びの両端にある「3」と「4」が向かい合います。",
        "examTip": "【最難関校のサイコロ問題】3-3型展開図でも和が7の法則で素早く解きましょう！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          }
        ]
      },
      {
        "question": "この2-2-2型でサイコロを作りたい！「2」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "5",
        "options": [
          "1",
          "3",
          "4",
          "5"
        ],
        "explanation": "7 - 2 = 5 が正解です！上段右の「2」と向かい合うのは下段左の「5」です。",
        "examTip": "2-2-2型サイコロの対面を完全攻略！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "4",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      },
      {
        "question": "この2-2-2型で「1」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "6",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 1 = 6 が正解です！上段左の「1」と向かい合うのは中段右の「6」です。",
        "examTip": "小学5年生の立体展開図を完全制覇！高校数学の空間幾何の基礎もバッチリです！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "4",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      }
    ]
  },
  "6": {
    "1": [
      {
        "question": "この階段型（3-3型）の展開図は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "「できる！」が大正解！3枚ずつの階段型（3-3型）は立方体を作ることができる有名な11種類の1つです！",
        "examTip": "【展開図11種類の名問】3-3型は入試で「できない」と誤答しやすいワナ問題として最もよく出題されます！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "3",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "4",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          }
        ]
      },
      {
        "question": "このギザギザ階段型（2-2-2型）の展開図は、立方体にできるかな？",
        "correctAnswer": "できる！",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できる！」です！2枚ずつのギザギザ階段（2-2-2型）も、立方体を組み立てることができる貴重な1種類です！",
        "examTip": "【11種類の希少型】2-2-2型と3-3型はそれぞれ1種類ずつしか存在しない特別な展開図です！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "4",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      },
      {
        "question": "この展開図は立方体にできるかな？（同じ列の上下に面が突き出ているよ）",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」！上下の面が同じ側に重なってしまい、底面が足りなくなります。",
        "examTip": "【達人の直感】フタになる面が同じ場所で向かい合うと必ず重なります。展開図マスター達成です！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "2",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "3",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "4",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "5",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          },
          {
            "label": "6",
            "bg": "bg-rose-300",
            "border": "border-rose-500",
            "textClass": "text-rose-950"
          }
        ]
      }
    ],
    "2": [
      {
        "question": "この3-3型でサイコロを作りたい！「4」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "3",
        "options": [
          "1",
          "2",
          "3",
          "5"
        ],
        "explanation": "7 - 4 = 3 が正解です！3枚並びの両端にある「3」と「4」が向かい合います。",
        "examTip": "【最難関校のサイコロ問題】3-3型展開図でも和が7の法則で素早く解きましょう！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          }
        ]
      },
      {
        "question": "この3-3型サイコロで「2」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "5",
        "options": [
          "1",
          "3",
          "4",
          "5"
        ],
        "explanation": "7 - 2 = 5 が正解です！それぞれの段の真ん中にある「2」と「5」が向かい合います。",
        "examTip": "3-3型の対面ペア：1と6、2と5、3と4！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "6",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "4",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          }
        ]
      },
      {
        "question": "この3-3型サイコロで「1」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "6",
        "options": [
          "3",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 1 = 6 が正解です！上の段の両端にある「1」と「6」が向かい合います。",
        "examTip": "難関中学入試頻出の3-3型サイコロを完全制覇！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "5",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "4",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          }
        ]
      }
    ],
    "3": [
      {
        "question": "この2-2-2型ギザギザ展開図で「2」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "5",
        "options": [
          "1",
          "3",
          "4",
          "5"
        ],
        "explanation": "7 - 2 = 5 が正解です！上段右の「2」と向かい合うのは下段左の「5」です。",
        "examTip": "2-2-2型の対面ペア：1と6、2と5、3と4！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "4",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      },
      {
        "question": "この2-2-2型で「3」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "4",
        "options": [
          "1",
          "4",
          "5",
          "6"
        ],
        "explanation": "7 - 3 = 4 が正解です！中段左の「3」と向かい合うのは一番右下の「4」です。",
        "examTip": "段差をまたいで互い違いに対面します！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "6",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          }
        ]
      },
      {
        "question": "この2-2-2型で「1」と向かい合う「？」に入る数字は何？（和が7）",
        "correctAnswer": "6",
        "options": [
          "2",
          "3",
          "5",
          "6"
        ],
        "explanation": "7 - 1 = 6 が正解です！上段左の「1」と向かい合うのは中段右の「6」です。",
        "examTip": "2-2-2型の全パターンを完全制覇！",
        "gridCols": 4,
        "grid": [
          {
            "label": "1",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "2",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "3",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          {
            "label": "5",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "4",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      }
    ],
    "4": [
      {
        "question": "この立体展開図を組み立てたとき、赤い点「P」と重なる頂点はどれかな？",
        "correctAnswer": "点S",
        "options": [
          "点Q",
          "点R",
          "点S",
          "点T"
        ],
        "explanation": "正解は「点S」です！展開図を立体に組み立てると、切り開かれた辺どうしが合わさり、点Pと点Sが同じ1つの頂点に一致します！",
        "examTip": "【頂点の重なり問題】難関中の合否を分ける最重要テーマ！辺の長さを1マスずつ辿っていくと重なる頂点が必ず特定できます！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "P",
            "bg": "bg-rose-500",
            "border": "border-rose-700",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "Q",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "S",
            "bg": "bg-emerald-500",
            "border": "border-emerald-700",
            "textClass": "text-white"
          },
          null,
          {
            "label": "R",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null
        ]
      },
      {
        "question": "この立体展開図で、赤い点「P」と重なる頂点はどれかな？",
        "correctAnswer": "点T",
        "options": [
          "点Q",
          "点R",
          "点S",
          "点T"
        ],
        "explanation": "直角に折れ曲がると点Pと点Tがぴったり重なり合います！",
        "examTip": "直角に接する2辺は、組み立てると1本の辺に合体します！",
        "gridCols": 4,
        "grid": [
          {
            "label": "P",
            "bg": "bg-rose-500",
            "border": "border-rose-700",
            "textClass": "text-white"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          null,
          {
            "label": "T",
            "bg": "bg-emerald-500",
            "border": "border-emerald-700",
            "textClass": "text-white"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          null,
          {
            "label": "R",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null
        ]
      },
      {
        "question": "この展開図で、点「A」と重なる頂点はどれかな？",
        "correctAnswer": "点C",
        "options": [
          "点B",
          "点C",
          "点D",
          "点E"
        ],
        "explanation": "折りたたむと点Aと点Cが1つの頂点に合わさります！",
        "examTip": "対称性と折れ曲がり方向を意識して頂点を追跡しましょう！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "A",
            "bg": "bg-rose-500",
            "border": "border-rose-700",
            "textClass": "text-white"
          },
          null,
          null,
          {
            "label": "B",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          {
            "label": "C",
            "bg": "bg-emerald-500",
            "border": "border-emerald-700",
            "textClass": "text-white"
          },
          {
            "label": "面",
            "bg": "bg-sky-300",
            "border": "border-sky-500",
            "textClass": "text-sky-950"
          },
          null,
          {
            "label": "D",
            "bg": "bg-sky-400",
            "border": "border-sky-600",
            "textClass": "text-sky-950"
          },
          null,
          null
        ]
      }
    ],
    "5": [
      {
        "question": "この展開図で、向かい合う面の積（かけ算）がすべて等しくなるサイコロを作りたい。「？」は何？",
        "correctAnswer": "12",
        "options": [
          "6",
          "8",
          "12",
          "18"
        ],
        "explanation": "1行の「2」と「18」が対面で積は 2 × 18 = 36。また「6」と「6」で 36。したがって「3」の対面「？」は 36 ÷ 3 = 12 になります！",
        "examTip": "【難関中の積算サイコロ】和が7だけでなく、積が一定になる変形問題も対面を見抜けば即座に解けます！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "18",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      },
      {
        "question": "対面の積が「24」になるサイコロ！「3」と向かい合う「？」は何？",
        "correctAnswer": "8",
        "options": [
          "4",
          "6",
          "8",
          "12"
        ],
        "explanation": "24 ÷ 3 = 8 が正解です！",
        "examTip": "対面の積＝24！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "3",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "4",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "12",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "6",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      },
      {
        "question": "対面の和が「10」になる特殊サイコロ！「4」と向かい合う「？」は何？",
        "correctAnswer": "6",
        "options": [
          "3",
          "5",
          "6",
          "7"
        ],
        "explanation": "10 - 4 = 6 が正解です！",
        "examTip": "問題文の条件に合わせた柔軟な思考力！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "4",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          null,
          null,
          {
            "label": "1",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "2",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "9",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          {
            "label": "8",
            "bg": "bg-indigo-300",
            "border": "border-indigo-500",
            "textClass": "text-indigo-950"
          },
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          null,
          null
        ]
      }
    ],
    "6": [
      {
        "question": "【最難関・展開図の完全制覇】この超変形型展開図は、正しく組み立てて立方体にできるかな？",
        "correctAnswer": "できない",
        "options": [
          "できる！",
          "できない"
        ],
        "explanation": "正解は「できない」です！一見組み立てられそうに見えますが、面「1, 2, 4, 5」が2×2の「田の字」を作っています。1つの頂点に4枚の面が集まる（90°×4=360°）と、折ったときに面同士が重なってしまうため、立方体を組み立てることはできません！",
        "examTip": "【最難関のワナを見破れ！】どんなに複雑な展開図に見えても、「田の字（2×2）」が含まれるものは絶対に立方体になりません！",
        "gridCols": 4,
        "grid": [
          null,
          {
            "label": "1",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          {
            "label": "2",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          {
            "label": "3",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "4",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          {
            "label": "5",
            "bg": "bg-emerald-300",
            "border": "border-emerald-500",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "6",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null
        ]
      },
      {
        "question": "この3-3型で、対面の積が「30」になるサイコロ！「5」と向かい合う「？」は何？",
        "correctAnswer": "6",
        "options": [
          "3",
          "5",
          "6",
          "10"
        ],
        "explanation": "30 ÷ 5 = 6 が正解です！3-3型で3枚並びの両端にある5と向かい合うのは「6」になります。",
        "examTip": "【空間認識力の頂点】難関中学の幾何・立体問題で無類の強さを発揮できます！",
        "gridCols": 5,
        "grid": [
          {
            "label": "1",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "2",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          {
            "label": "30",
            "bg": "bg-fuchsia-400",
            "border": "border-fuchsia-600",
            "textClass": "text-white"
          },
          null,
          null,
          null,
          null,
          {
            "label": "?",
            "bg": "bg-rose-400",
            "border": "border-rose-600",
            "textClass": "text-white"
          },
          {
            "label": "15",
            "bg": "bg-fuchsia-300",
            "border": "border-fuchsia-500",
            "textClass": "text-fuchsia-950"
          },
          {
            "label": "5",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          }
        ]
      },
      {
        "question": "【立体図形レジェンド認定】この展開図で、面「A」と向かい合う面はどれかな？",
        "correctAnswer": "面D",
        "options": [
          "面B",
          "面C",
          "面D",
          "面E"
        ],
        "explanation": "正解は「面D」！2-2-2型（ギザギザ階段型）を組み立てると、上段左の面「A」と平行に向かい合うのは中段右の面「D」です！",
        "examTip": "【2-2-2型の対面ペア】AとD、BとE、CとF！階段の段差を挟んで互い違いに向かい合う3組のペアになります！",
        "gridCols": 4,
        "grid": [
          {
            "label": "A",
            "bg": "bg-amber-400",
            "border": "border-amber-600",
            "textClass": "text-amber-950"
          },
          {
            "label": "B",
            "bg": "bg-cyan-400",
            "border": "border-cyan-600",
            "textClass": "text-cyan-950"
          },
          null,
          null,
          null,
          {
            "label": "C",
            "bg": "bg-cyan-300",
            "border": "border-cyan-500",
            "textClass": "text-cyan-950"
          },
          {
            "label": "D",
            "bg": "bg-emerald-400",
            "border": "border-emerald-600",
            "textClass": "text-emerald-950"
          },
          null,
          null,
          null,
          {
            "label": "E",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          },
          {
            "label": "F",
            "bg": "bg-cyan-200",
            "border": "border-cyan-400",
            "textClass": "text-cyan-950"
          }
        ]
      }
    ]
  }
};

export const CubeNetGame: React.FC<CubeNetGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number, gNum: number = 3): CubeNetPuzzle[] => {
    const gradeData = GRADE_CUBE_NET_PUZZLES[gNum] || GRADE_CUBE_NET_PUZZLES[3];
    return gradeData[lvl] || gradeData[1];
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level, grade);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(puzzle.question);

  const switchProblem = (idx: number) => {
    const nextIdx = idx % puzzles.length;
    const nextP = puzzles[nextIdx];
    setProblemIndex(nextIdx);
    setSelectedOption(null);
    setIsCompleted(false);
    setFeedback(nextP.question);
  };

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
    if (opt === puzzle.correctAnswer) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('大正解！展開図の空間構成を見事にマスターしました！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('おしい！頭の中で紙を折って組み立てるイメージをしてみよう！');
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "立方体の展開図マスター"}
      badgeTag={customBadge || `デザイン工房 Lv.${level}`}
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
        setSelectedOption(null);
        setIsCompleted(false);
        setFeedback(puzzle.question);
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-purple-50 border border-purple-200 rounded-2xl mb-4 font-extrabold text-purple-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* 2D Net Display Canvas */}
        <div className="w-full max-w-sm bg-gradient-to-b from-indigo-50 to-purple-50 border-2 border-purple-200 rounded-3xl p-4 sm:p-6 mb-5 flex flex-col items-center justify-center shadow-inner relative min-h-[180px]">
          <div
            className="grid gap-1 sm:gap-2"
            style={{ gridTemplateColumns: `repeat(${puzzle.gridCols}, minmax(0, 1fr))` }}
          >
            {puzzle.grid.map((cell, idx) =>
              cell ? (
                <div
                  key={idx}
                  className={`w-11 h-11 sm:w-12 sm:h-12 ${cell.bg || 'bg-sky-400'} border-2 ${
                    cell.border || 'border-sky-600'
                  } rounded-xl flex items-center justify-center font-black ${
                    cell.textClass || 'text-sky-950'
                  } text-lg sm:text-xl shadow`}
                >
                  {cell.label}
                </div>
              ) : (
                <div key={idx} className="w-11 h-11 sm:w-12 sm:h-12" />
              )
            )}
          </div>
        </div>

        {/* Options */}
        <div className="w-full max-w-md">
          <span className="text-xs font-black text-slate-600 block text-center mb-3">
            選択肢から選んでね！
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {puzzle.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`py-3.5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-md border-2 ${
                  selectedOption === opt
                    ? opt === puzzle.correctAnswer
                      ? 'bg-emerald-500 text-white border-emerald-300'
                      : 'bg-rose-500 text-white border-rose-300'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameModalWrapper>
  );
};
