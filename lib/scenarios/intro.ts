import { Scenario } from '@/lib/types';
import { applyTrust, addFlag } from './helpers';

export const introScenarios: Scenario[] = [
  {
    id: 'intro_01',
    speaker: 'narrator',
    text: '의식이 돌아온다.\n천천히.\n마치 깊은 물속에서 수면 위로 떠오르듯.\n\n머리가 지끈거린다.\n입안에는 쇳물 같은 피맛이 감돌고, 몸 곳곳에서 날카로운 통증이 찌릿찌릿 울린다.\n왼쪽 어깨가 특히 아프다.\n\n눈을 뜬다.\n어둠.\n완전한 어둠은 아니다.\n\n여기가... 어디지?',
    choices: [
      { id: 'look_around', text: '주변을 둘러본다', nextId: 'intro_02' },
    ],
  },
  
  {
    id: 'intro_02',
    speaker: 'narrator',
    text: '천천히 고개를 돌린다.\n목덜미에서 뻐근한 통증이 느껴진다.\n\n희미한 마나결정의 푸른빛이 지하 공간을 비춘다.\n천장에 박힌 결정들은 반쯤 깨져있지만, 여전히 미약한 빛을 내뿜고 있다.\n\n콘크리트 벽면.\n금속판이 녹슬어 있다.\n눈을 가늘게 뜨고 글자를 읽는다.\n\n"제7구역 긴급대피소 - 마도력 128년 준공"\n\n...6년 전.\n6년 전에 지어진 대피소.\n\n그런데 왜 나는 여기 있는 걸까?\n무슨 일이 있었던 걸까?',
    choices: [
      { id: 'try_remember', text: '기억을 떠올려본다', nextId: 'intro_02_memory' },
      { id: 'check_body', text: '몸 상태를 확인한다', nextId: 'intro_02_body' },
    ],
  },
  
  {
    id: 'intro_02_memory',
    speaker: 'narrator',
    text: '눈을 감는다.\n기억을 더듬는다.\n\n......\n\n아무것도 떠오르지 않는다.\n하얗게 지워진 백지 같은 머릿속.\n\n이름도, 나이도, 어디서 왔는지도.\n어제 뭘 했는지도.\n\n공백.\n\n가슴이 답답해진다.\n\n품에 뭔가 있다는 걸 그제야 느낀다.',
    choices: [
      { id: 'check_item', text: '품 안의 물건을 확인한다', nextId: 'intro_02_sprout' },
    ],
  },
  
  {
    id: 'intro_02_body',
    speaker: 'narrator',
    text: '천천히 몸을 일으킨다.\n왼쪽 어깨에서 욱신거리는 통증.\n\n손을 뻗어 만져본다.\n찢어진 옷.\n말라붙은 피.\n하지만 상처는... 아물어있다.\n\n얼마나 여기 있었던 걸까?\n\n품에 뭔가 있다는 걸 그제야 느낀다.',
    choices: [
      { id: 'check_item', text: '품 안의 물건을 확인한다', nextId: 'intro_02_sprout' },
    ],
  },
  
  {
    id: 'intro_02_sprout',
    speaker: 'narrator',
    text: '작은 화분.\n흙이 담긴 소박한 도자기 화분.\n\n그 안에서 작은 새싹이 자라고 있다.\n손가락 길이만 한, 가냘픈 새싹.\n두 장의 떡잎이 펼쳐져 있고, 그 사이로 진짜 잎이 돋아나려 하고 있다.\n\n신기한 건...\n새싹이 희미하게 빛나고 있다는 것.\n\n푸른빛.\n따뜻한 푸른빛.\n\n그 빛이 주변의 검은 기운을 밀어내는 것 같다.\n마치 작은 등불처럼.',
    choices: [
      { id: 'touch_sprout', text: '새싹을 조심스럽게 만져본다', nextId: 'intro_03_touch' },
      { id: 'just_watch', text: '새싹을 바라본다', nextId: 'intro_03' },
    ],
  },
  
  {
    id: 'intro_03_touch',
    speaker: 'narrator',
    text: '손가락 끝으로 떡잎을 살짝 건드린다.\n\n따뜻하다.\n생명의 온기.\n\n순간, 가슴속이 뭉클해진다.\n왜인지 모르겠지만.\n\n그때, 목소리가 들린다.',
    choices: [
      { id: 'continue', text: '......!', nextId: 'intro_03' },
    ],
  },
  
  {
    id: 'intro_03',
    speaker: 'echo',
    text: '...안녕하세요.\n\n드디어 깨어나셨군요.\n\n...걱정했어요.',
    choices: [
      { 
        id: 'startled', 
        text: '깜짝 놀라 뒤로 물러난다', 
        nextId: 'intro_04_startled',
      },
      {
        id: 'calm',
        text: '"...누구죠?"',
        nextId: 'intro_04_calm',
        effect: (state) => applyTrust(state, 5),
      },
      {
        id: 'confused',
        text: '"...소리가 들려요?"',
        nextId: 'intro_04_confused',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  
  {
    id: 'intro_04_startled',
    speaker: 'narrator',
    text: '반사적으로 몸을 뒤로 젖힌다.\n화분이 손에서 미끄러질 뻔한다.\n황급히 붙잡는다.\n\n목소리.\n소녀의 목소리.\n어린아이 같기도 하고, 어른 같기도 한.\n\n하지만 주변을 둘러봐도 아무도 없다.\n텅 빈 대피소.\n\n"...누구세요?"\n\n대답이 없다.\n\n아니, 잠깐.\n화분 속 새싹이... 조금 더 밝게 빛나고 있다.',
    choices: [
      { id: 'realize', text: '새싹을 뚫어지게 바라본다', nextId: 'intro_05' },
    ],
  },
  
  {
    id: 'intro_04_calm',
    speaker: 'narrator',
    text: '침착하게 주변을 둘러본다.\n\n목소리.\n소녀의 목소리.\n하지만 여기엔 나 혼자다.\n\n"어디 계세요?"\n\n대답 대신, 화분 속 새싹이 미약하게 빛난다.\n마치 대답하듯.',
    choices: [
      { id: 'understand', text: '"...설마."', nextId: 'intro_05' },
    ],
  },
  
  {
    id: 'intro_04_confused',
    speaker: 'echo',
    text: '...네.\n들려요.\n\n제 목소리가요.',
    choices: [
      { id: 'continue', text: '새싹을 바라본다', nextId: 'intro_05' },
    ],
  },
  
  {
    id: 'intro_05',
    speaker: 'echo',
    text: '놀라셨죠?\n미안해요.\n처음엔 다들 그래요.\n\n저는 에코예요.\n당신이 들고 계신 그 새싹...\n세계수의 영혼이라고 할 수 있어요.\n\n육체는 없지만, 의식은 있어요.\n이렇게 말할 수도 있고요.\n\n......\n\n당신의 이름은... 기억하시나요?',
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
    text: '눈을 감고 집중한다.\n머릿속을 헤집는다.\n\n기억.\n이름.\n과거.\n\n하지만 하얗게 지워진 기억 속에서 아무것도 떠오르지 않는다.\n\n손가락 사이로 모래가 빠져나가듯.\n잡으려 할수록 멀어지는 기억.\n\n이름조차 기억나지 않는다.\n\n"...모르겠어요."\n\n목소리가 떨린다.',
    choices: [
      { id: 'continue', text: '......', nextId: 'intro_07_failure' },
    ],
  },
  
  {
    id: 'intro_07_failure',
    speaker: 'echo',
    text: '...괜찮아요.\n\n무리하지 마세요.\n천천히 기억날 거예요.\n시간이 지나면.\n\n지금은... 일단 여기서 나가는 게 먼저예요.\n\n......\n\n위는 위험해요.\n하지만 이대로 여기 있을 수는 없어요.',
    choices: [
      { 
        id: 'ask', 
        text: '"무슨 위험이죠?"', 
        nextId: 'intro_08',
      },
      { 
        id: 'trust', 
        text: '"...알겠어요. 믿을게요."', 
        nextId: 'intro_08_trust',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  
  {
    id: 'intro_06_success',
    speaker: 'narrator',
    text: '눈을 감고 집중한다.\n깊이.\n더 깊이.\n\n하얗게 지워진 기억 속.\n\n그 어딘가에서.\n\n희미하게.\n\n아주 희미하게.\n\n하나의 이름이 떠오른다.\n\n"...루드비히."\n\n입 밖으로 흘러나온 그 이름이 낯설지 않다.\n\n"루드비히 아이센하르트."\n\n맞다.\n그게 내 이름이다.\n\n하지만 그 뒤로는...\n여전히 아무것도 기억나지 않는다.\n\n이름만.\n덩그러니 남은 이름.',
    choices: [
      {
        id: 'continue',
        text: '에코를 향해 말한다',
        nextId: 'intro_07_success',
        effect: (state) => addFlag(state, 'rememberedName'),
      },
    ],
  },
  
  {
    id: 'intro_07_success',
    speaker: 'echo',
    text: '루드비히...\n\n루드비히 아이센하르트.\n\n...맞아요.\n그게 당신 이름이에요.\n\n기억이 조금이나마 돌아와서... 다행이에요.\n정말 다행이에요.\n\n......\n\n자, 이제 일어나야 해요.\n위는 위험하지만... 이대로 있을 수는 없어요.',
    choices: [
      { 
        id: 'ask', 
        text: '"무슨 위험이죠?"', 
        nextId: 'intro_08',
      },
      { 
        id: 'getup', 
        text: '일어나 출구를 향한다', 
        nextId: 'intro_08_action',
      },
    ],
  },
  
  {
    id: 'intro_08',
    speaker: 'echo',
    text: '이 도시는... 무너졌어요.\n\n오래전에.\n\n검은 오염이 탑에서 쏟아져 나왔고...\n모든 걸 집어삼켰어요.\n\n사람들도.\n건물들도.\n마법도.\n희망도.\n\n전부 검게 물들어서...\n변이체가 되어버렸어요.\n\n괴물들이 돌아다녀요.\n위험해요.',
    choices: [
      { id: 'continue', text: '듣고 있는다', nextId: 'intro_09' },
    ],
  },
  
  {
    id: 'intro_08_trust',
    speaker: 'echo',
    text: '...고마워요.\n믿어줘서.\n\n이 도시는 무너졌어요.\n검은 오염이 모든 걸 집어삼켰죠.\n\n하지만...',
    choices: [
      { id: 'continue', text: '......', nextId: 'intro_09' },
    ],
  },
  
  {
    id: 'intro_08_action',
    speaker: 'narrator',
    text: '천천히 몸을 일으킨다.\n다리가 후들거린다.\n얼마나 누워있었던 걸까.\n\n벽을 짚고 중심을 잡는다.\n화분을 조심스럽게 품에 안는다.\n\n에코가 조용히 말한다.',
    choices: [
      { id: 'listen', text: '듣는다', nextId: 'intro_09' },
    ],
  },
  
  {
    id: 'intro_09',
    speaker: 'echo',
    text: '하지만 우리에겐 희망이 있어요.\n\n이 세계수.\n\n작지만... 자라고 있어요.\n당신이 품에 안고 계신 이 새싹이요.\n\n세계수를 키우면...\n이 오염을 정화할 수 있어요.\n\n세상을 원래대로 되돌릴 수 있어요.\n다시... 푸른 하늘을 볼 수 있어요.',
    choices: [
      { 
        id: 'hopeful', 
        text: '"정말... 가능할까요?"',
        nextId: 'intro_10',
      },
      {
        id: 'determined',
        text: '"해봐야죠."',
        nextId: 'intro_10_determined',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  
  {
    id: 'intro_10',
    speaker: 'echo',
    text: '...모르겠어요.\n\n하지만 해볼 수밖에 없어요.\n다른 방법이 없으니까요.\n\n쉽지 않을 거예요.\n위험한 곳을 탐험하고...\n자원을 모으고...\n오염과 싸워야 해요.\n\n힘들 거예요.\n무서울 거예요.\n\n...그래도 할 수 있겠어요?',
    choices: [
      {
        id: 'accept',
        text: '"...알겠어요. 해보죠."',
        nextId: 'intro_11',
        effect: (state) => applyTrust(state, 5),
      },
      { 
        id: 'hesitate', 
        text: '"...자신이 없어요."', 
        nextId: 'intro_11_hesitate',
      },
      {
        id: 'joke',
        text: '"다른 선택지가 있나요?"',
        nextId: 'intro_11_joke',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  
  {
    id: 'intro_10_determined',
    speaker: 'echo',
    text: '...그렇게 쉽게 말하시네요.\n\n쉽지 않을 거예요.\n위험한 곳을 탐험하고, 자원을 모으고, 오염과 싸워야 해요.\n\n힘들고 무서울 거예요.\n\n...그래도 할 수 있겠어요?',
    choices: [
      {
        id: 'confirm',
        text: '"네. 할 수 있어요."',
        nextId: 'intro_11',
        effect: (state) => applyTrust(state, 3),
      },
    ],
  },
  
  {
    id: 'intro_11',
    speaker: 'echo',
    text: '...고마워요.\n\n정말 고마워요.\n\n일단 이 대피소부터 나가야 해요.\n위로 올라가는 계단이 저기 보이죠?\n\n조심하세요.\n위는... 많이 달라졌을 거예요.\n\n...함께 가요.',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'intro_12_stairs',
      },
    ],
  },
  
  {
    id: 'intro_11_hesitate',
    speaker: 'echo',
    text: '...그럼 여기서 죽을 건가요?\n\n......\n\n미안해요.\n너무 직설적이었나요.\n\n하지만 사실이에요.\n여기 있으면... 언젠가 오염이 여기까지 올 거예요.\n\n그때는 끝이에요.\n\n일단 이 대피소부터 나가야 해요.\n위로 올라가는 계단이 저기 보이죠?\n\n...함께 가요.',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'intro_12_stairs',
      },
    ],
  },
  
  {
    id: 'intro_11_joke',
    speaker: 'echo',
    text: '...없어요.\n\n여기 남아서 죽거나.\n위로 올라가서 싸우거나.\n\n둘 중 하나예요.\n\n......\n\n농담이라도 할 수 있다니.\n...강하시네요.\n\n일단 이 대피소부터 나가요.\n위로 올라가는 계단이 저기 보이죠?\n\n...함께 가요.',
    choices: [
      {
        id: 'go_up',
        text: '조심스럽게 계단을 오른다',
        nextId: 'intro_12_stairs',
      },
    ],
  },
  
  {
    id: 'intro_12_stairs',
    speaker: 'narrator',
    text: '계단으로 향한다.\n한 발 한 발.\n\n녹슨 철제 난간.\n금이 간 콘크리트 계단.\n\n위에서 희미한 빛이 새어 들어온다.\n회색빛.\n\n화분을 꼭 안고 계단을 오른다.\n새싹의 푸른 빛이 어둠을 밀어낸다.\n\n계단 끝.\n무거운 철문.\n\n손을 뻗는다.',
    choices: [
      {
        id: 'open_door',
        text: '문을 연다',
        nextId: 'intro_13_outside',
      },
      {
        id: 'hesitate',
        text: '잠시 망설인다',
        nextId: 'intro_12_hesitate',
      },
    ],
  },
  
  {
    id: 'intro_12_hesitate',
    speaker: 'echo',
    text: '...괜찮아요.\n\n무섭죠?\n모르는 세계로 나가는 건.\n\n하지만 괜찮아요.\n제가 있잖아요.\n\n...혼자가 아니에요.',
    choices: [
      {
        id: 'open_door',
        text: '깊게 숨을 들이쉬고 문을 연다',
        nextId: 'intro_13_outside',
        effect: (state) => applyTrust(state, 5),
      },
    ],
  },
  
  {
    id: 'intro_13_outside',
    speaker: 'narrator',
    text: '철문이 삐걱거리며 열린다.\n\n회색 하늘.\n\n구름이 낮게 깔려있다.\n검은 안개가 공중을 떠다닌다.\n\n건물들의 잔해.\n부서진 마도 전차.\n깨진 마나결정들이 거리에 흩어져 있다.\n\n고요하다.\n너무 고요하다.\n\n새소리도.\n바람 소리도.\n사람들의 목소리도.\n\n아무것도 들리지 않는다.\n\n무너진 도시.\n\n여기가... 내가 살던 곳일까?',
    choices: [
      {
        id: 'look_around',
        text: '주변을 둘러본다',
        nextId: 'intro_14_final',
      },
    ],
  },
  
  {
    id: 'intro_14_final',
    speaker: 'echo',
    text: '...이게 우리의 세계예요.\n\n무너진 세계.\n\n하지만 우리가 되살릴 거예요.\n천천히.\n하나씩.\n\n...같이 가요.\n\n저 앞에 다른 대피소 입구가 보여요.\n거기가 우리의 거점이 될 거예요.\n\n시작이에요.\n\n...새로운 시작.',
    choices: [
      {
        id: 'to_shelter',
        text: '폐허를 가로질러 대피소로 향한다',
        nextId: 'shelter_hub',
        effect: (state) => ({
          ...addFlag(state, 'tutorial_complete'),
          pollution: state.pollution + 5,
        }),
      },
    ],
  },
];