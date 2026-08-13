/* ── 本文を句点で1文改行（applyKuten） ─────────────────────────
   対象要素の「直下テキストノード」だけを走査し、文中の「。」の直後に<br>を入れる。
   ・末尾の「。」や、直後が既に<br>のときは入れない（二重防止）。
   ・「。」の直後が閉じ括弧・引用符なら同一文とみなし改行しない。
   ・<a>/<b>/<span>等はテキストノード走査のため壊さない（innerHTML全置換はしない）。 */
var KUTEN_SEL='.np-body, .np-lead, .faq p, .zukan-sub, .sgk-desc, .bench-lead, .analysis .an-summary p, #genjo p, #future p, #dx p, #about-hitomi p, #kadai p, #flow p, #guide p, #check p, #teichaku p, #hiyari p, #kazoku p, #kiroku p, .subt, #pfAnalysis p, #profile .pf-tldr p, #profile .pf-lead, #profile .pf-scene p, #profile .pf-grow-col p';
var KUTEN_SKIP_SEL='.gj-chart-note,.gj-chart-src,.jk-note,.jk-hdrop,.dxc-sub,.dxc-src,.dxc-note,.sg-note,.certnote,.rk-cap,.cf-note,.cf-help,.share-cap,.qrcap,.rankcap,.pf-quote';
var KUTEN_CLOSERS='」』）)】〉》〕］]”’＞>';
function kutenSplitNode(tn){
  var v=tn.nodeValue;
  if(!v || v.indexOf('。')<0) return;
  var parent=tn.parentNode; if(!parent) return;
  var nextEl=tn.nextSibling;
  var frag=document.createDocumentFragment();
  var buf=''; var changed=false;
  for(var i=0;i<v.length;i++){
    var ch=v[i]; buf+=ch;
    if(ch==='。'){
      var afterTrim=v.slice(i+1).replace(/^\s+/,'');
      if(afterTrim.length>0){
        if(KUTEN_CLOSERS.indexOf(afterTrim.charAt(0))>=0) continue; // 直後が閉じ括弧等＝同一文
        frag.appendChild(document.createTextNode(buf));
        frag.appendChild(document.createElement('br'));
        buf=''; changed=true;
      } else if(nextEl && !(nextEl.nodeType===1 && nextEl.tagName==='BR')){
        // ノード末尾の「。」：後続の兄弟が<br>以外（要素/テキスト）なら改行
        frag.appendChild(document.createTextNode(buf));
        frag.appendChild(document.createElement('br'));
        buf=''; changed=true;
      }
    }
  }
  if(!changed) return;
  if(buf) frag.appendChild(document.createTextNode(buf));
  parent.replaceChild(frag,tn);
}
function kutenEl(el){
  if(!el || el.nodeType!==1) return;
  if(el.getAttribute('data-kuten-done')==='1') return;
  var kids=[].slice.call(el.childNodes);
  for(var i=0;i<kids.length;i++){ if(kids[i].nodeType===3) kutenSplitNode(kids[i]); }
  el.setAttribute('data-kuten-done','1');
}
function kutenForce(el){ if(!el) return; el.removeAttribute('data-kuten-done'); kutenEl(el); } // textContent再代入後の再適用用
function applyKuten(root){
  if(!root || !root.querySelectorAll) return;
  if(typeof I18N_LANG==='string' && I18N_LANG!=='ja') return; // 句点改行は日本語専用
  var els=root.querySelectorAll(KUTEN_SEL);
  for(var i=0;i<els.length;i++){
    var e=els[i];
    if(e.matches && e.matches(KUTEN_SKIP_SEL)) continue; // 注記/キャプション/見出し系は除外
    var tx=(e.textContent||'').replace(/^\s+/,'');
    if(tx.charAt(0)==='※'||tx.indexOf('出典')>=0) continue; // 注記・出典は除外
    kutenEl(e);
  }
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){applyKuten(document);}); } else { applyKuten(document); }

const TYPES = {
  inu:    {emoji:'🐶', ax:'inu',    name:'仲間思いのイヌ型',     axisJa:'離職率の低さ',   color:'#f5a623', rarity:'18%', catch:'スタッフが辞めない、あったか職場', desc:'人がここで働き続けたいと思える施設。温かいチームが、そのまま利用者の安心になるタイプです。'},
  penguin:{emoji:'🐧', ax:'penguin',name:'みんなで育てるペンギン型',axisJa:'育成', color:'#4a89b8', rarity:'9%',  catch:'研修で人が育つ', desc:'研修やOJTの仕組みが整い、新人もベテランも伸びていく。人を育てるのが得意な施設です。'},
  fukurou:{emoji:'🦉', ax:'fukurou',name:'先進のフクロウ型',     axisJa:'DX',     color:'#6c5ce7', rarity:'12%', catch:'デジタルで賢く回す未来派',     desc:'記録もコミュニケーションもデジタルで効率化。センサーやロボットも使いこなし、無駄な残業を減らしてスマートに運営する知恵者タイプです。'},
  kitsune:{emoji:'🦊', ax:'kitsune',name:'やりくり上手のキツネ型',axisJa:'経営',  color:'#e17055', rarity:'15%', catch:'補助金も黒字も抜かりなし',     desc:'使える制度や補助金はしっかり活用し、堅実に黒字を継続。多角的な事業展開でしたたかに稼ぐ、経営巧者タイプです。'},
  usagi:  {emoji:'🐰', ax:'usagi',  name:'勢いのウサギ型',       axisJa:'事業成長',   color:'#e84393', rarity:'10%', catch:'ぐんぐん跳ねて成長中',         desc:'事業所も売上も右肩上がり。新しいことにどんどん挑戦する、今一番ノっている急成長タイプ。これからが楽しみな施設です。'},
  iruka:  {emoji:'🐨', ax:'iruka',  name:'人気者のコアラ型',     axisJa:'稼働',   color:'#00b8d4', rarity:'14%', catch:'いつも満員、紹介が絶えない',   desc:'地域から選ばれ、口コミと紹介で問い合わせが途切れない。空き待ちが出るほどの信頼を集める、稼働率の高い人気者タイプです。'},
  beaver: {emoji:'🦫', ax:'beaver', name:'職人ぞろいのビーバー型',axisJa:'専門職', color:'#a9743f', rarity:'8%',  catch:'有資格者ぞろいの専門集団', desc:'介護福祉士や専門職が多く、確かな知識と技術で質の高いケアを提供できる職人タイプです。'},
  risu:   {emoji:'🐿', ax:'risu',   name:'食事自慢のリス型',     axisJa:'食事',   color:'#d99a2b', rarity:'7%',  catch:'食事と栄養ケアが自慢', desc:'一人ひとりに合わせた栄養の見直しやお口のケアの体制が整い、食べる楽しみと健康をしっかり支える施設です。'},
  hachi:  {emoji:'🐝', ax:'hachi',  name:'地域とつながるミツバチ型', axisJa:'地域連携', color:'#f2a900', rarity:'11%', catch:'地域に開かれ、皆でつながる', desc:'ボランティアや実習の受け入れ、地域包括支援センターとの連携や防災協定など、地域とのつながりが豊富。まちぐるみで支え合う、地域に開かれた施設です。'},
  kuma:   {emoji:'🐻', ax:'kuma',   name:'安心・安全のクマ型',   axisJa:'安全対策',   color:'#8d6e63', rarity:'13%', catch:'事故を防ぐ、安心・安全', desc:'事故予防や緊急時の備えが行き届き、処分歴もなし。利用者が安心して過ごせる、守りの堅い施設です。'},
  ookami: {emoji:'🐺', ax:'ookami', name:'用心深いオオカミ型',   axisJa:'危機管理',   color:'#5c7080', rarity:'6%',  catch:'感染・災害への備えは万全', desc:'感染症・食中毒対策やBCP・備蓄まで抜かりなく、いざという時に強い、用心深い施設です。'},
  zou:    {emoji:'🐘', ax:'zou',    name:'働きやすいゾウ型',     axisJa:'働きやすさ', color:'#6aa84f', rarity:'16%', catch:'残業少なく休みやすい職場', desc:'残業が少なく休日や有給も取りやすい、働きやすさが自慢。職員にやさしい環境づくりが得意な施設です。'},
};

const PROFILE = {
  kitsune:{intro:'使える制度や補助金は逃さず、堅実に黒字を継続。多角化でリスクも分散する、したたかな経営巧者タイプです。',
    strong:['補助金・制度の活用がとにかくうまい','数字に強く、堅実な黒字経営','複数事業でリスクを分散','投資の判断が的確'],
    grow:['経営はとても安定。同じ知恵を人材育成やDXにも回すと、更に強くなる'],
    aru:['補助金の締切は誰よりも早く把握','無駄な支出がほとんどない'],
    match:'先進のフクロウ型（DX）— 効率も収益も最大化',
    advice:'その経営センスをデータで"仕組み化"すると、規模を広げても崩れません。'},
  penguin:{intro:'研修やOJTの仕組みが整い、新人もベテランも伸びていく、人を育てるのが得意なタイプです。',
    strong:['研修・育成の仕組みがある','新人が早く一人前になる','認知症など専門研修の修了者が多い','学び合う文化が根づいている'],
    grow:['育てた人材が定着する仕組みとセットにすると、更に強くなる'],
    aru:['新人がすぐ現場になじむ','勉強会がいつも活発'],
    match:'仲間思いのイヌ型（定着）— 育てて、長く働いてもらう',
    advice:'研修記録をデジタルで管理すると、誰が何を学んだかが見える化できます。'},
  fukurou:{intro:'記録もやり取りもデジタルで効率化し、センサーやロボットも使いこなす知恵者タイプ。無駄な残業を減らし、スマートに運営します。',
    strong:['業務効率が高く、生産性が抜群','残業が少なく働きやすい','情報共有がスムーズでミスが少ない','新しい技術への適応が早い'],
    grow:['効率は十分。その余力を集客や人材育成に振り向けると伸びる'],
    aru:['紙の記録はもうほとんど見ない','夜勤の負担が年々軽くなっている'],
    match:'やりくり上手のキツネ型（経営）— 最強の筋肉質経営',
    advice:'蓄積したデータは宝。ケアの質の"見える化"に使うと、他施設と差がつきます。'},
  inu:{intro:'人がここで働き続けたいと思える施設。温かいチームが、そのまま利用者の安心になるタイプです。',
    strong:['離職が少なく、ベテランが育つ','職場の雰囲気が良い','教育・定着の仕組みがある','利用者・ご家族からの信頼が厚い'],
    grow:['人の力は十分。DXで現場の負担を減らすと、働きやすさが完成形に'],
    aru:['一度辞めた職員が戻ってくる','口コミで応募が来る'],
    match:'人気者のコアラ型（稼働）—「働きたい＆入りたい」施設に',
    advice:'その定着力は最大の資産。仕組みとして言語化すれば、採用ブランドになります。'},
  usagi:{intro:'事業所も売上も右肩上がり。新しいことにどんどん挑戦する、今一番ノっている急成長タイプ。これからが楽しみな施設です。',
    strong:['行動が速く、挑戦的','事業拡大の勢いがある','新サービスを次々と形にする','変化を恐れない'],
    grow:['勢いはピカイチ。足元の人材定着と仕組み化が追いつくと更に安定します'],
    aru:['気づけば事業所が増えている','現場が追いつくのに必死（笑）'],
    match:'仲間思いのイヌ型（定着）— 急成長しても崩れない',
    advice:'成長期こそ仕組み化のチャンス。今のうちに記録・教育を整えると、伸びが加速します。'},
  iruka:{intro:'地域から選ばれ、口コミと紹介で問い合わせが途切れない人気者タイプ。空き待ちが出るほどの信頼を集めています。',
    strong:['稼働率が高い','紹介・口コミが強い','地域での評判が良い','選ばれる理由が明確'],
    grow:['人気は十分。その需要を活かして事業を広げると一気に伸びる'],
    aru:['いつも満室に近い','紹介だけで枠が埋まる'],
    match:'勢いのウサギ型（成長）— 人気を"拡大"に変えられる',
    advice:'選ばれる理由をデータで把握すると、再現性のある集客に変わります。'},
  beaver:{intro:'介護福祉士や専門職が多く、確かな知識と技術で質の高いケアを提供できる職人タイプです。',
    strong:['有資格者・専門職が多い','専門的なケアに対応できる','チームの技術レベルが高い','加算の取得にも有利'],
    grow:['高い専門性を、対外的な発信や採用ブランドにも活かすと強い'],
    aru:['難しいケースも施設の中で対応できる','他施設から相談が来る'],
    match:'みんなで育てるペンギン型（育成）— 専門性を次の世代へ',
    advice:'資格・研修の保有状況をデータ管理すると、強みを採用や加算に活かせます。'},
  risu:{intro:'一人ひとりに合わせた栄養の見直しやお口のケアの体制が整い、食べる楽しみと健康をしっかり支える食事自慢のタイプです。',
    strong:['栄養ケアの体制がある','管理栄養士が活躍している','お口のケアまで行き届く','食事の満足度が高い'],
    grow:['食の強みを、栄養加算の取得や家族への発信につなげると魅力が増す'],
    aru:['食事の評判で選ばれる','行事食が楽しみという声が多い'],
    match:'職人ぞろいのビーバー型（専門職）— 管理栄養士の力で質を極める',
    advice:'栄養やお口のケア記録をデジタル化すると、加算と質を両立できます。'},
  hachi:{intro:'ボランティアや実習の受け入れ、地域包括支援センターとの連携や防災協定など、地域とのつながりが豊富。まちぐるみで支え合う、地域に開かれたタイプです。',
    strong:['ボランティア・実習の受け入れが活発','地域包括支援センターとの連携が強い','防災協定など地域と協力体制がある','広報や行事で地域に開かれている'],
    grow:['地域とのつながりを記録・発信すると、信頼と集客の両方につながる'],
    aru:['地域の行事によく顔を出す','近隣から相談や見学が多い'],
    match:'人気者のコアラ型（稼働）— 地域の信頼が評判を呼ぶ',
    advice:'地域連携の実績を記録・発信すると、施設の信頼がそのまま強みになります。'},
  kuma:{intro:'事故予防や緊急時の備えが行き届き、処分歴もなし。利用者が安心して過ごせる、守りの堅いタイプです。',
    strong:['事故予防の仕組みがある','緊急時の対応が整っている','処分・指導歴がない','損害賠償保険も万全'],
    grow:['安全の取り組みを家族に伝えると、信頼が更に高まる'],
    aru:['ヒヤリハットの共有が習慣','大きな事故が起きていない'],
    match:'用心深いオオカミ型（備え）— 守りの堅さで地域一番の安心',
    advice:'事故・ヒヤリハット記録をデジタル化すると、予防の精度が上がります。'},
  ookami:{intro:'感染症・食中毒対策やBCP・備蓄まで抜かりなく、いざという時に強い、用心深いタイプです。',
    strong:['感染症・食中毒対策が万全','BCP（事業継続計画）がある','備蓄や訓練が行き届く','危機対応に強い'],
    grow:['平時の備えを、安全・安心の発信材料として活かすと信頼が増す'],
    aru:['感染症の流行期も落ち着いている','災害訓練を定期的に実施'],
    match:'安心・安全のクマ型（安全）— 守りを固めて地域の砦に',
    advice:'BCPや訓練の記録を整えると、いざという時の対応が更に速くなります。'},
  zou:{intro:'残業が少なく休日や有給も取りやすい、働きやすさが自慢。職員にやさしい環境づくりが得意なタイプです。',
    strong:['残業が少ない','休日・有給が取りやすい','育休など制度が整っている','柔軟な勤務形態がある'],
    grow:['働きやすさを採用ページで発信すると、応募が集まりやすい'],
    aru:['有給がしっかり消化される','子育て中の職員も続けやすい'],
    match:'仲間思いのイヌ型（定着）— 働きやすさが定着を生む',
    advice:'勤務シフトや休暇をデジタルで管理すると、働きやすさを保てます。'},
};
const AXES = ['inu','penguin','fukurou','kitsune','usagi','iruka','beaver','risu','hachi','kuma','ookami','zou'];
const AXJA = {inu:'離職率',penguin:'育成',fukurou:'DX',kitsune:'経営',usagi:'事業成長',iruka:'稼働',beaver:'専門職',risu:'食事',hachi:'地域連携',kuma:'安全対策',ookami:'危機管理',zou:'働きやすさ'};
// 離職率の表示ルール：内部の点数は「定着達成率（高い＝良い）」のまま（判定・バッジ・ランキングは従来どおり）。
// 画面に出す数値だけ inu 軸を 100−達成率＝「離職率(%)（低い＝良い）」に反転して見せる。
function dispV(k,v){ if(k!=='inu'||typeof v!=='number'||isNaN(v)) return v; var r=100-v; return r<0?0:(r>100?100:r); }
// 「良い方向（強み）」の文脈で使う軸名。inu は「離職率」単独だと誤読するので「離職率の低さ」に。
function axStrong(k){ return k==='inu'?t('ax.inu.strong'):AXJA[k]; }
// 離職率は実測統計ではなく定着データからの換算目安。数値を出す箇所に添える注記。
var INU_NOTE = '※「離職率」は公開データの定着状況から算出した目安です（実測の離職率ではありません）。';
const AX_GLOSS = {penguin:'新人や若手をきちんと育てているか',fukurou:'記録や事務をパソコンで楽にできているか',risu:'食事や栄養に手をかけられているか',kuma:'事故やケガを防ぐ仕組みがあるか',ookami:'災害や急病など、もしもの時への備え',hachi:'まわりの人や地域とつながっているか',inu:'職員が辞めずに長く働いてくれているか',beaver:'資格を持つ人がしっかりそろっているか',kitsune:'お金のやりくりがうまく回っているか',usagi:'利用者が増え、事業が伸びているか',iruka:'ベッドや利用枠がどれだけ埋まっているか',zou:'職員が気持ちよく働ける職場か'};
// 総合診断文（rAnalysis）で使う解釈フレーズ。翻訳のため関数外に定義し、辞書に載せる（文言は変更なし）。
// 軸ごとの「高いとき／低いとき」解釈フレーズ
var AX_HIGH={
  penguin:'新しく入った人に先輩がしっかりついて、「見て覚えて」で終わらせず、仕事の手順を一つずつ教えているからではないでしょうか。例えば初めての入浴介助の日に、先輩が横で声をかけながら一緒に入り、終わってから「ここはこうするといいよ」と振り返る。入って数日で一人にしない、そんな雰囲気があるのかもしれません。',
  fukurou:'申し送りやヒヤリハットが、スマホやパソコンですぐに全員へ届き、「あれ、言ったっけ？」の伝え忘れが減っているからではないでしょうか。例えば夜勤明けの申し送りも、その場に来られなかった人が後からスマホで同じ内容を確認できる。書類の山から記録を探す時間も、少ないのかもしれません。',
  risu:'一人ひとりの食べた量や飲み込みの様子まで目が届き、「最近あまり食べていないな」に早く気づけているからではないでしょうか。例えば数日続けて食が細い方がいれば、きざみやとろみを変えたり、好きなものを一品足したりと、その人に合わせて手を打てている。栄養の相談先も、はっきりしているのかもしれません。',
  kuma:'ヒヤッとしたことをその場ですぐ共有し、「次はどう防ぐか」まで話し合えているからではないでしょうか。例えば同じ廊下で二度ヒヤリがあれば、その日のうちに手すりや床の見直しまで話が進む。転びやすい場所や時間帯を、職員皆が分かっているのかもしれません。',
  ookami:'地震や急な発熱、感染が出た時に「誰が何をするか」が決まっていて、いざという時に慌てず動けるからではないでしょうか。例えば夜中に熱を出した方が出ても、誰が家族へ連絡し、誰が受診の手配をするかが決まっている。逃げ方や連絡の順番を、皆で確かめているのかもしれません。',
  hachi:'近所のご家族や病院、ケアマネさんから「あそこなら安心」と声をかけてもらえる関係ができているからではないでしょうか。例えば退院してくる方の相談が病院から直接入ったり、見学の問い合わせが口コミで続いたりする。行事や地域の集まりも、日頃から受け入れているのかもしれません。',
  inu:'長く働いてくれる職員が多く、利用者も「いつもの人」に安心して任せられているからではないでしょうか。例えば入居者が朝一番に名前で声をかけてくるのは、顔ぶれが変わらないから。新しい人が入っても、辞めずに続く雰囲気があるのかもしれません。',
  beaver:'看護や機能訓練、相談などの専門の人がそろっていて、「これは誰に聞けばいい」がはっきりしているからではないでしょうか。例えば傷や薬のことで迷ったら看護職へ、動きが落ちてきた方は機能訓練の担当へと、その場で相談できる。難しいケースも、一人で抱え込まずにすんでいるのかもしれません。',
  kitsune:'お金の見通しが立っていて、「来月は大丈夫かな」と毎月ひやひやせずに運営できているからではないでしょうか。例えば毎月の収支をつかめているので、備品の買い替えや人の補充も、慌てずに決められる。必要なところにお金を回す余裕も、あるのかもしれません。',
  usagi:'新しいやり方や新しいサービスに前向きで、「まずやってみよう」と動ける雰囲気があるからではないでしょうか。例えば近くのニーズに気づいたら、小さく始めて様子を見ながら広げていく。良い評判が広がって、少しずつできることを増やしているのかもしれません。',
  iruka:'ベッドや利用の枠がしっかり埋まり、「空きが出てもすぐ次の方が決まる」状態ではないでしょうか。例えば一人退所されても、待っていた方やケアマネからの紹介で早めに次が決まる。地域から必要とされ、選ばれ続けている手ごたえがあるのかもしれません。',
  zou:'シフトの希望が通りやすく、休みもちゃんと取れて、職員が無理なく働けているからではないでしょうか。例えば子どもの行事や通院で休みたい日も、早めに言えば調整してもらえる。「ここは働きやすい」と感じてもらえているのかもしれません。'
};
var AX_LOW={
  penguin:'新しい人が入っても教える人が忙しく、「とりあえず横で見ていて」で一日が終わっていませんか？ 初日の入浴介助を見よう見まねでやってもらい、後で「そこは違う」と言い直す。教える中身が人によって違い、聞く相手で言うことが変わる、そんなことはないでしょうか。',
  fukurou:'日誌やシフトを紙でやりとりしていて、月末にまとめ直すのに時間がかかっていませんか？ 昼間にあったことを夜勤の人へ紙で残し、それをまたパソコンに打ち直す。同じことを二回書く手間が、毎日積み重なっていないでしょうか。',
  risu:'食事の記録が「全部・半分」くらいのざっくりで、やせてきた人の変化に気づくのが遅れていませんか？ 気づいた時にはズボンがゆるくなっていた。栄養のことを誰に相談すればいいかも、はっきりしないままになっていないでしょうか。',
  kuma:'ヒヤリハットの紙は書くけれど、その後見返す時間が取れていませんか？ 書いて出したら箱に入れっぱなしで、同じ場所・同じ時間帯の転びやヒヤリが、名前を変えてまた起きていないでしょうか。',
  ookami:'もしもの時の手引きはあるけれど、しまったままで、中身をすぐ言える人が少なくありませんか？ 夜に急に熱を出した方が出てから、慌てて手順書のページをめくる。「その時になったら考える」のままになっていないでしょうか。',
  hachi:'目の前の介護で手一杯で、施設のことを外に知ってもらう機会がつくれていませんか？ 良いケアをしているのに、見学も口コミもなかなか増えず、その良さが周りに伝わっていない。そんなもったいなさはないでしょうか。',
  inu:'人が入っては辞めるを繰り返し、そのたびに求人や教え直しに追われていませんか？ やっと一人前になった頃に辞められ、また一から募集して教え直す。慣れた人が抜けるたびに、残った人の負担が増えていないでしょうか。',
  beaver:'少ない人手で毎日の介護を回すだけで手一杯で、資格を持つ人の配置や役割づくりまで手が回っていませんか？ 傷や薬のことで迷っても、その場ですぐ聞ける相手が施設の中にいない。そんな心細さはないでしょうか。',
  kitsune:'毎日の仕事に追われて、数字とじっくり向き合う時間が後回しになっていませんか？ どんぶり勘定のまま進めていて、決算の時になって初めて人件費や光熱費のふくらみに気づく。そんな心配はないでしょうか。',
  usagi:'毎日の仕事に追われて、新しいことを始める時間がなかなか取れていませんか？ 「あれをやってみたい」と思いついても、日々の忙しさに流されて手つかずのまま。変えたい気持ちはあるのに動けない、そんなもどかしさはないでしょうか。',
  iruka:'ベッドや利用の枠にまだ空きがあって、埋まらない日が気になっていませんか？ 空いた分だけ収入も減っていくのに、良いケアをしているその良さが、必要としている人にまだ届いていない。そんなことはないでしょうか。',
  zou:'急に人が休むたびに誰かが穴埋めで出勤して、休みが取りづらくなっていませんか？ 休みの日に電話が鳴って呼び出される、残業や持ち帰りが当たり前になる。疲れが抜けないまま次の日を迎えていないでしょうか。'
};
// 軸どうしの組み合わせ 意味づけ（段落2用）
var AX_COMBO=[
  {a:'inu',b:'zou',t:'休みが取りやすく無理なく働ける職場だからこそ職員が辞めにくく、顔ぶれが変わらないから新しい人も続けやすい。例えば急な休みも助け合いで回せて、その安心感がまた定着につながる。2つがうまくかみ合っているのではないでしょうか。'},
  {a:'penguin',b:'beaver',t:'人を育てる力と、看護や機能訓練など専門の人がそろっている力、この2つが両方あるからこそ、新しい人も分からないことをその場で聞きながら成長できる。介護の質は、少しずつ確かなものになっていくのではないでしょうか。'},
  {a:'kitsune',b:'iruka',t:'ベッドや利用の枠がしっかり埋まっていることが毎月の収入の土台になり、その安定が備品の買い替えや人の補充を落ち着いて決められる運営につながっている。お金と稼働の両輪が、うまく回っているのではないでしょうか。'},
  {a:'penguin',b:'zou',t:'まず職員が無理なく働ける土台があり、そのうえで新しい人にじっくり教える余裕も生まれている。忙しさで教育が後回しになりがちな中で、良い順番で力がそろっているのではないでしょうか。'},
  {a:'kuma',b:'ookami',t:'普段の転びやヒヤリを防ぐ力も、地震や急病といったもしもの時の備えもどちらもできている。日頃の小さな気づきから非常時の段取りまで、「安全」を通して考えられている施設ではないでしょうか。'},
  {a:'hachi',b:'inu',t:'地域や家族から信頼され、職員も長く続いている。外からは「あそこなら安心」と紹介が入り、中では慣れた顔ぶれが利用者を支える。外にも中にも安心がそろった施設ではないでしょうか。'},
  {a:'fukurou',b:'kitsune',t:'記録や情報のやりとりにパソコンやスマホを使って無駄な手間を減らせていて、その分だけ数字と向き合う余裕も生まれている。事務の軽さが、落ち着いた運営にもつながっているのかもしれません。'}
];

/* ══ 多言語化（i18n）土台 ═══════════════════════════════════════════════
   ・日本語の正典は「このファイル内の日本語原文」。I18N_BASE に自動登録し、
     翻訳ファイルの取得に失敗しても日本語表示は絶対に壊れない設計。
   ・i18n/{lang}.json（翻訳）を上に重ねる。無いキーは日本語のまま。
   ・i18n/ja.static.json（index.html 用）と i18n/ja.app.json（この土台の書き出し）も読む。
   ・都道府県名・市区町村名・サービス種別名・加算名などの固有名詞は今回は日本語のまま
     （PREFS / CITY / PREF_REGIONS / PREF_FILES / SVC_ALIAS。データキーなので翻訳禁止）。
     将来は表示層だけ 'pref.<日本語名>' 等のキーで差し替える想定。 */
var I18N_LANGS=['ja','en','zh','vi','id','ne','my','si'];
var I18N_LOCALE={ja:'ja-JP',en:'en-US',zh:'zh-CN',vi:'vi-VN',id:'id-ID',tl:'fil-PH',ne:'ne-NP',ko:'ko-KR'};
var I18N_LANG='ja';
var I18N_BASE={};   // キー → 日本語原文（最後の砦）
var I18N_OVER={};   // キー → 選択言語の訳
function i18nSet(k,v){ if(v!=null && v!=='' && I18N_BASE[k]===undefined) I18N_BASE[k]=v; return k; }
// 入れ子データ（PROFILE_RICH / ANALYSIS 等）の日本語テキスト葉を、パス名キーで一括登録／適用する。
// 日本語（かな・漢字）を含む文字列だけをキー化し、CSS値や絵文字・時刻などは対象外にする。
var _I18N_JARE=/[぀-ヿ一-鿿]/;
function i18nRegTree(prefix,v){
  if(typeof v==='string'){ if(_I18N_JARE.test(v)) i18nSet(prefix,v); return; }
  if(Array.isArray(v)){ for(var i=0;i<v.length;i++) i18nRegTree(prefix+'.'+i,v[i]); return; }
  if(v&&typeof v==='object'){ for(var k in v){ if(v.hasOwnProperty(k)) i18nRegTree(prefix+'.'+k,v[k]); } }
}
// 登録済み（I18N_BASE にキーがある）葉だけを訳に置き換える。現在値が既に別言語でも安全。
function i18nApplyTree(prefix,v){
  if(Array.isArray(v)){ for(var i=0;i<v.length;i++){ var p=prefix+'.'+i; if(typeof v[i]==='string'){ if(I18N_BASE[p]!==undefined) v[i]=t(p,null,v[i]); } else i18nApplyTree(p,v[i]); } return; }
  if(v&&typeof v==='object'){ for(var k in v){ if(!v.hasOwnProperty(k)) continue; var pk=prefix+'.'+k; if(typeof v[k]==='string'){ if(I18N_BASE[pk]!==undefined) v[k]=t(pk,null,v[k]); } else i18nApplyTree(pk,v[k]); } }
}
/* t(key, vars, fallback)
   ・訳が無ければ日本語原文、それも無ければ fallback、最後にキー名。
   ・vars で {name} 形式のプレースホルダを埋める（語順の違う言語に耐えるため）。 */
function t(key,vars,fallback){
  var s=I18N_OVER[key];
  if(s==null||s==='') s=I18N_BASE[key];
  if(s==null||s==='') s=(fallback!==undefined&&fallback!==null)?fallback:key;
  s=String(s);
  if(vars) s=s.replace(/\{(\w+)\}/g,function(m,n){ return (vars[n]==null?m:String(vars[n])); });
  return s;
}
function i18nLocale(){ return I18N_LOCALE[I18N_LANG]||'ja-JP'; }
function i18nNum(n){ try{ return Number(n).toLocaleString(i18nLocale()); }catch(e){ return String(n); } }
function i18nDate(d){ try{ return new Date(d).toLocaleDateString(i18nLocale()); }catch(e){ return String(d); } }
function i18nCmp(a,b){ try{ return String(a).localeCompare(String(b), i18nLocale()); }catch(e){ return String(a)<String(b)?-1:0; } }
// 画面に出る固定文（コード内で組み立てる文）。助詞込みの連結はすべてプレースホルダ化する。
var I18N_UI={
  'ui.back.result':'診断結果に戻る',
  'ui.back.ranking':'ランキングに戻る',
  'ui.loading':'読み込み中…',
  'rp.lock.h':'今すぐロックを解除',
  'rp.lock.p':'<b>まだ見えていない伸びしろと、その伸ばし方がわかります。</b>あなたの施設だけの無料レポートで、「何から手をつければいいか」がはっきりします。',
  'rp.lock.btn':'メールアドレス登録で受け取る',
  'rp.bench.h':'ご近所の中で、あなたは今何番目？',
  'rp.bench.p':'同じサービス種別の近隣施設とくらべて、あなたの施設の順位が分かります。メールアドレスの登録で、この比較がすべて見られます。',
  'rp.bench.btn':'メールアドレスを登録して見る',
  'rp.bench.note':'登録は無料です。',
  'rp.unlock.h':'メールアドレスの登録',
  'rp.unlock.p':'登録すると、<b>近隣施設との比較</b>がすべて見られます。同じサービス種別のご近所の中で、あなたの施設が今何番目かが分かります。',
  'rp.mail.ph':'メールアドレスを入力',
  'rp.mail.err1':'メールアドレスの形式をご確認ください（例：info@example.co.jp）',
  'rp.mail.err2':'メールアドレスの形式をご確認ください',
  'rp.unlock.btn':'登録して見る',
  'rp.privacy1':'入力いただいたメールは介護ソフトに関するご案内に利用します。詳しくは{a}プライバシーポリシー{z}をご確認ください。',
  'rp.report.h':'施設まるごと解析レポート（無料）',
  'rp.report.p':'下のようなレポートを、あなたの施設の実データで作成しメールでお届けします。',
  'rp.report.btn':'レポートを受け取る',
  'rp.privacy2':'入力いただいたメールは解析レポートの送付と介護ソフトに関するご案内に利用します。詳しくは{a}プライバシーポリシー{z}をご確認ください。',
  'rp.toast.unlock':'ご登録ありがとうございます。近隣施設との比較が見られます。',
  'rp.toast.sent':'解析レポートを {v} 宛にお送りしました。',
  'rp.toast.queued':'お申し込みを受け付けました。レポートは順次お送りします。',
  'rp.adv.errSlot':'希望日と時間帯を選んでください。',
  'rp.adv.errContact':'連絡先（メールまたは電話）をご入力ください。',
  'rp.adv.doneH':'相談予約を受け付けました',
  'rp.adv.doneP':'{dt} を希望として承りました。アドバイザーよりご連絡し、今の課題とソフトでの改善策を具体的にご提案します。',
  'rp.close':'閉じる',
  'ui.tag.strength':'強み',
  'ui.tag.grow':'伸びしろ',
  'rashisa.tmpl.lead':'あなたの施設は、{lead}',
  'rashisa.tmpl.also':'そして{also}もあわせ持つ、いくつもの強みを兼ねた{name}の施設です。',
  'rashisa.tmpl.wide':'それだけでなく{more}など、多くの面でバランスよく力を発揮している施設ではないでしょうか。色々な強みを持つ{name}です。',
  'rashisa.tmpl.one':'その強みが一番よく表れているのが{name}です。',
  'rashisa.join':'や',
  'ui.you':'あなた',
  'ui.youBadge':'あなた',
  'ui.yourFacility':'あなたの施設',
  'ui.thisFacility':'この施設',
  'ui.noData':'データなし',
  'ui.noOpenData':'公表データなし',
  'ui.more':'詳しく ›',
  'ui.avgShort':'平均{n}%',
  'ui.someFacility':'ある介護施設',
  'ui.diagnosedFacility':'診断した施設',
  'badge.tier.gold':'ゴールド',
  'badge.tier.silver':'シルバー',
  'badge.tier.bronze':'ブロンズ',
  'badge.next':'あと{n}%',
  'badge.title':'獲得バッジ <b>{got}</b> / {n} ｜ {rank}',
  'badge.hint':'👆 各項目をタップすると「どこを改善すればいいか」が見られます',
  'badge.naNote':'「不明」は、この施設の公表データからは確認できなかった項目です。診断（バッジ・タイプ）は、データがある{n}項目だけで判定しています。',
  'badge.tipNoData':'この種別では公表データがありません',
  'badge.tipTap':'タップで改善のヒントを見る',
  'badge.rank.9.nm':'全方位の達人','badge.rank.9.sub':'12の力のうち{n}つで才能が開花。地域でも稀有な存在です。',
  'badge.rank.6.nm':'万能型','badge.rank.6.sub':'多くの力をバランスよく備えた頼れる施設です。',
  'badge.rank.4.nm':'オールラウンダー','badge.rank.4.sub':'複数の強みを持つバランス型。更に上を狙えます。',
  'badge.rank.2.nm':'二刀流','badge.rank.2.sub':'2つ以上の力で合格ライン。強みが広がっています。',
  'badge.rank.1.nm':'一点突破型','badge.rank.1.sub':'まずは1つの才能が開花。次のバッジを狙いましょう。',
  'badge.rank.0.nm':'これからの原石','badge.rank.0.sub':'あと少しで最初のバッジ。伸びしろは十分です。',
  'axc.rank.you':'「<b style="color:{col}">{ax}</b>」の力は、{scope}<b>{total}</b>件中 <b style="color:{col}">{rank}位</b>です。',
  'axc.rank.none':'「<b style="color:{col}">{ax}</b>」は、あなたの施設の公表データがありません。{scope}<b>{n}</b>件の近隣施設の状況をご覧いただけます。',
  'axc.pos.upper':'上位','axc.pos.lower':'下位',
  'axc.pos':'　／　この中では <b style="color:{col}">{pos}グループ</b>です',
  'axc.cta':'「{ax}」を伸ばす方法を無料で相談する →',
  'axc.diff.up':'「{ax}」は この施設が <b style="color:#1aa37a">+{d}ポイント</b> 上です。（%＝達成率）',
  'axc.diff.down':'「{ax}」は あなたが <b style="color:#c26a5a">+{d}ポイント</b> 上です。（%＝達成率）',
  'axc.diff.same':'「{ax}」は <b>ちょうど同じ</b>です。（%＝達成率）',
  'axc.diff.youNone':'あなたの施設は「{ax}」の公表データがありません。この施設は達成率 <b style="color:{col}">{v}%</b> です。',
  'axc.diff.themNone':'この施設は「{ax}」の公表データがありません。',
  'axc.all12':'この施設の全12軸を見る →',
  'axc.noHit':'一致する近隣施設が見つかりませんでした',
  'dist.head.type':'{scope}の中でのタイプ分布、あなたはここ',
  'dist.head':'{scope}タイプ分布で、あなたはここ',
  'dist.scope.sameService':'同じサービス種別',
  'dist.scope.nation':'全国','dist.scope.pref':'県内',
  'dist.note':'対象：{scope}（全国{n}件）','dist.note.few':' ／件数が少ないため参考値',
  'dist.marker':'あなた <b>{nm} {pc}%</b>',
  'cmp.base.pref':'石川県内の平均','cmp.base.type':'同じサービス種別の平均','cmp.base.nation':'全国の平均',
  'cmp.base.svc':'{svc}の平均',
  'cmp.sum.up':'強みは {list}','cmp.sum.down':'伸びしろは {list}',
  'cmp.sum':'{base}と比べて、{parts}。','cmp.sum.same':'{base}とほぼ同じ水準です。',
  'rashisa.topBottom':'{top}。でも{low}。',
  'rashisa.top.inu':'離職率の低さは地域トップ級','rashisa.top':'{ax}は地域トップ級',
  'rashisa.low.inu':'離職率は平均より高め','rashisa.low':'{ax}は平均以下',
  'rashisa.rare':'県内でも珍しい、希少なタイプ。',
  'rashisa.high':'総合スコアが高めの実力派。',
  'rashisa.allAbove':'12の力全てが地域平均超え。',
  'rashisa.weapon':'{ax}が最大の武器（{pc}%）。',
  'result.typeSuffix':'{ax}が強いタイプ',
  'result.catch':'「{catch}」',
  'result.eyebrow':'TYPE / {ax}',
  'result.sent.h':'詳しい分析レポートをお送りしました',
  'result.sent.p':'<b>{email}</b> 宛に、あなたの施設の強みと“伸びしろ”をまとめた詳しいレポートをお送りしました。数分たっても届かない場合は、迷惑メールフォルダをご確認ください。',
  'result.rankpct':'総合スコア {n}点（100点満点の目安）',
  'result.rankcap.high':'{fac}は、公表データ上の総合スコアが高めの施設です。',
  'result.rankcap.low':'ここから伸ばせるポイントがたくさんあります。',
  'result.finVerify':'✅ 実財務で黒字を確認（収支差率 {margin}%・{year}年度）',
  'result.embed':'🏅 {who} は「{type}」認定',
  'analysis.p1':'あなたの施設の特徴は、{feat}ところです。',
  'analysis.p1.cotop':'それに<b style="color:{col}">{list}</b>の力も同じくらい高く、いくつもの力がそろっています。',
  'analysis.p2.combo':'更には{txt}',
  'analysis.p2.second':'更には<b style="color:{col}">{ax}</b>の力もしっかり備わっています。',
  'analysis.p3':'一方で、いま一番伸びしろがあるのは<b>{ax}</b>でした。これは力が足りないということではなく、これから伸ばせる余白があるということです。',
  'analysis.p4':'あとは、伸びしろのある力を一つずつ整えていければ、この施設はもっと強くなります。',
  'trend.head':'これで {n} 回目の診断です',
  'trend.date':'前回：{d}（{type}）',
  'trend.nochange':'前回と大きな変化はありません。今の状態をキープできています。',
  'trend.up':'<span class="up">{ax}が +{d}ポイント</span>',
  'trend.down':'<span class="down">{ax}が {d}ポイント</span>',
  'trend.lead':'前回（{d}）と比べて、{parts}。{tail}',
  'trend.tail.up':'全体として前進しています。','trend.tail.down':'気になる変化が出ています。',
  'trend.rowDelta':'{sign}{d}ポイント',
  'trend.none':'各項目に動きはありませんでした。',
  'share.head':'ケアタイプ診断 結果',
  'share.yourFacilityIs':'あなたの施設は…',
  'share.shine':'強みが光る',
  'share.typeSuffix':'型施設',
  'share.was':'でした！',
  'share.typeWas':'型施設でした！',
  'share.openData':'公開データで診断',
  'share.noQuestion':'質問なし',
  'share.diagnosed':'診断した施設',
  'share.rankTitle':'公開データから見る 強みランキング',
  'share.cta1':'あなたの施設は、どの動物タイプ？',
  'share.cta2':'施設名を選ぶだけ・質問なしの無料診断',
  'share.tag':'#ケア図鑑',
  'share.fromOpenData':'公開データから',
  'share.findStrength':'施設の強みを発見！',
  'share.noAnswerNeeded':'質問への回答は不要です',
  'share.rankOrd':'{n}位',
  'share.note.1':'この施設で最も際立つ強みです',
  'share.note.2':'公開データから見えた強みです',
  'share.note.3':'これからも活かしたい持ち味です',
  'share.note.2b':'公開データで高く評価された項目です',
  'share.note.3b':'これからも活かしたい施設の持ち味です',
  'share.making':'結果画像を作成中…',
  'share.failed':'画像を表示できませんでした',
  'share.imgAlt':'{fac}のケアタイプ診断結果カード',
  'rarity.rare':'めずらしいタイプ',
  'rarity.sometimes':'ときどき見かけるタイプ',
  'rarity.common':'よく見られるタイプ',
  'rarity.rareShort':'めずらしい',
  'mock.label':'あなたの施設は',
  'mock.foot':'12の力・地域での立ち位置を見る →',
  'mock.top':'最強'
};
// 総合診断文（rAnalysis）で使う解釈フレーズ。翻訳のため関数外に置き、辞書に載せる。
var AX_FEAT={
  penguin:'新人や若手をきちんと育てている',
  fukurou:'記録や事務をパソコンで楽にできている',
  risu:'食事や栄養にしっかり手をかけている',
  kuma:'事故やケガを防ぐ仕組みがきちんとある',
  ookami:'災害や急病など、もしもの時への備えができている',
  hachi:'周りの人や地域としっかりつながっている',
  inu:'職員が辞めずに長く働いてくれている',
  beaver:'資格を持つ人がしっかりそろっている',
  kitsune:'お金のやりくりがうまく回っている',
  usagi:'利用者が増え、事業が伸びている',
  iruka:'ベッドや利用枠がしっかり埋まっている',
  zou:'職員が気持ちよく働ける職場になっている'
};
// 日本語の基底辞書を組み立てる（TYPES/PROFILE 等の原文をそのまま登録）
function i18nBuildBase(){
  Object.keys(I18N_UI).forEach(function(k){ i18nSet(k,I18N_UI[k]); });
  Object.keys(TYPES).forEach(function(k){ var o=TYPES[k];
    i18nSet('type.'+k+'.name',o.name); i18nSet('type.'+k+'.axisJa',o.axisJa);
    i18nSet('type.'+k+'.catch',o.catch); i18nSet('type.'+k+'.desc',o.desc);
  });
  Object.keys(PROFILE).forEach(function(k){ var p=PROFILE[k];
    i18nSet('profile.'+k+'.intro',p.intro);
    ['strong','grow','aru'].forEach(function(f){ (p[f]||[]).forEach(function(s,i){ i18nSet('profile.'+k+'.'+f+'.'+i,s); }); });
    i18nSet('profile.'+k+'.match',p.match); i18nSet('profile.'+k+'.advice',p.advice);
  });
  Object.keys(AXJA).forEach(function(k){ i18nSet('ax.'+k,AXJA[k]); });
  i18nSet('ax.inu.strong','離職率の低さ');
  Object.keys(AX_GLOSS).forEach(function(k){ i18nSet('axgloss.'+k,AX_GLOSS[k]); });
  i18nSet('note.inu',INU_NOTE);
  Object.keys(AX_FEAT).forEach(function(k){ i18nSet('analysis.feat.'+k,AX_FEAT[k]); });
  if(typeof AX_HIGH!=='undefined') Object.keys(AX_HIGH).forEach(function(k){ i18nSet('analysis.high.'+k,AX_HIGH[k]); });
  if(typeof AX_LOW!=='undefined') Object.keys(AX_LOW).forEach(function(k){ i18nSet('analysis.low.'+k,AX_LOW[k]); });
  if(typeof AX_COMBO!=='undefined') AX_COMBO.forEach(function(c){ i18nSet('analysis.combo.'+c.a+'_'+c.b,c.t); });
  // PROFILE_RICH / ANALYSIS は宣言が後方（const）のため、ここでは触れず宣言直後に登録する（i18nRegLateTrees）。
}
// 後方宣言の入れ子データを日本語基底に登録（宣言後に呼ぶ）。取得失敗時も日本語が出るように、コード側から登録しておく。
function i18nRegLateTrees(){
  if(typeof PROFILE_RICH!=='undefined') i18nRegTree('prof',PROFILE_RICH);
  if(typeof ANALYSIS!=='undefined') i18nRegTree('analysis.body',ANALYSIS);
}
// 辞書の内容を既存のデータ構造へ書き戻す（変数名・構造はそのまま＝既存コードは無改造で動く）
function i18nApplyData(){
  Object.keys(TYPES).forEach(function(k){ var o=TYPES[k];
    o.name=t('type.'+k+'.name'); o.axisJa=t('type.'+k+'.axisJa');
    o.catch=t('type.'+k+'.catch'); o.desc=t('type.'+k+'.desc');
  });
  Object.keys(PROFILE).forEach(function(k){ var p=PROFILE[k];
    p.intro=t('profile.'+k+'.intro');
    ['strong','grow','aru'].forEach(function(f){ if(p[f]) p[f]=p[f].map(function(s,i){ return t('profile.'+k+'.'+f+'.'+i,null,s); }); });
    p.match=t('profile.'+k+'.match'); p.advice=t('profile.'+k+'.advice');
  });
  Object.keys(AXJA).forEach(function(k){ AXJA[k]=t('ax.'+k); });
  Object.keys(AX_GLOSS).forEach(function(k){ AX_GLOSS[k]=t('axgloss.'+k); });
  INU_NOTE=t('note.inu');
  Object.keys(AX_FEAT).forEach(function(k){ AX_FEAT[k]=t('analysis.feat.'+k); });
  if(typeof AX_HIGH!=='undefined') Object.keys(AX_HIGH).forEach(function(k){ AX_HIGH[k]=t('analysis.high.'+k); });
  if(typeof AX_LOW!=='undefined') Object.keys(AX_LOW).forEach(function(k){ AX_LOW[k]=t('analysis.low.'+k); });
  if(typeof AX_COMBO!=='undefined') AX_COMBO.forEach(function(c){ c.t=t('analysis.combo.'+c.a+'_'+c.b,null,c.t); });
  if(typeof PROFILE_RICH!=='undefined') i18nApplyTree('prof',PROFILE_RICH);
  if(typeof ANALYSIS!=='undefined') i18nApplyTree('analysis.body',ANALYSIS);
  if(typeof I18N_LATE_DICTS!=='undefined') I18N_LATE_DICTS.forEach(function(p){ var d=i18nDictRef(p[1]); if(d!==undefined) i18nApplyTree(p[0],d); });
}
function i18nFetchJson(url){
  try{ return fetch(url,{cache:'no-cache'}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; }); }
  catch(e){ return Promise.resolve(null); }
}
var _i18nBaseLoaded=false;
// 一度読み込んだ翻訳辞書をメモリに保持し、再切替時の再ダウンロードを防ぐ
var _i18nOverCache={};
// index.html 用（ja.static.json）と app.js 用（ja.app.json）の日本語辞書を土台に足す。
// 既にコード側から登録済みのキーは上書きしない（コード内の原文が正典）。
function i18nLoadBase(){
  if(_i18nBaseLoaded) return Promise.resolve();
  return Promise.all([i18nFetchJson('i18n/ja.static.json'), i18nFetchJson('i18n/ja.app.json')]).then(function(a){
    a.forEach(function(o){ if(o&&typeof o==='object') Object.keys(o).forEach(function(k){ if(I18N_BASE[k]===undefined) I18N_BASE[k]=o[k]; }); });
    _i18nBaseLoaded=true;
  }).catch(function(){ _i18nBaseLoaded=true; });
}
// data-i18n / data-i18n-attr の付いた要素へ辞書を適用
function i18nApplyDom(root){
  root=root||document;
  if(!root.querySelectorAll) return;
  var els=root.querySelectorAll('[data-i18n]');
  for(var i=0;i<els.length;i++){
    var el=els[i], k=el.getAttribute('data-i18n');
    var s=t(k,null,null);
    if(s===k) continue;                       // 訳も日本語原文も無い＝DOMの日本語をそのまま残す
    if(s===el.textContent) continue;          // 同じ文字列なら触らない（子要素や<br>を壊さないため）
    if(s.indexOf('<')>=0) el.innerHTML=s; else el.textContent=s;
    el.removeAttribute('data-kuten-done');
  }
  var as=root.querySelectorAll('[data-i18n-attr]');
  for(var j=0;j<as.length;j++){
    var e2=as[j], spec=e2.getAttribute('data-i18n-attr')||'';
    spec.split(';').forEach(function(pair){
      if(!pair) return;
      var p=pair.split(':'); if(p.length<2) return;
      var at=p[0].trim(), key=p.slice(1).join(':').trim(); if(!at||!key) return;
      var v=t(key,null,null); if(v!==key) e2.setAttribute(at,v);
    });
  }
}
// 表示中の画面を、再診断させずに描き直す
function i18nRerender(){
  try{
    var r=document.getElementById('result');
    if(r && r.classList.contains('active') && typeof showResult==='function' && (lastType||window._corpOverview)) showResult();
  }catch(e){}
  try{ if(typeof buildPrefChips==='function') buildPrefChips(); if(typeof syncPrefChips==='function') syncPrefChips(); }catch(e){}
  try{ var p=document.getElementById('profile');
    if(p && p.classList.contains('active') && typeof showProfile==='function' && window._pfKey) showProfile(window._pfKey);
  }catch(e){}
  try{ if(typeof renderMock==='function' && typeof MOCKS!=='undefined') renderMock(MOCKS[MOCK_I]); }catch(e){}
  try{ if(typeof renderGjTypes==='function') renderGjTypes(); }catch(e){}
  try{ if(typeof renderMega==='function') renderMega(); }catch(e){}
  try{ if(typeof renderZukan==='function') renderZukan(); }catch(e){}
  try{ if(typeof renderTrend==='function') renderTrend(); }catch(e){}
  try{ if(typeof renderHitomiBack==='function') renderHitomiBack(); }catch(e){}
}
// 言語を切り替える（翻訳ファイルが無い／取得に失敗しても日本語で動き続ける）
function i18nSwitch(code){
  if(I18N_LANGS.indexOf(code)<0) code='ja';
  return i18nLoadBase().then(function(){
    if(code==='ja') return null;
    if(_i18nOverCache[code]!==undefined) return _i18nOverCache[code];   // 2回目以降はメモリから即時
    return i18nFetchJson('i18n/'+code+'.json').then(function(o){ _i18nOverCache[code]=o; return o; });
  }).then(function(over){
    I18N_LANG=code;
    I18N_OVER=(over&&typeof over==='object')?over:{};
    try{ localStorage.setItem('careLang',code); }catch(e){}
    document.documentElement.lang=code;
    i18nApplyData();
    i18nApplyDom(document);
    if(code==='ja') applyKuten(document);   // 句点改行は日本語だけ
    i18nRerender();
  }).catch(function(){});
}
i18nBuildBase();
// 前回選んだ言語を復元（初回・日本語は何もしない＝日本語表示は一切変わらない）
function i18nInit(){
  var s=null; try{ s=localStorage.getItem('careLang'); }catch(e){}
  if(!s || s==='ja' || I18N_LANGS.indexOf(s)<0) return;
  var a=document.querySelector('#langMenu a[onclick*="setLang(\''+s+'\'"]');
  if(a){ try{ a.click(); return; }catch(e){} }
  i18nSwitch(s);
}
if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',i18nInit); } else { i18nInit(); }

// 才能バッジ：軸の達成率でブロンズ70/シルバー80/ゴールド90。達成数で称号が変わる。
const BADGE_GOLD=90, BADGE_SILVER=80, BADGE_BRONZE=70;
function badgeTier(pc){ if(pc>=BADGE_GOLD)return'gold'; if(pc>=BADGE_SILVER)return'silver'; if(pc>=BADGE_BRONZE)return'bronze'; return'locked'; }
function badgeRank(n){
  if(n>=9) return {nm:t('badge.rank.9.nm'), sub:t('badge.rank.9.sub',{n:n})};
  if(n>=6) return {nm:t('badge.rank.6.nm'), sub:t('badge.rank.6.sub')};
  if(n>=4) return {nm:t('badge.rank.4.nm'), sub:t('badge.rank.4.sub')};
  if(n>=2) return {nm:t('badge.rank.2.nm'), sub:t('badge.rank.2.sub')};
  if(n>=1) return {nm:t('badge.rank.1.nm'), sub:t('badge.rank.1.sub')};
  return {nm:t('badge.rank.0.nm'), sub:t('badge.rank.0.sub')};
}
function badgePanel(sc){
  // 公表データがある軸だけを測定済みとして扱う。
  function measured(k){ return typeof autoSc!=='undefined' && autoSc && autoSc[k]!=null; }
  // 全12軸を表示。測れた軸は達成率つき、データが無い軸は「データなし」として並べる（判定には測れた軸だけ使う）。
  var items=AXES.map(function(k){ var m=measured(k); var pc=m?Math.min(100,Math.round(sc[k]/3*100)):null; return {k:k,pc:pc,m:m,tier:m?badgeTier(pc):'nodata'}; });
  var measuredCount=items.filter(function(o){return o.m;}).length;
  var nodataCount=AXES.length-measuredCount;
  var got=items.filter(function(o){return o.m && o.tier!=='locked';}).length;
  var rank=badgeRank(got);
  // 測れた軸を達成率順に、データなし軸は末尾に
  items.sort(function(a,b){ if(a.m!==b.m) return a.m?-1:1; return (b.pc||0)-(a.pc||0); });
  var cells=items.map(function(o,ix){
    var dly=' style="animation-delay:'+(ix*70)+'ms"';
    if(!o.m){
      return '<div class="bdg nodata bdg-in" role="button" tabindex="0"'+dly+' onclick="showAxisDetail(\''+o.k+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();showAxisDetail(\''+o.k+'\');}" title="'+t('badge.tipNoData')+'">'+
        '<div class="bdg-ic bdg-ic-na">?</div>'+
        '<div class="bdg-nm">'+AXJA[o.k]+'</div>'+
        '<div class="bdg-pc">'+t('ui.noOpenData')+'</div><span class="bdg-more">'+t('ui.more')+'</span></div>';
    }
    var tierIc=o.tier==='gold'?'🥇':o.tier==='silver'?'🥈':o.tier==='bronze'?'🥉':'';
    var tierNm=o.tier==='gold'?t('badge.tier.gold'):o.tier==='silver'?t('badge.tier.silver'):o.tier==='bronze'?t('badge.tier.bronze'):'';
    var rankLabel= tierNm ? '<span class="bdg-rank">'+tierIc+tierNm+'</span>' : '';
    var next= o.tier==='locked' ? '<span class="bdg-next">'+t('badge.next',{n:(BADGE_BRONZE-o.pc)})+'</span>' : '';
    return '<div class="bdg bdg-in '+o.tier+'" role="button" tabindex="0"'+dly+' onclick="showAxisDetail(\''+o.k+'\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();showAxisDetail(\''+o.k+'\');}" title="'+t('badge.tipTap')+'">'+(tierIc?'<span class="bdg-tier">'+tierIc+'</span>':'')+
      '<div class="bdg-ic">'+TYPES[o.k].emoji+'</div>'+
      '<div class="bdg-nm">'+AXJA[o.k]+'</div>'+
      '<div class="bdg-pc">'+dispV(o.k,o.pc)+'%</div>'+rankLabel+next+'<span class="bdg-more">'+t('ui.more')+'</span></div>';
  }).join('');
  var naNote = nodataCount>0 ? '<div class="bp-na-note">'+t('badge.naNote',{n:measuredCount})+'</div>' : '';
  return '<div class="bp-title"><span class="bp-rank">'+t('badge.title',{got:got,n:measuredCount,rank:rank.nm})+'</span></div>'+
    '<div class="bp-grid">'+cells+'</div>'+naNote;
}
// 「12の力」グリッドの登場アニメ：ホームの data-reveal と同じく、表示領域に入ったら順にふわっと出す。
// バッジは #result が隠れている間に描画されるため、描画時にCSSアニメを回すと再生済みになってしまう。
// そこで observer で「画面に入った瞬間」に .bp-revealed / .bdg-in を付けて再生する。抜けたら外して再入場で再生。
function initBpReveal(){
  var grid=document.querySelector('#result .bp-grid'); if(!grid) return;
  var cells=grid.querySelectorAll('.bdg');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)){
    grid.classList.add('bp-revealed');
    cells.forEach(function(c){c.classList.add('bdg-in');});
    return;
  }
  if(window._bpObs) window._bpObs.disconnect();
  window._bpObs=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var cs=e.target.querySelectorAll('.bdg');
      if(e.isIntersecting){
        e.target.classList.add('bp-revealed');
        cs.forEach(function(c){c.classList.add('bdg-in');});
      } else {
        e.target.classList.remove('bp-revealed');
        cs.forEach(function(c){c.classList.remove('bdg-in');});
      }
    });
  },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  window._bpObs.observe(grid);
}
const AVG = {inu:55,penguin:45,fukurou:35,kitsune:50,usagi:42,iruka:48,beaver:47,risu:40,hachi:44,kuma:52,ookami:38,zou:46};
// 比較の平均値は nation_avg.json から読み込む（NATIONAVG=全国12軸平均, TYPEAVG=cd別・全国平均, CD_NAMES=cd→サービス名）。
// selSvc はサービス名なので NAME2CD で cd に変換して TYPEAVG[cd] を引く。欠損は AVG（石川県内平均）にフォールバック。
window.NATIONAVG = window.NATIONAVG || null; window.TYPEAVG = window.TYPEAVG || null; window.NAME2CD = window.NAME2CD || null;
const SCMAX = AXES.length*3;
// 公表データによる自動採点。
let autoSc = null;
function hashStr(s){ var h=2166136261>>>0; s=String(s); for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; }
// === 県 → 県別データファイルの対応表（全47都道府県） ===
// 選択県だけ data/pref/{code}.{kind}.json を読む（全県同時ロードは重いため分割）。
const PREF_FILES = {
  '北海道':   { code:'01_hokkaido',  fin:false },
  '青森県':   { code:'02_aomori',    fin:false },
  '岩手県':   { code:'03_iwate',     fin:false },
  '宮城県':   { code:'04_miyagi',    fin:false },
  '秋田県':   { code:'05_akita',     fin:false },
  '山形県':   { code:'06_yamagata',  fin:false },
  '福島県':   { code:'07_fukushima', fin:false },
  '茨城県':   { code:'08_ibaraki',   fin:false },
  '栃木県':   { code:'09_tochigi',   fin:false },
  '群馬県':   { code:'10_gunma',     fin:false },
  '埼玉県':   { code:'11_saitama',   fin:false },
  '千葉県':   { code:'12_chiba',     fin:false },
  '東京都':   { code:'13_tokyo',     fin:false },
  '神奈川県': { code:'14_kanagawa',  fin:false },
  '新潟県':   { code:'15_niigata',   fin:false },
  '富山県':   { code:'16_toyama',    fin:false },
  '石川県':   { code:'17_ishikawa',  fin:true  },
  '福井県':   { code:'18_fukui',     fin:false },
  '山梨県':   { code:'19_yamanashi', fin:false },
  '長野県':   { code:'20_nagano',    fin:false },
  '岐阜県':   { code:'21_gifu',      fin:false },
  '静岡県':   { code:'22_shizuoka',  fin:false },
  '愛知県':   { code:'23_aichi',     fin:false },
  '三重県':   { code:'24_mie',       fin:false },
  '滋賀県':   { code:'25_shiga',     fin:false },
  '京都府':   { code:'26_kyoto',     fin:false },
  '大阪府':   { code:'27_osaka',     fin:false },
  '兵庫県':   { code:'28_hyogo',     fin:false },
  '奈良県':   { code:'29_nara',      fin:false },
  '和歌山県': { code:'30_wakayama',  fin:false },
  '鳥取県':   { code:'31_tottori',   fin:false },
  '島根県':   { code:'32_shimane',   fin:false },
  '岡山県':   { code:'33_okayama',   fin:false },
  '広島県':   { code:'34_hiroshima', fin:false },
  '山口県':   { code:'35_yamaguchi', fin:false },
  '徳島県':   { code:'36_tokushima', fin:false },
  '香川県':   { code:'37_kagawa',    fin:false },
  '愛媛県':   { code:'38_ehime',     fin:false },
  '高知県':   { code:'39_kochi',     fin:false },
  '福岡県':   { code:'40_fukuoka',   fin:false },
  '佐賀県':   { code:'41_saga',      fin:false },
  '長崎県':   { code:'42_nagasaki',  fin:false },
  '熊本県':   { code:'43_kumamoto',  fin:false },
  '大分県':   { code:'44_oita',      fin:false },
  '宮崎県':   { code:'45_miyazaki',  fin:false },
  '鹿児島県': { code:'46_kagoshima', fin:false },
  '沖縄県':   { code:'47_okinawa',   fin:false },
};
// 全47都道府県が検索・診断可能。
const ACTIVE_PREFS = Object.keys(PREF_FILES);
function curPref(){ var p=document.getElementById('pref'); return (p&&p.value)||'石川県'; }
function prefPath(kind){ var f=PREF_FILES[curPref()]; return f ? 'data/pref/'+f.code+'.'+kind+'.json' : null; }
// 県切替時：前県のデータ・選択状態を捨てて読み直せるようにする
function clearPrefData(){
  window.SCORES=null; window.SCORES_BYNAME=null; window.HIGHLIGHTS=null; window.FINANCIALS=null; window.FAC=[]; window._facPref='';
}
// 復元経路（共有リンク/前回結果）用：現在の都道府県の施設/スコアが読み込み済みか保証する。
// 別県が読み込まれていたら捨てて読み直す。ランキング母集団(axcNeighbors)は window.FAC/SCORES に依存するため必須。
function ensurePrefData(){
  if(window._facPref && window._facPref!==curPref()) clearPrefData();
  if(window.FAC && window.FAC.length && window.SCORES) return Promise.resolve();
  return Promise.all([loadFacilities(),loadScores(),loadHighlights(),loadFinancials()]);
}
// 復元経路では selSvc/selCd/selCity が空になる。施設名(・cd)から FAC を引いて再設定する。
// これが無いと axcNeighbors の x.s!==selSvc('') で全施設が弾かれ、母集団が自施設1件になる。
function hydrateSelFromFac(){
  if(anon||selCorp) return;
  if(selSvc) return;                       // 正規フロー(pickFac)で設定済みなら触らない
  if(!window.FAC||!window.FAC.length||!fname) return;
  var m=null;
  if(selCd){ m=window.FAC.filter(function(x){return x.n===fname&&(x.cd||'')===selCd;})[0]; }
  if(!m){ m=window.FAC.filter(function(x){return x.n===fname;})[0]; }
  if(!m) return;
  selCd=m.cd||''; selSvc=m.s||''; selCity=m.ct||'';
}
// === 公表データ実スコア（県別 scores）===
// scores[正規化名|cd] = {dev:{軸:偏差値}, raw:{軸:達成率}}。
window.SCORES = window.SCORES || null; window.SCORES_BYNAME = window.SCORES_BYNAME || null;
function loadScores(){
  if(window.SCORES) return Promise.resolve();
  return fetch(prefPath('scores'),{cache:'no-cache'}).then(r=>r.json()).then(d=>{
    window.SCORES = d.scores || {}; window.SCORES_BYNAME = d.byname || {};
    computePrefAvg();
  }).catch(e=>{ console.warn('scores load failed', e); window.SCORES={}; window.SCORES_BYNAME={}; window.PREFAVG=null; });
}
// 「県内平均」比較の基準線を、固定値ではなく“いま読み込んだ県の実データ”から軸ごとに計算する。
// 稼働などの生値が1.0を超える県データが混じっても、施設側と同じく1.0(=100%)で頭打ちにしてから平均する。
function computePrefAvg(){
  var sc=window.SCORES||{}, sums={}, cnts={};
  AXES.forEach(function(k){ sums[k]=0; cnts[k]=0; });
  for(var key in sc){ var e=sc[key]; if(!e||!e.raw) continue;
    AXES.forEach(function(k){ var rv=e.raw[k]; if(typeof rv==='number'){ if(rv>1) rv=1; sums[k]+=rv; cnts[k]++; } });
  }
  var o={}; AXES.forEach(function(k){ o[k]= cnts[k] ? Math.round(sums[k]/cnts[k]*1000)/10 : AVG[k]; });
  window.PREFAVG=o;
}
// 県内平均（実データ）。未計算・データ無しの軸は従来の固定値へフォールバック。
function prefAvgOf(k){ return (window.PREFAVG && typeof window.PREFAVG[k]==='number') ? window.PREFAVG[k] : AVG[k]; }
// === 施設ごとの具体項目（県別 highlights）＝結果文の強み/のびしろの具体化用 ===
// キー = 正規化名|cd（highlights側も normName で作成済み）。各軸 items[]／数値4軸は _num(0..1生値)。
window.HIGHLIGHTS = window.HIGHLIGHTS || null;
function loadHighlights(){
  if(window.HIGHLIGHTS) return Promise.resolve();
  return fetch(prefPath('highlights'),{cache:'no-cache'}).then(r=>r.json()).then(d=>{ window.HIGHLIGHTS = d || {}; })
    .catch(e=>{ console.warn('highlights load failed', e); window.HIGHLIGHTS={}; });
}
// === 実財務（県別 financials）＝黒字裏取りバッジ用。石川のみ提供。無い県は空で成立 ===
window.FINANCIALS = window.FINANCIALS || null;
function loadFinancials(){
  if(window.FINANCIALS) return Promise.resolve();
  var f=PREF_FILES[curPref()];
  if(!f || !f.fin){ window.FINANCIALS={}; return Promise.resolve(); }  // 富山・福井は財務データ無し→バッジ非表示
  return fetch(prefPath('financials'),{cache:'no-cache'}).then(r=>r.json()).then(d=>{ window.FINANCIALS = d || {}; })
    .catch(e=>{ console.warn('financials load failed', e); window.FINANCIALS={}; });
}
// === 全国平均（nation_avg.json）＝比較トグル「全国」「種別」の基準線用 ===
function loadNation(){
  if(window.NATIONAVG) return Promise.resolve();
  return fetch('nation_avg.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{
    window.NATIONAVG = d.NATIONAVG || {};
    window.TYPEAVG = d.TYPEAVG || {};      // cd別・全国平均達成率(%)
    window.NAME2CD = {};                    // サービス名→cd（selSvcはサービス名で入るため）
    var cn = d.CD_NAMES || {};
    for(var cd in cn){ if(cn[cd]) window.NAME2CD[cn[cd]] = cd; }
    var nb=document.querySelector('#cmpBase button[data-b="nation"]');
    if(nb){ nb.disabled=false; nb.removeAttribute('title'); nb.setAttribute('onclick',"setCmpBase('nation')"); var soon=nb.querySelector('.cmp-soon'); if(soon) soon.remove(); }
  }).catch(e=>{ console.warn('nation_avg.json load failed', e); window.NATIONAVG={}; window.TYPEAVG={}; window.NAME2CD={}; });
}
// === サービス種別ごとの全国タイプ分布（dist_by_service.json）＝比較トグル「サービス種別」の分布バー用 ===
function loadDistByService(){
  if(window.DIST_BY_SERVICE) return Promise.resolve();
  return fetch('data/dist_by_service.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{
    window.DIST_BY_SERVICE = d || {};      // {meta, service_names, dist:{cd:{n, share:{type:%}}}}
  }).catch(e=>{ console.warn('dist_by_service.json load failed', e); window.DIST_BY_SERVICE=null; });
}
function svcCd(){ return (window.NAME2CD && window.NAME2CD[selSvc]) || ''; }
// サービス種別の公式名→一般的な通称。無い種別は公式名のまま。selSvc空は「同じサービス種別」。
var SVC_ALIAS = {
  '通所介護':'デイサービス','地域密着型通所介護':'デイサービス',
  '通所リハビリテーション':'デイケア',
  '認知症対応型通所介護':'認知症デイサービス',
  '短期入所生活介護':'ショートステイ','短期入所療養介護':'ショートステイ',
  '介護老人福祉施設':'特別養護老人ホーム','地域密着型介護老人福祉施設入所者生活介護':'特別養護老人ホーム',
  '介護老人保健施設':'老健',
  '認知症対応型共同生活介護':'グループホーム',
  '小規模多機能型居宅介護':'小規模多機能',
  '看護小規模多機能型居宅介護':'看護小規模多機能',
  '特定施設入居者生活介護':'介護付き有料老人ホーム','地域密着型特定施設入居者生活介護':'介護付き有料老人ホーム',
  '居宅介護支援':'ケアマネ事業所',
  '福祉用具貸与':'福祉用具レンタル',
  '定期巡回・随時対応型訪問介護看護':'定期巡回'
};
function svcLabel(){ if(!selSvc) return '同じサービス種別'; return SVC_ALIAS[selSvc] || selSvc; }
function normName(s){
  s=String(s||'').replace(/[！-～]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0xFEE0);});
  return s.replace(/[\s　・（）()「」･]/g,'').toLowerCase();
}
// 偏差値(平均50)→ モックの0..3スケール。50→1.5, 80→3, 20→0。
function devToSc(dv){ return Math.max(0, Math.min(3, (dv-20)/60*3)); }
// scores.jsonの1施設分を0..3の軸マップに変換。
// 表示は「達成率」＝できている項目の割合（直感的：全部できていれば100%）。偏差値は同規模比較に別途使う。
// 稼働・働きやすさを含む全軸を公表データから読み込む。データが無い軸はnull＝診断の対象外。
function scEntryToAxes(e){
  if(!e) return null;
  var o={};
  AXES.forEach(function(k){
    var rv = e.raw && e.raw[k];   // 稼働(iruka)・働きやすさ(zou)も公表データ由来の客観値に。無ければnull＝不明
    if(typeof rv==='number') rv=Math.min(1,rv);   // 上限100%にそろえる（稼働rawが1.0超のバグ対策）
    o[k] = (typeof rv==='number') ? Math.round(rv*3*100)/100 : null;   // 達成率0..1 → 0..3
  });
  return o;
}
function realAutoScores(name,cd){
  if(!window.SCORES) return null;
  var e = window.SCORES[normName(name)+'|'+(cd||'')] || (window.SCORES_BYNAME||{})[normName(name)];
  window._curEntry = e || null;   // 同規模比較(偏差値)で使うため元データを保持
  return scEntryToAxes(e);
}
// 法人全体：配下事業所の実データ(偏差値)を平均
function realCorpScores(corp){
  if(!window.SCORES_BYNAME) return null;
  var list=(window.FAC||[]).filter(function(x){ return x.c===corp; });
  var sum={},cnt={}; AXES.forEach(function(k){ sum[k]=0; cnt[k]=0; });
  var any=false;
  list.forEach(function(x){
    var a=realAutoScores(x.n,x.cd); if(!a) return; any=true;
    AXES.forEach(function(k){ if(a[k]!=null){ sum[k]+=a[k]; cnt[k]++; } });
  });
  if(!any) return null;
  var o={}; AXES.forEach(function(k){ o[k]= cnt[k]? Math.round((sum[k]/cnt[k])*100)/100 : null; });
  return o;
}
const PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];


function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  var el=document.getElementById(id);
  el.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
  if(typeof renderHitomiBack==='function') renderHitomiBack();
}
// 「介護のひとみについて」→ 診断結果へ戻れるようにする
function goHitomiFromResult(){ window._hitomiReturn='result'; go('about-hitomi'); }
function backFromHitomi(){ var r=window._hitomiReturn||'result'; window._hitomiReturn=null; go(r); }
function renderHitomiBack(){ var el=document.getElementById('hitomiBack'); if(!el) return;
  if(window._hitomiReturn){ el.style.display=''; el.innerHTML='<button class="nbr-back" onclick="backFromHitomi()">◀&nbsp;<span class="nbr-nm">'+t('ui.back.result')+'</span></button>'; }
  else { el.style.display='none'; el.innerHTML=''; } }
function toggleLang(e){
  if(e&&e.stopPropagation) e.stopPropagation();
  var d=document.getElementById('langDrop');
  var open=d.classList.toggle('open');
  document.getElementById('langBtn').setAttribute('aria-expanded',open?'true':'false');
}
document.addEventListener('click',function(e){
  var d=document.getElementById('langDrop');
  if(d&&!d.contains(e.target)){ d.classList.remove('open'); document.getElementById('langBtn').setAttribute('aria-expanded','false'); }
});
// スマホで検索結果（施設名）をタップしても反応しない問題への対策。
// キーボードが開いた状態でタップすると、指を離す前に入力欄のフォーカスが外れて
// キーボードが閉じ→レイアウトがずれ→click確定時に別の位置を押した扱いになる。
// そこで、指が触れた項目を touch 時点で確定させ、直後の合成clickは無視する。
(function(){
  var _lastTouchSel=0, _sx=0, _sy=0, _moved=false;
  function fireItem(el,e){
    if(typeof el.onclick==='function'){ e.preventDefault(); _lastTouchSel=e.timeStamp||1; el.onclick(e); }
  }
  document.addEventListener('touchstart',function(e){
    var t=e.touches&&e.touches[0]; _moved=false;
    if(t){ _sx=t.clientX; _sy=t.clientY; }
  },{passive:true});
  document.addEventListener('touchmove',function(e){
    var t=e.touches&&e.touches[0];
    if(t&&(Math.abs(t.clientX-_sx)>10||Math.abs(t.clientY-_sy)>10)) _moved=true;  // スクロール判定
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(_moved) return;                                      // スクロール後の指離しは選択しない
    if(e.touches&&e.touches.length) return;                 // マルチタッチは無視
    var it=e.target.closest&&e.target.closest('.ritem[onclick]');
    if(it) fireItem(it,e);
  },{passive:false});
  // touchで既に処理した直後の合成clickを二重発火させない
  document.addEventListener('click',function(e){
    if(!_lastTouchSel) return;
    var dt=(e.timeStamp||0)-_lastTouchSel; _lastTouchSel=0;
    if(dt>=0&&dt<700){ var it=e.target.closest&&e.target.closest('.ritem[onclick]'); if(it){ e.stopPropagation(); e.preventDefault(); } }
  },true);
})();
function setLang(code,label,flag,el){
  document.getElementById('langLabel').textContent=label;
  var f=document.getElementById('langFlag'); if(f&&flag) f.textContent=flag;
  document.documentElement.lang=code;
  document.querySelectorAll('#langMenu a').forEach(a=>a.classList.remove('active'));
  if(el) el.classList.add('active');
  var d=document.getElementById('langDrop');
  if(d){ d.classList.remove('open'); document.getElementById('langBtn').setAttribute('aria-expanded','false'); }
  i18nSwitch(code);   // 辞書を読み込んで画面に適用（翻訳が無いキーは日本語のまま）
}
function toggleMenu(){ document.getElementById('navlinks').classList.toggle('open'); }
function closeMenu(){ document.getElementById('navlinks').classList.remove('open'); document.querySelectorAll('.navdrop.mobopen').forEach(function(d){ d.classList.remove('mobopen'); }); }
// 診断全体で共有する選択・表示状態。
let idx=0, pref='', fname='', faddr='', anon=false, curCands=[], email='', lastType='', facType='', freeWorry='', freeGood='', worryTag='', selCorp=null, selCd='', facCorp='', selCity='', selSvc='';
// スマホのハンバーガー内：親（タイプ図鑑/言語）をタップでサブ項目を開閉。PCは従来どおり遷移/ホバー
function navdropTap(e,el,goId){
  if(window.innerWidth<=900){
    if(e&&e.preventDefault) e.preventDefault();
    el.closest('.navdrop').classList.toggle('mobopen');
  } else if(goId){ go(goId); closeMenu(); }
}
function start(){ go('notice'); }

const CITY = {
  '北海道':['札幌市中央区','旭川市','函館市'],
  '宮城県':['仙台市青葉区','石巻市','大崎市'],
  '東京都':['新宿区','世田谷区','八王子市'],
  '埼玉県':['さいたま市大宮区','川越市','所沢市'],
  '千葉県':['千葉市中央区','船橋市','柏市'],
  '神奈川県':['横浜市西区','川崎市','藤沢市'],
  '愛知県':['名古屋市中区','豊田市','岡崎市'],
  '大阪府':['大阪市北区','堺市','東大阪市'],
  '兵庫県':['神戸市中央区','姫路市','西宮市'],
  '福岡県':['福岡市博多区','北九州市','久留米市'],
};
const DEF_CITY = ['中央区','本町','みどり台','さくら町'];

// 都道府県：8地方区分（県名はPREFSの表記に合わせる）
const PREF_REGIONS=[
  {label:'北海道・東北', prefs:['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県']},
  {label:'関東', prefs:['茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県']},
  {label:'中部', prefs:['新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県']},
  {label:'近畿', prefs:['三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県']},
  {label:'中国', prefs:['鳥取県','島根県','岡山県','広島県','山口県']},
  {label:'四国', prefs:['徳島県','香川県','愛媛県','高知県']},
  {label:'九州・沖縄', prefs:['福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']}
];
// 地方別の都道府県チップを生成。全47県が公開済みのためバッジは付けない。
function buildPrefChips(){
  var box=document.getElementById('prefChips');
  if(!box) return;
  box.innerHTML = PREF_REGIONS.map(function(g){
    var chips=g.prefs.map(function(p){
      // data-pref / selectPref はデータキー（日本語名）のまま。表示だけ pref.<名> で翻訳する。
      return '<button type="button" class="prefchip" data-pref="'+p+'" onclick="selectPref(\''+p+'\')">'+window.t('pref.'+p,null,p)+'</button>';
    }).join('');
    return '<div class="prefgroup"><div class="prefgroup-label">'+window.t('region.'+g.label,null,g.label)+'</div><div class="prefchips-row">'+chips+'</div></div>';
  }).join('');
}
// チップ選択：hidden #pref に値をセットして既存の分岐(onPrefChange)を呼ぶ
function selectPref(p){
  var h=document.getElementById('pref'); if(h) h.value=p;
  syncPrefChips();
  onPrefChange();
}
// #pref の現在値に合わせてチップのハイライトを同期
function syncPrefChips(){
  var cur=document.getElementById('pref'); cur=cur?cur.value:'';
  var chips=document.querySelectorAll('#prefChips .prefchip');
  for(var i=0;i<chips.length;i++){
    chips[i].classList.toggle('is-on', chips[i].getAttribute('data-pref')===cur);
  }
}
function onPrefChange(){
  var pv=document.getElementById('pref').value;
  // 全47都道府県が公開中。選択された県のデータを読み直す
  updatePrefLabels(pv);
  clearSel();
  clearPrefData();
  Promise.all([loadFacilities(),loadScores(),loadHighlights(),loadFinancials()]).then(function(){ searchFac(); });
}
// 比較トグルの「県内平均」ラベル・県ボタン表示を選択県名に追従（偏差値は県内基準のため）
function updatePrefLabels(pv){
  if(typeof BASE_LABEL!=='undefined') BASE_LABEL.pref = pv+'内の平均';
  var pb=document.querySelector('#cmpBase button[data-b="pref"]'); if(pb) pb.textContent=pv;
  var lbl=document.getElementById('cmpBaseLabel');
  if(lbl && (!window._cmp || window._cmp.base==='pref')) lbl.textContent=pv+'内の平均';
}
// メール収集リード保存。社内へ送信し、あわせてローカルにも退避する。
function saveLead(payload){
  try{ if(payload && payload.email) postLead(payload); }catch(e){}
  try{
    var key='shindan_leads';
    var arr=JSON.parse(localStorage.getItem(key)||'[]');
    arr.push(Object.assign({t:Date.now()}, payload||{}));
    localStorage.setItem(key, JSON.stringify(arr));
  }catch(e){}
  return Promise.resolve(true);
}
// === 実データ（facilities.json） ===
window.FAC = window.FAC || [];      // 全事業所
const FAC_LIMIT = 60;               // 検索結果の最大表示件数
function normFac(s){ return (s||'').replace(/[\s　]/g,'').toLowerCase(); }
function escHtml(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function loadFacilities(){
  if(window.FAC.length) return Promise.resolve();
  return fetch(prefPath('facilities'),{cache:'no-cache'}).then(r=>r.json()).then(d=>{
    window.FAC = d.items || []; window._facPref = curPref(); window._facLoadFailed=false;
  }).catch(e=>{ console.error('facilities load failed', e); window._facLoadFailed=true; });
}
// 入力のたびに全件検索するのは重い（大きい県で1文字ごとに引っかかる）。少し待ってから検索する。
function onFnameInput(){ clearTimeout(window._facT); window._facT=setTimeout(searchFac,200); }
// スマホで候補を1タップで選べるようにする。iOSはキーボードが閉じる瞬間に画面がずれて
// 通常のclickが取り消される（＝1回目が反応しない）ため、指を離した瞬間(touchend)で確定する。
// 縦に指を動かした場合はスクロール操作とみなして選択しない。
function bindPickList(boxId, attr, fn){
  var box=document.getElementById(boxId); if(!box || box._pickBound) return; box._pickBound=true;
  var ps=null;
  box.addEventListener('touchstart', function(e){
    var it=e.target.closest('[data-'+attr+']');
    ps = it ? {y:e.touches[0].clientY, x:e.touches[0].clientX, it:it, moved:false} : null;
  }, {passive:true});
  box.addEventListener('touchmove', function(e){
    if(!ps) return;
    if(Math.abs(e.touches[0].clientY-ps.y)>8 || Math.abs(e.touches[0].clientX-ps.x)>8) ps.moved=true;
  }, {passive:true});
  box.addEventListener('touchend', function(e){
    if(!ps) return; var st=ps; ps=null;
    if(st.moved) return;                 // スクロールは無視
    e.preventDefault();                  // 直後の合成clickを止めて二重発火を防ぐ
    fn(parseInt(st.it.getAttribute('data-'+attr),10));
  });
  box.addEventListener('click', function(e){ // PC（マウス）用
    var it=e.target.closest('[data-'+attr+']'); if(!it) return;
    fn(parseInt(it.getAttribute('data-'+attr),10));
  });
}
(function(){ function b(){ bindPickList('results','pick',pickFac); bindPickList('axcResults','axcpick',axcPickCmp); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',b); else b(); })();
// 都道府県チップを選んでいるか（未選択時は既定の石川県内だけを検索している）
function prefSelected(){ var p=document.getElementById('pref'); return !!(p&&p.value); }

function searchFac(){
  const q = document.getElementById('fname').value.trim();
  const box = document.getElementById('results');
  document.getElementById('selected').style.display='none';
  document.getElementById('startBtn').disabled = true;
  if(!q){ box.style.display='none'; box.innerHTML=''; return; }
  // 都道府県チップ未選択でも検索できるよう、施設データのロードを保証してから検索する
  var ensure = (window.FAC && window.FAC.length) ? Promise.resolve() : loadFacilities();
  ensure.then(function(){
  // 通信失敗で施設データが空のときは、名前違いと誤解させず通信環境を案内する
  if(window._facLoadFailed && (!window.FAC || !window.FAC.length)){
    curCands=[];
    box.innerHTML = `<div class="rhint">うまく読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。</div>`;
    box.style.display='block';
    return;
  }
  const nq = normFac(q);
  // 事業所名 または 法人名 に一致
  let hits = window.FAC.filter(x => normFac(x.n).indexOf(nq)>=0 || normFac(x.c).indexOf(nq)>=0);
  // 法人名の前方一致を優先、その後 名前順
  hits.sort((a,b)=>{
    const ac=normFac(a.c).indexOf(nq)===0?0:1, bc=normFac(b.c).indexOf(nq)===0?0:1;
    if(ac!==bc) return ac-bc;
    return i18nCmp(a.n,b.n);
  });
  const total = hits.length;
  if(!total){
    curCands = [];
    var extra = prefSelected() ? '' : '<br>（都道府県が未選択のため石川県内のみ検索しています。上で都道府県を選ぶと、その県で検索できます）';
    box.innerHTML = `<div class="rhint">「${escHtml(q)}」に一致する施設が見つかりませんでした${extra}</div>`;
    box.style.display='block';
    return;
  }
  // 法人ごとにまとめる：診断単位は施設ごと。法人名は見出しとして表示し、選べるのは個々の施設だけ。
  const corpTotal={}, corpCities={};
  window.FAC.forEach(x=>{ corpTotal[x.c]=(corpTotal[x.c]||0)+1; (corpCities[x.c]=corpCities[x.c]||new Set()).add(x.ct); });
  const corpsOrder=[], byCorp={};
  hits.forEach(x=>{ if(!byCorp[x.c]){ byCorp[x.c]=[]; corpsOrder.push(x.c); } byCorp[x.c].push(x); });
  curCands=[]; let rowsHtml='';
  for(const c of corpsOrder){
    if(curCands.length>=FAC_LIMIT) break;
    const facs=byCorp[c];
    const multi = corpTotal[c]>=2;            // 2事業所以上の法人は見出しを付ける（選択はできない）
    if(multi){
      const cities=[...corpCities[c]].join('・');
      rowsHtml += `<div class="ritem corphead"><b>${escHtml(c)}</b><span>${corpTotal[c]}事業所｜${escHtml(cities)}　— 診断する施設を選んでください</span></div>`;
    }
    for(const x of facs){
      if(curCands.length>=FAC_LIMIT) break;
      const idx=curCands.length;
      curCands.push(Object.assign({kind:'fac'}, x));
      rowsHtml += `<div class="ritem${multi?' under':''}" data-pick="${idx}"><b>${escHtml(x.n)}</b><span>${escHtml(x.s||'')}｜${escHtml(x.ct||'')}・${escHtml(x.c||'')}</span></div>`;
    }
  }
  let rows = `<div class="rhint">「${escHtml(q)}」に一致する施設 ${total}件`
    + (curCands.length<total?`（${curCands.length}件まで表示）`:'')+`</div>`;
  rows += rowsHtml;
  box.innerHTML = rows;
  box.style.display='block';
  });
}
function pickFac(i){
  const cd = curCands[i];
  anon = false;
  const s = document.getElementById('selected');
  document.getElementById('results').style.display='none';
  s.style.display='block';
  if(cd.kind==='corp'){
    selCorp = cd.c; selCd = ''; facCorp = cd.c; selCity=''; selSvc='';
    fname = cd.c; faddr = cd.cities||'';
    const sub = `${cd.count}事業所｜施設ごとに診断（次で施設をえらびます）`;
    s.innerHTML = `<div class="selname">${escHtml(cd.c)}<span class="corptag">法人</span></div><div class="seladdr">${escHtml(sub)}</div><span class="chg" onclick="clearSel()">変更</span>`;
  } else {
    selCorp = null; selCd = cd.cd || ''; facCorp = cd.c || '';
    fname = cd.n; faddr = cd.a || ((cd.ct||'')+'・'+(cd.c||'')); selCity = cd.ct||''; selSvc = cd.s||'';
    const sub = (cd.s?cd.s+'｜':'') + (cd.ct||'') + '・' + (cd.c||'');
    s.innerHTML = `<div class="selname">${escHtml(cd.n)}</div><div class="seladdr">${escHtml(sub)}</div><span class="chg" onclick="clearSel()">変更</span>`;
  }
  document.getElementById('startBtn').disabled = false;
}
function clearSel(){
  anon=false; selCorp=null; facCorp=''; faddr=''; fname=''; selCity=''; selSvc='';
  document.getElementById('selected').style.display='none';
  document.getElementById('results').style.display='none';
  document.getElementById('fname').value='';
  document.getElementById('startBtn').disabled = true;
}
function toQuiz(){
  // 全12軸を公表データから自動採点する。
  pref = document.getElementById('pref').value;
  // 法人は「一括で平均診断」しない（稼働・働きやすさは施設ごとに違うため）。施設別一覧を出す。
  if(selCorp && !anon){ return startCorpOverview(); }
  window._corpOverview = false;
  window._nbrBack = null;   // 通常診断に入る時は「他施設閲覧」の退避を破棄
  facType = '';
  freeWorry=''; freeGood=''; worryTag='';
  // 連打対策：読み込み中は再入させない（大きい県は数十MBのDLがあり、多重DLで悪化するため）。
  if(window._diagLoading) return;
  window._diagLoading = true;
  var sb=document.getElementById('startBtn');
  if(sb){ sb.disabled=true; if(!sb.dataset.orig) sb.dataset.orig=sb.innerHTML; sb.innerHTML=t('ui.loading',null,'読み込み中…'); }
  var restoreBtn=function(){ window._diagLoading=false; if(sb){ sb.disabled=false; if(sb.dataset.orig!=null) sb.innerHTML=sb.dataset.orig; } };
  // 都道府県チップ未選択のまま施設名検索→診断に入ると、スコア等が未ロードのことがある。
  // 採点前に必ず現在県のデータ（scores/highlights/financials）を読み込んでから判定する。
  ensurePrefData().then(function(){
    autoSc = realAutoScores(fname, selCd);
    restoreBtn();
    if(!autoSc){ alert('この施設の診断データを確認できませんでした。別の施設を選ぶか、時間をおいてもう一度お試しください。'); return; }
    // 稼働・働きやすさも公表データ（離職率・稼働率）で自動採点。質問は廃止し、そのまま結果へ。
    go('gate');
  }).catch(function(){ restoreBtn(); alert('通信環境をご確認のうえ、もう一度お試しください。'); });
}
// 法人：一括診断のかわりに「施設別一覧」を表示（質問なし・平均なし）。各施設をタップでその施設の通常診断へ。
function startCorpOverview(){
  window._corpOverview = true;
  // 質問回答は使用しない
  autoSc = null;                // 平均スコアは使わない
  showResult();
  go('result');
  window.scrollTo(0,0);
}
function restart(){ start(); }
// そなえ度チェック（フロント完結・送信なし）
window._chkAns = {};
function chkPick(q,val,btn){
  window._chkAns[q]=val;
  var row=btn.parentNode;
  row.querySelectorAll('.chk-b').forEach(function(b){ b.classList.remove('yes','no'); });
  btn.classList.add(val?'yes':'no');
  var e=document.getElementById('chkErr'); if(e) e.style.display='none';
}
function chkJudge(){
  if(Object.keys(window._chkAns).length<6){ document.getElementById('chkErr').style.display='block'; return; }
  document.getElementById('chkErr').style.display='none';
  var yes=0; for(var k in window._chkAns){ yes+=window._chkAns[k]; }
  var msg;
  if(yes<=1) msg='よく整っているようです。更に良くするヒントは診断結果でも見られます。';
  else if(yes<=3) msg='いくつか改善の余地がありそうです。仕組みで軽くできるかもしれません。';
  else msg='日々の手間が積み重なっているかもしれません。仕組みの見直しで大きく楽になる可能性があります。';
  document.getElementById('chkResultText').textContent='「はい」が'+yes+'個。'+msg; kutenForce(document.getElementById('chkResultText'));
  var r=document.getElementById('chkResult'); r.style.display='block';
  r.scrollIntoView({behavior:'smooth',block:'center'});
}
function goSec(id){ var e=document.getElementById(id); if(e) e.scrollIntoView({behavior:'smooth',block:'start'}); }
function scrollToCmp(){ goSec('sec5'); }
let tocObs=null;
function setupToc(){
  if(tocObs || typeof IntersectionObserver==='undefined') return;
  var links={}; document.querySelectorAll('.toc-link').forEach(function(a){ links[a.getAttribute('data-sec')]=a; });
  tocObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        for(var k in links){ links[k].classList.remove('active'); }
        var l=links[e.target.id]; if(l) l.classList.add('active');
      }
    });
  }, {rootMargin:'-84px 0px -68% 0px', threshold:0});
  ['sec3','sec5','sec6','sec8'].forEach(function(id){ var s=document.getElementById(id); if(s) tocObs.observe(s); });
  if(links['sec3']) links['sec3'].classList.add('active');
}

function calc(){
  const sc = {};
  const measured={};
  AXES.forEach(k=>{
    if(autoSc && autoSc[k]!=null){ sc[k] = autoSc[k]; measured[k]=true; }   // 実データ(公表データ)あり
    else { sc[k] = 1.5; measured[k]=false; }                     // この種別で測れない軸（診断対象外）
  });
  window._measured = measured;
  const total = AXES.reduce((a,k)=>a+sc[k],0);
  // タイプ・課題は「測れた軸」だけで決める（データが無い軸は診断に含めない）
  var pool = AXES.filter(function(k){ return measured[k]; }); if(!pool.length) pool = AXES.slice();
  // タイプ決定：スコア最大。同点のときは「よりレアなタイプ(rarity%が小さい)」を優先する。
  var rarPc=function(k){ return parseInt(TYPES[k]&&TYPES[k].rarity)||99; };
  let best=pool[0];
  pool.forEach(k=>{
    if(sc[k]>sc[best]) best=k;
    else if(sc[k]===sc[best] && rarPc(k)<rarPc(best)) best=k;
  });
  return {sc,total,typeKey:best,measured:measured,pool:pool};
}
// 測れた軸だけを返す（型・課題の選定に使う）
function measuredAxes(){ var m=window._measured||{}; var p=AXES.filter(function(k){return m[k];}); return p.length?p:AXES.slice(); }
// 伸びしろ軸：達成率30%以下を低い順に最大3件。0件なら一番低い軸1件だけ。不明(未測定)は除外。renderSW・renderSolveで共用。
function weakAxes(sc){
  if(!sc) return [];
  var ordW=measuredAxes().sort(function(a,b){return sc[a]-sc[b];});
  var low=ordW.filter(function(k){return Math.round(sc[k]/3*100)<=30;});
  if(low.length===0) low=ordW.slice(0,1);
  return low.slice(0,3);
}
// 軸→解決コピー（介護のひとみでできること・1行）。reports/solution-copy-20260720.md ＋ 法務修正(kuma/zou/fukurou)を反映。
var AX_SOLVE = {
  penguin:'ケアの手順やお手本を記録の中で共有でき、新しい職員への教え方をそろえる助けになります。',
  fukurou:'手書きや二重入力を減らし、記録も申し送りも一つの画面にまとめて、探す手間を減らしやすくなります。',
  risu:'食事の量や体調の変化を記録で残して共有でき、次のケアに引き継ぎやすくなります。',
  kuma:'ヒヤリとした出来事をその場で記録・共有でき、再発を防ぐための話し合いの土台づくりに役立ちます。',
  ookami:'急な体調変化や連絡事項をすぐ全員に共有でき、いざという時の動きをそろえる助けになります。',
  hachi:'利用者の情報を一つにまとめておくことが、家族や地域の関係先とやり取りする時の土台づくりに役立ちます。',
  inu:'記録や事務の手間を減らすことで、職員が本来のケアに向き合う時間を確保しやすくなります。',
  beaver:'看護・リハなど職種をまたいだ情報を一つの記録で見られ、連携して動きやすくなります。',
  kitsune:'記録が数字としてまとまり、稼働や実績を見える形にして、経営判断の材料をそろえやすくなります。',
  usagi:'現場の記録がそろって残ることが、これから事業を広げていく時の土台づくりに役立ちます。',
  iruka:'空きや利用状況を一つの画面で把握でき、受け入れの調整をしやすくなります。',
  zou:'記録や集計にかかる時間を減らし、残業をおさえる助けになります。'
};

const ANALYSIS = {
  kitsune:[
    '「やりくり上手のキツネ型」は、数字とお金の流れに強い経営巧者タイプです。使える補助金や制度を取りこぼさず、堅実に黒字を積み上げます。複数の事業でリスクを分散し、投資の判断も的確。派手さはなくとも、長く続く施設経営の"土台"を確実に固めているのが特徴です。',
    '課題は、その経営センスを"現場"にも還元すること。数字に強くても、人材定着やDXが後回しになると、いずれ現場の疲れが経営に跳ね返ってきます。生み出した利益を職員の待遇やデジタル化に回していければ、強い経営とよい現場が支え合って回りだし、更に安定します。'
  ],
  fukurou:[
    '「先進のフクロウ型」は、デジタルで賢く運営する知恵者タイプです。記録も情報共有もシステム化され、見守りセンサーや介護ロボットも使いこなします。無駄な作業や残業が少なく、限られた人手でも質を落とさず回せるのが最大の武器。データが自然とたまるので、改善のサイクルも速いのが強みです。',
    'ポイントは、効率化で生まれた"余力"をどこに使うか。空いた時間を集客や人材育成、ケアの質向上に振り向けられれば、フクロウ型は一気に伸びます。蓄積したデータを"ケアの見える化"に活かせば、他施設との明確な差別化にもつながります。'
  ],
  usagi:[
    '「勢いのウサギ型」は、事業所も売上も右肩上がりの急成長タイプです。新しいサービスや取り組みに次々と挑戦し、変化を恐れません。地域のニーズをいち早く形にするスピード感があり、これからの展開が一番楽しみな施設。勢いそのものが、職員や利用者を惹きつける魅力になっています。',
    '急成長の裏で気をつけたいのは、現場の"仕組み"が拡大に追いつくかどうか。人材の定着や記録・教育の標準化が後回しになると、質のばらつきや離職という形でツケが回ってきます。伸びている今こそ、足元の仕組みを整えるチャンス。土台が固まれば、成長は更に加速します。'
  ],
  iruka:[
    '「人気者のコアラ型」は、地域から選ばれ続ける集客の達人タイプです。紹介や口コミで問い合わせが途切れず、空き待ちが出るほどの信頼を集めています。「あの施設なら安心」という評判そのものが、何よりの資産。利用者が利用者を呼ぶ好循環ができているのが、このタイプの強さです。',
    '課題は、その高い人気を"今後"へどうつなげるか。常に満員ということは、応えきれていない需要があるということでもあります。事業の拡大や新サービスに踏み出せば、人気を成長に変えられます。選ばれている理由をデータで言語化できれば、再現性のある集客の仕組みになります。'
  ],
  inu:[
    '「仲間思いのイヌ型」の施設は、まず"働く人"を大切にします。声をかけあい、助けあい、新しく入った職員も自然になじんでいく。そんな空気が根づいているのではないでしょうか。人がやめずに長く続くから、ケアの知恵も少しずつ積み上がっていきます。職員が落ち着いて働ける場所は、利用者さんにとっても居心地のよい場所。ご家族からの信頼も、こうした毎日の積み重ねから生まれているのだと思います。',
    '一方で、人のがんばりに支えられている施設ほど、記録や事務の負担がそのまま現場に残りやすいものです。手書きや転記、二重入力に、大切な時間を取られていないでしょうか。この温かいチーム力はそのままに、日々の記録や手続きをもう少し身軽にできたら、職員はもっと目の前の人に向きあえるはずです。記録をデジタルにまとめて手間を減らすことは、今の現場でも十分にできます。人の力が主役の施設だからこそ、その力がもっと生きる仕組みが、次の一歩になるのかもしれません。'
  ],
  penguin:[
    '「みんなで育てるペンギン型」は、人を育てる仕組みが根づいたタイプです。研修やOJT、勉強会が活発で、新人が早く一人前になり、認知症ケアなど専門的な学びも積み上がります。育つ人がいる施設は、ケアの質が安定し、未来への安心感があります。',
    'ポイントは、育てた人材に長く働いてもらう「定着」とセットにすること。育成と定着がかみ合えば、ベテランが次の世代を育てる好循環が生まれ、施設全体の力が底上げされます。'
  ],
  beaver:[
    '「職人ぞろいのビーバー型」は、有資格者・専門職が充実した実力派タイプです。介護福祉士やリハビリ職、管理栄養士などがそろい、難しいケースにも確かな技術で対応できます。専門性の高さは、加算の取得やご家族の信頼にも直結します。',
    'その専門性を、対外的な発信や採用ブランドに活かせると、更に強くなります。資格・研修の保有状況をデータで管理し、「ここなら任せられる」を見える化していきましょう。'
  ],
  risu:[
    '「食事自慢のリス型」は、栄養ケアと食の楽しみを大切にするタイプです。一人ひとりに合わせた栄養の見直しやお口のケアの体制が整い、「食べる」を通して健康と満足を支えます。食事の評判は、施設選びの決め手にもなる大きな強みです。',
    '食の強みは、行事食や楽しみづくりと組み合わせると魅力が一段と増します。栄養・お口のケアの記録をデジタル化すれば、加算と質を両立しながら、強みを更に伸ばせます。'
  ],
  hachi:[
    '「地域とつながるミツバチ型」は、地域との関わりが豊富なタイプです。ボランティアや実習生の受け入れ、地域包括支援センターとの連携、防災協定や地域行事への参加など、施設が地域に開かれています。地域に根ざした存在は、利用者・ご家族はもちろん、まち全体からの信頼を集めます。',
    'ポイントは、その地域とのつながりを「見える化」して発信すること。連携や活動の実績を記録して伝えれば、信頼が更に広がり、紹介や見学、人材の応募にもつながります。地域は、施設を支えてくれる一番の味方です。'
  ],
  kuma:[
    '「安心・安全のクマ型」は、事故を防ぎ、利用者が安心して過ごせる守りの堅いタイプです。事故予防や緊急時対応の仕組みが行き届き、処分歴もなし。損害賠償保険など、もしもの備えも万全です。',
    '安全への取り組みは、ご家族にしっかり伝えることで信頼が更に高まります。ヒヤリハットや事故記録をデジタルで共有すれば、予防の精度も上がっていきます。'
  ],
  ookami:[
    '「用心深いオオカミ型」は、感染症・災害への備えに強いタイプです。感染症・食中毒対策やBCP（事業継続計画）、備蓄や訓練まで抜かりなく、いざという時に頼りになります。平時からの用心深さが、施設を守る力になっています。',
    '備えの取り組みは、安全・安心の発信材料としても有効です。BCPや訓練の記録を整えておけば、緊急時の対応が更に速く、確実になります。'
  ],
  zou:[
    '「働きやすいゾウ型」は、職員にやさしい職場づくりが得意なタイプです。残業が少なく、休日や有給も取りやすい。育休など制度も整い、柔軟な勤務形態で多様な働き方を支えます。働きやすさは、職員の定着と採用の大きな武器です。',
    'その働きやすさを採用ページなどで発信すると、応募が集まりやすくなります。勤務シフトや休暇をデジタルで管理すれば、忙しい時期でも働きやすさを保てます。'
  ]
};
// ここに各タイプのリアル動物画像URL/パスを入れると、全画面でSVGの代わりに画像が使われます。
const TYPE_IMG = { fukurou:'', kitsune:'', usagi:'', iruka:'', inu:'' };
// タイプ別フルバナー画像（帯ごと差し替え）。空のタイプは従来のグラデ＋SVG表示。
const TYPE_BANNER = { inu:'assets/犬.webp?v=20260723b', penguin:'assets/ペンギン.webp?v=20260723b', fukurou:'assets/ふくろう.webp?v=20260723b', risu:'assets/リス.webp?v=20260723b', kuma:'assets/熊.webp?v=20260723b', ookami:'assets/狼.webp?v=20260723b', hachi:'assets/ミツバチ.webp?v=20260723b', beaver:'assets/ビーバー.webp?v=20260723b', kitsune:'assets/きつね.webp?v=20260723b', usagi:'assets/うさぎ.webp?v=20260723b', iruka:'assets/コアラ.webp?v=20260723b', zou:'assets/ゾウ.webp?v=20260723b' };
// 画像内にタイトル等の文字が焼き込まれているバナー（HTML側の重複テキストを隠す）
const TYPE_BANNER_BAKED = {};
// 図鑑詳細ページの拡張データ（今回は inu のみ。他タイプは未設定＝従来表示にフォールバック）
const PROFILE_RICH = {
  inu:{
    tldr:'スタッフが辞めない、あったか職場。<br>人が長く続くから、ケアの知恵と利用者の安心が積み上がるタイプです。',
    faceLead:'「仲間思いのイヌ型」は、こんな施設です。<br>一人ひとりを大切にする気持ちが、職場にしっかり根づいています。<br>長く働き続ける職員が多く、先輩が後輩を見守りながら育てる空気があるのではないでしょうか。<br>その温かいつながりが、施設全体の力になっています。',
    face:{ good:['職員の定着','チームワーク','人を育てる'],
      goodCards:[
        ['🤝','職員の定着','人が辞めずに長く働き、ベテランの経験が職場に積み上がっていきます。'],
        ['👥','チームワーク','声をかけ合い、助け合う空気が根づいていて、忙しい時も支え合えます。'],
        ['🌱','人を育てる','研修や日々の声かけで、新しく入った職員も安心して成長できます。']
      ],
      style:['顔なじみ重視','じっくり型','手厚い対面'],
      weak:['記録のデジタル化','外への発信'] },
    scenesLead:'何年も一緒に働いてきた顔ぶれが、今日も同じフロアに並んでいる。<br>忙しい時間帯でも、言わなくても手が出て、目配せひとつで動きが合う。<br>新しく入った職員も、先輩たちの輪に少しずつなじんでいく。<br>仲間思いのイヌ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🤝','新人がすぐなじむ','「分からないことは聞いてね」が自然に飛び交い、入ったばかりの職員も孤立しません。'],
      ['👵','“いつもの人”がいる安心','顔なじみの職員が長く続くから、利用者もご家族も「あの人がいるなら」と安心して任せられます。'],
      ['📎','でも、記録は手作業のまま','人の頑張りで回っている分、手書きや転記の負担が現場に残りがち。ここが次の一歩です。']
    ],
    dayLead:'典型的なイヌ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['8:30','朝礼はにぎやか','「昨日◯◯さん、よく眠れてたよ」と、申し送りが雑談まじりで自然に回ります。'],
      ['10:00','顔なじみのケア','利用者は担当職員の顔を覚えていて、名前を呼ぶだけで表情がゆるみます。'],
      ['15:00','新人にそっと一言','ベテランが「こういう時はこうするといいよ」と、忙しい合間に声をかけます。'],
      ['18:00','そして、記録の時間','1日の頑張りを、紙やバラバラのメモに書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「定着」',lead:'職員が長く働き続けてくれる。<br>それは、この職場の人と人との関わりが心地よい、という何よりの証しではないでしょうか。<br>気持ちよく働ける場所には、自然と人が残ります。<br>その手ごたえがどのくらいあるのか、次の3つの数字でたしかめてみましょう。',
      pct:63.6,label:'人間関係の改善',
      note:'離職率が下がった事業所の <b style="color:var(--inuInk)">63.6%</b> が、その理由に「職場の人間関係の改善」を挙げています。イヌ型の“あったかさ”は、定着の王道です。',
      items:[
        {head:'離職が減った理由',pct:63.6,label:'',note:'離職率が下がった事業所の <b style="color:var(--inuInk)">63.6%</b> が、その理由に「職場の人間関係の改善」を挙げています。イヌ型の“あったかさ”は、定着の王道です。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'介護職が辞める一番の理由',pct:34.3,label:'',note:'介護の仕事を辞めた理由で最も多いのが「職場の人間関係」（<b style="color:var(--coralInk)">34.3%</b>）。人間関係の良さは、定着を左右します。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'},
        {head:'定着が進んだ職場の共通点',pct:37.8,label:'',note:'離職率が下がった事業所の <b style="color:var(--tealInk)">37.8%</b> が「職場全体で介護の質を高める意識を共有した」ことを理由に挙げています。',accent:'var(--tealInk)',accentSoft:'#dcefe9'}
      ],
      src:'出典：介護労働安定センター 令和5年度 介護労働実態調査'},
    relLead:'同じ「人」を大事にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、人を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['zou','似ている：どちらも「働きやすい職場づくり」を大切にするタイプ。人を大事にする姿勢が共通していて、めざす方向が近いので相性がいいです。'], ['penguin','似ている：どちらも「人」を大切にし、育てて長く働いてもらう文化が根づいたタイプ。人を育てる姿勢が共通していて相性がいいです。'], ['fukurou','補い合える：イヌ型が苦手にしがちな記録のデジタル化を、フクロウ型は得意にしています。互いに補い合えるので相性がいいです。'] ],
    growLead:'温かいチーム力はそのままに、<b style="color:var(--inuInk)">記録の手間</b>を軽くできると、イヌ型は更に伸びます。',
    grow:{now:'手書き・転記・二重入力に時間を取られ、せっかくのチーム力が事務作業に消えがち。',
      next:'記録をデジタルにまとめて手間を減らせば、職員はもっと目の前の人に向きあえます。定着とケアの質が同時に伸びます。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',
      p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと“伸びしろ”を無料で診断します。'}
  },
  penguin:{
    tldr:'新しい人が、ちゃんと育つ職場。<br>教える仕組みが根づいているから、ケアの質が安定して積み上がるタイプです。',
    faceLead:'「みんなで育てるペンギン型」は、こんな施設です。<br>人を育てる仕組みが、職場にしっかり根づいています。<br>研修や勉強会、日々の教え合いを通して、新しく入った職員が早く一人前に近づいていくのではないでしょうか。<br>その"育てる力"が、施設全体のケアの質を支えています。',
    face:{ good:['人が育つ仕組み','専門的な学び','学び合う文化'],
      goodCards:[
        ['🌱','人が育つ仕組み','研修やOJTが整い、新人が早く一人前に近づいていきます。'],
        ['📚','専門的な学び','認知症ケアなど、専門的な学びが職場に積み上がります。'],
        ['🤝','学び合う文化','先輩後輩が教え合い、みんなで力を伸ばしていける空気があります。']
      ],
      style:['じっくり育てる','学び好き','面倒見がいい'],
      weak:['育てた人の定着','育成の記録・発信'] },
    scenesLead:'新しく入った職員が、先輩について少しずつ仕事を覚えていく。<br>「次はこうしてみよう」と、声をかけ合いながら学びが回っていく。<br>勉強会で得た知識が、翌日のケアにそっと活きる。<br>みんなで育てるペンギン型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🌱','新人がぐんぐん伸びる','教える手順が決まっているから、はじめての人も迷わず仕事を覚えていけます。'],
      ['📚','学びが日常にある','勉強会や研修が根づき、「知っている」から「できる」に変わっていきます。'],
      ['📎','でも、育てた記録は手作業のまま','せっかくの研修や成長の記録が、紙やバラバラのメモに散らばりがち。ここが次の一歩です。']
    ],
    dayLead:'典型的なペンギン型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','朝は今日の学びから','「今日は◯◯さんに付いて覚えてね」と、その日の育成の狙いを共有します。'],
      ['11:00','背中を見て覚える','先輩のケアを間近で見ながら、コツを一つずつ受け取っていきます。'],
      ['15:00','ふり返りの時間','「今日できたこと・迷ったこと」を短く話し合い、次につなげます。'],
      ['18:00','そして、記録の時間','研修や成長のあゆみを、紙やメモに書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'育成が"定着"につながる理由',lead:'せっかく育てた職員に、長く働き続けてほしい。<br>それは、人を大切にする施設の共通の願いではないでしょうか。<br>育成と定着はつながっています。<br>「なぜ人が辞めるのか」を知ることが、育てた力を活かす第一歩です。',
      pct:63.6,label:'人間関係の改善',note:'離職率が下がった事業所の <b style="color:var(--inuInk)">63.6%</b> が、その理由に「職場の人間関係の改善」を挙げています。育てる文化は、定着の土台になります。',
      items:[
        {head:'介護職が辞める一番の理由',pct:34.3,label:'',note:'介護の仕事を辞めた理由で最も多いのが「職場の人間関係」（<b style="color:var(--coralInk)">34.3%</b>）。育てた人に長く働いてもらうには、関係づくりも大切です。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'},
        {head:'人間関係の改善で離職が減る',pct:63.6,label:'',note:'離職率が下がった事業所の <b style="color:var(--inuInk)">63.6%</b> が、その理由に「職場の人間関係の改善」を挙げています。育てる文化は、定着の土台になります。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'}
      ],
      src:'出典：介護労働安定センター 令和5年度 介護労働実態調査'},
    relLead:'同じ「人」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、人を育てて長く活かす考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['inu','似ている：どちらも「人」を大切にするタイプ。ペンギン型が育て、イヌ型が長く働き続けてもらう。人を伸ばして活かす姿勢が共通していて相性がいいです。'], ['beaver','似ている：どちらも職員の力を高めることを大切にするタイプ。育成と専門性は近い関係で、めざす方向が似ています。'], ['fukurou','補い合える：ペンギン型が手作業になりがちな研修・成長の記録を、フクロウ型は得意にしています。互いに補い合えるので相性がいいです。'] ],
    growLead:'人を育てる力はそのままに、<b style="color:var(--inuInk)">育てた記録と定着</b>をつなげられると、ペンギン型は更に伸びます。',
    grow:{now:'研修や成長のあゆみが紙やメモに散らばり、せっかくの育成が"見える形"で残りにくい。',
      next:'育成の記録をデジタルにまとめれば、教え方がそろい、成長も追いやすくなります。育てた人が長く働き、ケアの質が安定して積み上がります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  fukurou:{
    tldr:'デジタルで、賢く回す職場。<br>記録も共有も仕組み化されているから、少ない人手でも質を落とさず回せるタイプです。',
    faceLead:'「先進のフクロウ型」は、こんな施設です。<br>デジタルを上手に使いこなす知恵が、職場に根づいています。<br>記録も情報共有も仕組みになっていて、無駄な作業や残業が少ないのではないでしょうか。<br>その賢い運営が、限られた人手を強い味方に変えています。',
    face:{ good:['高い業務効率','少ない残業','スムーズな情報共有'],
      goodCards:[
        ['⚡','高い業務効率','無駄のない運営で、少ない人手でも質を保てます。'],
        ['🌙','少ない残業','仕組み化で現場の負担を抑えられています。'],
        ['🔗','スムーズな情報共有','記録や連絡がデジタルでつながり、伝達ミスが減ります。']
      ],
      style:['仕組み好き','スマート運営','データ重視'],
      weak:['対面の温かさ','外への発信'] },
    scenesLead:'朝の申し送りは、画面を見ればひと目で分かる。<br>「あれ、どこに書いたっけ」と記録を探し回ることも少ない。<br>空いた時間を、目の前の利用者さんに向けられる。<br>先進のフクロウ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['📱','情報がすぐ届く','記録や連絡がその場で共有され、「聞いていない」が起きにくくなります。'],
      ['⏱️','残業が少ない','転記や探しものの手間が減り、定時で帰りやすい空気があります。'],
      ['🤲','でも、人の温かさは意識して','効率が進むほど、対面のひと声や手厚さが後回しにならないよう気を配りたいところ。ここが次の一歩です。']
    ],
    dayLead:'典型的なフクロウ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['8:30','画面で申し送り','夜勤からの引き継ぎが記録に残っていて、朝礼がスムーズに始まります。'],
      ['10:00','その場で記録','ケアのあとにすぐ入力。あとでまとめて書き写す手間がありません。'],
      ['14:00','データを見て相談','たまった記録を見ながら「ここを直そう」と改善の話ができます。'],
      ['18:00','余力をケアに回す','事務が軽いぶん生まれた時間を、利用者さんとの関わりに向けられます。']
    ],
    data:{title:'数字で見る「デジタルの効き目」',lead:'記録や見守りをデジタルにすると、現場はどれくらい軽くなるのか。<br>それは、フクロウ型がいちばん実感しているところではないでしょうか。<br>手間が減れば、その時間はケアに戻せます。<br>国の実証で分かった効き目を、数字で見てみましょう。',
      pct:24,label:'夜勤の負担が軽く',note:'見守りセンサーを全床に導入した施設で、夜勤の直接介護・見回り・移動の時間が約<b style="color:var(--inuInk)">24%</b>（職員1人あたり1日26.5分）減った実証結果があります。デジタルは、現場の"体感"を変えます。',
      src:'出典：厚生労働省 介護ロボットの導入効果に関する実証事業（2021年）'},
    relLead:'同じ「効率」や「数字」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、賢く回す考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['kitsune','似ている：どちらも「数字」で運営を見るタイプ。効率と経営、見ている方向が近く、話が合いやすい相性です。'], ['zou','似ている：どちらも仕組みで現場をラクにするタイプ。効率化で働きやすさを生む点が共通していて相性がいいです。'], ['inu','補い合える：フクロウ型が薄くなりがちな対面の温かさを、イヌ型は得意にしています。効率と人情、互いに補い合えるので相性がいいです。'] ],
    growLead:'賢い運営はそのままに、<b style="color:var(--inuInk)">生まれた余力の使い道</b>を決められると、フクロウ型は更に伸びます。',
    grow:{now:'効率化で時間は生まれても、その余力を"次の一手"に振り向けきれていないことがある。',
      next:'空いた時間を人材育成や集客、ケアの質向上に回せば、強みが一段と活きます。たまったデータを"ケアの見える化"に使えば、施設の魅力を伝える材料にもなります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  risu:{
    tldr:'「食べる」を大切にする職場。<br>一人ひとりに合わせた栄養とお口のケアで、健康と満足を支えるタイプです。',
    faceLead:'「食事自慢のリス型」は、こんな施設です。<br>栄養ケアと食の楽しみを大切にする気持ちが、職場に根づいています。<br>一人ひとりに合わせた栄養の見直しやお口のケアが行き届いているのではないでしょうか。<br>「食べる」を通して、利用者さんの健康と笑顔を支えています。',
    face:{ good:['栄養ケアの体制','管理栄養士が活躍','食事の満足度'],
      goodCards:[
        ['🍚','栄養ケアの体制','一人ひとりに合わせた栄養の見直しが行き届いています。'],
        ['👩‍⚕️','管理栄養士が活躍','食と健康を、専門職がしっかり支えます。'],
        ['😋','食事の満足度','「ここのごはんはおいしい」が、選ばれる理由になります。']
      ],
      style:['食を大切に','健康志向','おもてなし'],
      weak:['食の強みの発信','栄養・口腔の記録'] },
    scenesLead:'「今日のお昼、楽しみだね」と、食事の時間を心待ちにする声。<br>体調や飲み込みに合わせて、一人ひとりのお皿がそっと整えられている。<br>「よく食べられましたね」と、小さな変化に気づく職員がいる。<br>食事自慢のリス型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🍚','一人ひとりに合った食事','体調や飲み込みに合わせて、無理なく食べられる工夫が行き届いています。'],
      ['😋','食べる楽しみがある','行事食や季節のメニューが、毎日の小さな楽しみになっています。'],
      ['📎','でも、食の記録は手作業のまま','食事量やお口の状態の記録が、紙やメモに散らばりがち。ここが次の一歩です。']
    ],
    dayLead:'典型的なリス型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:30','今日の献立を確認','「◯◯さんは刻み食」と、一人ひとりに合った食事を朝から準備します。'],
      ['12:00','食事は楽しみの時間','「おいしいね」の声が飛び交い、食べる様子を職員が見守ります。'],
      ['13:00','お口のケアも大切に','食後の口腔ケアで、飲み込みの力と健康を守ります。'],
      ['18:00','そして、記録の時間','食事量やお口の状態を、紙やメモに書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'「食べる」が支える、健康と満足',lead:'食事は、毎日のいちばんの楽しみ。<br>そして、健康を守る土台でもあります。<br>栄養とお口のケアがしっかりしている施設は、選ばれる理由がはっきりしているのではないでしょうか。<br>その手ごたえを、数字でたしかめてみましょう。',
      pct:54.8,label:'低栄養リスク',note:'介護保険施設の入所者の約2人に1人が、低栄養の中・高リスクに当てはまります。',
      items:[
        {head:'低栄養リスク',pct:54.8,label:'施設入所者の割合',note:'介護保険施設の入所者1,646名のうち、低栄養状態の中・高リスク者は <b style="color:var(--inuInk)">54.8%</b>。食事と栄養のケアは、元気を支える土台です。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'200日後の死亡率',pct:12.3,label:'低栄養リスク者の場合',note:'栄養リスクが低い群の200日以内の死亡率は4.4%、中・高リスク群は <b style="color:var(--coralInk)">12.3%</b> と約2倍の差があります。栄養ケアは、健康を左右します。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：健康長寿ネット（長寿科学振興財団）「介護保険施設における低栄養と栄養ケア・マネジメントの課題」（2015年）'},
    relLead:'同じ「ケアの質」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、専門的なケアを大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['beaver','似ている：どちらも専門職の力で質の高いケアを支えるタイプ。栄養と専門性、めざす方向が近く相性がいいです。'], ['kuma','似ている：どちらも利用者の健康と安心を守るタイプ。食の安全と事故予防は近い関係で、大切にするものが似ています。'], ['kitsune','補い合える：リス型の食の強みを、キツネ型は加算や経営に結びつけるのが得意です。互いに補い合えるので相性がいいです。'] ],
    growLead:'食の強みはそのままに、<b style="color:var(--inuInk)">記録と発信</b>を整えられると、リス型は更に伸びます。',
    grow:{now:'食事量やお口の状態の記録が手作業で、せっかくの強みが加算や集客に活かしきれていない。',
      next:'栄養・お口のケアの記録をデジタルにまとめれば、加算と質を両立できます。食の魅力を伝えれば、選ばれる理由がもっとはっきりします。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  kuma:{
    tldr:'事故を防ぐ、守りの堅い職場。<br>もしもの備えが行き届いているから、利用者もご家族も安心して過ごせるタイプです。',
    faceLead:'「安心・安全のクマ型」は、こんな施設です。<br>事故を防ぎ、安心を守る姿勢が、職場に根づいています。<br>ヒヤリとした出来事を共有し、緊急時の備えも整っているのではないでしょうか。<br>その堅実な守りが、利用者さんとご家族の安心につながっています。',
    face:{ good:['事故予防の仕組み','緊急時対応が万全','安全運営の実績'],
      goodCards:[
        ['🛡️','事故予防の仕組み','ヒヤリとした出来事を共有し、同じミスを防ぐ習慣があります。'],
        ['🚑','緊急時対応が万全','もしもの時に誰がどう動くか、備えが整っています。'],
        ['✅','安全運営の実績','処分歴もなく、安全に運営してきた積み重ねがあります。']
      ],
      style:['慎重・堅実','守りが得意','安心第一'],
      weak:['安全の取り組みの発信','事故・予防の記録'] },
    scenesLead:'「さっき、ここで転びそうになっていたよ」と、小さな気づきがすぐ共有される。<br>危ないところには、いつのまにか手すりや目印が増えている。<br>もしもの時の動きが、みんなの頭に入っている。<br>安心・安全のクマ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🛡️','ヒヤリを見逃さない','「危なかった」を職員みんなで共有し、大きな事故になる前に手を打てます。'],
      ['🚑','もしもに強い','急な体調変化にも、慌てず動ける手順が身についています。'],
      ['📎','でも、その記録は手作業のまま','ヒヤリハットや事故の記録が、紙に散らばりがち。ここが次の一歩です。']
    ],
    dayLead:'典型的なクマ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','危ない場所を確認','「今日は床がすべりやすい」など、その日のリスクを朝に共有します。'],
      ['11:00','見守りは丁寧に','転倒や誤嚥のサインに気づけるよう、目配りを欠かしません。'],
      ['16:00','ヒヤリを話し合う','「危なかった場面」を持ち寄り、次の予防につなげます。'],
      ['18:00','そして、記録の時間','ヒヤリハットや事故の記録を、紙に書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「安心の土台」',lead:'事故を防ぐことは、利用者さんとご家族を守ること。<br>そして、施設への信頼を守ることでもあります。<br>ヒヤリとした出来事を共有し、備える。<br>その積み重ねがどれだけ大切か、数字で見てみましょう。',
      pct:65.6,label:'転倒・転落・滑落',note:'介護施設で起きる事故のうち、転倒・転落・滑落が最も多くを占めます。',
      items:[
        {head:'転倒・転落・滑落',pct:65.6,label:'介護事故で最多',note:'介護施設で起きる事故のうち、<b style="color:var(--inuInk)">65.6%</b> が転倒・転落・滑落。だからこそ「小さなヒヤリ」を拾って共有する力が、事故を防ぎます。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'誤嚥・誤飲・むせ',pct:13,label:'2番目に多い事故',note:'転倒・転落に次いで多いのが誤嚥・誤飲・むせで <b style="color:var(--coralInk)">13%</b>。日々の見守りと共有が、備えになります。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：介護労働安定センター「介護サービスの利用に係る事故の防止に関する調査研究事業」報告書（厚生労働省 老人保健健康増進等事業／2018年）'},
    relLead:'同じ「守り」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、リスクへの備えを大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['ookami','似ている：どちらも「もしも」に備えるタイプ。日々の事故予防と災害への備え、守る姿勢が共通していて相性がいいです。'], ['beaver','似ている：どちらも専門的な力で利用者を守るタイプ。確かな技術と安全、大切にするものが近いです。'], ['fukurou','補い合える：クマ型が手作業になりがちなヒヤリ・事故の記録を、フクロウ型は共有の仕組みにできます。互いに補い合えるので相性がいいです。'] ],
    growLead:'堅実な守りはそのままに、<b style="color:var(--inuInk)">記録の共有と発信</b>を整えられると、クマ型は更に伸びます。',
    grow:{now:'ヒヤリハットや事故の記録が紙に散らばり、予防の知恵が施設全体に広がりにくい。',
      next:'記録をデジタルで共有すれば、同じミスを防ぐ話し合いの土台ができます。安全への取り組みをご家族に伝えれば、信頼が更に高まります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  ookami:{
    tldr:'"もしも"に強い、用心深い職場。<br>感染症や災害への備えが抜かりないから、いざという時に頼りになるタイプです。',
    faceLead:'「用心深いオオカミ型」は、こんな施設です。<br>いざという時に備える用心深さが、職場に根づいています。<br>感染症・食中毒への対策やBCP（事業を続ける計画）、備蓄や訓練まで整っているのではないでしょうか。<br>その平時からの備えが、施設と利用者さんを守る力になっています。',
    face:{ good:['感染対策が万全','事業を続ける計画','訓練・備蓄が充実'],
      goodCards:[
        ['🦠','感染対策が万全','感染症や食中毒に強い体制が整っています。'],
        ['📋','事業を続ける計画','災害時にもサービスを止めない計画（BCP）があります。'],
        ['🎒','訓練・備蓄が充実','訓練を重ね、備蓄もそろえて、いざという時に動けます。']
      ],
      style:['用心深い','備えが得意','いざに強い'],
      weak:['平時の価値の発信','計画・訓練の記録'] },
    scenesLead:'「もし今、地震が来たら」を、みんなが具体的に考えられる。<br>感染症が流行っても、慌てず動ける手順がある。<br>備蓄の棚を見れば、いざという時の安心がそこにある。<br>用心深いオオカミ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🦠','感染症に強い','手洗い・消毒の習慣と手順が根づき、流行の波にも慌てません。'],
      ['🎒','いざに備えがある','訓練と備蓄で、災害時にもサービスを止めない準備ができています。'],
      ['📎','でも、その価値は普段見えにくい','せっかくの備えが、平時にはご家族に伝わりにくい。ここが次の一歩です。']
    ],
    dayLead:'典型的なオオカミ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','手洗い・消毒から','感染対策の基本を、毎日欠かさず徹底します。'],
      ['13:00','備蓄をチェック','食料・水・衛生用品の残りを確認し、いざに備えます。'],
      ['15:00','もしもの訓練','「災害時はどう動くか」を、短時間でも繰り返し確認します。'],
      ['18:00','そして、記録の時間','計画や訓練の記録を、紙に書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'「備え」は、もう義務の時代',lead:'災害や感染症は、いつ起きるか分かりません。<br>だからこそ、平時からの備えが施設を守ります。<br>いま、その備えは"任意"から"義務"へと変わりました。<br>時代の流れを、数字と事実で見てみましょう。',
      pct:29.3,label:'感染症BCPの策定完了',note:'2024年4月から、すべての介護事業者に業務継続計画（BCP）の作成が義務づけられました。',
      items:[
        {head:'感染症BCP',pct:29.3,label:'策定完了（2023年7月時点）',note:'2024年4月から、すべての介護事業者に業務継続計画（BCP）の作成が義務づけられました。義務化前の2023年7月時点で感染症BCPを「策定完了」できていたのは <b style="color:var(--inuInk)">29.3%</b>。オオカミ型は、一歩先を行きます。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'自然災害BCP',pct:26.8,label:'策定完了（2023年7月時点）',note:'自然災害BCPを「策定完了」できていたのは <b style="color:var(--coralInk)">26.8%</b>。備えが整っていることは、それだけで大きな強みです。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：厚生労働省 社会保障審議会（介護給付費分科会）業務継続に関する調査研究事業（2023年）／ BCP義務化＝令和3年度介護報酬改定'},
    relLead:'同じ「備え」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、もしもへの用心を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['kuma','似ている：どちらも「もしも」に備えるタイプ。災害への備えと日々の事故予防、守る姿勢が共通していて相性がいいです。'], ['hachi','似ている：どちらも地域と支え合うタイプ。防災協定や協力先とのつながりは、備えと地域、両方に効きます。'], ['fukurou','補い合える：オオカミ型が手作業になりがちな計画・訓練の記録を、フクロウ型は共有の仕組みにできます。互いに補い合えるので相性がいいです。'] ],
    growLead:'抜かりない備えはそのままに、<b style="color:var(--inuInk)">その価値の発信と記録</b>を整えられると、オオカミ型は更に伸びます。',
    grow:{now:'せっかくの備えが平時には見えにくく、計画・訓練の記録管理も負担になりがち。',
      next:'計画や訓練の記録をデジタルにまとめれば、管理がラクになり、更新も続けやすくなります。備えの姿勢を伝えれば、安心を選ぶご家族に届きます。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  hachi:{
    tldr:'地域に開かれた、つながる職場。<br>まちと支え合う関係があるから、信頼も紹介も自然と集まるタイプです。',
    faceLead:'「地域とつながるミツバチ型」は、こんな施設です。<br>地域と関わり、支え合う姿勢が、職場に根づいています。<br>ボランティアや実習生の受け入れ、地域包括や他機関との連携が活発なのではないでしょうか。<br>その開かれた関係が、まち全体からの信頼を集めています。',
    face:{ good:['地域連携が活発','受け入れに前向き','まちと防災で協力'],
      goodCards:[
        ['🤝','地域連携が活発','地域包括支援センターや他機関と、よくつながっています。'],
        ['🏫','受け入れに前向き','ボランティアや実習生を受け入れ、地域に開かれています。'],
        ['🏘️','まちと防災で協力','防災協定や地域行事を通して、まちぐるみで支え合います。']
      ],
      style:['社交的','地域密着','開かれた運営'],
      weak:['つながりの発信','連携・活動の記録'] },
    scenesLead:'地域のボランティアさんが、今日も顔を出してくれる。<br>「困ったことがあれば、いつでも」と言い合える相手がまちにいる。<br>お祭りや防災訓練で、施設と地域が自然に混ざり合う。<br>地域とつながるミツバチ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🤝','地域が味方になる','困った時に頼れる相手がまちにいて、いざという時に支え合えます。'],
      ['🏫','人が出入りする活気','ボランティアや実習生が訪れ、施設に外の風が入ります。'],
      ['📎','でも、その活動は記録が手薄','せっかくの連携や活動が、記録に残らず信頼や集客に活きにくい。ここが次の一歩です。']
    ],
    dayLead:'典型的なミツバチ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['10:00','地域の人が来訪','ボランティアや実習生を迎え、施設に活気が生まれます。'],
      ['13:00','関係先と連絡','地域包括や医療機関と情報をやり取りし、連携して動きます。'],
      ['15:00','行事の打ち合わせ','地域のお祭りや防災訓練に向けて、まちの人と準備します。'],
      ['18:00','そして、記録の時間','連携や活動の記録を、紙やメモに書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「広がるつながり」',lead:'地域とのつながりは、いざという時の支えになります。<br>そして、紹介や信頼の輪を広げてくれます。<br>いま、施設と地域の連携は、まさに広がっているところです。<br>その流れを、数字で見てみましょう。',
      pct:67.9,label:'特養の協力医療機関の確保',note:'協力医療機関を定めた特別養護老人ホームが増えています。',
      items:[
        {head:'特養の協力医療機関',pct:67.9,label:'',note:'協力医療機関を定めた特別養護老人ホームは <b style="color:var(--inuInk)">67.9%</b>。前年から大きく増えました。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'老健の協力医療機関',pct:83.3,label:'',note:'老人保健施設では <b style="color:var(--coralInk)">83.3%</b> が協力医療機関を確保。連携が当たり前になりつつあります。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：社会保障審議会 介護給付費分科会 資料（2025年）'},
    relLead:'同じ「つながり」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、地域や人との関係を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['iruka','似ている：どちらも「評判」と「つながり」で選ばれるタイプ。地域の信頼が紹介を呼ぶ点が共通していて相性がいいです。'], ['ookami','似ている：どちらも地域と支え合うタイプ。防災協定や協力先との関係は、地域と備え、両方に効きます。'], ['fukurou','補い合える：ミツバチ型が手薄になりがちな連携・活動の記録を、フクロウ型は仕組みにできます。互いに補い合えるので相性がいいです。'] ],
    growLead:'豊かなつながりはそのままに、<b style="color:var(--inuInk)">その活動の記録と発信</b>を整えられると、ミツバチ型は更に伸びます。',
    grow:{now:'連携や活動が記録に残らず、せっかくのつながりが信頼や集客に活きにくい。',
      next:'利用者の情報や活動の記録を一つにまとめれば、地域とのやり取りの土台ができます。つながりを見える形で伝えれば、紹介や見学、応募にもつながります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  beaver:{
    tldr:'専門職ぞろいの、実力派の職場。<br>確かな資格と技術があるから、難しいケースにも応えられるタイプです。',
    faceLead:'「職人ぞろいのビーバー型」は、こんな施設です。<br>専門職の確かな技術が、職場に根づいています。<br>介護福祉士やリハビリ職、管理栄養士などがそろい、難しいケースにも応えられるのではないでしょうか。<br>その専門性の高さが、加算の取得やご家族の信頼につながっています。',
    face:{ good:['有資格者が多い','専門ケアに対応','加算にも有利'],
      goodCards:[
        ['🎓','有資格者が多い','介護福祉士など専門職がそろい、確かなケアができます。'],
        ['🩺','専門ケアに対応','難しいケースにも、技術でしっかり応えられます。'],
        ['💠','加算にも有利','高い専門性が、加算の取得を後押しします。']
      ],
      style:['技術重視','プロ集団','頼れる'],
      weak:['専門性の発信','技術の属人化'] },
    scenesLead:'難しいケースにも、「うちなら任せてもらえる」と自信を持って応えられる。<br>職種の違う専門職が、それぞれの視点を持ち寄る。<br>「さすが」とご家族に言われる場面がある。<br>職人ぞろいのビーバー型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🩺','難しいケースに応える','確かな技術で、他では難しいケアにも対応できます。'],
      ['🤝','職種を超えて連携','介護・看護・リハなどが力を合わせ、多角的に利用者を支えます。'],
      ['📎','でも、その専門性は伝わりにくい','高い技術が外に伝わらず、採用や集客に活きにくい。ここが次の一歩です。']
    ],
    dayLead:'典型的なビーバー型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','専門職でカンファ','介護・看護・リハが集まり、ケアの方針をすり合わせます。'],
      ['11:00','技術を活かしたケア','一人ひとりの状態に合わせ、専門的なケアを提供します。'],
      ['15:00','後輩に技術を伝える','ベテランが持つコツを、次の世代にそっと受け渡します。'],
      ['18:00','そして、記録の時間','職種をまたいだ記録を、紙やバラバラの書式に書き写す作業がここで発生しがち。ここが次の一歩です。']
    ],
    data:{title:'専門性が、選ばれる力になる',lead:'確かな資格と技術は、ご家族が施設を選ぶ大きな決め手です。<br>そして、加算という形で経営も支えます。<br>専門職がそろっていることは、それだけで強みではないでしょうか。<br>その価値を、数字でたしかめてみましょう。',
      pct:58.2,label:'介護福祉士の割合',note:'介護の仕事をしている人のうち、<b style="color:var(--inuInk)">介護福祉士の資格を持つ人は58.2%</b>（10人に約6人）。10年前の約2倍に増えています。有資格者がそろう施設は、加算や家族の信頼につながります。ビーバー型は、その専門性が強みです。',
      src:'出典：介護労働安定センター 令和2年度 介護労働実態調査'},
    relLead:'同じ「ケアの質」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、人の力・専門性を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['penguin','似ている：どちらも人の力を高めるタイプ。専門性を磨くビーバー型と、育てるペンギン型。めざす方向が近く相性がいいです。'], ['risu','似ている：どちらも専門職が質の高いケアを支えるタイプ。技術と栄養、大切にするものが似ています。'], ['kitsune','補い合える：ビーバー型の高い専門性を、キツネ型は加算や採用に結びつけるのが得意です。互いに補い合えるので相性がいいです。'] ],
    growLead:'確かな専門性はそのままに、<b style="color:var(--inuInk)">その発信と技術の共有</b>を整えられると、ビーバー型は更に伸びます。',
    grow:{now:'高い技術がベテラン個人に偏りがちで、専門性が外にも伝わりきっていない。',
      next:'資格・研修の状況や職種をまたいだ記録を一つにまとめれば、技術が共有され、加算や採用にも活かせます。「ここなら任せられる」を、見える形にできます。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  kitsune:{
    tldr:'数字とお金に強い、やりくり上手な職場。<br>使える制度を逃さず堅実に黒字を積むから、長く続く土台があるタイプです。',
    faceLead:'「やりくり上手のキツネ型」は、こんな施設です。<br>数字とお金の流れを見る力が、職場に根づいています。<br>使える補助金や制度を取りこぼさず、堅実に黒字を積み上げているのではないでしょうか。<br>その確かな経営が、長く続く施設の土台を固めています。',
    face:{ good:['制度・補助金に強い','堅実な黒字','的確な投資判断'],
      goodCards:[
        ['💡','制度・補助金に強い','使える制度を逃さず、収益に変えられます。'],
        ['📈','堅実な黒字','数字に強く、安定した経営ができています。'],
        ['🎯','的確な投資判断','お金の使いどころを、しっかり見極められます。']
      ],
      style:['堅実','数字に強い','計画的'],
      weak:['現場への還元','経営の見せ方・発信'] },
    scenesLead:'「この加算は取れているか」を、いつも気にかけている。<br>お金の流れが見えているから、迷わず判断できる。<br>無駄な支出には、すっと気づける。<br>やりくり上手のキツネ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['💡','取りこぼしが少ない','使える加算や補助金を押さえ、収益にきちんと変えています。'],
      ['📈','経営が安定している','数字が見えているから、先を見すえた判断ができます。'],
      ['🤲','でも、現場への還元は意識して','数字を追うほど、人やデジタルへの投資が後回しにならないよう気を配りたいところ。ここが次の一歩です。']
    ],
    dayLead:'典型的なキツネ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','数字をチェック','稼働や収支の数字に目を通し、その日の判断材料にします。'],
      ['11:00','制度・加算を確認','取りこぼしがないか、使える制度がないかを見直します。'],
      ['15:00','投資の相談','「どこにお金を使うか」を、根拠を持って話し合います。'],
      ['18:00','そして、現場の声も','数字だけでなく、職員の負担や現場の様子にも目を向けたいところ。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「取りこぼしの正体」',lead:'使えるはずの加算や補助金を、知らずに逃していないか。<br>それは、経営に強いキツネ型がいちばん気にかけるところではないでしょうか。<br>取りこぼしの背景には、共通の理由があります。<br>その正体を、数字で見てみましょう。',
      pct:85.8,label:'加算をとれない理由',note:'加算を取れていない事業所の <b style="color:var(--inuInk)">85.8%</b> が、その理由に「計画書などの事務が煩雑」を挙げています。事務を軽くすれば、取りこぼしを防げます。',
      src:'出典：厚生労働省 令和6年度 調査'},
    relLead:'同じ「数字」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、経営や効率を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['fukurou','似ている：どちらも「数字」で運営を見るタイプ。経営と効率、見ている方向が近く相性がいいです。'], ['usagi','似ている：どちらも事業を伸ばすことに前向きなタイプ。堅実な経営と挑戦の勢い、めざす先が近いです。'], ['inu','補い合える：キツネ型が後回しにしがちな人への投資を、イヌ型は得意にしています。経営と人情、互いに補い合えるので相性がいいです。'] ],
    growLead:'確かな経営はそのままに、<b style="color:var(--inuInk)">生み出した利益の使い道</b>を現場に向けられると、キツネ型は更に伸びます。',
    grow:{now:'数字に強いぶん、人材定着やデジタル化が後回しになり、現場の疲れが経営に跳ね返ることも。',
      next:'生み出した利益を職員の待遇や記録のデジタル化に回せば、強い経営とよい現場が支え合って回りだします。記録が数字としてまとまれば、判断の材料も更にそろいます。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  usagi:{
    tldr:'勢いよく伸びていく、挑戦する職場。<br>変化を恐れず前に進むから、これからの展開が一番楽しみなタイプです。',
    faceLead:'「勢いのウサギ型」は、こんな施設です。<br>新しいことに挑戦する前向きさが、職場に根づいています。<br>事業所も売上も右肩上がりで、地域のニーズを次々と形にしているのではないでしょうか。<br>その勢いそのものが、職員や利用者さんを惹きつける魅力になっています。',
    face:{ good:['速い行動力','拡大の勢い','変化を恐れない'],
      goodCards:[
        ['🚀','速い行動力','思い立ったら、すぐに形にできます。'],
        ['📈','拡大の勢い','事業所も売上も、右肩上がりで伸びています。'],
        ['✨','変化を恐れない','新しいことに前向きで、地域のニーズを素早く形にします。']
      ],
      style:['チャレンジ好き','スピード感','前向き'],
      weak:['仕組みの整備','人材の定着・育成'] },
    scenesLead:'「これ、やってみよう」から形になるまでが、とにかく早い。<br>新しいサービスに、職員もわくわくしている。<br>地域から「あの施設、伸びてるね」と声がかかる。<br>勢いのウサギ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🚀','挑戦がすぐ形になる','アイデアから実行までが早く、地域のニーズに素早く応えられます。'],
      ['✨','活気があふれる','伸びている実感が、職員のやる気と施設の魅力になっています。'],
      ['📎','でも、仕組みが追いつかない','拡大に運用や記録の整備が追いつかず、質のばらつきが出がち。ここが次の一歩です。']
    ],
    dayLead:'典型的なウサギ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','新しい取り組みを相談','「次はこれをやろう」と、前向きな話が朝から飛び交います。'],
      ['11:00','スピードで動く','決めたことをすぐ実行に移し、地域のニーズに素早く応えます。'],
      ['15:00','拡大の準備','新しい利用者や事業に向けて、受け入れの準備を進めます。'],
      ['18:00','そして、追いつかない記録','拡大に運用が追いつかず、記録や引き継ぎが後回しになりがち。ここが次の一歩です。']
    ],
    data:{title:'伸びている今こそ、足元を固める',lead:'勢いがあるのは、大きな強みです。<br>でも、拡大のスピードに仕組みが追いつかないと、質のばらつきや離職という形でツケが回ってきます。<br>人が辞める理由を知ることは、成長を続ける土台になります。<br>その手がかりを、数字で見てみましょう。',
      pct:34.3,label:'介護職が辞める一番の理由',note:'介護の仕事を辞めた理由で最も多いのが「職場の人間関係」（<b style="color:var(--inuInk)">34.3%</b>）。伸びている今こそ、人が長く働ける足元を固めるチャンスです。',
      items:[
        {head:'辞める一番の理由',pct:34.3,label:'',note:'介護の仕事を辞めた理由で最も多いのが「職場の人間関係」（<b style="color:var(--inuInk)">34.3%</b>）。急成長ほど、ここが手薄になりがちです。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'人間関係の改善で離職が減る',pct:63.6,label:'',note:'離職率が下がった事業所の <b style="color:var(--coralInk)">63.6%</b> が、その理由に「職場の人間関係の改善」を挙げています。土台が固まれば、成長は加速します。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：介護労働安定センター 令和5年度 介護労働実態調査'},
    relLead:'同じ「前に進む力」を持つ仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、成長や挑戦を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['iruka','似ている：どちらも勢いのあるタイプ。伸びるウサギ型と、選ばれ続けるコアラ型。前に進む力が共通していて相性がいいです。'], ['kitsune','似ている：どちらも事業を伸ばすことに前向きなタイプ。挑戦の勢いと堅実な経営、めざす先が近いです。'], ['penguin','補い合える：ウサギ型が後回しにしがちな人材の育成・定着を、ペンギン型は得意にしています。互いに補い合えるので相性がいいです。'] ],
    growLead:'伸びる勢いはそのままに、<b style="color:var(--inuInk)">足元の仕組み</b>を整えられると、ウサギ型は更に伸びます。',
    grow:{now:'拡大に人材の定着や記録・教育の標準化が追いつかず、質のばらつきが出がち。',
      next:'記録や引き継ぎを一つにまとめて仕組みを整えれば、拠点が増えても質を保てます。土台が固まれば、成長は更に加速します。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  iruka:{
    tldr:'地域から選ばれ続ける、人気者の職場。<br>紹介や口コミが途切れないから、空き待ちが出るほど信頼を集めるタイプです。',
    faceLead:'「人気者のコアラ型」は、こんな施設です。<br>地域から選ばれ続ける信頼が、職場に根づいています。<br>紹介や口コミで問い合わせが途切れず、空き待ちが出るほどなのではないでしょうか。<br>「あの施設なら安心」という評判そのものが、何よりの強みになっています。',
    face:{ good:['高い稼働率','強い紹介・口コミ','地域での評判'],
      goodCards:[
        ['🏠','高い稼働率','いつも満室に近く、稼働が安定しています。'],
        ['💬','強い紹介・口コミ','紹介だけで枠が埋まるほどの信頼があります。'],
        ['⭐','地域での評判','「あの施設なら安心」と、地域から選ばれています。']
      ],
      style:['信頼が厚い','人気者','安定志向'],
      weak:['人気の理由の言語化','次の成長への一歩'] },
    scenesLead:'「知り合いに勧められて」と、問い合わせが自然に入ってくる。<br>広告を打たなくても、空きが出るとすぐ埋まる。<br>「ここに入れてよかった」の声が、次の利用者を呼ぶ。<br>人気者のコアラ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['💬','紹介が途切れない','利用者やご家族の満足が、次の紹介を呼ぶ好循環ができています。'],
      ['🏠','いつも満室に近い','安定した稼働が、経営の見通しを立てやすくしています。'],
      ['📎','でも、人気の理由は言葉になっていない','選ばれる理由がデータになっておらず、次の成長に活かしにくい。ここが次の一歩です。']
    ],
    dayLead:'典型的なコアラ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','問い合わせに対応','紹介や口コミからの連絡に、丁寧に応えます。'],
      ['11:00','満室に近い日常','安定した稼働のなか、落ち着いてケアに向き合えます。'],
      ['15:00','見学の受け入れ','「話を聞いていたとおり」と、来訪者に安心してもらえます。'],
      ['18:00','でも、選ばれる理由は？','人気の理由が言葉やデータになっておらず、次に活かしにくい。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「選ばれる力」',lead:'選ばれ続けることは、大きな強みです。<br>そして、稼働の高さは経営の安定に直結します。<br>人気を"次の成長"につなげるには、選ばれる理由を知ることが第一歩。<br>その手がかりを、数字で見てみましょう。',
      noChart:true,
      note:'経営が安定している通所介護の施設は、定員の <b style="color:var(--inuInk)">2.5倍以上</b> の登録者を確保しているという分析があります。安定した稼働は、選ばれ続ける力の証しです。人気を"見える形"にできれば、その力は更に確かなものになります。',
      src:'出典：福祉医療機構（WAM）経営分析'},
    relLead:'同じ「選ばれる力」を持つ仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、評判や勢いを大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['usagi','似ている：どちらも勢いのあるタイプ。選ばれ続けるコアラ型と、伸びるウサギ型。前に進む力が共通していて相性がいいです。'], ['hachi','似ている：どちらも「評判」と「つながり」で選ばれるタイプ。地域の信頼が紹介を呼ぶ点が共通していて相性がいいです。'], ['fukurou','補い合える：コアラ型が言葉にできていない"選ばれる理由"を、フクロウ型はデータで見える化できます。互いに補い合えるので相性がいいです。'] ],
    growLead:'高い人気はそのままに、<b style="color:var(--inuInk)">選ばれる理由の言語化</b>を進められると、コアラ型は更に伸びます。',
    grow:{now:'常に満員ということは、応えきれていない需要があるということ。人気を成長に変えきれていない。',
      next:'選ばれる理由を記録やデータで言葉にすれば、再現性のある集客の仕組みになります。空きや利用状況を一つの画面で見られれば、受け入れの調整もしやすくなります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  },
  zou:{
    tldr:'職員にやさしい、働きやすい職場。<br>残業が少なく休みも取りやすいから、人が集まり、長く続くタイプです。',
    faceLead:'「働きやすいゾウ型」は、こんな施設です。<br>職員を大切にする気持ちが、職場に根づいています。<br>残業が少なく、休日や有給も取りやすく、育休など制度も整っているのではないでしょうか。<br>その働きやすさが、人の定着と採用の大きな武器になっています。',
    face:{ good:['残業が少ない','休みやすい','制度が整う'],
      goodCards:[
        ['🌙','残業が少ない','働きやすい職場づくりが得意で、負担を抑えられています。'],
        ['🏖️','休みやすい','休日や有給が取りやすい環境が整っています。'],
        ['🍼','制度が整う','育休や柔軟な勤務形態で、多様な働き方を支えます。']
      ],
      style:['職員思い','ワークライフ重視','柔軟'],
      weak:['働きやすさの発信','シフト管理の負担'] },
    scenesLead:'「今日はもう上がって大丈夫だよ」と、自然に言い合える。<br>子どもの行事にも、気兼ねなく休みを取れる。<br>無理なく働けるから、笑顔で利用者さんに向き合える。<br>働きやすいゾウ型の施設なら、そんな場面に心当たりがあるのではないでしょうか。',
    scenes:[
      ['🌙','定時で帰れる','残業が少なく、プライベートの時間も大切にできます。'],
      ['🍼','ライフイベントに寄り添う','育児や介護と両立しながら、長く働き続けられます。'],
      ['📎','でも、シフト調整は手作業のまま','急な欠員のたびに、勤務調整が手間になりがち。ここが次の一歩です。']
    ],
    dayLead:'典型的なゾウ型の施設で見られる、1日の流れのイメージです。',
    day:[
      ['9:00','無理のないシフト','余裕を持った人員配置で、一人に負担が偏りません。'],
      ['12:00','休憩はしっかり','交代でちゃんと休み、午後もいい状態で働けます。'],
      ['17:30','定時で引き継ぎ','残業に頼らず、その日の仕事をきちんと締めくくれます。'],
      ['随時','でも、シフトの調整は手作業','急な欠員が出るたび、勤務表の調整に追われがち。ここが次の一歩です。']
    ],
    data:{title:'数字で見る「人が集まる働きやすさ」',lead:'働きやすい職場には、自然と人が集まり、長く残ります。<br>それは、職員を大切にするゾウ型の何よりの強みではないでしょうか。<br>定着が進む施設は、何に取り組んでいるのか。<br>その共通点を、数字で見てみましょう。',
      pct:52.5,label:'勤務・休日を柔軟に',note:'定着に取り組む事業所の多くが、勤務時間・休日の柔軟化に取り組んでいます。',
      items:[
        {head:'勤務・休日を柔軟に',pct:52.5,label:'',note:'定着に取り組む事業所の <b style="color:var(--inuInk)">52.5%</b> が「勤務時間・休日を本人の希望で柔軟に」しています。',accent:'var(--inu)',accentSoft:'var(--inuSoft)'},
        {head:'残業削減・有給取得の促進',pct:44.8,label:'',note:'<b style="color:var(--coralInk)">44.8%</b> が「残業削減・有給取得の促進」に取り組んでいます。働きやすさは、続けられる仕組みで作れます。',accent:'var(--coralInk)',accentSoft:'var(--coralSoft)'}
      ],
      src:'出典：介護労働安定センター 令和5年度 介護労働実態調査'},
    relLead:'同じ「人」を大切にする仲間や、互いに補い合えるタイプです。<br>相性には2つの形があります。<br>ひとつは、働く人を大切にする考え方が近い「似たタイプ」。<br>この後の3タイプを見てみましょう。',
    rel:[ ['inu','似ている：どちらも「働く人」を大切にするタイプ。働きやすさと定着、人を大事にする姿勢が共通していて相性がいいです。'], ['penguin','似ている：どちらも職員が安心して働ける場を大切にするタイプ。働きやすさと育成、めざす方向が近いです。'], ['fukurou','補い合える：ゾウ型が手作業になりがちなシフト・勤怠の管理を、フクロウ型は仕組みにできます。互いに補い合えるので相性がいいです。'] ],
    growLead:'働きやすさはそのままに、<b style="color:var(--inuInk)">その魅力の発信と勤務管理</b>を整えられると、ゾウ型は更に伸びます。',
    grow:{now:'急な欠員のたびにシフト調整が手作業になり、せっかくの働きやすさが採用に活かしきれていない。',
      next:'勤務シフトや休暇の管理をデジタルにまとめれば、忙しい時期でも働きやすさを保てます。その魅力を採用ページで伝えれば、応募が集まりやすくなります。'},
    cta:{h:'「うちは何型だろう？」を、今すぐ数字で。',p:'施設名を選ぶだけ。全国47都道府県の公開データから、あなたの施設の強みと"伸びしろ"を無料で診断します。'}
  }
};
i18nRegLateTrees();   // PROFILE_RICH / ANALYSIS の日本語原文を基底辞書に登録
// 文字焼き込みバナーの枠を実画像の縦横比に合わせる（上下の余白を防ぐ）
function fitBakedBanner(bandEl, url){ if(!bandEl) return; var im=new Image(); im.onload=function(){ if(im.naturalWidth&&im.naturalHeight){ bandEl.style.aspectRatio = im.naturalWidth+' / '+im.naturalHeight; } }; im.src=url; }
function shade(hex,p){var c=String(hex).replace('#','');if(c.length===3)c=c.replace(/(.)/g,'$1$1');var r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16),t=p<0?0:255,a=Math.abs(p)/100;return 'rgb('+Math.round((t-r)*a+r)+','+Math.round((t-g)*a+g)+','+Math.round((t-b)*a+b)+')';}
function bandGrad(c){return 'linear-gradient(135deg,'+shade(c,16)+' 0%,'+c+' 42%,'+shade(c,-30)+' 100%)';}
function heroArt(key){
  function star(x,y,s,o,i){var p=[[x,y-s],[x+s*0.32,y-s*0.32],[x+s,y],[x+s*0.32,y+s*0.32],[x,y+s],[x-s*0.32,y+s*0.32],[x-s,y],[x-s*0.32,y-s*0.32]].map(function(q){return Math.round(q[0])+','+Math.round(q[1]);}).join(' ');return '<polygon class="twk" points="'+p+'" fill="#fff" opacity="'+o+'" style="animation-delay:'+(i*0.32).toFixed(2)+'s"/>';}
  var d='';
  [[58,66,12,.92],[238,52,15,.88],[268,142,9,.8],[38,158,12,.85],[152,34,8,.78],[214,214,8,.7],[92,240,7,.6],[284,92,6,.7]].forEach(function(p,i){d+=star(p[0],p[1],p[2],p[3],i);});
  var deco='<svg class="scene-deco" viewBox="0 0 300 300">'+d+'</svg>';
  var fig=TYPE_IMG[key]?'<img class="scene-img" src="'+TYPE_IMG[key]+'" alt="">':animalSVG(key);
  return deco+'<div class="scene-fig">'+fig+'</div>';
}
// radarSVG / regionInsight / donutSVG / statTile はセクション①削除にともない撤去

const SW_CHECK = '<svg class="sw-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="none" stroke="#3B5BDB" stroke-width="2"/><path d="M7 12.4l3.3 3.3L17 9" fill="none" stroke="#3B5BDB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SW_WARN = '<svg class="sw-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="none" stroke="#C0813A" stroke-width="2"/><path d="M12 16.6V8M12 8l-3.4 3.4M12 8l3.4 3.4" fill="none" stroke="#C0813A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// 強み・伸びしろ用：12軸を見分けられる専用アイコン。
var SW_AXIS_ICON = {
  penguin:'<path d="M3 8.5 12 4l9 4.5L12 13 3 8.5Z"/><path d="M7 11v4.5c2.8 2 7.2 2 10 0V11M21 9v6"/>',
  fukurou:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 9h3v4H7zM14 7h3v6h-3z"/>',
  risu:'<path d="M4 11h16c0 5-3.6 8-8 8s-8-3-8-8Z"/><path d="M7 8c0-2 2-2 2-4M12 8c0-2 2-2 2-4M17 8c0-2 2-2 2-4M8 21h8"/>',
  kuma:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="m9 12 2 2 4-5"/>',
  ookami:'<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17.2v.1"/>',
  hachi:'<path d="M3 11 12 4l9 7M5 10v10h14V10"/><circle cx="9" cy="14" r="1.5"/><circle cx="15" cy="14" r="1.5"/><path d="M7 20v-1c0-2 1-3 2-3s2 1 2 3v1M13 20v-1c0-2 1-3 2-3s2 1 2 3v1"/>',
  inu:'<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7M15 14c3 0 5 2 5 5"/>',
  beaver:'<path d="m12 3 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2L7.8 16l.8-4.7L5.2 8l4.7-.7L12 3Z"/><path d="M8 20h8"/>',
  kitsune:'<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m3 7 6-4 6 4 6-5"/>',
  usagi:'<path d="M4 17 10 11l4 4 6-8"/><path d="M15 7h5v5M5 5v3M3.5 6.5h3"/>',
  iruka:'<path d="M3 19h18M5 19v-9h14v9M8 14h8M8 10h8"/><path d="M10 6c0-1.7 1-3 2-3s2 1.3 2 3"/>',
  zou:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M5 4l2 2M19 4l-2 2"/>'
};
function swAxisIcon(k){
  return '<svg class="sw-ic" viewBox="0 0 24 24" aria-hidden="true">'+(SW_AXIS_ICON[k]||SW_AXIS_ICON.kuma)+'</svg>';
}
const SW = {
  inu:{strong:[['定着するチーム','職員が長く働き、ベテランが育つ職場です。'],['手厚い有資格者','介護福祉士など有資格者が多く、ケアが安定します。'],['人を育てる文化','研修や声かけが根づき、新人も安心して伸びます。'],['家族からの信頼','職員の継続と笑顔が、ご家族の安心につながります。'],['低い離職率','人が辞めないこと自体が、強い競争力です。'],['温かい雰囲気','チームワークの良さが現場の空気に出ています。']],
    weak:[['アナログ業務が残る','人の力で回るぶん、記録が紙のままになりがち。'],['属人化しやすい','仕事のコツや知識がベテラン個人に溜まりがちです。'],['集客が控えめ','中身は良いのに、外への発信が弱めです。'],['変化に慎重','居心地の良さゆえ、新しい仕組みが後回しに。'],['数字での説明が弱い','良さが感覚的で、データで語りきれていないかもしれません。'],['負担が見えにくい','頑張りでカバーし、残業が表面化しにくい。']]},
  fukurou:{strong:[['高い業務効率','無駄のない運営で、少ない人手でも質を保てます。'],['少ない残業','仕組み化で現場の負担を抑えられています。'],['スムーズな情報共有','記録や連絡がデジタルで、ミスが減ります。'],['速い技術適応','新しいツールやセンサーを使いこなせます。'],['たまるデータ','改善のサイクルを速く回せる土台があります。'],['標準化された業務','誰がやっても一定の質を出せます。']],
    weak:[['人の温度が薄れがち','効率を追うあまり、対面の手厚さが後回しに。'],['システム依存','仕組みが止まると現場が混乱しやすい。'],['集客・採用は手薄','効率は高いが、外向きの発信が弱め。'],['初期投資の負担','導入コストや習熟に時間がかかります。'],['現場の温度差','ツールに不慣れな職員との差が出がち。'],['データ活用が道半ば','蓄積はあるが、ケアの質向上に活かしきれていない。']]},
  kitsune:{strong:[['制度・補助金に強い','使える制度を逃さず、収益に変えられます。'],['堅実な黒字','数字に強く、安定した経営ができています。'],['多角化でリスク分散','複数事業で、経営の波に強い体質です。'],['的確な投資判断','お金の使いどころを見極められます。'],['無駄のないコスト','支出管理が行き届いています。'],['制度改正に強い','変化を読んで、先に手を打てます。']],
    weak:[['人・DXが後回しに','数字優先で、現場への投資が薄くなりがち。'],['現場が疲れがち','効率重視が、職員の負担に跳ね返ることも。'],['成長は慎重','堅実ゆえ、攻めの拡大に踏み切りにくい。'],['ブランド・発信が薄い','経営は強いが、外への見せ方が弱め。'],['利益の再投資不足','稼いだ分を職員や設備に回しきれていない。'],['数字に表れない価値','雰囲気や満足度の把握が後回しに。']]},
  usagi:{strong:[['速い行動力','思い立ったら、すぐ形にできます。'],['拡大の勢い','事業所も売上も、右肩上がりです。'],['新サービスを次々','地域のニーズを素早く形にします。'],['変化を恐れない','挑戦的で、新しいことに前向きです。'],['人を惹きつける勢い','その活気が、職員・利用者を引き寄せます。'],['大きな伸びしろ','これからの展開が、一番楽しみなタイプ。']],
    weak:[['仕組みが追いつかない','拡大に、運用の整備が遅れがち。'],['人材定着が課題','急成長で、採用・育成が後回しに。'],['質のばらつき','標準化が追いつかず、拠点差が出やすい。'],['手を広げすぎ','あれもこれもで、現場が消耗することも。'],['足元が手薄','記録や教育の土台づくりが後回しに。'],['数字管理が甘くなりがち','勢い任せで、収益の精査が後回しに。']]},
  iruka:{strong:[['高い稼働率','いつも満室に近く、安定しています。'],['強い紹介・口コミ','紹介だけで枠が埋まるほどの信頼。'],['地域での評判','「あの施設なら安心」と選ばれています。'],['選ばれる理由が明確','強みが、ちゃんと伝わっています。'],['待機が出る人気','需要が供給を上回る人気ぶり。'],['利用者が利用者を呼ぶ','好循環ができています。']],
    weak:[['応えきれない需要','満員ゆえ、取りこぼしが生まれています。'],['評判頼み','仕組みより評判に支えられている面が。'],['拡大に踏み出しにくい','人気を、成長に変えられていない。'],['理由が言語化されていない','選ばれる理由が、データ化されていない。'],['現状維持に傾きがち','満員ゆえ、改善の動機が弱まりがち。'],['再現性が弱い','偶然の人気で、仕組みになっていないことも。']]},
  penguin:{strong:[['人が育つ仕組み','研修やOJTで新人が早く一人前になります。'],['専門研修が充実','認知症ケアなど専門的な学びが積み上がります。'],['学び合う文化','職員同士で教え合う風土があります。']],
    weak:[['育てた人の定着','育成が、定着とセットになりきれていないことも。'],['記録が手作業','研修履歴の管理がアナログになりがち。'],['発信が弱め','育成力が、採用の魅力として伝わりきっていない。']]},
  beaver:{strong:[['有資格者が多い','専門職がそろい、確かなケアができます。'],['専門ケアに対応','難しいケースにも技術で応えられます。'],['加算にも有利','専門性が、加算の取得を後押しします。']],
    weak:[['発信が控えめ','高い専門性が、外に伝わりきっていない。'],['属人化しやすい','技術がベテラン個人に偏りがち。'],['育成との両立','次の世代を育てる仕組みが課題のことも。']]},
  risu:{strong:[['栄養ケアの体制','一人ひとりに合わせた栄養の見直しが行き届いています。'],['管理栄養士が活躍','食と健康を専門的に支えます。'],['食事の満足度','「食べる楽しみ」で選ばれます。']],
    weak:[['発信が弱め','食の強みが、集客に活かしきれていない。'],['他の力が手薄','食に注力するぶん、他が後回しのことも。'],['記録の負担','栄養・口腔の記録が手作業になりがち。']]},
  hachi:{strong:[['地域連携が活発','包括や他機関とよくつながっています。'],['ボランティア・実習を受け入れ','地域に開かれた運営です。'],['防災・行事で地域と協力','まちぐるみの支え合いがあります。']],
    weak:[['発信が活かせていない','地域連携が信頼や集客に結びついていない。'],['記録が手薄','連携・活動の記録がアナログになりがち。'],['特定の人頼み','地域との窓口が一部職員に集中しがち。']]},
  kuma:{strong:[['事故予防の仕組み','ヒヤリハットの共有が習慣です。'],['緊急時対応が万全','もしもの備えが整っています。'],['処分歴なし','安全運営の実績があります。']],
    weak:[['発信が控えめ','安全への努力が家族に伝わりきっていない。'],['記録の負担','事故・予防の記録が手作業になりがち。'],['攻めは慎重','安全重視ゆえ、新しい挑戦が後回しに。']]},
  ookami:{strong:[['感染対策が万全','感染症・食中毒に強い体制です。'],['BCPがある','災害時の事業継続計画が整っています。'],['訓練・備蓄が充実','いざという時に動けます。']],
    weak:[['平時に見えにくい','備えの価値が普段は伝わりにくい。'],['記録の手間','計画・訓練の記録管理が負担になりがち。'],['他の力との両立','危機管理に注力するぶん他が手薄のことも。']]},
  zou:{strong:[['残業が少ない','働きやすい職場づくりが得意です。'],['休みやすい','休日・有給が取りやすい環境です。'],['制度が整う','育休や柔軟な勤務形態があります。']],
    weak:[['発信が弱め','働きやすさが、採用に活かしきれていない。'],['シフト管理の負担','勤務調整が手作業になりがち。'],['他の力が見えにくい','働きやすさ以外の強みの発信が課題。']]},
};
const AXFIX = {
  inu:{why:'人の入れ替わりが続くと、せっかくのコツや知識が根づかず、ケアの質にもばらつきが出てきます。', step:'研修や、長く働き続けられる道すじを一つ整える', benefit:'職員が長く育ち、現場が安定します', evidence:'離職率が下がった事業所の63.6%が、その理由に「職場の人間関係の改善」を挙げています（介護労働安定センター 令和5年度調査）。'},
  fukurou:{why:'記録や情報共有が手作業のままだと、残業や転記ミスが減らせず、現場に余力が生まれません。', step:'介護記録のデジタル化から始める', benefit:'記録・共有の手間が減り、残業を圧縮できます', evidence:'見守りセンサーを全床に導入した施設で、夜勤の直接介護・見回り・移動の時間が約24%（職員1人あたり1日26.5分）減った実証結果があります（厚生労働省 実証事業 2021年）。'},
  kitsune:{why:'使える制度や補助金を取りこぼすと、本来増やせるはずの利益が手元に残りません。', step:'使える補助金・加算の取りこぼしを見直す', benefit:'利益が増え、投資にまわす余力が生まれます', evidence:'加算を取れていない事業所の85.8%が、理由に「計画書などの事務が煩雑」を挙げています（厚生労働省 令和6年度調査）。事務を軽くすれば取りこぼしを防げます。'},
  usagi:{why:'規模や挑戦が横ばいのままだと、地域での存在感が少しずつ薄れていきます。', step:'新サービスや定員拡大を一つ計画する', benefit:'事業の伸びを取り戻せます'},
  iruka:{why:'定員に空きがあるのに施設のことが知られていないと、選ばれる力があっても利用者が集まりません。', step:'見学導線とホームページ・SNS発信を整える', benefit:'問い合わせが増え、定員の空きが埋まります', evidence:'通所介護の黒字施設は、定員の2.5倍以上の登録者を確保しているという分析があります（福祉医療機構WAM 経営分析）。'},
  penguin:{why:'育成が場当たり的だと、新人が一人前になるまでに時間がかかり、ケアの質にもばらつきが出ます。', step:'研修計画と育成の記録を整える', benefit:'人が早く育ち、ケアの質が安定します'},
  beaver:{why:'有資格者の配置や専門性が見えていないと、対応できるケアの幅や加算の取得で損をします。', step:'資格・研修の保有状況をまとめて管理する', benefit:'専門性を加算と採用に活かせます'},
  risu:{why:'栄養・お口のケアの体制が弱いと、利用者の健康維持と満足度、加算の取得機会を逃します。', step:'栄養・お口のケアの記録と体制を整える', benefit:'食の満足度と加算の両立ができます'},
  hachi:{why:'地域とのつながりが弱いと、いざという時の支え合いや紹介・信頼の輪が広がりにくくなります。', step:'ボランティア受け入れ・地域連携・防災協定などを増やす', benefit:'地域からの信頼が高まり、紹介や協力が広がります', evidence:'協力医療機関を定めた施設が、特養67.9%・老健83.3%と前年から11〜14ポイント増えています（社会保障審議会 2025年）。連携は今まさに広がっています。'},
  kuma:{why:'事故予防や緊急時の備えが弱いと、重大な事故や信頼の低下につながるおそれがあります。', step:'ヒヤリハット共有と事故予防の仕組みを整える', benefit:'事故を防ぎ、家族の安心が高まります'},
  ookami:{why:'感染症や災害への備えが不十分だと、いざという時に事業の継続が難しくなります。', step:'BCP・感染対策・備蓄と訓練を整える', benefit:'危機にも強い、安心な施設になります'},
  zou:{why:'残業が多く休みづらいと、職員の負担が積み重なり、離職や採用難につながります。', step:'勤務シフトと休暇の管理をデジタル化する', benefit:'残業が減り、働きやすさで人が集まります', evidence:'定着に取り組む事業所の52.5%が「勤務時間・休日を本人の希望で柔軟に」、44.8%が「残業削減・有給取得の促進」を実施しています（介護労働安定センター 令和5年度調査）。'},
};
// その軸が「低い」ときに起きがちな困りごと。誰が読んでも分かるやさしい言葉で（軸ごと・低いとき用）。
const AXWEAK = {
  inu:[['職員が辞めやすい','人がよく入れ替わり、募集や教え直しに追われがちです。'],['引き継ぎが弱い','ベテランが抜けると、ケアのやり方や気配りが伝わりにくくなります。']],
  penguin:[['新人が育ちにくい','一人前になるまで時間がかかりやすいです。'],['教え方がバラバラ','人によって教える内容が違い、ケアの質に差が出やすいです。']],
  fukurou:[['記録が手書き中心','書く・探すのに手間がかかり、残業につながりやすいです。'],['情報が共有されにくい','申し送りのモレや、同じ作業のやり直しが起きやすいです。']],
  kitsune:[['加算・補助金の取りこぼし','受け取れるはずのお金を、知らずに逃していることがあります。'],['お金の流れが見えにくい','赤字や無駄に気づくのが遅れやすいです。']],
  usagi:[['事業の規模が数年間、横ばい','利用者数も新しい取り組みも増えず、活気が出にくいです。'],['新しい取り組みが少ない','周りの施設との違いを出しにくくなります。']],
  iruka:[['定員に空きが残りやすい','利用者が定員まで集まらず、ベッドや利用枠が埋まらないため、収入の取りこぼしになりがちです。'],['新しい利用者の申し込みが少ない','問い合わせや紹介が入りにくく、空いた枠がなかなか埋まりません。']],
  beaver:[['有資格者が少ない','対応できるケアの幅が狭くなりがちです。'],['専門職の加算を取りにくい','収入の面でも損をしやすいです。']],
  risu:[['食事・お口のケアの体制が弱い','利用者の健康管理が手薄になりやすいです。'],['栄養の加算を取りこぼし','食の満足度も外に伝わりにくいです。']],
  hachi:[['地域とのつながりが薄い','ボランティアや他機関との協力が少なく、孤立しがちです。'],['助け合いの輪が狭い','いざという時に頼れる相手や、紹介の輪が広がりにくいです。']],
  kuma:[['事故を防ぐ仕組みが弱い','ヒヤリハットが共有されず、同じミスが起きやすいです。'],['緊急時の対応が未整備','いざという時に、誰がどう動くか迷いやすいです。']],
  ookami:[['災害・感染症への備えが不足','計画・訓練・備蓄を、これから整えていく余地がありそうです。'],['緊急時に介護サービスを続けられるか不安','災害や感染症が起きても、サービスを止めずに続けられるか心配が残ります。']],
  zou:[['残業が多い・休みにくい','職員の負担が積み重なりやすいです。'],['一部の職員に仕事が集中しやすい','特定の人に負担がかたより、働きにくさが離職や採用難につながりやすいです。']],
};
// 強みの含意（断定せず「と考えられる」トーン）
const MEAN_HIGH = [
  '長く働く職員に仕事のコツや知識が積み重なり、ケアの質と安心感が積み上がっていると考えられます',
  '人が育つ仕組みが回り、サービスの質を保ちやすくなっていると考えられます',
  'チームの連携が良く、申し送りやケアの抜け漏れが起きにくくなっていると考えられます',
  '記録の手間が減って情報共有が速く、転記ミスや残業を抑えられていると考えられます',
  '記録から請求・労務まで一つにつながり、二重入力や事務の手間を抑えられていると考えられます',
  'その場で情報が共有され、申し送りのズレや連絡漏れが起きにくくなっていると考えられます',
  '収支が安定し、設備や人への投資をしやすくなっていると考えられます',
  '取れる加算を押さえ、収益とケアの質を両立できていると考えられます',
  '数字に基づいて経営判断ができ、先を見すえた打ち手を取りやすくなっていると考えられます',
  '事業を伸ばす勢いがあり、新しい挑戦に踏み出しやすい状態だと考えられます',
  '変化に前向きで、時代に合わせて施設を更新できていると考えられます',
  '中長期の見通しを持ち、計画的に事業を伸ばしていける状態だと考えられます',
  '選ばれ続けて稼働が安定し、経営の見通しを立てやすくなっていると考えられます',
  '信頼が厚く、広告に頼らずとも人が集まる強さがあると考えられます',
  '紹介ルートが安定し、新規の利用につながりやすい状態だと考えられます'
];
// 原因の深掘り（断定せず「可能性がある」トーン）
const CAUSE_DEEP = {
  '連携不足で業務が属人化している':'担当者しか分からない仕事が増え、申し送りやケアの引き継ぎにムラが出やすくなっているかもしれません。',
  '数字に基づく経営ができていない':'感覚での判断になりがちで、打ち手の良し悪しを振り返りにくくなっている可能性があります。',
  '中長期の計画がない':'目先の対応に追われ、人や設備への投資を計画的に進めにくくなっているかもしれません。',
  '紹介ルートが弱い':'ケアマネや医療機関とのつながりが細く、新規の利用が安定しにくくなっている可能性があります。',
  '事務作業が手作業中心':'記録から請求・労務への転記が二重になり、事務の手間や入力ミスが生じやすくなっているかもしれません。',
  '加算の取りこぼしがある':'要件を満たせているのに算定しきれず、本来得られるはずの収益を逃している可能性があります。',
  '現状維持の傾向が強い':'新しい取り組みに踏み出す機会が少なく、環境の変化への対応が後手になりやすいかもしれません。',
  '職員の入れ替わりが多い':'採用や引き継ぎに手間がかかり、ケアの質やチームの連携が安定しにくくなっている可能性があります。',
  '有資格者の比率が低い':'専門的なケアや一部の加算の取得で、あと一歩ふみ込みきれていないことがあるかもしれません。',
  '研修・育成の仕組みが弱い':'教え方が人によって変わり、新人が一人前になるまでに時間がかかっているおそれがあります。',
  '介護記録が紙のまま':'転記や記録を探す手間が積み重なり、残業や記入漏れにつながっているかもしれません。',
  '見守りセンサー・ICT機器が未導入':'夜間の巡視などの負担が大きく、見守りの抜け漏れのリスクが残っている可能性があります。',
  '情報共有が口頭・紙ベース':'申し送りに時間がかかり、職員のあいだで情報のズレが起きやすくなっているかもしれません。',
  '使える補助金を活かしきれていない':'本来受け取れたはずの加算や補助金を、知らないうちに取りこぼしている可能性があります。',
  '収支が安定していない':'月ごとの変動が読みにくく、先を見すえた投資の判断がしづらくなっているかもしれません。',
  '収益源が一つに偏っている':'一つのサービスの稼働状況に、施設全体の業績が左右されやすい状態かもしれません。',
  '事業規模が数年横ばい':'次の成長に向けた仕掛けづくりが、後回しになっている可能性があります。',
  '新しい取り組みが少ない':'周辺の施設との違いが出しにくく、選ばれる理由が伝わりづらくなっているかもしれません。',
  '売上が伸び悩んでいる':'空き具合や利用料金のどこかに、まだ伸ばせる余地が眠っているかもしれません。',
  '稼働率に空きがある':'空きがあるぶん、入るはずだった収入を逃しているかもしれません。',
  '問い合わせ・待機が少ない':'地域での認知や紹介の入り口が、まだ十分に広がっていない可能性があります。',
  '紹介・口コミでの集客が弱い':'利用者やご家族の満足が外に伝わる仕組みが、弱いままになっているかもしれません。',
};
// 課題（のびしろ）の説明文を、断定から「問いかけ・可能性」のトーンにやわらげる。
function softenWeak(t){
  if(!t) return t;
  var rules=[
    ['がちです。','がちかもしれません。'],
    ['がち。','がちかもしれません。'],
    ['ことも。','こともあるかもしれません。'],
    ['面が。','面があるかもしれません。'],
    ['後回しに。','後回しになっていませんか？'],
    ['ています。','ていませんか？'],
    ['ていない。','ていないかもしれません。'],
    ['やすい。','やすいかもしれません。'],
    ['にくい。','にくいかもしれません。'],
    ['かかります。','かかるかもしれません。'],
    ['です。','かもしれません。'],
    ['弱め。','弱めかもしれません。'],
    ['課題。','課題かもしれません。']
  ];
  for(var i=0;i<rules.length;i++){
    if(t.slice(-rules[i][0].length)===rules[i][0]) return t.slice(0,-rules[i][0].length)+rules[i][1];
  }
  // 「〜します／〜しません／〜しましょう」のような丁寧な言い切りは、
  // 後ろに「かもしれません」を足すと日本語が壊れる（例：残りますかもしれません）。そのまま返す。
  if(/(ます|ません|ましょう|ください|でしょう|ですね)。$/.test(t)) return t;
  if(t.slice(-1)==='。') return t.slice(0,-1)+'かもしれません。';
  return t;
}
// 高い軸ごとに使う強みフレーズ（[タイトル, サブ]）
var STRENGTH = {
  penguin: ['人を育てるのが得意', '研修や声かけで、新人が早く一人前になります。'],
  fukurou: ['仕事の無駄が少ない', 'デジタルの活用で、少ない人手でも質を保てます。'],
  risu:    ['食と栄養に手厚い', '一人ひとりに合わせた栄養のケアが行き届いています。'],
  kuma:    ['事故を防ぐ力がある', 'ヒヤリハットを共有し、安全な運営ができています。'],
  ookami:  ['もしもの備えが万全', '感染症や災害への備えが、しっかり整っています。'],
  hachi:   ['地域とのつながり', 'ボランティアや他機関と、よくつながっています。'],
  inu:     ['職員が長く働く', '人が辞めにくく、ベテランがしっかり育つ職場です。'],
  beaver:  ['専門職がそろう', '有資格者が多く、確かなケアができます。'],
  kitsune: ['堅実な黒字経営', '数字に強く、安定した経営ができています。'],
  usagi:   ['伸びる勢いがある', '新しいことに前向きで、事業が広がっています。'],
  iruka:   ['いつも満室に近い', '稼働率が高く、地域で選ばれています。'],
  zou:     ['残業が少ない', '休みやすく、働きやすい職場づくりが得意です。']
};
// ロック機能：伸びしろ(達成率が低い)軸を4つロック表示 → 完全版レポート(相談)へ誘導
var LOCK_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5A4.5 4.5 0 0 0 7.5 6v3H6.75A2.25 2.25 0 0 0 4.5 11.25v8.25A2.25 2.25 0 0 0 6.75 21.75h10.5A2.25 2.25 0 0 0 19.5 19.5v-8.25A2.25 2.25 0 0 0 17.25 9H16.5V6A4.5 4.5 0 0 0 12 1.5Zm0 1.8A2.7 2.7 0 0 1 14.7 6v3H9.3V6A2.7 2.7 0 0 1 12 3.3Z"/></svg>';
function renderLocked(sc){
  var host=document.getElementById('lockTeaser'); if(!host) return;
  var order = sc ? measuredAxes().slice().sort(function(a,b){return sc[a]-sc[b];}) : AXES.slice();
  var picks=order.slice(0,4);
  var circles=picks.map(function(k){
    var col=(TYPES[k]&&TYPES[k].color)||'#7b6ef6';
    return '<div class="lock-c"><div class="lock-ring" style="--rc:'+col+'">'+LOCK_SVG+'</div>'+
      '<span class="lock-lab">'+AXJA[k]+'<span class="lock-q" title="完全版レポートで確認できます">?</span></span></div>';
  }).join('');
  host.innerHTML='<div class="lock-circles">'+circles+'</div>'+
    '<div class="lock-card"><div class="lock-badge">'+LOCK_SVG+'</div>'+
    '<h3>'+t('rp.lock.h')+'</h3>'+
    '<p>'+t('rp.lock.p')+'</p>'+
    '<button class="lock-btn" onclick="openReport()">'+t('rp.lock.btn')+'<span style="font-family:\'Poppins\'">→</span></button></div>';
}
function renderSW(key, sc){
  var d=SW[key]||SW.inu;
  function axisKeyForTitle(title){
    var found=AXES.filter(function(k){ return AXJA[k]===title || (STRENGTH[k]&&STRENGTH[k][0]===title); });
    return found[0]||key;
  }
  function items(arr,soft,cardCls,label){return arr.map(function(it){
    var sub=soft?softenWeak(it[1]):it[1], axis=it[2]||axisKeyForTitle(it[0]);
    return '<div class="sw-item '+cardCls+'"><span class="sw-chip">'+swAxisIcon(axis)+'</span><div class="sw-tx"><span class="sw-tag">'+label+'</span><b>'+it[0]+'</b><span>'+sub+'</span></div></div>';
  }).join('');}
  // 達成率%（sc は 0〜3 スケール）。「不明」＝未測定軸(measuredAxes)は対象外。
  function achPct(k){ return sc? Math.round(sc[k]/3*100) : 0; }
  // 強み：達成率70%以上（＝バッジ獲得ライン）の軸を高い順に最大6件。0件なら一番高い軸1件だけ。
  var strongArr;
  if(sc){
    var ord=measuredAxes().sort(function(a,b){return sc[b]-sc[a];});
    var keepS=ord.filter(function(k){return achPct(k)>=70;});
    if(keepS.length===0) keepS=ord.slice(0,1);
    strongArr=keepS.slice(0,3).map(function(k){ var it=STRENGTH[k]||[AXJA[k],'']; return [it[0],it[1],k]; });
  } else {
    strongArr=d.strong;
  }
  // 強みは最も際立つ上位3つだけ表示
  if(strongArr && strongArr.length>3) strongArr=strongArr.slice(0,3);
  var s=document.getElementById('swStrong'); if(s) s.innerHTML=items(strongArr,false,'sw-card--good',t('ui.tag.strength'));
  // 伸びしろ：達成率30%以下の軸を低い順に最大3件。0件なら一番低い軸1件だけ。
  var weakArr;
  if(sc){
    var low=weakAxes(sc);
    weakArr=low.map(function(k){
      var sub=(typeof AXWEAK!=='undefined'&&AXWEAK[k]&&AXWEAK[k][0])?AXWEAK[k][0][1]
             :((typeof SOLVE!=='undefined'&&SOLVE[k])?SOLVE[k].issue:'');
      return [AXJA[k], sub, k];
    });
  } else {
    weakArr=d.weak;
  }
  var w=document.getElementById('swWeak'); if(w) w.innerHTML=items(weakArr,true,'sw-card--warn',t('ui.tag.grow'));
}
// ===== 近隣・お手本施設（実データ）=====
// 公表データを持つ10軸（稼働・働きやすさは本人回答由来なので他施設比較から除外）
var DATA_AXES = AXES.filter(function(k){ return k!=='iruka' && k!=='zou'; });
function facEntry(name,cd){
  if(!window.SCORES) return null;
  return window.SCORES[normName(name)+'|'+(cd||'')] || (window.SCORES_BYNAME||{})[normName(name)] || null;
}
function facDevAvg(e){
  if(!e||!e.dev) return null; var s=0,n=0;
  DATA_AXES.forEach(function(k){ var v=e.dev[k]; if(typeof v==='number'){ s+=v; n++; } });
  return n? s/n : null;
}
// 施設の各軸 達成率%（rawが無い軸は除外）
function facPct(e){
  var o={}; if(!e||!e.raw) return o;
  DATA_AXES.forEach(function(k){ var v=e.raw[k]; if(typeof v==='number') o[k]=Math.min(100,Math.round(v*100)); });
  return o;
}
// 近隣比較の軸ボタン用：公表データがある全12軸の達成率%（稼働・働きやすさも含む）。
// ※タイプ判定には使わない（判定は facPct/DATA_AXES のまま）。
function facPctAll(e){
  var o={}; if(!e||!e.raw) return o;
  AXES.forEach(function(k){ var v=e.raw[k]; if(typeof v==='number') o[k]=Math.min(100,Math.round(v*100)); });
  return o;
}
// 施設のタイプ＝10軸のうち達成率が最大の軸（同点はレア度優先＝calcと同じ）
function facTopType(e){
  var p=facPct(e), best=null;
  var rar=function(k){ return parseInt(TYPES[k]&&TYPES[k].rarity)||99; };
  Object.keys(p).forEach(function(k){
    if(best==null||p[k]>p[best]||(p[k]===p[best]&&rar(k)<rar(best))) best=k;
  });
  return best;
}
// 対象データ全体でのタイプ分布（公表データあり施設が母集団）。1回計算してキャッシュ。
var _typeDist=null;
function typeDist(){
  if(_typeDist) return _typeDist;
  var cnt={}, total=0;
  if(window.SCORES){
    Object.keys(window.SCORES).forEach(function(key){
      var e=window.SCORES[key]; if(!e||!e.raw) return;
      var tk=facTopType(e); if(!tk) return;
      cnt[tk]=(cnt[tk]||0)+1; total++;
    });
  }
  _typeDist={cnt:cnt,total:total};
  return _typeDist;
}
// そのタイプが対象施設全体に占める割合（整数%）。出せなければ null。
function typeSharePct(key){
  var d=typeDist(); if(!d.total) return null;
  var p=Math.round((d.cnt[key]||0)/d.total*100);
  return p<1?1:p;   // 1%未満は「約1%」に丸める（0%表示を避ける）
}
// 同一サービス種別・同一自治体優先で、公表データを持つ近隣施設を総合力順に集める
function collectNear(){
  if(anon||selCorp||!window.FAC||!window.SCORES) return null;
  var self=facEntry(fname,selCd), selfAvg=facDevAvg(self);
  var same=[], other=[];
  window.FAC.forEach(function(x){
    if(x.s!==selSvc) return;
    if(x.n===fname && (x.cd||'')===(selCd||'')) return;
    var e=facEntry(x.n,x.cd); var av=facDevAvg(e); var tk=facTopType(e);
    if(av==null||!tk) return;
    var rec={x:x,e:e,av:av,tk:tk};
    (x.ct===selCity?same:other).push(rec);
  });
  same.sort(function(a,b){return b.av-a.av;});
  other.sort(function(a,b){return b.av-a.av;});
  var ranked=same.concat(other);
  if(!ranked.length) return null;
  // 自施設より総合力が高い施設を優先。足りなければ上位で補う。
  var ahead=(selfAvg!=null)? ranked.filter(function(r){return r.av>selfAvg;}) : ranked;
  var list=(ahead.length>=3?ahead:ranked);
  return {selfAvg:selfAvg, bench:list.slice(0,3), near:list.slice(3,6)};
}
// 実データから benchList 用の行を作る
function realBenchRows(sc){
  var data=collectNear(); if(!data||!data.bench.length) return null;
  var youPct={}; DATA_AXES.forEach(function(k){ youPct[k]=Math.round(sc[k]/3*100); });
  var rows=data.bench.map(function(r){
    var p=facPct(r.e), tk=r.tk;
    // 一番差がついている力
    var gapK=null,gap=-1e9;
    Object.keys(p).forEach(function(k){ var g=p[k]-(youPct[k]||0); if(g>gap){gap=g;gapK=k;} });
    if(gapK==null) gapK=tk;
    // 相手が強い上位3軸を理由に
    var reasons=Object.keys(p).sort(function(a,b){return p[b]-p[a];}).slice(0,3)
      .map(function(k){ return k==='inu'?('離職率が低い（離職率'+dispV(k,p[k])+'%）'):(AXJA[k]+'の力が高い（達成率'+p[k]+'%）'); });
    var youW = youPct[gapK]? Math.round(youPct[gapK]/Math.max(1,p[gapK])*100) : 0;
    return {
      key:tk, name:r.x.n, scale:(selSvc||'')+'・'+(r.x.ct||''),
      bl:axStrong(gapK), bv:dispV(gapK,p[gapK])+'%',
      youW:youW, youL:(youPct[gapK]||0)+'%', themL:p[gapK]+'%',
      forces:p, reasons:reasons
    };
  });
  return {rows:rows, near:data.near};
}
// 同一サービス種別の全近隣施設（公表データあり）を集める＝案Cのランキング母集団
function axcNeighbors(){
  if(anon||selCorp||!window.FAC||!window.SCORES) return null;
  var out=[];
  window.FAC.forEach(function(x){
    if(x.s!==selSvc) return;
    if(x.n===fname && (x.cd||'')===(selCd||'')) return;
    var e=facEntry(x.n,x.cd); if(!e||!e.raw) return;
    out.push({name:x.n, ct:x.ct||'', cd:x.cd||'', s:x.s, c:x.c||'', forces:facPctAll(e), e:e});
  });
  return out;
}
// メール登録の有無（近隣施設ゲートの解除判定）
function isReg(){ try{ if(window.email) return true; return !!localStorage.getItem('shindan_email'); }catch(e){ return !!window.email; } }
function markReg(v){ try{ if(v) localStorage.setItem('shindan_email', v); }catch(e){} }
function benchGateHide(){ var g=document.getElementById('benchGate'); if(g) g.style.display='none'; var inner=document.getElementById('benchInner'); if(inner) inner.style.display=''; }
function benchGateShow(){
  var inner=document.getElementById('benchInner'); if(inner) inner.style.display='none';
  var g=document.getElementById('benchGate'); if(!g) return; g.style.display='';
  g.innerHTML='<div class="bg-badge">'+LOCK_SVG+'</div>'+
    '<h3>'+t('rp.bench.h')+'</h3>'+
    '<p>'+t('rp.bench.p')+'</p>'+
    '<button class="bg-btn" onclick="openUnlock()">'+t('rp.bench.btn')+'<span style="font-family:\'Poppins\'">→</span></button>'+
    '<div class="bg-note">'+t('rp.bench.note')+'</div>';
}
// 登録直後に近隣施設セクションを解除して描画
function benchUnlock(){ if(!window._bench||!window._axc) return; benchGateHide(); axcRenderChips(); axcRender(); }
function renderBench(sc){
  var real=realBenchRows(sc);
  // セクションの表示状態をリセット（前回の非表示を戻す）
  var sec=document.getElementById('benchSection'); if(sec) sec.style.display='';
  var h=document.getElementById('sec6'); if(h) h.style.display='';
  var toc=document.querySelector('.toc-link[data-sec="sec6"]'); if(toc){ var li=toc.closest('li'); if(li||toc)(li||toc).style.display=''; }
  if(real){
    window._bench={rows:real.rows, sc:sc};   // 「理由を見る」モーダル用データは維持
    var youPct={}; AXES.forEach(function(k){ if(window._measured&&window._measured[k]) youPct[k]=Math.round(sc[k]/3*100); });
    var neigh=axcNeighbors()||[];
    var topK=null; DATA_AXES.forEach(function(k){ if(typeof youPct[k]!=='number') return; if(topK==null||youPct[k]>youPct[topK]) topK=k; });
    if(topK==null) topK=DATA_AXES[0];
    // 初期選択は診断タイプの軸。稼働・働きやすさは近隣比較の対象外なので、その時は最強の公表軸で代替。
    if(lastType && DATA_AXES.indexOf(lastType)>=0) topK=lastType;
    window._axc={you:youPct, neigh:neigh, sel:topK, cmp:null, sc:sc};
    if(!isReg()){ benchGateShow(); return; }
    benchGateHide();
    axcRenderChips(); axcRender();
    return;
  }
  // 実データが出せない（匿名・法人・該当施設なし）→ セクションごと非表示。デモは出さない。
  window._bench=null; window._axc=null;
  if(sec) sec.style.display='none';
  if(h) h.style.display='none';
  if(toc){ var li2=toc.closest('li'); (li2||toc).style.display='none'; }
}
// 案C：軸チップ
function axcRenderChips(){
  var st=window._axc; if(!st) return;
  var el=document.getElementById('axcChips'); if(!el) return;
  el.innerHTML=AXES.map(function(k){
    var t=TYPES[k], on=(k===st.sel);
    return '<button class="axc-chip'+(on?' on':'')+'"'+(on?' style="--type:'+t.color+'"':'')+' onclick="axcPick(\''+k+'\')"><span class="axc-emo">'+t.emoji+'</span>'+AXJA[k]+'</button>';
  }).join('');
}
function axcPick(k){ var st=window._axc; if(!st) return; st.sel=k; st.cmp=null; var w=document.getElementById('axcSearchWrap'); if(w) w.style.display='none'; axcRenderChips(); axcRender(); }
// 案C：選択軸のランキング or 1対1比較
function axcRender(){
  var st=window._axc; if(!st) return;
  if(st.cmp){ axcRenderCompare(); return; }
  var k=st.sel, col=TYPES[k].color;
  var el=document.getElementById('axcRank'), sum=document.getElementById('axcSum'), cta=document.getElementById('axcCta');
  var youHas=(typeof st.you[k]==='number');
  var youV=youHas? st.you[k] : 0;
  var rows=st.neigh.filter(function(n){ return typeof n.forces[k]==='number'; })
    .map(function(n){ return {name:n.name, ct:n.ct, v:n.forces[k], you:false, ni:st.neigh.indexOf(n)}; });
  var neighN=rows.length;
  if(youHas) rows.push({name:(fname||t('ui.yourFacility')), ct:selCity, v:youV, you:true});
  rows.sort(function(a,b){ return b.v-a.v; });
  var total=rows.length;
  // 同点は同順位（standard competition ranking）：自施設より厳密に高い施設数＋1
  var youRank=1;
  rows.forEach(function(r){ if(!r.you && r.v>youV) youRank++; });
  // 近隣上位3件＋自施設に絞る（自施設は必ず表示。本人データなしのときは近隣上位3件のみ）
  var display=[], cnt=0;
  rows.forEach(function(r){ if(r.you){ display.push(r); } else if(cnt<3){ display.push(r); cnt++; } });
  if(el) el.innerHTML=display.map(function(r){
    var clik=(!r.you && r.ni>=0);
    return '<div class="axc-row'+(r.you?' you':(clik?' axc-clik':''))+'"'+
      (clik?' role="button" tabindex="0" title="この施設の診断結果を見る" onclick="viewNeighbor('+r.ni+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();viewNeighbor('+r.ni+')}"':'')+'>'+
      '<span class="axc-mark">'+(r.you?'▶':(rows.filter(function(x){return x.v>r.v;}).length+1))+'</span>'+
      '<span class="axc-nm">'+escHtml(r.name)+(r.you?'<span class="axc-you">'+t('ui.youBadge')+'</span>':'')+'</span>'+
      '<span class="axc-v"'+(r.you?'':' style="color:'+col+'"')+'>'+r.v+'%</span>'+
      '<span class="bg-t"><i style="width:'+r.v+'%'+(r.you?'':';background:'+col)+'"></i></span>'+
    '</div>';
  }).join('');
  var pos='';
  if(total>=4){ var above=(youRank<=Math.ceil(total/2)); pos=t('axc.pos',{col:(above?'#1aa37a':'#c26a5a'),pos:(above?t('axc.pos.upper'):t('axc.pos.lower'))}); }
  // 順位が上半分なら「上位」。youRank<=ceil(total/2) で判定するため、同点1位は必ず上位側になる。
  var pfEl=document.getElementById('pref'), pfName=pref||(pfEl&&pfEl.value)||'', pfx=pfName?escHtml(pfName)+'の':'';
  if(sum){
    if(youHas){
      sum.innerHTML=t('axc.rank.you',{col:col,ax:AXJA[k],scope:pfx+escHtml(svcLabel())+' ',total:total,rank:youRank})+pos;
    } else {
      sum.innerHTML=t('axc.rank.none',{col:col,ax:AXJA[k],scope:pfx+escHtml(svcLabel())+' ',n:neighN});
    }
  }
  if(cta) cta.innerHTML='<button class="btn" onclick="openAdvisor()">'+t('axc.cta',{ax:AXJA[k]})+'</button>';
}
function axcRenderCompare(){
  var st=window._axc, k=st.sel, col=TYPES[k].color, cmp=st.cmp;
  var el=document.getElementById('axcRank'), sum=document.getElementById('axcSum'), cta=document.getElementById('axcCta');
  var youHas=(typeof st.you[k]==='number');
  var youV=youHas? st.you[k] : 0;
  var themV=cmp.forces[k], hasThem=(typeof themV==='number');
  var diff='';
  if(hasThem && youHas){ var d=themV-youV;
    diff='<p class="axc-diff">'+(d>0?t('axc.diff.up',{ax:AXJA[k],d:d}):(d<0?t('axc.diff.down',{ax:AXJA[k],d:(-d)}):t('axc.diff.same',{ax:AXJA[k]})))+'</p>';
  } else if(!youHas && hasThem){
    diff='<p class="axc-diff">'+t('axc.diff.youNone',{ax:AXJA[k],col:col,v:themV})+'</p>';
  } else {
    diff='<p class="axc-diff">'+t('axc.diff.themNone',{ax:AXJA[k]})+'</p>';
  }
  if(el) el.innerHTML='<div class="axc-cmpcard">'+
    '<div class="axc-cmphead">'+escHtml(cmp.name)+' <span class="benchtag">'+escHtml((cmp.s||selSvc||'')+'・'+(cmp.ct||''))+'</span>'+
      '<button class="axc-back" onclick="axcBack()">'+t('ui.back.ranking')+'</button></div>'+
    '<div class="benchgap">'+
      '<div class="bg-row"><span class="bg-l">'+t('ui.you')+'</span><span class="bg-t"><i style="width:'+youV+'%"></i></span><span class="bg-v">'+(youHas?youV+'%':'—')+'</span></div>'+
      '<div class="bg-row"><span class="bg-l them">'+t('ui.thisFacility')+'</span><span class="bg-t"><i style="width:'+(hasThem?themV:0)+'%;background:'+col+'"></i></span><span class="bg-v them">'+(hasThem?themV+'%':'—')+'</span></div>'+
    '</div>'+diff+
    '<button class="benchcta" style="--type:'+col+';margin-top:14px;" onclick="axcOpenModal()">'+t('axc.all12')+'</button>'+
  '</div>';
  if(sum) sum.innerHTML='';
  if(cta) cta.innerHTML='<button class="btn" onclick="openAdvisor()">'+t('axc.cta',{ax:AXJA[k]})+'</button>';
}
function axcBack(){ var st=window._axc; if(!st) return; st.cmp=null; axcRender(); }
function axcToggleSearch(){ var w=document.getElementById('axcSearchWrap'); if(!w) return; var show=(w.style.display==='none'); w.style.display=show?'':'none'; if(show){ var f=document.getElementById('axcFname'); if(f) f.focus(); } }
function axcSearch(){
  var st=window._axc; if(!st) return;
  var q=document.getElementById('axcFname').value.trim();
  var box=document.getElementById('axcResults'); if(!box) return;
  if(!q){ box.style.display='none'; box.innerHTML=''; return; }
  var nq=normFac(q);
  var hits=st.neigh.filter(function(n){ return normFac(n.name).indexOf(nq)>=0 || normFac(n.c).indexOf(nq)>=0; }).slice(0,30);
  window._axcHits=hits;
  if(!hits.length){ box.innerHTML='<div class="ritem" style="cursor:default;color:#9aa0ad">'+t('axc.noHit')+'</div>'; box.style.display='block'; return; }
  box.innerHTML=hits.map(function(n,i){
    return '<div class="ritem" data-axcpick="'+i+'"><b>'+escHtml(n.name)+'</b><span>'+escHtml((n.s||selSvc||'')+'｜'+(n.ct||'')+'・'+(n.c||''))+'</span></div>';
  }).join('');
  box.style.display='block';
}
function axcPickCmp(i){ var st=window._axc, h=window._axcHits; if(!st||!h||!h[i]) return; st.cmp=h[i]; var w=document.getElementById('axcSearchWrap'); if(w) w.style.display='none'; axcRender(); }
function axcOpenModal(){
  var st=window._axc; if(!st||!st.cmp) return; var cmp=st.cmp, p=cmp.forces;
  var tk=facTopType(cmp.e)||st.sel;
  var reasons=Object.keys(p).sort(function(a,b){return p[b]-p[a];}).slice(0,3).map(function(k){ return k==='inu'?('離職率が低い（離職率'+dispV(k,p[k])+'%）'):(AXJA[k]+'の力が高い（達成率'+p[k]+'%）'); });
  var r={key:tk, name:cmp.name, scale:(cmp.s||selSvc||'')+'・'+(cmp.ct||''),
    bl:axStrong(tk), bv:((typeof p[tk]==='number')?dispV(tk,p[tk]):'')+'%', forces:p, reasons:reasons};
  showBenchModal(r, st.sc);
}
function openBench(i){
  var st=window._bench; if(!st||!st.rows[i]) return; showBenchModal(st.rows[i], st.sc);
}
function showBenchModal(r, sc){
  var col=TYPES[r.key].color;
  var trs=AXES.map(function(k){ var you=Math.round(sc[k]/3*100), them=r.forces[k];
    var youD=dispV(k,you);
    if(typeof them!=='number') return '<tr><td class="ax">'+AXJA[k]+'</td><td class="you">'+youD+'%</td><td class="them" style="color:#9aa0ad">—</td><td class="gap">—</td></tr>';
    var themD=dispV(k,them); var d=them-you; /* d＝良さの差（定着ベース）。＋＝この施設が上(良い)。離職率表示でも「良さの差」で揃える */ return '<tr><td class="ax">'+AXJA[k]+'</td><td class="you">'+youD+'%</td><td class="them" style="color:'+col+'">'+themD+'%</td><td class="gap'+(d>0?' up':'')+'">'+(d>0?('+'+d):(''+d))+'</td></tr>'; }).join('');
  var reasons=r.reasons.map(function(x){return '<li>'+x+'</li>';}).join('');
  document.getElementById('benchModalCard').innerHTML =
    '<button class="modal-close" onclick="closeBench()" aria-label="閉じる">×</button>'+
    '<div class="bm-head"><span class="bm-ico" style="background:'+col+'1f">'+animalSVG(r.key)+'</span><div><span class="bm-name">'+r.name+'</span><span class="bm-tag">'+r.scale+'</span></div></div>'+
    '<p class="bm-sub">この施設は <b style="color:'+col+'">'+r.bl+' '+r.bv+'</b>。あなたの施設と「12の力」で比べると、差はここにあります。<br><span style="font-size:12px;color:#6a7180">「伸びしろ」は ＋＝この施設が上（あなたが伸ばせる分）、−＝あなたが上（数字は%ポイント）。</span></p>'+
    '<table class="bm-table"><thead><tr><th>12の力</th><th>あなた</th><th>この施設</th><th>伸びしろ</th></tr></thead><tbody>'+trs+'</tbody></table>'+
    '<p class="bm-sub" style="font-size:11.5px;color:#9aa0ad;margin-top:6px">'+INU_NOTE+'</p>'+
    '<div class="bm-reasons"><h4>この施設がしていること</h4><ul>'+reasons+'</ul></div>'+
    '<div class="bm-solve"><p>あなたの施設も、介護ソフトで同じ仕組みを作れます。差を埋める具体策を無料でご提案します。</p><button class="btn" onclick="closeBench();openAdvisor()">無料で相談する →</button></div>';
  document.getElementById('benchModal').classList.add('open');
}
function closeBench(){ var m=document.getElementById('benchModal'); if(m) m.classList.remove('open'); }
// 12の力の各項目タップ → その軸の「今の状態」と「どこを改善すればいいか」を表示（benchModalを再利用）
function showAxisDetail(k){
  if(!AXJA[k]) return;
  var c=calc(), sc=c.sc, pct=Math.round(sc[k]/3*100), col=TYPES[k].color;
  var isInu=(k==='inu'), pd=dispV(k,pct); // 離職率表示(低いほど良い)。強み/伸びしろ判定は pct(定着) のまま
  var fix=(typeof AXFIX!=='undefined'&&AXFIX[k])?AXFIX[k]:{why:'',step:'',benefit:''};
  var sw=(typeof SW!=='undefined'&&SW[k])?SW[k]:{strong:[],weak:[]};
  var isData = typeof autoSc!=='undefined' && autoSc && autoSc[k]!=null;
  var isMeasured = isData;
  var level = !isMeasured ? '不明' : (pct>=67?'強み': (pct>=45?'標準':'伸びしろ'));
  var lead = !isMeasured
    ? 'この項目は、あなたの施設のサービス種別では<b>公表データがありません</b>ので、診断の対象外です。参考までに、この力の意味と伸ばし方をご紹介します。'
    : (pct>=67
      ? 'この力はあなたの<b style="color:'+col+'">強み</b>です。更に活かしましょう。'
      : 'この力には<b style="color:'+col+'">伸びしろ</b>があります。これから改善していけます。');
  // 達成率バー＋同規模比較。%は達成率（できている割合）。上位/下位は偏差値(同じサービス種別内)で裏づけ。
  var dev=(window._curEntry && window._curEntry.dev && typeof window._curEntry.dev[k]==='number') ? Math.round(window._curEntry.dev[k]) : null;
  var barTx=isInu?('離職率 <b>'+pd+'%</b>（低いほど良い）'):('達成率 <b>'+pct+'%</b>（できている項目の割合）');
  var cmpLine='';
  if(dev!=null){ var above=dev>=50; cmpLine='　／　同じサービス種別の中では <b style="color:'+(above?'#1aa37a':'#c26a5a')+'">平均より'+(above?(isInu?'低い（良い）':'上位'):(isInu?'高い':'下位'))+'</b>'; }
  var cmp = !isMeasured ? '' : '<div class="bm-cmp"><div class="bm-cmp-bar"><i style="width:'+Math.max(2,isInu?pd:pct)+'%;background:'+col+'"></i></div>'+
    '<div class="bm-cmp-tx">'+barTx+cmpLine+'</div></div>';
  var sol=(typeof SOLVE!=='undefined'&&SOLVE[k])?SOLVE[k]:null;
  var strongList=(sw.strong||[]).map(function(s){return '<li><b>'+s[0]+'</b>：'+s[1]+'</li>';}).join('');
  var weakList=(sw.weak||[]).map(function(w){return '<li><b>'+w[0]+'</b>：'+w[1]+'</li>';}).join('');
  // ① 今の課題（現状）
  var issueBlock='';
  if(isMeasured){
    if(pct>=67){
      issueBlock='<div class="ax-sec ok"><h4>💪 今の強み</h4>'+
        '<p>'+(isInu?'離職率 <b>'+pd+'%</b>（低いほど良い）。':'達成率 <b>'+pct+'%</b>。')+(dev!=null&&dev>=50?(isInu?'同じサービス種別の中でも<b>離職率が低い</b>ほうです。':'同じサービス種別の中でも<b>上位</b>です。'):'よくできています。')+'</p>'+
        (strongList?'<ul>'+strongList+'</ul>':'')+'</div>';
    } else {
      var lowWeak=(typeof AXWEAK!=='undefined'&&AXWEAK[k])?AXWEAK[k]:(sw.weak||[]);
      var lowWeakList=lowWeak.map(function(w){return '<li><b>'+w[0]+'</b>：'+w[1]+'</li>';}).join('');
      issueBlock='<div class="ax-sec issue"><h4>⚠️ 今の課題</h4>'+
        '<p>'+(isInu?('離職率 <b>'+pd+'%</b>＝辞める人が'+(pct<45?'やや多い':'少しいる')+'状況です。'):('達成率 <b>'+pct+'%</b>＝できていない項目が'+(pct<45?'まだ多く':'いくつか')+'残っています。'))+(dev!=null&&dev<50?(isInu?'同じサービス種別の中でも<b>離職率が高い</b>ほうです。':'同じサービス種別の中でも<b>下位</b>です。'):'')+(isInu?'離職が続くと、こんなことが起きがちです：':'この力が低いと、こんなことが起きがちです：')+'</p>'+
        (lowWeakList?'<ul>'+lowWeakList+'</ul>':'')+'</div>';
    }
  }
  // ② これからこうすれば良くなる（手順→効果）
  var improveBlock = '<div class="ax-sec grow"><h4>✅ これからこうすれば良くなる</h4>'+
    '<div class="ax-flow">'+
      (fix.step?'<div class="ax-fl"><span class="ax-fl-n">1</span><div><b>まず取り組むこと</b><p>'+fix.step+'</p></div></div>':'')+
      (sol&&sol.how?'<div class="ax-fl"><span class="ax-fl-n">2</span><div><b>仕組みにして続ける</b><p>'+sol.how+'</p></div></div>':'')+
      (fix.benefit?'<div class="ax-fl-benefit">→ こうなります：'+fix.benefit+'</div>':'')+
      (fix.evidence?'<div style="margin-top:10px;font-size:12px;line-height:1.7;color:#5b6373;background:#f6f8ff;border-radius:8px;padding:9px 11px;">📊 <b>根拠</b>：'+fix.evidence+'</div>':'')+
    '</div></div>';
  var whyBlock = fix.why?'<div class="bm-reasons"><h4>なぜ大事？</h4><p>'+fix.why+'</p></div>':'';
  var source = !isMeasured
    ? '<p class="bm-sub" style="font-size:12.5px;color:#8a8f9c">※ この項目は、公表データから確認できなかったため「不明」としています（診断の判定には含めていません）。</p>'
    : '';
  document.getElementById('benchModalCard').innerHTML =
    '<button class="modal-close" onclick="closeBench()" aria-label="閉じる">×</button>'+
    '<div class="bm-head"><span class="bm-ico" style="background:'+col+'1f">'+animalSVG(k)+'</span><div><span class="bm-name">'+AXJA[k]+(k==='iruka'?'<span style="font-size:12px;font-weight:600;color:#6a7180;margin-left:6px">（空きが少ないか＝満室に近いか）</span>':'')+'</span><span class="bm-tag">'+(isMeasured?(level+'・'+(isInu?pd:pct)+'%'):'不明')+'</span></div></div>'+
    '<p class="bm-sub">'+lead+'</p>'+
    cmp+
    issueBlock+
    improveBlock+
    whyBlock+
    source;
  document.getElementById('benchModal').classList.add('open');
}
function openAdvisor(){
  var c=calc(), sc=c.sc; var mx=measuredAxes(); var lowK=mx[0]; mx.forEach(function(k){ if(sc[k]<sc[lowK]) lowK=k; });
  var lowPct=Math.round(sc[lowK]/3*100), col=TYPES[lowK].color, sol=(typeof SOLVE!=='undefined'&&SOLVE[lowK])?SOLVE[lowK]:{issue:'今の伸びしろ',how:'ソフトで運営を効率化できます。'};
  var wk=['日','月','火','水','木','金','土'], days='', base=new Date();
  for(var i=1;i<=30;i++){ var d=new Date(base.getTime()+i*86400000); days+='<button class="adv-day" onclick="advPick(this,\'day\')">'+(d.getMonth()+1)+'/'+d.getDate()+'<small>('+wk[d.getDay()]+')</small></button>'; }
  var slots=['9時','10時','11時','12時','13時','14時','15時','16時','17時','18時'].map(function(s){return '<button class="adv-slot" onclick="advPick(this,\'slot\')">'+s+'</button>';}).join('');
  document.getElementById('advisorModalCard').innerHTML =
    '<button class="modal-close" onclick="closeAdvisor()" aria-label="閉じる">×</button>'+
    '<div class="adv-hero"><span class="adv-badge">無料相談</span><h3 class="adv-title">その課題、アドバイザーが<br>いっしょに解決します</h3>'+
      '<div class="adv-issue">あなたの施設の課題：<b style="color:'+col+'">'+axStrong(lowK)+'（'+dispV(lowK,lowPct)+'%）</b></div></div>'+
    '<div class="adv-sec"><h4 class="adv-h">アドバイザーって？</h4><p class="adv-p">介護ソフトを知り尽くした専任スタッフです。あなたの施設の課題に合わせて、<b>ソフトでどう改善できるか</b>を無料でご提案します。売り込みではなく、現場目線の伴走相談です。</p></div>'+
    '<div class="adv-solve"><div class="adv-solve-row"><span class="adv-tag x">今の課題</span><p>'+sol.issue+'</p></div><div class="adv-arrow">↓ 介護ソフトで</div><div class="adv-solve-row ok"><span class="adv-tag c">解決の一手</span><p>'+sol.how+'</p></div></div>'+
    '<div class="adv-sec"><h4 class="adv-h">相談したい日時を選ぶ</h4>'+
      '<div class="adv-label">希望日</div><div class="adv-pickrow adv-dayrow">'+days+'</div>'+
      '<div class="adv-label">時間帯</div><div class="adv-pickrow">'+slots+'</div>'+
      '<input class="einput adv-input" id="advName" placeholder="お名前（施設名でもOK）">'+
      '<input class="einput adv-input" id="advContact" placeholder="メールアドレス または 電話番号">'+
      '<button class="btn adv-submit" onclick="advSubmit()">この内容で相談を予約する（無料）</button>'+
      '<p class="adv-trust">✓ 相談は無料　✓ オンライン対応　✓ しつこい勧誘はしません</p></div>';
  window._adv={day:'',slot:''};
  document.getElementById('advisorModal').classList.add('open');
}
function advPick(el,kind){ var bs=el.parentNode.getElementsByTagName('button'); for(var i=0;i<bs.length;i++) bs[i].classList.remove('on'); el.classList.add('on'); if(window._adv) window._adv[kind]=el.textContent.replace(/\s+/g,''); }
function advSubmit(){ var a=window._adv||{}, ct=(document.getElementById('advContact')||{}).value||''; if(!a.day||!a.slot){ alert(t('rp.adv.errSlot')); return; } if(!ct){ alert(t('rp.adv.errContact')); return; } document.getElementById('advisorModalCard').innerHTML='<button class="modal-close" onclick="closeAdvisor()" aria-label="'+t('rp.close')+'">×</button><div class="adv-done"><div class="adv-done-ic">✓</div><h3>'+t('rp.adv.doneH')+'</h3><p>'+t('rp.adv.doneP',{dt:'<b>'+a.day+'・'+a.slot+'</b>'})+'</p><button class="btn" onclick="closeAdvisor()">'+t('rp.close')+'</button></div>'; }
function closeAdvisor(){ var m=document.getElementById('advisorModal'); if(m) m.classList.remove('open'); }
/* ===== 【一旦非表示】アドバイザー相談系（モーダル＋サイト各所の相談CTA/リンク）。社長指示 2026-07-22。
   復元するときはこの (function(){...})(); ブロックを丸ごと削除するだけでよい。
   元のボタン・リンク・openAdvisor/advSubmit/closeAdvisor はそのまま残してある。 ===== */
(function(){
  window.openAdvisor=function(){ return; }; // モーダルを開かない（無効化）
  function hideAdv(){
    try{ document.querySelectorAll('[onclick*="openAdvisor"]').forEach(function(el){ el.style.display='none'; }); }catch(e){}
  }
  function boot(){
    hideAdv();
    // 結果ページ等で後から生成される相談ボタンも隠す
    try{ new MutationObserver(hideAdv).observe(document.body,{childList:true,subtree:true}); }catch(e){}
  }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
// ===== 解析レポート取得（メール必須）。既存ゲート/openAuthとは別物の新規モーダル =====
var _reportSent=false;
function sampleReportHTML(){
  return ''+
    '<div style="border:1px solid #e7e9f2;border-radius:12px;overflow:hidden;background:#fff;margin:0 0 8px;text-align:left;box-shadow:0 6px 18px rgba(60,60,110,.08)">'+
      '<div style="background:linear-gradient(90deg,#7b6ef6,#22b3a4);color:#fff;padding:12px 14px">'+
        '<div style="font-size:10.5px;font-weight:800;opacity:.92">施設まるごと解析レポート（サンプル）</div>'+
        '<div style="font-size:15px;font-weight:900;margin-top:2px">石川苑デイサービスは「働きやすいゾウ型」</div></div>'+
      '<div style="padding:12px 14px">'+
        '<div style="font-size:11px;color:#7a828f;line-height:1.6;margin-bottom:10px">強み：働きやすさ78%（地域平均54%）。残業が少なく、職員が働きやすい職場です。</div>'+
        '<div style="font-size:11px;font-weight:800;color:#c0392b;margin-bottom:4px">⚠ ここに伸びしろ</div>'+
        '<div style="font-size:12px;color:#4a5160;line-height:1.6;margin-bottom:10px">DXは32%で、地域平均（54%）を下回っています。手書きや紙の作業が、まだ多く残っていると考えられます。</div>'+
        '<div style="font-size:11px;font-weight:800;color:#2c3340;margin-bottom:4px">このままだと</div>'+
        '<div style="font-size:12px;color:#4a5160;line-height:1.6;margin-bottom:10px">記録や集計を手作業で続けると、残業が減りにくく、その負担が職員の離職につながりやすくなります。</div>'+
        '<div style="font-size:11px;font-weight:800;color:#2f7d73;margin-bottom:4px">どこから手をつける</div>'+
        '<div style="font-size:12px;color:#4a5160;line-height:1.6">まずは毎日の記録から「見える化」を始めると効果的です。<b style="color:#2f3540">どの作業から変えると負担が軽くなるか、その優先順位はレポートでお伝えします。</b></div>'+
      '</div></div>'+
    '<p style="font-size:11px;color:#9aa1ad;margin:0 0 14px;text-align:left;line-height:1.6">▲ サンプルです。あなたの施設の実データで、伸びしろと“次の一手”を1枚にまとめてお届けします。</p>';
}
// 近隣施設を見るためのシンプルなメール登録（解析レポートとは別物）
function openUnlock(){
  document.getElementById('reportModalCard').innerHTML =
    '<button class="modal-close" onclick="closeReport()" aria-label="閉じる">×</button>'+
    '<h3 style="font-size:20px;font-weight:900;color:#2f3540;margin:2px 40px 10px 0;line-height:1.4">'+t('rp.unlock.h')+'</h3>'+
    '<p style="font-size:14px;color:#5b6373;line-height:1.7;margin:0 0 16px">'+t('rp.unlock.p')+'</p>'+
    '<input class="einput" id="unlockEmail" type="email" inputmode="email" placeholder="'+t('rp.mail.ph')+'" oninput="var e=document.getElementById(\'unlockEmailErr\'); if(e) e.style.display=\'none\';">'+
    '<div id="unlockEmailErr" style="display:none;color:#c0392b;font-size:12px;margin-top:-4px;margin-bottom:10px;text-align:left;">'+t('rp.mail.err1')+'</div>'+
    '<button class="btn solve-btn1" style="width:100%" onclick="submitUnlock()">'+t('rp.unlock.btn')+'</button>'+
    '<p style="font-size:12px;line-height:1.7;color:#7a828f;margin:14px 0 0;text-align:left;">'+t('rp.privacy1',{a:'<a onclick="go(\'privacy\')" style="color:var(--p1);cursor:pointer;text-decoration:underline;">',z:'</a>'})+'</p>';
  var m=document.getElementById('reportModal'); if(m) m.classList.add('open');
  document.addEventListener('keydown',_reportEsc);
  var i=document.getElementById('unlockEmail'); if(i){ setTimeout(function(){ i.focus(); },80); }
}
// メール送信に載せる中身。どの施設からの申込かを社内で特定できるようにする。
// （施設情報をメール送信ペイロードに含めるための処理）
// リードを社内に送る共通処理。届かなくても画面は止めない（fire and forget）。
function postLead(extra){
  var d = {};
  try{ if(typeof window.aiPayload==='function') d = window.aiPayload(); }catch(e){}
  try{ Object.assign(d, extra||{}); }catch(e){ for(var k in (extra||{})) d[k]=extra[k]; }
  try{
    fetch('/api/send-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).catch(function(){});
  }catch(e){}
}
window.aiPayload = function(){
  var c = null; try{ c = calc(); }catch(e){}
  var t = (c && c.typeKey) || lastType || '';
  var nm = (typeof TYPES!=='undefined' && TYPES[t]) ? TYPES[t].name : '';
  var total = c ? c.total : null;
  return {
    facility: anon ? '（匿名診断）' : (fname || ''),
    corp: facCorp || '',
    pref: (typeof pref!=='undefined' && pref) ? pref : curPref(),
    city: selCity || '',
    service: selSvc || '',
    cd: selCd || '',
    type: t,
    typeName: nm,
    total: total,
    anon: !!anon,
    url: location.href
  };
};
function submitUnlock(){
  var el=document.getElementById('unlockEmail'); var v=el?el.value.trim():'';
  var err=document.getElementById('unlockEmailErr');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ if(err) err.style.display='block'; return; }
  if(err) err.style.display='none';
  if(window._leadSending) return; window._leadSending=true;   // 二重送信防止：連打・再送を無効化
  email=v; markReg(v);
  var d={email:v,source:'nearby_unlock'}; try{ if(typeof window.aiPayload==='function'){ d=Object.assign(window.aiPayload(), {email:v,source:'nearby_unlock'}); } }catch(e){}
  var fin=function(){ window._leadSending=false; closeReport(); benchUnlock(); showToast(t('rp.toast.unlock')); };
  fetch('/api/send-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(function(){fin();}).catch(function(){fin();});
}
function openReport(){
  document.getElementById('reportModalCard').innerHTML =
    '<button class="modal-close" onclick="closeReport()" aria-label="閉じる">×</button>'+
    '<h3 style="font-size:20px;font-weight:900;color:#2f3540;margin:2px 40px 6px 0;line-height:1.4">'+t('rp.report.h')+'</h3>'+
    '<p style="font-size:14px;color:#5b6373;line-height:1.7;margin:0 0 14px">'+t('rp.report.p')+'</p>'+
    sampleReportHTML()+
    '<input class="einput" id="reportEmail" type="email" inputmode="email" placeholder="'+t('rp.mail.ph')+'" oninput="var e=document.getElementById(\'reportEmailErr\'); if(e) e.style.display=\'none\';">'+
    '<div id="reportEmailErr" style="display:none;color:#c0392b;font-size:12px;margin-top:-4px;margin-bottom:10px;text-align:left;">'+t('rp.mail.err2')+'</div>'+
    '<button class="btn solve-btn1" style="width:100%" onclick="submitReport()">'+t('rp.report.btn')+'</button>'+
    '<p style="font-size:12px;line-height:1.7;color:#7a828f;margin:14px 0 0;text-align:left;">'+t('rp.privacy2',{a:'<a onclick="go(\'privacy\')" style="color:var(--p1);cursor:pointer;text-decoration:underline;">',z:'</a>'})+'</p>';
  var m=document.getElementById('reportModal'); if(m) m.classList.add('open');
  document.addEventListener('keydown',_reportEsc);
  var i=document.getElementById('reportEmail'); if(i){ setTimeout(function(){ i.focus(); },80); }
}
function _reportEsc(e){ if(e.key==='Escape'||e.keyCode===27) closeReport(); }
function closeReport(){ var m=document.getElementById('reportModal'); if(m) m.classList.remove('open'); document.removeEventListener('keydown',_reportEsc); }
function submitReport(){
  var el=document.getElementById('reportEmail'); var v=el?el.value.trim():'';
  var err=document.getElementById('reportEmailErr');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ if(err) err.style.display='block'; return; }
  if(err) err.style.display='none';
  if(window._leadSending) return; window._leadSending=true;   // 二重送信防止：連打・再送を無効化
  email=v; markReg(v);
  // 診断情報と生成済みレポートを送信APIへ渡す
  var d={email:v,source:'analysis_report'};
  try{ if(typeof window.aiPayload==='function'){ d=Object.assign(window.aiPayload(), {email:v,source:'analysis_report'}); } }catch(e){}
  try{ if(window.LAST_REPORT){ d.report=window.LAST_REPORT; } }catch(e){}
  var done=function(sent){
    window._leadSending=false;
    closeReport();
    benchUnlock();
    if(!_reportSent){ _reportSent=true; showReportPreview(); }
    showToast(sent ? t('rp.toast.sent',{v:v}) : t('rp.toast.queued'));
  };
  fetch('/api/send-report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
    .then(function(r){return r.json();})
    .then(function(j){ done(!!(j&&j.sent)); })
    .catch(function(){ done(false); });
}
function showReportPreview(){
  var el=document.getElementById('reportPreview'); if(!el) return;
  el.innerHTML =
    '<div class="rp-card">'+
      '<h3 class="rp-title">解析レポートに含まれる内容</h3>'+
      '<ul class="rp-list">'+
        '<li>12タイプ別スコアと同業種内の偏差値</li>'+
        '<li>あなたの施設の強み・伸びしろの詳細</li>'+
        '<li>明日から使える改善のヒント3つ</li>'+
        '<li>介護ソフトでできること</li>'+
      '</ul>'+
      '<p class="rp-note">本レポートは公開データに基づく参考情報です。効果を保証するものではありません。</p>'+
    '</div>';
  el.style.display='block';
}
function contactSubmit(){
  var kd=(document.getElementById('contactKind')||{}).value||'';
  var nm=(document.getElementById('contactName')||{}).value||'';
  var bd=(document.getElementById('contactBody')||{}).value||'';
  if(!kd){ alert('お問い合わせの種類をお選びください。'); return; }
  if(!nm.trim()){ alert('お名前をご入力ください。'); return; }
  if(!bd.trim()){ alert('お問い合わせ内容をご入力ください。'); return; }
  var pane=document.getElementById('contactPane');
  if(pane) pane.innerHTML='<div class="adv-done" style="text-align:center;padding:8px 0"><div class="adv-done-ic">✓</div><h3>お問い合わせを受け付けました</h3><p>ありがとうございます。内容を確認のうえ、通常2〜3営業日以内にご返信します。<br>お急ぎの場合は <a href="mailto:info@xinc.co.jp" style="color:var(--tealInk);font-weight:800">info@xinc.co.jp</a> までご連絡ください。</p><button class="btn" onclick="go(\'intro\')">トップへもどる</button></div>';
}
document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeBench(); });
const DIST9 = {inu:12, penguin:7, fukurou:9, kitsune:10, usagi:8, iruka:10, beaver:6, risu:6, hachi:8, kuma:9, ookami:5, zou:10};
const DIST_ORDER = ['inu','penguin','fukurou','kitsune','usagi','iruka','beaver','risu','hachi','kuma','ookami','zou'];
const TYPESHORT = {inu:'イヌ', penguin:'ペンギン', fukurou:'フクロウ', kitsune:'キツネ', usagi:'ウサギ', iruka:'コアラ', beaver:'ビーバー', risu:'リス', hachi:'ミツバチ', kuma:'クマ', ookami:'オオカミ', zou:'ゾウ'};
function rarRank(key){ var ks=Object.keys(TYPES).sort(function(a,b){return (parseInt(TYPES[a].rarity)||0)-(parseInt(TYPES[b].rarity)||0);}); return ks.indexOf(key)+1; }
// 希少度の定性ラベル（具体%を断定しない。12タイプ内での相対的な珍しさ）
function rarityLabel(key){ var r=rarRank(key); return r<=4?t('rarity.rare'):(r<=8?t('rarity.sometimes'):t('rarity.common')); }
// === 結果文の具体化（highlights.json）===
// 現在の施設の highlights エントリを引く（匿名・未取得はnull）。
function hlEntry(){
  if(typeof anon!=='undefined' && anon) return null;
  if(!window.HIGHLIGHTS) return null;
  return window.HIGHLIGHTS[normName(fname)+'|'+(selCd||'')] || null;
}
// 具体名を出せる8軸：強み文（{items}差し込み）／のびしろ文（記録が無いとき）。
var HL_STRONG={
  risu:'{items}を取り入れ、食事とお口のケアの体制が手厚いのではないでしょうか。',
  fukurou:'{items}に取り組み、データを活かした介護が根づいているのではないでしょうか。',
  kuma:'{items}を整え、事故を防ぐ備えがしっかりしているのではないでしょうか。',
  ookami:'{items}を整え、もしもの時への備えが行き届いているのではないでしょうか。',
  hachi:'{items}に取り組み、地域とのつながりが深いのではないでしょうか。',
  penguin:'{items}を続け、職員を育てる仕組みが整っているのではないでしょうか。',
  beaver:'{items}など、有資格の専門職による体制が手厚いのではないでしょうか。',
  kitsune:'{items}を活かし、制度を上手に取り入れて運営されているのではないでしょうか。'
};
var HL_WEAK={
  risu:'栄養やお口のケアの記録はまだ見当たらず、ここが伸びしろと見受けられます。',
  fukurou:'記録や情報共有はまだ紙が中心のようで、デジタル化に伸びしろがあると見受けられます。',
  kuma:'事故予防の仕組みづくりはこれからのようで、ここが伸びしろと見受けられます。',
  ookami:'災害や感染症への備えはまだ記録が見当たらず、ここが伸びしろと見受けられます。',
  hachi:'地域との関わりはまだ記録が少なく、ここが伸びしろと見受けられます。',
  penguin:'研修や育成の記録はまだ見当たらず、ここが伸びしろと見受けられます。',
  beaver:'専門職や資格の体制はこれからのようで、ここが伸びしろと見受けられます。',
  kitsune:'取得できていない加算があり、まだ活かしきれていない余地があると見受けられます。'
};
// 数値4軸：_num(0..1)を閾値で言い分け（強み・のびしろ共用）。
function hlNumPhrase(axk,v){
  if(typeof v!=='number') return null;
  if(axk==='iruka') return v>=0.9?'利用枠がほぼ埋まっており、地域から選ばれているのではないでしょうか。':v>=0.7?'安定した稼働が続いていると見受けられます。':'まだ空きに余裕があり、稼働を伸ばせる余地があるのではないでしょうか。';
  if(axk==='inu')   return v>=0.5?'長く勤める職員が多く、チームが落ち着いているのではないでしょうか。':v>=0.3?'経験を重ねた職員が育ってきていると見受けられます。':'職員の入れ替わりがやや多く、定着に伸びしろがあると見受けられます。';
  if(axk==='usagi') return v>=0.7?'開設して間もなく、これから伸びていく施設ではないでしょうか。':v>=0.15?'着実に歩みを重ねてこられた施設ではないでしょうか。':'長く地域を支えてきた、歴史のある施設ではないでしょうか。';
  if(axk==='zou')   return v>=0.6?'離職が少なく、働きやすい職場ではないでしょうか。':v>=0.3?'働く環境は保たれていると見受けられます。':'職員が働き続けやすい環境づくりに、伸びしろがあると見受けられます。';
  return null;
}
// 強み文（タイプの軸）。出せなければnull＝従来の軸名のみにフォールバック。
function hlStrong(axk){
  var e=hlEntry(); if(!e) return null;
  if(HL_STRONG[axk]){
    var it=(e[axk]&&e[axk].items)||[];
    if(!it.length) return null;
    return HL_STRONG[axk].replace('{items}', it.slice(0,2).join('・'));
  }
  if(axk==='iruka' && e.iruka && typeof e.iruka.wait==='number' && e.iruka.wait>0)
    return '入所を待っている方が'+e.iruka.wait+'名いる状況で、地域で必要とされている施設ではないでしょうか。';
  return hlNumPhrase(axk, (e._num||{})[axk]);
}
// のびしろ文（最弱の軸）。出せなければnull＝従来の「ここが最大の伸びしろです。」にフォールバック。
function hlWeak(axk){
  var e=hlEntry(); if(!e) return null;
  if(HL_WEAK[axk]){
    var it=(e[axk]&&e[axk].items)||[];
    return it.length ? null : HL_WEAK[axk];
  }
  return hlNumPhrase(axk, (e._num||{})[axk]);
}
// 軸ごとの「らしさフレーズ」（A案・reports/result-copy-personal.md より）。結果サマリーの主役に使う。
var RASHISA={
  penguin:'スタッフを大切に育て、一人ひとりの成長を後押ししている施設かもしれません。',
  fukurou:'新しい仕組みを上手に取り入れ、記録や事務の手間を減らそうとしている施設かもしれません。',
  risu:'食事や栄養にしっかり向き合い、「おいしい」を大切にしている施設かもしれません。',
  kuma:'利用者さんが安心して過ごせる環境づくりを、いつも大事にしている施設かもしれません。',
  ookami:'もしもの時に備え、日頃から準備を怠らない、頼りになる施設かもしれません。',
  hachi:'地域とのつながりを大切にし、周りから信頼されている施設かもしれません。',
  inu:'働くスタッフが長く続けられる、居心地のよい施設かもしれません。',
  beaver:'専門の資格や知識を持つスタッフがそろい、質の高いケアを支えている施設かもしれません。',
  kitsune:'無理のない運営で、これからも安心して続けていける土台を持つ施設かもしれません。',
  usagi:'一歩ずつ前へ進もうとする、勢いのある施設かもしれません。',
  iruka:'たくさんの利用者さんに選ばれ、地域に必要とされている施設かもしれません。',
  zou:'スタッフが気持ちよく働ける、温かい職場づくりを大切にしている施設かもしれません。'
};
// 2軸目・3軸目に添える短縮キーワード
var RASHISA_SHORT={
  penguin:'人を育てる力', fukurou:'仕組みを取り入れる工夫', risu:'食事・栄養へのこだわり',
  kuma:'安心・安全への心くばり', ookami:'もしもへの備え', hachi:'地域とのつながり',
  inu:'スタッフの定着', beaver:'専門職の層の厚さ', kitsune:'堅実な経営',
  usagi:'前へ進む勢い', iruka:'多くの人に選ばれる存在感', zou:'働きやすい職場づくり'
};
// 結果サマリー：トップ軸の「らしさ」を主役に、代表型名を1つだけ添える（A=1軸突出／B=複数同点／C=幅広い）
function rashisaSummary(sc, typeKey, tp){
  var axo=measuredAxes().sort(function(a,b){return sc[b]-sc[a];});
  function pctOf(k){return Math.min(100,Math.round(sc[k]/3*100));}
  var lead=RASHISA[typeKey]||'';
  var nameTag='「<b style="color:'+tp.color+'">'+tp.name+'</b>」';
  var cotop=axo.filter(function(k){return k!==typeKey && Math.abs(sc[k]-sc[typeKey])<1e-9;});
  var leadHtml='<div class="rh-lead">'+t('rashisa.tmpl.lead',{lead:lead})+'</div>';
  if(cotop.length){ // B：複数同点トップ
    var also=cotop.slice(0,2).map(function(k){return RASHISA_SHORT[k];}).filter(Boolean).join(t('rashisa.join'));
    return leadHtml+'<div class="rh-type">'+t('rashisa.tmpl.also',{also:also,name:nameTag})+'</div>';
  }
  var strong=axo.filter(function(k){return k!==typeKey && pctOf(k)>=70;});
  if(strong.length>=3){ // C：強みが幅広い
    var more=strong.slice(0,2).map(function(k){return RASHISA_SHORT[k];}).filter(Boolean).join(t('rashisa.join'));
    return leadHtml+'<div class="rh-type">'+t('rashisa.tmpl.wide',{more:more,name:nameTag})+'</div>';
  }
  // A：1軸だけ突出
  return leadHtml+'<div class="rh-type">'+t('rashisa.tmpl.one',{name:nameTag})+'</div>';
}
function surpriseLine(sc, typeKey, tp, topPct){
  var rar=parseInt(tp.rarity)||10;
  var arr=AXES.map(function(k){return {k:k,p:Math.round(sc[k]/3*100),av:prefAvgOf(k)};});
  var top=arr.slice().sort(function(a,b){return b.p-a.p;})[0];
  var topT=arr.filter(function(o){return o.k===typeKey;})[0]||top;
  var low=arr.slice().sort(function(a,b){return a.p-b.p;})[0];
  var aboveAll=arr.every(function(o){return o.p>=o.av;});
  if(topT.p>=67 && low.p<low.av){ var topPhrase=(topT.k==='inu')?t('rashisa.top.inu'):t('rashisa.top',{ax:AXJA[topT.k]}); var lowPhrase=(low.k==='inu')?t('rashisa.low.inu'):t('rashisa.low',{ax:AXJA[low.k]}); return t('rashisa.topBottom',{top:topPhrase,low:lowPhrase}); }
  if(rar<=6) return t('rashisa.rare');
  if(topPct<=12) return t('rashisa.high');
  if(aboveAll) return t('rashisa.allAbove');
  return t('rashisa.weapon',{ax:axStrong(topT.k),pc:dispV(topT.k,topT.p)});
}
function distBar(cur, base){
  // サービス種別：同じ種別の全国タイプ分布（dist_by_service.json）。cd欠損/データ無しは全国分布(NATIONSHARE)にフォールバック
  var D, scope, headTxt, note='';
  var isType=false;
  if(base==='type'){
    var cd=svcCd();
    var ds=(window.DIST_BY_SERVICE && window.DIST_BY_SERVICE.dist && cd) ? window.DIST_BY_SERVICE.dist[cd] : null;
    if(ds && ds.share){
      isType=true; D=ds.share; scope=svcLabel();
      headTxt=t('dist.head.type',{scope:(scope||t('dist.scope.sameService'))});
      var n=ds.n||0;
      note=t('dist.note',{scope:scope,n:i18nNum(n)})+(n<100?t('dist.note.few'):'');
    }else{
      base='nation'; // フォールバック
    }
  }
  if(!isType){
    var isNation=(base==='nation' && typeof NATIONSHARE!=='undefined');
    D=isNation?NATIONSHARE:DIST9;
    scope=isNation?t('dist.scope.nation'):t('dist.scope.pref');
    headTxt=t('dist.head',{scope:scope});
  }
  if(typeof D[cur]!=='number') cur=DIST_ORDER[0];
  var segs=DIST_ORDER.map(function(k){ var pc=D[k]||0; return '<span class="dseg'+(k===cur?' cur':'')+'" style="width:'+pc+'%;background:'+TYPES[k].color+'" title="'+TYPESHORT[k]+' '+pc+'%"></span>'; }).join('');
  var legend=DIST_ORDER.map(function(k){ return '<span class="dleg'+(k===cur?' cur':'')+'"><i style="background:'+TYPES[k].color+'"></i>'+TYPES[k].emoji+TYPESHORT[k]+' <b>'+(D[k]||0)+'%</b></span>'; }).join('');
  var before=0; for(var i=0;i<DIST_ORDER.length;i++){ if(DIST_ORDER[i]===cur) break; before+=(D[DIST_ORDER[i]]||0); }
  var pc=D[cur]||0;
  var center=Math.max(7,Math.min(93, before + pc/2));
  var marker='<span class="dmark" style="left:'+center+'%">'+t('dist.marker',{nm:TYPESHORT[cur],pc:pc})+'</span>';
  var rank=Object.keys(D).sort(function(a,b){return (D[b]||0)-(D[a]||0);}).indexOf(cur)+1;
  var scopeCap=isType?('全国の'+scope):(scope+'の施設');
  return '<div class="dist-h">'+headTxt+'</div>'+
    '<div class="distbar-wrap">'+marker+'<div class="distbar">'+segs+'</div></div>'+
    '<div class="distlegend">'+legend+'</div>'+
    (note?'<div class="distcap" style="opacity:.75;margin-top:2px">'+note+'</div>':'');
}
// 県内タイプ分布：同じタイプが県内にどのくらいあるか（公表データの分布ベース）
function rankPanel(typeKey, topPct){
  var t=TYPES[typeKey]; if(!t) return '';
  window._rankArgs={typeKey:typeKey, topPct:topPct};       // 基準トグル切替時の再描画用
  return '';                                               // 希少度「どのくらい？」説明カードは非表示
}
function cmpSummaryText(rows){
  var ups=rows.filter(function(r){return r.m!==false && r.d>0;}).sort(function(a,b){return b.d-a.d;});
  var downs=rows.filter(function(r){return r.m!==false && r.d<0;}).sort(function(a,b){return a.d-b.d;});
  var parts=[];
  if(ups.length) parts.push(t('cmp.sum.up',{list:ups.slice(0,2).map(function(r){return '<b class="su">'+axStrong(r.k)+'</b>';}).join('・')}));
  if(downs.length) parts.push(t('cmp.sum.down',{list:downs.slice(0,1).map(function(r){return '<b class="sd">'+AXJA[r.k]+'</b>';}).join('・')}));
  var lb=baseLabel((window._cmp&&window._cmp.base)||'pref');
  return parts.length ? t('cmp.sum',{base:lb,parts:parts.join('、')}) : t('cmp.sum.same',{base:lb});
}
function animateCmp(){ var bs=document.querySelectorAll('#cmpbars .fill'); for(var i=0;i<bs.length;i++){ var w=bs[i].getAttribute('data-w'); if(w!=null) bs[i].style.width=w+'%'; } }
function renderCmp(){
  var st=window._cmp; if(!st) return;
  var arr=st.rows.slice();
  if(st.sort!=='def') arr.sort(function(a,b){
    // データなしの軸は50%を混ぜず最下部にまとめる
    var am=(a.m===false)?1:0, bm=(b.m===false)?1:0;
    if(am!==bm) return am-bm;
    return (b.you||0)-(a.you||0);
  });
  document.getElementById('cmpbars').innerHTML=arr.map(function(o){
    if(o.m===false){
      // 公表データが無い軸：50%と誤解されないよう、バーは空・数値は「データなし」
      return '<div class="cmpx nodata"><div class="cmpx-ax">'+axStrong(o.k)+'</div>'+
        '<div class="cmpx-track"></div>'+
        '<div class="cmpx-you"><span class="cmpx-nd">'+t('ui.noData')+'</span></div></div>';
    }
    var cls=o.d>0?'up':(o.d<0?'down':'zero'); // d＝良さの差（定着ベース）。色/強み判定は従来どおり
    var youD=o.you, avD=o.av; // inu も定着達成率のまま表示（反転しない）。ラベルは「離職率の低さ」
    var ml=Math.max(0,Math.min(100,avD)); // 平均線は棒(0〜100%)からはみ出さないようクランプ
    return '<div class="cmpx '+cls+'"><div class="cmpx-ax">'+axStrong(o.k)+'</div>'+
      '<div class="cmpx-track"><i class="fill" data-w="'+youD+'"></i><span class="avgmark" style="left:'+ml+'%"></span></div>'+
      '<div class="cmpx-you">'+youD+'%<span class="cmpx-avg">'+t('ui.avgShort',{n:Math.round(avD)})+'</span></div></div>';
  }).join('');
  setTimeout(animateCmp,60);
}
function sortCmp(mode){ if(!window._cmp) return; window._cmp.sort=mode; var seg=document.getElementById('cmpSeg'); if(seg){ var bs=seg.querySelectorAll('button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-s')===mode); } renderCmp(); }
const BASE_LABEL = {get pref(){return t('cmp.base.pref');}, get type(){return t('cmp.base.type');}, get nation(){return t('cmp.base.nation');}};
// サービス種別基準のときは実際のサービス通称（例：デイサービスの平均）を表示。通称が取れなければ従来表現にフォールバック。
function baseLabel(b){ if(b==='type'){ var s=svcLabel(); return (s&&s!=='同じサービス種別') ? t('cmp.base.svc',{svc:s}) : BASE_LABEL.type; } return BASE_LABEL[b]; }
// 比較の基準となる軸ごとの平均値を返す（種別/全国はデータが無ければ県内平均にフォールバック）
function baseAvg(k){
  var b=(window._cmp&&window._cmp.base)||'pref';
  // 平均値も自施設と同じく0〜100%にクランプ（稼働などで100%超えの元データが混ざっても100止まりにする）
  if(b==='type'){ var cd=svcCd(); if(window.TYPEAVG && window.TYPEAVG[cd] && typeof window.TYPEAVG[cd][k]==='number') return Math.min(100,window.TYPEAVG[cd][k]); }
  if(b==='nation' && window.NATIONAVG && typeof window.NATIONAVG[k]==='number') return Math.min(100,window.NATIONAVG[k]);
  return Math.min(100,prefAvgOf(k)); // 県内平均（既定・フォールバック）＝実データから計算
}
function setCmpBase(b){
  if(!window._cmp) return;
  // 全国：NATIONAVG未ロードでもバーは県内平均へフォールバックし、下パネルは NATIONSHARE で割合表示（押せる）
  if(b==='type' && !(window.TYPEAVG&&window.TYPEAVG[svcCd()])) b='pref'; // 種別データ欠損時
  window._cmp.base=b;
  window._cmp.rows=window._cmp.rows.map(function(o){ var av=baseAvg(o.k); return {k:o.k,you:o.you,av:av,d:o.you-av,m:o.m}; });
  var seg=document.getElementById('cmpBase');
  if(seg){ var bs=seg.querySelectorAll('button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-b')===window._cmp.base); }
  var lbl=document.getElementById('cmpBaseLabel'); if(lbl) lbl.textContent=baseLabel(window._cmp.base);
  var cs=document.getElementById('cmpSummary'); if(cs) cs.innerHTML=cmpSummaryText(window._cmp.rows);
  renderCmp(); // sort状態は保持されたまま再描画
  var rp=document.getElementById('rankPanel'); if(rp && window._rankArgs) rp.innerHTML=rankPanel(window._rankArgs.typeKey, window._rankArgs.topPct); // 基準に応じて下パネルも切替
  var db=document.getElementById('distBox'); if(db && window._rankArgs) db.innerHTML=distBar(window._rankArgs.typeKey, window._cmp.base); // 基準に応じて分布帯も県内/全国に切替
}
const SOLVE = {
  inu:{issue:'採用・定着と育成に伸びしろ', how:'勤務シフトや研修・資格情報をデジタルでまとめて管理。職員の負担を減らし、定着とチーム力を高めます。'},
  fukurou:{issue:'記録・情報共有がアナログ気味', how:'介護記録・連絡・申し送りをスマホやタブレットで共有。転記や無駄をなくし、残業を減らします。'},
  kitsune:{issue:'加算の取得・収支管理に伸びしろ', how:'加算要件の充足を自動でチェックし取りこぼしを防止。収支と稼働を見える化して経営を底上げします。'},
  usagi:{issue:'拡大を支える仕組みづくりに伸びしろ', how:'記録・教育・情報共有を標準化。多拠点でもケアの質を保ち、成長スピードに運営を追いつかせます。'},
  iruka:{issue:'稼働・問い合わせ管理に伸びしろ', how:'空き状況と問い合わせをまとめて管理。稼働率を最大化し、選ばれている需要を取りこぼさない。'},
  penguin:{issue:'研修・育成の仕組みづくりに伸びしろ', how:'研修計画と受講履歴をデジタルで管理。誰が何を学んだかを見える化し、育成を仕組みにします。'},
  beaver:{issue:'専門職・資格情報の管理に伸びしろ', how:'資格・研修の保有状況をまとめて管理。専門性を加算の取得や採用ブランドに活かせます。'},
  risu:{issue:'栄養・お口のケアの記録に伸びしろ', how:'一人ひとりに合わせた栄養の見直しやお口のケアの記録をデジタル化。加算とケアの質を両立できます。'},
  hachi:{issue:'地域連携と発信に伸びしろ', how:'連携・活動の記録を効率化し、地域とのつながりをそのまま信頼として発信できます。'},
  kuma:{issue:'事故予防・ヒヤリハット管理に伸びしろ', how:'ヒヤリハットと事故記録を共有・分析。予防の精度を上げ、安心・安全を高めます。'},
  ookami:{issue:'BCP・感染/災害対策の管理に伸びしろ', how:'計画・訓練・備蓄の記録を整理。いざという時の対応を速く確実にします。'},
  zou:{issue:'勤務・休暇管理と働きやすさに伸びしろ', how:'勤務シフトや休暇をデジタルで管理。残業を抑え、働きやすさを保ちます。'},
};
// 法人選択時：配下の事業所を「施設ごと」に採点し、各施設のタイプと最大の課題を一覧表示（md：診断単位は施設ごと）
function corpFacilityRows(corp){
  var list=(window.FAC||[]).filter(function(x){ return x.c===corp; });
  return list.map(function(x){
    var a=realAutoScores(x.n,x.cd);
    var typeK=null, low=null;
    if(a){
      var ks=AXES.filter(function(k){ return a[k]!=null; });
      if(ks.length){ typeK=ks[0]; low=ks[0]; ks.forEach(function(k){ if(a[k]>a[typeK])typeK=k; if(a[k]<a[low])low=k; }); }
    }
    return {n:x.n, cd:x.cd, s:x.s||'', ct:x.ct||'', type:typeK, low:low, has:!!typeK};
  });
}
function renderCorpFacilities(){
  var el=document.getElementById('corpFacilities'); if(!el) return;
  if(selCorp){
    var rows=corpFacilityRows(selCorp); window._corpRows=rows;
    // データ有りを先に、種別名順
    rows.sort(function(a,b){ return (b.has?1:0)-(a.has?1:0); });
    var cells=rows.map(function(r,idx){
      if(!r.has){ return '<div class="cf-row nodata"><div class="cf-main"><b>'+escHtml(r.n)+'</b><span>'+escHtml(r.s)+'</span></div><div class="cf-type">データ準備中</div></div>'; }
      var t=TYPES[r.type];
      return '<div class="cf-row" role="button" tabindex="0" onclick="viewCorpFacility('+idx+')" onkeydown="if(event.key===\'Enter\'){viewCorpFacility('+idx+')}">'+
        '<span class="cf-ico" style="background:'+t.color+'1f">'+animalSVG(r.type)+'</span>'+
        '<div class="cf-main"><b>'+escHtml(r.n)+'</b><span>'+escHtml(r.s)+'</span></div>'+
        '<div class="cf-tags"><span class="cf-type" style="color:'+t.color+'">'+t.name+'</span>'+
        '<span class="cf-low">課題：'+AXJA[r.low]+'</span></div>'+
        '<span class="cf-go">›</span></div>';
    }).join('');
    var withData=rows.filter(function(r){return r.has;}).length;
    el.style.display='';
    el.innerHTML='<div class="cf-head"><b>🏢 '+escHtml(selCorp)+'</b> の施設別診断（'+rows.length+'事業所）</div>'+
      '<div class="cf-note">施設ごとにタイプも課題も違います（とくに稼働・働きやすさは施設ごとに大きく変わります）。診断したい施設をタップしてください。</div>'+
      '<div class="cf-list">'+cells+'</div>';
  } else if(window._corpBack){
    el.style.display='';
    el.innerHTML='<button class="cf-back" onclick="backToCorp()">◀ '+escHtml(window._corpBack)+'（法人全体）にもどる</button>';
  } else {
    el.style.display='none'; el.innerHTML='';
  }
}
function viewCorpFacility(i){
  var r=(window._corpRows||[])[i]; if(!r) return;
  window._corpBack = selCorp;           // 「法人一覧にもどる」用に覚えておく
  facCorp=selCorp||'';
  selCorp=null; anon=false; selCd=r.cd; fname=r.n; faddr=r.ct;
  var fr=(window.FAC||[]).filter(function(x){return x.n===r.n&&(x.cd||'')===(r.cd||'');})[0]||r;
  selCity=fr.ct||r.ct||''; selSvc=fr.s||r.s||'';
  toQuiz();                             // その施設として通常診断（質問なし・公表データで採点）
}
function backToCorp(){
  if(!window._corpBack) return;
  var corp=window._corpBack; window._corpBack=null;
  selCorp=corp; anon=false; selCd=''; facCorp=corp; fname=corp; faddr='';
  startCorpOverview();
}
// ランキングの他施設をタップ → その施設の診断結果を軽量表示（メールゲートは再表示しない）
function viewNeighbor(i){
  var st=window._axc; if(!st||!st.neigh) return;
  var n=st.neigh[i]; if(!n) return;
  // 迷子防止：いまの自施設コンテキストを退避（「戻る」で完全復元）
  window._nbrBack={fname:fname,selCd:selCd,selSvc:selSvc,selCity:selCity,faddr:faddr,facCorp:facCorp,selCorp:selCorp,anon:anon,autoSc:autoSc,lastType:lastType,label:(fname||'あなたの施設')};
  anon=false; facCorp=n.c||''; selCorp=null; selCd=n.cd||''; fname=n.name; faddr=n.ct||''; selCity=n.ct||''; selSvc=n.s||selSvc;
  autoSc=realAutoScores(fname,selCd);   // 母集団は公表データありの施設のみ＝必ず値が返る
  showResult(); go('result'); window.scrollTo(0,0);
}
// 退避した自施設コンテキストに戻す
function backToSelf(){
  var b=window._nbrBack; if(!b) return; window._nbrBack=null;
  fname=b.fname; selCd=b.selCd; selSvc=b.selSvc; selCity=b.selCity; faddr=b.faddr;
  facCorp=b.facCorp; selCorp=b.selCorp; anon=b.anon; autoSc=b.autoSc; lastType=b.lastType;
  showResult(); go('result');
  // 見ていた「近隣・お手本になる施設」セクション(sec6)へ戻す（先頭に戻さない）
  var s=document.getElementById('sec6'); if(s) s.scrollIntoView({block:'start'});
}
// 「自分の施設の結果に戻る」バーの表示切替
function renderNbrBack(){
  var el=document.getElementById('nbrBack'); if(!el) return;
  if(window._nbrBack){
    el.style.display='';
    el.innerHTML='<button class="nbr-back" onclick="backToSelf()">◀&nbsp;<span class="nbr-nm">'+escHtml(window._nbrBack.label)+'（あなたの施設）の結果に戻る</span></button>';
  } else { el.style.display='none'; el.innerHTML=''; }
}

// スマホ：結果の続きを折りたたむ／開く（1枚目で完結させるため）
function rbCollapse(){
  var b=document.querySelector('#result .result-body'); if(!b) return;
  b.classList.add('rb-collapsed');
  var m=document.getElementById('rbMore'); if(m) m.style.display='';
  syncResultStickyCta();
}
function rbExpand(){
  var b=document.querySelector('#result .result-body'); if(!b) return;
  b.classList.remove('rb-collapsed');
  var m=document.getElementById('rbMore'); if(m) m.style.display='none';
  syncResultStickyCta();
  var f=document.getElementById('rbFirst');
  if(f) window.scrollTo(0, f.getBoundingClientRect().top + (window.pageYOffset||0) - 8);
}
function showResult(){
  renderNbrBack();
  // 法人一覧モード：平均の型は出さず、施設別一覧だけを表示
  document.getElementById('result').classList.toggle('corp-only', !!window._corpOverview);
  if(window._corpOverview){
    document.getElementById('result').style.setProperty('--type', '#7b6ef6');
    renderCorpFacilities();
    return;
  }
  const {sc,total,typeKey} = calc();
  lastType = typeKey;
  // 結果は最初から全部表示（スマホの折りたたみ＋「くわしく見る」ボタンは廃止）
  const tp = TYPES[typeKey];
  var rRoot=document.getElementById('result');
  rRoot.style.setProperty('--type', tp.color);
  // 図鑑詳細(#profile)と同じ色トークン（cineカードの見出し色・チップ色）を結果ページにも適用
  rRoot.style.setProperty('--inu', tp.color);
  rRoot.style.setProperty('--inuInk', shade(tp.color,-38));
  rRoot.style.setProperty('--inuSoft', shade(tp.color,86));
  var heroBox = document.querySelector('#result .pf-hero2');
  if(TYPE_BANNER[typeKey]){
    // 図鑑詳細ページと同じ cine カード（画像cover＋TYPE見出し＋名前＋希少度チップ）で表示
    if(heroBox){ heroBox.classList.remove('hero-banner','banner-baked'); heroBox.classList.add('heroB-on'); }
    var rimg=document.getElementById('rcine-img'); if(rimg){ rimg.src=TYPE_BANNER[typeKey]; rimg.className='cine__img cimg-type-'+typeKey; }
    var reye=document.getElementById('rcine-eyebrow'); if(reye) reye.textContent=t('result.eyebrow',{ax:tp.axisJa});
    document.getElementById('rcine-name').textContent=tp.name;
    document.getElementById('rcine-code').textContent=t('result.typeSuffix',{ax:axStrong(tp.ax)});
    var rLead=document.getElementById('rcine-lead'); rLead.textContent=t('result.catch',{'catch':tp.catch});
    document.getElementById('rcine-rarity').textContent=rarityLabel(typeKey);
  } else {
    // フォールバック（画像なしタイプ）：従来の斜め帯ヒーロー
    if(heroBox){ heroBox.classList.remove('heroB-on','banner-baked'); }
    document.getElementById('resultBand').style.background = bandGrad(tp.color);
  }
  document.getElementById('rbadge').innerHTML = heroArt(typeKey);
  document.getElementById('rbadge').style.background = 'transparent';
  document.getElementById('rname').textContent = tp.name;
  document.getElementById('rcode').textContent = t('result.typeSuffix',{ax:axStrong(tp.ax)});
  document.getElementById('rcatch').textContent = t('result.catch',{'catch':tp.catch});
  document.getElementById('rdesc').textContent = tp.desc; kutenForce(document.getElementById('rdesc'));
  document.getElementById('rname2').textContent = tp.name;
  document.getElementById('rAnalysis').innerHTML = (function(){
    // その施設の実データだけを織り込んだ、原因まで掘り下げる「総合診断文」（4段落）。
    // 型宣言だけ言い切り／解釈・原因は推測調（〜ではないでしょうか等）。測定できた軸のみ触れる。
    var axo=measuredAxes().sort(function(a,b){return sc[b]-sc[a];});
    function pct(k){return Math.round(sc[k]/3*100);}
    var t1=typeKey, low=axo[axo.length-1];
    var p1=pct(t1), pl=pct(low);
    var col=tp.color;
    var measCount=axo.length;
    var over70=axo.filter(function(k){return pct(k)>=BADGE_BRONZE;}).length;
    // 主軸と同点で並ぶトップ軸（複合タイプ）
    var cotop=axo.filter(function(k){return k!==t1 && Math.abs(sc[k]-sc[t1])<1e-9;});
    // 主軸の次に高い軸（同点トップは除く）
    var second=axo.filter(function(k){return k!==t1 && cotop.indexOf(k)<0;})[0];
    var bV=' style="color:'+col+'"';

    // ── 段落1：あなたの施設の特徴＋なぜ（数字・「――」は使わない）
    var p1txt='';
    p1txt+=t('analysis.p1',{feat:(AX_FEAT[t1]||AXJA[t1])});
    if(cotop.length){
      p1txt+=t('analysis.p1.cotop',{col:col,list:cotop.map(function(k){return axStrong(k);}).join('・')});
    }
    if(AX_HIGH[t1]){ p1txt+=AX_HIGH[t1]; }

    // ── 段落2：更には〜（組み合わせ意味づけ／2番手）
    var p2txt='';
    var cand=[t1].concat(cotop); if(second) cand.push(second);
    var combo=null;
    for(var ci=0;ci<AX_COMBO.length;ci++){
      var cc=AX_COMBO[ci];
      if(cand.indexOf(cc.a)>=0 && cand.indexOf(cc.b)>=0){ combo=cc; break; }
    }
    if(combo){
      var ct=combo.t.replace('のではないでしょうか。','のだと考えられます。').replace('ではないでしょうか。','だと考えられます。');
      p2txt=t('analysis.p2.combo',{txt:ct});
    } else if(second){
      p2txt=t('analysis.p2.second',{col:col,ax:axStrong(second)});
      if(AX_HIGH[second]){ p2txt+=AX_HIGH[second]; }
    }

    // ── 段落3：最も伸びしろが大きかった軸（軸名だけ・％やglossは付けない）
    var p3txt='';
    if(low!==t1 && cotop.indexOf(low)<0){
      p3txt=t('analysis.p3',{ax:axStrong(low)})+(AX_LOW[low]||'');
    }

    // ── 段落4：まとめ（軸名を出さない固定文に統一）
    var p4txt=t('analysis.p4');

    var h='<div class="an-summary"><p>'+p1txt+'</p>';
    if(p2txt) h+='<p>'+p2txt+'</p>';
    if(p3txt) h+='<p>'+p3txt+'</p>';
    if(p4txt) h+='<p>'+p4txt+'</p>';
    h+='</div>';
    return h;
  })();
  (function(){ var _an=document.getElementById('rAnalysis'); if(_an){ var _ps=_an.querySelectorAll('.an-summary p'); for(var _i=0;_i<_ps.length;_i++) kutenEl(_ps[_i]); } })(); // 総合診断文を句点で1文改行
  const rr = document.getElementById('rrarity');
  rr.textContent = rarityLabel(typeKey);
  // タイプ割合の一文（「このタイプは対象施設の約◯%」）は非表示
  const rrt = document.getElementById('rRareTop');
  if(rrt){ rrt.textContent = ''; }

  // 12の力（16P 性格特性風：色分けバー＋つまみ＋両端ラベル）
  const AXMETA = {};
  AXES.forEach(function(k){ AXMETA[k] = {c: TYPES[k].color}; });
  // 「施設の12の力と、その数字」セクション（バー／この結果が示すこと／レーダー）は削除

  // 実財務で黒字を確認バッジ（該当法人かつ margin>0 のときだけ）
  (function(){
    var fv=document.getElementById('finVerify'); if(!fv) return;
    var fs=document.getElementById('finSrc');
    var fin = (!anon && facCorp && window.FINANCIALS) ? window.FINANCIALS[facCorp] : null;
    if(fin && typeof fin.margin==='number' && fin.margin>0){
      fv.textContent=t('result.finVerify',{margin:fin.margin,year:fin.year});
      fv.style.display='inline-block';
      if(fs) fs.style.display='block';
    } else { fv.style.display='none'; fv.textContent=''; if(fs) fs.style.display='none'; }
  })();
  const sp = document.getElementById('sentpanel');
  if(email){
    sp.className = 'panel sentpanel';
    sp.style.display = '';
    sp.innerHTML = '<h3>'+t('result.sent.h')+'</h3><p class="epdesc">'+t('result.sent.p',{email:email})+'</p>';
  } else {
    sp.className = 'panel';
    sp.style.display = 'none';
    sp.innerHTML = '';
  }

  // 他施設との比較
  const topPct = Math.max(2, Math.round((1 - total/SCMAX)*88) + 4);
  document.getElementById('rankpct').style.display = 'none';
  document.getElementById('rankcap').textContent = (topPct<=20 ? t('result.rankcap.high',{fac:fname}) : topPct<=50 ? '' : t('result.rankcap.low'));
  const totalPct = Math.round(total/SCMAX*100);
  // 総合スコア／希少度ドーナツ・地域ノートの描画は削除（セクション①撤去にともなう）
  window._cmp = {base:'pref', rows: AXES.map(function(k){ var m=!!(window._measured&&window._measured[k]); var you=Math.round(sc[k]/3*100), av=prefAvgOf(k); return {k:k, you:you, av:av, d:you-av, m:m}; }), sort:'ach'};
  var _cbs=document.getElementById('cmpBase'); if(_cbs){ var _cb=_cbs.querySelectorAll('button'); for(var _i=0;_i<_cb.length;_i++) _cb[_i].classList.toggle('on', _cb[_i].getAttribute('data-b')==='pref'); }
  var _cbl=document.getElementById('cmpBaseLabel'); if(_cbl) _cbl.textContent=BASE_LABEL.pref;
  var _cs=document.getElementById('cmpSummary'); if(_cs) _cs.innerHTML=cmpSummaryText(window._cmp.rows);
  renderCmp();
  // 見せ合い強化：意外性ハイライト＋県内タイプ分布
  var rh=document.getElementById('rHighlight');
  if(rh){ rh.innerHTML=rashisaSummary(sc,typeKey,tp); }
  renderCorpFacilities();
  var bp=document.getElementById('badgePanel'); if(bp){ bp.innerHTML=badgePanel(sc); initBpReveal(); }
  var db=document.getElementById('distBox'); if(db) db.innerHTML=distBar(typeKey, (window._cmp&&window._cmp.base)||'pref');
  var rp=document.getElementById('rankPanel'); if(rp) rp.innerHTML=rankPanel(typeKey, topPct);
  var solveEl=document.getElementById('solveBanner'); if(solveEl){ solveEl.innerHTML=''; solveEl.style.display='none'; }
  // 比較バーは renderCmp() 内でアニメーション
  // QRコード（結果リンク）＆ HP埋め込み「認定証」コード
  var qr=document.getElementById('qrImg'); if(qr) qr.src='https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data='+encodeURIComponent(resultUrl());
  var emb=document.getElementById('embedCode'); if(emb){ var who=anon?t('ui.someFacility'):fname; emb.value='<a href="'+resultUrl()+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;background:'+tp.color+';color:#fff;font-weight:700;text-decoration:none;font-family:sans-serif">'+t('result.embed',{who:who,type:tp.name})+'</a>'; }

  // なぜこの結果？（カード化＋バランス判定）
  const sorted = measuredAxes().sort((a,b)=>sc[b]-sc[a]);
  const t1=sorted[0], t2=sorted[1], t3=sorted[2], lowK=sorted[sorted.length-1];
  const p1=Math.round(sc[t1]/3*100), p2=Math.round(sc[t2]/3*100), p3=Math.round(sc[t3]/3*100), pl=Math.round(sc[lowK]/3*100);
  // whyPanel 用のリード文・改善ヒント生成はセクション①とともに削除
  // 「見つかった課題と、改善の一手」ブロックは削除（社長了承済み）
  renderSW(typeKey, sc);
  renderBench(sc);
  buildShareCardPreview();
  pushHist();
  saveLast();
  go('result');
}

function showProfile(key){
  closeMenu();
  window._pfKey=key;   // 言語切替時に同じページを描き直すため

  const t=TYPES[key], p=PROFILE[key];
  var pfRoot=document.getElementById('profile');
  pfRoot.style.setProperty('--type', t.color);
  // タイプ色から #profile の色トークンを動的生成（イヌ以外でも正しく色付く）
  pfRoot.style.setProperty('--inu', t.color);
  pfRoot.style.setProperty('--inuInk', shade(t.color,-38));
  pfRoot.style.setProperty('--inuSoft', shade(t.color,86));
  var pfHero=document.querySelector('#profile .pf-hero2');
  if(TYPE_BANNER[key]){
    // イラストを持つタイプ（イヌ/ペンギン/ビーバー/ゾウ）：案B（カード付き）ヒーローを共通表示
    if(pfHero){ pfHero.classList.remove('hero-banner','banner-baked'); pfHero.classList.add('heroB-on'); }
    var cimg=document.querySelector('#pfHeroB .cine__img'); if(cimg){ cimg.src=TYPE_BANNER[key]; cimg.className='cine__img cimg-type-'+key; }
    var ceye=document.querySelector('#pfHeroB .pfhb-eyebrow'); if(ceye) ceye.textContent='TYPE / '+t.axisJa;
    document.getElementById('pfhb-name').textContent=t.name;
    document.getElementById('pfhb-code').textContent=window.t('result.typeSuffix',{ax:axStrong(t.ax)});
    var hbLead=document.getElementById('pfhb-lead'); hbLead.textContent=t.desc; kutenForce(hbLead);
    document.getElementById('pfhb-rarity').textContent=rarityLabel(key);
  } else {
    if(pfHero) pfHero.classList.remove('heroB-on');
    document.getElementById('pfBand').style.background=bandGrad(t.color);
    if(pfHero){ pfHero.classList.remove('hero-banner'); pfHero.classList.remove('banner-baked'); }
  }
  const b=document.getElementById('pf-badge');
  b.innerHTML=heroArt(key); b.style.background='transparent';
  document.getElementById('pf-name').textContent=t.name;
  document.getElementById('pf-code').textContent=window.t('result.typeSuffix',{ax:axStrong(t.ax)});
  const rr=document.getElementById('pf-rarity'); rr.textContent=rarityLabel(key);
  document.getElementById('pf-catch').textContent=t.desc; kutenForce(document.getElementById('pf-catch'));
  document.getElementById('pf-intro').textContent=p.intro;
  document.getElementById('pfAnalysis').innerHTML = (ANALYSIS[key]||[]).map(function(p){return '<p>'+p+'</p>';}).join('');
  renderProfileRich(key);
  applyKuten(document.getElementById('profile')); // 動的に組んだ図鑑本文にも句点改行を適用
  go('profile');
}

// セクション見出し番号を一元管理（順序変更に強い）
// eyebrow=英字アイブロウ, no=順序番号(例 "/ 01"), sub=青緑サブ文言, title=大見出し
function pfH2(eyebrow,no,sub,title){
  return '<div class="uni-head uni-head--pf">'+
    '<div class="uni-eyebrow">'+eyebrow+'<span class="uni-no">'+no+'</span></div>'+
    '<div class="uni-subrow"><span class="uni-dash"></span><span class="uni-sub">'+sub+'</span></div>'+
    '<h2>'+title+'</h2></div>';
}

// 図鑑詳細ページの拡張セクション（新A/②/新B/③/新D/新E/④）を描画。PROFILE_RICH[key] が無ければ全て空にして従来表示へ
function renderProfileRich(key){
  var R = PROFILE_RICH[key];
  var ids = ['pfSecFace','pfSecScenes','pfSecData','pfSecRel','pfSecGrow','pfSecCta'];
  ids.forEach(function(id){ var el=document.getElementById(id); if(el) el.innerHTML=''; });
  // TLDR帯は①サマリの先頭に差し込む（無ければ入れない）
  var sum = document.getElementById('pfSecSummary');
  var oldTldr = sum.querySelector('.pf-tldr'); if(oldTldr) oldTldr.remove();
  if(!R) return;
  // 「ひとことで言うと」帯は非表示（社長指示で削除）。既存があれば上で除去済み。
  // ① 新A：ひと目でわかるタイプの性格
  if(R.face){
    var f=R.face, row=function(k,arr,cls){
      if(!arr||!arr.length) return '';
      return '<div class="pf-face-row"><span class="k">'+k+'</span><div class="v">'+
        arr.map(function(x){return '<span class="chip'+(cls?' '+cls:'')+'">'+x+'</span>';}).join('')+'</div></div>';
    };
    var goodHtml;
    if(f.goodCards && f.goodCards.length){
      goodHtml = '<div class="pf-scenes reveal-grid">'+f.goodCards.map(function(g){
        return '<div class="pf-scene"><span class="ico">'+g[0]+'</span><h4>'+g[1]+'</h4><p>'+g[2]+'</p></div>';
      }).join('')+'</div>';
    } else {
      goodHtml = '<div class="pf-face">'+row(window.t('prof.face.good',null,'得意なこと'),f.good,'on')+'</div>';
    }
    document.getElementById('pfSecFace').innerHTML =
      pfH2('Character','/ 01',window.t('prof.sec.character.sub',null,'タイプの性格'),window.t('prof.sec.character.title',null,'一目で分かる、タイプの性格'))+
      '<p class="pf-lead">'+(R.faceLead||'')+'</p>'+
      goodHtml;
  }
  // ② 現場あるある
  if(R.scenes && R.scenes.length){
    var cards = R.scenes.map(function(s,i){
      var last = (i === R.scenes.length-1);
      var acc = last ? '#F97D57' : 'var(--inu)';
      var ico = last ? 'background:#FDEBE3' : '';
      return '<div class="pf-scene" style="border-top:5px solid '+acc+'"><span class="ico" style="'+ico+'">'+s[0]+'</span><h4>'+s[1]+'</h4><p>'+s[2]+'</p></div>';
    }).join('');
    document.getElementById('pfSecScenes').innerHTML =
      pfH2('Scene','/ 02',window.t('prof.sec.scene.sub',null,'現場の様子'),window.t('prof.sec.scene.title',null,'よくある現場の様子'))+
      '<p class="pf-lead">'+(R.scenesLead||'')+'</p>'+
      '<div class="pf-scenes reveal-grid">'+cards+'</div>';
  }
  // ③ 数字で見る（実データ・出典あり。サンプルバッジは付けない）
  if(R.data){
    var d=R.data;
    var dataBody='';
    if(d.items && d.items.length){
      var cards3 = d.items.map(function(it){
        return '<div class="sg-mcard">'+
          (it.head?'<h3 class="sg-mhead" style="--acc:'+it.accent+'">'+it.head+'</h3>':'')+
          '<div class="sg-donut sg-donut--sm" style="background:conic-gradient('+it.accent+' 0 '+it.pct+'%,'+it.accentSoft+' '+it.pct+'% 100%)">'+
            '<i><b>'+it.pct+'<span style="font-size:.42em;color:'+it.accent+';font-weight:700;margin-left:1px">%</span></b><small>'+it.label+'</small></i>'+
          '</div>'+
          '<p class="sg-note">'+it.note+'</p>'+
        '</div>';
      }).join('');
      dataBody =
        '<div class="sg-multi reveal-grid">'+cards3+'</div>'+
        '<p class="sg-src" style="text-align:center">'+d.src+'</p>';
    } else if(d.noChart){
      dataBody =
        '<div class="sg-chart c-coral" style="--acc:var(--inu);--accSoft:var(--inuSoft);max-width:560px;margin:0 auto">'+
          '<p class="sg-note" style="margin-top:0">'+d.note+'</p>'+
          '<p class="sg-src">'+d.src+'</p>'+
        '</div>';
    } else {
      dataBody =
        '<div class="sg-chart c-coral" style="--acc:var(--inu);--accSoft:var(--inuSoft);max-width:420px">'+
          '<div class="sg-body"><div class="sg-donut-wrap">'+
            '<div class="sg-donut" style="background:conic-gradient(var(--acc) 0 '+d.pct+'%,var(--accSoft) '+d.pct+'% 100%)">'+
              '<i><b>'+d.pct+'<span style="font-size:.42em;color:var(--acc);font-weight:700;margin-left:1px">%</span></b><small>'+d.label+'</small></i>'+
            '</div>'+
          '</div></div>'+
          '<p class="sg-note">'+d.note+'</p>'+
          '<p class="sg-src">'+d.src+'</p>'+
        '</div>';
    }
    document.getElementById('pfSecData').innerHTML =
      pfH2('Data','/ 03',window.t('prof.sec.data.sub',null,'数字で見る'),(d.title||window.t('prof.sec.data.sub',null,'数字で見る')))+
      '<p class="pf-lead">'+(d.lead||'')+'</p>'+
      dataBody;
  }
  // ④ 新E：相性・似ているタイプ（TYPES から絵文字/名前/色を取得し showProfile へ）
  if(R.rel && R.rel.length){
    var rc = R.rel.map(function(r){
      var rk=r[0], rt=TYPES[rk]; if(!rt) return '';
      // 「似ている：〜」「補い合える：〜」を〔種類ラベル〕＋〔理由〕に分解
      var raw=r[1]||'', parts=raw.split('：'), kind=parts[0]||'', reason=parts.slice(1).join('：')||'';
      var tag=window.t('prof.rel.tag.match',null,'相性のいいタイプ');
      if(kind.indexOf('似て')>=0) tag=window.t('prof.rel.tag.similar',null,'似ているタイプ');
      else if(kind.indexOf('補い')>=0) tag=window.t('prof.rel.tag.complement',null,'補い合うタイプ');
      if(!reason){ reason=raw; }
      var col=rt.color, soft=shade(col,90), ink=shade(col,-34);
      return '<article class="gj-typecard" style="background:#fff;border:1px solid #E7E7F1;border-radius:20px;border-top:5px solid '+col+';padding:clamp(24px,3vw,32px);display:flex;flex-direction:column;gap:16px;cursor:pointer;text-align:left" onclick="showProfile(\''+rk+'\')">'+
        '<div style="display:flex;align-items:center;gap:14px">'+
          '<div class="gj-typeicon gj-typeicon-share" style="width:56px;height:56px;flex:0 0 auto;border-radius:50%;background:'+soft+';display:grid;place-items:center;border:1px solid '+shade(col,70)+'">'+heroShareAnimal(rk)+'</div>'+
          '<div style="min-width:0"><div style="font-weight:700;color:'+ink+';font-size:.86rem;line-height:1.3">'+tag+'</div><div style="font-family:\'Zen Maru Gothic\';font-weight:900;font-size:clamp(1.12rem,2.4vw,1.32rem);line-height:1.45;color:#2A2E38">'+rt.name+'</div></div>'+
        '</div>'+
        '<p style="margin:0;font-size:.98rem;line-height:1.8;color:#606675">'+reason+'</p>'+
        '<div style="margin-top:auto;background:'+soft+';border-radius:12px;padding:14px 16px"><div style="font-weight:700;font-size:.82rem;color:'+ink+';margin-bottom:4px">'+window.t('gj.strengthTitle',null,'こんな強みが自慢')+'</div><div style="font-family:\'Zen Maru Gothic\';font-weight:700;line-height:1.6;color:#2A2E38">'+rt.catch+'</div></div>'+
        '<button type="button" class="gj-typebtn" onclick="event.stopPropagation();showProfile(\''+rk+'\')" style="width:100%;background:'+col+';color:#fff;border:0;border-radius:999px;padding:13px 16px;font-family:\'Zen Maru Gothic\';font-weight:900;font-size:.98rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 26px -14px '+col+'">'+window.t('gj.detail',null,'詳しくはこちら')+' <span aria-hidden="true">→</span></button>'+
      '</article>';
    }).join('');
    document.getElementById('pfSecRel').innerHTML =
      pfH2('Match','/ 04',window.t('prof.sec.match.sub',null,'相性・似たタイプ'),window.t('prof.sec.match.title',null,'似ているタイプ・相性のいいタイプ'))+
      '<p class="pf-lead">'+(R.relLead||'')+'</p>'+
      '<div class="pf-rel reveal-grid">'+rc+'</div>';
  }
  // ⑤ 伸びしろ（Growth/05）ブロックは削除済み。pfSecGrow は空のまま。
  // CTA（大型オレンジカード）は削除済み。pfSecCta は空のまま。
  // 動的生成したプロフィール内カードにも登場アニメを付与（他ページと同じ仕組みを再初期化）
  if(typeof initGjReveal==='function') initGjReveal();
}

// ===== シェア用 結果カード =====
function placedAnimal(key,x,y,s){
  return animalSVG(key).replace('<svg ','<svg x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" ');
}
function placedDots(x,y,s){
  return '<svg x="'+x+'" y="'+y+'" width="'+s+'" height="'+s+'" viewBox="0 0 64 64">'+
    '<circle cx="20" cy="14" r="6" fill="#fff"/><circle cx="36" cy="10" r="5" fill="#fff" opacity="0.9"/><circle cx="48" cy="20" r="6" fill="#fff" opacity="0.85"/><circle cx="14" cy="32" r="5" fill="#fff" opacity="0.8"/><circle cx="31" cy="29" r="7" fill="#fff"/><circle cx="47" cy="38" r="5" fill="#fff" opacity="0.85"/><circle cx="23" cy="45" r="6" fill="#fff" opacity="0.9"/><circle cx="39" cy="47" r="5" fill="#fff" opacity="0.8"/></svg>';
}
function radarCardInner(sc,color){
  var R=92,N=AXES.length;
  function pt(i,r){var a=-Math.PI/2+i*2*Math.PI/N;return [150+Math.cos(a)*r,150+Math.sin(a)*r];}
  var g='';[0.25,0.5,0.75,1].forEach(function(f){var p=AXES.map(function(_,i){var q=pt(i,R*f);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');g+='<polygon points="'+p+'" fill="none" stroke="#dfe3ec" stroke-width="1.5"/>';});
  var sp=AXES.map(function(_,i){var q=pt(i,R);return '<line x1="150" y1="150" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" stroke="#dfe3ec" stroke-width="1.5"/>';}).join('');
  // inu は「離職率(低いほど良い)」で表示するため、レーダーの点も 1−定着 に反転（ラベルと数値の向きを一致）
  function radV(k){ var raw=Math.min(1,sc[k]/3); return k==='inu'?(1-raw):raw; }
  var dp=AXES.map(function(k,i){var v=radV(k);var q=pt(i,R*v);return q[0].toFixed(1)+','+q[1].toFixed(1);}).join(' ');
  var dt=AXES.map(function(k,i){var v=radV(k);var q=pt(i,R*v);return '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="5" fill="'+color+'"/>';}).join('');
  var LB=AXJA;
  var lb=AXES.map(function(k,i){var q=pt(i,R+22);return '<text x="'+q[0].toFixed(1)+'" y="'+(q[1]+5).toFixed(1)+'" text-anchor="middle" font-size="13" font-weight="700" fill="#5b6373">'+LB[k]+'</text>';}).join('');
  return g+sp+'<polygon points="'+dp+'" fill="'+color+'" fill-opacity="0.22" stroke="'+color+'" stroke-width="3"/>'+dt+lb;
}
// 旧1080×1350デザイン（比較・復元用。現在の画面からは呼び出さない）。
function shareCardSVGLegacy(){
  var c=calc(), sc=c.sc, t=TYPES[c.typeKey], color=t.color;
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var mxs=measuredAxes(); var topK=mxs[0];
  mxs.forEach(function(k){ if(sc[k]>sc[topK])topK=k; });
  var topPct=Math.max(2, Math.round((1-c.total/SCMAX)*88)+4);
  var totalPct=Math.round(c.total/SCMAX*100);
  var surp=surpriseLine(sc, c.typeKey, t, topPct);
  // ---- 派生カラー（タイプ色から自動生成）----
  var accent=color;
  var darkT=shade(color,-52);           // 濃い文字色
  var tintBg=shade(color,93);           // クリーム地
  var tintPanel=shade(color,85);        // シーンパネル
  var lineC=shade(color,76);            // 罫線
  var soft=shade(color,88);             // 淡いタイル
  var frameA=shade(color,30), frameM=shade(color,66);
  // ---- タイプ番号・希少度スター ----
  var keys=Object.keys(TYPES); var typeNo=keys.indexOf(c.typeKey)+1; var total12=keys.length;
  function z(n){return (n<10?'0':'')+n;}
  var rv=parseInt(t.rarity)||12;
  var ns=rv<=7?5:rv<=9?4:rv<=12?3:rv<=15?2:1;
  var isRare=rv<=10;
  var starFill=''; for(var s=0;s<ns;s++)starFill+='★'; var starEmpty=''; for(var e=0;e<5-ns;e++)starEmpty+='☆';
  // ---- タイトル二色分割（動物名をアクセント色に）----
  var mm=t.name.match(/^(.*?)([ァ-ヶー]+)型$/);
  var titleInner=mm?(esc(mm[1])+'<tspan fill="'+accent+'">'+esc(mm[2])+'</tspan>型'):esc(t.name);
  var tFont=t.name.length>11?60:(t.name.length>9?72:84);
  // ---- 施設ラベル ----
  var flabel=anon?('ある施設・'+pref):(fname+(pref?('・'+pref):''));
  if(flabel.length>24)flabel=flabel.slice(0,23)+'…';
  // ---- 特性文の文字サイズ ----
  var sFont=surp.length>24?26:(surp.length>18?29:32);
  // ---- 動物タイプ帯の二色 ----
  var ctaMain='<text x="92" y="1292" font-size="30" font-weight="900" fill="#fff">あなたの施設は、どの<tspan fill="'+accent+'">動物タイプ</tspan>？</text>';
  // ---- 進捗セグメント ----
  var segs=''; var sx=300,sw=(1016-sx-11*6)/12;
  for(var i=0;i<12;i++){ var xx=sx+i*(sw+6); var f=i<typeNo-1?shade(color,58):(i===typeNo-1?accent:'#e6ddce'); var hh=i===typeNo-1?14:10; var yy=i===typeNo-1?1214:1216; segs+='<rect x="'+xx.toFixed(1)+'" y="'+yy+'" width="'+sw.toFixed(1)+'" height="'+hh+'" rx="5" fill="'+f+'"/>'; }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" font-family="-apple-system,\'Hiragino Sans\',sans-serif">'+
    '<defs>'+
      '<linearGradient id="frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+frameA+'"/><stop offset="0.5" stop-color="'+frameM+'"/><stop offset="1" stop-color="'+frameA+'"/></linearGradient>'+
      '<linearGradient id="scene" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+shade(color,90)+'"/><stop offset="1" stop-color="'+tintPanel+'"/></linearGradient>'+
    '</defs>'+
    // 枠＋地
    '<rect width="1080" height="1350" rx="40" fill="url(#frame)"/>'+
    '<rect x="22" y="22" width="1036" height="1306" rx="30" fill="'+tintBg+'"/>'+
    '<rect x="34" y="34" width="1012" height="1282" rx="24" fill="none" stroke="'+shade(color,60)+'" stroke-width="2"/>'+
    // ヘッダー
    '<rect x="62" y="80" width="30" height="30" rx="9" transform="rotate(45 77 95)" fill="'+accent+'"/><circle cx="77" cy="95" r="6" fill="#fff"/>'+
    '<text x="110" y="106" font-size="34" font-weight="800" fill="'+darkT+'">ケア図鑑</text>'+
    '<rect x="772" y="70" width="244" height="52" rx="26" fill="#fff" stroke="'+accent+'" stroke-width="2"/>'+
    '<text x="792" y="104" font-size="22" font-weight="800"><tspan font-size="21" fill="'+accent+'">'+starFill+'</tspan><tspan font-size="21" fill="#d9d2c6">'+starEmpty+'</tspan><tspan dx="12" fill="'+darkT+'">希少度</tspan></text>'+
    // シーンパネル
    '<rect x="62" y="150" width="956" height="400" rx="28" fill="url(#scene)"/>'+
    '<rect x="100" y="430" width="840" height="12" rx="6" fill="'+shade(color,66)+'"/>'+
    '<rect x="84" y="466" width="912" height="6" rx="3" fill="'+shade(color,72)+'"/>'+
    // 額縁＋どんぐり
    '<rect x="820" y="212" width="118" height="100" rx="8" fill="#fff" stroke="'+shade(color,52)+'" stroke-width="6"/>'+
    '<ellipse cx="872" cy="262" rx="15" ry="17" fill="'+accent+'"/><rect x="864" y="240" width="16" height="9" rx="3" fill="'+shade(color,-20)+'"/><path d="M888 250 q16 -6 20 6 q-14 4 -20 -6 Z" fill="'+shade(color,30)+'"/>'+
    // 植木鉢
    '<path d="M120 512 l6 -34 h40 l6 34 Z" fill="'+shade(color,-10)+'"/><path d="M140 480 q-18 -20 -6 -40 q14 8 6 40 Z" fill="'+shade(color,20)+'"/><path d="M146 480 q18 -16 34 -6 q-12 16 -34 6 Z" fill="'+shade(color,10)+'"/>'+
    // バッジ
    '<rect x="88" y="176" width="152" height="48" rx="16" fill="'+darkT+'"/><text x="164" y="208" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">No.'+z(typeNo)+' <tspan fill="#ffffff" opacity="0.6">/ '+total12+'</tspan></text>'+
    (isRare?'<rect x="852" y="176" width="140" height="48" rx="12" fill="url(#frame)"/><text x="922" y="209" text-anchor="middle" font-size="24" font-weight="900" fill="'+darkT+'" letter-spacing="2">RARE</text>':'')+
    // 動物
    placedAnimal(c.typeKey,388,196,304)+
    // 施設名・タイトル
    '<text x="540" y="596" text-anchor="middle" font-size="26" font-weight="700" fill="'+darkT+'" letter-spacing="1">'+esc(flabel)+'</text>'+
    '<text x="540" y="666" text-anchor="middle" font-size="'+tFont+'" font-weight="900" fill="'+darkT+'">'+titleInner+'</text>'+
    '<rect x="'+(540-(t.catch.length*15+40)).toFixed(0)+'" y="694" width="'+(t.catch.length*30+80)+'" height="50" rx="25" fill="'+shade(color,86)+'"/>'+
    '<text x="540" y="728" text-anchor="middle" font-size="27" font-weight="800" fill="'+darkT+'">「'+esc(t.catch)+'」</text>'+
    // 特性
    '<rect x="64" y="804" width="952" height="72" rx="18" fill="#fff" stroke="'+lineC+'" stroke-width="2"/>'+
    '<text x="558" y="849" text-anchor="middle" font-size="'+sFont+'" font-weight="900" fill="'+darkT+'">'+esc(surp)+'</text>'+
    '<rect x="80" y="792" width="80" height="36" rx="12" fill="'+accent+'"/><text x="120" y="817" text-anchor="middle" font-size="20" font-weight="900" fill="#fff">特性</text>'+
    // 左：レーダー
    '<rect x="64" y="900" width="452" height="292" rx="24" fill="#fff" stroke="'+lineC+'" stroke-width="2"/>'+
    '<text x="290" y="934" text-anchor="middle" font-size="20" font-weight="900" fill="#9aa0ad">12の力のバランス</text>'+
    '<svg x="150" y="928" width="280" height="280" viewBox="0 0 300 300">'+radarCardInner(sc,color)+'</svg>'+
    // 右：スコア3枚
    '<rect x="540" y="900" width="476" height="132" rx="20" fill="'+accent+'"/>'+
    '<path d="M956 908 l10 24 l26 2 l-20 17 l7 25 l-23 -14 l-23 14 l7 -25 l-20 -17 l26 -2 Z" fill="#fff" opacity="0.16"/>'+
    '<text x="568" y="948" font-size="22" font-weight="800" fill="#fff" opacity="0.9">総合スコア</text>'+
    '<text x="568" y="1012" font-size="58" font-weight="900" fill="#fff">'+totalPct+'<tspan font-size="28" dx="2">点</tspan></text>'+
    '<rect x="540" y="1044" width="476" height="66" rx="16" fill="#fff" stroke="'+lineC+'" stroke-width="2"/>'+
    '<text x="568" y="1073" font-size="19" font-weight="800" fill="#9aa0ad">希少度</text>'+
    '<text x="1000" y="1090" text-anchor="end" font-size="34" font-weight="900" fill="'+accent+'">第'+rarRank(c.typeKey)+'位</text>'+
    '<rect x="540" y="1122" width="476" height="66" rx="16" fill="#fff" stroke="'+lineC+'" stroke-width="2"/>'+
    '<text x="568" y="1151" font-size="19" font-weight="800" fill="#9aa0ad">一番の強み</text>'+
    '<text x="1000" y="1170" text-anchor="end" font-size="34" font-weight="900" fill="'+accent+'">'+esc(c.typeKey==='inu'?'離職率の低さ':(AXJA[c.typeKey]+'力'))+'</text>'+
    // 進捗
    '<text x="64" y="1228" font-size="19" font-weight="800" fill="'+darkT+'">12種のうち No.'+z(typeNo)+'</text>'+segs+
    // 下部CTA
    '<rect x="64" y="1250" width="952" height="76" rx="20" fill="'+darkT+'"/>'+
    ctaMain+
    '<text x="92" y="1320" font-size="20" font-weight="700" fill="#fff" opacity="0.85">施設名を選ぶだけの無料診断</text>'+
    '<rect x="828" y="1268" width="164" height="40" rx="12" fill="'+accent+'"/><text x="910" y="1294" text-anchor="middle" font-size="17" font-weight="900" fill="#fff">#ケア図鑑</text>'+
  '</svg>';
}

// 縦長SNSポスター。診断タイプ・施設名・公開データの強みTOP3を自動反映する。
// SVG内の文字：訳文が長くなっても枠から出ないよう font-size を自動で縮める。
// textLength は字間が崩れるため使わない。widthPx＝収めたい幅、basePx＝日本語での既定サイズ。
function svgFontFit(str,widthPx,basePx,minPx){
  var n=String(str==null?'':str).length;
  if(!n) return basePx;
  var fit=widthPx/n/0.98;                 // 全角1文字 ≒ font-size 幅として概算
  return Math.max(minPx||12, Math.min(basePx, Math.round(fit)));
}
function shareCardSVG(){
  var c=calc(), sc=c.sc, ty=TYPES[c.typeKey], color=ty.color;
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function pct(k){return Math.max(0,Math.min(100,Math.round(sc[k]/3*100)));}
  function short(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s;}
  var measured=measuredAxes().slice().sort(function(a,b){return sc[b]-sc[a];});
  var top=measured.slice(0,3);
  while(top.length<3) top.push(AXES[top.length]);
  var medal=['#F3B51B','#AEB7C4','#C98752'];
  var medalDark=['#B97800','#707B8A','#8C4E2D'];
  var icon=['✦','●','◆'];
  var facility=short(fname||t('ui.diagnosedFacility'),24);
  var prefLine=short((pref?pref+'・':'')+(selCity||svcLabel()),28);
  var title=ty.name.replace(/型$/,'');
  var titleSize=title.length>10?66:(title.length>7?78:92);   // 日本語の既定サイズ（変更なし）
  var rows=top.map(function(k,i){
    var y=1044+i*236, p=pct(k), ax=(k==='inu'?t('ax.inu.strong'):AXJA[k]);
    var desc=i===0?t('share.note.1'):i===1?t('share.note.2b'):t('share.note.3b');
    return ''+
      '<rect x="62" y="'+y+'" width="956" height="206" rx="30" fill="#fff" stroke="#E8DFC9" stroke-width="3"/>'+
      '<circle cx="154" cy="'+(y+103)+'" r="65" fill="'+medal[i]+'" stroke="'+medalDark[i]+'" stroke-width="5"/>'+
      '<circle cx="154" cy="'+(y+103)+'" r="48" fill="none" stroke="#fff" stroke-width="3" opacity=".65"/>'+
      '<text x="154" y="'+(y+92)+'" text-anchor="middle" font-size="29" font-weight="900" fill="#fff">'+t('share.rankOrd',{n:(i+1)})+'</text>'+
      '<text x="154" y="'+(y+130)+'" text-anchor="middle" font-size="25" font-weight="900" fill="#fff">'+icon[i]+'</text>'+
      '<rect x="246" y="'+(y+28)+'" width="88" height="88" rx="24" fill="'+shade(TYPES[k].color,87)+'"/>'+
      '<text x="290" y="'+(y+86)+'" text-anchor="middle" font-size="40" font-weight="900" fill="'+TYPES[k].color+'">'+(i+1)+'</text>'+
      '<text x="358" y="'+(y+72)+'" font-size="'+svgFontFit(ax,600,42,22)+'" font-weight="900" fill="#24224C">'+esc(ax)+'</text>'+
      '<text x="976" y="'+(y+76)+'" text-anchor="end" font-size="52" font-weight="900" fill="'+TYPES[k].color+'">'+p+'%</text>'+
      '<rect x="358" y="'+(y+96)+'" width="618" height="18" rx="9" fill="#EEEAF0"/>'+
      '<rect x="358" y="'+(y+96)+'" width="'+Math.round(618*p/100)+'" height="18" rx="9" fill="'+TYPES[k].color+'"/>'+
      '<text x="358" y="'+(y+154)+'" font-size="'+svgFontFit(desc,618,24,14)+'" font-weight="700" fill="#666477">'+esc(desc)+'</text>';
  }).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" font-family="-apple-system,\'Hiragino Sans\',\'Noto Sans JP\',sans-serif">'+
    '<defs>'+
      '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#25174E"/><stop offset=".48" stop-color="#6A2A73"/><stop offset="1" stop-color="#F1A238"/></linearGradient>'+
      '<radialGradient id="glow"><stop offset="0" stop-color="#FFF7C9" stop-opacity=".95"/><stop offset="1" stop-color="#FFF7C9" stop-opacity="0"/></radialGradient>'+
      '<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF4"/><stop offset="1" stop-color="#FFF5DB"/></linearGradient>'+
      '<filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#1C0E35" flood-opacity=".34"/></filter>'+
    '</defs>'+
    '<rect width="1080" height="1920" fill="url(#bg)"/>'+
    '<circle cx="140" cy="120" r="190" fill="url(#glow)"/><circle cx="930" cy="330" r="260" fill="url(#glow)" opacity=".55"/>'+
    '<g fill="#FFD45D"><text x="70" y="110" font-size="44">✦</text><text x="980" y="160" font-size="34">✦</text><text x="82" y="520" font-size="28">◆</text><text x="962" y="650" font-size="42">✦</text></g>'+
    '<rect x="42" y="42" width="996" height="1836" rx="54" fill="url(#paper)" stroke="#F6C74A" stroke-width="10" filter="url(#shadow)"/>'+
    '<path d="M154 76 H926 L884 150 H196 Z" fill="#E63E57"/>'+
    '<path d="M154 76 l-92 46 90 28zM926 76l92 46-90 28z" fill="#B92745"/>'+
    '<text x="540" y="126" text-anchor="middle" font-size="34" font-weight="900" fill="#fff" letter-spacing="3">'+t('share.head')+'</text>'+
    '<text x="540" y="210" text-anchor="middle" font-size="'+svgFontFit(t('share.yourFacilityIs'),700,31,16)+'" font-weight="800" fill="#302B42">'+t('share.yourFacilityIs')+'</text>'+
    '<text x="540" y="292" text-anchor="middle" font-size="'+svgFontFit(t('share.shine'),780,54,26)+'" font-weight="900" fill="'+color+'">'+t('share.shine')+'</text>'+
    '<text x="540" y="390" text-anchor="middle" font-size="'+svgFontFit(title+t('share.typeSuffix'),860,titleSize,30)+'" font-weight="900" fill="#24224C">'+esc(title)+t('share.typeSuffix')+'</text>'+
    '<text x="540" y="444" text-anchor="middle" font-size="'+svgFontFit(t('share.was'),700,30,16)+'" font-weight="800" fill="#302B42">'+t('share.was')+'</text>'+
    '<rect x="748" y="178" width="230" height="136" rx="68" fill="#EC3F65" stroke="#FFBF67" stroke-width="7"/>'+
    '<text x="863" y="224" text-anchor="middle" font-size="'+svgFontFit(t('share.openData'),200,20,11)+'" font-weight="800" fill="#fff">'+t('share.openData')+'</text>'+
    '<text x="863" y="270" text-anchor="middle" font-size="'+svgFontFit(t('share.noQuestion'),200,32,14)+'" font-weight="900" fill="#FFF36B">'+t('share.noQuestion')+'</text>'+
    '<rect x="92" y="486" width="896" height="408" rx="42" fill="'+shade(color,89)+'" stroke="'+shade(color,68)+'" stroke-width="4"/>'+
    '<circle cx="540" cy="670" r="178" fill="#fff" opacity=".74"/>'+placedAnimal(c.typeKey,365,492,350)+
    '<rect x="118" y="828" width="844" height="132" rx="28" fill="#fff" stroke="'+shade(color,72)+'" stroke-width="4"/>'+
    '<text x="540" y="875" text-anchor="middle" font-size="'+svgFontFit(t('share.diagnosed'),800,25,14)+'" font-weight="800" fill="#6D6878">'+t('share.diagnosed')+'</text>'+
    '<text x="540" y="925" text-anchor="middle" font-size="'+svgFontFit(facility,820,40,20)+'" font-weight="900" fill="#24224C">'+esc(facility)+'</text>'+
    '<text x="540" y="958" text-anchor="middle" font-size="'+svgFontFit(prefLine,820,21,12)+'" font-weight="700" fill="#777284">'+esc(prefLine)+'</text>'+
    '<rect x="62" y="984" width="956" height="72" rx="24" fill="#FFF1C7" stroke="#E9C56B" stroke-width="3"/>'+
    '<text x="540" y="1032" text-anchor="middle" font-size="31" font-weight="900" fill="#43285D">'+t('share.rankTitle')+' <tspan fill="#E63E57">TOP3</tspan></text>'+
    rows+
    '<rect x="62" y="1762" width="956" height="96" rx="30" fill="#5E2A85"/>'+
    '<text x="98" y="1805" font-size="'+svgFontFit(t('share.cta1'),700,25,13)+'" font-weight="800" fill="#fff">'+t('share.cta1')+'</text>'+
    '<text x="98" y="1838" font-size="'+svgFontFit(t('share.cta2'),700,20,11)+'" font-weight="700" fill="#E7D9F2">'+t('share.cta2')+'</text>'+
    '<rect x="814" y="1783" width="164" height="52" rx="26" fill="#FFCA3A"/>'+
    '<text x="896" y="1817" text-anchor="middle" font-size="'+svgFontFit(t('share.tag'),150,23,12)+'" font-weight="900" fill="#4B2868">'+t('share.tag')+'</text>'+
  '</svg>';
}

var shareAssetCache={};
function shareVisualPath(typeKey){
  if(typeKey==='ookami') return 'assets/share-wolf-3d-v2.png?v=20260804';
  return TYPE_BANNER[typeKey]||'';
}

// ファーストビューの12タイプ一覧専用に作成した、全身ミニキャラクター。
var HERO_ANIMAL_MINI_BY_TYPE={
  inu:'assets/hero-animal-mini/inu.png?v=20260811',
  penguin:'assets/hero-animal-mini/penguin.png?v=20260811',
  fukurou:'assets/hero-animal-mini/fukurou.png?v=20260811',
  kitsune:'assets/hero-animal-mini/kitsune.png?v=20260811',
  usagi:'assets/hero-animal-mini/usagi.png?v=20260811',
  iruka:'assets/hero-animal-mini/iruka.png?v=20260811',
  beaver:'assets/hero-animal-mini/beaver.png?v=20260811',
  risu:'assets/hero-animal-mini/risu.png?v=20260811',
  hachi:'assets/hero-animal-mini/hachi.png?v=20260811',
  kuma:'assets/hero-animal-mini/kuma.png?v=20260811',
  ookami:'assets/hero-animal-mini/ookami.png?v=20260811',
  zou:'assets/hero-animal-mini/zou.png?v=20260811'
};
function heroShareAnimal(key){
  var src=HERO_ANIMAL_MINI_BY_TYPE[key]||HERO_ANIMAL_MINI_BY_TYPE.kuma;
  var label=(TYPES[key]&&TYPES[key].name)||key;
  return '<img class="hero-share-animal hero-share-animal--'+key+'" src="'+src+'" alt="'+label+'">';
}
function shareAssetDataUrl(typeKey){
  var path=shareVisualPath(typeKey);
  if(!path) return Promise.resolve('');
  if(shareAssetCache[path]) return Promise.resolve(shareAssetCache[path]);
  return fetch(path).then(function(r){if(!r.ok) throw new Error('share asset '+r.status);return r.blob();}).then(function(blob){
    return new Promise(function(resolve,reject){var rd=new FileReader();rd.onload=function(){shareAssetCache[path]=rd.result;resolve(rd.result);};rd.onerror=reject;rd.readAsDataURL(blob);});
  }).catch(function(e){console.warn(e);return '';});
}

// 写真・3Dキャラクターを主役にしたSNSポスター。文字と数値はSVGで正確に重ねる。
function sharePosterSVG(bgHref){
  var c=calc(), sc=c.sc, ty=TYPES[c.typeKey], color=ty.color;
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function pct(k){return Math.max(0,Math.min(100,Math.round(sc[k]/3*100)));}
  function short(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s;}
  var measured=measuredAxes().slice().sort(function(a,b){return sc[b]-sc[a];});
  var top=measured.slice(0,3); while(top.length<3) top.push(AXES[top.length]);
  var facility=short(fname||t('ui.diagnosedFacility'),18);
  var place=short((pref?pref+'・':'')+(selCity||svcLabel()),25);
  var title=ty.name.replace(/型$/,'');
  var titleSize=title.length>10?58:(title.length>7?68:78);   // 日本語の既定サイズ（変更なし）
  var medals=[['#F7C53D','#C88700'],['#D7DCE3','#78818D'],['#D89A68','#8E5430']];
  var rows=top.map(function(k,i){
    var y=1084+i*218, p=pct(k), ax=(k==='inu'?t('ax.inu.strong'):AXJA[k]);
    var note=i===0?t('share.note.1'):i===1?t('share.note.2'):t('share.note.3');
    return '<g filter="url(#softShadow)">'+
      '<rect x="68" y="'+y+'" width="944" height="186" rx="30" fill="#FFFDF8" stroke="#E5D8BF" stroke-width="3"/>'+
      '<circle cx="156" cy="'+(y+93)+'" r="61" fill="'+medals[i][0]+'" stroke="'+medals[i][1]+'" stroke-width="5"/>'+
      '<circle cx="156" cy="'+(y+93)+'" r="45" fill="none" stroke="#fff" stroke-width="3" opacity=".72"/>'+
      '<text x="156" y="'+(y+86)+'" text-anchor="middle" font-size="28" font-weight="900" fill="#fff">'+t('share.rankOrd',{n:(i+1)})+'</text>'+
      '<text x="156" y="'+(y+121)+'" text-anchor="middle" font-size="25" font-weight="900" fill="#fff">★</text>'+
      '<rect x="240" y="'+(y+26)+'" width="82" height="82" rx="24" fill="'+shade(TYPES[k].color,87)+'"/>'+
      '<text x="281" y="'+(y+82)+'" text-anchor="middle" font-size="35" font-weight="900" fill="'+TYPES[k].color+'">'+(i+1)+'</text>'+
      '<text x="344" y="'+(y+67)+'" font-size="'+svgFontFit(ax,600,40,20)+'" font-weight="900" fill="#282052">'+esc(ax)+'</text>'+
      '<text x="962" y="'+(y+70)+'" text-anchor="end" font-size="48" font-weight="900" fill="'+TYPES[k].color+'">'+p+'%</text>'+
      '<rect x="344" y="'+(y+90)+'" width="618" height="16" rx="8" fill="#EDE8E4"/>'+
      '<rect x="344" y="'+(y+90)+'" width="'+Math.round(618*p/100)+'" height="16" rx="8" fill="'+TYPES[k].color+'"/>'+
      '<text x="344" y="'+(y+145)+'" font-size="'+svgFontFit(note,618,23,14)+'" font-weight="700" fill="#66616C">'+esc(note)+'</text></g>';
  }).join('');
  var visual=bgHref?'<image href="'+bgHref+'" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>':'<rect width="1080" height="1920" fill="#FFF5DF"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" font-family="-apple-system,\'Hiragino Sans\',\'Noto Sans JP\',sans-serif">'+
    '<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF6" stop-opacity=".28"/><stop offset=".48" stop-color="#FFFDF6" stop-opacity=".05"/><stop offset="1" stop-color="#FFF8E8" stop-opacity=".28"/></linearGradient><filter id="softShadow"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#6C4B25" flood-opacity=".2"/></filter><filter id="textShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#fff" flood-opacity=".95"/></filter></defs>'+
    visual+'<rect width="1080" height="1920" fill="url(#fade)"/>'+
    '<g fill="#FFD24C"><text x="42" y="94" font-size="44">✦</text><text x="1000" y="146" font-size="38">✦</text><text x="58" y="630" font-size="31">◆</text><text x="986" y="820" font-size="38">✦</text></g>'+
    '<path d="M128 58 H818 L780 142 H166 Z" fill="#E53955" filter="url(#softShadow)"/><path d="M128 58L44 110l88 31zM818 58l90 50-91 34z" fill="#B72943"/>'+
    '<text x="473" y="113" text-anchor="middle" font-size="32" font-weight="900" fill="#fff" letter-spacing="3">'+t('share.head')+'</text>'+
    '<g filter="url(#textShadow)"><text x="70" y="205" font-size="'+svgFontFit(t('share.yourFacilityIs'),560,29,15)+'" font-weight="900" fill="#2E2940">'+t('share.yourFacilityIs')+'</text><text x="70" y="278" font-size="'+svgFontFit(t('share.shine'),700,53,24)+'" font-weight="900" fill="'+color+'">'+t('share.shine')+'</text><text x="70" y="366" font-size="'+svgFontFit(title,700,titleSize,26)+'" font-weight="900" fill="#252052">'+esc(title)+'</text><text x="70" y="438" font-size="'+svgFontFit(t('share.typeWas'),820,55,24)+'" font-weight="900" fill="#252052">'+t('share.typeWas')+'</text></g>'+
    '<g filter="url(#softShadow)"><path d="M76 610h440a26 26 0 0 1 26 26v164a26 26 0 0 1-26 26H76a26 26 0 0 1-26-26V636a26 26 0 0 1 26-26z" fill="#FFFDF6" stroke="#D8B96C" stroke-width="5"/><path d="M88 610l26-34 28 34" fill="#FFFDF6" stroke="#D8B96C" stroke-width="5"/><text x="296" y="664" text-anchor="middle" font-size="'+svgFontFit(t('share.diagnosed'),420,23,13)+'" font-weight="800" fill="#706778">'+t('share.diagnosed')+'</text><text x="296" y="725" text-anchor="middle" font-size="'+svgFontFit(facility,420,36,18)+'" font-weight="900" fill="#282052">'+esc(facility)+'</text><text x="296" y="770" text-anchor="middle" font-size="'+svgFontFit(place,420,21,12)+'" font-weight="700" fill="#756D76">'+esc(place)+'</text></g>'+
    '<g filter="url(#softShadow)"><path d="M682 682h314a28 28 0 0 1 28 28v126a28 28 0 0 1-28 28H744l-62 54 14-62a28 28 0 0 1-14-24V710a28 28 0 0 1 28-28z" fill="#FFFDF8"/><text x="852" y="744" text-anchor="middle" font-size="'+svgFontFit(t('share.fromOpenData'),290,25,13)+'" font-weight="900" fill="#4F3A52">'+t('share.fromOpenData')+'</text><text x="852" y="790" text-anchor="middle" font-size="'+svgFontFit(t('share.findStrength'),290,30,14)+'" font-weight="900" fill="'+color+'">'+t('share.findStrength')+'</text><text x="852" y="827" text-anchor="middle" font-size="'+svgFontFit(t('share.noAnswerNeeded'),290,19,11)+'" font-weight="700" fill="#6E6570">'+t('share.noAnswerNeeded')+'</text></g>'+
    '<rect x="42" y="958" width="996" height="862" rx="48" fill="#FFF8E8" fill-opacity=".94" stroke="#E7C66F" stroke-width="5" filter="url(#softShadow)"/>'+
    '<text x="540" y="1038" text-anchor="middle" font-size="33" font-weight="900" fill="#493063">'+t('share.rankTitle')+' <tspan fill="#E53955">TOP3</tspan></text>'+rows+
    '<rect x="68" y="1760" width="944" height="92" rx="28" fill="#5A2B82"/><text x="98" y="1801" font-size="'+svgFontFit(t('share.cta1'),700,24,13)+'" font-weight="900" fill="#fff">'+t('share.cta1')+'</text><text x="98" y="1833" font-size="'+svgFontFit(t('share.cta2'),700,19,11)+'" font-weight="700" fill="#EBDDF3">'+t('share.cta2')+'</text><rect x="816" y="1780" width="164" height="52" rx="26" fill="#FFCA37"/><text x="898" y="1815" text-anchor="middle" font-size="'+svgFontFit(t('share.tag'),150,22,12)+'" font-weight="900" fill="#492168">'+t('share.tag')+'</text></svg>';
}

var SHARE_POSTER_BY_TYPE={
  inu:'assets/share-posters-master/inu.png?v=20260810j',
  penguin:'assets/share-posters-master/penguin.png?v=20260810j',
  fukurou:'assets/share-posters-master/fukurou.png?v=20260810j',
  kitsune:'assets/share-posters-master/kitsune.png?v=20260810j',
  usagi:'assets/share-posters-master/usagi.png?v=20260810j',
  iruka:'assets/share-posters-master/iruka.png?v=20260810j',
  beaver:'assets/share-posters-master/beaver.png?v=20260810j',
  risu:'assets/share-posters-master/risu.png?v=20260810j',
  hachi:'assets/share-posters-master/hachi.png?v=20260810j',
  kuma:'assets/share-posters-master/kuma.png?v=20260810j',
  ookami:'assets/share-posters-master/ookami.png?v=20260810j',
  zou:'assets/share-posters-master/zou.png?v=20260810j'
};
var sharePosterAssetCache={};
// マスター画像はテンプレの縦位置が動物ごとに微妙に違う（本体の上端・紫帯の位置）。
// 実測した「本体上端(top)」「紫帯上端(pb)」でペンギン基準に切り出しを補正し、
// どの動物でも順位メダルが同じ高さに来る＝固定座標で描く文字とズレないようにする。
var SHARE_MASTER_ANCHOR={
  beaver:{top:282,pb:1480}, fukurou:{top:285,pb:1490}, hachi:{top:275,pb:1470},
  inu:{top:271,pb:1469}, iruka:{top:289,pb:1484}, kitsune:{top:265,pb:1471},
  kuma:{top:285,pb:1477}, ookami:{top:285,pb:1487}, penguin:{top:264,pb:1459},
  risu:{top:290,pb:1495}, usagi:{top:284,pb:1485}, zou:{top:262,pb:1462}
};

// 完成ポスターのTOP3欄だけを、実際の診断スコアに連動させる。
// 動物・背景・メダル・施設名など、TOP3の内容以外は元画像をそのまま残す。
var SHARE_TOP3_COPY={
  inu:['職員が長く働ける','定着する職場づくり','を進めています'],
  penguin:['研修やOJTが充実','人を育てる仕組みを','整えています'],
  fukurou:['記録や業務を効率化','デジタルの活用を','進めています'],
  kitsune:['安定した施設運営で','堅実な経営を','続けています'],
  usagi:['新しい挑戦を続け','事業を着実に','伸ばしています'],
  iruka:['地域から選ばれ','高い稼働率を','維持しています'],
  beaver:['専門職が連携し','質の高いケアを','提供しています'],
  risu:['毎日の食事を','楽しみにして','いただけるように'],
  hachi:['地域の皆さまと','支え合いながら','運営しています'],
  kuma:['安心して過ごせる','環境づくりを','大切にしています'],
  ookami:['感染・災害に備える','危機管理の体制を','整えています'],
  zou:['休みやすく続けやすい','働きやすい職場を','大切にしています']
};
var SHARE_TOP3_DETAIL={
  inu:['職員が長く働ける','職場づくりです'],
  penguin:['研修やOJTで人を','しっかり育てています'],
  fukurou:['記録や業務のDXを','進めています'],
  kitsune:['安定した経営と運営を','続けています'],
  usagi:['新しい挑戦で事業を','成長させています'],
  iruka:['高い稼働率で地域に','選ばれています'],
  beaver:['専門職が連携して','質の高いケアを提供'],
  risu:['栄養バランスの取れた','おいしい食事を提供'],
  hachi:['地域とのつながりを','大切にしています！'],
  kuma:['事故防止や感染対策が','しっかりしています'],
  ookami:['感染症や災害への','備えを整えています'],
  zou:['休みやすく続けやすい','働きやすい職場です']
};
// 結果ページ・シェアで使う日本語辞書を、翻訳基盤（i18n）へ後方登録する（宣言後に呼ぶ）。
// 使用箇所は無改造のまま、言語切替時に i18nApplyData→i18nApplyTree が中身を訳へ置き換える。
var I18N_LATE_DICTS=[
  ['dyn.rashisa',      'RASHISA'],
  ['dyn.rashisashort', 'RASHISA_SHORT'],
  ['dyn.strength',     'STRENGTH'],
  ['dyn.axweak',       'AXWEAK'],
  ['dyn.axfix',        'AXFIX'],
  ['dyn.sw',           'SW'],
  ['dyn.solve',        'SOLVE'],
  ['dyn.typeshort',    'TYPESHORT'],
  ['dyn.top3copy',     'SHARE_TOP3_COPY'],
  ['dyn.top3detail',   'SHARE_TOP3_DETAIL']
];
function i18nDictRef(name){ try{ return eval(name); }catch(e){ return undefined; } }
function i18nRegLateTrees2(){ I18N_LATE_DICTS.forEach(function(p){ var d=i18nDictRef(p[1]); if(d!==undefined) i18nRegTree(p[0],d); }); }
i18nRegLateTrees2();
var SHARE_TOP3_FONT='"Hiragino Kaku Gothic ProN","Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif';
function shareTop3Rows(){
  var c=calc(), sc=c.sc;
  var keys=measuredAxes().slice().sort(function(a,b){return sc[b]-sc[a];}).slice(0,3);
  // 通常は公表データの実測軸が3つ以上ある。万一不足しても同じ軸を重複表示しない。
  AXES.forEach(function(k){if(keys.length<3&&keys.indexOf(k)<0) keys.push(k);});
  return keys.slice(0,3).map(function(k){
    return {key:k,label:axStrong(k),score:Math.max(0,Math.min(100,Math.round(sc[k]/3*100))),copy:SHARE_TOP3_COPY[k]};
  });
}

function shareRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// TOP3の軸別ピクトグラム。文字記号ではなく、元ポスターと同じ白抜き／線画で描く。
function drawShareAxisIcon(ctx,key,cx,cy,size,color,rightSide){
  ctx.save();
  ctx.translate(cx-size/2,cy-size/2);
  ctx.scale(size/100,size/100);
  ctx.strokeStyle=rightSide?color:'#fff';
  ctx.fillStyle=rightSide?color:'#fff';
  ctx.lineWidth=7; ctx.lineCap='round'; ctx.lineJoin='round';
  function path(points,close,fill){
    ctx.beginPath(); ctx.moveTo(points[0][0],points[0][1]);
    for(var pi=1;pi<points.length;pi++) ctx.lineTo(points[pi][0],points[pi][1]);
    if(close) ctx.closePath(); if(fill) ctx.fill(); else ctx.stroke();
  }
  function circle(x,y,r,fill){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);fill?ctx.fill():ctx.stroke();}

  if(rightSide&&key==='kuma'){
    // 両手で支えるハート
    ctx.beginPath();ctx.moveTo(50,44);ctx.bezierCurveTo(31,25,17,48,50,70);ctx.bezierCurveTo(83,48,69,25,50,44);ctx.fill();
    ctx.beginPath();ctx.moveTo(12,56);ctx.quadraticCurveTo(22,54,32,69);ctx.lineTo(43,82);ctx.moveTo(88,56);ctx.quadraticCurveTo(78,54,68,69);ctx.lineTo(57,82);ctx.stroke();
  }else if(rightSide&&key==='risu'){
    // フォークとスプーン
    ctx.beginPath();ctx.moveTo(28,18);ctx.lineTo(28,82);ctx.moveTo(18,18);ctx.lineTo(18,40);ctx.quadraticCurveTo(28,48,38,40);ctx.lineTo(38,18);ctx.moveTo(18,29);ctx.lineTo(38,29);ctx.stroke();
    ctx.beginPath();ctx.ellipse(70,32,13,18,0,0,Math.PI*2);ctx.fill();ctx.fillRect(66,45,8,38);
  }else if(rightSide&&key==='hachi'){
    // 家と地域の人々
    path([[14,45],[50,18],[86,45]],false,false);circle(50,50,9,true);circle(30,59,8,true);circle(70,59,8,true);
    ctx.beginPath();ctx.arc(50,82,17,Math.PI,Math.PI*2);ctx.arc(28,84,14,Math.PI,Math.PI*2);ctx.arc(72,84,14,Math.PI,Math.PI*2);ctx.fill();
  }else if(key==='kuma'){
    // 盾＋チェック
    path([[50,10],[82,22],[79,55],[68,75],[50,90],[32,75],[21,55],[18,22]],true,true);
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=8;path([[35,49],[47,61],[67,38]],false,false);ctx.restore();
  }else if(key==='risu'){
    // ご飯茶碗
    circle(35,43,10,true);circle(50,37,11,true);circle(65,43,10,true);
    path([[18,51],[82,51],[74,69],[62,79],[38,79],[26,69]],true,true);ctx.fillRect(34,80,32,7);
  }else if(key==='hachi'){
    // 2人のつながり
    circle(35,35,12,true);circle(66,35,12,true);
    ctx.beginPath();ctx.arc(35,73,20,Math.PI,Math.PI*2);ctx.arc(66,73,20,Math.PI,Math.PI*2);ctx.fill();
  }else if(key==='inu'){
    // 仲間＋ハート
    circle(34,42,11,true);circle(66,42,11,true);
    ctx.beginPath();ctx.arc(34,76,18,Math.PI,Math.PI*2);ctx.arc(66,76,18,Math.PI,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(50,30);ctx.bezierCurveTo(39,17,28,32,50,47);ctx.bezierCurveTo(72,32,61,17,50,30);ctx.fill();
  }else if(key==='penguin'){
    // 研修帽
    path([[12,39],[50,20],[88,39],[50,58]],true,true);ctx.fillRect(29,55,42,17);ctx.beginPath();ctx.moveTo(84,42);ctx.lineTo(84,68);ctx.stroke();circle(84,74,5,true);
  }else if(key==='fukurou'){
    // パソコン
    shareRoundRect(ctx,16,20,68,48,6);ctx.stroke();path([[8,80],[92,80]],false,false);path([[39,68],[35,80],[65,80],[61,68]],false,false);
  }else if(key==='kitsune'){
    // 経営グラフ
    ctx.fillRect(18,60,14,24);ctx.fillRect(43,45,14,39);ctx.fillRect(68,25,14,59);path([[15,53],[43,34],[58,42],[86,14]],false,false);path([[73,14],[86,14],[86,27]],false,false);
  }else if(key==='usagi'){
    // 成長するロケット
    ctx.beginPath();ctx.moveTo(50,12);ctx.quadraticCurveTo(76,31,66,66);ctx.lineTo(50,80);ctx.lineTo(34,66);ctx.quadraticCurveTo(24,31,50,12);ctx.fill();
    circle(50,40,8,false);path([[35,60],[22,76],[37,74]],true,true);path([[65,60],[78,76],[63,74]],true,true);path([[43,82],[50,94],[57,82]],true,true);
  }else if(key==='iruka'){
    // ベッド／稼働
    ctx.fillRect(14,43,12,39);ctx.fillRect(24,52,62,26);ctx.fillRect(26,43,22,14);path([[14,82],[14,31]],false,false);path([[86,82],[86,51]],false,false);
  }else if(key==='beaver'){
    // 専門職の医療十字
    circle(50,50,36,false);ctx.fillRect(43,25,14,50);ctx.fillRect(25,43,50,14);
  }else if(key==='ookami'){
    // 危機管理の警告三角
    path([[50,12],[90,84],[10,84]],true,false);ctx.beginPath();ctx.moveTo(50,35);ctx.lineTo(50,59);ctx.stroke();circle(50,72,4,true);
  }else{
    // 働きやすさの時計
    circle(50,50,36,false);path([[50,28],[50,52],[68,63]],false,false);path([[31,12],[18,25]],false,false);path([[69,12],[82,25]],false,false);
  }
  ctx.restore();
}

function drawShareTop3(ctx){
  var rows=shareTop3Rows();
  var centers=[982,1165,1348];
  rows.forEach(function(row,i){
    var cy=centers[i], col=TYPES[row.key].color, stars=Math.max(0,Math.min(5,Math.round(row.score/20)));
    // 見出し・星・説明の間隔を個別に管理し、各行の中で均等に見えるよう整える。
    var labelY=cy-34, starsY=cy+8, detailY=cy+50;

    // 空欄マスターへ診断結果を直接描画する（旧内容の消去・画像の切り貼りは行わない）。
    ctx.beginPath(); ctx.arc(350,cy,58,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
    drawShareAxisIcon(ctx,row.key,350,cy,82,col,false);

    // 軸名と診断スコア（星）
    ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.fillStyle='#17143f';
    var labelSize=row.label.length>7?36:44;
    ctx.font='900 '+labelSize+'px '+SHARE_TOP3_FONT;
    ctx.fillText(row.label,458,labelY);
    ctx.font='900 36px '+SHARE_TOP3_FONT;
    ctx.fillStyle=col;
    ctx.fillText('★★★★★'.slice(0,stars),458,starsY);
    if(stars<5){
      var used=ctx.measureText('★★★★★'.slice(0,stars)).width;
      ctx.fillStyle='#ddd7cf'; ctx.fillText('★★★★★'.slice(stars),458+used,starsY);
    }
    var detail=SHARE_TOP3_DETAIL[row.key];
    ctx.fillStyle='#272331';
    // 最下段(3位)は下の「高評価」帯が近く、2行目が枠からはみ出すので詰めて上へ寄せる
    var isLastRow=(i===rows.length-1);
    var dBaseY=isLastRow?cy+26:detailY, dGap=isLastRow?22:28, dStart=isLastRow?20:22;
    detail.forEach(function(line,di){
      var detailSize=dStart;
      ctx.font='700 '+detailSize+'px '+SHARE_TOP3_FONT;
      while(detailSize>18&&ctx.measureText(line).width>286){
        detailSize--; ctx.font='700 '+detailSize+'px '+SHARE_TOP3_FONT;
      }
      ctx.fillText(line,458,dBaseY+di*dGap);
    });
    // 軸ごとの説明
    ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillStyle='#242035';
    drawShareAxisIcon(ctx,row.key,820,cy,100,col,true);
    // 参考画像と同じく、ピクトグラムの右へ左揃え・3行で配置する。
    var rightTextX=910, rightTextMaxWidth=235;
    var rightLineY=[cy-42,cy,cy+42];
    row.copy.forEach(function(line,li){
      var rightFontSize=25;
      ctx.font='800 '+rightFontSize+'px '+SHARE_TOP3_FONT;
      while(rightFontSize>18&&ctx.measureText(line).width>rightTextMaxWidth){
        rightFontSize--;
        ctx.font='800 '+rightFontSize+'px '+SHARE_TOP3_FONT;
      }
      ctx.fillText(line,rightTextX,rightLineY[li]);
    });
  });
}

function loadFixedBearPoster(){
  var typeKey=calc().typeKey;
  var path=SHARE_POSTER_BY_TYPE[typeKey]||SHARE_POSTER_BY_TYPE.kuma;
  if(sharePosterAssetCache[path]) return Promise.resolve(sharePosterAssetCache[path]);
  return fetch(path).then(function(r){
    if(!r.ok) throw new Error('share poster '+r.status);
    return r.blob();
  }).then(function(blob){
    return new Promise(function(resolve,reject){
      var rd=new FileReader();
      rd.onload=function(){ sharePosterAssetCache[path]=rd.result; resolve(rd.result); };
      rd.onerror=reject;
      rd.readAsDataURL(blob);
    });
  });
}

function fixedBearResultUri(){
  var shareFontReady=(document.fonts&&document.fonts.load)
    ? Promise.all([document.fonts.load('900 40px "Noto Sans JP"'),document.fonts.load('700 24px "Noto Sans JP"')]).catch(function(){})
    : Promise.resolve();
  return Promise.all([loadFixedBearPoster(),shareFontReady]).then(function(parts){
    var bg=parts[0];
    return new Promise(function(resolve,reject){
      var img=new Image();
      img.onload=function(){
        var typeKey=calc().typeKey;
        var cv=document.createElement('canvas');
        cv.width=1180; cv.height=1780;
        var ctx=cv.getContext('2d');

        // 12種類共通の空欄マスターを、上下の黒余白だけ除いて描画する。
        // 元画像の実ポスター開始位置（197/590）から切り出し、紫色フッターの下端まで含める。
        // ペンギン基準(top264/pb1459→現行の切り出し285/1287)にそろえる補正。
        var anchor=SHARE_MASTER_ANCHOR[typeKey]||SHARE_MASTER_ANCHOR.kuma;
        var span=anchor.pb-anchor.top;                 // 本体上端〜紫帯上端の実測高さ
        var sourceH=span*1.07685;                       // ペンギンで1287になる係数
        var sourceY=anchor.top+0.016320*sourceH;        // 上端から一定量だけ内側で切り出す
        ctx.drawImage(img,0,sourceY,img.width,sourceH,0,0,1180,1780);

        // 元ポスターの空欄へ直接描画する。背景を塗り直さないため、後貼り感を出さない。
        // 長い施設名は、読みやすい位置で最大2行に均等分割して収める。
        var facilityName=String(anon?'ある介護施設':(fname||'診断した施設')).replace(/[\r\n]+/g,' ').trim();
        // 紫の見出しと建物イラストの間にある、文字専用の余白だけを使用する。
        var nameBox={x:76,y:620,w:456,h:76};
        var nameFont='"Noto Sans JP","Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif';
        var nameSize=34, minNameSize=18, nameLines=[];
        function balancedFacilityLines(size){
          ctx.font='800 '+size+'px '+nameFont;
          if(ctx.measureText(facilityName).width<=nameBox.w) return [facilityName];
          var chars=Array.from(facilityName), best=null;
          for(var cut=1;cut<chars.length;cut++){
            var left=chars.slice(0,cut).join('').trim(), right=chars.slice(cut).join('').trim();
            var lw=ctx.measureText(left).width, rw=ctx.measureText(right).width;
            if(lw>nameBox.w||rw>nameBox.w) continue;
            var badBreak=/^[・、。，．）)]/.test(right)||/[（(]$/.test(left);
            var score=Math.max(lw,rw)+Math.abs(lw-rw)*0.32+(badBreak?1000:0);
            if(!best||score<best.score) best={score:score,lines:[left,right]};
          }
          return best?best.lines:[];
        }
        for(;nameSize>=minNameSize;nameSize-=1){
          nameLines=balancedFacilityLines(nameSize);
          if(nameLines.length) break;
        }
        if(!nameLines.length){
          nameSize=minNameSize;
          ctx.font='800 '+nameSize+'px '+nameFont;
          var clipped=Array.from(facilityName), ellipsis='…';
          while(clipped.length&&ctx.measureText(clipped.join('')+ellipsis).width>nameBox.w*2) clipped.pop();
          var mid=Math.ceil(clipped.length/2);
          nameLines=[clipped.slice(0,mid).join(''),clipped.slice(mid).join('')+ellipsis];
        }

        // 元画像に備わる紙面・枠・建物イラストを残したまま文字だけを置く。
        ctx.save();
        ctx.fillStyle='#282052'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font='800 '+nameSize+'px '+nameFont;
        var nameLineHeight=nameSize*1.1;
        var firstNameY=nameBox.y+nameBox.h/2-(nameLines.length-1)*nameLineHeight/2;
        nameLines.forEach(function(line,li){ ctx.fillText(line,nameBox.x+nameBox.w/2,firstNameY+li*nameLineHeight); });
        ctx.restore();
        drawShareTop3(ctx);
        resolve(cv.toDataURL('image/png'));
      };
      img.onerror=reject;
      img.src=bg;
    });
  });
}

function buildShareCardPreview(){
  var w=document.getElementById('shareCardWrap');
  if(!w) return;
  w.classList.add('fixed-bear-poster');
  w.innerHTML='<div style="height:100%;display:grid;place-items:center;background:#fff8e8;color:#6b6471;font-weight:800">'+t('share.making')+'</div>';
  fixedBearResultUri().then(function(uri){
    w.innerHTML='<img alt="'+t('share.imgAlt',{fac:String(fname||t('ui.diagnosedFacility'))})+'" src="'+uri+'">';
  }).catch(function(){
    w.innerHTML='<div style="height:100%;display:grid;place-items:center;background:#fff8e8;color:#6b6471;font-weight:800">'+t('share.failed')+'</div>';
  });
}
function downloadCard(doneMsg){
  fixedBearResultUri().then(function(uri){
    var img=new Image();
    img.onload=function(){
      var cv=document.createElement('canvas'); cv.width=1180; cv.height=1780;
      cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
      cv.toBlob(function(blob){
        if(!blob){ alert('画像の生成に失敗しました。表示中のカードをスクリーンショットでシェアしてください。'); return; }
        var a=document.createElement('a'); a.download='ケア図鑑_'+(fname||'診断結果')+'.png'; a.href=URL.createObjectURL(blob);
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
        if(doneMsg) alert(doneMsg);
      },'image/png');
    };
    img.onerror=function(){ alert('画像の生成に失敗しました。表示中のカードをスクリーンショットでシェアしてください。'); };
    img.src=uri;
  }).catch(function(){ alert('画像の生成に失敗しました。表示中のカードをスクリーンショットでシェアしてください。'); });
}

function share(kind){
  const t = TYPES[calc().typeKey];
  const url = resultUrl();
  const who = anon ? `ある施設（${pref}）` : `${fname}（${pref}）`;
  const text = `介護施設を"動物12タイプ"に無料診断してみた🐾\n${who}の結果は【${t.name}】！\n「${t.catch}」\n\n施設名を選ぶだけ・質問ゼロ・登録不要👇\nあなたの施設は何タイプ？ #ケア図鑑`;
  if(kind==='x'){ window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(location.origin+'/'),'_blank'); }
  else if(kind==='line'){ window.open('https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(url),'_blank'); }
  else if(kind==='ig'){ downloadCard('結果カードを保存しました。開いたInstagramのストーリーズに貼り付けてシェアしてください。'); window.open('https://www.instagram.com/','_blank'); }
  else { downloadCard(); }
}

function unlock(){
  const v=document.getElementById('gemail').value.trim();
  const err=document.getElementById('gemailErr');
  if(v===''){ if(err) err.style.display='none'; skipGate(); return; }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)){ if(err) err.style.display='block'; return; }
  if(err) err.style.display='none';
  if(window._leadSending) return; window._leadSending=true;   // 二重送信防止：連打で postLead が複数回飛ぶのを防ぐ
  email = v; markReg(v);
  postLead({email:v, source:'gate'});
  window._leadSending=false;
  bumpCount(); refreshCount();
  runLoading();
}
function skipGate(){ email=''; bumpCount(); refreshCount(); runLoading(); }
// build teaser + zukan
function starPoints(cx,cy,spikes,outer,inner){
  let p=[],s=Math.PI/spikes,a=-Math.PI/2;
  for(let i=0;i<spikes*2;i++){let r=i%2?inner:outer;p.push((cx+Math.cos(a)*r).toFixed(1)+','+(cy+Math.sin(a)*r).toFixed(1));a+=s;}
  return p.join(' ');
}
function sv(inner){return '<svg viewBox="0 0 100 100">'+inner+'</svg>';}
function animalSVG(key){
  if(TYPE_IMG[key]){ return '<img class="animal-img" src="'+TYPE_IMG[key]+'" alt="">'; }
  switch(key){
    case 'kitsune': return sv('<polygon points="18.0,9.0 40.0,42.0 10.0,40.0" fill="#c4543a"/><polygon points="24.0,19.0 37.0,42.0 16.0,40.0" fill="#e17055"/><polygon points="82.0,9.0 90.0,40.0 60.0,42.0" fill="#c4543a"/><polygon points="76.0,19.0 84.0,40.0 63.0,42.0" fill="#e17055"/><polygon points="10.0,40.0 90.0,40.0 50.0,55.0" fill="#f0935f"/><polygon points="10.0,40.0 50.0,55.0 50.0,93.0" fill="#e2674c"/><polygon points="90.0,40.0 50.0,55.0 50.0,93.0" fill="#d05a40"/><polygon points="27.0,56.0 50.0,60.0 50.0,87.0" fill="#f7ece3"/><polygon points="73.0,56.0 50.0,60.0 50.0,87.0" fill="#efddd2"/><circle cx="37" cy="54" r="2.7" fill="#3a2418"/><circle cx="63" cy="54" r="2.7" fill="#3a2418"/><polygon points="50.0,71.0 45.5,77.0 54.5,77.0" fill="#2a1810"/>');
    case 'usagi': return sv('<polygon points="31.0,5.0 42.0,48.0 25.0,47.0" fill="#e487b6"/><polygon points="32.0,12.0 38.0,46.0 30.0,45.0" fill="#fbd9e8"/><polygon points="69.0,5.0 75.0,47.0 58.0,48.0" fill="#e487b6"/><polygon points="68.0,12.0 70.0,46.0 62.0,45.0" fill="#fbd9e8"/><polygon points="26.0,46.0 74.0,46.0 50.0,57.0" fill="#f7b8d4"/><polygon points="26.0,46.0 31.0,74.0 50.0,57.0" fill="#ef93bd"/><polygon points="31.0,74.0 44.0,88.0 50.0,57.0" fill="#e87fb1"/><polygon points="74.0,46.0 69.0,74.0 50.0,57.0" fill="#ec8ab8"/><polygon points="69.0,74.0 56.0,88.0 50.0,57.0" fill="#e375aa"/><polygon points="44.0,88.0 56.0,88.0 50.0,57.0" fill="#e681b0"/><polygon points="40.0,64.0 50.0,62.0 60.0,64.0 50.0,84.0" fill="#ffffff"/><polygon points="50.0,62.0 60.0,64.0 50.0,84.0" fill="#fbe6f0"/><circle cx="40" cy="60" r="2.7" fill="#6a2a4e"/><circle cx="60" cy="60" r="2.7" fill="#6a2a4e"/><polygon points="50.0,69.0 46.0,74.0 54.0,74.0" fill="#c44d86"/>');
    case 'fukurou': return sv('<polygon points="24.0,11.0 42.0,40.0 17.0,37.0" fill="#5546c9"/><polygon points="76.0,11.0 83.0,37.0 58.0,40.0" fill="#5546c9"/><polygon points="50.0,20.0 68.4,26.5 79.7,43.5 79.7,64.5 68.4,81.5 50.0,88.0 31.6,81.5 20.3,64.5 20.3,43.5 31.6,26.5" fill="#6c5ce7"/><polygon points="50.0,54.0 50.0,20.0 68.4,26.5" fill="#7a6cf0"/><polygon points="50.0,54.0 68.4,26.5 79.7,43.5" fill="#7a6cf0"/><polygon points="50.0,54.0 79.7,43.5 79.7,64.5" fill="#7a6cf0"/><polygon points="50.0,54.0 79.7,64.5 68.4,81.5" fill="#7a6cf0"/><polygon points="50.0,54.0 68.4,81.5 50.0,88.0" fill="#7a6cf0"/><polygon points="50.0,54.0 50.0,88.0 31.6,81.5" fill="#7a6cf0"/><polygon points="50.0,54.0 31.6,81.5 20.3,64.5" fill="#5e50d6"/><polygon points="50.0,54.0 20.3,64.5 20.3,43.5" fill="#5e50d6"/><polygon points="50.0,54.0 20.3,43.5 31.6,26.5" fill="#5e50d6"/><polygon points="50.0,54.0 31.6,26.5 50.0,20.0" fill="#5e50d6"/><polygon points="50.0,40.0 72.0,62.0 50.0,82.0 28.0,62.0" fill="#bcb4f6"/><circle cx="39" cy="49" r="10" fill="#fff"/><circle cx="61" cy="49" r="10" fill="#fff"/><circle cx="39" cy="49" r="4.6" fill="#2a2150"/><circle cx="61" cy="49" r="4.6" fill="#2a2150"/><polygon points="50.0,54.0 45.0,62.0 55.0,62.0" fill="#f6b93b"/>');
    case 'iruka': return sv('<circle cx="24" cy="34" r="14" fill="#00b8d4"/><circle cx="76" cy="34" r="14" fill="#00b8d4"/><circle cx="24" cy="34" r="7.5" fill="#8fe3ef"/><circle cx="76" cy="34" r="7.5" fill="#8fe3ef"/><polygon points="50,24 72,36 78,58 62,80 38,80 22,58 28,36" fill="#00b8d4"/><polygon points="50,24 72,36 50,52 28,36" fill="#33c6dd"/><circle cx="40" cy="46" r="3" fill="#123138"/><circle cx="60" cy="46" r="3" fill="#123138"/><polygon points="50,52 60,60 55,72 50,75 45,72 40,60" fill="#2a4750"/>');
    case 'inu': return sv('<polygon points="15.0,30.0 32.0,40.0 26.0,66.0 14.0,54.0" fill="#cf800e"/><polygon points="85.0,30.0 68.0,40.0 74.0,66.0 86.0,54.0" fill="#cf800e"/><polygon points="26.0,40.0 74.0,40.0 50.0,27.0" fill="#ffc24d"/><polygon points="26.0,40.0 50.0,52.0 20.0,58.0" fill="#f3a623"/><polygon points="74.0,40.0 50.0,52.0 80.0,58.0" fill="#e69313"/><polygon points="26.0,40.0 74.0,40.0 80.0,58.0 50.0,80.0 20.0,58.0" fill="#f5a623"/><polygon points="36.0,58.0 64.0,58.0 50.0,80.0" fill="#ffe2a6"/><circle cx="40" cy="48" r="2.9" fill="#4a3318"/><circle cx="60" cy="48" r="2.9" fill="#4a3318"/><polygon points="50.0,62.0 44.5,69.0 55.5,69.0" fill="#3a2814"/>');
    case 'penguin': return sv('<polygon points="40,90 48,82 47,96" fill="#e8912a"/><polygon points="60,90 52,82 53,96" fill="#e8912a"/><polygon points="50,12 72,26 80,52 72,80 50,90 28,80 20,52 28,26" fill="#3f7aa6"/><polygon points="50,12 72,26 80,52 50,52 20,52 28,26" fill="#4a89b8"/><polygon points="50,30 66,46 60,80 50,86 40,80 34,46" fill="#f7fbff"/><polygon points="50,50 57,56 50,63 43,56" fill="#f2a900"/><circle cx="42" cy="42" r="2.8" fill="#22303a"/><circle cx="58" cy="42" r="2.8" fill="#22303a"/>');
    case 'beaver': return sv('<polygon points="26,20 36,32 22,34" fill="#8a5d31"/><polygon points="74,20 78,34 64,32" fill="#8a5d31"/><polygon points="50,22 74,34 78,58 62,78 38,78 22,58 26,34" fill="#a9743f"/><polygon points="50,22 74,34 50,50 26,34" fill="#c08d54"/><polygon points="40,56 60,56 56,72 44,72" fill="#f2e2cf"/><polygon points="50,58 45,64 55,64" fill="#3a2414"/><polygon points="47,68 50,80 47,81" fill="#ffffff"/><polygon points="53,68 50,80 53,81" fill="#ffffff"/><circle cx="41" cy="46" r="2.9" fill="#3a2414"/><circle cx="59" cy="46" r="2.9" fill="#3a2414"/>');
    case 'risu': return sv('<polygon points="16,72 4,46 22,50 30,74" fill="#ecc069"/><polygon points="18,70 12,52 24,55 26,70" fill="#d99a2b"/><polygon points="32,22 40,34 28,34" fill="#b87f1f"/><polygon points="68,22 72,34 60,34" fill="#b87f1f"/><polygon points="50,24 72,36 74,58 58,76 42,76 26,58 28,36" fill="#d99a2b"/><polygon points="50,24 72,36 50,50 28,36" fill="#ecb85a"/><polygon points="40,56 60,56 54,72 46,72" fill="#f7e6c4"/><polygon points="50,58 46,63 54,63" fill="#4a3318"/><polygon points="47,66 50,74 47,75" fill="#ffffff"/><polygon points="53,66 50,74 53,75" fill="#ffffff"/><circle cx="41" cy="46" r="2.9" fill="#4a3318"/><circle cx="59" cy="46" r="2.9" fill="#4a3318"/>');
    case 'hachi': return sv('<polygon points="24,42 22,28 34,38" fill="#3a3320"/><polygon points="76,42 78,28 66,38" fill="#3a3320"/><polygon points="12,50 30,42 30,68 15,64" fill="#d3ecf6"/><polygon points="88,50 70,42 70,68 85,64" fill="#d3ecf6"/><polygon points="50,34 70,44 74,62 62,82 38,82 26,62 30,44" fill="#f2a900"/><polygon points="34,52 66,52 65,60 35,60" fill="#2a2417"/><polygon points="38,68 62,68 59,76 41,76" fill="#2a2417"/><circle cx="42" cy="45" r="2.8" fill="#2a2417"/><circle cx="58" cy="45" r="2.8" fill="#2a2417"/>');
    case 'kuma': return sv('<circle cx="28" cy="28" r="11" fill="#8d6e63"/><circle cx="72" cy="28" r="11" fill="#8d6e63"/><circle cx="28" cy="28" r="5.5" fill="#6f544b"/><circle cx="72" cy="28" r="5.5" fill="#6f544b"/><polygon points="50,20 74,32 80,54 66,78 34,78 20,54 26,32" fill="#8d6e63"/><polygon points="50,20 74,32 50,50 26,32" fill="#a68a7f"/><polygon points="38,58 62,58 56,74 44,74" fill="#d7c4b8"/><polygon points="50,60 45,66 55,66" fill="#2a1c15"/><circle cx="40" cy="46" r="3" fill="#2a1c15"/><circle cx="60" cy="46" r="3" fill="#2a1c15"/>');
    case 'ookami': return sv('<polygon points="20,14 40,38 16,40" fill="#46586a"/><polygon points="80,14 84,40 60,38" fill="#46586a"/><polygon points="26,22 40,38 24,40" fill="#5c7080"/><polygon points="74,22 76,40 60,38" fill="#5c7080"/><polygon points="50,30 74,40 76,58 62,72 50,86 38,72 24,58 26,40" fill="#5c7080"/><polygon points="50,30 74,40 50,54 26,40" fill="#7d909e"/><polygon points="42,60 58,60 50,86" fill="#cdd6dd"/><polygon points="50,64 46,69 54,69" fill="#20272e"/><circle cx="41" cy="48" r="2.9" fill="#20272e"/><circle cx="59" cy="48" r="2.9" fill="#20272e"/>');
    case 'zou': return sv('<polygon points="18,30 6,54 24,72 34,50" fill="#538a3d"/><polygon points="82,30 94,54 76,72 66,50" fill="#538a3d"/><polygon points="50,24 70,34 72,60 58,64 58,88 42,88 42,64 28,60 30,34" fill="#6aa84f"/><polygon points="50,24 70,34 50,50 30,34" fill="#85c06a"/><polygon points="44,64 40,74 46,73" fill="#f4f0e2"/><polygon points="56,64 60,74 54,73" fill="#f4f0e2"/><circle cx="41" cy="46" r="3" fill="#2c3f22"/><circle cx="59" cy="46" r="3" fill="#2c3f22"/>');
    default: return sv('<circle cx="50" cy="50" r="30" fill="#ccc"/>');
  }
}
const GROUPS = [
  {title:'人を活かすタイプ',     accent:'#f5a623', tint:'#fdf3e3', members:['inu','penguin','beaver','zou']},
  {title:'のばす・ケアの質タイプ', accent:'#1aa37a', tint:'#e7f6f0', members:['kitsune','usagi','iruka','risu']},
  {title:'地域・守りタイプ',       accent:'#6c5ce7', tint:'#efe9fb', members:['hachi','fukurou','kuma','ookami']},
];
// 全国実測シェア（介護サービス情報公表システム 全国47都道府県・約22万件／nation_type_dist.json）
const NATIONSHARE={inu:0.7,penguin:7.5,fukurou:0.3,kitsune:0.0,usagi:0.9,iruka:20.8,beaver:0.4,risu:15.5,hachi:4.1,kuma:2.7,ookami:39.1,zou:8.0};
function renderZukan(){
  const el=document.getElementById('zukanGroups');
  if(!el) return;
  var allKeys = GROUPS.reduce(function(a,g){ return a.concat(g.members); },[]);
  var cards = allKeys.map(function(k){
      var t=TYPES[k];
      var col=(t&&t.color)||'#7B6EF6';
      var soft=shade(col,90), ink=shade(col,-34);
      var pct='';
      return '<article class="zukan-card" onclick="showProfile(\''+k+'\')" style="background:#fff;border-radius:26px;box-shadow:0 16px 40px -22px rgba(50,45,90,.26);overflow:hidden;display:flex;flex-direction:column;cursor:pointer;text-align:left">'+
        '<div style="background:'+soft+';padding:clamp(22px,3vw,28px);display:flex;align-items:center;gap:16px">'+
          '<div class="zukan-badge" style="width:60px;height:60px;flex:0 0 auto;border-radius:18px;background:'+col+';display:grid;place-items:center;box-shadow:0 8px 18px -8px '+col+'e6">'+animalSVG(k)+'</div>'+
          '<div><div style="font-weight:700;color:'+ink+';font-size:.86rem">'+t.axisJa+window.t('zukan.typeSuffix',null,'タイプ')+pct+'</div><div style="font-family:\'Zen Maru Gothic\';font-weight:900;font-size:clamp(1.35rem,2.6vw,1.65rem);line-height:1.25">'+t.name+'</div></div>'+
        '</div>'+
        '<div style="padding:clamp(22px,3vw,28px);flex:1">'+
          '<p style="margin:0;font-size:1rem;line-height:1.8;color:#606675">'+t.desc+'</p>'+
        '</div>'+
      '</article>';
  }).join('');
  el.innerHTML = '<div class="band tgroup"><div class="wrap"><div class="tgroup-cards">'+cards+'</div></div></div>';
}
// ===== 追加機能：共有リンク・前回結果・社会的証明 =====
// 共有・復元用に、12軸スコアを各軸0〜4の5段階・12桁で保持する。
function ansToCode(){ var c=calc(); return AXES.map(function(k){ var idx=Math.round((1 - c.sc[k]/3)/0.25); return Math.max(0,Math.min(4,idx)); }).join(''); }
function codeToAns(q){ autoSc={}; AXES.forEach(function(k,i){ var d=parseInt(q[i],10); if(isNaN(d)||d<0||d>4) d=4; autoSc[k]=(1 - d*0.25)*3; }); }
function resultParams(){ var p='q='+ansToCode()+'&pf='+Math.max(0,PREFS.indexOf(pref)); if(fname){ p+='&fn='+encodeURIComponent(fname); if(selCd) p+='&cd='+encodeURIComponent(selCd); } return p; }
function resultUrl(){ return location.origin+'/?'+resultParams(); }
function applyState(q,pf,fn,cd){ codeToAns(q); pref=(pf>=0&&pf<PREFS.length)?PREFS[pf]:PREFS[0]; var ps=document.getElementById('pref'); if(ps) ps.value=pref; if(typeof syncPrefChips==='function') syncPrefChips(); anon=false; fname=fn||'診断した施設'; faddr=''; email=''; freeWorry=''; freeGood=''; selCorp=null; selCd=cd||''; selSvc=''; selCity=''; }
function restoreFromUrl(){ try{ var sp=new URLSearchParams(location.search); var q=sp.get('q'), fn=decodeURIComponent(sp.get('fn')||''); if(!q||!/^[0-4]{12}$/.test(q)||!fn||sp.get('an')==='1') return false; applyState(q, parseInt(sp.get('pf'),10), fn, decodeURIComponent(sp.get('cd')||'')); ensurePrefData().then(function(){ hydrateSelFromFac(); showResult(); }); return true; }catch(e){ return false; } }
var _toastTimer=null;
function showToast(msg){ var t=document.getElementById('appToast'); if(!t){ t=document.createElement('div'); t.id='appToast'; t.setAttribute('role','status'); t.setAttribute('aria-live','polite'); document.body.appendChild(t); } t.textContent=msg; void t.offsetWidth; t.classList.add('show'); if(_toastTimer) clearTimeout(_toastTimer); _toastTimer=setTimeout(function(){ t.classList.remove('show'); },2600); }
function copyLink(){ var u=resultUrl(); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(u).then(function(){ showToast('結果のリンクをコピーしました！SNSやメールに貼り付けて共有できます。'); }, function(){ prompt('このリンクをコピーしてください：', u); }); } else { prompt('このリンクをコピーしてください：', u); } }
function saveLast(){ try{ localStorage.setItem('shindan_last', JSON.stringify({q:ansToCode(), pf:PREFS.indexOf(pref), fn:anon?'':fname, cd:anon?'':selCd})); }catch(e){} }
// ===== 経年比較：診断のたびに履歴を残し、前回からの変化を表示 =====
function histKey(){ return 'shindan_hist_'+(anon?'_anon':(fname||'施設')); }
function loadHist(){ try{ var s=localStorage.getItem(histKey()); var a=s?JSON.parse(s):[]; return Array.isArray(a)?a.filter(function(e){return e&&/^[0-4]{12}$/.test(e.q);}):[]; }catch(e){ return []; } }
function pushHist(){ try{ var h=loadHist(); var code=ansToCode(); if(h.length&&h[h.length-1].q===code) return; h.push({q:code,d:i18nDate(new Date()),tk:calc().typeKey}); if(h.length>8) h=h.slice(-8); localStorage.setItem(histKey(), JSON.stringify(h)); }catch(e){} }
function axPct(code,k){ var i=AXES.indexOf(k); var d=parseInt(code[i],10); if(isNaN(d))d=4; return (4-d)*25; }
function renderTrend(){
  var head=document.getElementById('secTrend'), box=document.getElementById('trendBox');
  if(!head||!box) return;
  var h=loadHist(); var cur=ansToCode();
  // 直近の「今回と違う」過去回を前回とみなす
  var prev=null; for(var i=h.length-1;i>=0;i--){ if(h[i].q!==cur){ prev=h[i]; break; } }
  if(!prev){ head.style.display='none'; box.style.display='none'; return; }
  var n=h.length + (h.length&&h[h.length-1].q===cur?0:1); // 今回を含む回数の目安
  var rows=AXES.map(function(k){ return {k:k,now:axPct(cur,k),was:axPct(prev.q,k)}; })
    .map(function(o){ o.delta=o.now-o.was; return o; });
  var changed=rows.filter(function(o){return o.delta!==0;}).sort(function(a,b){return Math.abs(b.delta)-Math.abs(a.delta);});
  var ups=changed.filter(function(o){return o.delta>0;}), downs=changed.filter(function(o){return o.delta<0;});
  var lead;
  if(!changed.length){ lead=t('trend.nochange'); }
  else { var parts=[];
    if(ups.length) parts.push(t('trend.up',{ax:AXJA[ups[0].k],d:ups[0].delta}));
    if(downs.length) parts.push(t('trend.down',{ax:AXJA[downs[0].k],d:downs[0].delta}));
    lead=t('trend.lead',{d:prev.d,parts:parts.join('、'),tail:(ups.length>=downs.length?t('trend.tail.up'):t('trend.tail.down'))}); }
  var rowsHtml=changed.slice(0,6).map(function(o){
    var dir=o.delta>0?'up':(o.delta<0?'down':'flat'); var sign=o.delta>0?'+':'';
    var c=(TYPES[o.k]&&TYPES[o.k].color)||'var(--p1)';
    return '<div class="trend-row"><span class="tn" style="color:'+c+'">'+AXJA[o.k]+'</span>'+
      '<span class="tbar"><i style="width:'+o.now+'%;background:'+c+'"></i></span>'+
      '<span class="td '+dir+'">'+t('trend.rowDelta',{sign:sign,d:o.delta})+'</span></div>';
  }).join('');
  box.innerHTML='<div class="trend-head"><b>'+t('trend.head',{n:n})+'</b><span class="tdate">'+t('trend.date',{d:prev.d,type:(TYPES[prev.tk]?TYPES[prev.tk].name:'—')})+'</span></div>'+
    '<p class="trend-lead">'+lead+'</p>'+
    (rowsHtml?'<div class="trend-rows">'+rowsHtml+'</div>':'<p class="trend-none">'+t('trend.none')+'</p>');
  head.style.display=''; box.style.display='';
}
function showLastLink(){ try{ var s=localStorage.getItem('shindan_last'); var el=document.getElementById('lastResultLink'); if(!s||!el) return; var d=JSON.parse(s); if(!d||!/^[0-4]{12}$/.test(d.q)) return; el.style.display='inline-block'; el.onclick=function(){ applyState(d.q,d.pf,d.fn,d.cd); ensurePrefData().then(function(){ hydrateSelFromFac(); showResult(); }); }; }catch(e){} }
function diagCount(){ var base=12480; try{ return base+parseInt(localStorage.getItem('shindan_count')||'0',10); }catch(e){ return base; } }
function bumpCount(){ try{ localStorage.setItem('shindan_count',(parseInt(localStorage.getItem('shindan_count')||'0',10)+1)+''); }catch(e){} }
function fmtNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,','); }
function refreshCount(){ var els=document.querySelectorAll('.diagcount'); for(var i=0;i<els.length;i++){ els[i].textContent=fmtNum(diagCount()); } }
// ===== 更に追加機能：演出・シミュレーター・共有・埋め込み =====
function shareText(){ var t=TYPES[calc().typeKey]; var who=anon?('ある施設（'+pref+'）'):(fname+'（'+pref+'）'); return who+'は「'+t.name+'」でした！'+t.catch+'\nあなたの施設も診断してみて → #ケア図鑑'; }
function nativeShare(){ if(navigator.share){ navigator.share({title:'ケア図鑑', text:shareText(), url:resultUrl()}).catch(function(){}); } else { copyLink(); } }
function runLoading(){ go('loading'); var msgs=['公表データを読み込み中…','12の力を計算中…','地域データと照合中…','タイプを判定しています…']; var i=0, sub=document.getElementById('loadSub'); if(sub) sub.textContent=msgs[0]; var iv=setInterval(function(){ i++; if(sub&&i<msgs.length) sub.textContent=msgs[i]; },420); setTimeout(function(){ clearInterval(iv); showResult(); },1700); }
function copyEmbed(){ var ta=document.getElementById('embedCode'); if(!ta) return; if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(ta.value).then(function(){alert('埋め込みコードをコピーしました！HPや採用ページに貼り付けてください。');},function(){ta.select();}); } else { ta.select(); } }
window.addEventListener('scroll', function(){ var f=document.getElementById('fab'); if(f) f.classList.toggle('show', (window.pageYOffset||document.documentElement.scrollTop)>600); });
function renderMega(){
  var el=document.getElementById('megaMenu'); if(!el) return;
  var cards = GROUPS.reduce(function(acc,g){
    g.members.forEach(function(k){ acc.push({k:k, accent:g.accent}); });
    return acc;
  }, []).map(function(c){var t=TYPES[c.k];
    var col=(t&&t.color)||c.accent, soft=shade(col,90), ink=shade(col,-34), chipbg=shade(col,84);
    return '<div class="mega-card" style="background:'+soft+';border:1px solid '+shade(col,80)+'" onclick="showProfile(\''+c.k+'\')"><span class="mega-ico mega-ico-share" style="box-shadow:0 3px 8px '+shade(col,-34)+'2e">'+heroShareAnimal(c.k)+'</span><b style="color:'+ink+'">'+t.name+'</b><span class="mega-chip" style="background:'+chipbg+';color:'+ink+'">'+t.axisJa+'</span></div>';
  }).join('');
  el.innerHTML = '<div class="mega-cards" style="grid-template-columns:repeat(4,1fr)">'+cards+'</div>';
}
var MOCKS=(function(){
  var keys=['fukurou','iruka','inu','usagi','kitsune','kuma'], tops=[9,12,20,7,16,11];
  return keys.map(function(k,i){
    var v={}; AXES.forEach(function(a){ v[a] = (a===k) ? (90+(i%6)) : (40+(hashStr(k+'|'+a)%45)); });
    return {k:k, v:v, top:tops[i]};
  });
})();
var MOCK_I=0,_mockIv=null,_mockHover=false;
function mockCardInner(m){
  var t=TYPES[m.k];
  var maxAx=AXES.reduce(function(a,b){return m.v[b]>m.v[a]?b:a;});
  var top5=AXES.slice().sort(function(a,b){return m.v[b]-m.v[a];}).slice(0,5);
  if(top5.indexOf(maxAx)<0){ top5.pop(); top5.unshift(maxAx); }
  var bars=top5.map(function(ax){ var tp=ax===maxAx; return '<div class="mc-bar'+(tp?' top':'')+'"><span class="mc-ax"'+(tp?' style="color:'+TYPES[ax].color+'"':'')+'>'+AXJA[ax]+'</span><span class="mc-tr"><i style="width:'+m.v[ax]+'%;background:'+TYPES[ax].color+'"></i></span>'+(tp?'<span class="mc-vtag" style="background:'+TYPES[ax].color+'">'+window.t('mock.top')+'</span>':'')+'</div>'; }).join('');
  return '<div class="mc-head"><div class="mc-ill" style="background:'+t.color+'1f">'+heroShareAnimal(m.k)+'</div><div class="mc-headtx"><span class="mc-label">'+window.t('mock.label')+'</span><span class="mc-name">'+t.name+'</span><span class="mc-catch" style="color:'+t.color+'">'+t.catch+'</span></div></div><div class="mc-bars">'+bars+'</div><div class="mc-foot">'+window.t('mock.foot')+'</div>';
}
function renderMock(m){ var fl=document.getElementById('mcFlip'); if(fl) fl.innerHTML=mockCardInner(m); var bd=document.querySelector('.mock-badge'); if(bd) bd.innerHTML='🏆 <b>'+(TYPES[m.k]?rarityLabel(m.k):t('rarity.rareShort'))+'</b>'; }
function flipMock(){ if(_mockHover) return; var fl=document.getElementById('mcFlip'); if(!fl) return; MOCK_I=(MOCK_I+1)%MOCKS.length; fl.classList.add('flipping'); setTimeout(function(){ renderMock(MOCKS[MOCK_I]); fl.classList.remove('flipping'); },320); }
function startMockRotation(){ renderMock(MOCKS[0]); var w=document.querySelector('.hero-visual'); if(w){ w.addEventListener('mouseenter',function(){_mockHover=true;}); w.addEventListener('mouseleave',function(){_mockHover=false;}); } if(_mockIv) clearInterval(_mockIv); _mockIv=setInterval(flipMock,4200); }
function renderGjTypes(){
  var wrap=document.getElementById('gj-typegrid'); if(!wrap) return;
  // 型ラベル・絵文字・説明・自慢はコピー(type-cards-12-copy.md)。色・割合はTYPESから流用。
  var CARDS=[
    {k:'inu',    emoji:'🐕', label:'定着タイプ', catch:'スタッフが長く働けている',   desc:'人がここで働き続けたいと思える施設。温かいチームが、そのまま利用者の安心になるタイプです。'},
    {k:'penguin',emoji:'🐧', label:'育成タイプ',   catch:'新人をしっかり育てられている',           desc:'研修や資格取得を後押しし、新人もじっくり育てるのが得意。先輩が後輩に寄り添い、みんなで成長していく学びの多い施設です。'},
    {k:'fukurou',emoji:'🦉', label:'DXタイプ',     catch:'パソコンやアプリをうまく使えている',           desc:'記録もやり取りもデジタルで効率化。センサーやロボットも使いこなし、無駄な残業を減らしてスマートに運営する知恵者タイプです。'},
    {k:'kitsune',emoji:'🦊', label:'経営タイプ',   catch:'補助金がうまく使えて黒字も出せている',           desc:'使える制度や補助金はしっかり活用し、堅実に黒字を継続。多角的な事業展開でしたたかに稼ぐ、経営巧者タイプです。'},
    {k:'usagi',  emoji:'🐰', label:'成長タイプ',   catch:'事業がしっかり伸びている',         desc:'新しい取り組みにどんどん挑戦し、事業や利用者をぐんぐん広げていく施設。フットワークが軽く、伸びる勢いが自慢のタイプです。'},
    {k:'iruka',  emoji:'🐨', label:'稼働タイプ',   catch:'いつもよく利用されている',           desc:'ベッドや席がいつもしっかり埋まる、地域で選ばれる人気の施設。利用者に安定して支持され、稼働がぶれないのが自慢のタイプです。'},
    {k:'beaver', emoji:'🦫', label:'専門職タイプ', catch:'専門の職員がそろっている',       desc:'看護やリハビリなど専門スタッフがしっかりそろい、手厚いケアが得意。確かな技術で利用者を支える、頼れる職人集団タイプです。'},
    {k:'risu',   emoji:'🐿️', label:'栄養タイプ',   catch:'食事や栄養の支えがしっかりしている',         desc:'一人ひとりに合わせた食事と栄養管理が得意。おいしく食べる楽しみを大切にし、体の元気を食から支える、食事自慢の施設です。'},
    {k:'hachi',  emoji:'🐝', label:'地域タイプ',   catch:'地域とのつながりを大事にできている',         desc:'地域の行事やボランティアとのつながりを大切にする施設。まちに開かれ、家族や近所とも温かく交わる、地域密着タイプです。'},
    {k:'kuma',   emoji:'🐻', label:'安全タイプ',   catch:'事故を防ぐ取り組みができている',           desc:'事故やケガを防ぐ仕組みづくりが得意。感染対策や見守りをきちんと整え、利用者も家族も安心して預けられる、頼れる守りのタイプです。'},
    {k:'ookami', emoji:'🐺', label:'備えタイプ',   catch:'もしものときの備えができている',             desc:'災害や急なトラブルへの備えが得意。防災計画や訓練を欠かさず、もしものときも落ち着いて動ける、用意周到なタイプです。'},
    {k:'zou',    emoji:'🐘', label:'働きやすさタイプ', catch:'ゆとりを持って働ける職場になっている',       desc:'休みが取りやすく、無理のないシフトで働ける環境づくりが得意。職員の負担に気を配り、皆がゆったり働ける、やさしい施設です。'}
  ];
  wrap.innerHTML=CARDS.map(function(c,i){
    var col=(TYPES[c.k]&&TYPES[c.k].color)||'#7B6EF6';
    var soft=shade(col,90), ink=shade(col,-34);
    var pct='';
    // desc は inu/kitsune のみ TYPES と同一文のため type.<k>.desc を再利用、それ以外は gj.<k>.desc
    var descKey=(c.k==='inu'||c.k==='kitsune')?('type.'+c.k+'.desc'):('gj.'+c.k+'.desc');
    return '<article class="gj-typecard" style="animation-delay:'+(i*70)+'ms;background:#fff;border:1px solid #E7E7F1;border-radius:20px;border-top:5px solid '+col+';padding:clamp(24px,3vw,32px);display:flex;flex-direction:column;gap:16px;cursor:pointer;text-align:left" onclick="showProfile(\''+c.k+'\')">'+
      '<div style="display:flex;align-items:center;gap:14px">'+
        '<div class="gj-typeicon" style="width:56px;height:56px;flex:0 0 auto;border-radius:14px;background:'+soft+';display:grid;place-items:center;font-size:1.9rem;border:1px solid '+shade(col,70)+';animation-delay:'+(-(i*0.42)).toFixed(2)+'s">'+c.emoji+'</div>'+
        '<div style="min-width:0"><div style="font-weight:700;color:'+ink+';font-size:.86rem;line-height:1.3">'+window.t('gj.'+c.k+'.label',null,c.label)+pct+'</div><div style="font-family:\'Zen Maru Gothic\';font-weight:900;font-size:clamp(1.12rem,2.4vw,1.32rem);line-height:1.45;color:#2A2E38">'+TYPES[c.k].name+'</div></div>'+
      '</div>'+
      '<p style="margin:0;font-size:.98rem;line-height:1.8;color:#606675">'+window.t(descKey,null,c.desc)+'</p>'+
      '<div style="margin-top:auto;background:'+soft+';border-radius:12px;padding:14px 16px"><div style="font-weight:700;font-size:.82rem;color:'+ink+';margin-bottom:4px">'+window.t('gj.strengthTitle',null,'こんな強みが自慢')+'</div><div style="font-family:\'Zen Maru Gothic\';font-weight:700;line-height:1.6;color:#2A2E38">'+window.t('gj.'+c.k+'.catch',null,c.catch)+'</div></div>'+
      '<button type="button" class="gj-typebtn" onclick="event.stopPropagation();showProfile(\''+c.k+'\')" style="width:100%;background:'+col+';color:#fff;border:0;border-radius:999px;padding:13px 16px;font-family:\'Zen Maru Gothic\';font-weight:900;font-size:.98rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 12px 26px -14px '+col+'">'+window.t('gj.detail',null,'詳しくはこちら')+' <span aria-hidden="true">→</span></button>'+
    '</article>';
  }).join('');
  initGjReveal();
}
// 12タイプカードの登場アニメ：initBpReveal と同型。カードは build() 内で動的描画されるため描画直後に呼ぶ。
// grid が表示領域に入ったら .gj-revealed を付けてCSSアニメ(gjCardIn)を再生、抜けたら外して再入場で再生。
function initGjReveal(){
  var grids=[];
  var grid=document.getElementById('gj-typegrid'); if(grid) grids.push(grid);
  document.querySelectorAll('.reveal-grid').forEach(function(n){ grids.push(n); });
  if(!grids.length) return;
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduce || !('IntersectionObserver' in window)){ grids.forEach(function(n){ n.classList.add('gj-revealed'); }); return; }
  if(window._gjObs) window._gjObs.disconnect();
  window._gjObs=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('gj-revealed'); }
      else { e.target.classList.remove('gj-revealed'); }
    });
  },{threshold:0.12,rootMargin:'0px 0px -8% 0px'});
  grids.forEach(function(n){ window._gjObs.observe(n); });
}
function build(){
  // 全国47都道府県すべてで、県別の実データを使った診断に対応。
  buildPrefChips();
  // 初期はどの県も未選択。ユーザーがチップを押して初めて選択され、onPrefChange で県別データを読み込む
  loadNation();      // 全国平均（比較トグル「全国」「種別」の基準線）を読み込み（県共通）
  loadDistByService();// サービス種別ごとの全国タイプ分布（比較トグル「サービス種別」の分布バー用・県共通）
  renderGjTypes();
  var ha=document.getElementById('heroAnimals');
  if(ha){ var ho=['inu','penguin','fukurou','kitsune','usagi','iruka','beaver','risu','hachi','kuma','ookami','zou'];ha.innerHTML=ho.map(function(k,i){return '<div class="ha ha-share" style="animation-delay:'+(i*0.15).toFixed(2)+'s">'+heroShareAnimal(k)+'</div>';}).join(''); }
  startMockRotation();
  renderZukan();
  renderMega();
  setupToc();
  setupReveal();
  setupTilt();
  setupScrollFX();
  setupStickyCta();
  setupResultStickyCta();
  showLastLink();
  refreshCount();
  var _hc=document.querySelector('.hero-band .diagcount'); if(_hc) countUp(_hc, diagCount());
  restoreFromUrl();
}
function setupReveal(){
  if(!('IntersectionObserver' in window)) return;
  var rv=['rv-z','rv-rot','rv-rot2','rv-big'];
  ['.scard','.gcard','.faq','.tcard','.figure'].forEach(function(sel){
    var ns=document.querySelectorAll(sel);
    for(var i=0;i<ns.length;i++){ ns[i].classList.add('reveal'); ns[i].classList.add(rv[i%rv.length]); ns[i].style.setProperty('--rd',((i%3)*0.08).toFixed(2)+'s'); }
  });
  var s=document.querySelectorAll('.lp-h2,.lp-secsub,.ctah,.ctap,.zukan-title,.zukan-sub');
  for(var k=0;k<s.length;k++){ s[k].classList.add('reveal'); s[k].classList.add(k%2?'rv-rot2':'rv-rot'); }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(function(n){ io.observe(n); });
}
function setupTilt(){
  var w=document.querySelector('.hero-visual'); var c=document.querySelector('.mock-card.front'); if(!w||!c) return;
  w.addEventListener('mousemove',function(e){ var r=w.getBoundingClientRect(); var x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5; c.style.transform='rotateY('+(x*20).toFixed(1)+'deg) rotateX('+(-y*20).toFixed(1)+'deg) scale(1.05)'; });
  w.addEventListener('mouseleave',function(){ c.style.transform=''; });
}
function syncResultStickyCta(){
  var bar=document.getElementById('resultStickyCta'); var res=document.getElementById('result');
  var body=document.querySelector('#result .result-body');
  if(!bar||!res) return;
  var on=res.classList.contains('active') && body && !body.classList.contains('rb-collapsed');
  bar.classList.toggle('show',!!on);
  document.body.style.paddingBottom = on ? '68px' : '';
}
function setupResultStickyCta(){
  var res=document.getElementById('result'); var body=document.querySelector('#result .result-body');
  if(!res||!('MutationObserver' in window)) return;
  var mo=new MutationObserver(syncResultStickyCta); mo.observe(res,{attributes:true,attributeFilter:['class']});
  if(body) mo.observe(body,{attributes:true,attributeFilter:['class']});
  syncResultStickyCta();
}
function setupStickyCta(){
  var bar=document.getElementById('mobileStickyCta'); var hero=document.getElementById('heroCtaBtn'); var intro=document.getElementById('intro');
  if(!bar||!hero||!intro||!('IntersectionObserver' in window)) return;
  var heroVisible=true;
  function refresh(){ var on=intro.classList.contains('active') && !heroVisible; bar.classList.toggle('show', on); if(!document.getElementById('result').classList.contains('active')) document.body.style.paddingBottom = on ? '78px' : ''; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ heroVisible=e.isIntersecting; refresh(); }); },{threshold:0});
  io.observe(hero);
  var mo=new MutationObserver(refresh);
  mo.observe(intro,{attributes:true,attributeFilter:['class']});
}
function setupScrollFX(){
  var bar=document.getElementById('scrollprog'); var blobs=document.querySelectorAll('.hero-band .blob'); var pts=document.querySelectorAll('.hero-band .pt');
  function onScroll(){ var sc=window.pageYOffset||document.documentElement.scrollTop||0; var h=document.documentElement.scrollHeight-window.innerHeight; if(bar) bar.style.width=(h>0?(sc/h*100):0)+'%'; for(var i=0;i<blobs.length;i++){ blobs[i].style.marginTop=(sc*(0.05+i*0.025)).toFixed(1)+'px'; } for(var j=0;j<pts.length;j++){ pts[j].style.marginTop=(-sc*(0.04+j*0.015)).toFixed(1)+'px'; } }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
}
function countUp(el,to){ if(!el||!to) return; var from=Math.max(0,to-1500),t0=null; function step(ts){ if(!t0)t0=ts; var p=Math.min(1,(ts-t0)/1400); el.textContent=fmtNum(Math.round(from+(to-from)*(1-Math.pow(1-p,3)))); if(p<1) requestAnimationFrame(step); } requestAnimationFrame(step); }
build();
