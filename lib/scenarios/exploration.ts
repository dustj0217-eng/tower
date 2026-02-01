import { Scenario } from '@/lib/types';
import { tryTriggerRandomEvent } from './random_events';

export const explorationScenarios: Scenario[] = [
  {
    id: 'exploration_choice',
    speaker: 'narrator',
    // 랜덤 이벤트가 트리거될 확률이 있으므로, 이 시나리오의 text와 choices는
    // 게임 엔진 쪽에서 tryTriggerRandomEvent()를 먼저 호출한 뒤
    // null이면 여기서 정상 진행, 아니면 이벤트 시나리오로 리다이렉트하는 로직이 필요.
    // (아래 onEnter 참조)
    text: '대피소 밖으로 나온다.\n폐허가 된 도시가 눈앞에 펼쳐진다.\n검은 안개가 곳곳에 퍼져있다.\n\n어디로 갈까?',
    choices: [
      { id: 'lower_tower', text: '탑 하층부 탐험 (위험도: 낮음)', nextId: 'explore_lower_tower' },
      {
        id: 'upper_tower',
        text: '탑 상층부 탐험 (위험도: 중간)',
        nextId: 'explore_upper_tower',
        condition: (state) => state.worldTree >= 20,
      },
      { id: 'library', text: '무너진 도서관 (위험도: 낮음)', nextId: 'explore_library' },
      {
        id: 'lab',
        text: '실험동 잔해 (위험도: 높음)',
        nextId: 'explore_lab',
        // 후반부 조건: worldTree 60 이상 + 아직 진행 안 완료
        condition: (state) =>
          state.worldTree >= 60
          && !state.flags.lab_completed,
      },
      { id: 'back', text: '쉘터로 돌아간다', nextId: 'shelter_hub' },
    ],
    // 엔진에서 exploration_choice에 진입할 때 이 함수를 호출.
    // 반환값이 null이 아니면 해당 이벤트 id로 리다이렉트.
    onEnter: (state) => tryTriggerRandomEvent(state),
  },
];