import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';

interface LeverBalanceGameProps {
  level: number; // 1 to 6
  grade?: number; // 3 to 6
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: PuzzleData[];
  customTitle?: string;
  customBadge?: string;
}

interface WeightSlot {
  pos: number; // -4 to -1 for left, 1 to 4 for right
  weight: number; // in grams
  locked?: boolean;
}

interface PuzzleData {
  targetPos: number;
  initialWeights: WeightSlot[];
  explanation: string;
  examTip: string;
  availableWeights: number[];
}

const GRADE_PUZZLES: Record<number, Record<number, PuzzleData[]>> = {
  "3": {
    "1": [
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は「きょり 3 × 重さ 20g = 60」。右のきょり 2 に「30g」を置くと「2 × 30g = 60」で釣り合います！",
        "examTip": "てこの基本公式：【支点からの距離 × おもりの重さ】が左右で同じになると釣り合います！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          20,
          25,
          35
        ],
        "explanation": "左の力は「きょり 2 × 重さ 30g = 60」。右のきょり 3 に「20g」を置くと「3 × 20g = 60」で釣り合います！",
        "examTip": "支点からの距離が1.5倍になると、釣り合うために必要なおもりは2/3の重さで済みます！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          20,
          25,
          30,
          35
        ],
        "explanation": "左の力は「きょり 4 × 重さ 10g = 40」。右のきょり 2 に「20g」を置くと「2 × 20g = 40」で釣り合います！",
        "examTip": "支点からの距離が半分なら、必要な重さは2倍になります！"
      }
    ],
    "2": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          25,
          30,
          35
        ],
        "explanation": "左の力は「きょり 2 × 重さ 20g = 40」。右のきょり 4 に「10g」を置くと「4 × 10g = 40」で釣り合います！",
        "examTip": "遠いフックにおもりをかけると、小さな重さでも大きな力を生み出せます！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          20,
          25,
          35
        ],
        "explanation": "左の力は「きょり 1 × 重さ 30g = 30」。右のきょり 3 に「10g」を置くと「3 × 10g = 30」で釣り合います！",
        "examTip": "支点からの距離が3倍遠い場所なら、1/3の軽さで釣り合います！"
      },
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は「きょり 4 × 重さ 10g = 40」。右のきょり 1 に「40g」を置くと「1 × 40g = 40」で釣り合います！",
        "examTip": "支点のすぐ近くは、釣り合わせるためにとても重い力が必要です！"
      }
    ],
    "3": [
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (1×20g) + (2×10g) = 40。右のきょり 1 に「40g」を置くと「1 × 40g = 40」で釣り合います！",
        "examTip": "左側に2つおもりがある時は、それぞれの【距離×重さ】を足し算しましょう！"
      },
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 10,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (3×10g) + (1×10g) = 40。右のきょり 1 に「40g」を置くと「1 × 40g = 40」で釣り合います！",
        "examTip": "合計の力を計算してから、右側のフックの距離で割り算すると正解が出ます！"
      },
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          40,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (2×20g) + (1×10g) = 50。右のきょり 1 に「50g」を置くと「1 × 50g = 50」で釣り合います！",
        "examTip": "支点からの距離が1なら、おもりの重さがそのまま「まわす力」になります！"
      }
    ],
    "4": [
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (3×20g) + (1×20g) = 80。右のきょり 2 に「40g」を置くと「2 × 40g = 80」で釣り合います！",
        "examTip": "左側の合計力80を、右側の距離2で割ると 80÷2=40g が導けます！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 15,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (4×15g) + (2×10g) = 80。右のきょり 4 に「20g」を置くと「4 × 20g = 80」で釣り合います！",
        "examTip": "15gのような半端な数字でも、かけ算と足し算を丁寧に行えば安心です！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 10,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (3×20g) + (1×10g) = 70。右側は既に (1×10g) = 10 あるため、不足する力は 70 - 10 = 60 です。右のきょり 2 に「30g」を置くと「2 × 30g = 60」となり水平に釣り合います！",
        "examTip": "右側にすでにおもりがある時は、左の合計から右の分を引き算します！"
      }
    ],
    "5": [
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 10,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (4×10g) + (2×20g) = 80。右側は既に (2×10g) = 20 あるため、不足する力は 80 - 20 = 60 です。右のきょり 1 に「60g」を置くと「1 × 60g = 60」となり水平に釣り合います！",
        "examTip": "【逆算思考】80 - 20 = 60、60 ÷ 3 = 20g と順を追って計算しましょう！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          20,
          25,
          35,
          40
        ],
        "explanation": "左の力は (3×30g) = 90。右側は既に (1×10g) = 10 あるため、不足する力は 90 - 10 = 80 です。右のきょり 4 に「20g」を置くと「4 × 20g = 80」となり水平に釣り合います！",
        "examTip": "左右のつり合いの式をメモして不足分を割り算しましょう！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (4×20g) = 80。右側は既に (1×20g) = 20 あるため、不足する力は 80 - 20 = 60 です。右のきょり 2 に「30g」を置くと「2 × 30g = 60」となり水平に釣り合います！",
        "examTip": "未知のおもりを□とおいて、80 = 20 + 2×□ を解く方程式の芽生えです！"
      }
    ],
    "6": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (4×20g) + (2×10g) = 100。右のきょり 4 に「25g」を置くと「4 × 25g = 100」で釣り合います！",
        "examTip": "小3マスター！25gなど小数の感覚も混ざる発展計算をクリアしました！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (3×30g) + (1×20g) = 110。右側は既に (1×20g) = 20 あるため、不足する力は 110 - 20 = 90 です。右のきょり 2 に「45g」を置くと「2 × 45g = 90」となり水平に釣り合います！",
        "examTip": "左右の力のモーメントの合計を合わせる感覚が完全に身につきました！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (4×20g) + (2×20g) = 120。右のきょり 4 に「30g」を置くと「4 × 30g = 120」で釣り合います！",
        "examTip": "てこ天秤の達人！中学受験の理科物理分野の基本はパーフェクトです！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は「きょり 3 × 重さ 30g = 90」。右のきょり 2 に「45g」を置くと「2 × 45g = 90」で釣り合います！",
        "examTip": "小4ではより大きなおもりの力（トルク）を正確に計算していきます！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          20,
          25,
          30
        ],
        "explanation": "左の力は「きょり 2 × 重さ 40g = 80」。右のきょり 4 に「20g」を置くと「4 × 20g = 80」で釣り合います！",
        "examTip": "距離が2倍（2から4）なら、重さは半分（40gから20g）で釣り合います！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は「きょり 4 × 重さ 20g = 80」。右のきょり 2 に「40g」を置くと「2 × 40g = 80」で釣り合います！",
        "examTip": "距離と重さの反比例の関係を意識しましょう。"
      }
    ],
    "2": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 10,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          20,
          25,
          35,
          40
        ],
        "explanation": "左の力は (4×10g) + (1×30g) = 70。右側は既に (1×10g) = 10 あるため、不足する力は 70 - 10 = 60 です。右のきょり 3 に「20g」を置くと「3 × 20g = 60」となり水平に釣り合います！",
        "examTip": "左右におもりがあるときは、左右それぞれのモーメントの合計を比較します！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 10,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (3×20g) + (2×10g) = 80。右側は既に (1×20g) = 20 あるため、不足する力は 80 - 20 = 60 です。右のきょり 2 に「30g」を置くと「2 × 30g = 60」となり水平に釣り合います！",
        "examTip": "入試問題では引き算してから割り算する逆算手順が頻出です！"
      },
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 10,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 10,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (4×10g) + (2×20g) = 80。右側は既に (2×10g) = 20 あるため、不足する力は 80 - 20 = 60 です。右のきょり 1 に「60g」を置くと「1 × 60g = 60」となり水平に釣り合います！",
        "examTip": "複数のフックがある場合でも、一つひとつ「距離×重さ」をメモすれば確実です。"
      }
    ],
    "3": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×20g) + (2×20g) = 120。右のきょり 3 に「40g」を置くと「3 × 40g = 120」で釣り合います！",
        "examTip": "支点にかかる全体の重さ（20+20+40=80g）も中学入試でよく問われます！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (3×30g) + (1×30g) = 120。右のきょり 2 に「60g」を置くと「2 × 60g = 120」で釣り合います！",
        "examTip": "モーメントが120になる組み合わせを素早く見つけましょう！"
      },
      {
        "targetPos": 1,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          50,
          55,
          60,
          70,
          80
        ],
        "explanation": "左の力は (3×40g) = 120。右側は既に (2×20g) = 40 あるため、不足する力は 120 - 40 = 80 です。右のきょり 1 に「80g」を置くと「1 × 80g = 80」となり水平に釣り合います！",
        "examTip": "右側の既知モーメントを差し引いて残りを求める逆算立式をマスターしよう！"
      }
    ],
    "4": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -1,
            "weight": 60,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 15,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (1×60g) + (3×30g) = 150。右側は既に (2×15g) = 30 あるため、不足する力は 150 - 30 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "支点近くの重いものと遠くの軽いもの。釘抜きやハサミに応用されています。"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -2,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          55,
          60,
          70,
          80
        ],
        "explanation": "左の力は (2×50g) + (1×40g) = 140。右側は既に (1×20g) = 20 あるため、不足する力は 140 - 20 = 120 です。右のきょり 2 に「60g」を置くと「2 × 60g = 120」となり水平に釣り合います！",
        "examTip": "左右それぞれを整理して 140 = 20 + 3×□ から □=40g を求めます！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          25,
          30,
          35
        ],
        "explanation": "左の力は (4×20g) + (3×20g) = 140。右側は既に (2×20g) = 40 あるため、不足する力は 140 - 40 = 100 です。右のきょり 4 に「25g」を置くと「4 × 25g = 100」となり水平に釣り合います！",
        "examTip": "25gのようにおもりのバリエーションが増えても計算は同じです！"
      }
    ],
    "5": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×30g) + (2×30g) = 180。右側は既に (2×30g) = 60 あるため、不足する力は 180 - 60 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "【難関中の逆算てこ】180 = 60 + (4×□) から □=30g を求めます！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          45
        ],
        "explanation": "左の力は (3×40g) + (2×20g) = 160。右側は既に (2×20g) = 40 あるため、不足する力は 160 - 40 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "複雑な問題でも、ステップに分解して確実に正解を導きましょう！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          45
        ],
        "explanation": "左の力は (4×20g) + (2×40g) = 160。右側は既に (1×40g) = 40 あるため、不足する力は 160 - 40 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "左右どちらも同じ重さのおもりがあっても、距離が違えば力は異なります！"
      }
    ],
    "6": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (4×35g) + (2×30g) = 200。右側は既に (1×20g) = 20 あるため、不足する力は 200 - 20 = 180 です。右のきょり 3 に「60g」を置くと「3 × 60g = 180」となり水平に釣り合います！",
        "examTip": "小4トップレベル！200の大きなモーメントも見事に釣り合わせました！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 25,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (2×25g) = 200。右側は既に (2×20g) = 40 あるため、不足する力は 200 - 40 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "中学入試頻出の左右複数加重問題もスムーズに解けるようになりました！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (1×30g) = 180。右側は既に (2×30g) = 60 あるため、不足する力は 180 - 60 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "てこ天秤の力の釣り合いマスター！高学年レベルの応用力があります！"
      }
    ]
  },
  "5": {
    "1": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×20g) + (2×30g) = 140。右側は既に (1×20g) = 20 あるため、不足する力は 140 - 20 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "【小5応用てこ】左右のトルク計算に加えて、支点に加わる全荷重も意識しましょう。"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (3×40g) + (2×15g) = 150。右側は既に (1×30g) = 30 あるため、不足する力は 150 - 30 = 120 です。右のきょり 2 に「60g」を置くと「2 × 60g = 120」となり水平に釣り合います！",
        "examTip": "複数のおもりのモーメント計算を暗算で行うスピードを鍛えましょう！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×25g) + (2×30g) = 160。右のきょり 4 に「40g」を置くと「4 × 40g = 160」で釣り合います！",
        "examTip": "端のフックにかかる大きな力と支点側の力の合成を正確に！"
      }
    ],
    "2": [
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (3×40g) + (1×30g) = 150。右側は既に (1×30g) = 30 あるため、不足する力は 150 - 30 = 120 です。右のきょり 2 に「60g」を置くと「2 × 60g = 120」となり水平に釣り合います！",
        "examTip": "150 - 30 = 120、120 ÷ 3 = 40g！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×30g) + (2×20g) = 160。右側は既に (2×20g) = 40 あるため、不足する力は 160 - 40 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "【逆比例の直感】フック位置と必要重量の積が常に等しいことを確認。"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (1×20g) = 170。右側は既に (3×30g) = 90 あるため、不足する力は 170 - 90 = 80 です。右のきょり 2 に「40g」を置くと「2 × 40g = 80」となり水平に釣り合います！",
        "examTip": "右側のフックに既知の重いおもりがある場合も、引き算で冷静に対処！"
      }
    ],
    "3": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×30g) + (3×20g) = 180。右側は既に (2×30g) = 60 あるため、不足する力は 180 - 60 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "未知のおもりを□とする方程式の解き方を確実に。"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          50,
          55,
          60,
          70,
          80
        ],
        "explanation": "左の力は (4×40g) + (1×20g) = 180。右側は既に (1×20g) = 20 あるため、不足する力は 180 - 20 = 160 です。右のきょり 2 に「80g」を置くと「2 × 80g = 160」となり水平に釣り合います！",
        "examTip": "中学入試頻出！左右の複雑なモーメント合成問題です。"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (2×20g) = 190。右側は既に (1×30g) = 30 あるため、不足する力は 190 - 30 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "合計190の高トルクバランス！正確な四則演算が合否を分けます。"
      }
    ],
    "4": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          45
        ],
        "explanation": "左の力は (4×40g) + (1×40g) = 200。右側は既に (1×20g) + (3×20g) = 80 あるため、不足する力は 200 - 80 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "【多重モーメント】右側に2つのおもりがある場合も、全部足してから引き算します！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (2×30g) = 210。右側は既に (1×30g) + (2×30g) = 90 あるため、不足する力は 210 - 90 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "左右ともに複数のおもりが配置された難関校定番の良問です！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 25,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 35,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          40,
          45,
          55,
          60
        ],
        "explanation": "左の力は (4×50g) + (2×25g) = 250。右側は既に (1×20g) + (2×35g) = 90 あるため、不足する力は 250 - 90 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "200 = 80 + 4×□ → □ = 30g！"
      }
    ],
    "5": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 35,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×35g) + (2×35g) = 210。右側は既に (1×30g) + (2×30g) = 90 あるため、不足する力は 210 - 90 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "35gなど非典型的な重さでも、基本に忠実に計算すれば絶対に解けます！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          40,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (4×30g) + (3×30g) = 210。右側は既に (1×20g) + (2×20g) = 60 あるため、不足する力は 210 - 60 = 150 です。右のきょり 3 に「50g」を置くと「3 × 50g = 150」となり水平に釣り合います！",
        "examTip": "難関校の物理分野で問われる「重心移動」の感覚が身についています！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 25,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          20,
          30,
          40,
          45
        ],
        "explanation": "左の力は (4×35g) + (2×15g) = 170。右側は既に (2×25g) = 50 あるため、不足する力は 170 - 50 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "220の高トルク！支点にかかる合計重量（40+30+30+40=140g）も計算できます。"
      }
    ],
    "6": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          30,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×35g) + (3×20g) = 200。右側は既に (2×20g) = 40 あるため、不足する力は 200 - 40 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "小5最高峰！3箇所のおもりモーメント合成を完全攻略しました！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (4×30g) + (3×30g) + (2×20g) = 250。右側は既に (1×20g) + (2×40g) = 100 あるため、不足する力は 250 - 100 = 150 です。右のきょり 3 に「50g」を置くと「3 × 50g = 150」となり水平に釣り合います！",
        "examTip": "左右合計5つのおもりが絡む入試最難関問題もこれで完璧です！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 25,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×30g) + (3×25g) + (1×15g) = 210。右側は既に (2×25g) = 50 あるため、不足する力は 210 - 50 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "完璧な物理演算力！どんな中学校のてこ・天秤問題にも通用する実力です！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          50
        ],
        "explanation": "左の力は (4×30g) + (2×30g) = 180。右側は既に (2×30g) = 60 あるため、不足する力は 180 - 60 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "【難関中の逆算てこ】180 = 60 + (4×□) から □=30g を求めます！"
      },
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (3×40g) + (2×30g) = 180。右側は既に (1×30g) = 30 あるため、不足する力は 180 - 30 = 150 です。右のきょり 3 に「50g」を置くと「3 × 50g = 150」となり水平に釣り合います！",
        "examTip": "難関校受験生は左右のモーメント計算を暗算で10秒以内に処理します！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 25,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×35g) + (2×25g) = 190。右側は既に (1×30g) = 30 あるため、不足する力は 190 - 30 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "25gや35gといった端数のおもりも落ち着いて暗算・筆算しましょう。"
      }
    ],
    "2": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          25,
          30,
          35,
          45
        ],
        "explanation": "左の力は (4×40g) + (1×40g) = 200。右側は既に (1×20g) + (3×20g) = 80 あるため、不足する力は 200 - 80 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "複数のフックにおもりが吊るされた状態からの逆算は、御三家・難関校の頻出パターンです！"
      },
      {
        "targetPos": 2,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          45,
          50,
          55,
          60,
          70
        ],
        "explanation": "左の力は (4×40g) + (2×15g) = 190。右側は既に (1×10g) + (3×20g) = 70 あるため、不足する力は 190 - 70 = 120 です。右のきょり 2 に「60g」を置くと「2 × 60g = 120」となり水平に釣り合います！",
        "examTip": "左辺3項、右辺2項の等式を瞬時に組み立てられるようにしましょう！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 45,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          25,
          30,
          35,
          40
        ],
        "explanation": "左の力は (3×45g) + (2×20g) = 175。右側は既に (1×15g) + (2×20g) = 55 あるため、不足する力は 175 - 55 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "左右合計4箇所のモーメントの和を正確に一致させます！"
      }
    ],
    "3": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 50,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          35,
          40,
          45,
          55
        ],
        "explanation": "左の力は (3×50g) + (2×30g) = 210。右側は既に (1×30g) + (2×30g) = 90 あるため、不足する力は 210 - 90 = 120 です。右のきょり 3 に「40g」を置くと「3 × 40g = 120」となり水平に釣り合います！",
        "examTip": "左右のつり合いだけでなく、支点を吊り下げる糸の張力（全体の重さの和）も計算できるようにしましょう！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          25,
          30,
          45
        ],
        "explanation": "左の力は (4×35g) + (2×40g) = 220。右側は既に (1×20g) + (2×40g) = 100 あるため、不足する力は 220 - 100 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "最難関校対策：てこ自体の重さ（重心）を考慮する応用問題の基礎になります！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          25,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×35g) + (2×30g) + (1×20g) = 220。右側は既に (2×30g) = 60 あるため、不足する力は 220 - 60 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "重いおもりを中心近くに置くか端に置くかでモーメントが激変します！"
      }
    ],
    "4": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×25g) + (3×35g) + (2×15g) = 235。右側は既に (1×15g) + (2×30g) = 75 あるため、不足する力は 235 - 75 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "【達人級・力のモーメント】最難関校の物理分野で出題される複雑な重心・てこ問題も、この原理の応用です！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 25,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 25,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×35g) + (3×25g) + (1×20g) = 235。右側は既に (1×25g) + (2×25g) = 75 あるため、不足する力は 235 - 75 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "左右で5つのおもりが拮抗するスーパーハイレベルバランス！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 50,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          15,
          30,
          35,
          40,
          45
        ],
        "explanation": "左の力は (4×25g) + (2×50g) = 200。右側は既に (1×20g) + (3×20g) = 80 あるため、不足する力は 200 - 80 = 120 です。右のきょり 4 に「30g」を置くと「4 × 30g = 120」となり水平に釣り合います！",
        "examTip": "入試本番でも、てこの問題を見たらまず左右それぞれの「距離×重さ」をメモする習慣を続けましょう！"
      }
    ],
    "5": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 20,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          40,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (4×30g) + (3×20g) + (2×20g) = 220。右側は既に (1×10g) + (2×30g) = 70 あるため、不足する力は 220 - 70 = 150 です。右のきょり 3 に「50g」を置くと「3 × 50g = 150」となり水平に釣り合います！",
        "examTip": "支点からの距離とおもりの重さの関係を完全にマスターしました。中学理科の物理基礎は完璧です！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×30g) + (3×25g) + (2×20g) = 235。右側は既に (1×15g) + (2×30g) = 75 あるため、不足する力は 235 - 75 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "35gのおもりを使った合計260の超高難度モーメント！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 3,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          15,
          25,
          35,
          45
        ],
        "explanation": "左の力は (4×40g) + (2×30g) + (1×20g) = 240。右側は既に (1×20g) + (3×40g) = 140 あるため、不足する力は 240 - 140 = 100 です。右のきょり 4 に「25g」を置くと「4 × 25g = 100」となり水平に釣り合います！",
        "examTip": "御三家中受験レベル！両側に合計6個のおもりが並ぶ壮観なつり合いです。"
      }
    ],
    "6": [
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 35,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 50,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          25,
          40,
          45,
          55
        ],
        "explanation": "左の力は (4×35g) + (3×30g) + (2×30g) = 290。右側は既に (1×30g) + (2×50g) = 130 あるため、不足する力は 290 - 130 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "【全国模試トップ級】290の巨大モーメントを釣り合わせる計算力！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 25,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 20,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 15,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          40,
          45,
          50,
          55
        ],
        "explanation": "左の力は (4×30g) + (3×25g) + (2×20g) = 235。右側は既に (1×15g) + (2×30g) = 75 あるため、不足する力は 235 - 75 = 160 です。右のきょり 4 に「40g」を置くと「4 × 40g = 160」となり水平に釣り合います！",
        "examTip": "中学入試の理科・物理計算はすべて制覇しました。自信を持って受験に臨めます！"
      },
      {
        "targetPos": 4,
        "initialWeights": [
          {
            "pos": -4,
            "weight": 40,
            "locked": true
          },
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          },
          {
            "pos": -2,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 30,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          35,
          45,
          50,
          55,
          60
        ],
        "explanation": "左の力は (4×40g) + (3×30g) + (2×30g) = 310。右側は既に (1×30g) + (2×40g) = 110 あるため、不足する力は 310 - 110 = 200 です。右のきょり 4 に「50g」を置くと「4 × 50g = 200」となり水平に釣り合います！",
        "examTip": "【天秤の最高峰マスター】310モーメントの完全制圧！STEAM探検隊の物理レジェンドです！"
      }
    ]
  }
};
export const LeverBalanceGame: React.FC<LeverBalanceGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number, gNum: number = 3): PuzzleData[] => {
    const gradeData = GRADE_PUZZLES[gNum] || GRADE_PUZZLES[3];
    return gradeData[lvl] || gradeData[1];
  };

  const puzzles = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level, grade);
  const [problemIndex, setProblemIndex] = useState(0);
  const puzzle = puzzles[problemIndex % puzzles.length];

  // Exclude weights used in initialWeights so the player cannot mirror-copy the left side
  const initialWeightValues = puzzle.initialWeights.map((w) => w.weight);
  const selectableWeights = puzzle.availableWeights.filter((w) => !initialWeightValues.includes(w));

  const [weights, setWeights] = useState<WeightSlot[]>(puzzle.initialWeights);
  const [selectedWeight, setSelectedWeight] = useState<number>(
    selectableWeights[0] || puzzle.availableWeights[0]
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('右側のフックにおもりを置いて天秤を釣り合わせよう！');
  const [showHint, setShowHint] = useState(false);

  const switchProblem = (idx: number) => {
    const nextPuzzle = puzzles[idx % puzzles.length];
    const nextInitValues = nextPuzzle.initialWeights.map((w) => w.weight);
    const nextSelectable = nextPuzzle.availableWeights.filter((w) => !nextInitValues.includes(w));
    setProblemIndex(idx % puzzles.length);
    setWeights(nextPuzzle.initialWeights);
    setSelectedWeight(nextSelectable[0] || nextPuzzle.availableWeights[0]);
    setIsCompleted(false);
    setFeedbackMsg('右側のフックにおもりを置いて天秤を釣り合わせよう！');
  };

  // Calculate torque (distance from pivot * weight)
  const leftTorque = weights
    .filter((w) => w.pos < 0)
    .reduce((sum, w) => sum + Math.abs(w.pos) * w.weight, 0);

  const rightTorque = weights
    .filter((w) => w.pos > 0)
    .reduce((sum, w) => sum + w.pos * w.weight, 0);

  // Calculate tilt angle in degrees (-15 to +15)
  const diff = rightTorque - leftTorque;
  const tiltAngle = Math.max(-12, Math.min(12, diff * 0.25));

  const handleSlotClick = (pos: number) => {
    sound.playClick();
    // Only right hooks (pos > 0) can be placed or removed by the player
    if (pos < 0) {
      return;
    }

    // Check if slot has a locked weight
    const existingIndex = weights.findIndex((w) => w.pos === pos);
    if (existingIndex >= 0 && weights[existingIndex].locked) {
      return; // Can't remove locked initial weights
    }

    if (existingIndex >= 0) {
      // Remove weight
      setWeights(weights.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add selected weight
      setWeights([...weights, { pos, weight: selectedWeight }]);
    }
  };

  const handleCheck = () => {
    if (leftTorque === rightTorque && rightTorque > 0) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedbackMsg('大正解！みごとに水平につり合いました！');
      onComplete(3);
    } else {
      sound.playWrong();
      if (leftTorque > rightTorque) {
        setFeedbackMsg(`左が重いよ！（左: ${leftTorque} vs 右: ${rightTorque}）右に足そう！`);
      } else {
        setFeedbackMsg(`右が重いよ！（左: ${leftTorque} vs 右: ${rightTorque}）`);
      }
    }
  };

  return (
    <GameModalWrapper
      title={customTitle || "てこ天秤の釣り合いパズル"}
      badgeTag={customBadge || `サイエンス島 小${grade}・Lv.${level}`}
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
        setWeights(puzzle.initialWeights);
        setIsCompleted(false);
      }}
      onOpenHelp={() => setShowHint(!showHint)}
    >
      <div className="flex flex-col items-center select-none">
        {/* Status Prompt */}
        <div className="w-full text-center py-2 px-4 bg-amber-50 border border-amber-200 rounded-2xl mb-4 font-extrabold text-amber-900 text-sm sm:text-base">
          {feedbackMsg}
        </div>

        {/* Real-time Torque Monitor Cards */}
        <div className="flex justify-between w-full max-w-lg mb-6 gap-3">
          <div className="flex-1 bg-sky-50 border-2 border-sky-300 rounded-2xl p-2.5 text-center shadow-sm">
            <span className="text-xs font-bold text-sky-700 block">左のまわす力 (距離×重さ)</span>
            <span className="text-2xl font-black text-sky-900">{leftTorque}</span>
          </div>
          <div className="flex items-center justify-center font-black text-slate-400 text-lg">
            {leftTorque === rightTorque && rightTorque > 0 ? '==' : 'vs'}
          </div>
          <div className="flex-1 bg-rose-50 border-2 border-rose-300 rounded-2xl p-2.5 text-center shadow-sm">
            <span className="text-xs font-bold text-rose-700 block">右のまわす力 (距離×重さ)</span>
            <span className="text-2xl font-black text-rose-900">{rightTorque}</span>
          </div>
        </div>

        {/* Seesaw Simulation Area */}
        <div className="w-full max-w-lg h-56 relative flex items-center justify-center mb-6 overflow-hidden bg-gradient-to-b from-sky-50 to-emerald-50/40 rounded-3xl border-2 border-slate-200 shadow-inner">
          {/* Ceiling / Support wire guide */}
          <div className="absolute top-0 w-1 h-12 bg-slate-300"></div>

          {/* Pivot Fulcrum (Triangle) */}
          <div className="absolute bottom-6 w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[60px] border-b-amber-600 drop-shadow-md">
            <div className="absolute top-10 -left-1.5 w-3 h-3 bg-amber-200 rounded-full"></div>
          </div>
          <div className="absolute bottom-4 text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            支点（中心）
          </div>

          {/* Beam (Tilts dynamically) */}
          <div
            className="absolute w-[88%] h-5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-full shadow-lg transition-transform duration-500 flex items-center justify-between px-2"
            style={{
              transform: `translateY(-30px) rotate(${tiltAngle}deg)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Center Pivot Point */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-300 rounded-full border-2 border-amber-900 shadow"></div>

            {/* Position Hooks: Left (-4 to -1) and Right (1 to 4) */}
            {[-4, -3, -2, -1, 1, 2, 3, 4].map((pos) => {
              const currentSlotWeight = weights.find((w) => w.pos === pos);
              const isLeft = pos < 0;
              const isTarget = pos === puzzle.targetPos;
              return (
                <button
                  key={pos}
                  onClick={() => handleSlotClick(pos)}
                  className={`relative group flex flex-col items-center justify-center transition-all ${
                    currentSlotWeight?.locked || isLeft ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${50 + pos * 11.5}%`,
                    transform: 'translateX(-50%)'
                  }}
                  title={`距離 ${Math.abs(pos)}`}
                >
                  {/* Hook pin */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      isTarget
                        ? 'bg-amber-400 border-amber-950 scale-125 shadow-sm ring-2 ring-amber-300'
                        : 'bg-yellow-100 border-amber-900'
                    }`}
                  ></div>
                  <span
                    className={`text-[10px] font-black -mt-1 drop-shadow transition-all ${
                      isTarget ? 'text-yellow-300 font-extrabold scale-110' : 'text-amber-100'
                    }`}
                  >
                    {Math.abs(pos)}
                  </span>

                  {/* Target hook badge */}
                  {isTarget && !currentSlotWeight && (
                    <div className="absolute -top-7 px-1.5 py-0.5 rounded-full bg-amber-400 border border-amber-500 text-amber-950 font-black text-[9px] shadow-sm animate-bounce whitespace-nowrap z-20">
                      🎯 ここ！
                    </div>
                  )}

                  {/* Hanging Weight */}
                  {currentSlotWeight ? (
                    <div
                      className={`absolute top-5 flex flex-col items-center animate-bounce-slow ${
                        currentSlotWeight.locked ? 'opacity-95' : 'hover:scale-110'
                      }`}
                    >
                      <div className="w-0.5 h-3 bg-slate-600"></div>
                      <div
                        className={`px-2 py-1 rounded-lg text-xs font-black shadow-md border-2 ${
                          isLeft
                            ? 'bg-sky-500 text-white border-sky-300'
                            : 'bg-rose-500 text-white border-rose-300'
                        }`}
                      >
                        {currentSlotWeight.weight}g
                      </div>
                      {currentSlotWeight.locked && (
                        <span className="text-[9px] text-amber-800 font-extrabold bg-amber-200 rounded px-1 -mt-1 shadow-sm">
                          固定
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="absolute top-5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-0.5 h-3 bg-dashed border-l border-slate-400"></div>
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px] text-slate-500 bg-white/70">
                        +
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight Selector Bar */}
        <div className="w-full max-w-lg bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-600 mb-2">
            置きたいおもりの重さを選んでから、右側のフックをタップしてね！
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {selectableWeights.map((w) => (
              <button
                key={w}
                onClick={() => {
                  sound.playClick();
                  setSelectedWeight(w);
                }}
                className={`px-4 py-2 rounded-xl font-black text-sm transition-all active:scale-95 ${
                  selectedWeight === w
                    ? 'bg-rose-500 text-white shadow-md scale-105 border-2 border-rose-200'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                {w}g
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCheck}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>⚖️ つり合いを判定する！</span>
        </button>

        {/* Hint Box */}
        {showHint && (
          <div className="w-full max-w-lg mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs sm:text-sm">
            <span className="font-black block mb-1">💡 ヒント</span>
            左の力（{leftTorque}）と右の力が同じになれば水平になります。「右のきょり × 置く重さ = {leftTorque}」になる数字を探してみよう！
          </div>
        )}
      </div>
    </GameModalWrapper>
  );
};
