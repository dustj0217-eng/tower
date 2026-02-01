import { introScenarios } from './scenarios/intro';
import { shelterScenarios } from './scenarios/shelter';
import { echoTalkScenarios } from './scenarios/echo_talk';
import { explorationScenarios } from './scenarios/exploration';
import { lowerTowerScenarios } from './scenarios/lower_tower';
import { libraryScenarios } from './scenarios/library';
import { upperTowerScenarios } from './scenarios/upper_tower';
import { labScenarios } from './scenarios/lab';
import { endingScenarios } from './scenarios/ending';
import { randomEventScenarios } from './scenarios/random_events';

import type { Scenario } from './types';

export const scenarios: Scenario[] = [
  ...introScenarios,
  ...shelterScenarios,
  ...echoTalkScenarios,
  ...explorationScenarios,
  ...lowerTowerScenarios,
  ...libraryScenarios,
  ...upperTowerScenarios,
  ...labScenarios,
  ...endingScenarios,
  ...randomEventScenarios,
];

export { rollDice, rollWithStat, getStatBonus, processTurn, createInitialState } from './scenarios/logic';
export { applyResources, applyDamage, applyHeal, addFlag, applyTrust } from './scenarios/helpers';
export { tryTriggerRandomEvent } from './scenarios/random_events';
export type { Scenario, GameState } from './types';