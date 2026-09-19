import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Play, ArrowUp, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

interface AlgoMazeGameProps {
  level: number;
  grade?: number;
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

const GRADE_MAZE_PUZZLES: Record<number, Record<number, MazePuzzle[]>> = {
  "3": {
    "1": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 2,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 0,
            "y": 2
          }
        ],
        "maxCommands": 6,
        "explanation": "前へ2歩、右へ曲がって前へ2歩！順次処理の基本コマンドでゴールイン！",
        "examTip": "【プログラミングの基本】指示された命令を1つずつ上から順番に実行するのがコンピュータの仕組みです！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 2,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 0
          }
        ],
        "maxCommands": 6,
        "explanation": "下を向いた状態から前進し、左に曲がって東へ進んでゴール！",
        "examTip": "ロボットの正面（向いている方向）を常に意識しましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 3,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 2,
          "y": 1
        },
        "walls": [
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 0,
            "y": 1
          }
        ],
        "maxCommands": 6,
        "explanation": "進んでから左折して北上するルートをプログラミングできました！",
        "examTip": "ゴールから逆にたどると最短手順が見つかりやすいです！"
      }
    ],
    "2": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 3,
          "dir": "UP"
        },
        "goal": {
          "x": 2,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 7,
        "explanation": "目の前の障害物を避けるため、右折して迂回するルートをクリア！",
        "examTip": "障害物があるときは、1マス横に避けてから前進しましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 3,
          "dir": "LEFT"
        },
        "goal": {
          "x": 1,
          "y": 1
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 7,
        "explanation": "左向きスタートから北へ進路を変えて見事ゴール！",
        "examTip": "ロボットの目線になって「右」「左」を判断しましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 7,
        "explanation": "障害物の間をくぐり抜ける2回折れ曲がりルート！",
        "examTip": "曲がる回数をできるだけ減らすと安全なプログラムになります！"
      }
    ],
    "3": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 3,
          "dir": "UP"
        },
        "goal": {
          "x": 3,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 8,
        "explanation": "目の前の岩を避けて「右・上・右・上」とリズミカルにゴール！",
        "examTip": "ジグザグに進むアルゴリズムの基礎を身につけました！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 3,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 0
          }
        ],
        "maxCommands": 8,
        "explanation": "障害物の隙間を斜めに抜けていくルートを見事に計画！",
        "examTip": "行き止まり（デッドエンド）を消去法で避けましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 3
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 8,
        "explanation": "中央の岩の塊を迂回して外回りでゴール！",
        "examTip": "回り道でも確実に通れる道を選ぶ判断力が大切です！"
      }
    ],
    "4": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 3,
          "y": 3
        },
        "walls": [
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "下向きスタートから障害壁をジグザグにかわして南東ゴールへ！",
        "examTip": "進むマス数と回転のタイミングを指でなぞって確認！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 0,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 3
        },
        "walls": [
          {
            "x": 2,
            "y": 0
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "北東から南西への対角線ルートを突破！",
        "examTip": "ロボットの向きが逆になっても左右の旋回を間違えないように！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 2,
          "dir": "UP"
        },
        "goal": {
          "x": 3,
          "y": 1
        },
        "walls": [
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "狭い通路を抜けて東側のゴールへ到達！",
        "examTip": "最短ステップ数を計算するプログラミング思考！"
      }
    ],
    "5": [
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 3,
          "dir": "UP"
        },
        "goal": {
          "x": 0,
          "y": 1
        },
        "walls": [
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "北上してから西へと回り込むクランク型コース！",
        "examTip": "曲がり角の直前で立ち止まる安全なアルゴリズム！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 1,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "中央のブロックを外回りで避けてゴールへ！",
        "examTip": "迷路の全体像を俯瞰する視点を養いましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 1,
          "y": 3,
          "dir": "UP"
        },
        "goal": {
          "x": 3,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 9,
        "explanation": "S字状のカーブを描いて見事にゴール！",
        "examTip": "順次処理の組み合わせで複雑な動きが作れます！"
      }
    ],
    "6": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 3,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 10,
        "explanation": "小3マスター！4×4の難関迷路を最短コマンドで突破！",
        "examTip": "【アルゴリズム達成】小学3年生のプログラミング思考を完全制覇！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 0,
          "y": 3
        },
        "walls": [
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 10,
        "explanation": "南下してから西へ抜ける迷路を鮮やかにクリア！",
        "examTip": "指示通りの手順で確実に目標を達成する論理的思考力！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 3
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 10,
        "explanation": "狭いクランクをすり抜けてゴールへ！小4レベルへ進もう！",
        "examTip": "プログラミングの基本マスター達成！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 3,
          "dir": "UP"
        },
        "goal": {
          "x": 3,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 8,
        "explanation": "目の前の岩を避けて「右・上・右・上」とジグザグ前進！",
        "examTip": "小4ではより入り組んだ迷路の最短経路を導きます！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 3,
          "y": 3,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 0
          }
        ],
        "maxCommands": 8,
        "explanation": "隙間を抜けて北西ゴールへ到達！",
        "examTip": "デッドエンドを消去法で見分けましょう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 3
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 8,
        "explanation": "中央の岩の塊を迂回して右回りでゴール！",
        "examTip": "最短ルートが塞がれているときの迂回判断！"
      }
    ],
    "2": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 10,
        "explanation": "5×5の広大なフィールドへ！縦横の障害壁をくぐり抜けて対角線のゴールへ到達！",
        "examTip": "【5×5迷路の攻略】マス目が増えても、1手先・2手先の状態を予測しながら命令を並べよう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 2,
            "y": 0
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 10,
        "explanation": "中央の防壁を外回りして南東ゴールへ！",
        "examTip": "障害物の配置を見て、安全な大通りを見つけましょう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "walls": [
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          }
        ],
        "maxCommands": 10,
        "explanation": "下向きスタートから中央の防壁を回り込んでゴールイン！",
        "examTip": "複雑なコースも「曲がるポイント」を決めておくと安心です！"
      }
    ],
    "3": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "S字状の二重の壁をジグザグにすり抜けるコースをクリア！",
        "examTip": "【パターンの繰り返し】「進んで右、進んで左」の反復思考が大切です！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "下から上へと登っていくジグザグ経路を見事にプログラミング！",
        "examTip": "繰り返しパターンの見立てがポイントです！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "逆走コースのS字迷路も落ち着いてロボット主観でクリア！",
        "examTip": "上向きの時と下向きの時で左右の旋回が逆になる感覚をマスター！"
      }
    ],
    "4": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 11,
        "explanation": "入り組んだ通路をすり抜けて中央東のゴールへ到達！",
        "examTip": "迷路の袋小路に入らないよう、分岐点で先読みしましょう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 2,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 11,
        "explanation": "中央から南東への屈折コースをプログラミング！",
        "examTip": "最短の手順数を逆算する力が身についています！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 2
        },
        "walls": [
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 11,
        "explanation": "南東から西側ゴールへ回り込むルート！",
        "examTip": "ロボットの視点切り替えがとてもスムーズです！"
      }
    ],
    "5": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 2,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 2
        },
        "walls": [
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 0
          }
        ],
        "maxCommands": 12,
        "explanation": "中央の縦壁を上下どちらから迂回するか選択してクリア！",
        "examTip": "アルゴリズムの「条件分岐」の感覚を養います！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 2,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 2,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "中央の横壁を迂回して北上するコース！",
        "examTip": "左右対称の迷路からより効率的な手順を選び出せます！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "U字型に大きく南に迂回して北東ゴールへ！",
        "examTip": "障害物の壁を大きく避けるダイナミックな経路設計！"
      }
    ],
    "6": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 4,
            "y": 2
          }
        ],
        "maxCommands": 12,
        "explanation": "小4マスター！5×5の複雑迷路を最小コマンドで完全制覇！",
        "examTip": "【論理的思考力の完成】手順を細かく分解して実行する能力は満点です！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 4
          }
        ],
        "maxCommands": 12,
        "explanation": "東西を分断する障害壁の間隙を突いてゴールイン！",
        "examTip": "狭いボトルネックを正確に通過するプログラム！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 2,
            "y": 0
          }
        ],
        "maxCommands": 12,
        "explanation": "迷路中央の十字路を駆け抜けてゴール！",
        "examTip": "小学4年生のテックラボ完全攻略！小5へステップアップ！"
      }
    ]
  },
  "5": {
    "1": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "斜めに配置された障害壁をくぐり抜ける高度な迷路！",
        "examTip": "【小5アルゴリズム】複雑な盤面でも最短経路を論理的に組み立てよう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "walls": [
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "対角線を横切る斜めブロックの隙間を突破！",
        "examTip": "各マスの前後左右の安全確認を怠らない！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 1,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "中央の対角線を大きく迂回してゴールイン！",
        "examTip": "外回りのルートを素早く選択できました！"
      }
    ],
    "2": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 2
          }
        ],
        "maxCommands": 14,
        "explanation": "二重の遮断壁と袋小路を避けるクランクコース！",
        "examTip": "袋小路（デッドエンド）を事前に見抜く先読み力！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 0,
            "y": 2
          }
        ],
        "maxCommands": 14,
        "explanation": "S字逆走の精密プログラミング！",
        "examTip": "ロボットの向きによる左右の反転を完全マスター！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 14,
        "explanation": "南北の二重壁を縫うように進むコース！",
        "examTip": "迷路の幅を最大限に活用する経路設計！"
      }
    ],
    "3": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "中央の防壁群を巧みに抜けて北東ゴールへ！",
        "examTip": "条件に合わせた最適な手順を導き出せました！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "walls": [
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 0
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 0,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "逆方向の要塞迷路も冷静に攻略！",
        "examTip": "状態遷移（向いている方向と座標）を正確に追跡！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 2,
            "y": 0
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "中央のT字壁を迂回して南東ゴールへ！",
        "examTip": "余分な回転命令を省いたスマートなコード！"
      }
    ],
    "4": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 4,
            "y": 1
          }
        ],
        "maxCommands": 14,
        "explanation": "6×6のメガフィールド！中央の要塞を大きく迂回して北東へ！",
        "examTip": "【6×6メガ迷路】最短ステップの組み合わせ思考が試されます！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 4,
            "y": 3
          }
        ],
        "maxCommands": 14,
        "explanation": "障害物が散らばる大フィールドを縦横無尽に突破！",
        "examTip": "広い視野で最短ルートを見極めましょう！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 0,
          "y": 5
        },
        "walls": [
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 4,
            "y": 4
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 14,
        "explanation": "中央の壁をかわして南西の基地へ帰還！",
        "examTip": "論理的思考力と空間把握能力の見事な融合！"
      }
    ],
    "5": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 16,
        "explanation": "スパイラル状の障害物をくぐり抜ける超難度コース！",
        "examTip": "渦巻き迷路の先読みトレース能力！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 4,
            "y": 4
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 4,
            "y": 2
          }
        ],
        "maxCommands": 16,
        "explanation": "逆渦巻きコースを最短手順で攻略！",
        "examTip": "無駄のない効率的なアルゴリズム設計！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 4,
            "y": 3
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 3
          }
        ],
        "maxCommands": 16,
        "explanation": "蛇行する狭路をスムーズに駆け抜ける！",
        "examTip": "卓越したプログラミング感覚が光ります！"
      }
    ],
    "6": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 5,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 4
          }
        ],
        "maxCommands": 16,
        "explanation": "小5最高峰！6×6メガ迷路の斜め防壁を完全攻略！",
        "examTip": "【アルゴリズムの達人】中学受験適性検査の思考力問題を完璧にマスター！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 4,
            "y": 5
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 4
          }
        ],
        "maxCommands": 16,
        "explanation": "6×6メガ逆走コースを最短ステップでゴールイン！",
        "examTip": "最高レベルのプログラミング思考力を実証！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 16,
        "explanation": "6×6の二重防壁迷路を完全制覇！小6へ！",
        "examTip": "思考力・判断力・表現力のすべてがトップクラスです！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "【小6受験突破】階段状の要塞壁をタイトなコマンド予算でクリア！",
        "examTip": "【最難関中のアルゴリズム】1歩の無駄も許されない最適経路の探求！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "逆走階段迷路を無駄のないコマンドで突破！",
        "examTip": "ロボット主観の旋回判断を反射的に行えるようになりましょう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "階段状のクランクを素早くすり抜ける！",
        "examTip": "最短ステップ数を一瞬で見抜く計算力！"
      }
    ],
    "2": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 2,
          "dir": "UP"
        },
        "goal": {
          "x": 4,
          "y": 2
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "中央の二重縦壁の隙間をくぐり抜ける難関迷路！",
        "examTip": "隘路（ボトルネック）を正確に通過するプログラム！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 2,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 2,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 12,
        "explanation": "横壁の二重トラップを迂回して南下！",
        "examTip": "左右どちらの迂回がコマンド数を節約できるかを瞬時に判断！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          }
        ],
        "maxCommands": 12,
        "explanation": "長大な防壁を乗り越えて北東ゴールへ！",
        "examTip": "ダイナミックな大迂回ルートの設計！"
      }
    ],
    "3": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 14,
        "explanation": "6×6メガフィールドの中央要塞群と外周トラップを突破！",
        "examTip": "【メガ要塞攻略】広大なフィールドで迷わない論理的経路追跡！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 4,
            "y": 4
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 14,
        "explanation": "逆走メガ迷路を完璧なステップ配分でクリア！",
        "examTip": "障害物の間隙を縫うミリ単位のプログラミング！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 4,
            "y": 3
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 14,
        "explanation": "対角線上の難所をすべてクリアして南東へ！",
        "examTip": "最短ステップ数を確実に達成する計画性！"
      }
    ],
    "4": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 4
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 5,
            "y": 2
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 16,
        "explanation": "二重の長い横壁をジグザグにすり抜ける超難問！",
        "examTip": "【S字ループの極意】繰り返しの美学をプログラミングで表現！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 4,
            "y": 4
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 16,
        "explanation": "逆方向の超長S字コースも正確にクリア！",
        "examTip": "ロボット主観の左右判断をノーミスで実行！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 4,
            "y": 1
          }
        ],
        "maxCommands": 16,
        "explanation": "二重の長い縦壁を縫って南東へ到達！",
        "examTip": "壁の隙間を捉える鋭い空間認知力！"
      }
    ],
    "5": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 5,
            "y": 1
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 3,
            "y": 5
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 16,
        "explanation": "斜めブロック列と防壁の迷宮を突破！",
        "examTip": "【最難関中の名問】適性検査の思考力パズル最高峰！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 4,
            "y": 5
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 16,
        "explanation": "逆走斜め要塞を神業的なコマンドで攻略！",
        "examTip": "全国トップクラスのアルゴリズム構築力！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 4,
            "y": 3
          },
          {
            "x": 5,
            "y": 4
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 2,
            "y": 4
          }
        ],
        "maxCommands": 16,
        "explanation": "対角線上の防壁を美しく外回りで回避！",
        "examTip": "完璧なステップ配分で見事ゴール！"
      }
    ],
    "6": [
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 5,
          "dir": "UP"
        },
        "goal": {
          "x": 5,
          "y": 0
        },
        "walls": [
          {
            "x": 2,
            "y": 4
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 4,
            "y": 3
          },
          {
            "x": 4,
            "y": 2
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 3,
            "y": 5
          }
        ],
        "maxCommands": 16,
        "explanation": "【全国模試トップ級】入り組んだ要塞迷路を最短16コマンド以内で完全制覇！",
        "examTip": "【プログラミング思考の極致】どんな複雑な課題も小さな論理ステップに分解して解決する力が完成しました！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 5,
          "y": 5,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 0
        },
        "walls": [
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 2,
            "y": 5
          }
        ],
        "maxCommands": 16,
        "explanation": "メガ要塞の逆走コースを完全制覇！",
        "examTip": "【コンピュータ・サイエンスの未来の巨匠】アルゴリズムの真髄を極めました！"
      },
      {
        "gridSize": 6,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 5,
          "y": 5
        },
        "walls": [
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 2,
            "y": 3
          },
          {
            "x": 3,
            "y": 3
          },
          {
            "x": 4,
            "y": 3
          },
          {
            "x": 3,
            "y": 4
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 16,
        "explanation": "【アルゴリズム・レジェンド認定】6×6迷路の頂点へ到達！全カテゴリー完全制圧！",
        "examTip": "【STEAM探検隊 伝説のマスター】科学・技術・工学・芸術・数学のすべての探検を成し遂げました！"
      }
    ]
  }
};

export const AlgoMazeGame: React.FC<AlgoMazeGameProps> = ({
  level,
  grade = 3,
  onComplete,
  onBack,
  onNextLevel,
  customPuzzles,
  customTitle,
  customBadge
}) => {
  const getLevelPuzzles = (lvl: number, gNum: number = 3): MazePuzzle[] => {
    const gradeData = GRADE_MAZE_PUZZLES[gNum] || GRADE_MAZE_PUZZLES[3];
    return gradeData[lvl] || gradeData[1];
  };

  const mazes = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level, grade);
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
