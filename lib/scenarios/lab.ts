import { Scenario, GameState } from '@/lib/types';
import { processTurn } from './logic';
import { applyResources, applyDamage, addFlag, applyTrust } from './helpers';

export const labScenarios: Scenario[] = [
  // ============================================
  // 실험동 진입 — 에코의 반응은 트러스트에 따라 분기
  // ============================================
  {
    id: 'explore_lab',
    speaker: 'narrator',
    text: '실험동으로 향한다.\n건물 반절이 무너져 있다.\n\n입구에는 "실험동 - 관계자 외 출입금지"라는 표지판이 쓰러져 있다.\n\n어떤 무거운 기운이 이 곳 전체에 깔려있다.',
    choices: [
      {
        id: 'enter',
        text: '안으로 들어간다',
        // 트러스트에 따라 에코가 막는 장면으로 먼저 튀어나옴
        nextId: (state: GameState) =>
          state.echoTrust < 35 ? 'lab_echo_block_desperate'
          : state.echoTrust < 50 ? 'lab_echo_block_worried'
          : 'lab_inside',
      },
      { id: 'back', text: '돌아간다', nextId: 'exploration_choice' },
    ],
  },

  // ============================================
  // 에코가 막는 장면 — 트러스트 낮은 경우 (< 35)
  // 에코가 거의 필사적으로 막는다. 깊은 불안과 공포가 느껴진다.
  // ============================================
  {
    id: 'lab_echo_block_desperate',
    speaker: 'echo',
    text: '...!!\n\n여기는 안 돼요!\n제발... 제발 안 들어가세요.\n\n그냥... 그냥 돌아가주세요.\n여기에는 아무것도 없어요.\n아무것도!',
    choices: [
      {
        id: 'push',
        text: '"왜 막는 거예요? 제대로 말해요."',
        nextId: 'lab_echo_block_desperate_push',
      },
      {
        id: 'back',
        text: '에코의 눈빛을 보고 돌아간다',
        nextId: 'exploration_choice',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  {
    id: 'lab_echo_block_desperate_push',
    speaker: 'echo',
    // 에코의 외형: 성인 여자 정도의 키와 형태, 하지만 눈에 깊은 공포가 깜빡인다
    text: '새싹 위로 희미한 빛이 강렬하게 떨린다.\n그리고 그 빛 안에서.\n\n여자의 형체가 잠깐 보인다.\n키는 루드비히와 비슷한 높이.\n길운 머리카락.\n그리고 눈.\n\n그 눈이 루드비히를 바라본다.\n공포로 가득 차 있다.\n\n"...부탁드려요."',
    choices: [
      {
        id: 'force_enter',
        text: '강단하게 안으로 들어간다',
        nextId: 'lab_inside',
        effect: (state) => applyTrust(state, -8),
      },
      {
        id: 'back',
        text: '...그냥 돌아간다',
        nextId: 'exploration_choice',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },

  // ============================================
  // 에코가 막는 장면 — 트러스트 중간 (35~49)
  // 불안하지만 강하게는 막지 않는다.
  // ============================================
  {
    id: 'lab_echo_block_worried',
    speaker: 'echo',
    text: '...여기.\n\n여기는... 좀 위험해요.\n제가 좋아하는 곳이 아니에요.\n\n정말... 들어가실 건가요?',
    choices: [
      {
        id: 'enter_anyway',
        text: '"필요한 곳이에요. 같이 가요."',
        nextId: 'lab_inside',
        effect: (state) => applyTrust(state, 2),
      },
      {
        id: 'back',
        text: '오늘은 아니고요.',
        nextId: 'exploration_choice',
      },
    ],
  },

  // ============================================
  // 실험동 내부
  // ============================================
  {
    id: 'lab_inside',
    speaker: 'echo',
    text: '...조심하세요.\n\n여기서는... 저도.\n목소리가 잘 안 나와요.',
    choices: [
      { id: 'continue', text: '안으로 더 들어간다', nextId: 'lab_corridor' },
    ],
  },
  {
    id: 'lab_corridor',
    speaker: 'narrator',
    text: '복도를 따라 들어간다.\n실험실들이 줄지어 있다.\n\n문마다 번호가 적혀있다.\n실험실 7, 실험실 12, 실험실 19...\n\n그리고 끝에 하나.\n"특별 실험실 - 세계수 프로젝트"',
    choices: [
      { id: 'special_lab', text: '특별 실험실로 들어간다', nextId: 'lab_special' },
      { id: 'other_lab', text: '다른 실험실을 조사한다', nextId: 'lab_search' },
      { id: 'back', text: '돌아간다', nextId: 'exploration_choice' },
    ],
  },
  {
    id: 'lab_search',
    speaker: 'narrator',
    text: '실험실들을 뒤진다.\n대부분은 파괴되었지만, 몇몇 곳에서 쓸 만한 물건을 발견한다.\n\n마력 결정, 정화수 몇 병.',
    choices: [
      {
        id: 'continue',
        text: '챙기고 돌아간다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyResources(state, { manaFragment: 3, purifyingWater: 2 })),
      },
    ],
  },
  {
    id: 'lab_special',
    speaker: 'narrator',
    text: '특별 실험실의 문을 연다.\n\n내부는... 예상외로 깨끗하다.\n마법진이 방을 보호하고 있었던 것 같다.\n\n중앙에는 큰 유리관.\n안에는 검은 액체가 들어있다.\n\n벽에는 연구 노트들이 붙어있다.',
    choices: [
      { id: 'read_notes', text: '연구 노트를 읽는다', nextId: 'lab_notes' },
      { id: 'check_tube', text: '유리관을 조사한다', nextId: 'lab_tube' },
    ],
  },
  {
    id: 'lab_notes',
    speaker: 'narrator',
    text: '벽에 붙은 노트를 읽는다.\n\n"마도력 133년 11월 3일.\n세계수 실험 최종 단계.\n영혼 이식 준비 완료.\n\n피험자: 에코 (10세, 여)\n세계수 씨앗: 완성 단계\n\n탑주 헤센 아이센하르트의 명령에 따라\n내일 최종 실험을 진행한다.\n\n...루드비히는 반대하고 있다.\n하지만 선택권은 없다."\n\n다음 장.\n\n"11월 4일.\n실험 진행 중 사고 발생.\n루드비히가 피험자와 함께 도주 시도.\n\n제압 완료.\n강제로 실험 진행.\n\n...결과: 성공?\n\n영혼 이식 완료.\n하지만 씨앗이 폭주.\n\n오염 확산 시작.\n\n신이시여, 우리가 무슨 짓을..."\n\n더 이상의 기록은 없다.',
    choices: [
      { id: 'continue', text: '노트를 내려놓는다', nextId: 'lab_reveal' },
    ],
  },
  {
    id: 'lab_tube',
    speaker: 'narrator',
    text: '유리관에 다가간다.\n검은 액체가 꿈틀거린다.\n\n오염의 근원.\n\n그 순간, 유리관에 금이 간다.',
    choices: [
      { id: 'run', text: '뛴다!', nextId: 'lab_escape' },
    ],
  },
  {
    id: 'lab_escape',
    speaker: 'narrator',
    text: '유리관이 폭발한다.\n검은 액체가 쏟아진다.\n\n필사적으로 문 밖으로 뛰어나온다.\n뒤에서 오염이 번져나온다.\n\n간신히 실험동을 빠져나왔다.',
    choices: [
      {
        id: 'continue',
        text: '숨을 고론다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyDamage(
          addFlag({ ...state, pollution: Math.min(100, state.pollution + 10) }, 'lab_completed'),
          20
        )),
      },
    ],
  },

  // ============================================
  // 진실 공개
  // ============================================
  {
    id: 'lab_reveal',
    speaker: 'echo',
    text: '...\n\n이제 알았어요?',
    choices: [
      { id: 'confront', text: '"당신이... 실험체였군요."', nextId: 'lab_reveal_2' },
      { id: 'silent', text: '아무 말 하지 않는다', nextId: 'lab_reveal_silent' },
    ],
  },
  {
    id: 'lab_reveal_2',
    speaker: 'echo',
    text: '...맞아요.\n\n저는 세계수가 아니에요.\n세계수에... 억지로 이식된 영혼이에요.\n\n그리고 당신은...\n저를 구하려다 실패한 사람이에요.',
    choices: [
      { id: 'continue', text: '"...미안해요."', nextId: 'lab_reveal_3' },
      { id: 'angry', text: '"왜 진작 말하지 않았어요?"', nextId: 'lab_reveal_angry' },
    ],
  },
  {
    id: 'lab_reveal_3',
    speaker: 'echo',
    text: '...미안할 건 없어요.\n당신은 최선을 다했어요.\n\n제가... 미안해요.\n당신의 기억을 지운 건 저였어요.\n\n씨앗이 폭주했을 때,\n제 마지막 의식으로 당신만이라도 살리려고...\n\n하지만 기억까지 지워버렐었어요.',
    choices: [
      { id: 'forgive', text: '"괜찮아요. 당신 잘못이 아니에요."', nextId: 'lab_reveal_forgive' },
    ],
  },
  {
    id: 'lab_reveal_forgive',
    speaker: 'echo',
    text: '...고마워요.\n\n이제 계속할 수 있겠어요?\n세계수를 키우는 거.\n\n이건... 제 속죄예요.\n제가 망친 세상을 되돌리는.',
    choices: [
      {
        id: 'continue',
        text: '"같이 해요."',
        nextId: 'shelter_hub',
        effect: (state) => processTurn({
          ...addFlag(state, 'truth_revealed'),
          echoTrust: 100,
        }),
      },
    ],
  },
  {
    id: 'lab_reveal_angry',
    speaker: 'echo',
    text: '...말할 수 없었어요.\n\n당신이... 저를 원망할까 봐.\n당신의 기억을 지운 건 저였으니까.\n\n미안해요.',
    choices: [
      {
        id: 'forgive',
        text: '"...알겠어요. 계속해요."',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(applyTrust(addFlag(state, 'truth_revealed'), 10)),
      },
    ],
  },
  {
    id: 'lab_reveal_silent',
    speaker: 'echo',
    text: '...아무 말도 안 하시는군요.\n\n괜찮아요.\n알고 계셔도.\n\n어차피... 선택권은 없으니까.\n세계수를 키워야 해요.\n\n그게 이 세상을 살릴 유일한 방법이니까.',
    choices: [
      {
        id: 'continue',
        text: '고개를 끄덕인다',
        nextId: 'shelter_hub',
        effect: (state) => processTurn(addFlag(state, 'truth_revealed')),
      },
    ],
  },
];