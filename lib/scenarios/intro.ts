import { Scenario } from '@/lib/types';
import { applyTrust, addFlag } from './helpers';

export const introScenarios: Scenario[] = [
  {
    id: 'intro_01',
    speaker: 'narrator',
    text: '어둠 속에서 깨어난다.\n머리가 지끈거린다.\n입안에는 쇳물 같은 피맛이 감돌고, 몸 어딘가에서 날카로운 통증이 느껴진다.\n\n여기가... 어디지?',
    choices: [
      { id: 'look_around', text: '주변을 둘러본다', nextId: 'intro_02' },
    ],
  },
  {
    id: 'intro_02',
    speaker: 'narrator',
    text: '희미한 마나결정의 푸른빛이 지하 공간을 비춘다.\n콘크리트 벽면에는 금속판이 박혀있다.\n"제7구역 긴급대피소 - 마도력 128년 준공"\n\n6년 전에 지어진 대피소.\n그런데 왜 나는 여기 있는 걸까?\n\n품에 뭔가 있다.\n작은 화분.\n그 안에는 손가락 길이만 한 새싹이 자라고 있다.\n가냘프지만, 묘하게도 주변의 검은 기운을 밀어내는 것 같다.',
    choices: [
      { id: 'check_sprout', text: '새싹을 살펴본다', nextId: 'intro_03' },
    ],
  },
  {
    id: 'intro_03',
    speaker: 'echo',
    text: '...안녕하세요.\n깨어나셨군요.',
    choices: [
      { id: 'startled', text: '깜짝 놀라 뒤로 물러난다', nextId: 'intro_04' },
      {
        id: 'calm',
        text: '"...누구죠?"',
        nextId: 'intro_04_calm',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  {
    id: 'intro_04',
    speaker: 'narrator',
    text: '목소리가 들렸다.\n소녀의 목소리.\n하지만 주변에는 아무도 없다.\n\n아니, 잠깐.\n화분 속 새싹이... 미약하게 빛나고 있다.',
    choices: [
      { id: 'continue', text: '새싹을 바라본다', nextId: 'intro_05' },
    ],
  },
  {
    id: 'intro_04_calm',
    speaker: 'narrator',
    text: '목소리가 들렸다.\n소녀의 목소리.\n하지만 주변에는 아무도 없다.\n\n화분 속 새싹이 미약하게 빛나고 있다.',
    choices: [
      { id: 'continue', text: '새싹을 바라본다', nextId: 'intro_05' },
    ],
  },
  {
    id: 'intro_05',
    speaker: 'echo',
    text: '...놀라셨죠? 미안해요.\n저는 에코예요.\n당신이 들고 계신 그 새싹, 세계수의 영혼이라고 할 수 있죠.\n\n당신의 이름은 기억하시나요?',
    choices: [
      {
        id: 'try_remember',
        text: '기억을 더듬어본다 [주사위: 지각력 판정]',
        diceCheck: 12,
        successId: 'intro_06_success',
        failureId: 'intro_06_failure',
      },
    ],
  },
  {
    id: 'intro_06_failure',
    speaker: 'narrator',
    text: '머릿속을 헤집는다.\n하얗게 지워진 기억 속에서 아무것도 떠오르지 않는다.\n\n이름조차 기억나지 않는다.',
    choices: [
      { id: 'continue', text: '에코를 바라본다', nextId: 'intro_07_failure' },
    ],
  },
  {
    id: 'intro_07_failure',
    speaker: 'echo',
    text: '...괜찮아요.\n천천히 기억날 거예요.\n\n자, 이제 일어나야 해요.\n위는 위험하지만... 이대로 있을 수는 없어요.',
    choices: [
      { id: 'ask', text: '"무슨 위험이죠?"', nextId: 'intro_08' },
      { id: 'getup', text: '일어나 출구를 향한다', nextId: 'intro_08' },
    ],
  },
  {
    id: 'intro_06_success',
    speaker: 'narrator',
    text: '머릿속을 헤집는다.\n하얗게 지워진 기억 속에서, 어렴풋이 하나의 이름이 떠오른다.\n\n"...루드비히."\n\n맞다.\n루드비히 아이센하르트.\n그게 내 이름이다.\n\n하지만 그 뒤로는... 아무것도 기억나지 않는다.',
    choices: [
      {
        id: 'continue',
        text: '에코를 바라본다',
        nextId: 'intro_07_success',
        effect: (state) => addFlag(state, 'rememberedName'),
      },
    ],
  },
  {
    id: 'intro_07_success',
    speaker: 'echo',
    text: '루드비히...\n\n...맞아요.\n기억이 돌아와서 다행이에요.\n\n자, 이제 일어나야 해요.\n위는 위험하지만... 이대로 있을 수는 없어요.',
    choices: [
      { id: 'ask', text: '"무슨 위험이죠?"', nextId: 'intro_08' },
      { id: 'getup', text: '일어나 출구를 향한다', nextId: 'intro_08' },
    ],
  },
  {
    id: 'intro_08',
    speaker: 'echo',
    text: '이 도시는... 무너졌어요.\n\n검은 오염이 모든 걸 집어삼키고 있어요.\n사람들도, 건물들도, 마법도.\n전부 검게 물들어서... 괴물이 되어버렸죠.',
    choices: [
      { id: 'continue', text: '계속 듣는다', nextId: 'intro_09' },
    ],
  },
  {
    id: 'intro_09',
    speaker: 'echo',
    text: '하지만 우리에겐 희망이 있어요.\n이 세계수를요.\n\n세계수를 키우면... 이 오염을 정화할 수 있어요.\n세상을 원래대로 되돌릴 수 있어요.',
    choices: [
      { id: 'continue', text: '듣고 있는다', nextId: 'intro_10' },
    ],
  },
  {
    id: 'intro_10',
    speaker: 'echo',
    text: '쉽지 않을 거예요.\n위험한 곳을 탐험하고, 자원을 모으고, 오염과 싸워야 해요.\n\n...할 수 있겠어요?',
    choices: [
      {
        id: 'accept',
        text: '"알겠어요. 해보죠."',
        nextId: 'intro_11',
        effect: (state) => applyTrust(state, 3),
      },
      { id: 'hesitate', text: '"...정말 가능할까요?"', nextId: 'intro_11_hesitate' },
    ],
  },
  {
    id: 'intro_11',
    speaker: 'echo',
    text: '...고마워요.\n\n일단 이 대피소부터 나가야 해요.\n위로 올라가는 계단이 저기 보이죠?\n\n조심하세요.\n위는... 달라졌을 거예요.',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'shelter_hub',
        effect: (state) => ({
          ...addFlag(state, 'tutorial_complete'),
          pollution: state.pollution + 5,
        }),
      },
    ],
  },
  {
    id: 'intro_11_hesitate',
    speaker: 'echo',
    text: '...그럼 여기서 죽을 건가요?\n\n일단 이 대피소부터 나가야 해요.\n위로 올라가는 계단이 저기 보이죠?',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'shelter_hub',
        effect: (state) => ({
          ...addFlag(state, 'tutorial_complete'),
          pollution: state.pollution + 5,
        }),
      },
    ],
  },
];