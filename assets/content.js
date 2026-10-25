/* 句構圖解學習路徑 — 對外原型的內容。
 * 每個單元：概念講解（concept）＋ 練習題（items，每題前有一段講解 intro、過關後一句 after）。
 * 樹 JSON 照 diagram-engine/README.md；全部是原創示範句。
 * 這是對外頁面：不寫個人名字、不寫內部代號、不寫書目頁碼（test/ 會檢查）。
 */

/* 空格（學生要填）／給定字（灰色，已經放好）／省略字（括號，自己打） */
const S = (w, role, extra = {}) => ({ w, role, ...extra });
const G = (w, extra = {}) => ({ w, slot: false, ...extra });
const U = (w, role) => ({ w, role, understood: true });
const PP = (p, o) => ({ pp: true, p, o });
const PH = (...parts) => ({ phrase: true, parts });

export const BUCKETS = [
  { id: 'who', label: '誰／什麼', eg: '人、動物、東西' },
  { id: 'do', label: '做什麼／是什麼', eg: '動作、狀態' },
  { id: 'how', label: '什麼樣子', eg: '形容前面的東西' },
  { id: 'way', label: '怎麼做', eg: '形容動作' },
  { id: 'help', label: '小幫手', eg: 'the／my／a' },
];

export const UNITS = [
  /* ------------------------------------------------------------ 根 */
  {
    key: 'pos', label: '起點', name: '詞性', group: '地基', mode: 'bucket',
    concept: {
      lead: '一句話裡的每個字都有自己的工作。先別背名稱——先看它在句子裡「負責什麼」。',
      body: [
        '有的字告訴你「誰」或「什麼東西」：dog、apple、Tom。',
        '有的字告訴你「做什麼」或「是什麼」：runs、eats、is。',
        '有的字在描述東西「是什麼樣子」：happy、little、red；有的字在描述動作「是怎麼做的」：fast、quietly。',
        '還有一些小字本身沒什麼意思，但會站在東西前面幫忙指出是哪一個：the、a、my。我們叫它們「小幫手」。',
      ],
      points: [
        '同一個字在不同句子裡可能做不同的工作，所以要看整句話。',
        '這一關不用任何術語，分對工作就好。後面每一關都建立在這件事上。',
      ],
    },
    items: [
      {
        intro: '先從短句開始。句子裡有一個「誰」做了一件事，還有字在描述他、描述那個動作。',
        en: 'My little brother eats apples quietly.', zh: '我弟弟安靜地吃蘋果。',
        task: '把每張字卡放進它負責的桶子裡。',
        words: [['My', 'help'], ['little', 'how'], ['brother', 'who'], ['eats', 'do'], ['apples', 'who'], ['quietly', 'way']],
        after: 'apples 也是「什麼」——它是被吃的那個東西。',
      },
      {
        intro: '這句有兩個小幫手。小幫手後面一定跟著它要指的那個東西。',
        en: 'The tall boy kicks the ball hard.', zh: '那個高個子男孩用力踢球。',
        task: '把每張字卡放進它負責的桶子裡。',
        words: [['The', 'help'], ['tall', 'how'], ['boy', 'who'], ['kicks', 'do'], ['the', 'help'], ['ball', 'who'], ['hard', 'way']],
        after: 'hard 在這裡描述「踢」這個動作有多用力，所以是「怎麼做」。',
      },
      {
        intro: '描述「什麼樣子」的字通常站在東西前面；描述「怎麼做」的字常常跟在動作後面。',
        en: 'A small bird sings sweetly.', zh: '一隻小鳥甜美地唱歌。',
        task: '把每張字卡放進它負責的桶子裡。',
        words: [['A', 'help'], ['small', 'how'], ['bird', 'who'], ['sings', 'do'], ['sweetly', 'way']],
        after: '很多「怎麼做」的字結尾是 -ly，例如 quietly、sweetly。',
      },
    ],
  },

  /* ------------------------------------------------------------ 1A */
  {
    key: '1a', label: '單元 1A', name: '五大句型', group: '單句', mode: 'diagram',
    concept: {
      lead: '每個英文句子都有一條骨幹：「誰」‖「做什麼」。其他的字，都是掛在骨幹上的。',
      body: [
        '我們把句子畫在一條橫線上。主詞（誰）和述語（做什麼）之間畫一條雙線 ‖——這是整個句子最重要的切口。',
        '有些動詞做完就結束了（The baby smiled.）；有些動詞後面還要接一個東西才完整，那個東西用單線 | 隔開，站在同一條骨幹上。',
        '描述別人的字不站在骨幹上，而是從它描述的字正下方垂直往下掛。',
        '英文句子的骨幹只有五種樣子，學會分辨它們，再長的句子都拆得開。',
      ],
      points: [
        'S + V：主詞 ‖ 動詞。',
        'S + Be V + SC：主詞 ‖ be 動詞 | 主詞補語（說明主詞是什麼、什麼樣子）。',
        'S + V + O：主詞 ‖ 動詞 | 受詞（動作做到誰身上）。',
        'S + V + IO + DO：主詞 ‖ 動詞 | 直接受詞，間接受詞掛在動詞下面。',
        'S + V + O + OC：主詞 ‖ 動詞 | 受詞 | 受詞補語（說明受詞變成什麼樣子）。',
      ],
      demo: {
        en: 'The happy dog chased the ball.',
        tree: { clause: true, s: G('dog', { mods: [G('The'), G('happy')] }), v: G('chased'), o: G('ball', { mods: [G('the')] }) },
        caption: '骨幹是 dog ‖ chased | ball。The、happy、the 都是掛在下面的描述字。',
      },
    },
    items: [
      {
        intro: '第一型 S + V：只有主詞和動詞，句子就完整了。灰色的字已經幫你放好了。',
        en: 'The baby smiled.', zh: '小寶寶笑了。',
        task: '把主詞和述語放上骨幹。',
        tree: { clause: true, s: S('baby', '主詞', { mods: [G('The')] }), v: S('smiled', '述語') },
        after: '骨幹只有兩格，也是一個完整的句子。',
      },
      {
        intro: '第二型 S + Be V + SC：be 動詞（is、am、are、was）本身沒有動作，它後面要接一個字來說明主詞是什麼樣子。這個字叫主詞補語。',
        en: 'My room is tiny.', zh: '我的房間很小。',
        task: 'be 動詞後面的字，說的是主詞的樣子。',
        tree: { clause: true, s: S('room', '主詞', { mods: [G('My')] }), v: S('is', 'Be 動詞'), sc: S('tiny', '主詞補語') },
        after: 'tiny 說的是 room，不是被做了什麼動作——所以它是補語，不是受詞。',
      },
      {
        intro: '第三型 S + V + O：動作要做到某個東西身上，那個東西就是受詞。',
        en: 'Amy feeds her dog.', zh: 'Amy 餵她的狗。',
        task: '找出誰做動作、做了什麼、做到誰身上。',
        tree: { clause: true, s: S('Amy', '主詞'), v: S('feeds', '述語'), o: S('dog', '受詞', { mods: [G('her')] }) },
        after: '問「餵誰？」——答案就是受詞。',
      },
      {
        intro: '第四型 S + V + IO + DO：有些動作有兩個對象——給了「什麼東西」（直接受詞），給了「誰」（間接受詞）。間接受詞其實藏著一個 to 或 for，所以它掛在動詞下面。',
        en: 'Grandma baked us cookies.', zh: '奶奶烤了餅乾給我們。',
        task: '直接受詞站在骨幹上，間接受詞掛在動詞下面。',
        tree: { clause: true, s: S('Grandma', '主詞'), v: S('baked', '述語'), io: S('us', '間接受詞'), o: S('cookies', '直接受詞') },
        after: '這句等於 Grandma baked cookies for us.——us 是那個藏起來的 for 的對象。',
      },
      {
        intro: '第五型 S + V + O + OC：動作讓受詞「變成」某個樣子。說明受詞樣子的字叫受詞補語，跟在受詞後面。',
        en: 'The news made Dad angry.', zh: '那則消息讓爸爸很生氣。',
        task: '受詞後面還有一格：受詞變成了什麼樣子？',
        tree: { clause: true, s: S('news', '主詞', { mods: [G('The')] }), v: S('made', '述語'), o: S('Dad', '受詞'), oc: S('angry', '受詞補語') },
        after: '生氣的是 Dad，不是 news——所以 angry 說明的是受詞。',
      },
    ],
  },

  /* ------------------------------------------------------------ 1B（形態層） */
  {
    key: '1b', label: '單元 1B', name: '時態、語氣、語態', group: '單句', mode: 'other',
    concept: {
      lead: '這一關學的是動詞「長什麼樣子」，不是句子「怎麼搭」。',
      body: [
        '時態（現在、過去、進行、完成）、假設語氣、被動語態、命令句，改變的是動詞的形狀和意思，但句子的骨幹不變：還是「誰 ‖ 做什麼」。',
        '所以這一關不用圖解練習，而是用另一種練習：看情境選出正確的動詞形狀、把句子改成另一個時態。',
        '圖解時，多個字組成的動詞會連成一張字卡，例如 are-studying、have-seen——它們在骨幹上只佔一格。',
      ],
      points: [
        'She studies. → She is studying. → She has studied.：骨幹都是 She ‖ 動詞。',
        '這一關的練習還在設計中，原型先保留這個位置，讓路徑完整。',
      ],
    },
    items: [],
  },

  /* ------------------------------------------------------------ 2 */
  {
    key: '2', label: '單元 2', name: '不定詞', group: '單句', mode: 'diagram',
    concept: {
      lead: '「to + 動詞原形」可以把一個動作打包成一個東西，放進句子的任何位置。',
      body: [
        'to learn、to win、to visit——這種組合叫不定詞。它本來是動作，打包之後就能當主詞、受詞或補語。',
        '不定詞片語在圖解裡佔一格，格子裡面自成一小段：to win | game。它自己還可以帶受詞、帶描述字。',
      ],
      points: [
        '當受詞：I want to sleep.（想要什麼？想要「去睡覺」。）',
        '當主詞：To swim well takes practice.',
        '當補語：My plan is to visit Japan.',
      ],
      demo: {
        en: 'I want to sleep.',
        tree: { clause: true, s: G('I'), v: G('want'), o: PH(G('to sleep')) },
        caption: '受詞的位置放的不是一個東西，是一個被打包的動作：to sleep。',
      },
    },
    items: [
      {
        intro: '不定詞片語站在受詞的位置。它自己也帶著一個受詞——贏得「什麼」？',
        en: 'The kids hope to win the game.', zh: '孩子們希望贏得比賽。',
        task: '受詞那一格裡面又分成兩格：不定詞，和不定詞的受詞。',
        tree: { clause: true, s: S('kids', '主詞', { mods: [G('The')] }), v: S('hope', '述語'), o: PH(S('to win', '不定詞'), S('game', '不定詞的受詞', { mods: [G('the')] })) },
        after: '整個 to win the game 是 hope 的受詞。',
      },
      {
        intro: '這次不定詞片語站在主詞的位置。描述「游得怎樣」的 well，掛在 to swim 下面。',
        en: 'To swim well takes practice.', zh: '要游得好需要練習。',
        task: '先找動詞，再問「是什麼需要練習？」',
        tree: { clause: true, s: PH(S('To swim', '不定詞', { mods: [S('well', '副詞')] })), v: S('takes', '述語'), o: S('practice', '受詞') },
        after: '主詞可以是一個動作：「游得好」這件事需要練習。',
      },
      {
        intro: 'be 動詞後面接的是補語。補語也可以是一個不定詞片語。',
        en: 'My plan is to visit Japan.', zh: '我的計畫是去日本玩。',
        task: '這是 S + Be V + SC，補語是一整個不定詞片語。',
        tree: { clause: true, s: S('plan', '主詞', { mods: [G('My')] }), v: S('is', 'Be 動詞'), sc: PH(S('to visit', '不定詞'), S('Japan', '不定詞的受詞')) },
        after: 'plan 是什麼？是 to visit Japan。',
      },
    ],
  },

  /* ------------------------------------------------------------ 3 */
  {
    key: '3', label: '單元 3', name: '動名詞', group: '單句', mode: 'diagram',
    concept: {
      lead: '動詞加 -ing，也可以把動作變成一個「東西」。',
      body: [
        'Swimming is fun. 裡的 swimming 不是正在游，而是「游泳這件事」。這種 -ing 叫動名詞。',
        '動名詞跟不定詞一樣，可以站在主詞、受詞、補語的位置，也可以自己帶受詞。圖解的畫法也一樣：一格內自成一小段。',
      ],
      points: [
        '當主詞：Reading comics makes Ben happy.',
        '當受詞：Tom enjoys playing chess.',
        '當補語：My hobby is collecting stamps.',
      ],
      demo: {
        en: 'Swimming is fun.',
        tree: { clause: true, s: PH(G('Swimming')), v: G('is'), sc: G('fun') },
        caption: '主詞是「游泳這件事」，所以 Swimming 站在主詞的位置。',
      },
    },
    items: [
      {
        intro: '主詞是一整個動名詞片語。後面的骨幹是第五型：讓「誰」變成「什麼樣子」。',
        en: 'Reading comics makes Ben happy.', zh: '看漫畫讓 Ben 很開心。',
        task: '主詞格裡有兩格：動名詞，和它的受詞。',
        tree: { clause: true, s: PH(S('Reading', '動名詞'), S('comics', '動名詞的受詞')), v: S('makes', '述語'), o: S('Ben', '受詞'), oc: S('happy', '受詞補語') },
        after: '讓 Ben 開心的是「看漫畫這件事」。',
      },
      {
        intro: 'enjoy 後面要接一件事。這件事用動名詞表示。',
        en: 'Tom enjoys playing chess.', zh: 'Tom 喜歡下西洋棋。',
        task: '受詞格裡是一個動名詞片語。',
        tree: { clause: true, s: S('Tom', '主詞'), v: S('enjoys', '述語'), o: PH(S('playing', '動名詞'), S('chess', '動名詞的受詞')) },
        after: 'Tom 喜歡什麼？喜歡 playing chess 這件事。',
      },
      {
        intro: '補語說明主詞是什麼。這句的補語是一件事。',
        en: 'My hobby is collecting stamps.', zh: '我的嗜好是集郵。',
        task: '這是 S + Be V + SC，補語是動名詞片語。',
        tree: { clause: true, s: S('hobby', '主詞', { mods: [G('My')] }), v: S('is', 'Be 動詞'), sc: PH(S('collecting', '動名詞'), S('stamps', '動名詞的受詞')) },
        after: '注意：is collecting 在這裡不是進行式——主詞 hobby 不會「正在收集」。',
      },
    ],
  },

  /* ------------------------------------------------------------ 4 */
  {
    key: '4', label: '單元 4', name: '分詞', group: '單句', mode: 'diagram',
    concept: {
      lead: '動詞變成 -ing 或 -ed 之後，也可以拿來描述東西——就像一般的描述字。',
      body: [
        'a sleeping cat（正在睡的貓）、a broken chair（被弄壞的椅子）。-ing 是「主動、正在做」，-ed 是「被做了」。這種字叫分詞。',
        '分詞是描述字，所以不站骨幹，而是掛在它描述的那個字下面。分詞後面帶著一串字時（holding the flag），整串一起掛下去。',
      ],
      points: [
        '-ing 分詞：The sleeping cat purred.',
        '-ed 分詞：Dad fixed the broken chair.',
        '分詞片語：The girl holding the flag waved.',
      ],
      demo: {
        en: 'The sleeping cat purred.',
        tree: { clause: true, s: G('cat', { mods: [G('The'), G('sleeping')] }), v: G('purred') },
        caption: 'sleeping 描述 cat，所以掛在 cat 下面；骨幹還是 cat ‖ purred。',
      },
    },
    items: [
      {
        intro: '分詞片語 holding the flag 描述的是女孩，所以整串掛在 girl 下面。',
        en: 'The girl holding the flag waved.', zh: '拿著旗子的女孩揮了揮手。',
        task: '先放骨幹，再把分詞片語掛上去。',
        tree: { clause: true, s: S('girl', '主詞', { mods: [G('The'), PH(S('holding', '分詞'), S('flag', '分詞的受詞', { mods: [G('the')] }))] }), v: S('waved', '述語') },
        after: '把下面那層遮起來，骨幹只剩 girl ‖ waved。',
      },
      {
        intro: '-ed 分詞表示「被做了」：broken 是被弄壞的。它描述受詞 chair。',
        en: 'Dad fixed the broken chair.', zh: '爸爸修好了那張壞掉的椅子。',
        task: '這是 S + V + O。broken 掛在受詞下面。',
        tree: { clause: true, s: S('Dad', '主詞'), v: S('fixed', '述語'), o: S('chair', '受詞', { mods: [G('the'), S('broken', '分詞')] }) },
        after: '椅子不會自己壞——它是「被」弄壞的，所以用 -ed。',
      },
      {
        intro: '分詞後面跟著一個介係詞片語：坐在「哪裡」？介係詞片語再掛在分詞下面。',
        en: 'The boy sitting by the window laughed.', zh: '坐在窗邊的男孩笑了。',
        task: '一層一層往下掛：boy → sitting → by | window。',
        tree: { clause: true, s: S('boy', '主詞', { mods: [G('The'), S('sitting', '分詞', { mods: [PP(S('by', '介係詞'), S('window', '介詞受詞', { mods: [G('the')] }))] })] }), v: S('laughed', '述語') },
        after: '掛得再深，骨幹還是 boy ‖ laughed。',
      },
    ],
  },

  /* ------------------------------------------------------------ 5 */
  {
    key: '5', label: '單元 5', name: '合句', group: '合句', mode: 'diagram',
    concept: {
      lead: '兩個完整的句子，可以用 and、but、or、so 綁成一句。',
      body: [
        '合句裡的每一半都有自己的主詞和動詞，各自完整。它們地位相等，所以畫成兩條骨幹上下並排。',
        '連接它們的字（對等連接詞）放在中間的虛線格裡。',
        '跟之後要學的「複句」比較：複句的第二部分會「掛」在第一部分下面；合句是並排，誰也不靠誰。',
      ],
      points: [
        'and：而且　but：但是　or：或者　so：所以',
      ],
      demo: {
        en: 'I cooked, and Mom cleaned.',
        tree: { compound: true, parts: [{ clause: true, s: G('I'), v: G('cooked') }, { conj: G('and') }, { clause: true, s: G('Mom'), v: G('cleaned') }] },
        caption: '兩條骨幹各自完整，中間用 and 連起來。',
      },
    },
    items: [
      {
        intro: '兩個人各做各的事，用 but 表示對比。',
        en: 'Lisa sings, but her brother dances.', zh: 'Lisa 唱歌，但她弟弟跳舞。',
        task: '上下兩條骨幹，連接詞放在中間的虛線格。',
        tree: { compound: true, parts: [{ clause: true, s: S('Lisa', '主詞'), v: S('sings', '述語') }, { conj: S('but', '對等連接詞') }, { clause: true, s: S('brother', '主詞', { mods: [G('her')] }), v: S('dances', '述語') }] },
        after: '把 but 拿掉，兩半都還是完整的句子。',
      },
      {
        intro: 'so 表示結果。兩半的句型不一樣也沒關係：前半是 S + Be V + SC，後半是 S + V。',
        en: 'It was late, so we went home.', zh: '很晚了，所以我們回家了。',
        task: '每條骨幹照自己的句型放。home 描述「去哪裡」，掛在 went 下面。',
        tree: { compound: true, parts: [{ clause: true, s: S('It', '主詞'), v: S('was', 'Be 動詞'), sc: S('late', '主詞補語') }, { conj: S('so', '對等連接詞') }, { clause: true, s: S('we', '主詞'), v: S('went', '述語', { mods: [S('home', '副詞')] }) }] },
        after: '合句的兩半可以是不同的句型，各自完整就好。',
      },
      {
        intro: 'or 表示選擇。can walk 這種「助動詞 + 動詞」連成一張字卡，在骨幹上佔一格。',
        en: 'You can walk, or you can take the bus.', zh: '你可以走路，或者你可以搭公車。',
        task: '兩條骨幹都是 S + V（+ O）。',
        tree: { compound: true, parts: [{ clause: true, s: S('You', '主詞'), v: S('can-walk', '述語') }, { conj: S('or', '對等連接詞') }, { clause: true, s: S('you', '主詞'), v: S('can-take', '述語'), o: S('bus', '受詞', { mods: [G('the')] }) }] },
        after: 'can-walk 用連字號連起來，提醒你它們是同一個動作。',
      },
    ],
  },

  /* ------------------------------------------------------------ 6 */
  {
    key: '6', label: '單元 6', name: '名詞子句', group: '複句', mode: 'diagram',
    concept: {
      lead: '一整個句子，也可以被當成「一個東西」，放進另一個句子的主詞或受詞位置。',
      body: [
        'I think you are right. 裡，think 的受詞是什麼？是 you are right 這整句話。被放進去的那句叫名詞子句。',
        '名詞子句自己也有主詞和動詞，所以它在格子裡自成一條完整的骨幹，也有自己的 ‖。',
        '常見的開頭：that（可省略）、what、where、who、whether。',
      ],
      points: [
        '當受詞：I think you are right.',
        '當主詞：What Mia said surprised everyone.',
      ],
      demo: {
        en: 'I think you are right.',
        tree: { clause: true, s: G('I'), v: G('think'), o: { clause: true, role: '受詞（名詞子句）', s: G('you'), v: G('are'), sc: G('right') } },
        caption: '受詞的位置裡，站著一條完整的小骨幹：you ‖ are | right。',
      },
    },
    items: [
      {
        intro: '名詞子句站在受詞的位置。子句裡面本身是第二型：S + Be V + SC。',
        en: 'I think you are right.', zh: '我覺得你是對的。',
        task: '先放外層骨幹，再放受詞格裡的小骨幹。',
        tree: { clause: true, s: S('I', '主詞'), v: S('think', '述語'), o: { clause: true, role: '受詞（名詞子句）', s: S('you', '子句主詞'), v: S('are', '子句 Be 動詞'), sc: S('right', '子句補語') } },
        after: '原本可以寫成 I think that you are right.，that 常常省略。',
      },
      {
        intro: '這次名詞子句站在主詞的位置。注意 What 在子句裡是 said 的受詞——說了「什麼」。',
        en: 'What Mia said surprised everyone.', zh: 'Mia 說的話讓大家很驚訝。',
        task: '主詞格裡是一條小骨幹。What 放在小骨幹的受詞位置。',
        tree: { clause: true, s: { clause: true, role: '主詞（名詞子句）', s: S('Mia', '子句主詞'), v: S('said', '子句述語'), o: S('What', '子句受詞') }, v: S('surprised', '述語'), o: S('everyone', '受詞') },
        after: '圖解把字序還原了：Mia ‖ said | What。',
      },
      {
        intro: 'where 開頭的名詞子句：不知道「什麼」？不知道「Ken 住在哪裡」這件事。where 在子句裡描述住的地點。',
        en: 'Nobody knows where Ken lives.', zh: '沒有人知道 Ken 住在哪裡。',
        task: 'where 掛在子句的動詞 lives 下面。',
        tree: { clause: true, s: S('Nobody', '主詞'), v: S('knows', '述語'), o: { clause: true, role: '受詞（名詞子句）', s: S('Ken', '子句主詞'), v: S('lives', '子句述語', { mods: [S('where', '疑問副詞')] }) } },
        after: '子句裡的骨幹是 Ken ‖ lives，where 是掛在下面的描述字。',
      },
    ],
  },

  /* ------------------------------------------------------------ 7 */
  {
    key: '7', label: '單元 7', name: '副詞子句', group: '複句', mode: 'diagram',
    concept: {
      lead: '有一種子句專門說明動作「為什麼、什麼時候、在什麼條件下」發生。',
      body: [
        'because、when、if、after、although 這些字（從屬連接詞）會帶出一個完整的子句，用來描述主句的動作。這種子句叫副詞子句。',
        '它是描述語，所以不站在主骨幹上：連接詞掛在被描述的動詞下面，整個子句再掛在連接詞下面。',
        '副詞子句可以放在句首或句尾，圖解的位置都一樣——都掛在動詞下面。',
      ],
      points: [
        'because：原因　when：時間　if：條件',
      ],
      demo: {
        en: 'We stayed inside because it rained.',
        tree: { clause: true, s: G('We'), v: G('stayed', { mods: [G('inside'), G('because', { mods: [{ clause: true, s: G('it'), v: G('rained') }] })] }) },
        caption: '主骨幹是 We ‖ stayed；because 掛在 stayed 下，it ‖ rained 再掛在 because 下。',
      },
    },
    items: [
      {
        intro: 'because 說明「為什麼」留在室內。注意 inside 也是描述 stayed 的字。',
        en: 'We stayed inside because it rained.', zh: '因為下雨，我們留在室內。',
        task: '主骨幹先放好，再一層一層往下掛。',
        tree: { clause: true, s: S('We', '主詞'), v: S('stayed', '述語', { mods: [S('inside', '副詞'), S('because', '連接詞', { mods: [{ clause: true, s: S('it', '子句主詞'), v: S('rained', '子句述語') }] })] }) },
        after: '整個 because it rained 都在回答：為什麼 stayed？',
      },
      {
        intro: 'when 說明「什麼時候」。will call 連成一張字卡。',
        en: 'I will call you when I arrive.', zh: '我到的時候會打給你。',
        task: '主句是 S + V + O；when 子句掛在動詞下面。',
        tree: { clause: true, s: S('I', '主詞'), v: S('will-call', '述語', { mods: [S('when', '連接詞', { mods: [{ clause: true, s: S('I', '子句主詞'), v: S('arrive', '子句述語') }] })] }), o: S('you', '受詞') },
        after: '句子裡有兩個 I，一個在主句、一個在子句，各自是自己骨幹的主詞。',
      },
      {
        intro: '副詞子句放在句首，也還是掛在主句的動詞下面。先找主句的骨幹。',
        en: 'If it snows, the school closes.', zh: '如果下雪，學校就停課。',
        task: '字序是子句在前，但圖解裡子句一樣掛在 closes 下面。',
        tree: { clause: true, s: S('school', '主詞', { mods: [G('the')] }), v: S('closes', '述語', { mods: [S('If', '連接詞', { mods: [{ clause: true, s: S('it', '子句主詞'), v: S('snows', '子句述語') }] })] }) },
        after: '句子的開頭不一定是主詞——先找 ‖ 在哪裡。',
      },
    ],
  },

  /* ------------------------------------------------------------ 8 */
  {
    key: '8', label: '單元 8', name: '形容詞子句', group: '複句', mode: 'diagram',
    concept: {
      lead: '一整個子句也可以拿來描述一個名詞，告訴你「是哪一個」。',
      body: [
        'Students who practice daily：不是所有學生，是「每天練習的」學生。who practice daily 描述 students，這種子句叫形容詞子句（關係子句）。',
        '它是描述語，所以整條子句掛在它描述的名詞下面。',
        'who、which、that 叫關係代名詞，它們在子句裡面也有工作：當子句的主詞或受詞。',
      ],
      points: [
        'who：指人　which：指東西　that：人或東西都可以',
        '把掛在下面的子句遮起來，主句的骨幹就會出現——這是拆長句最有用的一招。',
      ],
      demo: {
        en: 'Students who practice daily improve quickly.',
        tree: { clause: true, s: G('Students', { mods: [{ clause: true, s: G('who'), v: G('practice', { mods: [G('daily')] }) }] }), v: G('improve', { mods: [G('quickly')] }) },
        caption: '主骨幹是 Students ‖ improve；who ‖ practice 整條掛在 Students 下面。',
      },
    },
    items: [
      {
        intro: 'who 在子句裡是主詞：誰每天練習？who（就是那些學生）。',
        en: 'Students who practice daily improve quickly.', zh: '每天練習的學生進步得很快。',
        task: '主句和子句各有一條骨幹。子句掛在 Students 下面。',
        tree: { clause: true, s: S('Students', '主句主詞', { mods: [{ clause: true, s: S('who', '關係代名詞'), v: S('practice', '子句述語', { mods: [S('daily', '副詞')] }) }] }), v: S('improve', '主句述語', { mods: [S('quickly', '副詞')] }) },
        after: '遮住子句：Students ‖ improve。',
      },
      {
        intro: '這次 which 在子句裡是受詞：你做了什麼？做了 which（就是那個蛋糕）。',
        en: 'I like the cake which you made.', zh: '我喜歡你做的那個蛋糕。',
        task: '子句掛在 cake 下面。which 放在子句的受詞位置。',
        tree: { clause: true, s: S('I', '主詞'), v: S('like', '述語'), o: S('cake', '受詞', { mods: [G('the'), { clause: true, s: S('you', '子句主詞'), v: S('made', '子句述語'), o: S('which', '關係代名詞') }] }) },
        after: '圖解把子句的字序還原了：you ‖ made | which。',
      },
      {
        intro: '子句本身是第四型（借了「我」一本書），主句是第二型。一句話裡有兩種句型。',
        en: 'The book that Mia lent me was boring.', zh: 'Mia 借我的那本書很無聊。',
        task: '主句的骨幹被子句隔開了，先找 ‖ 在哪裡。',
        tree: { clause: true, s: S('book', '主詞', { mods: [G('The'), { clause: true, s: S('Mia', '子句主詞'), v: S('lent', '子句述語'), io: S('me', '間接受詞'), o: S('that', '關係代名詞') }] }), v: S('was', 'Be 動詞'), sc: S('boring', '主詞補語') },
        after: '遮住子句：book ‖ was | boring。',
      },
    ],
  },

  /* ------------------------------------------------------------ 9 */
  {
    key: '9', label: '單元 9', name: '分詞構句', group: '句子的伸縮', mode: 'diagram',
    concept: {
      lead: '把副詞子句縮短，就變成分詞構句。',
      body: [
        'Because Sam felt tired, Sam went home. → Feeling tired, Sam went home.——主詞相同時，可以把子句的連接詞和主詞拿掉，動詞改成分詞。',
        '分詞構句說的是主詞當時的狀態或原因，所以圖解時掛在主詞下面。',
        '-ing 表示主詞自己在做；-ed 表示主詞被怎麼了。',
      ],
      points: [
        '它常出現在句首，後面有逗號。逗號之後才是主句的骨幹。',
      ],
      demo: {
        en: 'Feeling tired, Sam went home early.',
        tree: { clause: true, s: G('Sam', { mods: [PH(G('Feeling'), G('tired'))] }), v: G('went', { mods: [G('home'), G('early')] }) },
        caption: 'Feeling tired 描述 Sam 的狀態，掛在 Sam 下面。',
      },
    },
    items: [
      {
        intro: '覺得累的是 Sam，所以分詞片語掛在 Sam 下面。',
        en: 'Feeling tired, Sam went home early.', zh: '覺得累了，Sam 提早回家。',
        task: '逗號後面是主句。先放骨幹，再掛分詞片語。',
        tree: { clause: true, s: S('Sam', '主詞', { mods: [PH(S('Feeling', '分詞'), S('tired', '分詞的補語'))] }), v: S('went', '述語', { mods: [S('home', '副詞'), S('early', '副詞')] }) },
        after: '還原成子句：Because Sam felt tired, …',
      },
      {
        intro: '笑著的是女孩。描述「怎麼笑」的 happily 再掛在 Smiling 下面。',
        en: 'Smiling happily, the girl opened the gift.', zh: '女孩開心地笑著，打開了禮物。',
        task: '主句是 S + V + O；分詞掛在主詞下面。',
        tree: { clause: true, s: S('girl', '主詞', { mods: [G('the'), S('Smiling', '分詞', { mods: [S('happily', '副詞')] })] }), v: S('opened', '述語'), o: S('gift', '受詞', { mods: [G('the')] }) },
        after: '分詞構句和主句的主詞是同一個人。',
      },
      {
        intro: '-ed 開頭：車子「被」雪蓋住了。with snow 說明被什麼蓋住，掛在 Covered 下面。',
        en: 'Covered with snow, the car looked white.', zh: '被雪覆蓋，車子看起來白白的。',
        task: '主句是 S + V + SC：look 在這裡跟 be 動詞一樣，後面接補語。',
        tree: { clause: true, s: S('car', '主詞', { mods: [G('the'), S('Covered', '分詞', { mods: [PP(S('with', '介係詞'), S('snow', '介詞受詞'))] })] }), v: S('looked', '述語'), sc: S('white', '主詞補語') },
        after: 'look、seem、become 這些動詞後面也接補語。',
      },
    ],
  },

  /* ------------------------------------------------------------ 10 */
  {
    key: '10', label: '單元 10', name: '倒裝句', group: '句子的伸縮', mode: 'diagram',
    concept: {
      lead: '有時候英文會把字序打亂來強調某個字，但句子的結構沒有變。',
      body: [
        'Never have I seen such a mess. 把 Never 移到最前面強調，助動詞 have 跑到主詞前面。',
        '圖解不管字序：先找出主詞和動詞，照骨幹的順序擺回去。這就是圖解的好處——字序再亂，結構都看得出來。',
      ],
      points: [
        '常見的倒裝開頭：Never、Rarely、Here、There、Only。',
        '相關連接詞（both … and、not only … but also）的畫法還在設計中，這一版先練倒裝。',
      ],
      demo: {
        en: 'Here comes the bus.',
        tree: { clause: true, s: G('bus', { mods: [G('the')] }), v: G('comes', { mods: [G('Here')] }) },
        caption: '字序是 Here comes the bus，骨幹還是 bus ‖ comes。',
      },
    },
    items: [
      {
        intro: 'Here 在最前面，主詞跑到動詞後面去了。誰來了？',
        en: 'Here comes the bus.', zh: '公車來了。',
        task: '把主詞擺回 ‖ 的左邊。',
        tree: { clause: true, s: S('bus', '主詞', { mods: [G('the')] }), v: S('comes', '述語', { mods: [S('Here', '副詞')] }) },
        after: '照骨幹的順序讀：The bus comes here.',
      },
      {
        intro: 'Never 移到句首，助動詞 have 跑到主詞前面。have seen 連成一張字卡。',
        en: 'Never have I seen such a mess.', zh: '我從沒見過這麼亂的場面。',
        task: '先找主詞和述語，再放受詞。',
        tree: { clause: true, s: S('I', '主詞'), v: S('have-seen', '述語', { mods: [S('Never', '副詞')] }), o: S('mess', '受詞', { mods: [G('such'), G('a')] }) },
        after: '還原：I have never seen such a mess.',
      },
      {
        intro: 'Rarely 開頭時要借助動詞 does。does eat 連成一張字卡。',
        en: 'Rarely does Ken eat meat.', zh: 'Ken 很少吃肉。',
        task: '這是 S + V + O，只是字序被打亂了。',
        tree: { clause: true, s: S('Ken', '主詞'), v: S('does-eat', '述語', { mods: [S('Rarely', '副詞')] }), o: S('meat', '受詞') },
        after: '還原：Ken rarely eats meat.',
      },
    ],
  },

  /* ------------------------------------------------------------ 11 */
  {
    key: '11', label: '單元 11', name: '比較級', group: '句子的伸縮', mode: 'diagram',
    concept: {
      lead: 'than 和 as 的後面，常常藏著一個被省略的句子。',
      body: [
        'Kevin swims faster than his sister. 說完整是 … than his sister swims.——後面的 swims 因為重複，被省略了。',
        '圖解會把省略的字補回來，寫在括號裡。括號裡的字不會出現在字卡上，要自己想、自己打出來。',
        '看得見省略的字，就看得懂比較的到底是什麼跟什麼。',
      ],
      points: [
        'than 是連接詞，掛在比較的字（faster）下面；省略的子句再掛在 than 下面。',
        'as … as 也一樣：第一個 as 描述程度，第二個 as 帶出省略的子句。',
      ],
      demo: {
        en: 'Kevin swims faster than his sister.',
        tree: { clause: true, s: G('Kevin'), v: G('swims', { mods: [G('faster', { mods: [G('than', { mods: [{ clause: true, s: G('sister', { mods: [G('his')] }), v: G('(swims)') }] })] })] }) },
        caption: '括號裡的 (swims) 句子裡沒寫出來，但結構上它在那裡。',
      },
    },
    items: [
      {
        intro: 'than 後面的子句省略了動詞。想想看：his sister 怎麼了？',
        en: 'Kevin swims faster than his sister.', zh: 'Kevin 游得比他姊姊快。',
        task: '括號格要自己打字：被省略的是哪個字？',
        tree: { clause: true, s: S('Kevin', '主詞'), v: S('swims', '述語', { mods: [S('faster', '副詞', { mods: [S('than', '連接詞', { mods: [{ clause: true, s: S('sister', '省略子句的主詞', { mods: [G('his')] }), v: U('swims', '省略的述語') }] })] })] }) },
        after: '完整的句子：Kevin swims faster than his sister swims.',
      },
      {
        intro: '比較的是兩個人的包包。yours 是「你的（包包）」，後面省略了 be 動詞。',
        en: 'My bag is heavier than yours.', zh: '我的包包比你的重。',
        task: 'than 掛在補語 heavier 下面；括號裡打出省略的 be 動詞。',
        tree: { clause: true, s: S('bag', '主詞', { mods: [G('My')] }), v: S('is', 'Be 動詞'), sc: S('heavier', '主詞補語', { mods: [S('than', '連接詞', { mods: [{ clause: true, s: S('yours', '省略子句的主詞'), v: U('is', '省略的 Be 動詞') }] })] }) },
        after: '完整的句子：My bag is heavier than yours is.',
      },
      {
        intro: 'as … as 是「一樣」。第二個 as 後面省略的不只動詞，連補語也省略了——兩格都要自己打。',
        en: 'She is as tall as her mother.', zh: '她跟她媽媽一樣高。',
        task: '兩個 as 的工作不一樣：第一個掛在 tall 下描述程度，第二個帶出省略的子句。',
        tree: { clause: true, s: S('She', '主詞'), v: S('is', 'Be 動詞'), sc: S('tall', '主詞補語', { mods: [S('as', '副詞'), S('as', '連接詞', { mods: [{ clause: true, s: S('mother', '省略子句的主詞', { mods: [G('her')] }), v: U('is', '省略的 Be 動詞'), sc: U('tall', '省略的補語') }] })] }) },
        after: '完整的句子：She is as tall as her mother is tall.',
      },
    ],
  },

  /* ------------------------------------------------------------ 12 */
  {
    key: '12', label: '單元 12', name: '文章圖解', group: '終點', mode: 'diagram',
    concept: {
      lead: '最後一步：把一整段文章，一句一句畫下來。',
      body: [
        '直角記號可以由上往下一句接一句地堆疊，一段文章畫完還是很清楚。',
        '每一句先找骨幹。骨幹連起來讀，就是這段文章在說的事情。',
      ],
      points: [
        '前面學過的每一種結構，都會在文章裡出現。',
      ],
      demo: {
        en: 'The bell rang. The students ran outside.',
        tree: { passage: true, parts: [{ clause: true, s: G('bell', { mods: [G('The')] }), v: G('rang') }, { clause: true, s: G('students', { mods: [G('The')] }), v: G('ran', { mods: [G('outside')] }) }] },
        caption: '只讀骨幹：bell ‖ rang，students ‖ ran。',
      },
    },
    items: [
      {
        intro: '兩句短句。每一句都先找骨幹。',
        en: 'The bell rang. The students ran outside.', zh: '鐘響了。學生們跑到外面。',
        task: '由上往下，一句一句放。',
        tree: { passage: true, parts: [{ clause: true, s: S('bell', '主詞', { mods: [G('The')] }), v: S('rang', '述語') }, { clause: true, s: S('students', '主詞', { mods: [G('The')] }), v: S('ran', '述語', { mods: [S('outside', '副詞')] }) }] },
        after: '骨幹連起來：鐘響了，學生跑了。',
      },
      {
        intro: '第二句有一個介係詞片語：跑向「誰」？',
        en: 'Ana opened the door. Her dog ran to her.', zh: 'Ana 打開門。她的狗跑向她。',
        task: '第一句是 S + V + O，第二句是 S + V 加上掛在下面的介係詞片語。',
        tree: { passage: true, parts: [{ clause: true, s: S('Ana', '主詞'), v: S('opened', '述語'), o: S('door', '受詞', { mods: [G('the')] }) }, { clause: true, s: S('dog', '主詞', { mods: [G('Her')] }), v: S('ran', '述語', { mods: [PP(S('to', '介係詞'), S('her', '介詞受詞'))] }) }] },
        after: '骨幹連起來：Ana 開了門，狗跑了。',
      },
      {
        intro: '這段混了兩種結構：第一句有不定詞，第二句是合句。',
        en: 'It started to rain. We ran, but we got wet.', zh: '開始下雨了。我們跑了，但還是淋濕了。',
        task: '第二句是兩條骨幹，中間放對等連接詞。',
        tree: { passage: true, parts: [{ clause: true, s: S('It', '主詞'), v: S('started', '述語'), o: PH(S('to rain', '不定詞')) }, { compound: true, parts: [{ clause: true, s: S('We', '主詞'), v: S('ran', '述語') }, { conj: S('but', '對等連接詞') }, { clause: true, s: S('we', '主詞'), v: S('got', '述語'), sc: S('wet', '主詞補語') }] }] },
        after: 'got wet 的 got 跟 be 動詞一樣，後面接補語。',
      },
    ],
  },
];

export const unitByKey = (key) => UNITS.find((u) => u.key === key);
