'use client';

import { useState, useEffect } from 'react';

// ============================================
// 타입 정의
// ============================================

type Speaker = 'narrator' | 'echo' | 'ludwig';

interface GameState {
  pollution: number;        // 오염도 0-100
  worldTree: number;        // 세계수 0-100
  food: number;
  manaFragment: number;
  purifyingWater: number;
  currentScenarioId: string;
  echoTrust: number;        // 0-100
  flags: Record<string, boolean>;
}

interface Choice {
  id: string;
  text: string;
  nextId?: string;
  diceCheck?: number;       // 주사위 목표값 (없으면 판정 안 함)
  successId?: string;
  failureId?: string;
  effect?: (state: GameState) => GameState;
  condition?: (state: GameState) => boolean;
  disabled?: (state: GameState) => boolean;
}

interface Scenario {
  id: string;
  speaker: Speaker;
  text: string | ((state: GameState) => string);
  choices: Choice[];
}

// ============================================
// 시나리오 데이터
// ============================================

const scenarios: Scenario[] = [
  {
    id: 'intro_01',
    speaker: 'narrator',
    text: '어둠 속에서 깨어난다. 머리가 지끈거린다. 여기가... 어디지?',
    choices: [
      {
        id: 'look_around',
        text: '주변을 둘러본다',
        nextId: 'intro_02',
      },
    ],
  },
  {
    id: 'intro_02',
    speaker: 'narrator',
    text: '희미한 마법 결정의 빛이 지하 공간을 비춘다. 벽에는 "비상 대피소 7구역"이라는 글씨가 보인다. 당신의 품에는 작은 화분이 있고, 그 안에는 작은 새싹이 자라고 있다.',
    choices: [
      {
        id: 'check_sprout',
        text: '새싹을 살펴본다',
        nextId: 'intro_03',
      },
    ],
  },
  {
    id: 'intro_03',
    speaker: 'echo',
    text: '...안녕하세요. 깨어나셨군요.',
    choices: [
      {
        id: 'startled',
        text: '깜짝 놀라 뒤로 물러난다',
        nextId: 'intro_04',
      },
      {
        id: 'calm',
        text: '"당신은... 누구죠?"',
        nextId: 'intro_04',
        effect: (state) => ({ ...state, echoTrust: state.echoTrust + 5 }),
      },
    ],
  },
  {
    id: 'intro_04',
    speaker: 'echo',
    text: '제 이름은 에코예요. 당신 품에 있는 세계수의... 영혼이라고 할 수 있죠. 당신의 이름은 기억하시나요?',
    choices: [
      {
        id: 'try_remember',
        text: '기억을 더듬어본다 (주사위 굴리기)',
        diceCheck: 12,
        successId: 'intro_05_success',
        failureId: 'intro_05_failure',
      },
    ],
  },
  {
    id: 'intro_05_failure',
    speaker: 'narrator',
    text: '머릿속이 하얗다. 아무것도 기억나지 않는다.',
    choices: [
      {
        id: 'continue',
        text: '에코를 바라본다',
        nextId: 'intro_06',
      },
    ],
  },
  {
    id: 'intro_05_success',
    speaker: 'narrator',
    text: '어렴풋이... 이름 하나가 떠오른다. "루드비히..." 맞다, 당신의 이름은 루드비히다.',
    choices: [
      {
        id: 'continue',
        text: '에코를 바라본다',
        nextId: 'intro_06',
        effect: (state) => ({
          ...state,
          flags: { ...state.flags, rememberedName: true },
        }),
      },
    ],
  },
  {
    id: 'intro_06',
    speaker: 'echo',
    text: (state) =>
      state.flags.rememberedName
        ? '루드비히... 맞아요. 좋은 이름이에요. 자, 이제 일어나야 해요. 위는 위험하지만... 이대로 있을 수는 없어요.'
        : '괜찮아요, 천천히 기억날 거예요. 자, 이제 일어나야 해요. 위는 위험하지만... 이대로 있을 수는 없어요.',
    choices: [
      {
        id: 'ask_danger',
        text: '"무슨 위험이죠?"',
        nextId: 'intro_07',
      },
      {
        id: 'get_up',
        text: '일어나 출구를 향한다',
        nextId: 'intro_07',
      },
    ],
  },
  {
    id: 'intro_07',
    speaker: 'echo',
    text: '이 도시는... 무너졌어요. 검은 오염이 모든 걸 집어삼키고 있죠. 하지만 우리에겐 희망이 있어요. 이 세계수를요.',
    choices: [
      {
        id: 'continue',
        text: '계속 듣는다',
        nextId: 'intro_08',
      },
    ],
  },
  {
    id: 'intro_08',
    speaker: 'echo',
    text: '세계수를 키우면... 이 오염을 정화할 수 있어요. 하지만 쉽지 않을 거예요. 위험한 곳을 탐험하고, 자원을 모으고, 오염과 싸워야 해요.',
    choices: [
      {
        id: 'accept',
        text: '"알겠어요. 해보죠."',
        nextId: 'tutorial_01',
      },
      {
        id: 'hesitate',
        text: '"...정말 가능할까요?"',
        nextId: 'tutorial_01',
        effect: (state) => ({ ...state, echoTrust: state.echoTrust - 3 }),
      },
    ],
  },
  {
    id: 'tutorial_01',
    speaker: 'echo',
    text: '일단 이 대피소부터 나가야 해요. 위로 올라가는 계단이 저기 있어요. 하지만... 위험할 수 있어요.',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'exploration_hub',
        effect: (state) => ({
          ...state,
          pollution: state.pollution + 5,
          flags: { ...state.flags, tutorial_complete: true },
        }),
      },
    ],
  },
  {
    id: 'exploration_hub',
    speaker: 'narrator',
    text: (state) =>
      `지상으로 나왔다. 폐허가 된 도시가 눈앞에 펼쳐진다. 검은 안개가 곳곳에 퍼져있다.\n\n오염도: ${state.pollution}% | 세계수: ${state.worldTree}% | 식량: ${state.food}`,
    choices: [
      {
        id: 'explore_ruins',
        text: '탑의 폐허를 탐험한다',
        diceCheck: 10,
        successId: 'found_resources',
        failureId: 'danger_encounter',
      },
      {
        id: 'rest',
        text: '잠시 휴식을 취한다 (식량 -1)',
        nextId: 'rest_result',
        disabled: (state) => state.food < 1,
        effect: (state) => ({
          ...state,
          food: state.food - 1,
          pollution: Math.max(0, state.pollution - 3),
        }),
      },
      {
        id: 'water_tree',
        text: '세계수에 정화수를 준다 (정화수 -1)',
        nextId: 'water_tree_result',
        disabled: (state) => state.purifyingWater < 1,
        effect: (state) => ({
          ...state,
          purifyingWater: state.purifyingWater - 1,
          worldTree: Math.min(100, state.worldTree + 10),
          pollution: Math.max(0, state.pollution - 5),
        }),
      },
    ],
  },
  {
    id: 'found_resources',
    speaker: 'narrator',
    text: '폐허 속에서 보급품을 발견했다! 식량과 마력 결정을 얻었다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => ({
          ...state,
          food: state.food + 3,
          manaFragment: state.manaFragment + 1,
          pollution: state.pollution + 3,
        }),
      },
    ],
  },
  {
    id: 'danger_encounter',
    speaker: 'narrator',
    text: '무너진 잔해가 갑자기 무너진다! 가까스로 피했지만 검은 안개에 노출되었다.',
    choices: [
      {
        id: 'continue',
        text: '황급히 돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => ({
          ...state,
          pollution: state.pollution + 8,
        }),
      },
    ],
  },
  {
    id: 'rest_result',
    speaker: 'echo',
    text: '조금 나아진 것 같아요. 하지만... 시간이 지날수록 오염은 퍼져가고 있어요.',
    choices: [
      {
        id: 'continue',
        text: '다시 일어선다',
        nextId: 'exploration_hub',
        effect: (state) => ({
          ...state,
          pollution: state.pollution + 2,
        }),
      },
    ],
  },
  {
    id: 'water_tree_result',
    speaker: 'echo',
    text: '세계수가... 자라고 있어요! 주변의 오염이 조금씩 걷히는 게 느껴져요.',
    choices: [
      {
        id: 'continue',
        text: (state) =>
          state.worldTree >= 100
            ? '세계수를 바라본다'
            : '계속 탐험한다',
        nextId: (state: GameState) =>
          state.worldTree >= 100 ? 'ending_good' : 'exploration_hub',
      } as any, // 간단한 구현을 위해
    ],
  },
  {
    id: 'ending_good',
    speaker: 'echo',
    text: '세계수가 완전히 자랐어요! 푸른 빛이 도시 전체를 감싸며 오염이 사라지기 시작합니다. 우리가... 해냈어요!',
    choices: [
      {
        id: 'ending',
        text: '[게임 클리어 - 새로 시작하기]',
        nextId: 'intro_01',
        effect: () => createInitialState(),
      },
    ],
  },
];

// ============================================
// 초기 상태
// ============================================

function createInitialState(): GameState {
  return {
    pollution: 20,
    worldTree: 5,
    food: 10,
    manaFragment: 3,
    purifyingWater: 5,
    currentScenarioId: 'intro_01',
    echoTrust: 50,
    flags: {},
  };
}

// ============================================
// 유틸 함수
// ============================================

function rollDice(): number {
  return Math.floor(Math.random() * 20) + 1;
}

// ============================================
// 메인 게임 컴포넌트
// ============================================

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);

  const currentScenario = scenarios.find(
    (s) => s.id === gameState.currentScenarioId
  );

  // 타이핑 효과
  useEffect(() => {
    if (!currentScenario) return;

    const text =
      typeof currentScenario.text === 'function'
        ? currentScenario.text(gameState)
        : currentScenario.text;

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [currentScenario, gameState]);

  const handleChoice = (choice: Choice) => {
    // 비활성화 체크
    if (choice.disabled && choice.disabled(gameState)) return;

    // 주사위 판정이 필요한 경우
    if (choice.diceCheck) {
      setPendingChoice(choice);
      setShowDice(true);
      setTimeout(() => {
        const result = rollDice();
        setDiceResult(result);
        setTimeout(() => {
          const success = result >= (choice.diceCheck || 0);
          const nextId = success ? choice.successId : choice.failureId;
          if (nextId) {
            let newState = { ...gameState, currentScenarioId: nextId };
            if (choice.effect) {
              newState = choice.effect(newState);
            }
            setGameState(newState);
          }
          setShowDice(false);
          setDiceResult(null);
          setPendingChoice(null);
        }, 2000);
      }, 500);
      return;
    }

    // 일반 선택
    let newState = { ...gameState };
    
    if (choice.effect) {
      newState = choice.effect(newState);
    }
    
    if (choice.nextId) {
      newState.currentScenarioId = choice.nextId;
    }

    setGameState(newState);
  };

  const skipTyping = () => {
    if (!currentScenario || !isTyping) return;
    const text =
      typeof currentScenario.text === 'function'
        ? currentScenario.text(gameState)
        : currentScenario.text;
    setDisplayedText(text);
    setIsTyping(false);
  };

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">시나리오를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const speakerName = {
    narrator: '나레이터',
    echo: '에코',
    ludwig: '루드비히',
  }[currentScenario.speaker];

  const getSpeakerColor = () => {
    switch (currentScenario.speaker) {
      case 'echo':
        return 'text-green-400';
      case 'ludwig':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      {/* 상태바 */}
      <div className="bg-gray-950 bg-opacity-80 p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-400">오염도</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${gameState.pollution}%` }}
                />
              </div>
              <span className="text-red-400 font-bold">{gameState.pollution}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-400">세계수</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${gameState.worldTree}%` }}
                />
              </div>
              <span className="text-green-400 font-bold">{gameState.worldTree}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-400">식량</div>
            <div className="text-yellow-400 font-bold">{gameState.food}</div>
          </div>
          <div>
            <div className="text-gray-400">마력결정</div>
            <div className="text-purple-400 font-bold">{gameState.manaFragment}</div>
          </div>
          <div>
            <div className="text-gray-400">정화수</div>
            <div className="text-blue-400 font-bold">{gameState.purifyingWater}</div>
          </div>
        </div>
      </div>

      {/* 메인 게임 영역 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          {/* 텍스트 표시 */}
          <div
            className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-6 min-h-[200px] cursor-pointer border border-gray-700"
            onClick={skipTyping}
          >
            <div className={`font-bold mb-3 ${getSpeakerColor()}`}>
              {speakerName}
            </div>
            <div className="text-lg leading-relaxed whitespace-pre-line">
              {displayedText}
              {isTyping && <span className="animate-pulse">▊</span>}
            </div>
          </div>

          {/* 주사위 표시 */}
          {showDice && (
            <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-6 text-center border border-yellow-500">
              <div className="text-2xl mb-4">🎲 주사위를 굴립니다...</div>
              {diceResult !== null && (
                <div>
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    {diceResult}
                  </div>
                  <div className="text-lg">
                    {pendingChoice && diceResult >= (pendingChoice.diceCheck || 0) ? (
                      <span className="text-green-400">✓ 성공!</span>
                    ) : (
                      <span className="text-red-400">✗ 실패...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 선택지 */}
          {!isTyping && !showDice && (
            <div className="grid gap-3">
              {currentScenario.choices.map((choice) => {
                const isDisabled = choice.disabled && choice.disabled(gameState);
                const isHidden = choice.condition && !choice.condition(gameState);

                if (isHidden) return null;

                return (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    disabled={isDisabled}
                    className={`
                      p-4 rounded-lg text-left transition-all
                      ${
                        isDisabled
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {typeof choice.text === 'function'
                          ? choice.text(gameState)
                          : choice.text}
                      </span>
                      {choice.diceCheck && !isDisabled && (
                        <span className="text-yellow-400 text-sm ml-2">
                          🎲 목표: {choice.diceCheck}+
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 게임 오버 체크 */}
      {gameState.pollution >= 100 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-4">
              게임 오버
            </div>
            <div className="text-xl mb-6">오염이 모든 것을 집어삼켰다...</div>
            <button
              onClick={() => setGameState(createInitialState())}
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg text-lg"
            >
              다시 시작
            </button>
          </div>
        </div>
      )}

      {/* 하단 정보 */}
      <div className="bg-gray-950 bg-opacity-80 p-3 text-center text-xs text-gray-500 border-t border-gray-700">
        가시나무 탑 v0.1 - 클릭하여 텍스트 스킵 가능
      </div>
    </div>
  );
}