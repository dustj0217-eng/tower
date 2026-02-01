import { Scenario, GameState } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyDamage, applyTrust, addFlag } from './helpers';

// ============================================
// 랜덤 이벤트 풀
// ============================================
// 각 이벤트는 { id, condition?, weight } 형태.
// condition이 있으면 해당 조건을 만족할 때만 후보에 포함됨.
// weight는 상대적 출현 확률 (클수록 자주).

interface RandomEventEntry {
  id: string;
  weight: number;
  condition?: (state: GameState) => boolean;
}

const RANDOM_EVENT_POOL: RandomEventEntry[] = [
  { id: 'event_abandoned_shelter',  weight: 3 },
  { id: 'event_oily_puddle',        weight: 2 },
  { id: 'event_echo_murmur',        weight: 3, condition: (s) => s.echoTrust >= 40 },
  { id: 'event_glowing_moss',       weight: 2 },
  { id: 'event_distant_scream',     weight: 2 },
  { id: 'event_collapsed_cache',    weight: 2 },
  { id: 'event_wind_chime',         weight: 1, condition: (s) => s.echoTrust >= 55 },
  { id: 'event_mutant_corpse',      weight: 2 },
  { id: 'event_pollution_surge',    weight: 1, condition: (s) => s.pollution < 80 },
  { id: 'event_child_drawing',      weight: 1 },
];

/**
 * 가중치 기반 랜덤 선택.
 * 조건을 만족하는 후보 중에서 하나를 뽑아 id를 반환.
 * 후보가 없으면 null 반환.
 */
export function pickRandomEvent(state: GameState): string | null {
  const candidates = RANDOM_EVENT_POOL.filter(
    (e) => !e.condition || e.condition(state)
  );
  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.floor(Math.random() * totalWeight);

  for (const entry of candidates) {
    roll -= entry.weight;
    if (roll < 0) return entry.id;
  }
  return candidates[candidates.length - 1].id;
}

/**
 * 탐험 시작 시 호출. 약 40% 확률로 랜덤 이벤트를 트리거.
 * 트리거되면 해당 이벤트 시나리오 id를 반환, 아니면 null.
 */
export function tryTriggerRandomEvent(state: GameState): string | null {
  if (Math.random() > 0.4) return null;
  return pickRandomEvent(state);
}

// ============================================
// 랜덤 이벤트 시나리오 정의
// ============================================

export const randomEventScenarios: Scenario[] = [
  // --- 폐허 속 작은 대피소 ---
  {
    id: 'event_abandoned_shelter',
    speaker: 'narrator',
    text: '길을 가다가 폐허 사이에 작은 텐트를 발견한다.\n안에는 아무것도 남지 않았다.\n그러나 텐트 기둥에는 누군가가 날짜를 새기고 있었다.\n\n"1일... 2일... 3일..."\n\n세 날째까지만 새겨져 있다.',
    choices: [
      {
        id: 'continue',
        text: '발걸음을 옮긴다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },

  // --- 기름 연못 ---
  {
    id: 'event_oily_puddle',
    speaker: 'narrator',
    text: '바닥에 검은 고여있는 액체가 눈에 띈다.\n오염된 마나가 땅에서 삼출되고 있는 것 같다.\n\n발을 잘못 놓으면 끈적한 오염이 몸에 붙을 것이다.',
    choices: [
      {
        id: 'avoid',
        text: '조심스럽게 우회한다 [민첩 판정]',
        diceCheck: 9,
        successId: 'event_oily_puddle_safe',
        failureId: 'event_oily_puddle_hit',
      },
      {
        id: 'jump',
        text: '뛰어넘는다 [민첩 판정]',
        diceCheck: 11,
        successId: 'event_oily_puddle_safe',
        failureId: 'event_oily_puddle_hit',
      },
    ],
  },
  {
    id: 'event_oily_puddle_safe',
    speaker: 'narrator',
    text: '간신히 피한다.\n검은 液체가 발 아래를 스치지만, 몸에는 닿지 않았다.',
    choices: [
      {
        id: 'continue',
        text: '계속 가는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'event_oily_puddle_hit',
    speaker: 'narrator',
    text: '발이 미끄러지며 검은 액체에 발목까지 빠진다.\n끈적한 오염이 피부에 붙는다.\n간신히 빠져나왔지만, 오염의 냄새가 몸에 배었다.',
    choices: [
      {
        id: 'continue',
        text: '다리를 닦고 가는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn({
          ...applyDamage(state, 8),
          pollution: Math.min(100, state.pollution + 3),
        }),
      },
    ],
  },

  // --- 에코의 조용한 말 ---
  {
    id: 'event_echo_murmur',
    speaker: 'echo',
    text: (state: GameState) => {
      // 상황에 맞게 에코의 감성적 반응을 바꾸기
      if (state.player.health < 40) {
        return '...몸이 많이 안 좋은 것 같아요.\n좀 더 조심하세요.\n제발.';
      }
      if (state.pollution > 60) {
        return '...오염이...\n빠르게 퍼져가고 있어요.\n서둘러야 해요.';
      }
      if (state.worldTree >= 40) {
        return '...세계수가.\n자라고 있어요.\n조금씩이지만... 느껴져요.';
      }
      return '...여기 바람이 불면.\n예전엔 꽃 내향이 났어요.\n이제는... 아무냄새도.';
    },
    choices: [
      {
        id: 'listen',
        text: '조용히 듣는다',
        nextId: 'exploration_choice',
        effect: (state) => applyTrust(state, 3),
      },
      {
        id: 'nod',
        text: '고개를 끄덕인다',
        nextId: 'exploration_choice',
      },
    ],
  },

  // --- 빛나는 이슬 이슬 (이수) ---
  {
    id: 'event_glowing_moss',
    speaker: 'narrator',
    text: '폐허의 벽면에 희미하게 빛나는 이슬이 맺혀있다.\n오염 속에서도 살아남은 식물의 흔적.\n\n이슬을 손가락으로 건드려본다.\n차갑고 맑은 느낌.\n마나의 향이 한다.',
    choices: [
      {
        id: 'collect',
        text: '이슬을 손에 모아 챙긴다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(applyResources(state, { purifyingWater: 1 })),
      },
      {
        id: 'leave',
        text: '그냥 두고 가는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },

  // --- 먼 곳의 비명 ---
  {
    id: 'event_distant_scream',
    speaker: 'narrator',
    text: '갑자기 먼 곳에서 비명이 들린다.\n그리고... 그 후에는 아무 소리도 안 난다.\n\n변이체인지, 아직 남은 사람인지.\n알 수 없다.',
    choices: [
      {
        id: 'ignore',
        text: '소리 쪽으로는 가지 않는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
      {
        id: 'investigate',
        text: '소리가 난 방향을 탐색한다 [지각력 판정]',
        diceCheck: 13,
        successId: 'event_distant_scream_found',
        failureId: 'event_distant_scream_empty',
      },
    ],
  },
  {
    id: 'event_distant_scream_found',
    speaker: 'narrator',
    text: '소리가 난 곳을 찾았다.\n작은 방.\n안에는 아무도 없었다.\n그러나 바닥에 마구 뒤집어진 물건들 사이에서.\n\n식량 한 개.\n그리고 낡은 마력 결정 한 조각.',
    choices: [
      {
        id: 'continue',
        text: '챙기고 돌아간다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(applyResources(state, { food: 1, manaFragment: 1 })),
      },
    ],
  },
  {
    id: 'event_distant_scream_empty',
    speaker: 'narrator',
    text: '소리가 난 곳을 찾은 것 같지만.\n아무것도 없다.\n검은 안개만.\n\n시간만 낭비한 것 같다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },

  // --- 무너진 보금 캐비넷 ---
  {
    id: 'event_collapsed_cache',
    speaker: 'narrator',
    text: '잔해 사이에서 반쯤 埋buried된 금속 캐비넷을 발견한다.\n"비상 보급함"이라는 표지가 붙어있다.\n그러나 문이 변형되어 열리지 않는다.',
    choices: [
      {
        id: 'pry',
        text: '강제로 열린다 [힘 판정]',
        diceCheck: 12,
        successId: 'event_collapsed_cache_open',
        failureId: 'event_collapsed_cache_fail',
      },
      {
        id: 'magic_open',
        text: '마법으로 문을 변형복원한다 [마법 판정, 마력결정 -1]',
        diceCheck: 9,
        successId: 'event_collapsed_cache_open',
        failureId: 'event_collapsed_cache_fail',
        disabled: (state) => state.resources.manaFragment < 1,
        effect: (state) => applyResources(state, { manaFragment: -1 }),
      },
      {
        id: 'skip',
        text: '그냥 둔다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'event_collapsed_cache_open',
    speaker: 'narrator',
    text: '캐비넷이 열린다.\n안에는 먼지 쌓인 식량 캔과 마력 결정이 들어있다.\n오래된 것이지만, 아직 쓸 수 있는 것 같다.',
    choices: [
      {
        id: 'continue',
        text: '챙기고 가는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(applyResources(state, { food: 3, manaFragment: 1 })),
      },
    ],
  },
  {
    id: 'event_collapsed_cache_fail',
    speaker: 'narrator',
    text: '문은 움직이지 않는다.\n강제로 열린다가 오히려 잔해가 무너져 팔에 먼지와 파편이 떨어진다.',
    choices: [
      {
        id: 'continue',
        text: '먼지를 털고 가는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(applyDamage(state, 5)),
      },
    ],
  },

  // --- 바람 종소리 (에코와의 고요한 순간) ---
  {
    id: 'event_wind_chime',
    speaker: 'narrator',
    text: '폐허의 높은 곳에서 조용한 종소리가 들린다.\n바람이 불면 금속 잔해들이 부딪히면서 생기는 소리.\n\n오히려... 아름답다.\n\n에코도 듣고 있는 것 같다.\n새싹이 가벼운 빛으로 한번 깜빡인다.',
    choices: [
      {
        id: 'listen',
        text: '잠시 귀를 기울인다',
        nextId: 'exploration_choice',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },

  // --- 변이체의 시체 ---
  {
    id: 'event_mutant_corpse',
    speaker: 'narrator',
    text: '길 가로에 변이체의 시체가 남아있다.\n이미 오래된 것 같다.\n검은 안개가 주변에 얇게 깔려있다.\n\n시체 옆에는 깨진 마력 결정 조각이 몇 개 떨어져 있다.',
    choices: [
      {
        id: 'collect',
        text: '마력 결정 조각을 챙긴다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(applyResources(state, { manaFragment: 1 })),
      },
      {
        id: 'leave',
        text: '그냥 지나간다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },

  // --- 오염 급증 ---
  {
    id: 'event_pollution_surge',
    speaker: 'narrator',
    text: '갑자기 주변의 검은 안개가 짙어진다.\n탑의 방향으로부터 검은 파동이 밀려온다.\n\n몸이 무거워지고, 머리가 지끈거린다.\n오염이 급격히 퍼지고 있다.',
    choices: [
      {
        id: 'endure',
        text: '버티는다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn({
          ...applyDamage(state, 5),
          pollution: Math.min(100, state.pollution + 8),
        }),
      },
      {
        id: 'shield',
        text: '마법으로 몸을 보호한다 [마력결정 -1]',
        nextId: 'exploration_choice',
        disabled: (state) => state.resources.manaFragment < 1,
        effect: (state) => processTurn({
          ...applyResources(state, { manaFragment: -1 }),
          pollution: Math.min(100, state.pollution + 3),
        }),
      },
    ],
  },

  // --- 아이의 그림 ---
  {
    id: 'event_child_drawing',
    speaker: 'narrator',
    text: '무너진 벽면에 그림이 남아있다.\n아이가 그린 것 같다.\n작은 집.\n그리고 위로 뻗은 큰 나무.\n파란 하늘.\n\n오염과 폐허 속에서, 이 그림만은 아직 깨끗하다.',
    choices: [
      {
        id: 'continue',
        text: '그림을 바라본다',
        nextId: 'exploration_choice',
        effect: (state) => processTurn(state),
      },
    ],
  },
];