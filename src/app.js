(() => {
  'use strict';
  const data = window.HANDBOOK;
  const $ = (s, root = document) => root.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const chapterById = id => data.chapters.find(c => c.id === id);
  const storageKey = 'iddd-redbook-learning-v1';
  const initial = () => ({version: 1, done: [], answers: {}, notes: {}, theme: 'light', depth: 'quick', last: 'ch1'});
  function validateState(raw) {
    const clean = initial();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) throw new Error('不是兼容的学习记录（需要 version: 1）');
    clean.done = [...new Set((Array.isArray(raw.done) ? raw.done : []).filter(id => chapterById(id)))];
    for (const c of data.chapters) {
      if (typeof raw.notes?.[c.id] === 'string') clean.notes[c.id] = raw.notes[c.id].slice(0, 20000);
      c.quiz.forEach((q, i) => {
        const key = `${c.id}-${i}`, value = raw.answers?.[key];
        if (Number.isInteger(value) && value >= 0 && value < q.options.length) clean.answers[key] = value;
      });
    }
    if (raw.theme === 'dark') clean.theme = 'dark';
    if (raw.depth === 'deep') clean.depth = 'deep';
    if (chapterById(raw.last)) clean.last = raw.last;
    return clean;
  }
  let state = initial(), storageOk = true;
  try { const saved = localStorage.getItem(storageKey); if (saved) state = validateState(JSON.parse(saved)); }
  catch (_) { storageOk = false; }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); storageOk = true; }
    catch (_) { storageOk = false; }
    $('#storage-warning').hidden = storageOk;
  }
  function toast(message) {
    const el = $('#toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2500);
  }
  function score() {
    let attempted = 0, correct = 0;
    data.chapters.forEach(c => c.quiz.forEach((q, i) => {
      const answer = state.answers[`${c.id}-${i}`];
      if (answer !== undefined) { attempted++; if (answer === q.correct) correct++; }
    }));
    return {attempted, correct};
  }
  const links = [
    ['overview','◈','学习地图'], ['case','◇','贯穿案例'], ['lab/aggregate','⌘','设计实验室'],
    ['glossary','Aa','术语速查'], ['notes','▤','学习记录'], ['sources','↗','资料与范围']
  ];
  const labs = [ ['aggregate','聚合边界'], ['concurrency','并发冲突'], ['events','事件与 CQRS'], ['context','防腐层'], ['replay','事件重放'] ];
  function nav(route) {
    let html = links.map(([id, icon, label]) => `<a class="nav-main ${route === id || (id.startsWith('lab') && route.startsWith('lab')) ? 'active' : ''}" href="#${id}" ${route === id ? 'aria-current="page"' : ''}><span class="nav-symbol" aria-hidden="true">${icon}</span>${label}</a>`).join('');
    for (const group of ['战略设计','战术建模','落地整合','进阶选读']) {
      html += `<div class="nav-section">${group}</div>`;
      html += data.chapters.filter(c => c.group === group).map(c => `<a class="chapter-link ${route === 'chapter/'+c.id ? 'active' : ''}" href="#chapter/${c.id}" ${route === 'chapter/'+c.id ? 'aria-current="page"' : ''}><span class="chapter-index">${c.n}</span><span>${esc(c.title)}</span>${state.done.includes(c.id) ? '<span class="chapter-check" aria-label="已读">✓</span>' : ''}</a>`).join('');
    }
    $('#navigation').innerHTML = html;
    $('#progress-label').textContent = `${state.done.length} / 15`;
    $('#progress').value = state.done.length;
  }
  function sourceLinks(c) {
    return `<div class="source-inline"><span>章节定位与延伸：</span>${c.sources.map(id => {const s=data.sources.find(x=>x.id===id);return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`;}).join('')}</div>`;
  }
  const codeBlock = (c, id) => `<div class="code-wrap"><div class="code-head"><span>${esc(c.example.lang)}</span><button data-action="copy" data-id="${id}">复制</button></div><pre><code>${esc(c.example.code)}</code></pre><div class="code-note">原创教学示例 · 片段不保证独立编译；完整可运行模型在下载包 examples 目录</div></div>`;
  function overview() {
    const stats = score();
    const first = data.chapters.find(c => !state.done.includes(c.id))?.id || state.last;
    const descriptions = {'战略设计':'先决定投入、语言与边界','战术建模':'让规则落在恰当的对象上','落地整合':'把模型组合成可靠的用例','进阶选读':'理解事件作为事实来源的代价'};
    return `<section class="hero"><div><span class="eyebrow">THE RED BOOK · 学习地图</span><h1>把 DDD 读成<br>一套<em>设计判断。</em></h1><p class="lead">沿 Vaughn Vernon《实现领域驱动设计》的章节顺序，先抓住每章要解决的问题，再通过原创案例、Java 代码和交互实验理解取舍。</p><div class="actions"><a class="btn primary" href="#chapter/${first}">${state.done.length ? '继续学习' : '开始逐章速读'} <span aria-hidden="true">→</span></a><a class="btn" href="#lab/aggregate">进入设计实验室</a></div><div class="hero-meta"><span>14 章 + 附录 A</span><span>独立案例 · 知识共创</span><span>离线可用</span></div></div><div class="hero-art" aria-hidden="true"><div class="book-art"><div class="book-cover"><div class="book-kicker">A FIELD GUIDE TO</div><div class="book-title">实现<br>领域驱动<br>设计</div><div class="book-bottom">Vaughn Vernon<br>交互导学 · 原创练习</div></div></div><div class="book-note">手册封面示意 · 非原书封面</div></div></section>
      <div class="stats-row"><div class="stat"><b>15</b><span>学习单元</span></div><div class="stat"><b>5</b><span>交互实验</span></div><div class="stat"><b>${stats.correct}<small> / 30</small></b><span>自测答对</span></div><div class="stat"><b>${state.done.length}<small> / 15</small></b><span>已读章节</span></div></div>
      <div class="section-top"><h2>选择这一遍的读法</h2><span>时间为学习建议，非实测</span></div><div class="grid-3"><a class="path-card" href="#chapter/ch1" data-depth="quick"><small>01 / 约 65 分钟</small><h3>按章走一遍</h3><p>每章读核心判断和三条要点，做两道自测。先建立完整地图。</p></a><a class="path-card" href="#chapter/ch2" data-depth="deep"><small>02 / 约 2—3 小时</small><h3>带着设计问题深读</h3><p>展开推演，读代码与反例。建议顺序：2 → 3 → 10 → 12 → 14 → 13。</p></a><a class="path-card" href="#case"><small>03 / 约 45 分钟</small><h3>用一个案例串起来</h3><p>跟随一份文稿的双人评审，从边界划分走到事件与读模型。</p></a></div>
      <div class="section-top"><h2>章节路线</h2><span>点击任何一章开始</span></div>
      ${Object.keys(descriptions).map(group => `<section class="map-group"><div class="group-header"><h3>${group}</h3><span>${descriptions[group]}</span></div><div class="chapter-grid">${data.chapters.filter(c=>c.group===group).map(c=>`<a class="chapter-card" href="#chapter/${c.id}"><span class="number">${c.n}</span><div><h4>${esc(c.title)}</h4><p>${esc(c.question)}</p></div><span class="end">${state.done.includes(c.id)?'✓ 已读':c.minutes+' 分钟'}</span></a>`).join('')}</div></section>`).join('')}
      <div class="callout amber"><strong>这份手册的依据</strong><p>已核对出版社目录、公开样章、作者聚合设计文章与配套代码。未取得红皮书全文，因此这里是按章组织的原创导学，不是逐页精读摘要。Java 21 写法与可靠消息实验均标明为教学改写或工程补充。<a href="#sources">查看资料范围 →</a></p></div>`;
  }
  function renderQuiz(c, i) {
    const q = c.quiz[i], answer = state.answers[`${c.id}-${i}`], answered = answer !== undefined;
    return `<section class="quiz-block" id="quiz-${i}" aria-label="自测 ${i+1}"><h3><span class="pill">${i+1} / ${c.quiz.length}</span> ${esc(q.q)}</h3><div class="quiz-options">${q.options.map((o,j)=>`<button class="quiz-option ${answered&&j===q.correct?'correct':''} ${answer===j?'chosen':''}" data-action="answer" data-id="${c.id}" data-question="${i}" data-option="${j}" aria-pressed="${answer===j}"><span class="letter">${'ABC'[j]}</span><span>${esc(o)}</span>${answered&&j===q.correct?'<span aria-label="正确答案">✓</span>':''}</button>`).join('')}</div>${answered?`<div class="quiz-feedback ${answer===q.correct?'right':''}" role="status"><strong>${answer===q.correct?'判断正确。':'再想一步。'}</strong> ${esc(q.why)}</div>`:''}</section>`;
  }
  function chapter(c) {
    state.last = c.id; save();
    const index=data.chapters.indexOf(c), deep = state.depth === 'deep';
    return `<header class="chapter-head"><span class="eyebrow">${c.id==='appendix'?'APPENDIX A':'CHAPTER '+c.n} · ${c.group}</span><h1>${esc(c.title)}</h1><div class="english">${esc(c.en)}</div><span class="pill">速读约 ${c.minutes} 分钟</span> <span class="pill">英文原版起始页 ${c.page}</span> <span class="pill red">原创导学</span></header>
      <div class="reader-toolbar"><div class="segmented" aria-label="阅读深度"><button data-action="depth" data-value="quick" class="${!deep?'active':''}" aria-pressed="${!deep}">速读要点</button><button data-action="depth" data-value="deep" class="${deep?'active':''}" aria-pressed="${deep}">展开推演与代码</button></div><div class="actions"><button class="small-btn" data-action="done" data-id="${c.id}" aria-pressed="${state.done.includes(c.id)}">${state.done.includes(c.id)?'✓ 已读 · 点击撤销':'标记已读'}</button><button class="small-btn" data-action="print">打印本章</button></div></div>
      <h2 class="chapter-question">${esc(c.question)}</h2><p class="takeaway">${esc(c.lead)}</p><div class="points">${c.points.map(([title,text],i)=>`<article class="point"><span class="index">0${i+1}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div>
      <div class="section-top"><h3>回到书里，重点看什么</h3></div><div class="topics">${c.topics.map(t=>`<span class="pill">${esc(t)}</span>`).join('')}</div>
      <section class="deep-section" ${!deep?'hidden':''}><div class="section-top"><h2>把判断再往前推一步</h2></div><div class="deep-text">${c.deeper.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="section-top"><h2>在知行平台中怎么做</h2><span>原创教学案例</span></div><div class="example-grid"><article class="example-story"><strong>业务情境</strong><p>${esc(c.example.story)}</p><strong>本例的选择</strong><p>${esc(c.example.decision)}</p></article><article class="example-story"><strong>代价与适用范围</strong><p>${esc(c.example.tradeoff)}</p><a href="#case" class="caption">查看完整案例地图 →</a></article></div>${codeBlock(c,c.id)}</section>
      ${!deep?`<div class="callout"><strong>把它落到案例里</strong><p>${esc(c.example.story)} ${esc(c.example.decision)}</p><button class="text-btn" data-action="depth" data-value="deep">展开代码与取舍 →</button></div>`:''}
      ${c.lab?`<a href="#lab/${c.lab}" class="lab-link"><span class="lab-icon" aria-hidden="true">⌘</span><div><strong>动手验证：${labs.find(l=>l[0]===c.lab)[1]}</strong><span>改变条件，观察设计选择带来的结果</span></div><span style="margin-left:auto">→</span></a>`:''}
      <div class="section-top"><h2>两种常见误读</h2></div><div class="traps">${c.traps.map(t=>`<div class="trap"><b>辨析</b>${esc(t)}</div>`).join('')}</div><div class="exercise"><h3>留一道设计题</h3><p>${esc(c.task)}</p><details><summary>思考后展开参考推理</summary><p>${esc(c.answer)}</p></details></div>
      <div class="section-top"><h2>用判断检验理解</h2><span>答案与解释在选择后出现</span></div><div id="quizzes">${c.quiz.map((_,i)=>renderQuiz(c,i)).join('')}</div>
      <div class="section-top"><h3>把理解写成自己的话</h3></div><label class="note-label" for="chapter-note">本章笔记</label><textarea class="note-field" id="chapter-note" data-id="${c.id}" maxlength="20000" placeholder="我会在什么情况下使用它？有哪些业务前提不能省略？">${esc(state.notes[c.id]||'')}</textarea><span class="note-status" id="note-status">${storageOk?'输入后自动保存在本浏览器；可在“学习记录”导出。':'当前无法持久保存，请及时导出。'}</span>
      <div class="related">${c.related.map(id=>{const x=chapterById(id);return `<a class="pill" href="#chapter/${id}">${x.n} · ${esc(x.title)} →</a>`;}).join('')}</div>${sourceLinks(c)}
      <nav class="chapter-nav" aria-label="章节切换">${index?`<a href="#chapter/${data.chapters[index-1].id}">← ${data.chapters[index-1].title}</a>`:'<a href="#overview">← 学习地图</a>'}${index<data.chapters.length-1?`<a href="#chapter/${data.chapters[index+1].id}">${data.chapters[index+1].title} →</a>`:'<a href="#notes">查看学习记录 →</a>'}</nav>`;
  }

  const caseSteps = [
    ['冻结文稿版本', '文稿上下文', '作者提交不可变的版本 doc-v3。后续修改形成新版本，已有评审结论仍只针对 doc-v3。', 'DocumentVersionId · 身份的适用范围', 'ch2'],
    ['选择两位审稿人', '应用服务 + 领域策略', '应用服务读取候选资料，经防腐层转换；匹配策略筛选同租户、符合专业方向、非作者的候选人。', 'ReviewerSelectionPolicy · 规则归属', 'ch7'],
    ['开启评审轮次', '工厂 + ReviewCycle', '创建轮次、固定两位不同人选和时间窗。根只引用文稿版本 ID，内部集合保持有界。', 'ReviewCycle.open · 出生即有效', 'ch11'],
    ['提交审稿意见', '聚合 + 仓储', '指定人选在时间窗内提交一次意见。仓储以版本条件保存，冲突后重新加载，保留另一位审稿人的结果。', 'submit + expectedVersion · 不变量与并发', 'ch12'],
    ['编辑结束评审', '应用服务 + 聚合', '编辑身份由用例入口校验。聚合确认意见齐备，再计算接受或拒绝；状态与待投递记录同事务提交。', 'finish + Outbox · 提交边界', 'ch14'],
    ['更新知识目录', '跨上下文事件 + 查询模型', '目录翻译并消费结果，以 eventId 去重，以版本规则处理顺序。写侧已结束与目录已更新是两个时点。', 'Integration Event + Projection · 允许的延迟', 'ch13']
  ];
  let caseStep = 0;
  function caseView() {
    const step = caseSteps[caseStep];
    return `<span class="eyebrow">ONE CASE · 一条完整建模线索</span><h1>知行 · 知识共创平台</h1><p class="lead">企业成员共同撰写知识文稿。每个冻结版本交由两位独立审稿人评审，编辑结束本轮，目录随后展示结果。用这个有限的业务范围，贯穿 14 章的设计问题。</p>
      <div class="callout"><strong>案例约定</strong><p>固定两位不同审稿人；作者必须回避；意见只提交一次；提交窗口为左闭右开；意见齐备后才可结束；两人都赞成才接受。新版本另起评审轮次。目录允许短暂延迟。这些是原创教学假设。</p></div>
      <div class="section-top"><h2>先画模型边界</h2><span>箭头表示本例的信息流</span></div><div class="context-diagram"><div class="diagram-node"><strong>身份与访问</strong>账号、启用状态<br><span class="pill">通用能力</span></div><div class="diagram-arrow" aria-hidden="true">→</div><div class="diagram-node core"><strong>评审</strong>轮次、回避、意见、结果<br><span class="pill red">核心能力</span></div><div class="diagram-arrow" aria-hidden="true">→</div><div class="diagram-node"><strong>知识目录</strong>可检索条目、可见性<br><span class="pill">支撑能力</span></div></div><p class="caption">文稿上下文另行拥有不可变版本；评审仅保存版本标识。认证事实经防腐层进入评审；评审事实经契约进入目录。此图不要求四个独立进程。</p>
      <div class="section-top"><h2>跟随一个用例走完</h2><span>点击步骤或使用下一步</span></div><div class="flow-steps">${caseSteps.map((s,i)=>`<button class="flow-step ${caseStep===i?'active':''}" data-action="case-step" data-step="${i}" aria-pressed="${caseStep===i}">${i+1}. ${s[0]}</button>`).join('')}</div><article class="card" aria-live="polite"><span class="eyebrow">STEP ${caseStep+1} / ${step[1]}</span><h2>${step[0]}</h2><p>${step[2]}</p><p class="caption">${step[3]}</p><div class="actions"><button data-action="case-prev" ${caseStep===0?'disabled':''}>上一步</button><button class="primary" data-action="case-next" ${caseStep===5?'disabled':''}>下一步 →</button><a class="btn" href="#chapter/${step[4]}">对照章节</a></div></article>
      <div class="section-top"><h2>沿职责读代码</h2></div><div class="table-wrap"><table><thead><tr><th>职责</th><th>本例中的形式</th><th>重点观察</th></tr></thead><tbody><tr><td>业务规则</td><td>ReviewCycle、ReviewWindow</td><td>不变量在哪里被保护？</td></tr><tr><td>跨概念规则</td><td>ReviewerSelectionPolicy</td><td>为什么不属于单个实体？</td></tr><tr><td>用例协调</td><td>ReviewApplicationService</td><td>谁加载、谁决定、谁提交？</td></tr><tr><td>持久化</td><td>ReviewCycleRepository</td><td>保存的原子边界与并发契约是什么？</td></tr><tr><td>集成</td><td>Outbox、Inbox、Translator</td><td>失败、重复与语义变化由谁负责？</td></tr><tr><td>查询</td><td>ReviewSummary</td><td>是否需要聚合？是否允许延迟？</td></tr></tbody></table></div>
      <div class="grid-2"><section class="card"><h3>可运行的 Java 模型</h3><p class="caption">下载包内的 examples/ReviewExample.java 包含值对象、聚合、内存版本仓储与行为检查，无第三方依赖。</p><div class="code-wrap"><pre><code>java examples/ReviewExample.java</code></pre></div><p class="caption">需要 JDK 21。macOS 默认 Java 版本较旧时，可使用已安装 JDK 21 的 java 绝对路径执行。</p><a class="btn" href="examples/ReviewExample.java" download>下载 Java 源码 ↗</a></section><section class="card"><h3>本例的实现范围</h3><p class="caption">这是学习手册中的独立建模例子。可运行代码覆盖纯领域行为与版本冲突；章节中的 Spring、SQL、Outbox 属于结构示意。</p><p class="caption">真实部署还需要实现数据库事务、认证授权、完整的资格策略、幂等协议、消息可靠投递与可观测性。它们没有被伪装成浏览器模拟器的能力。</p><a href="#lab/aggregate">进入交互演练 →</a></section></div>
      <div class="section-top"><h2>把案例迁移到自己的业务</h2></div><ul class="checklist"><li>列出两个真实反例，找出谁有权改变状态。</li><li>区分必须立即成立的约束与允许延迟的结果。</li><li>估算内部集合规模以及不同操作是否争用同一个版本。</li><li>写明事务提交前后崩溃时会留下什么。</li><li>指出哪些外部词语需要翻译，而不是直接复用模型。</li></ul>`;
  }
  function glossary() {
    return `<span class="eyebrow">GLOSSARY · 在语境里记住概念</span><h1>术语速查</h1><p class="lead">名称是入口，职责和边界才是判断依据。点击词条回到对应章节。</p><label class="sr-only" for="glossary-filter">筛选术语</label><input class="glossary-filter" id="glossary-filter" placeholder="输入中文、英文或缩写，例如 CQRS、服务、聚合…"><div id="glossary-list" class="grid-2">${glossaryCards('')}</div>`;
  }
  function glossaryCards(term) {
    const entries = data.glossary.filter(row=>row.join(' ').toLowerCase().includes(term.toLowerCase()));
    return entries.length ? entries.map(([title,en,desc,id])=>`<article class="glossary-card"><h3>${esc(title)}</h3><div class="en">${esc(en)}</div><p>${esc(desc)}</p><a href="#chapter/${id}">回到 ${chapterById(id).n} · ${esc(chapterById(id).title)} →</a></article>`).join('') : '<p class="empty-state" role="status">没有匹配词条，试试更短的关键词。</p>';
  }
  function notesView() {
    const stats=score(), written=data.chapters.filter(c=>state.notes[c.id]?.trim());
    const revisit=data.chapters.filter(c=>c.quiz.some((q,i)=>state.answers[`${c.id}-${i}`]!==undefined&&state.answers[`${c.id}-${i}`]!==q.correct));
    return `<span class="eyebrow">YOUR NOTES · 把概念变成判断</span><h1>学习记录</h1><p class="lead">已读 ${state.done.length} / 15 章，自测已作答 ${stats.attempted} / 30 题，当前答对 ${stats.correct} 题。阅读进度与自测分开记录，标记已读并不表示已经掌握。</p><div class="actions"><button class="primary" data-action="export">导出进度与笔记</button><button data-action="import">导入学习记录</button><a class="btn" href="#chapter/${state.last}">回到上次章节</a></div><p class="caption" style="margin-top:12px">记录仅在本浏览器保存。移动文件、换浏览器或清理站点数据后可能不可见；导出的 JSON 可用于迁移。导入会合并已读章节，并以导入文件覆盖同章答案和笔记。</p>
      ${revisit.length?`<div class="section-top"><h2>值得回看的章节</h2><span>有自测题尚未答对</span></div><div class="related">${revisit.map(c=>`<a class="pill amber" href="#chapter/${c.id}">${c.n} · ${esc(c.title)}</a>`).join('')}</div>`:'<div class="callout">'+(stats.attempted?'已作答的题目当前全部正确。试着用自己的业务反例解释答案。':'还没有作答记录。每章底部有两道带解释的判断题。')+'</div>'}
      <div class="section-top"><h2>章节笔记</h2><span>${written.length} 章有记录</span></div><div class="notes-grid">${written.length?written.map(c=>`<article class="note-card"><h3><a href="#chapter/${c.id}">${c.n} · ${esc(c.title)}</a></h3><div class="note-content">${esc(state.notes[c.id])}</div></article>`).join(''):'<div class="empty-state">在任意章节底部记下你的理解，这里会汇总显示。</div>'}</div>`;
  }
  function sourcesView() {
    return `<span class="eyebrow">READING BASIS · 资料与边界</span><h1>从哪里来，改写了什么</h1><p class="lead">本手册围绕 Vaughn Vernon 的 <em>Implementing Domain-Driven Design</em>（《实现领域驱动设计》，红皮书）编排。采用 2013 年英文版章节结构，中文标题采用常用译法。</p><div class="callout amber"><strong>阅读与核验范围</strong><p>已核对出版社完整目录，阅读公开样章中的聚合设计内容、作者聚合文章及部分配套源码。未取得全书全文，不能声称完成全书逐页精读。非样章部分按照经核验的章节主题制作原创解释、问题和代码，具体细节请回到原书查证。</p></div><div class="grid-2"><section class="card"><h3>遵循的设计线索</h3><p class="caption">战略边界 → 战术模型 → 聚合生命周期 → 跨上下文整合 → 应用组合；聚合强调真实不变量、适当规模和并发约束。</p></section><section class="card"><h3>独立创作的部分</h3><p class="caption">知行平台、双人评审规则、全部练习、自测、UI 与演算器，以及 Java 21 模型均为本手册新写。没有复制书籍图表或配套项目代码。</p></section></div><div class="table-wrap"><table><thead><tr><th>阅读时请区分</th><th>本手册如何处理</th></tr></thead><tbody><tr><td>原书章节主题</td><td>保持 14 章与附录 A 顺序，标注英文标题及英文版起始页。</td></tr><tr><td>原书案例</td><td>书中采用 SaaSOvation 等案例；本手册另用知识共创平台，不逐段复述故事。</td></tr><tr><td>Java 语言演进</td><td>使用 Java 21 的 record 等写法，属于现代改写；原仓库 README 要求 Java 7。</td></tr><tr><td>工程补充</td><td>Outbox / Inbox、消息版本与恢复演练用于说明实现责任，不声称与原书逐字对应。</td></tr><tr><td>示例的可运行性</td><td>examples/ReviewExample.java 可运行；章节中的其他片段明确标注为示意。</td></tr><tr><td>实验的执行位置</td><td>所有演算在浏览器内完成，不连接数据库、MQ 或远端服务。</td></tr></tbody></table></div><div class="section-top"><h2>核验过的资料</h2><span>核验日期 ${data.date}</span></div>${data.sources.map(s=>`<article class="source-item" id="source-${s.id}"><h3><a href="${s.url}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></h3><span class="url">${esc(s.url)}</span><p>${esc(s.scope)}</p></article>`).join('')}<div class="callout"><strong>建议如何配合原书阅读</strong><p>先用每章问题定位重点，自己做题和实验，再回原书核对论证与更多情境。对于聚合、仓储、集成三类设计，不要只背结论；把业务前提、失败路径与替代方案一起记下来。</p></div>`;
  }

  const newAggregate = () => ({design:'focused', actor:'li', vote:'APPROVE', opinions:{}, status:'OPEN', message:'先只提交一份意见，然后尝试结束评审。', error:false, log:[]});
  const newConcurrency = () => ({cas:true, version:7, opinions:{}, a:{version:7,opinions:{}}, b:{version:7,opinions:{}}, log:['A、B 已同时读取数据库版本 7。']});
  const newEvents = (mode='outbox', dedup=true) => ({mode,dedup,committed:false,alive:true,pending:false,delivered:false,read:'OPEN',count:0,seen:false,log:['写模型与读模型均为评审中。']});
  let aggregate=newAggregate(), concurrency=newConcurrency(), delivery=newEvents(), replayCursor=0, replayVote='APPROVE', contextMode='acl', externalEnabled=true;
  const names={li:'李明',wang:'王芳',author:'陈晨（作者）'}, votes={APPROVE:'赞成',REJECT:'反对'}, statuses={OPEN:'评审中',ACCEPTED:'已接受',REJECTED:'未通过'};
  const opinionText = opinions => Object.entries(opinions).map(([id,v])=>`${names[id]}：${votes[v]}`).join('；') || '尚无意见';
  const row = (k,v) => `<div class="state-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
  const logView = logs => `<ol class="log" aria-live="polite">${logs.slice(-6).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
  const option = (value,label,selected) => `<option value="${value}" ${selected===value?'selected':''}>${label}</option>`;
  const labHeader = (id, title, description) => `<span class="eyebrow">DESIGN LAB · 在浏览器中演算</span><h1>${title}</h1><p class="lead">${description}</p><nav class="lab-tabs" aria-label="实验切换">${labs.map(([key,label])=>`<a href="#lab/${key}" class="${id===key?'active':''}" ${id===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav><p class="caption">本页在内存中模拟设计语义，不执行 Java、SQL 或消息中间件；刷新会重置实验，章节笔记另行保存。</p>`;
  function aggregateLab() {
    const a=aggregate;
    const explanations={
      focused:'轮次状态、两名固定审稿人和意见在同一边界；正文与目录在外。满足本例真实约束，也保持了有界规模。',
      giant:'把正文、全部讨论、所有历史轮次和目录一起纳入，会扩大加载范围与写入竞争。它们没有都必须和本轮状态同时改变的约束。',
      split:'每份意见与轮次状态各自提交。如果仍要求“结束时意见齐备”即时成立，就需要跨边界同步协议；仅靠异步计数会改变原来的业务承诺。'
    };
    const chips=a.design==='giant'?['ReviewCycle','两份意见','文稿正文','全部历史轮次','评论流','知识目录']:a.design==='split'?['ReviewCycle · 仅状态']:['ReviewCycle','两名审稿人 ID','两份意见','ReviewWindow'];
    return labHeader('aggregate','聚合边界：从规则反推模型','先比较三种边界，再试着违反“双人意见齐备才能结束”的约束。')+
      `<div class="lab-layout"><section class="lab-panel"><h3>01 / 选择一致性边界</h3><label class="field" for="aggregate-design">边界方案<select id="aggregate-design">${option('focused','有界的评审轮次',a.design)}${option('giant','所有关联都放进一个大聚合',a.design)}${option('split','状态与每份意见各自成聚合',a.design)}</select></label><div class="boundary-box"><div class="boundary-label">候选聚合边界</div><div class="object-chips">${chips.map(x=>`<span class="object-chip">${x}</span>`).join('')}</div></div><div class="boundary-outside">${(a.design==='split'?['独立意见 A','独立意见 B','文稿版本','目录']:a.design==='giant'?[]:['文稿版本 · 按 ID 引用','知识目录 · 事件更新']).map(x=>`<span>${x}</span>`).join('')}</div><div class="lab-feedback ${a.design!=='focused'?'error':''}">${explanations[a.design]}</div><p class="caption">上方比较设计方案；下方行为演算始终使用“有界评审轮次”模型，避免把概念比较混作真实分布式事务。</p><h3>02 / 尝试操作聚合</h3><div class="controls"><label class="field" for="aggregate-actor">操作者<select id="aggregate-actor">${Object.entries(names).map(([v,l])=>option(v,l,a.actor)).join('')}</select></label><label class="field" for="aggregate-vote">意见<select id="aggregate-vote">${option('APPROVE','赞成',a.vote)}${option('REJECT','反对',a.vote)}</select></label><button id="aggregate-submit" data-action="aggregate-submit">提交意见</button></div><div class="actions"><button id="aggregate-finish" class="primary" data-action="aggregate-finish">编辑结束评审</button><button data-action="aggregate-reset">重置实验</button></div><div class="lab-feedback ${a.error?'error':''}" role="status">${esc(a.message)}</div></section><aside class="lab-panel"><h3>当前领域状态</h3><div class="model-state">${row('轮次状态',statuses[a.status])}${row('指定审稿人','李明、王芳')}${row('意见数量',Object.keys(a.opinions).length+' / 2')}${row('当前意见',opinionText(a.opinions))}</div><p>实验假定处于合法时间窗内。重复意见不能覆盖；作者不是指定审稿人。用例权限假定已允许编辑结束评审。</p>${logView(a.log)}<a href="#chapter/ch10" class="caption">回到第 10 章 →</a></aside></div>`;
  }
  function concurrencyLab() {
    const c=concurrency;
    return labHeader('concurrency','并发冲突：失去的那份意见','两名审稿人都从版本 7 出发。先保存 A，再保存 B；对比有无版本检查时的结果。')+
      `<div class="lab-layout"><section class="lab-panel"><label class="check-field"><input type="checkbox" id="concurrency-cas" ${c.cas?'checked':''}>保存时原子校验 expectedVersion</label><p class="caption">切换选项会重置实验，便于比较相同起点。</p><div class="client-grid">${['a','b'].map((key,i)=>`<article class="client-card"><h4>请求 ${key.toUpperCase()} · ${i?'王芳':'李明'}</h4><p class="caption">当前快照版本 ${c[key].version}<br>${esc(opinionText(c[key].opinions))}</p><div class="actions"><button id="concurrency-save-${key}" data-action="concurrency-save" data-client="${key}">提交本人的赞成意见</button><button id="concurrency-read-${key}" data-action="concurrency-read" data-client="${key}">重新加载</button></div></article>`).join('')}</div><div class="model-state">${row('数据库版本',c.version)}${row('已持久化意见',opinionText(c.opinions))}${row('当前策略',c.cas?'原子版本检查':'无版本检查 · 反例')}</div><button data-action="concurrency-reset">重置实验</button>${logView(c.log)}</section><aside class="lab-panel"><h3>建议操作顺序</h3><ol><li>提交 A 的意见。</li><li>提交 B 的意见，观察冲突。</li><li>B 重新加载后再次提交。</li><li>关闭版本检查，重复前两步。</li></ol><div class="callout amber"><p>无版本检查时，这个“整个快照覆盖”的反例会丢失 A 的意见。真实数据库可有不同写法，但必须有明确的并发正确性机制。</p></div><p>冲突后不要把旧对象强行写回。重新加载会带上 A 的意见，再重新执行 B 的命令。本实验不实现自动重试。</p><a class="caption" href="#chapter/ch12">回到第 12 章 →</a></aside></div>`;
  }
  function eventsLab() {
    const d=delivery;
    return labHeader('events','事件与 CQRS：提交之后发生了什么','把服务崩溃放在“状态已写入、消息尚未发送”之间，观察写模型、待发消息与读模型。')+
      `<div class="lab-layout"><section class="lab-panel"><div class="controls"><label class="field" for="delivery-mode">写入策略<select id="delivery-mode">${option('outbox','状态 + Outbox 同事务',d.mode)}${option('dual','先写状态，再直接发消息（反例）',d.mode)}</select></label></div><label class="check-field"><input id="delivery-dedup" type="checkbox" ${d.dedup?'checked':''}>消费者以 eventId 去重</label><p class="caption">切换策略或去重选项会重置实验。</p><div class="actions"><button id="delivery-commit" class="primary" data-action="delivery-commit" ${d.committed?'disabled':''}>完成评审并在发送前崩溃</button><button id="delivery-recover" data-action="delivery-recover" ${!d.committed?'disabled':''}>重启并尝试转发</button><button id="delivery-duplicate" data-action="delivery-duplicate" ${!d.delivered?'disabled':''}>重复投递同一事件</button><button data-action="delivery-reset">重置</button></div><div class="model-state">${row('服务进程',d.alive?'运行中':'已崩溃')}${row('写模型 · ReviewCycle',d.committed?'已接受':'评审中')}${row('持久化待发记录',d.mode==='outbox'?(d.pending?'待投递':d.delivered?'已投递':'无'):'无 Outbox')}${row('读模型 · 目录摘要',d.read==='ACCEPTED'?'已通过评审':'评审中')}${row('入库业务动作累计',d.count+' 次')}</div>${logView(d.log)}</section><aside class="lab-panel"><h3>这里同时区分了三件事</h3><p><strong>CQRS：</strong>写模型执行业务规则，读模型服务列表查询。本实验刻意采用异步投影，便于观察延迟；CQRS 本身不强制异步。</p><p><strong>Outbox：</strong>状态已提交时，待发消息也已持久化。恢复后还能找到它。</p><p><strong>幂等：</strong>消息可能重发。去重记录与目录更新应同事务提交。</p><div class="callout amber"><p>关闭去重时，“入库动作累计”展示重复副作用。实际目录若按主键覆盖，部分写入可能天然幂等，但其他副作用仍需分析。</p></div><p>本演算不自动恢复无 Outbox 的丢失消息；真实系统可能使用其他日志或对账机制修复，但必须另外设计。</p><a class="caption" href="#chapter/ch8">回到第 8 章 →</a></aside></div>`;
  }
  function contextLab() {
    return labHeader('context','防腐层：同一个人，不同的模型','切换整合策略，看看外部账号事实如何进入评审语言。')+
      `<section class="lab-panel"><div class="controls"><label class="field" for="context-mode">下游整合策略<select id="context-mode">${option('acl','ACL：显式翻译为本地概念',contextMode)}${option('conformist','Conformist：接受上游模型',contextMode)}</select></label><label class="check-field"><input id="external-enabled" type="checkbox" ${externalEnabled?'checked':''}>上游账号已启用</label></div><div class="context-diagram"><div class="diagram-node"><strong>身份上下文 · 上游</strong>subject: li<br>organization: team-A<br>enabled: ${externalEnabled}<br>roles: [reviewer]</div><div class="diagram-arrow" aria-hidden="true">→</div><div class="diagram-node core"><strong>${contextMode==='acl'?'ReviewerTranslator':'直接接受上游概念'}</strong>${contextMode==='acl'?'subject → ReviewerId<br>organization → TenantId<br>enabled + role → eligible':'保留 IdentityPerson 结构<br>业务代码理解上游字段'}</div><div class="diagram-arrow" aria-hidden="true">→</div><div class="diagram-node"><strong>评审上下文 · 下游</strong>${contextMode==='acl'?`ReviewerProfile<br>id: li<br>eligible: ${externalEnabled}`:`IdentityPerson<br>enabled: ${externalEnabled}<br>roles: [reviewer]`}</div></div><div class="lab-feedback">${contextMode==='acl'?'本地模型只接收评审所需事实，外部字段变化集中在适配器处理。是否为作者、专业是否匹配仍由本地规则决定。':'接受上游模型可以降低映射成本，但评审代码会受上游语义影响。这是一种有意识的取舍，并非在任何情况下都错误。'}</div><p>本例已约定“账号启用且具备 reviewer 角色”映射为基础资格。如果上游改变 enabled 的业务含义，仅改字段名不够，必须重新确认契约。</p></section><div class="section-top"><h2>映射模式对照</h2></div><div class="table-wrap"><table><thead><tr><th>模式</th><th>主要责任</th><th>选择线索</th></tr></thead><tbody>${data.relationships.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><a href="#chapter/ch3">回到第 3 章 →</a>`;
  }
  function replayLab() {
    const events=[
      {type:'RoundOpened',desc:'为 doc-v3 开启双人评审',actor:null},
      {type:'OpinionSubmitted',desc:'李明提交赞成',actor:'li',vote:'APPROVE'},
      {type:'OpinionSubmitted',desc:'王芳提交'+votes[replayVote],actor:'wang',vote:replayVote},
      {type:'RoundCompleted',desc:replayVote==='APPROVE'?'结果：接受':'结果：不通过',result:replayVote==='APPROVE'?'ACCEPTED':'REJECTED'}
    ];
    let projection={exists:false,status:'OPEN',opinions:{}};
    for (const e of events.slice(0,replayCursor)) {
      if (e.type==='RoundOpened') projection.exists=true;
      if (e.type==='OpinionSubmitted') projection.opinions[e.actor]=e.vote;
      if (e.type==='RoundCompleted') projection.status=e.result;
    }
    return labHeader('replay','事件重放：状态从哪里来','拖动时间线，让同一条事件流在不同位置恢复出状态。比较“保存当前值”与“保存如何变化”。')+
      `<div class="lab-layout"><section class="lab-panel"><label class="field" for="replay-vote">选择一个独立历史场景<select id="replay-vote">${option('APPROVE','两位审稿人都赞成',replayVote)}${option('REJECT','王芳反对',replayVote)}</select></label><p class="caption">切换会生成另一条教学事件流并回到起点，不代表允许修改真实历史事件。</p><label class="range-label" for="replay-range"><span>重放到第几个事件</span><strong>${replayCursor} / 4</strong></label><input id="replay-range" class="range-input" type="range" min="0" max="4" step="1" value="${replayCursor}"><div class="actions"><button id="replay-prev" data-action="replay-prev" ${replayCursor===0?'disabled':''}>上一个事实</button><button id="replay-next" data-action="replay-next" ${replayCursor===4?'disabled':''}>重放下一个</button></div><div class="event-stream">${events.map((e,i)=>`<div class="event-row ${i<replayCursor?'applied':''}"><b>${i+1}</b><div>${e.type}<small>${esc(e.desc)}</small></div><span style="margin-left:auto" aria-label="${i<replayCursor?'已应用':'未应用'}">${i<replayCursor?'✓':'·'}</span></div>`).join('')}</div></section><aside class="lab-panel"><h3>归约得到的状态</h3><div class="model-state" aria-live="polite">${row('聚合是否存在',projection.exists?'存在':'尚未创建')}${row('状态',projection.exists?statuses[projection.status]:'—')}${row('已知意见',opinionText(projection.opinions))}${row('恢复流版本',replayCursor)}${row('重放发送邮件次数','0')}</div><p>即使两份意见已经齐备，第三个事件之后仍是评审中。第四个“已结束”事实才改变最终状态；不能用今天的规则推测历史上已经结束。</p><p>实际系统按预期流版本原子追加，重放只应用事实。快照用于缩短恢复时间，不替代历史契约治理。</p><a href="#chapter/appendix" class="caption">回到附录 A →</a></aside></div>`;
  }

  function currentRoute() { return location.hash.slice(1) || 'overview'; }
  function render({keepPosition=false, focusKey=null}={}) {
    const route=currentRoute(), [section,id]=route.split('/'), oldY=window.scrollY;
    if (route==='main') { $('#main').focus(); return; }
    let html, title;
    if (section==='chapter' && chapterById(id)) { const c=chapterById(id); html=chapter(c); title=`${c.n} / ${c.title}`; }
    else if (section==='lab' && labs.some(l=>l[0]===id)) {
      html=({aggregate:aggregateLab,concurrency:concurrencyLab,events:eventsLab,context:contextLab,replay:replayLab})[id](); title='设计实验室';
    } else if (route==='case') {html=caseView();title='贯穿案例';}
    else if (route==='glossary') {html=glossary();title='术语速查';}
    else if (route==='notes') {html=notesView();title='学习记录';}
    else if (route==='sources') {html=sourcesView();title='资料与核验范围';}
    else {html=overview();title='学习地图';}
    $('#main').innerHTML=html;
    $('#breadcrumb').textContent=title;
    document.title=`${title} · 实现领域驱动设计学习手册`;
    nav(route); $('#storage-warning').hidden=storageOk;
    if (keepPosition) {
      window.scrollTo({top:oldY,behavior:'instant'});
      if (focusKey) $(focusKey)?.focus({preventScroll:true});
    } else { window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); }
  }
  function pushLog(list, message) { list.push(message); if(list.length>12)list.shift(); }
  function processAggregate(action) {
    const a=aggregate;
    if (action==='aggregate-reset') {aggregate=newAggregate();return;}
    let error='';
    if(a.status!=='OPEN') error='本轮已结束，不能继续提交或再次结束。';
    else if(action==='aggregate-submit') {
      if(a.actor==='author') error='拒绝：作者不是本轮指定审稿人。';
      else if(a.opinions[a.actor]) error='拒绝：这位审稿人已经提交，不能覆盖已有意见。';
      else {a.opinions[a.actor]=a.vote;a.message=`已记录${names[a.actor]}的${votes[a.vote]}意见，轮次仍为开放状态。`;}
    } else if(action==='aggregate-finish') {
      if(Object.keys(a.opinions).length!==2)error='拒绝结束：两位指定审稿人的意见尚未齐备。不变量保护了状态。';
      else {a.status=Object.values(a.opinions).every(v=>v==='APPROVE')?'ACCEPTED':'REJECTED';a.message=`本轮${statuses[a.status]}，产生一条 ReviewCompleted 事实。`;}
    }
    a.error=!!error;if(error)a.message=error;pushLog(a.log,a.message);
  }
  function processConcurrency(action, client) {
    if(action==='concurrency-reset'){concurrency=newConcurrency();return;}
    const c=concurrency, person=client==='a'?'li':'wang', request=c[client];
    if(action==='concurrency-read') {
      c[client]={version:c.version,opinions:{...c.opinions}};
      pushLog(c.log,`${client.toUpperCase()} 重新加载版本 ${c.version}，带入已保存的意见。`);return;
    }
    if(request.opinions[person]) {pushLog(c.log,`${client.toUpperCase()} 的当前快照已包含本人的意见。聚合拒绝重复提交。`);return;}
    if(c.cas&&request.version!==c.version) {
      pushLog(c.log,`版本冲突：${client.toUpperCase()} 期望 ${request.version}，数据库已为 ${c.version}。没有写入，请先重新加载。`);return;
    }
    const next={...request.opinions,[person]:'APPROVE'};
    const lost=Object.keys(c.opinions).filter(k=>!next[k]);
    c.opinions=next;c.version++;
    c[client]={version:c.version,opinions:{...next}};
    pushLog(c.log,`${client.toUpperCase()} 保存成功，版本 ${c.version}。${lost.length?'警告：'+lost.map(k=>names[k]).join('、')+'的意见被旧快照覆盖。':'现有 '+Object.keys(next).length+' 份意见。'}`);
  }
  function deliver(isDuplicate=false) {
    const d=delivery;
    if(d.dedup&&d.seen)pushLog(d.log,'相同 eventId 已处理：跳过本次目录业务动作。');
    else {d.read='ACCEPTED';d.count++;d.seen=true;pushLog(d.log,`${isDuplicate?'重复事件仍被处理':'事件已消费'}：目录变为已通过，入库业务动作累计 ${d.count} 次。`);}
    d.delivered=true;d.pending=false;
  }
  function processDelivery(action) {
    const d=delivery;
    if(action==='delivery-reset'){delivery=newEvents(d.mode,d.dedup);return;}
    if(action==='delivery-commit'&&!d.committed) {
      d.committed=true;d.alive=false;d.pending=d.mode==='outbox';
      pushLog(d.log,d.mode==='outbox'?'状态与待发事件已同事务提交，发送前进程崩溃；读侧仍旧。':'状态已提交，发消息前进程崩溃，没有持久化待发记录。');
    } else if(action==='delivery-recover'&&d.committed) {
      d.alive=true;
      if(d.pending)deliver();
      else pushLog(d.log,d.delivered?'没有剩余待发记录。可模拟确认丢失导致的重复投递。':'服务已重启，但没有可恢复的待发记录。目录仍为旧状态，需要另行对账或修复。');
    } else if(action==='delivery-duplicate'&&d.delivered)deliver(true);
  }
  async function copyText(text) {
    try {await navigator.clipboard.writeText(text);toast('代码已复制');}
    catch (_) {
      const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();
      const ok=document.execCommand('copy');area.remove();toast(ok?'代码已复制':'浏览器不允许自动复制，请选中代码手动复制');
    }
  }
  function exportState() {
    const blob=new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
    const link=document.createElement('a'),url=URL.createObjectURL(blob);
    link.href=url;link.download='DDD-红皮书-学习记录.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('学习记录已导出');
  }
  document.addEventListener('click', event => {
    const depthLink=event.target.closest('[data-depth]');if(depthLink){state.depth=depthLink.dataset.depth;save();}
    const target=event.target.closest('[data-action]');
    if(!target)return;
    const action=target.dataset.action, id=target.dataset.id;
    if(action==='copy'){copyText(chapterById(id).example.code);return;}
    if(action==='print'){window.print();return;}
    if(action==='export'){exportState();return;}
    if(action==='import'){$('#import-file').click();return;}
    if(action==='answer') {
      const c=chapterById(id),i=Number(target.dataset.question),answer=Number(target.dataset.option);
      state.answers[`${id}-${i}`]=answer;save();
      $(`#quiz-${i}`).outerHTML=renderQuiz(c,i);
      $(`#quiz-${i} [data-option="${answer}"]`).focus({preventScroll:true});return;
    }
    if(action==='done') {
      state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];save();
      target.textContent=state.done.includes(id)?'✓ 已读 · 点击撤销':'标记已读';target.setAttribute('aria-pressed',String(state.done.includes(id)));nav(currentRoute());toast(state.done.includes(id)?'已记录本章阅读进度':'已撤销已读标记');return;
    }
    if(action==='depth') {state.depth=target.dataset.value;save();render({keepPosition:true,focusKey:`[data-action="depth"][data-value="${state.depth}"]`});return;}
    if(action==='case-step')caseStep=Number(target.dataset.step);
    else if(action==='case-prev')caseStep=Math.max(0,caseStep-1);
    else if(action==='case-next')caseStep=Math.min(5,caseStep+1);
    else if(action.startsWith('aggregate-'))processAggregate(action);
    else if(action.startsWith('concurrency-'))processConcurrency(action,target.dataset.client);
    else if(action.startsWith('delivery-'))processDelivery(action);
    else if(action==='replay-prev')replayCursor=Math.max(0,replayCursor-1);
    else if(action==='replay-next')replayCursor=Math.min(4,replayCursor+1);
    else return;
    const selector=target.id?`#${target.id}`:`[data-action="${action}"]${target.dataset.step?`[data-step="${target.dataset.step}"]`:''}`;
    render({keepPosition:true,focusKey:selector});
  });
  document.addEventListener('change',event=>{
    const t=event.target;
    if(t.id==='aggregate-design')aggregate.design=t.value;
    else if(t.id==='aggregate-actor'){aggregate.actor=t.value;return;}
    else if(t.id==='aggregate-vote'){aggregate.vote=t.value;return;}
    else if(t.id==='concurrency-cas'){concurrency=newConcurrency();concurrency.cas=t.checked;}
    else if(t.id==='delivery-mode')delivery=newEvents(t.value,delivery.dedup);
    else if(t.id==='delivery-dedup')delivery=newEvents(delivery.mode,t.checked);
    else if(t.id==='context-mode')contextMode=t.value;
    else if(t.id==='external-enabled')externalEnabled=t.checked;
    else if(t.id==='replay-vote'){replayVote=t.value;replayCursor=0;}
    else return;
    render({keepPosition:true,focusKey:`#${t.id}`});
  });
  document.addEventListener('input',event=>{
    const t=event.target;
    if(t.id==='chapter-note') {
      state.notes[t.dataset.id]=t.value;save();
      $('#note-status').textContent=storageOk?'笔记已保存到本浏览器。':'无法持久保存，请导出本次笔记。';
    } else if(t.id==='glossary-filter')$('#glossary-list').innerHTML=glossaryCards(t.value);
    else if(t.id==='replay-range') {
      replayCursor=Number(t.value);
      const template=document.createElement('template');template.innerHTML=replayLab();
      $('.range-label strong').textContent=`${replayCursor} / 4`;
      $('.event-stream').innerHTML=$('.event-stream',template.content).innerHTML;
      $('.lab-layout aside .model-state').innerHTML=$('.lab-layout aside .model-state',template.content).innerHTML;
      $('#replay-prev').disabled=replayCursor===0;$('#replay-next').disabled=replayCursor===4;
    }
  });
  $('#import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try {
      if(file.size>1000000)throw new Error('文件超过 1 MB，请选择本手册导出的学习记录');
      const incoming=validateState(JSON.parse(await file.text()));
      state={...state,done:[...new Set([...state.done,...incoming.done])],answers:{...state.answers,...incoming.answers},notes:{...state.notes,...incoming.notes}};
      save();render({keepPosition:true});toast('已合并学习记录');
    } catch(error){toast('导入失败：'+error.message);}
    event.target.value='';
  });
  function setTheme() {
    document.body.dataset.theme=state.theme;
    $('#theme-toggle').setAttribute('aria-label',state.theme==='light'?'切换深色主题':'切换浅色主题');
  }
  $('#theme-toggle').addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';setTheme();save();});
  function closeMenu() {$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');$('#menu-toggle').setAttribute('aria-label','展开目录');}
  $('#menu-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-toggle').setAttribute('aria-expanded',String(open));$('#menu-toggle').setAttribute('aria-label',open?'收起目录':'展开目录');});
  $('#main').addEventListener('click',closeMenu);
  function search() {
    const query=$('#search').value.trim().toLowerCase(),result=$('#search-results');
    if(!query){result.hidden=true;return;}
    const found=data.chapters.filter(c=>JSON.stringify(c).toLowerCase().includes(query)).slice(0,8);
    const terms=data.glossary.filter(g=>g.join(' ').toLowerCase().includes(query)).slice(0,3);
    result.innerHTML=(found.length||terms.length)?[...found.map(c=>`<a href="#chapter/${c.id}"><strong>${c.n} · ${esc(c.title)}</strong><small>${esc(c.question)}</small></a>`),...terms.map(g=>`<a href="#chapter/${g[3]}"><strong>术语 · ${esc(g[0])}</strong><small>${esc(g[1])}</small></a>`)].join(''):'<p role="status">没有找到结果，试试“仓储”“事件”“身份”或英文术语。</p>';
    result.hidden=false;
  }
  $('#search').addEventListener('input',search);
  $('#search').addEventListener('focus',()=>{if($('#search').value)search();});
  $('#search').addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();$('#search-results a')?.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.search-wrap'))$('#search-results').hidden=true;});
  document.addEventListener('keydown',event=>{
    const typing=event.target.matches('input,textarea,select')||event.target.isContentEditable;
    if((event.key==='/'&&!typing)||((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')){event.preventDefault();$('#search').focus();}
    if(event.key==='Escape'){$('#search-results').hidden=true;closeMenu();}
  });
  window.addEventListener('hashchange',()=>{closeMenu();$('#search-results').hidden=true;render();});
  setTheme();render();
})();
