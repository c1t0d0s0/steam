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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左の力は「きょり 3 × 重さ 20g = 60」。右のきょり 2 には「30g」を置くと「2 × 30g = 60」でピタリと釣り合います！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左の力は「きょり 2 × 重さ 30g = 60」。右のきょり 3 には「20g」を置くと「3 × 20g = 60」で釣り合います！",
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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左の力は「きょり 4 × 重さ 10g = 40」。右のきょり 2 には「20g」を置くと「2 × 20g = 40」で釣り合います！",
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
          20,
          30
        ],
        "explanation": "左は 2 × 20g = 40。右のきょり 4 に「10g」を置くと 4 × 10g = 40 で釣り合います！",
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
          20,
          30
        ],
        "explanation": "左は 1 × 30g = 30。右のきょり 3 に「10g」で 3 × 10g = 30 です！",
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 4 × 10g = 40。右のきょり 1 に「40g」を置くと 1 × 40g = 40 です！",
        "examTip": "支点のすぐ近くは、釣り合わせるためにとても重い力が必要です！"
      }
    ],
    "3": [
      {
        "targetPos": 2,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左の力は (1×20) + (2×10) = 40。右のきょり 2 に「20g」で 2 × 20 = 40！",
        "examTip": "左側に2つおもりがある時は、それぞれの【距離×重さ】を足し算しましょう！"
      },
      {
        "targetPos": 4,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左の力は (3×10) + (1×10) = 40。右のきょり 4 に「10g」で 4 × 10 = 40！",
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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左の力は (2×20) + (1×10) = 50。右のきょり 1 に「50g」で 1 × 50 = 50！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左の力は 60 + 20 = 80。右のきょり 2 に「40g」で 2 × 40 = 80！",
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
          10,
          15,
          20,
          30
        ],
        "explanation": "左の力は 60 + 20 = 80。右のきょり 4 に「20g」で 4 × 20 = 80！",
        "examTip": "15gのような半端な数字でも、かけ算と足し算を丁寧に行えば安心です！"
      },
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 60 + 10 = 70。右は既に 1×10 = 10 あるので残り60。きょり 3 に「20g」(3×20=60)で 70 に一致！",
        "examTip": "右側にすでにおもりがある時は、左の合計から右の分を引き算します！"
      }
    ],
    "5": [
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 40 + 40 = 80。右は既に 2×10 = 20 あるので残り60。きょり 3 に「20g」で釣り合います！",
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
          10,
          20,
          30
        ],
        "explanation": "左は 3×30 = 90。右は既に 1×10 = 10 あるので残り80。きょり 4 に「20g」(4×20=80)で釣り合います！",
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 4×20 = 80。右は 1×20 = 20 あるので残り60。きょり 2 に「30g」(2×30=60)で 80！",
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
          10,
          15,
          20,
          25,
          30
        ],
        "explanation": "左は 80 + 20 = 100。右のきょり 4 に「25g」で 4 × 25 = 100！",
        "examTip": "小3マスター！25gなど小数の感覚も混ざる発展計算をクリアしました！"
      },
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 90 + 20 = 110。右は 1×20 = 20。残り90を きょり 3 に「30g」で 110！",
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
          20,
          30,
          40
        ],
        "explanation": "左は 80 + 40 = 120。右のきょり 4 に「30g」で 4 × 30 = 120！",
        "examTip": "てこ天秤の達人！中学受験の理科物理分野の基本はパーフェクトです！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "targetPos": 3,
        "initialWeights": [
          {
            "pos": -3,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 3×30g = 90。右のきょり 3 に「30g」で 3×30g = 90！",
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
          20,
          30,
          40
        ],
        "explanation": "左は 2×40g = 80。右のきょり 4 に「20g」で 4×20g = 80！",
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 4×20g = 80。右のきょり 2 に「40g」で 2×40g = 80！",
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は (4×10) + (1×30) = 70。右は 1×10 = 10。残り60を きょり 3 に「20g」で 70！",
        "examTip": "左右におもりがあるときは、左右それぞれのモーメントの合計を比較します！"
      },
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 60 + 20 = 80。右は 1×20 = 20。残り60を きょり 3 に「20g」で 80！",
        "examTip": "入試問題では引き算してから割り算する逆算手順が頻出です！"
      },
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 40 + 40 = 80。右は 2×10 = 20。残り60を きょり 3 に「20g」で 80！",
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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 80 + 40 = 120。右のきょり 3 に「40g」で 3×40 = 120！",
        "examTip": "支点にかかる全体の重さ（20+20+40=80g）も中学入試でよく問われます！"
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
            "pos": -1,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 90 + 30 = 120。右のきょり 4 に「30g」で 4×30 = 120！",
        "examTip": "モーメントが120になる組み合わせを素早く見つけましょう！"
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
            "pos": 2,
            "weight": 20,
            "locked": true
          }
        ],
        "availableWeights": [
          10,
          20,
          25,
          30,
          40
        ],
        "explanation": "左は 3×40 = 120。右は 2×20 = 40。不足する 80 を きょり 4 に「20g」で 120！",
        "examTip": "右側の既知モーメントを差し引いて残りを求める逆算立式をマスターしよう！"
      }
    ],
    "4": [
      {
        "targetPos": 4,
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
          15,
          20,
          30,
          40
        ],
        "explanation": "左は 60 + 90 = 150。右は 2×15 = 30。残り120を きょり 4 に「30g」で 150！",
        "examTip": "支点近くの重いものと遠くの軽いもの。釘抜きやハサミに応用されています。"
      },
      {
        "targetPos": 3,
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
          10,
          20,
          30,
          40
        ],
        "explanation": "左は 100 + 40 = 140。右は 1×20 = 20。残り120を きょり 3 に「40g」で 140！",
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
          20,
          25,
          30
        ],
        "explanation": "左は 80 + 60 = 140。右は 2×20 = 40。残り100を きょり 4 に「25g」で 140！",
        "examTip": "25gのようにおもりのバリエーションが増えても計算は同じです！"
      }
    ],
    "5": [
      {
        "targetPos": 4,
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
          15,
          20,
          30,
          40
        ],
        "explanation": "左は 120 + 60 = 180。右は 2×30 = 60。残り120を きょり 4 に「30g」で 180！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 40 = 160。右は 2×20 = 40。残り120を きょり 3 に「40g」で 160！",
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
          20,
          25,
          30
        ],
        "explanation": "左は 80 + 80 = 160。右は 1×40 = 40。残り120を きょり 4 に「30g」で 160！",
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
          30,
          40,
          50,
          60
        ],
        "explanation": "左は 140 + 60 = 200。右は 1×20 = 20。残り180を きょり 3 に「60g」で 200！",
        "examTip": "小4トップレベル！200の大きなモーメントも見事に釣り合わせました！"
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
            "pos": -4,
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 80 = 200。右は 2×20 = 40。残り160を きょり 4 に「40g」で 200！",
        "examTip": "中学入試頻出の左右複数加重問題もスムーズに解けるようになりました！"
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 150 + 30 = 180。右は 2×30 = 60。残り120を きょり 4 に「30g」で 180！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 80 + 60 = 140。右は 1×20 = 20。残り120を きょり 3 に「40g」で 140！",
        "examTip": "【小5応用てこ】左右のトルク計算に加えて、支点に加わる全荷重も意識しましょう。"
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
          20,
          30,
          40
        ],
        "explanation": "左は 120 + 30 = 150。右は 1×30 = 30。残り120を きょり 4 に「30g」で 150！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 100 + 60 = 160。右のきょり 4 に「40g」で 4×40 = 160！",
        "examTip": "端のフックにかかる大きな力と支点側の力の合成を正確に！"
      }
    ],
    "2": [
      {
        "targetPos": 3,
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 30 = 150。右は 1×30 = 30。残り120を きょり 3 に「40g」で 150！",
        "examTip": "150 - 30 = 120、120 ÷ 3 = 40g！"
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
          20,
          30,
          40
        ],
        "explanation": "左は 120 + 40 = 160。右は 2×20 = 40。残り120を きょり 4 に「30g」で 160！",
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
          30,
          40,
          50
        ],
        "explanation": "左は 150 + 20 = 170。右は 3×30 = 90。残り80を きょり 2 に「40g」で 170！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 60 = 180。右は 2×30 = 60。残り120を きょり 3 に「40g」で 180！",
        "examTip": "未知のおもりを□とする方程式の解き方を確実に。"
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 160 + 20 = 180。右は 1×20 = 20。残り160を きょり 4 に「40g」で 180！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 150 + 40 = 190。右は 1×30 = 30。残り160を きょり 4 に「40g」で 190！",
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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 160 + 40 = 200。右は (1×20) + (3×20) = 80。不足する 120 を きょり 4 に「30g」で 200！",
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 150 + 60 = 210。右は 30 + 60 = 90。不足する 120 を きょり 3 に「40g」で 210！",
        "examTip": "左右ともに複数のおもりが配置された難関校定番の良問です！"
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
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          25,
          30,
          40
        ],
        "explanation": "左は 120 + 80 = 200。右は 20 + 60 = 80。不足する 120 を きょり 4 に「30g」で 200！",
        "examTip": "200 = 80 + 4×□ → □ = 30g！"
      }
    ],
    "5": [
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
          20,
          30,
          40
        ],
        "explanation": "左は 140 + 70 = 210。右は 30 + 60 = 90。残り120を きょり 4 に「30g」で 210！",
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 90 = 210。右は 20 + 40 = 60。残り150を きょり 3 に「50g」で 210！",
        "examTip": "難関校の物理分野で問われる「重心移動」の感覚が身についています！"
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
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          30,
          40
        ],
        "explanation": "左は 160 + 60 = 220。右は 2×30 = 60。残り160を きょり 4 に「40g」で 220！",
        "examTip": "220の高トルク！支点にかかる合計重量（40+30+30+40=140g）も計算できます。"
      }
    ],
    "6": [
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
            "weight": 30,
            "locked": true
          },
          {
            "pos": -1,
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 90 + 30 = 240。右は 2×40 = 80。残り160を きょり 4 に「40g」で 240！",
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 90 + 40 = 250。右は 20 + 80 = 100。残り150を きょり 3 に「50g」で 250！",
        "examTip": "左右合計5つのおもりが絡む入試最難関問題もこれで完璧です！"
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
            "pos": -1,
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
          20,
          30,
          40
        ],
        "explanation": "左は 140 + 80 + 20 = 240。右は 2×40 = 80。残り160を きょり 4 に「40g」で 240！",
        "examTip": "完璧な物理演算力！どんな中学校のてこ・天秤問題にも通用する実力です！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "targetPos": 4,
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
          15,
          20,
          25,
          30,
          40
        ],
        "explanation": "左は (4×30) + (2×30) = 180。右は (2×30) + (4×30) = 180 で釣り合います！",
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 60 = 180。右は 1×30 = 30。残り150を きょり 3 に「50g」で 180！",
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
          30,
          40
        ],
        "explanation": "左は 140 + 50 = 190。右は 1×30 = 30。残り160を きょり 4 に「40g」で 190！",
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
          10,
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 160 + 40 = 200。右は (1×20) + (3×20) = 80。不足する 120 を きょり 4 に「30g」で 200！",
        "examTip": "複数のフックにおもりが吊るされた状態からの逆算は、御三家・難関校の頻出パターンです！"
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
            "weight": 20,
            "locked": true
          },
          {
            "pos": -1,
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 60 + 20 = 200。右は 2×40 = 80。残り120を きょり 3 に「40g」で 200！",
        "examTip": "左辺3項、右辺2項の等式を瞬時に組み立てられるようにしましょう！"
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
            "weight": 30,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 10,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          30,
          40
        ],
        "explanation": "左は 150 + 60 = 210。右は 10 + 80 = 90。残り120を きょり 4 に「30g」で 210！",
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
          20,
          30,
          40,
          50,
          60
        ],
        "explanation": "左は 150 + 60 = 210。右は 30 + 60 = 90。不足する 120 を きょり 3 に「40g」で 210！",
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
          20,
          30,
          40
        ],
        "explanation": "左は 140 + 80 = 220。右は 20 + 80 = 100。残り120を きょり 4 に「30g」で 220！",
        "examTip": "最難関校対策：てこ自体の重さ（重心）を考慮する応用問題の基礎になります！"
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
            "weight": 50,
            "locked": true
          },
          {
            "pos": 1,
            "weight": 40,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 30,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 100 = 220。右は 40 + 60 = 100。残り120を きょり 3 に「40g」で 220！",
        "examTip": "重いおもりを中心近くに置くか端に置くかでモーメントが激変します！"
      }
    ],
    "4": [
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
            "weight": 10,
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
          20,
          30,
          40,
          50
        ],
        "explanation": "左は 80 + 90 + 40 = 210。右は 10 + 80 = 90。残り120を きょり 4 に「30g」で 210！",
        "examTip": "【達人級・力のモーメント】最難関校の物理分野で出題される複雑な重心・てこ問題も、この原理の応用です！"
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
            "weight": 20,
            "locked": true
          },
          {
            "pos": -1,
            "weight": 50,
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
          30,
          40,
          50
        ],
        "explanation": "左は 120 + 60 + 50 = 230。右は 30 + 80 = 110。残り120を きょり 3 に「40g」で 230！",
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
          10,
          20,
          25,
          30,
          40
        ],
        "explanation": "左は 100 + 100 = 200。右は 20 + 60 = 80。残り120を きょり 4 に「30g」で 200！",
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
            "pos": -1,
            "weight": 50,
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
          10,
          20,
          30,
          40,
          50,
          60
        ],
        "explanation": "左の力は 120 + 60 + 50 = 230。右は 30 + 80 = 110。不足120を きょり 3 に「40g」で 230 の完璧な釣り合い！",
        "examTip": "支点からの距離とおもりの重さの関係を完全にマスターしました。中学理科の物理基礎は完璧です！"
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
            "weight": 40,
            "locked": true
          },
          {
            "pos": 2,
            "weight": 40,
            "locked": true
          }
        ],
        "availableWeights": [
          20,
          30,
          35,
          40
        ],
        "explanation": "左は 140 + 60 + 60 = 260。右は 40 + 80 = 120。残り140を きょり 4 に「35g」で 260！",
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
          20,
          25,
          30
        ],
        "explanation": "左は 160 + 60 + 20 = 240。右は 20 + 120 = 140。残り100を きょり 4 に「25g」で 240！",
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
          30,
          35,
          40,
          45
        ],
        "explanation": "左は 140 + 90 + 60 = 290。右は 30 + 100 = 130。残り160を きょり 4 に「40g」で 290！",
        "examTip": "【全国模試トップ級】290の巨大モーメントを釣り合わせる計算力！"
      },
      {
        "targetPos": 3,
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
            "pos": 2,
            "weight": 50,
            "locked": true
          }
        ],
        "availableWeights": [
          30,
          40,
          50
        ],
        "explanation": "左は 140 + 90 + 40 = 270。右は 20 + 100 = 120。残り150を きょり 3 に「50g」で 270！",
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
          30,
          40,
          50
        ],
        "explanation": "左は 160 + 90 + 60 = 310。右は 30 + 80 = 110。残り200を きょり 4 に「50g」で 310！",
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

  const [weights, setWeights] = useState<WeightSlot[]>(puzzle.initialWeights);
  const [selectedWeight, setSelectedWeight] = useState<number>(puzzle.availableWeights[0]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('右側のフックにおもりを置いて天秤を釣り合わせよう！');
  const [showHint, setShowHint] = useState(false);

  const switchProblem = (idx: number) => {
    const nextPuzzle = puzzles[idx % puzzles.length];
    setProblemIndex(idx % puzzles.length);
    setWeights(nextPuzzle.initialWeights);
    setSelectedWeight(nextPuzzle.availableWeights[0]);
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
              return (
                <button
                  key={pos}
                  onClick={() => handleSlotClick(pos)}
                  className={`relative group flex flex-col items-center justify-center transition-all ${
                    currentSlotWeight?.locked ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{
                    position: 'absolute',
                    left: `${50 + pos * 11.5}%`,
                    transform: 'translateX(-50%)'
                  }}
                  title={`距離 ${Math.abs(pos)}`}
                >
                  {/* Hook pin */}
                  <div className="w-2.5 h-2.5 bg-yellow-100 rounded-full border border-amber-900"></div>
                  <span className="text-[10px] font-black text-amber-100 -mt-1 drop-shadow">
                    {Math.abs(pos)}
                  </span>

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
            {puzzle.availableWeights.map((w) => (
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
