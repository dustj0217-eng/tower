import { GameState } from '@/lib/types';

/**
 * resources 필드만 부분 업데이트.
 * delta 값은 절대값이 아니라 변화분(+/-)으로 적용됩니다.
 */
export function applyResources(
  state: GameState,
  delta: Partial<Record<keyof GameState['resources'], number>>
): GameState {
  const updated = { ...state.resources };
  for (const [key, val] of Object.entries(delta)) {
    updated[key as keyof typeof updated] += val;
  }
  return { ...state, resources: updated };
}

/**
 * player.health에 피해를 적용. 최소 0으로 클램핑.
 */
export function applyDamage(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      health: Math.max(0, state.player.health - amount),
    },
  };
}

/**
 * player.health 회복. maxHealth를 초과하지 않음.
 */
export function applyHeal(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      health: Math.min(state.player.maxHealth, state.player.health + amount),
    },
  };
}

/**
 * flags에 새 플래그를 추가.
 */
export function addFlag(state: GameState, flag: string): GameState {
  return {
    ...state,
    flags: { ...state.flags, [flag]: true },
  };
}

/**
 * echoTrust 변화분 적용.
 */
export function applyTrust(state: GameState, delta: number): GameState {
  return { ...state, echoTrust: state.echoTrust + delta };
}