import { GameState } from '@/lib/types';

// ============================================
// 주사위 및 스탯
// ============================================

export function rollDice(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function getStatBonus(statValue: number): number {
  return Math.floor((statValue - 10) / 2);
}

export function rollWithStat(statValue: number): number {
  return rollDice() + getStatBonus(statValue);
}

// ============================================
// 턴 처리
// ============================================

export function processTurn(state: GameState): GameState {
  let newState = { ...state, turnCount: state.turnCount + 1 };

  // 식량 소모
  newState.resources = { ...newState.resources, food: newState.resources.food - 1 };

  // 식량 부족 시 체력 감소
  if (newState.resources.food < 0) {
    newState.resources = { ...newState.resources, food: 0 };
    newState.player = {
      ...newState.player,
      health: Math.max(0, newState.player.health - 10),
    };
  }

  // 오염도 계산
  let pollutionIncrease = 2;
  if (newState.worldTree >= 50) pollutionIncrease -= 1;
  if (newState.worldTree >= 75) pollutionIncrease -= 1;

  newState.pollution = Math.max(0, Math.min(100, newState.pollution + pollutionIncrease));

  return newState;
}

// ============================================
// 초기 상태
// ============================================

export function createInitialState(): GameState {
  return {
    pollution: 20,
    worldTree: 5,
    currentScenarioId: 'intro_01',
    echoTrust: 50,
    flags: {},
    turnCount: 0,
    dangerLevel: 0,
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
  };
}