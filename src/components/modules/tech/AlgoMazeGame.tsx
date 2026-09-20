import React, { useState } from 'react';
import { GameModalWrapper } from '../../common/GameModalWrapper';
import { sound } from '../../../services/audio';
import { fireConfetti } from '../../../services/confetti';
import { Play, ArrowUp, ArrowLeft, ArrowRight, Trash2, Repeat, Zap, Box, FastForward } from 'lucide-react';

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

export type Command =
  | 'FORWARD'               // 1歩前進 (全学年)
  | 'TURN_LEFT'             // 左を向く (全学年)
  | 'TURN_RIGHT'            // 右を向く (全学年)
  | 'FORWARD_2'             // 2歩前進 (小4+)
  | 'FORWARD_3'             // 3歩ダッシュ (小4+)
  | 'LOOP_FWD_RIGHT'        // 1歩前進して右を向く (小4+)
  | 'LOOP_FWD_LEFT'         // 1歩前進して左を向く (小4+)
  | 'IF_WALL_RIGHT_ELSE_FWD'// センサー条件分岐: 前が壁なら右折、道なら前進 (小5+)
  | 'IF_WALL_LEFT_ELSE_FWD' // センサー条件分岐: 前が壁なら左折、道なら前進 (小5+)
  | 'WHILE_NOT_WALL'        // 壁の手前まで一気に直進 (小6)
  | 'CALL_F1';              // 関数F1（サブルーチン）を実行 (小6)

export interface MazePuzzle {
  gridSize: number;
  start: { x: number; y: number; dir: Direction };
  goal: { x: number; y: number };
  walls: { x: number; y: number }[];
  maxCommands: number;
  explanation: string;
  examTip: string;
  presetF1?: ('FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT')[];
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
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 7,
        "explanation": "左向きからスタートしてジグザグに進み、ゴールに到着！",
        "examTip": "ロボットから見た「左」と「右」を正確に判断しよう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 3,
          "y": 1
        },
        "walls": [
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 1,
            "y": 0
          }
        ],
        "maxCommands": 6,
        "explanation": "下に進んで岩の手前で左折し、東へ直進してゴール！",
        "examTip": "ロボットから見て曲がる方向を考えよう！"
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
          "y": 1
        },
        "walls": [
          {
            "x": 0,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          }
        ],
        "maxCommands": 7,
        "explanation": "北へ進んでから東へ曲がり、障害物を避けてゴール！",
        "examTip": "曲がり角の数を減らして効率的な手順を組み立てよう！"
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
          "y": 1
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 0
          }
        ],
        "maxCommands": 7,
        "explanation": "西へ直進して北上する最短ルートでゴール！",
        "examTip": "直線の移動を意識しよう！"
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
            "y": 1
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 7,
        "explanation": "北側を東へ進み、右折して南下してゴール！",
        "examTip": "壁のない広い直線を選ぼう！"
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
            "y": 3
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
        "maxCommands": 8,
        "explanation": "南へ下りて東へ曲がり、障害物を迂回してゴール！",
        "examTip": "障害物を大きく避けるルートを考えよう！"
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
            "x": 1,
            "y": 2
          }
        ],
        "maxCommands": 8,
        "explanation": "南下して西へ進み、ゴールへ到着！",
        "examTip": "角を曲がるときの向きを間違えないように！"
      },
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
            "x": 2,
            "y": 3
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 8,
        "explanation": "東へ進んで北上し、ゴールイン！",
        "examTip": "順番に命令を実行する大切さを確認しよう！"
      }
    ],
    "5": [
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 2,
          "y": 3
        },
        "walls": [
          {
            "x": 1,
            "y": 0
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 8,
        "explanation": "迂回ルートを通り抜けてゴール！",
        "examTip": "スタート直後に壁があるときは向きを変えよう！"
      },
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
          }
        ],
        "maxCommands": 8,
        "explanation": "障害物の隙間をぬってゴール！",
        "examTip": "ゴールへの道筋を逆算してみよう！"
      },
      {
        "gridSize": 4,
        "start": {
          "x": 0,
          "y": 2,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 3,
          "y": 0
        },
        "walls": [
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
        "explanation": "クランク状に曲がって北東のゴールへ！",
        "examTip": "クランク道は交互に向きを変えよう！"
      }
    ],
    "6": [
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
        "explanation": "【小3マスター】障害物が入り組んだ迷路を完全制覇！",
        "examTip": "1歩ずつ確実にロボットを動かす順次処理をマスターしました！"
      },
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
            "x": 1,
            "y": 0
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
        "explanation": "【小3マスター】S字を描いてゴールへ到達！",
        "examTip": "複雑なコースも1手ずつの積み重ねで解けます！"
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
            "x": 2,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 8,
        "explanation": "【小3マスター】完璧なシーケンスで最難関迷路をクリア！",
        "examTip": "順次処理の基本が完成！次は小4の繰り返し処理に挑戦しよう！"
      }
    ]
  },
  "4": {
    "1": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "RIGHT"
        },
        "goal": {
          "x": 4,
          "y": 0
        },
        "walls": [
          {
            "x": 0,
            "y": 1
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
            "y": 1
          }
        ],
        "maxCommands": 2,
        "explanation": "【ループ・反復の発見】4マスの長距離直線を「2歩すすむ×2」または「3歩ダッシュ＋1歩」で圧縮！わずか2命令でゴール！",
        "examTip": "【中学入試・規則性】長い直線は1歩ずつ進むと命令上限オーバーになります。まとめて進む命令を活用しましょう！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 3,
          "y": 1
        },
        "walls": [
          {
            "x": 0,
            "y": 0
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
        "maxCommands": 3,
        "explanation": "【3歩ダッシュの快進撃】北へ3歩ダッシュ、右を向いて東へ3歩ダッシュ！驚異の3命令クリア！",
        "examTip": "【パターンの対称性】同じ長さ（3歩）の移動を繰り返す美しいアルゴリズムです！"
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
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 4,
        "explanation": "【縦横ダッシュの組み合わせ】東へ4歩（2歩×2）、右折して南へ3歩ダッシュ！4命令でゴール！",
        "examTip": "【命令数の大幅節約】1歩ずつだと9命令必要なところを、マルチステップで4命令に圧縮できました！"
      }
    ],
    "2": [
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
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
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 5,
        "explanation": "【階段パターンの2歩刻み】東へ2歩、南へ2歩、東へ2歩！同じ2歩の移動を繰り返してゴール！",
        "examTip": "【等差移動のパターン】2歩ごとの規則的なリズムを見抜くことが大切です！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 0,
          "y": 0,
          "dir": "DOWN"
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
            "x": 1,
            "y": 3
          }
        ],
        "maxCommands": 5,
        "explanation": "【L字ループ】南へ2歩、東へ2歩、南へ2歩！ジグザグの規則性でクリア！",
        "examTip": "同じ歩数で曲がるパターンはプログラミングの基本です！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 0,
          "dir": "LEFT"
        },
        "goal": {
          "x": 0,
          "y": 4
        },
        "walls": [
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 5,
        "explanation": "【外周の高速ダッシュ】西へ4歩（2歩×2）、左折して南へ4歩（2歩×2）！",
        "examTip": "長距離は「2歩すすむ」を連続実行して一気に走破しよう！"
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
            "y": 2
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 5,
        "explanation": "【外周ダッシュ】東へ4歩（2歩×2）、南へ4歩（2歩×2）！5命令で巨大フィールドを走破！",
        "examTip": "中央の障害物を避けて外周をダッシュする基本戦略！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 4,
          "dir": "UP"
        },
        "goal": {
          "x": 1,
          "y": 1
        },
        "walls": [
          {
            "x": 3,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 4,
        "explanation": "【北西への高速アプローチ】北へ3歩、西へ3歩で一気に接近！",
        "examTip": "3歩ダッシュの組み合わせで最短コマンドを記録！"
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
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 5,
        "explanation": "【大迂回スプリント】東へ4歩（2歩×2）、北へ4歩（2歩×2）でゴール！",
        "examTip": "壁の切れ目を見極めてダッシュしよう！"
      }
    ],
    "4": [
      {
        "gridSize": 5,
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
            "x": 1,
            "y": 1
          },
          {
            "x": 2,
            "y": 2
          }
        ],
        "maxCommands": 3,
        "explanation": "【3歩ダッシュ直交ルート】南へ3歩、左折して東へ3歩！たったの3命令！",
        "examTip": "直交する直線をそれぞれ3歩ダッシュで制覇！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 4,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 1,
          "y": 3
        },
        "walls": [
          {
            "x": 4,
            "y": 4
          },
          {
            "x": 2,
            "y": 1
          }
        ],
        "maxCommands": 4,
        "explanation": "【斜めターゲット】南へ3歩、西へ3歩でターゲットを捕捉！",
        "examTip": "3歩ダッシュ×2回の対称移動です！"
      },
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
            "x": 1,
            "y": 1
          },
          {
            "x": 3,
            "y": 3
          }
        ],
        "maxCommands": 2,
        "explanation": "【ストレート高速クリア】一直線の4マスを2歩×2で最短クリア！",
        "examTip": "障害物のないストレートはマルチステップの独壇場！"
      }
    ],
    "5": [
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【対角線ダッシュ】北へ4歩（2歩×2）、東へ4歩（2歩×2）！",
        "examTip": "対角の障害物を外周から迂回するスマートアルゴリズム！"
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
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          }
        ],
        "maxCommands": 5,
        "explanation": "【西と北のロングスプリント】西へ4歩、北へ4歩！",
        "examTip": "2歩すすむを連続で使って高速移動！"
      },
      {
        "gridSize": 5,
        "start": {
          "x": 2,
          "y": 0,
          "dir": "DOWN"
        },
        "goal": {
          "x": 2,
          "y": 4
        },
        "walls": [
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 2,
        "explanation": "【センターレーン走破】中央の縦レーンを一気に4歩駆け抜ける！",
        "examTip": "まっすぐなレーンは2歩×2回で一瞬！"
      }
    ],
    "6": [
      {
        "gridSize": 5,
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
            "x": 0,
            "y": 2
          },
          {
            "x": 1,
            "y": 1
          },
          {
            "x": 3,
            "y": 1
          }
        ],
        "maxCommands": 5,
        "explanation": "【小4マスター】東へ3歩ダッシュ、南へ3歩ダッシュ！",
        "examTip": "繰り返し・マルチステップの真髄を極めました！"
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
            "x": 2,
            "y": 1
          },
          {
            "x": 2,
            "y": 3
          }
        ],
        "maxCommands": 5,
        "explanation": "【小4マスター】南へ4歩、西へ4歩でゴール！",
        "examTip": "長距離の直線は迷わず2歩・3歩命令を活用しよう！"
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
            "y": 0
          },
          {
            "x": 1,
            "y": 2
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【小4マスター】南へ4歩、東へ4歩！完璧なマルチステップ制御！",
        "examTip": "繰り返し処理マスター認定！小5の条件分岐へ進もう！"
      }
    ]
  },
  "5": {
    "1": [
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
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
      }
    ],
    "2": [
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
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
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
            "x": 2,
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
      }
    ],
    "4": [
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
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
      }
    ],
    "5": [
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
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
      }
    ],
    "6": [
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
            "y": 1
          },
          {
            "x": 3,
            "y": 2
          }
        ],
        "maxCommands": 5,
        "explanation": "【センサー条件分岐の威力】突き当たりで前面センサーが壁（外周）を検知し、自動で右折して南下！",
        "examTip": "【中学入試・条件分岐】「もし壁なら方向転換する」という自動運転ロボットの基本センサー判定です！"
      },
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
            "y": 3
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
        "maxCommands": 5,
        "explanation": "【北端センサー検知】北端でセンサーが壁を検知して自動右折！",
        "examTip": "条件分岐命令を使うと、曲がる指示と進む指示を賢くまとめられます！"
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
            "y": 1
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
        "maxCommands": 5,
        "explanation": "【南端センサー右折】南端でセンサーが壁を検知して自動右折（西向き）！",
        "examTip": "障害物との距離を測るセンサーアルゴリズムです！"
      }
    ]
  },
  "6": {
    "1": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ],
    "2": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ],
    "3": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ],
    "4": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ],
    "5": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ],
    "6": [
      {
        "gridSize": 6,
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
            "x": 2,
            "y": 0
          },
          {
            "x": 3,
            "y": 0
          },
          {
            "x": 4,
            "y": 0
          },
          {
            "x": 5,
            "y": 0
          },
          {
            "x": 0,
            "y": 2
          },
          {
            "x": 0,
            "y": 3
          },
          {
            "x": 0,
            "y": 4
          },
          {
            "x": 0,
            "y": 5
          },
          {
            "x": 3,
            "y": 1
          },
          {
            "x": 4,
            "y": 1
          },
          {
            "x": 1,
            "y": 3
          },
          {
            "x": 1,
            "y": 4
          }
        ],
        "maxCommands": 4,
        "explanation": "【サブルーチン F1 の勝利！】「前進・右折・前進・左折」の階段ステップを関数F1にまとめ、3回の呼び出しで見事最短クリア！",
        "examTip": "【難関中プログラミング入試】開成・筑駒等で頻出する「手続きのモジュール化」。同じパターンを1つの関数にまとめる思考力です！",
        "presetF1": [
          "FORWARD",
          "TURN_RIGHT",
          "FORWARD",
          "TURN_LEFT"
        ]
      },
      {
        "gridSize": 6,
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
            "x": 0,
            "y": 5
          },
          {
            "x": 1,
            "y": 5
          },
          {
            "x": 2,
            "y": 5
          },
          {
            "x": 3,
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
          }
        ],
        "maxCommands": 4,
        "explanation": "【登り階段サブルーチン】「前進・左折・前進・右折」をF1に登録し、4回呼び出して北東の頂上へ到達！",
        "examTip": "【手続きの反復実行】関数の再利用によって、16命令必要な迷路をたった4命令で走破できます！",
        "presetF1": [
          "FORWARD",
          "TURN_LEFT",
          "FORWARD",
          "TURN_RIGHT"
        ]
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
            "x": 4,
            "y": 4
          }
        ],
        "maxCommands": 3,
        "explanation": "【WHILEループの突進力】壁の手前まで一気に直進する強力なアルゴリズム！右折してさらに直進でゴール！",
        "examTip": "【WHILE制御構造】「壁に当たるまで繰り返す」という探索アルゴリズムの王道です！"
      }
    ]
  }
};

const GRADE_METRICS: Record<number, { title: string; subtitle: string; icon: string }> = {
  3: {
    title: '🎒 小学3年生: 順次処理（じゅんじしょり）',
    subtitle: '命令カードを順番に並べて、ロボットを1歩ずつゴールへ導こう！',
    icon: '🤖'
  },
  4: {
    title: '🎒 小学4年生: 繰り返し（ループ）とパターンの発見',
    subtitle: '同じ動きを見つけて「2歩すすむ」「3歩ダッシュ」で命令数を節約しよう！',
    icon: '🔁'
  },
  5: {
    title: '🎒 小学5年生: 条件分岐（もし〜なら）とセンサー判断',
    subtitle: '障害物をセンサーで検知して進路を変える「条件分岐」を活用しよう！',
    icon: '🔀'
  },
  6: {
    title: '🎒 小学6年生: 関数（サブルーチン）＆最難関アルゴリズム',
    subtitle: '繰り返しパターンを「関数 F1」に部品化し、最小コマンド数で迷路を制覇しよう！',
    icon: '📦'
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
  const currentGrade = [3, 4, 5, 6].includes(grade) ? grade : 3;

  const getLevelPuzzles = (lvl: number, gNum: number = 3): MazePuzzle[] => {
    const gradeData = GRADE_MAZE_PUZZLES[gNum] || GRADE_MAZE_PUZZLES[3];
    return gradeData[lvl] || gradeData[1];
  };

  const mazes = (customPuzzles && customPuzzles.length > 0) ? customPuzzles : getLevelPuzzles(level, currentGrade);
  const [problemIndex, setProblemIndex] = useState(0);
  const maze = mazes[problemIndex % mazes.length];

  const [commands, setCommands] = useState<Command[]>([]);
  const [f1Commands, setF1Commands] = useState<('FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT')[]>(
    maze.presetF1 || ['FORWARD', 'TURN_RIGHT', 'FORWARD', 'TURN_LEFT']
  );
  const [botState, setBotState] = useState({
    x: maze.start.x,
    y: maze.start.y,
    dir: maze.start.dir
  });
  const [isRunning, setIsRunning] = useState(false);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string>(GRADE_METRICS[currentGrade]?.subtitle || '命令カードを並べてロボットを星まで導こう！');

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
    if (nextM.presetF1) {
      setF1Commands(nextM.presetF1);
    }
    setBotState({
      x: nextM.start.x,
      y: nextM.start.y,
      dir: nextM.start.dir
    });
    setIsCompleted(false);
    setFeedback(GRADE_METRICS[currentGrade]?.subtitle || '命令カードを並べてロボットを星まで導こう！');
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

  const addF1Command = (subCmd: 'FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT') => {
    if (f1Commands.length >= 4 || isRunning) return;
    sound.playClick();
    setF1Commands([...f1Commands, subCmd]);
  };

  const clearF1 = () => {
    if (isRunning) return;
    sound.playClick();
    setF1Commands([]);
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

  const isBlocked = (x: number, y: number, dir: Direction, gSize: number, walls: { x: number; y: number }[]): boolean => {
    let nx = x;
    let ny = y;
    if (dir === 'UP') ny -= 1;
    if (dir === 'RIGHT') nx += 1;
    if (dir === 'DOWN') ny += 1;
    if (dir === 'LEFT') nx -= 1;
    if (nx < 0 || nx >= gSize || ny < 0 || ny >= gSize) return true;
    return walls.some((w) => w.x === nx && w.y === ny);
  };

  const stepForward = (x: number, y: number, dir: Direction): { x: number; y: number } => {
    let nx = x;
    let ny = y;
    if (dir === 'UP') ny -= 1;
    if (dir === 'RIGHT') nx += 1;
    if (dir === 'DOWN') ny += 1;
    if (dir === 'LEFT') nx -= 1;
    return { x: nx, y: ny };
  };

  const runProgram = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);
    setFeedback('🤖 プログラム実行中...');
    let curX = maze.start.x;
    let curY = maze.start.y;
    let curDir = maze.start.dir;

    setBotState({ x: curX, y: curY, dir: curDir });

    const executeAtomic = async (type: 'MOVE' | 'TURN', turnType?: 'LEFT' | 'RIGHT'): Promise<boolean> => {
      if (type === 'TURN' && turnType) {
        sound.playClick();
        curDir = turnDir(curDir, turnType);
        setBotState({ x: curX, y: curY, dir: curDir });
        await new Promise((r) => setTimeout(r, 220));
        return true;
      } else if (type === 'MOVE') {
        if (isBlocked(curX, curY, curDir, maze.gridSize, maze.walls)) {
          sound.playWrong();
          setFeedback('💥 岩またはコースの外にぶつかってしまった！プログラムを直そう。');
          return false;
        }
        sound.playClick();
        const next = stepForward(curX, curY, curDir);
        curX = next.x;
        curY = next.y;
        setBotState({ x: curX, y: curY, dir: curDir });
        await new Promise((r) => setTimeout(r, 250));
        return true;
      }
      return true;
    };

    for (let i = 0; i < commands.length; i++) {
      setExecutingIndex(i);
      const cmd = commands[i];

      if (cmd === 'FORWARD') {
        const ok = await executeAtomic('MOVE');
        if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
      } else if (cmd === 'TURN_LEFT') {
        await executeAtomic('TURN', 'LEFT');
      } else if (cmd === 'TURN_RIGHT') {
        await executeAtomic('TURN', 'RIGHT');
      } else if (cmd === 'FORWARD_2') {
        for (let s = 0; s < 2; s++) {
          const ok = await executeAtomic('MOVE');
          if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        }
      } else if (cmd === 'FORWARD_3') {
        for (let s = 0; s < 3; s++) {
          const ok = await executeAtomic('MOVE');
          if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        }
      } else if (cmd === 'LOOP_FWD_RIGHT') {
        const ok = await executeAtomic('MOVE');
        if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        await executeAtomic('TURN', 'RIGHT');
      } else if (cmd === 'LOOP_FWD_LEFT') {
        const ok = await executeAtomic('MOVE');
        if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        await executeAtomic('TURN', 'LEFT');
      } else if (cmd === 'IF_WALL_RIGHT_ELSE_FWD') {
        if (isBlocked(curX, curY, curDir, maze.gridSize, maze.walls)) {
          setFeedback('🤖 センサー検知：前方が壁なので【右折】しました');
          await executeAtomic('TURN', 'RIGHT');
        } else {
          setFeedback('🤖 センサー検知：前方が道なので【前進】しました');
          const ok = await executeAtomic('MOVE');
          if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        }
      } else if (cmd === 'IF_WALL_LEFT_ELSE_FWD') {
        if (isBlocked(curX, curY, curDir, maze.gridSize, maze.walls)) {
          setFeedback('🤖 センサー検知：前方が壁なので【左折】しました');
          await executeAtomic('TURN', 'LEFT');
        } else {
          setFeedback('🤖 センサー検知：前方が道なので【前進】しました');
          const ok = await executeAtomic('MOVE');
          if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
        }
      } else if (cmd === 'WHILE_NOT_WALL') {
        let steps = 0;
        while (!isBlocked(curX, curY, curDir, maze.gridSize, maze.walls) && steps < maze.gridSize) {
          const ok = await executeAtomic('MOVE');
          if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
          steps++;
          if (curX === maze.goal.x && curY === maze.goal.y) break;
        }
        if (steps > 0) {
          setFeedback(`🚀 壁の手前まで一気に${steps}歩ダッシュ！`);
        }
      } else if (cmd === 'CALL_F1') {
        setFeedback('📦 関数 F1 (サブルーチン) を実行中...');
        for (const subCmd of f1Commands) {
          if (subCmd === 'FORWARD') {
            const ok = await executeAtomic('MOVE');
            if (!ok) { setIsRunning(false); setExecutingIndex(null); return; }
          } else if (subCmd === 'TURN_LEFT') {
            await executeAtomic('TURN', 'LEFT');
          } else if (subCmd === 'TURN_RIGHT') {
            await executeAtomic('TURN', 'RIGHT');
          }
        }
      }
    }

    setExecutingIndex(null);
    await new Promise((r) => setTimeout(r, 200));

    if (curX === maze.goal.x && curY === maze.goal.y) {
      sound.playCorrect();
      fireConfetti();
      setIsCompleted(true);
      setFeedback('🎉 ゴール達成！見事なアルゴリズムです！');
      onComplete(3);
    } else {
      sound.playWrong();
      setFeedback('ゴールに届かなかったよ！命令を追加するか直してみてね。');
    }
    setIsRunning(false);
  };

  const getCommandBadge = (cmd: Command) => {
    switch (cmd) {
      case 'FORWARD':
        return <span>⬆️ 1歩前進</span>;
      case 'TURN_LEFT':
        return <span>↩️ 左向く</span>;
      case 'TURN_RIGHT':
        return <span>↪️ 右向く</span>;
      case 'FORWARD_2':
        return <span>👟 2歩前進</span>;
      case 'FORWARD_3':
        return <span>🚀 3歩ダッシュ</span>;
      case 'LOOP_FWD_RIGHT':
        return <span>🔁 前+右折</span>;
      case 'LOOP_FWD_LEFT':
        return <span>🔁 前+左折</span>;
      case 'IF_WALL_RIGHT_ELSE_FWD':
        return <span>🔀 壁→右折</span>;
      case 'IF_WALL_LEFT_ELSE_FWD':
        return <span>🔀 壁→左折</span>;
      case 'WHILE_NOT_WALL':
        return <span>🚀 壁まで直進</span>;
      case 'CALL_F1':
        return <span>📦 関数F1</span>;
      default:
        return <span>{cmd}</span>;
    }
  };

  const cellSizeClass =
    maze.gridSize >= 6
      ? 'w-10 h-10 sm:w-11 sm:h-11'
      : maze.gridSize === 5
      ? 'w-11 h-11 sm:w-13 sm:h-13'
      : 'w-12 h-12 sm:w-14 sm:h-14';

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
        setFeedback(GRADE_METRICS[currentGrade]?.subtitle || '命令カードを並べてロボットを星まで導こう！');
      }}
    >
      <div className="flex flex-col items-center select-none w-full">
        {/* Grade Theme Banner */}
        <div className="w-full max-w-md bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl py-1.5 px-3 mb-2 flex items-center justify-between text-xs shadow-xs">
          <span className="font-black text-indigo-950 flex items-center gap-1.5">
            <span>{GRADE_METRICS[currentGrade]?.icon}</span>
            <span>{GRADE_METRICS[currentGrade]?.title}</span>
          </span>
          <span className="text-[10px] bg-white border border-indigo-200 px-2 py-0.5 rounded-full font-bold text-indigo-800">
            上限: {maze.maxCommands}命令
          </span>
        </div>

        {/* Status prompt */}
        <div className="w-full max-w-md text-center py-2 px-3 bg-sky-50 border border-sky-200 rounded-2xl mb-2 font-extrabold text-sky-900 text-xs sm:text-sm">
          {feedback}
        </div>

        {/* Direction Status & Compass Banner */}
        <div className="flex items-center justify-center gap-2 px-3 py-1 bg-slate-900 border border-indigo-500/50 rounded-2xl text-xs font-black text-white shadow-sm mb-2.5">
          <span className="text-slate-300">🤖 ロボットの正面:</span>
          <span className="px-2 py-0.5 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center gap-1 shadow-xs text-xs">
            <span>{DIR_LABEL[botState.dir].icon}</span>
            <span>{DIR_LABEL[botState.dir].text}</span>
          </span>
        </div>

        {/* Maze Grid Stage */}
        <div
          className="grid gap-1.5 p-3 bg-slate-800 rounded-3xl border-4 border-slate-700 shadow-xl mb-3"
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
                    className={`${cellSizeClass} rounded-2xl flex flex-col items-center justify-center font-black relative transition-all duration-200 overflow-visible ${
                      isWall
                        ? 'bg-slate-700 border-2 border-slate-600 shadow-inner'
                        : 'bg-slate-900/80 border border-slate-700/50'
                    }`}
                  >
                    {isWall && <span className="text-lg sm:text-xl">🪨</span>}
                    {isGoal && (
                      <span className="text-xl sm:text-2xl animate-pulse filter drop-shadow">
                        ⭐
                      </span>
                    )}
                    {isBot && (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div
                          className="relative flex items-center justify-center transition-transform duration-200 ease-out"
                          style={{
                            transform: `rotate(${DIR_DEG[botState.dir]}deg)`
                          }}
                        >
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-20">
                            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-amber-300 animate-pulse drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
                          </div>
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-b from-sky-400 via-indigo-500 to-indigo-700 border-2 border-white shadow-md flex flex-col items-center justify-center text-white relative">
                            <div className="absolute -top-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_4px_#fde047]" />
                            <div className="flex gap-1 mb-0.5 mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_#fde047]" />
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_4px_#fde047]" />
                            </div>
                            <div className="w-3 h-0.5 bg-sky-200 rounded-full" />
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

        {/* Grade 6 Function F1 Definition Panel */}
        {currentGrade === 6 && (
          <div className="w-full max-w-md bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-300 rounded-2xl p-2.5 mb-2.5 shadow-xs">
            <div className="flex justify-between items-center mb-1 px-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white font-black text-xs shadow-xs flex items-center gap-1">
                  <Box className="w-3 h-3 text-yellow-300" />
                  <span>関数 F1 の定義</span>
                </span>
                <span className="text-[11px] font-bold text-purple-900">
                  (サブルーチン: 最大4命令)
                </span>
              </div>
              <button
                onClick={clearF1}
                disabled={isRunning || f1Commands.length === 0}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-0.5 disabled:opacity-40"
              >
                <Trash2 className="w-3 h-3" />
                <span>クリア</span>
              </button>
            </div>

            {/* F1 items */}
            <div className="flex flex-wrap gap-1 min-h-[34px] bg-white/95 p-1.5 rounded-xl border border-purple-200 mb-1.5">
              {f1Commands.map((cmd, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-950 text-[11px] font-black border border-purple-300"
                >
                  <span>{idx + 1}.</span>
                  {cmd === 'FORWARD' && <span>⬆️ 前進</span>}
                  {cmd === 'TURN_LEFT' && <span>↩️ 左折</span>}
                  {cmd === 'TURN_RIGHT' && <span>↪️ 右折</span>}
                </span>
              ))}
              {f1Commands.length === 0 && (
                <span className="text-[11px] text-purple-400 font-bold self-center px-1">
                  下のボタンでF1の動作を登録してね
                </span>
              )}
            </div>

            {/* F1 adder buttons */}
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={() => addF1Command('FORWARD')}
                disabled={isRunning || f1Commands.length >= 4}
                className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-black shadow-xs active:scale-95 disabled:opacity-40"
              >
                + ⬆️ 前進
              </button>
              <button
                onClick={() => addF1Command('TURN_LEFT')}
                disabled={isRunning || f1Commands.length >= 4}
                className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-black shadow-xs active:scale-95 disabled:opacity-40"
              >
                + ↩️ 左折
              </button>
              <button
                onClick={() => addF1Command('TURN_RIGHT')}
                disabled={isRunning || f1Commands.length >= 4}
                className="px-2 py-0.5 bg-white hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-black shadow-xs active:scale-95 disabled:opacity-40"
              >
                + ↪️ 右折
              </button>
            </div>
          </div>
        )}

        {/* Command Queue Box */}
        <div className="w-full max-w-md bg-slate-100 border-2 border-slate-300 rounded-2xl p-2.5 mb-2.5">
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-xs transition-all ${
                  executingIndex === idx
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-300 scale-110 z-10'
                    : cmd === 'CALL_F1'
                    ? 'bg-purple-600 text-white border border-purple-700'
                    : cmd.includes('IF_')
                    ? 'bg-rose-500 text-white border border-rose-600'
                    : cmd.includes('FORWARD_2') || cmd.includes('FORWARD_3')
                    ? 'bg-emerald-600 text-white border border-emerald-700'
                    : cmd === 'WHILE_NOT_WALL'
                    ? 'bg-amber-600 text-white border border-amber-700'
                    : 'bg-sky-500 text-white border border-sky-600'
                }`}
              >
                <span>{idx + 1}.</span>
                {getCommandBadge(cmd)}
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
        <div className="w-full max-w-md mb-3">
          {currentGrade === 3 && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addCommand('FORWARD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2.5 px-2 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowUp className="w-5 h-5 text-sky-600" />
                <span>1歩すすむ</span>
                <span className="text-[10px] text-sky-600/80 font-normal">正面へ1マス</span>
              </button>
              <button
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-5 h-5 text-amber-600" />
                <span>左を向く</span>
                <span className="text-[10px] text-amber-700/80 font-normal">左に90°回転</span>
              </button>
              <button
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2.5 px-2 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs sm:text-sm flex flex-col items-center gap-0.5 shadow-sm active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-5 h-5 text-indigo-600" />
                <span>右を向く</span>
                <span className="text-[10px] text-indigo-700/80 font-normal">右に90°回転</span>
              </button>
            </div>
          )}

          {currentGrade === 4 && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addCommand('FORWARD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4 text-sky-600" />
                <span>1歩すすむ</span>
                <span className="text-[9px] text-sky-600/80 font-normal">正面へ1マス</span>
              </button>
              <button
                onClick={() => addCommand('FORWARD_2')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <FastForward className="w-4 h-4 text-emerald-600" />
                <span>👟 2歩すすむ</span>
                <span className="text-[9px] text-emerald-700/80 font-normal">直線2マス</span>
              </button>
              <button
                onClick={() => addCommand('FORWARD_3')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>🚀 3歩ダッシュ</span>
                <span className="text-[9px] text-amber-700/80 font-normal">直線3マス</span>
              </button>
              <button
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>左を向く</span>
                <span className="text-[9px] text-amber-700/80 font-normal">左90°回転</span>
              </button>
              <button
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span>右を向く</span>
                <span className="text-[9px] text-indigo-700/80 font-normal">右90°回転</span>
              </button>
              <button
                onClick={() => addCommand('LOOP_FWD_RIGHT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-300 text-purple-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <Repeat className="w-4 h-4 text-purple-600" />
                <span>🔁 前進+右折</span>
                <span className="text-[9px] text-purple-700/80 font-normal">前進して右向く</span>
              </button>
            </div>
          )}

          {currentGrade === 5 && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addCommand('FORWARD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4 text-sky-600" />
                <span>1歩すすむ</span>
                <span className="text-[9px] text-sky-600/80 font-normal">正面へ1マス</span>
              </button>
              <button
                onClick={() => addCommand('FORWARD_2')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <FastForward className="w-4 h-4 text-emerald-600" />
                <span>👟 2歩すすむ</span>
                <span className="text-[9px] text-emerald-700/80 font-normal">直線2マス</span>
              </button>
              <button
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>左を向く</span>
                <span className="text-[9px] text-amber-700/80 font-normal">左90°回転</span>
              </button>
              <button
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span>右を向く</span>
                <span className="text-[9px] text-indigo-700/80 font-normal">右90°回転</span>
              </button>
              <button
                onClick={() => addCommand('IF_WALL_RIGHT_ELSE_FWD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-900 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-rose-600" />
                <span>🔀 壁なら右折</span>
                <span className="text-[9px] text-rose-700/80 font-normal">道なら前進</span>
              </button>
              <button
                onClick={() => addCommand('IF_WALL_LEFT_ELSE_FWD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-900 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-rose-600" />
                <span>🔀 壁なら左折</span>
                <span className="text-[9px] text-rose-700/80 font-normal">道なら前進</span>
              </button>
            </div>
          )}

          {currentGrade === 6 && (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addCommand('FORWARD')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4 text-sky-600" />
                <span>1歩すすむ</span>
                <span className="text-[9px] text-sky-600/80 font-normal">正面へ1マス</span>
              </button>
              <button
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4 text-amber-600" />
                <span>左を向く</span>
                <span className="text-[9px] text-amber-700/80 font-normal">左90°回転</span>
              </button>
              <button
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="py-2 px-1.5 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-800 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span>右を向く</span>
                <span className="text-[9px] text-indigo-700/80 font-normal">右90°回転</span>
              </button>
              <button
                onClick={() => addCommand('WHILE_NOT_WALL')}
                disabled={isRunning || commands.length >= maze.maxCommands}
                className="col-span-1 py-2 px-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-900 rounded-2xl font-black text-xs flex flex-col items-center gap-0.5 shadow-xs active:scale-95 transition-all disabled:opacity-40"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>🚀 壁まで直進</span>
                <span className="text-[9px] text-amber-700/80 font-normal">壁の手前で停止</span>
              </button>
              <button
                onClick={() => addCommand('CALL_F1')}
                disabled={isRunning || commands.length >= maze.maxCommands || f1Commands.length === 0}
                className="col-span-2 py-2 px-2 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-40"
              >
                <Box className="w-4 h-4 text-yellow-300" />
                <span>📦 関数 F1 を実行！</span>
                <span className="text-[10px] text-purple-200">({f1Commands.length}命令)</span>
              </button>
            </div>
          )}
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
