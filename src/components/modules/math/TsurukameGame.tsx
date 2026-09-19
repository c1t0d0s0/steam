import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Lightbulb, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface TsurukameGameProps {
  level: number;
  grade?: number;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onNextLevel?: () => void;
  customPuzzles?: TsurukameProblem[];
  customTitle?: string;
  customBadge?: string;
}
interface TsurukameProblem {
  totalHeads: number;
  totalLegs: number;
  correctCranes: number;
  correctTurtles: number;
  explanation: string;
  examTip: string;
  themeName?: string;
  itemA?: { name: string; emoji: string; unit: string; value: number };
  itemB?: { name: string; emoji: string; unit: string; value: number };
  totalLabel?: string;
  valueLabel?: string;
  valueUnit?: string;
}

interface CheckedResult {
  cranes: number;
  turtles: number;
  legs: number;
  isCorrect: boolean;
}

const GRADE_TSURUKAME_PROBLEMS: Record<number, Record<number, TsurukameProblem[]>> = {
  "3": {
    "1": [
      {
        "totalHeads": 5,
        "totalLegs": 14,
        "correctCranes": 3,
        "correctTurtles": 2,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "もし全員ツル（足2本）なら 5匹 × 2本 = 10本。足りない足は 14 - 10 = 4本。ツルをカメに変えると足が2本ずつ増えるので、4本 ÷ 2 = 2匹がカメ！ツルは 5 - 2 = 3羽です。",
        "examTip": "つるかめ算の鉄則：【もしも全員ツルだったら】と仮定し、足りない足を「カメとツルの足の差(2本)」で割るとカメの数が出ます！"
      },
      {
        "totalHeads": 6,
        "totalLegs": 16,
        "correctCranes": 4,
        "correctTurtles": 2,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 6 × 2 = 12本。足りない足は 16 - 12 = 4本。4 ÷ 2 = 2匹がカメ！ツルは 6 - 2 = 4羽です。",
        "examTip": "まずは「全員ツル」と仮定して計算する手順を体に染み込ませましょう！"
      },
      {
        "totalHeads": 6,
        "totalLegs": 18,
        "correctCranes": 3,
        "correctTurtles": 3,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 6 × 2 = 12本。不足は 18 - 12 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 6 - 3 = 3羽です。",
        "examTip": "ツルとカメが同数のときは、1組（2本+4本=6本）のグループで考える解法もあります！"
      }
    ],
    "2": [
      {
        "totalHeads": 7,
        "totalLegs": 20,
        "correctCranes": 4,
        "correctTurtles": 3,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 7 × 2 = 14本。不足は 20 - 14 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 7 - 3 = 4羽です。",
        "examTip": "面積図を描くときは、たてを「足の本数」、横を「匹数」にして欠けた長方形の面積に注目します！"
      },
      {
        "totalHeads": 8,
        "totalLegs": 22,
        "correctCranes": 5,
        "correctTurtles": 3,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 8 × 2 = 16本。不足は 22 - 16 = 6本。6 ÷ 2 = 3匹がカメ！ツルは 8 - 3 = 5羽です。",
        "examTip": "検算の習慣をつけよう！「5羽 × 2本 + 3匹 × 4本 = 10 + 12 = 22本」でバッチリ！"
      },
      {
        "totalHeads": 8,
        "totalLegs": 26,
        "correctCranes": 3,
        "correctTurtles": 5,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 8 × 2 = 16本。不足は 26 - 16 = 10本。10 ÷ 2 = 5匹がカメ！ツルは 8 - 5 = 3羽です。",
        "examTip": "「全員カメだったら」と仮定しても解けます。その場合は余った足を引いてツルの数を求めます！"
      }
    ],
    "3": [
      {
        "totalHeads": 9,
        "totalLegs": 26,
        "correctCranes": 5,
        "correctTurtles": 4,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 9 × 2 = 18本。不足は 26 - 18 = 8本。8 ÷ 2 = 4匹がカメ！ツルは 5羽です。",
        "examTip": "9匹に増えても基本ルールは同じです！"
      },
      {
        "totalHeads": 9,
        "totalLegs": 28,
        "correctCranes": 4,
        "correctTurtles": 5,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 9 × 2 = 18本。不足は 28 - 18 = 10本。10 ÷ 2 = 5匹がカメ！ツルは 4羽です。",
        "examTip": "足の差2本で割る感覚をマスターしましょう！"
      },
      {
        "totalHeads": 10,
        "totalLegs": 28,
        "correctCranes": 6,
        "correctTurtles": 4,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 10 × 2 = 20本。不足は 28 - 20 = 8本。8 ÷ 2 = 4匹がカメ！ツルは 6羽です。",
        "examTip": "10匹の大台でも素早く計算できるようになります！"
      }
    ],
    "4": [
      {
        "totalHeads": 8,
        "totalLegs": 22,
        "correctCranes": 5,
        "correctTurtles": 3,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車（2輪）なら 8台 × 2輪 = 16輪。不足は 22 - 16 = 6輪。自転車を自動車に変えると2輪増えるので、6 ÷ 2 = 3台が自動車！自転車は 8 - 3 = 5台です。",
        "examTip": "【身近なつるかめ算】乗り物の車輪の数も、ツルとカメと全く同じ考え方で解けます！"
      },
      {
        "totalHeads": 8,
        "totalLegs": 24,
        "correctCranes": 4,
        "correctTurtles": 4,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 8 × 2 = 16輪。不足は 24 - 16 = 8輪。8 ÷ 2 = 4台が自動車！自転車は 4台です。",
        "examTip": "同数のパターン！1組(2+4=6輪)で 24 ÷ 6 = 4組と解くこともできます。"
      },
      {
        "totalHeads": 9,
        "totalLegs": 26,
        "correctCranes": 5,
        "correctTurtles": 4,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 9 × 2 = 18輪。不足は 26 - 18 = 8輪。8 ÷ 2 = 4台が自動車！自転車は 5台です。",
        "examTip": "車輪算の応用もバッチリ解けるようになりました！"
      }
    ],
    "5": [
      {
        "totalHeads": 10,
        "totalLegs": 32,
        "correctCranes": 4,
        "correctTurtles": 6,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 10 × 2 = 20本。不足は 32 - 20 = 12本。12 ÷ 2 = 6匹がカメ！ツルは 4羽です。",
        "examTip": "カメの数の方が多いときも、同じ手順で迷わず解けます！"
      },
      {
        "totalHeads": 11,
        "totalLegs": 32,
        "correctCranes": 6,
        "correctTurtles": 5,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 11 × 2 = 22本。不足は 32 - 22 = 10本。10 ÷ 2 = 5匹がカメ！ツルは 6羽です。",
        "examTip": "11匹の計算もスラスラ解ける計算力がつきました！"
      },
      {
        "totalHeads": 12,
        "totalLegs": 34,
        "correctCranes": 7,
        "correctTurtles": 5,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 12 × 2 = 24本。不足は 34 - 24 = 10本。10 ÷ 2 = 5匹がカメ！ツルは 7羽です。",
        "examTip": "小学3年生のつるかめ算マスター達成！"
      }
    ],
    "6": [
      {
        "totalHeads": 12,
        "totalLegs": 38,
        "correctCranes": 5,
        "correctTurtles": 7,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 12 × 2 = 24本。不足は 38 - 24 = 14本。14 ÷ 2 = 7匹がカメ！ツルは 5羽です。",
        "examTip": "【小3達人級】足の合計38本をクリア！中学受験の基礎が完成しました！"
      },
      {
        "totalHeads": 10,
        "totalLegs": 32,
        "correctCranes": 4,
        "correctTurtles": 6,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 10 × 2 = 20輪。不足は 32 - 20 = 12輪。12 ÷ 2 = 6台が自動車！自転車は 4台です。",
        "examTip": "乗り物でも動物でも、差に注目する数学的思考力は万能です！"
      },
      {
        "totalHeads": 14,
        "totalLegs": 40,
        "correctCranes": 8,
        "correctTurtles": 6,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 14 × 2 = 28本。不足は 40 - 28 = 12本。12 ÷ 2 = 6匹がカメ！ツルは 8羽です。",
        "examTip": "14匹のつるかめ算も暗算感覚で見事クリア！自信を持って小4に進もう！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "totalHeads": 12,
        "totalLegs": 36,
        "correctCranes": 6,
        "correctTurtles": 6,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 12 × 2 = 24本。不足は 36 - 24 = 12本。12 ÷ 2 = 6匹がカメ！ツルは 6羽です。",
        "examTip": "【小4標準】同数パターン（ツル6羽・カメ6匹）。1組6本で 36 ÷ 6 = 6組 と解く技も使えます！"
      },
      {
        "totalHeads": 14,
        "totalLegs": 42,
        "correctCranes": 7,
        "correctTurtles": 7,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 14 × 2 = 28本。不足は 42 - 28 = 14本。14 ÷ 2 = 7匹がカメ！ツルは 7羽です。",
        "examTip": "面積図を頭に描きながら、不足分を2で割る操作を意識しましょう。"
      },
      {
        "totalHeads": 15,
        "totalLegs": 44,
        "correctCranes": 8,
        "correctTurtles": 7,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 15 × 2 = 30本。不足は 44 - 30 = 14本。14 ÷ 2 = 7匹がカメ！ツルは 8羽です。",
        "examTip": "奇数の頭数でも落ち着いて計算すれば間違いなし！"
      }
    ],
    "2": [
      {
        "totalHeads": 12,
        "totalLegs": 34,
        "correctCranes": 7,
        "correctTurtles": 5,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 12 × 2 = 24輪。不足は 34 - 24 = 10輪。10 ÷ 2 = 5台が自動車！自転車は 7台です。",
        "examTip": "車輪算の標準問題。文章題でも「もし全員が〜」と仮定して解きます！"
      },
      {
        "totalHeads": 14,
        "totalLegs": 40,
        "correctCranes": 8,
        "correctTurtles": 6,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 14 × 2 = 28輪。不足は 40 - 28 = 12輪。12 ÷ 2 = 6台が自動車！自転車は 8台です。",
        "examTip": "台数が14台に増えても、車輪の差（4-2=2輪）で割る公式は不変です！"
      },
      {
        "totalHeads": 15,
        "totalLegs": 46,
        "correctCranes": 7,
        "correctTurtles": 8,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 15 × 2 = 30輪。不足は 46 - 30 = 16輪。16 ÷ 2 = 8台が自動車！自転車は 7台です。",
        "examTip": "車輪算の応用パターンも素早く解けるようになりました！"
      }
    ],
    "3": [
      {
        "totalHeads": 16,
        "totalLegs": 46,
        "correctCranes": 9,
        "correctTurtles": 7,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 16 × 2 = 32本。不足は 46 - 32 = 14本。14 ÷ 2 = 7匹がカメ！ツルは 9羽です。",
        "examTip": "【中学受験頻出】頭数16匹の標準入試問題。計算ミスを防ぐメモを取りましょう！"
      },
      {
        "totalHeads": 16,
        "totalLegs": 50,
        "correctCranes": 7,
        "correctTurtles": 9,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 16 × 2 = 32本。不足は 50 - 32 = 18本。18 ÷ 2 = 9匹がカメ！ツルは 7羽です。",
        "examTip": "カメの割合が多い場合も、不足分が大きくなるだけで計算方法は全く同じです。"
      },
      {
        "totalHeads": 18,
        "totalLegs": 52,
        "correctCranes": 10,
        "correctTurtles": 8,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 18 × 2 = 36本。不足は 52 - 36 = 16本。16 ÷ 2 = 8匹がカメ！ツルは 10羽です。",
        "examTip": "18匹のつるかめ算を難なくクリア！"
      }
    ],
    "4": [
      {
        "totalHeads": 16,
        "totalLegs": 48,
        "correctCranes": 8,
        "correctTurtles": 8,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 16 × 2 = 32輪。不足は 48 - 32 = 16輪。16 ÷ 2 = 8台が自動車！自転車は 8台です。",
        "examTip": "自動車と自転車が同数（各8台）の美しい解です！"
      },
      {
        "totalHeads": 18,
        "totalLegs": 54,
        "correctCranes": 9,
        "correctTurtles": 9,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 18 × 2 = 36輪。不足は 54 - 36 = 18輪。18 ÷ 2 = 9台が自動車！自転車は 9台です。",
        "examTip": "18台の駐車場問題。面積図の長方形分割が頭に浮かべば即解けます！"
      },
      {
        "totalHeads": 20,
        "totalLegs": 58,
        "correctCranes": 11,
        "correctTurtles": 9,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 20 × 2 = 40本。不足は 58 - 40 = 18本。18 ÷ 2 = 9匹がカメ！ツルは 11羽です。",
        "examTip": "頭数20匹のつるかめ算！"
      }
    ],
    "5": [
      {
        "totalHeads": 20,
        "totalLegs": 62,
        "correctCranes": 9,
        "correctTurtles": 11,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 20 × 2 = 40本。不足は 62 - 40 = 22本。22 ÷ 2 = 11匹がカメ！ツルは 9羽です。",
        "examTip": "【小4応用】(62 - 20×2) ÷ 2 = 11匹！暗算のスピードが上がっています！"
      },
      {
        "totalHeads": 20,
        "totalLegs": 64,
        "correctCranes": 8,
        "correctTurtles": 12,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 20 × 2 = 40輪。不足は 64 - 40 = 24輪。24 ÷ 2 = 12台が自動車！自転車は 8台です。",
        "examTip": "乗り物20台、車輪64輪の大型計算も完璧です！"
      },
      {
        "totalHeads": 22,
        "totalLegs": 64,
        "correctCranes": 12,
        "correctTurtles": 10,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 22 × 2 = 44本。不足は 64 - 44 = 20本。20 ÷ 2 = 10匹がカメ！ツルは 12羽です。",
        "examTip": "22匹のつるかめ算もスマートに解けました！"
      }
    ],
    "6": [
      {
        "totalHeads": 22,
        "totalLegs": 68,
        "correctCranes": 10,
        "correctTurtles": 12,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 22 × 2 = 44本。不足は 68 - 44 = 24本。24 ÷ 2 = 12匹がカメ！ツルは 10羽です。",
        "examTip": "【小4マスター級】頭数22匹、足68本！難関中入試の標準問題を完全制覇！"
      },
      {
        "totalHeads": 24,
        "totalLegs": 70,
        "correctCranes": 13,
        "correctTurtles": 11,
        "themeName": "乗り物の車輪算",
        "itemA": {
          "name": "自転車",
          "emoji": "🚲",
          "unit": "台",
          "value": 2
        },
        "itemB": {
          "name": "自動車",
          "emoji": "🚗",
          "unit": "台",
          "value": 4
        },
        "totalLabel": "乗り物の台数（合計）",
        "valueLabel": "めざすタイヤ・車輪の合計",
        "valueUnit": "輪",
        "explanation": "全員自転車なら 24 × 2 = 48輪。不足は 70 - 48 = 22輪。22 ÷ 2 = 11台が自動車！自転車は 13台です。",
        "examTip": "24台の車輪算！小学4年生とは思えない高い計算力です！"
      },
      {
        "totalHeads": 24,
        "totalLegs": 74,
        "correctCranes": 11,
        "correctTurtles": 13,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 24 × 2 = 48本。不足は 74 - 48 = 26本。26 ÷ 2 = 13匹がカメ！ツルは 11羽です。",
        "examTip": "面積図をフリーハンドでサッと描いて解く実力が身につきました！"
      }
    ]
  },
  "5": {
    "1": [
      {
        "totalHeads": 10,
        "totalLegs": 620,
        "correctCranes": 6,
        "correctTurtles": 4,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "もし全部が50円切手なら 10枚 × 50円 = 500円。足りない金額は 620 - 500 = 120円。50円切手を80円切手に変えると「1枚あたり 80 - 50 = 30円」増えるので、120円 ÷ 30円 = 4枚が80円切手！50円切手は 10 - 4 = 6枚です。",
        "examTip": "【金額つるかめ算の要点】「安い方の金額」で仮定し、差額を「1枚あたりの差（30円）」で割ることで高い方の枚数が求まります！"
      },
      {
        "totalHeads": 12,
        "totalLegs": 750,
        "correctCranes": 7,
        "correctTurtles": 5,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 12 × 50 = 600円。不足は 750 - 600 = 150円。150 ÷ 30 = 5枚が80円切手！50円切手は 7枚です。",
        "examTip": "入試定番の切手問題。30円の差額に注目しましょう！"
      },
      {
        "totalHeads": 25,
        "totalLegs": 70,
        "correctCranes": 15,
        "correctTurtles": 10,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 25 × 2 = 50本。不足は 70 - 50 = 20本。20 ÷ 2 = 10匹がカメ！ツルは 15羽です。",
        "examTip": "25匹の大規模つるかめ算！速さと正確性を両立させましょう。"
      }
    ],
    "2": [
      {
        "totalHeads": 15,
        "totalLegs": 930,
        "correctCranes": 9,
        "correctTurtles": 6,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 15 × 50 = 750円。不足は 930 - 750 = 180円。180 ÷ 30 = 6枚が80円切手！50円切手は 9枚です。",
        "examTip": "合計金額が1000円近くになっても、30円で割る手順は全く同じです！"
      },
      {
        "totalHeads": 26,
        "totalLegs": 76,
        "correctCranes": 14,
        "correctTurtles": 12,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 26 × 2 = 52本。不足は 76 - 52 = 24本。24 ÷ 2 = 12匹がカメ！ツルは 14羽です。",
        "examTip": "26匹のつるかめ算！面積図の横幅が広くなっても正確に立式できます。"
      },
      {
        "totalHeads": 16,
        "totalLegs": 1010,
        "correctCranes": 9,
        "correctTurtles": 7,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 16 × 50 = 800円。不足は 1010 - 800 = 210円。210 ÷ 30 = 7枚が80円切手！50円切手は 9枚です。",
        "examTip": "1000円を超える計算でも、引き算と割り算を落ち着いて処理しましょう！"
      }
    ],
    "3": [
      {
        "totalHeads": 28,
        "totalLegs": 82,
        "correctCranes": 15,
        "correctTurtles": 13,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 28 × 2 = 56本。不足は 82 - 56 = 26本。26 ÷ 2 = 13匹がカメ！ツルは 15羽です。",
        "examTip": "【難関校レベル】頭数28匹、足82本！"
      },
      {
        "totalHeads": 18,
        "totalLegs": 1140,
        "correctCranes": 10,
        "correctTurtles": 8,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 18 × 50 = 900円。不足は 1140 - 900 = 240円。240 ÷ 30 = 8枚が80円切手！50円切手は 10枚です。",
        "examTip": "切手18枚の金額計算もクリア！"
      },
      {
        "totalHeads": 28,
        "totalLegs": 86,
        "correctCranes": 13,
        "correctTurtles": 15,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 28 × 2 = 56本。不足は 86 - 56 = 30本。30 ÷ 2 = 15匹がカメ！ツルは 13羽です。",
        "examTip": "難関中学の算数でも頻出の数値設定です！"
      }
    ],
    "4": [
      {
        "totalHeads": 20,
        "totalLegs": 1270,
        "correctCranes": 11,
        "correctTurtles": 9,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 20 × 50 = 1000円。不足は 1270 - 1000 = 270円。270 ÷ 30 = 9枚が80円切手！50円切手は 11枚です。",
        "examTip": "20枚の切手算！1枚あたりの差額で割る本質が理解できています。"
      },
      {
        "totalHeads": 30,
        "totalLegs": 86,
        "correctCranes": 17,
        "correctTurtles": 13,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 30 × 2 = 60本。不足は 86 - 60 = 26本。26 ÷ 2 = 13匹がカメ！ツルは 17羽です。",
        "examTip": "30匹のビッグスケールつるかめ算！"
      },
      {
        "totalHeads": 20,
        "totalLegs": 1330,
        "correctCranes": 9,
        "correctTurtles": 11,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 20 × 50 = 1000円。不足は 1330 - 1000 = 330円。330 ÷ 30 = 11枚が80円切手！50円切手は 9枚です。",
        "examTip": "切手算の応用もスラスラ解けます！"
      }
    ],
    "5": [
      {
        "totalHeads": 30,
        "totalLegs": 92,
        "correctCranes": 14,
        "correctTurtles": 16,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 30 × 2 = 60本。不足は 92 - 60 = 32本。32 ÷ 2 = 16匹がカメ！ツルは 14羽です。",
        "examTip": "30匹、足92本！大きな数でも計算の軸がブレません！"
      },
      {
        "totalHeads": 22,
        "totalLegs": 1400,
        "correctCranes": 12,
        "correctTurtles": 10,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 22 × 50 = 1100円。不足は 1400 - 1100 = 300円。300 ÷ 30 = 10枚が80円切手！50円切手は 12枚です。",
        "examTip": "差集め算や弁償算への架け橋となる重要問題です！"
      },
      {
        "totalHeads": 32,
        "totalLegs": 94,
        "correctCranes": 17,
        "correctTurtles": 15,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 32 × 2 = 64本。不足は 94 - 64 = 30本。30 ÷ 2 = 15匹がカメ！ツルは 17羽です。",
        "examTip": "32匹の大型問題も見事に突破！"
      }
    ],
    "6": [
      {
        "totalHeads": 32,
        "totalLegs": 98,
        "correctCranes": 15,
        "correctTurtles": 17,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 32 × 2 = 64本。不足は 98 - 64 = 34本。34 ÷ 2 = 17匹がカメ！ツルは 15羽です。",
        "examTip": "【小5最高峰】32匹、足98本！ほぼ100本近い足を瞬時に仕分けました！"
      },
      {
        "totalHeads": 24,
        "totalLegs": 1560,
        "correctCranes": 12,
        "correctTurtles": 12,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 24 × 50 = 1200円。不足は 1560 - 1200 = 360円。360 ÷ 30 = 12枚が80円切手！50円切手は 12枚です。",
        "examTip": "各12枚の同数切手問題！1組130円で 1560 ÷ 130 = 12組 と解くこともできます。"
      },
      {
        "totalHeads": 34,
        "totalLegs": 104,
        "correctCranes": 16,
        "correctTurtles": 18,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 34 × 2 = 68本。不足は 104 - 68 = 36本。36 ÷ 2 = 18匹がカメ！ツルは 16羽です。",
        "examTip": "足の合計が100本を超える超難問を完全制覇！小6受験算数への準備は完璧です！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "totalHeads": 10,
        "totalLegs": 68,
        "correctCranes": 6,
        "correctTurtles": 4,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "もし全員カブトムシ（足6本）なら 10匹 × 6本 = 60本。足りない足は 68 - 60 = 8本。カブトムシをクモに変えると足が「8 - 6 = 2本」増えるので、8本 ÷ 2本 = 4匹がクモ！カブトムシは 10 - 4 = 6匹です。",
        "examTip": "【中学入試の超頻出！昆虫算】足が6本の昆虫と8本のクモ！差が2本であることに着目して、基本のつるかめ算と全く同じ手順で解きます！"
      },
      {
        "totalHeads": 12,
        "totalLegs": 82,
        "correctCranes": 7,
        "correctTurtles": 5,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 12 × 6 = 72本。不足は 82 - 72 = 10本。10 ÷ 2 = 5匹がクモ！カブトムシは 7匹です。",
        "examTip": "足の基本本数が6本になっても、差の2本で割る論理は同じです！"
      },
      {
        "totalHeads": 20,
        "totalLegs": 1270,
        "correctCranes": 11,
        "correctTurtles": 9,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 20 × 50 = 1000円。不足は 1270 - 1000 = 270円。270 ÷ 30 = 9枚が80円切手！50円切手は 11枚です。",
        "examTip": "御三家・難関校頻出の切手算を瞬時に暗算！"
      }
    ],
    "2": [
      {
        "totalHeads": 14,
        "totalLegs": 96,
        "correctCranes": 8,
        "correctTurtles": 6,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 14 × 6 = 84本。不足は 96 - 84 = 12本。12 ÷ 2 = 6匹がクモ！カブトムシは 8匹です。",
        "examTip": "頭数14匹、足96本！理科の昆虫知識と算数の融合問題です。"
      },
      {
        "totalHeads": 25,
        "totalLegs": 1580,
        "correctCranes": 14,
        "correctTurtles": 11,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 25 × 50 = 1250円。不足は 1580 - 1250 = 330円。330 ÷ 30 = 11枚が80円切手！50円切手は 14枚です。",
        "examTip": "25枚の切手算！差額330円を30円で割って一瞬で導出！"
      },
      {
        "totalHeads": 35,
        "totalLegs": 102,
        "correctCranes": 19,
        "correctTurtles": 16,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 35 × 2 = 70本。不足は 102 - 70 = 32本。32 ÷ 2 = 16匹がカメ！ツルは 19羽です。",
        "examTip": "頭数35匹の超弩級つるかめ算！"
      }
    ],
    "3": [
      {
        "totalHeads": 16,
        "totalLegs": 110,
        "correctCranes": 9,
        "correctTurtles": 7,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 16 × 6 = 96本。不足は 110 - 96 = 14本。14 ÷ 2 = 7匹がクモ！カブトムシは 9匹です。",
        "examTip": "足の合計が100本を超える昆虫算！面積図を正確に活用しましょう。"
      },
      {
        "totalHeads": 28,
        "totalLegs": 1790,
        "correctCranes": 15,
        "correctTurtles": 13,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 28 × 50 = 1400円。不足は 1790 - 1400 = 390円。390 ÷ 30 = 13枚が80円切手！50円切手は 15枚です。",
        "examTip": "切手28枚、1790円！難関校入試本番レベルの計算量です。"
      },
      {
        "totalHeads": 16,
        "totalLegs": 114,
        "correctCranes": 7,
        "correctTurtles": 9,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 16 × 6 = 96本。不足は 114 - 96 = 18本。18 ÷ 2 = 9匹がクモ！カブトムシは 7匹です。",
        "examTip": "クモの比率が高いパターンも見事に仕留めました！"
      }
    ],
    "4": [
      {
        "totalHeads": 18,
        "totalLegs": 124,
        "correctCranes": 10,
        "correctTurtles": 8,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 18 × 6 = 108本。不足は 124 - 108 = 16本。16 ÷ 2 = 8匹がクモ！カブトムシは 10匹です。",
        "examTip": "【最難関中の昆虫算】(124 - 18×6) ÷ 2 = 8匹！スピード暗算が光ります。"
      },
      {
        "totalHeads": 30,
        "totalLegs": 1920,
        "correctCranes": 16,
        "correctTurtles": 14,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 30 × 50 = 1500円。不足は 1920 - 1500 = 420円。420 ÷ 30 = 14枚が80円切手！50円切手は 16枚です。",
        "examTip": "切手30枚！大きな桁数でもミスなく差額を捉える力が備わっています。"
      },
      {
        "totalHeads": 40,
        "totalLegs": 116,
        "correctCranes": 22,
        "correctTurtles": 18,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 40 × 2 = 80本。不足は 116 - 80 = 36本。36 ÷ 2 = 18匹がカメ！ツルは 22羽です。",
        "examTip": "頭数40匹！どんな数字が来ても解ける絶対の自信を持ちましょう！"
      }
    ],
    "5": [
      {
        "totalHeads": 20,
        "totalLegs": 138,
        "correctCranes": 11,
        "correctTurtles": 9,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 20 × 6 = 120本。不足は 138 - 120 = 18本。18 ÷ 2 = 9匹がクモ！カブトムシは 11匹です。",
        "examTip": "虫20匹、足138本！中学受験生の上位1%に達する思考力です！"
      },
      {
        "totalHeads": 32,
        "totalLegs": 2050,
        "correctCranes": 17,
        "correctTurtles": 15,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 32 × 50 = 1600円。不足は 2050 - 1600 = 450円。450 ÷ 30 = 15枚が80円切手！50円切手は 17枚です。",
        "examTip": "2000円オーバーの切手算！方程式を使わずに解く算数の真髄です。"
      },
      {
        "totalHeads": 20,
        "totalLegs": 142,
        "correctCranes": 9,
        "correctTurtles": 11,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 20 × 6 = 120本。不足は 142 - 120 = 22本。22 ÷ 2 = 11匹がクモ！カブトムシは 9匹です。",
        "examTip": "複雑な設定でも「仮定して差を埋める」普遍的アプローチを体現！"
      }
    ],
    "6": [
      {
        "totalHeads": 22,
        "totalLegs": 154,
        "correctCranes": 11,
        "correctTurtles": 11,
        "themeName": "昆虫つるかめ算（カブトムシとクモ）",
        "itemA": {
          "name": "カブトムシ",
          "emoji": "🪲",
          "unit": "匹",
          "value": 6
        },
        "itemB": {
          "name": "クモ",
          "emoji": "🕷️",
          "unit": "匹",
          "value": 8
        },
        "totalLabel": "虫の匹数（合計）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員カブトムシなら 22 × 6 = 132本。不足は 154 - 132 = 22本。22 ÷ 2 = 11匹がクモ！カブトムシは 11匹です。",
        "examTip": "【同数グループ法】カブトムシ1匹とクモ1匹のペア（6+8=14本）で考えると、154 ÷ 14 = 11組！各11匹と即座に求まります！"
      },
      {
        "totalHeads": 35,
        "totalLegs": 2230,
        "correctCranes": 19,
        "correctTurtles": 16,
        "themeName": "切手算（金額つるかめ算）",
        "itemA": {
          "name": "50円切手",
          "emoji": "💌",
          "unit": "枚",
          "value": 50
        },
        "itemB": {
          "name": "80円切手",
          "emoji": "📮",
          "unit": "枚",
          "value": 80
        },
        "totalLabel": "切手の合計枚数",
        "valueLabel": "めざす合計金額",
        "valueUnit": "円",
        "explanation": "全部50円なら 35 × 50 = 1750円。不足は 2230 - 1750 = 480円。480 ÷ 30 = 16枚が80円切手！50円切手は 19枚です。",
        "examTip": "35枚・2230円の最難関入試問題を完全制覇！"
      },
      {
        "totalHeads": 45,
        "totalLegs": 132,
        "correctCranes": 24,
        "correctTurtles": 21,
        "themeName": "ツルとカメ",
        "itemA": {
          "name": "ツル",
          "emoji": "🦩",
          "unit": "羽",
          "value": 2
        },
        "itemB": {
          "name": "カメ",
          "emoji": "🐢",
          "unit": "匹",
          "value": 4
        },
        "totalLabel": "あたまの数（合計匹数）",
        "valueLabel": "めざす足の合計",
        "valueUnit": "本",
        "explanation": "全員ツルなら 45 × 2 = 90本。不足は 132 - 90 = 42本。42 ÷ 2 = 21匹がカメ！ツルは 24羽です。",
        "examTip": "【つるかめ算の伝説的マスター】45匹、足132本を制覇！中学入試の算数特殊算で敵なしです！"
      }
    ]
  }
};

export const TsurukameGame: React.FC<TsurukameGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelProblems = (lvl: number, gNum: number = 3): TsurukameProblem[] => {
    const gradeData = GRADE_TSURUKAME_PROBLEMS[gNum] || GRADE_TSURUKAME_PROBLEMS[3];
    return gradeData[lvl] || gradeData[1];
  };

  const problems = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelProblems(level, grade);
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = problems[problemIndex % problems.length];

  const itemA = problem.itemA || { name: 'ツル', emoji: '🦩', unit: '羽', value: 2 };
  const itemB = problem.itemB || { name: 'カメ', emoji: '🐢', unit: '匹', value: 4 };
  const totalLabel = problem.totalLabel || 'あたまの数（合計匹数）';
  const valueLabel = problem.valueLabel || 'めざす足の合計';
  const valueUnit = problem.valueUnit || '本';

  const getInitialFeedback = (p: TsurukameProblem) => {
    const iA = p.itemA || { name: 'ツル', emoji: '🦩', unit: '羽', value: 2 };
    const iB = p.itemB || { name: 'カメ', emoji: '🐢', unit: '匹', value: 4 };
    const vu = p.valueUnit || '本';
    return `${iA.name}（${iA.value}${vu}）と${iB.name}（${iB.value}${vu}）が合わせて ${p.totalHeads}${iB.unit || '匹'}、${p.valueLabel || '足の合計'}が ${p.totalLegs} ${vu}になる組み合わせを考えよう！`;
  };

  // User hypothesis: number of item B (0 to totalHeads)
  const [turtleCount, setTurtleCount] = useState<number>(0);
  const craneCount = problem.totalHeads - turtleCount;

  // Calculation result is masked until checked
  const [lastCheckedResult, setLastCheckedResult] = useState<CheckedResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(getInitialFeedback(problem));

  const updateTurtleCount = (newTurtles: number) => {
    sound.playClick();
    const clamped = Math.max(0, Math.min(problem.totalHeads, newTurtles));
    setTurtleCount(clamped);
    setLastCheckedResult(null); // Clear checked state when adjusting
  };

  const switchProblem = (idx: number) => {
    const nextIdx = idx % problems.length;
    const nextP = problems[nextIdx];
    setProblemIndex(nextIdx);
    setTurtleCount(0);
    setLastCheckedResult(null);
    setShowHint(false);
    setIsCompleted(false);
    setFeedback(getInitialFeedback(nextP));
  };

  const handleCheck = () => {
    const calcLegs = craneCount * itemA.value + turtleCount * itemB.value;
    const isCorrect = turtleCount === problem.correctTurtles;
    setLastCheckedResult({
      cranes: craneCount,
      turtles: turtleCount,
      legs: calcLegs,
      isCorrect
    });

    if (isCorrect) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback(
        `🎉 大正解！${itemA.name} ${craneCount}${itemA.unit}（${craneCount * itemA.value}${valueUnit}）＋ ${itemB.name} ${turtleCount}${itemB.unit}（${turtleCount * itemB.value}${valueUnit}）で${valueLabel}がピッタリ ${problem.totalLegs}${valueUnit} になりました！`
      );
      onComplete(3);
    } else {
      sound.playWrong();
      if (calcLegs < problem.totalLegs) {
        setFeedback(
          `計算結果は ${calcLegs}${valueUnit} でした！目標（${problem.totalLegs}${valueUnit}）まであと ${problem.totalLegs - calcLegs}${valueUnit} 足りないよ。${itemB.name}を増やしてみよう！`
        );
      } else {
        setFeedback(
          `計算結果は ${calcLegs}${valueUnit} でした！目標（${problem.totalLegs}${valueUnit}）より ${calcLegs - problem.totalLegs}${valueUnit} 多いよ。${itemA.name}を増やしてみよう！`
        );
      }
    }
  };

  const diffPerItem = itemB.value - itemA.value;
  const allCraneLegs = problem.totalHeads * itemA.value;
  const shortage = problem.totalLegs - allCraneLegs;

  return (
    <GameModalWrapper
      title={customTitle || "つるかめ算ビジュアルアリーナ"}
      badgeTag={customBadge || `マス・アイランド 小${grade}・Lv.${level}`}
      level={level}
      isCompleted={isCompleted}
      explanation={problem.explanation}
      examTip={problem.examTip}
      onBack={onBack}
      onNextLevel={onNextLevel}
      problemIndex={problemIndex}
      totalProblems={problems.length}
      onSwitchProblem={switchProblem}
      onNextProblem={() => switchProblem(problemIndex + 1)}
      onRetry={() => {
        setTurtleCount(0);
        setLastCheckedResult(null);
        setShowHint(false);
        setIsCompleted(false);
        setFeedback(getInitialFeedback(problem));
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Status prompt */}
        <div className="w-full text-center py-2 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-3 font-extrabold text-emerald-900 text-sm sm:text-base">
          {feedback}
        </div>

        {/* Goal Banner */}
        <div className="flex justify-center items-center gap-4 mb-4 bg-amber-50 border-2 border-amber-200 px-6 py-2.5 rounded-2xl">
          <div className="text-center">
            <span className="text-xs font-bold text-amber-700 block">{totalLabel}</span>
            <span className="text-2xl font-black text-amber-900">{problem.totalHeads} {itemB.unit}</span>
          </div>
          <div className="text-xl font-bold text-slate-300">|</div>
          <div className="text-center">
            <span className="text-xs font-bold text-amber-700 block">{valueLabel}</span>
            <span className="text-2xl font-black text-rose-600">{problem.totalLegs} {valueUnit}</span>
          </div>
        </div>

        {/* Animal Visualizer Box */}
        <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-4 mb-4 shadow-inner">
          {/* Visual Animals Gallery */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 min-h-[60px]">
            {/* Item A */}
            {Array.from({ length: craneCount }).map((_, i) => (
              <div
                key={`itemA-${i}`}
                className="flex flex-col items-center bg-sky-100 border border-sky-300 rounded-2xl px-2 py-1 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl">{itemA.emoji}</span>
                <span className="text-[10px] font-black text-sky-800">{itemA.name} ({itemA.value}{valueUnit})</span>
              </div>
            ))}
            {/* Item B */}
            {Array.from({ length: turtleCount }).map((_, i) => (
              <div
                key={`itemB-${i}`}
                className="flex flex-col items-center bg-emerald-100 border border-emerald-300 rounded-2xl px-2 py-1 shadow-sm"
              >
                <span className="text-2xl sm:text-3xl">{itemB.emoji}</span>
                <span className="text-[10px] font-black text-emerald-800">{itemB.name} ({itemB.value}{valueUnit})</span>
              </div>
            ))}
          </div>

          {/* Leg Calculation Result: MASKED while adjusting; revealed only after checking */}
          {lastCheckedResult !== null ? (
            <div
              className={`rounded-2xl p-3 border ${
                lastCheckedResult.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              } flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs sm:text-sm font-bold shadow-sm`}
            >
              <div>
                {itemA.name}: <span className="text-sky-600 font-black text-base">{lastCheckedResult.cranes}{itemA.unit}</span> × {itemA.value}{valueUnit} ={' '}
                <span className="font-black">{lastCheckedResult.cranes * itemA.value}{valueUnit}</span>
              </div>
              <div className="text-slate-400">+</div>
              <div>
                {itemB.name}: <span className="text-emerald-600 font-black text-base">{lastCheckedResult.turtles}{itemB.unit}</span> × {itemB.value}{valueUnit} ={' '}
                <span className="font-black">{lastCheckedResult.turtles * itemB.value}{valueUnit}</span>
              </div>
              <div className="text-slate-400">=</div>
              <div
                className={`px-3 py-1 rounded-xl border font-black ${
                  lastCheckedResult.isCorrect
                    ? 'bg-emerald-200 border-emerald-400 text-emerald-950'
                    : 'bg-rose-200 border-rose-400 text-rose-950'
                }`}
              >
                計算結果: {lastCheckedResult.legs} {valueUnit}（目標: {problem.totalLegs}{valueUnit}）
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-2 text-center text-xs sm:text-sm font-bold text-slate-700">
              <div>
                {itemA.emoji} {itemA.name}: <span className="text-sky-600 font-black text-base">{craneCount}{itemA.unit}</span>（{itemA.value}{valueUnit}）
              </div>
              <div className="text-slate-300 font-black">+</div>
              <div>
                {itemB.emoji} {itemB.name}: <span className="text-emerald-600 font-black text-base">{turtleCount}{itemB.unit}</span>（{itemB.value}{valueUnit}）
              </div>
              <div className="text-slate-300 font-black">=</div>
              <div className="px-3 py-1 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 font-black flex items-center gap-1.5">
                <span>{valueLabel}:</span>
                <span className="text-base font-black text-amber-700">❓ {valueUnit}</span>
                <span className="text-[10px] text-amber-800 font-normal">（判定ボタンで確認）</span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Stepper & Slider Box */}
        <div className="w-full max-w-md bg-white border-2 border-slate-200 rounded-2xl p-4 mb-3 shadow-sm">
          <div className="flex justify-between items-center text-xs font-black text-slate-700 mb-2.5">
            <span>{itemB.emoji} {itemB.name}の予想{itemB.unit}数をセット</span>
            <span className="text-emerald-700 font-extrabold text-base bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {turtleCount} {itemB.unit}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTurtleCount(turtleCount - 1)}
              disabled={turtleCount <= 0}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-black text-slate-700 border border-slate-300 active:scale-95 transition-all shrink-0"
              aria-label={`${itemB.name}を減らす`}
            >
              <Minus className="w-5 h-5" />
            </button>

            <input
              type="range"
              min="0"
              max={problem.totalHeads}
              value={turtleCount}
              onChange={(e) => updateTurtleCount(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <button
              onClick={() => updateTurtleCount(turtleCount + 1)}
              disabled={turtleCount >= problem.totalHeads}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-black text-slate-700 border border-slate-300 active:scale-95 transition-all shrink-0"
              aria-label={`${itemB.name}を増やす`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-1.5">
            <span>0{itemB.unit}（全部{itemA.name}）</span>
            <span>{problem.totalHeads}{itemB.unit}（全部{itemB.name}）</span>
          </div>
        </div>

        {/* Collapsible Middle School Exam Hint */}
        <div className="w-full max-w-md mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-black text-amber-900 flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>💡 中学受験の解法ヒント（もし全部{itemA.name}だったら？）</span>
            </div>
            {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHint && (
            <div className="mt-2 bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 font-bold space-y-1.5 animate-fadeIn">
              <p>
                1. もし全部（{problem.totalHeads}{itemB.unit}）が{itemA.name}なら：{' '}
                <span className="font-black text-amber-800">{problem.totalHeads} × {itemA.value} = {allCraneLegs} {valueUnit}</span>
              </p>
              <p>
                2. 目標（{problem.totalLegs}{valueUnit}）より足りない分は：{' '}
                <span className="font-black text-rose-700">{problem.totalLegs} - {allCraneLegs} = {shortage} {valueUnit}</span>
              </p>
              <p>
                3. {itemA.name}を1つ{itemB.name}に変えると、{valueUnit}は {itemB.value} - {itemA.value} ={' '}
                <span className="font-black text-emerald-700">{diffPerItem} {valueUnit}増える！</span>
              </p>
              <p>
                4. だから{itemB.name}の数は：{' '}
                <span className="font-black text-emerald-800">{shortage} ÷ {diffPerItem} = {problem.correctTurtles} {itemB.unit}！</span>
              </p>
              <p>
                5. {itemA.name}の数は：{' '}
                <span className="font-black text-sky-800">{problem.totalHeads} - {problem.correctTurtles} = {problem.correctCranes} {itemA.unit}！</span>
              </p>
            </div>
          )}
        </div>

        {/* Check / Submit Button */}
        <button
          onClick={handleCheck}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🎯 {valueLabel}を計算して判定する！</span>
        </button>
      </div>
    </GameModalWrapper>
  );
};
