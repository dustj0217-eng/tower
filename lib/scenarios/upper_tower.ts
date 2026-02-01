import { Scenario } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyDamage } from './helpers';

export const upperTowerScenarios: Scenario[] = [
  {
    id: 'explore_upper_tower',
    speaker: 'narrator',
    text: '탑의 상층부는 더욱 위험해 보인다.\n마법의 흔적과 함께 진한 오염이 느껴진다.\n\n계단을 오를수록 검은 안개가 짙어진다.',
    choices: [
      {
        id: 'magic_trace',
        text: '마법 흔적을 추적한다 [마법 판정]',
        diceCheck: 12,
        successId: 'upper_tower_magic',
        failureId: 'encounter_corrupted_mage',
      },
      { id: 'back', text: '돌아간다', nextId: 'exploration_choice' },
    ],
  },
  {
    id: 'upper_tower_magic',
    speaker: 'narrator',
    text: '마법의 흔적을 따라간다.\n벽에 새겨진 마법진들이 여전히 희미하게 빛나고 있다.\n\n한 방에 도착했다.\n마법진의 잔해.\n그리고 상당량의 마력 결정.',
    choices: [
      {
        id: 'collect',
        text: '마력 결정을 회수한다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyResources(state, { manaFragment: 5 })),
      },
    ],
  },
  {
    id: 'encounter_corrupted_mage',
    speaker: 'narrator',
    text: '복도 끝에서 무언가 움직인다.\n\n한때 마법사였을 존재.\n검은 오염이 온몸을 뒤덮었지만, 여전히 마법을 사용하고 있다.\n\n공기가 일그러진다.\n마법 공격이 날아온다.',
    choices: [
      {
        id: 'counter_magic',
        text: '마법으로 맞선다 [마법 판정, 마력결정 -2]',
        diceCheck: 14,
        successId: 'mage_win',
        failureId: 'mage_injured',
        disabled: (state) => state.resources.manaFragment < 2,
        effect: (state) => applyResources(state, { manaFragment: -2 }),
      },
      {
        id: 'dodge',
        text: '피한다 [민첩 판정]',
        diceCheck: 15,
        successId: 'mage_escape',
        failureId: 'mage_hit',
      },
    ],
  },
  {
    id: 'mage_win',
    speaker: 'narrator',
    text: '마법진을 그리며 맞선다.\n푸른 빛과 검은 빛이 충돌한다.\n\n격렬한 마법 대결 끝에 오염된 마법사가 쓰러진다.\n검은 안개가 흩어지며 무언가 떨어진다.\n\n영혼의 파편.\n그리고 낡은 로브에서 마력 결정 몇 개.',
    choices: [
      {
        id: 'continue',
        text: '챙기고 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(
          applyDamage(applyResources(state, { manaFragment: 3, soulFragment: 1 }), 15)
        ),
      },
    ],
  },
  {
    id: 'mage_injured',
    speaker: 'narrator',
    text: '마법 대결에서 밀렸다.\n검은 마법이 몸을 관통한다.\n\n간신히 쓰러뜨렐지만 중상을 입었다.',
    choices: [
      {
        id: 'continue',
        text: '비틀거리며 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(
          applyDamage(applyResources(state, { soulFragment: 1 }), 35)
        ),
      },
    ],
  },
  {
    id: 'mage_escape',
    speaker: 'narrator',
    text: '마법 공격을 간신히 피한다.\n오염된 마법사를 뒤로하고 도망친다.\n\n무사히 빠져나왔다.',
    choices: [
      {
        id: 'continue',
        text: '돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(state),
      },
    ],
  },
  {
    id: 'mage_hit',
    speaker: 'narrator',
    text: '마법 공격을 피하지 못했다.\n검은 마법이 등을 강타한다.\n\n간신히 도망쳤지만 심하게 다쳤다.',
    choices: [
      {
        id: 'continue',
        text: '황급히 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyDamage(state, 30)),
      },
    ],
  },
];