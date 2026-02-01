import { GameState, Scenario } from './types';

// ============================================
// 게임 로직 함수들
// ============================================

export function rollDice(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function getStatBonus(statValue: number): number {
  // D&D 스타일: (스탯 - 10) / 2
  return Math.floor((statValue - 10) / 2);
}

export function rollWithStat(statValue: number): number {
  const roll = rollDice();
  const bonus = getStatBonus(statValue);
  return roll + bonus;
}

export function processTurn(state: GameState): GameState {
  let newState = { ...state };
  newState.turnCount += 1;
  
  // 식량 소모
  newState.resources.food -= 1;
  
  // 식량 부족 시 체력 감소
  if (newState.resources.food < 0) {
    newState.resources.food = 0;
    newState.player.health = Math.max(0, newState.player.health - 10);
  }
  
  // 오염도 증가 (기본)
  let pollutionIncrease = 2;
  
  // 세계수에 따라 오염도 감소 효과
  if (newState.worldTree >= 75) {
    pollutionIncrease -= 2;
  } else if (newState.worldTree >= 50) {
    pollutionIncrease -= 1;
  } else if (newState.worldTree >= 25) {
    pollutionIncrease -= 1;
  }
  
  newState.pollution = Math.max(0, Math.min(100, newState.pollution + pollutionIncrease));
  
  return newState;
}

export function createInitialState(): GameState {
  return {
    pollution: 20,
    worldTree: 5,
    currentScenarioId: 'intro_01',
    echoTrust: 50,
    flags: {},
    turnCount: 0,
    
    resources: {
      food: 15,
      manaFragment: 5,
      purifyingWater: 3,
      soulFragment: 0,
    },
    
    player: {
      name: '루드비히',
      health: 100,
      maxHealth: 100,
      strength: 12,
      agility: 10,
      magic: 14,
      perception: 11,
    },
    
    dangerLevel: 0,
  };
}

// ============================================
// 시나리오 데이터
// ============================================

export const scenarios: Scenario[] = [
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
      `지상으로 나왔다. 폐허가 된 도시가 눈앞에 펼쳐진다. 검은 안개가 곳곳에 퍼져있다.\n\n턴: ${state.turnCount} | 체력: ${state.player.health}/${state.player.maxHealth}`,
    choices: [
      {
        id: 'explore_lower',
        text: '탑 하층부 탐험 (위험도: 낮음)',
        nextId: 'explore_lower_tower',
        effect: (state) => ({ ...state, dangerLevel: 1 }),
      },
      {
        id: 'explore_upper',
        text: '탑 상층부 탐험 (위험도: 중간)',
        nextId: 'explore_upper_tower',
        effect: (state) => ({ ...state, dangerLevel: 2 }),
        condition: (state) => state.worldTree >= 20,
      },
      {
        id: 'rest',
        text: '휴식을 취한다 (식량 -2, 체력 +20)',
        nextId: 'rest_result',
        disabled: (state) => state.resources.food < 2,
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            food: state.resources.food - 2,
          },
          player: {
            ...state.player,
            health: Math.min(state.player.maxHealth, state.player.health + 20),
          },
        }),
      },
      {
        id: 'water_tree',
        text: '세계수에 정화수를 준다 (정화수 -1, 세계수 +10)',
        nextId: 'water_tree_result',
        disabled: (state) => state.resources.purifyingWater < 1,
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            purifyingWater: state.resources.purifyingWater - 1,
          },
          worldTree: Math.min(100, state.worldTree + 10),
          pollution: Math.max(0, state.pollution - 5),
        }),
      },
      {
        id: 'purify_water',
        text: '마력으로 물을 정화한다 (마력결정 -2, 정화수 +1)',
        nextId: 'purify_water_result',
        disabled: (state) => state.resources.manaFragment < 2,
        effect: (state) => ({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment - 2,
            purifyingWater: state.resources.purifyingWater + 1,
          },
        }),
      },
    ],
  },
  {
    id: 'explore_lower_tower',
    speaker: 'narrator',
    text: '무너진 탑의 하층부로 들어간다. 검은 안개가 희미하게 퍼져있다...',
    choices: [
      {
        id: 'careful_search',
        text: '조심스럽게 탐색한다 (감지 판정)',
        diceCheck: 10,
        successId: 'exploration_success_lower',
        failureId: 'encounter_monster_weak',
      },
      {
        id: 'back',
        text: '돌아간다',
        nextId: 'exploration_hub',
      },
    ],
  },
  {
    id: 'explore_upper_tower',
    speaker: 'narrator',
    text: '탑의 상층부는 더욱 위험해 보인다. 마법의 흔적과 함께 진한 오염이 느껴진다.',
    choices: [
      {
        id: 'search_magic',
        text: '마법 흔적을 추적한다 (마법 판정)',
        diceCheck: 12,
        successId: 'found_mana_fragments',
        failureId: 'encounter_monster_strong',
      },
      {
        id: 'back',
        text: '돌아간다',
        nextId: 'exploration_hub',
      },
    ],
  },
  {
    id: 'exploration_success_lower',
    speaker: 'narrator',
    text: '안전하게 주변을 둘러본다. 무너진 잔해 사이로 무언가 보인다.',
    choices: [
      {
        id: 'search_supplies',
        text: '보급품을 찾는다',
        diceCheck: 8,
        successId: 'found_supplies',
        failureId: 'found_little',
      },
    ],
  },
  {
    id: 'found_supplies',
    speaker: 'narrator',
    text: '보급 상자를 발견했다! 식량과 약간의 마력 결정이 들어있다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            food: state.resources.food + 5,
            manaFragment: state.resources.manaFragment + 2,
          },
        }),
      },
    ],
  },
  {
    id: 'found_little',
    speaker: 'narrator',
    text: '별다른 것을 발견하지 못했다. 약간의 식량만 찾았다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            food: state.resources.food + 2,
          },
        }),
      },
    ],
  },
  {
    id: 'found_mana_fragments',
    speaker: 'narrator',
    text: '마법진의 잔해를 발견했다! 상당량의 마력 결정을 회수했다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment + 5,
          },
        }),
      },
    ],
  },
  {
    id: 'encounter_monster_weak',
    speaker: 'narrator',
    text: '검은 안개가 뭉쳐지더니 괴물의 형상을 이룬다! 약한 변이체가 나타났다.',
    choices: [
      {
        id: 'fight',
        text: '싸운다 (힘 판정)',
        diceCheck: 10,
        successId: 'combat_win_weak',
        failureId: 'combat_injured',
      },
      {
        id: 'flee',
        text: '도망친다 (민첩 판정)',
        diceCheck: 12,
        successId: 'escape_success',
        failureId: 'escape_failed',
      },
      {
        id: 'magic',
        text: '마법으로 공격한다 (마법 판정, 마력결정 -1)',
        diceCheck: 8,
        successId: 'magic_win_weak',
        failureId: 'magic_failed',
        disabled: (state) => state.resources.manaFragment < 1,
        effect: (state) => ({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment - 1,
          },
        }),
      },
    ],
  },
  {
    id: 'encounter_monster_strong',
    speaker: 'narrator',
    text: '강력한 오염 괴물이 나타났다! 탑의 주인이었던 마법사가 변이한 것 같다.',
    choices: [
      {
        id: 'fight',
        text: '싸운다 (힘 판정)',
        diceCheck: 15,
        successId: 'combat_win_strong',
        failureId: 'combat_heavy_injury',
      },
      {
        id: 'flee',
        text: '도망친다 (민첩 판정)',
        diceCheck: 14,
        successId: 'escape_success',
        failureId: 'escape_failed_strong',
      },
      {
        id: 'magic',
        text: '마법으로 공격한다 (마법 판정, 마력결정 -2)',
        diceCheck: 12,
        successId: 'magic_win_strong',
        failureId: 'magic_failed_strong',
        disabled: (state) => state.resources.manaFragment < 2,
        effect: (state) => ({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment - 2,
          },
        }),
      },
    ],
  },
  {
    id: 'combat_win_weak',
    speaker: 'narrator',
    text: '변이체를 처치했다! 약간의 마력 결정을 얻었다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment + 2,
          },
          player: {
            ...state.player,
            health: state.player.health - 5,
          },
        }),
      },
    ],
  },
  {
    id: 'combat_win_strong',
    speaker: 'narrator',
    text: '격렬한 전투 끝에 강력한 괴물을 쓰러뜨렸다! 영혼의 파편을 발견했다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment + 3,
            soulFragment: state.resources.soulFragment + 1,
          },
          player: {
            ...state.player,
            health: state.player.health - 15,
          },
        }),
      },
    ],
  },
  {
    id: 'combat_injured',
    speaker: 'narrator',
    text: '간신히 쓰러뜨렸지만 심하게 다쳤다!',
    choices: [
      {
        id: 'continue',
        text: '황급히 돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment + 1,
          },
          player: {
            ...state.player,
            health: state.player.health - 20,
          },
        }),
      },
    ],
  },
  {
    id: 'combat_heavy_injury',
    speaker: 'narrator',
    text: '간신히 격퇴했지만 치명상을 입었다!',
    choices: [
      {
        id: 'continue',
        text: '비틀거리며 돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          player: {
            ...state.player,
            health: Math.max(1, state.player.health - 35),
          },
        }),
      },
    ],
  },
  {
    id: 'escape_success',
    speaker: 'narrator',
    text: '재빠르게 도망쳐 안전한 곳으로 돌아왔다.',
    choices: [
      {
        id: 'continue',
        text: '숨을 고른다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'escape_failed',
    speaker: 'narrator',
    text: '도망치다가 공격을 받았다!',
    choices: [
      {
        id: 'continue',
        text: '간신히 벗어난다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          player: {
            ...state.player,
            health: state.player.health - 15,
          },
        }),
      },
    ],
  },
  {
    id: 'escape_failed_strong',
    speaker: 'narrator',
    text: '강력한 괴물에게 붙잡혀 중상을 입었다!',
    choices: [
      {
        id: 'continue',
        text: '필사적으로 도망친다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          player: {
            ...state.player,
            health: Math.max(1, state.player.health - 30),
          },
        }),
      },
    ],
  },
  {
    id: 'magic_win_weak',
    speaker: 'narrator',
    text: '마법 공격이 적중했다! 변이체가 빛과 함께 사라진다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            manaFragment: state.resources.manaFragment + 1,
          },
        }),
      },
    ],
  },
  {
    id: 'magic_win_strong',
    speaker: 'narrator',
    text: '강력한 마법으로 괴물을 정화했다! 영혼의 파편을 얻었다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          resources: {
            ...state.resources,
            soulFragment: state.resources.soulFragment + 1,
          },
          player: {
            ...state.player,
            health: state.player.health - 5,
          },
        }),
      },
    ],
  },
  {
    id: 'magic_failed',
    speaker: 'narrator',
    text: '마법이 빗나갔다! 괴물이 덤벼든다!',
    choices: [
      {
        id: 'continue',
        text: '간신히 격퇴한다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          player: {
            ...state.player,
            health: state.player.health - 25,
          },
        }),
      },
    ],
  },
  {
    id: 'magic_failed_strong',
    speaker: 'narrator',
    text: '마법이 통하지 않는다! 중상을 입었다!',
    choices: [
      {
        id: 'continue',
        text: '필사적으로 도망친다',
        nextId: 'exploration_hub',
        effect: (state) => processTurn({
          ...state,
          player: {
            ...state.player,
            health: Math.max(1, state.player.health - 40),
          },
        }),
      },
    ],
  },
  {
    id: 'purify_water_result',
    speaker: 'echo',
    text: '마력을 사용해 오염된 물을 정화했어요. 이제 세계수에게 줄 수 있어요.',
    choices: [
      {
        id: 'continue',
        text: '계속한다',
        nextId: 'exploration_hub',
      },
    ],
  },
  {
    id: 'rest_result',
    speaker: 'echo',
    text: (state) => `조금 나아진 것 같아요. 하지만... 시간이 지날수록 오염은 퍼져가고 있어요.\n\n회복량: +20 체력`,
    choices: [
      {
        id: 'continue',
        text: '다시 일어선다',
        nextId: 'exploration_hub',
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
      },
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