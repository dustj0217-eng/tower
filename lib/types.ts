export type Speaker = 'narrator' | 'echo' | 'ludwig';

export interface GameState {
  pollution: number;        // 오염도 0-100
  worldTree: number;        // 세계수 0-100
  currentScenarioId: string;
  echoTrust: number;        // 0-100
  flags: Record<string, boolean>;
  turnCount: number;        // 턴 수
  visitedRooms?: string[]
  
  // 자원
  resources: {
    food: number;
    manaFragment: number;
    purifyingWater: number;
    soulFragment: number;   // 영혼의 파편 (희귀)
  };
  
  // 주인공 스탯
  player: {
    name: string;
    health: number;
    maxHealth: number;
    strength: number;       // 힘 (전투)
    agility: number;        // 민첩 (회피)
    magic: number;          // 마법
    perception: number;     // 감지 (자원 발견)
  };
  
  // 탐험 상태
  dangerLevel: number;      // 현재 위험도
}

export interface Choice {
  id: string;
  text: string | ((state: GameState) => string);
  nextId?: string | ((state: GameState) => string);
  diceCheck?: number;       // 주사위 목표값 (없으면 판정 안 함)
  successId?: string;
  failureId?: string;
  effect?: (state: GameState) => GameState;
  condition?: (state: GameState) => boolean;
  disabled?: (state: GameState) => boolean;
}

export interface Scenario {
  id: string;
  speaker: Speaker;
  text: string | ((state: GameState) => string);
  choices: Choice[];
  onEnter?: (state: GameState) => string | null; 
}