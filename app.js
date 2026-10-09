// 阅读人格测试 · 读书版 MBTI — readinghub 病毒传播小工具
// 4 轴 × 3 题 = 12 道快速二选一，纯离线 Canvas 出结果卡
// 四轴：信息获取(发/收)、判断方式(逻/觉)、行动倾向(进/慎)、不确定性(控/顺)
(function () {
  'use strict';

  // ── 数据 ──────────────────────────────────────────────────────

  var AXES = [
    { key: 'information', labels: ['发散型', '聚焦型'], chars: ['发', '收'],
      desc: ['广泛涉猎，跨领域找灵感', '深耕一个领域，吃透再换'] },
    { key: 'judgment',    labels: ['逻辑型', '直觉型'], chars: ['逻', '觉'],
      desc: ['靠论证和数据下判断', '靠感觉和模式识别'] },
    { key: 'action',      labels: ['行动型', '审慎型'], chars: ['进', '慎'],
      desc: ['看到好方法立刻去试', '想清楚再动手，宁缺勿乱'] },
    { key: 'uncertainty',  labels: ['掌控型', '顺势型'], chars: ['控', '顺'],
      desc: ['喜欢有框架有计划', '随遇而安，灵活应变'] },
  ];

  var QUESTIONS = [
    // information ×3
    { axis: 0, a: '同时在读好几本完全不同类型的书', b: '一本读完、消化了再开下一本' },
    { axis: 0, a: '觉得最好的灵感来自「不相关」的领域', b: '觉得最好的收获来自「同一领域」的反复深挖' },
    { axis: 0, a: '书架像杂货铺，什么类型都有', b: '书架有明确主题，围绕几个核心方向' },
    // judgment ×3
    { axis: 1, a: '读到一个观点，先看有没有数据或实验支撑', b: '读到一个观点，先感受「这说的就是我」' },
    { axis: 1, a: '做读书笔记喜欢画逻辑图、列结构', b: '做读书笔记更像写日记，记感触和联想' },
    { axis: 1, a: '两本书冲突时，倾向比较谁的论证更严密', b: '两本书冲突时，倾向看哪个更符合自己的经验' },
    // action ×3
    { axis: 2, a: '读到好方法会立刻在生活中试一把', b: '读到好方法会先记下来，等合适的场景再用' },
    { axis: 2, a: '「读了不用 = 没读」', b: '「读书是为了改变思维，不急着用」' },
    { axis: 2, a: '边读边做实验，哪怕翻车也值', b: '先把这个领域读完几本再动手，减少弯路' },
    // uncertainty ×3
    { axis: 3, a: '每年有明确的阅读计划和书单', b: '随缘遇到什么读什么，跟着兴趣走' },
    { axis: 3, a: '喜欢有体系的书（框架、模型、清单）', b: '喜欢开放式的书（散文、叙事、留白多）' },
    { axis: 3, a: '读完一本会给它归类打标签', b: '读完就读完了，不需要分类整理' },
  ];

  // 16 种类型的解读词（4 轴二选一 = 2^4 = 16）
  var TYPE_MAP = {
    '发-逻-进-控': { title: '全栈拆书机', icon: '⚡', brief: '什么都读、逻辑拆解、立刻上手、体系控', vibe: '你是那种"读完一本书就能写出操作手册"的人。效率惊人，但别忘了偶尔允许自己"无目的地读"。' },
    '发-逻-进-顺': { title: '知识冒险家', icon: '🧭', brief: '广泛猎奇、理性验证、快速试错、灵活应变', vibe: '好奇心驱动，逻辑护航，行动力拉满。你像是知识世界的探险家——但小心变成"什么都试，什么都浅"。' },
    '发-逻-慎-控': { title: '战略分析师', icon: '🎯', brief: '博览群书、冷静分析、想清楚再动、讲究体系', vibe: '你读书像做投研报告：广泛收集、严格筛选、谨慎结论。深度可怕，但有时"差不多就行"也是一种智慧。' },
    '发-逻-慎-顺': { title: '从容观察者', icon: '🌊', brief: '什么都看、理性思考、不急行动、随遇而安', vibe: '你有一种"看透但不说透"的气质。读书对你来说是理解世界的方式，不一定要改变什么。' },
    '发-觉-进-控': { title: '灵感执行官', icon: '🔥', brief: '跨界找灵感、直觉选书、即刻行动、有自己的体系', vibe: '你的书架是灵感弹药库，读到什么好东西马上就往项目里塞。创造力 × 执行力，很能出活。' },
    '发-觉-进-顺': { title: '自由创作者', icon: '🎨', brief: '兴趣驱动、凭感觉读、边读边做、完全自由', vibe: '你是"把读书变成创作素材"的人。没有计划反而是你的计划——灵感来了挡都挡不住。' },
    '发-觉-慎-控': { title: '文艺策展人', icon: '🖼️', brief: '广泛涉猎、感性体验、深思熟虑、条理分明', vibe: '你读书像策展——广泛收集，但最终呈现出来的都经过精心挑选和编排。审美 × 秩序感。' },
    '发-觉-慎-顺': { title: '漫步思考者', icon: '🍃', brief: '随性阅读、感受优先、不急不躁、享受过程', vibe: '你是最"享受阅读本身"的类型。不赶进度、不求输出，在文字里散步就是目的。让你列书单？不存在的。' },
    '收-逻-进-控': { title: '效率专精者', icon: '🏗️', brief: '深耕一个方向、逻辑拆解、立刻实践、严格计划', vibe: '你是"读一个领域就要成为专家"的人。每本书都是砖，最后砌成一面专业的墙。执行力和专注力都拉满。' },
    '收-逻-进-顺': { title: '务实实验家', icon: '🔧', brief: '聚焦深耕、数据驱动、快速验证、灵活调整', vibe: '你读书是为了解决具体问题：找方法、试方法、验证方法。不灵就换，灵了就用——极致务实。' },
    '收-逻-慎-控': { title: '学术建筑师', icon: '🏛️', brief: '专注一域、严谨论证、深思后动、追求体系', vibe: '你的阅读方式最像做学术研究：系统、严密、不放过细节。知识体系像建筑一样稳固，但偶尔也需要推倒重来的勇气。' },
    '收-逻-慎-顺': { title: '沉静研究者', icon: '📖', brief: '一个领域慢慢读、理性分析、不急不躁、随缘遇书', vibe: '你有学者的气质但没有学者的焦虑。深入但不执念，认真但不较劲——这可能是最健康的读书方式。' },
    '收-觉-进-控': { title: '深度实践家', icon: '💎', brief: '深耕热爱、直觉敏锐、知行合一、有自己的节奏', vibe: '你在自己热爱的领域既有直觉又有行动力。不是"什么都懂一点"，而是"这一块我说了算"。' },
    '收-觉-进-顺': { title: '热忱匠人', icon: '🔨', brief: '专注一事、凭热爱驱动、边做边学、随性但深入', vibe: '你读书是因为真心喜欢这个领域，不是为了"应该读"。热爱驱动的学习最持久，也最有穿透力。' },
    '收-觉-慎-控': { title: '品鉴收藏家', icon: '🎭', brief: '精选阅读、感性品味、反复品读、井然有序', vibe: '你的书架不大但每一本都是精品。你会反复读同一本书，每次都有新发现——质量 > 数量的忠实信徒。' },
    '收-觉-慎-顺': { title: '心灵漫游者', icon: '🌙', brief: '在热爱的角落里慢慢读、跟着感觉走、不赶路', vibe: '你像是在一座小花园里反复散步的人——不贪多，不赶路，每次都能发现一朵新开的花。' },
  };

  // ── 状态 ──────────────────────────────────────────────────────

  var state = {
    phase: 'intro',       // intro | quiz | result
    current: 0,           // 当前题号
    answers: [],          // 0..11，值 'a' 或 'b'
    scores: [0, 0, 0, 0], // 四轴得分（a 选择次数 / 3）
    code: '',             // 如 '发-逻-进-控'
    shuffled: null,       // 打乱后的题目索引
  };

  // Fisher-Yates 洗牌
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // ── 渲染 ──────────────────────────────────────────────────────

  var root = document.getElementById('app');

  function render() {
    if (state.phase === 'intro') renderIntro();
    else if (state.phase === 'quiz') renderQuiz();
    else renderResult();
  }

  function renderIntro() {
    root.innerHTML = '';
    var wrap = el('div', 'intro-screen');

    var badge = el('div', 'brand-badge');
    badge.textContent = 'readinghub';
    wrap.appendChild(badge);

    var h = el('h1', 'intro-title');
    h.textContent = '你是哪种读书人？';
    wrap.appendChild(h);

    var sub = el('p', 'intro-sub');
    sub.textContent = '12 道快问快答，解锁你的阅读人格\n— 读书版 MBTI —';
    wrap.appendChild(sub);

    var axes = el('div', 'intro-axes');
    AXES.forEach(function (ax) {
      var row = el('div', 'axis-preview');
      var left = el('span', 'axis-char left'); left.textContent = ax.chars[0] + ' ' + ax.labels[0];
      var vs = el('span', 'axis-vs'); vs.textContent = 'vs';
      var right = el('span', 'axis-char right'); right.textContent = ax.labels[1] + ' ' + ax.chars[1];
      row.appendChild(left); row.appendChild(vs); row.appendChild(right);
      axes.appendChild(row);
    });
    wrap.appendChild(axes);

    var btn = el('button', 'start-btn');
    btn.textContent = '开始测试 →';
    btn.addEventListener('click', startQuiz);
    wrap.appendChild(btn);

    var note = el('p', 'intro-note');
    note.textContent = '纯离线运行，不收集任何数据';
    wrap.appendChild(note);

    root.appendChild(wrap);
  }

  function startQuiz() {
    state.phase = 'quiz';
    state.current = 0;
    state.answers = [];
    state.scores = [0, 0, 0, 0];
    state.shuffled = shuffle([0,1,2,3,4,5,6,7,8,9,10,11]);
    render();
  }

  function renderQuiz() {
    var idx = state.shuffled[state.current];
    var q = QUESTIONS[idx];
    root.innerHTML = '';
    var wrap = el('div', 'quiz-screen');

    // 进度
    var prog = el('div', 'progress-bar');
    var fill = el('div', 'progress-fill');
    fill.style.width = Math.round((state.current / 12) * 100) + '%';
    prog.appendChild(fill);
    wrap.appendChild(prog);
    var pText = el('div', 'progress-text');
    pText.textContent = (state.current + 1) + ' / 12';
    wrap.appendChild(pText);

    // 轴标签
    var axTag = el('div', 'axis-tag');
    axTag.textContent = AXES[q.axis].labels[0] + ' vs ' + AXES[q.axis].labels[1];
    wrap.appendChild(axTag);

    // 题干（隐含在选项里，无需单独展示）
    var prompt = el('div', 'quiz-prompt');
    prompt.textContent = '更像你的是哪个？';
    wrap.appendChild(prompt);

    // 选项 A
    var btnA = el('button', 'option-btn');
    btnA.textContent = q.a;
    btnA.addEventListener('click', function () { answer('a'); });
    wrap.appendChild(btnA);

    // 选项 B
    var btnB = el('button', 'option-btn');
    btnB.textContent = q.b;
    btnB.addEventListener('click', function () { answer('b'); });
    wrap.appendChild(btnB);

    root.appendChild(wrap);
  }

  function answer(choice) {
    var idx = state.shuffled[state.current];
    var q = QUESTIONS[idx];
    state.answers.push(choice);
    if (choice === 'a') state.scores[q.axis]++;
    state.current++;
    if (state.current >= 12) {
      calcResult();
      state.phase = 'result';
    }
    render();
  }

  function calcResult() {
    var chars = [];
    for (var i = 0; i < 4; i++) {
      chars.push(state.scores[i] >= 2 ? AXES[i].chars[0] : AXES[i].chars[1]);
    }
    state.code = chars.join('-');
  }

  // ── 结果页 ────────────────────────────────────────────────────

  function renderResult() {
    var info = TYPE_MAP[state.code] || { title: '独特读书人', icon: '📚', brief: state.code, vibe: '你的组合很特别！' };
    root.innerHTML = '';
    var wrap = el('div', 'result-screen');

    // 结果卡片
    var card = el('div', 'result-card');

    var iconEl = el('div', 'result-icon');
    iconEl.textContent = info.icon;
    card.appendChild(iconEl);

    var codeEl = el('div', 'result-code');
    codeEl.textContent = state.code;
    card.appendChild(codeEl);

    var titleEl = el('h2', 'result-title');
    titleEl.textContent = info.title;
    card.appendChild(titleEl);

    var briefEl = el('div', 'result-brief');
    briefEl.textContent = info.brief;
    card.appendChild(briefEl);

    var vibeEl = el('div', 'result-vibe');
    vibeEl.textContent = info.vibe;
    card.appendChild(vibeEl);

    // 四轴图表
    var chart = el('div', 'axes-chart');
    for (var i = 0; i < 4; i++) {
      var pct = Math.round(state.scores[i] / 3 * 100);
      var row = el('div', 'axis-row');

      var labelL = el('span', 'ax-label left');
      labelL.textContent = AXES[i].chars[0] + ' ' + AXES[i].labels[0];
      row.appendChild(labelL);

      var bar = el('div', 'ax-bar');
      var barFill = el('div', 'ax-fill');
      barFill.style.width = pct + '%';
      if (pct >= 67) barFill.classList.add('strong');
      bar.appendChild(barFill);
      // 中线
      var mid = el('div', 'ax-mid');
      bar.appendChild(mid);
      row.appendChild(bar);

      var labelR = el('span', 'ax-label right');
      labelR.textContent = AXES[i].labels[1] + ' ' + AXES[i].chars[1];
      row.appendChild(labelR);

      chart.appendChild(row);
    }
    card.appendChild(chart);

    // 品牌水印
    var brand = el('div', 'result-brand');
    brand.textContent = 'readinghub · 读书中枢';
    card.appendChild(brand);

    wrap.appendChild(card);

    // 操作按钮
    var actions = el('div', 'result-actions');

    var postBtn = el('button', 'post-btn');
    postBtn.textContent = '🚀 一键发笔记';
    postBtn.addEventListener('click', postAsNote);
    actions.appendChild(postBtn);

    var saveBtn = el('button', 'save-btn');
    saveBtn.textContent = '💾 存相册';
    saveBtn.addEventListener('click', saveResultImage);
    actions.appendChild(saveBtn);

    var retryBtn = el('button', 'retry-btn');
    retryBtn.textContent = '🔄 再测';
    retryBtn.addEventListener('click', function () {
      state.phase = 'intro';
      render();
    });
    actions.appendChild(retryBtn);

    wrap.appendChild(actions);

    var tip = el('p', 'result-tip');
    tip.textContent = '一键发笔记，或存相册后手动分享';
    wrap.appendChild(tip);

    root.appendChild(wrap);

    persistResult();
  }

  // ── 端能力封装（window.xhs.miniTool，容器注入） ──────────────
  // 每次调用前判空；未注入（普通浏览器预览）返回 false 走降级路径。

  function miniTool() {
    return window.xhs && window.xhs.miniTool;
  }
  function hasAPI(name) {
    var mt = miniTool();
    return !!(mt && typeof mt[name] === 'function');
  }

  // 出图 + 拿到可传给端 API 的本地文件句柄（大图走 writeTempFile，小图直接 data URI）
  function makeResultCanvas() {
    var info = TYPE_MAP[state.code] || { title: '独特读书人', icon: '📚', brief: state.code, vibe: '你的组合很特别！' };
    var W = 1080, H = 1440;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var FONT = '"PingFang SC","Noto Sans SC",sans-serif';

    // 背景渐变（readinghub 暖纸色系）
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#F2EDE5');
    grad.addColorStop(1, '#E6DDD2');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 顶部品牌
    ctx.font = '500 36px ' + FONT;
    ctx.fillStyle = '#A09585';
    ctx.textAlign = 'center';
    ctx.fillText('readinghub · 读书中枢', W / 2, 100);

    // 装饰线
    ctx.fillStyle = '#2B5F5A';
    ctx.fillRect(W / 2 - 40, 130, 80, 4);

    // 标题
    ctx.font = '400 48px ' + FONT;
    ctx.fillStyle = '#6B5F52';
    ctx.fillText('我的阅读人格', W / 2, 210);

    // icon
    ctx.font = '120px ' + FONT;
    ctx.fillText(info.icon, W / 2, 380);

    // 类型码
    ctx.font = '800 72px ' + FONT;
    ctx.fillStyle = '#2B5F5A';
    ctx.fillText(state.code, W / 2, 470);

    // 类型名
    ctx.font = '800 80px ' + FONT;
    ctx.fillStyle = '#1A1612';
    ctx.fillText(info.title, W / 2, 570);

    // brief
    ctx.font = '500 36px ' + FONT;
    ctx.fillStyle = '#6B5F52';
    var briefLines = wrapText(ctx, info.brief, W - 200);
    var by = 640;
    for (var bi = 0; bi < briefLines.length; bi++) {
      ctx.fillText(briefLines[bi], W / 2, by);
      by += 48;
    }

    // 四轴条形图
    var chartY = by + 30;
    var barW = 500, barH = 28, barX = (W - barW) / 2;
    for (var i = 0; i < 4; i++) {
      var pct = state.scores[i] / 3;
      var y = chartY + i * 80;

      // 左标签
      ctx.font = '600 30px ' + FONT;
      ctx.fillStyle = pct >= 0.5 ? '#2B5F5A' : '#A09585';
      ctx.textAlign = 'right';
      ctx.fillText(AXES[i].chars[0] + ' ' + AXES[i].labels[0], barX - 16, y + 22);

      // 背景条
      roundRectFill(ctx, barX, y, barW, barH, 14, '#E6DDD2');

      // 填充条
      var fw = Math.max(barH, barW * pct);
      roundRectFill(ctx, barX, y, fw, barH, 14, pct >= 0.67 ? '#2B5F5A' : '#C9A84C');

      // 中线
      ctx.fillStyle = 'rgba(26,22,18,0.15)';
      ctx.fillRect(barX + barW / 2 - 1, y - 2, 2, barH + 4);

      // 右标签
      ctx.fillStyle = pct < 0.5 ? '#2B5F5A' : '#A09585';
      ctx.textAlign = 'left';
      ctx.fillText(AXES[i].labels[1] + ' ' + AXES[i].chars[1], barX + barW + 16, y + 22);
    }

    // vibe
    ctx.textAlign = 'center';
    ctx.font = '400 32px ' + FONT;
    ctx.fillStyle = '#6B5F52';
    var vibeY = chartY + 4 * 80 + 40;
    var vibeLines = wrapText(ctx, info.vibe, W - 200);
    for (var vi = 0; vi < vibeLines.length; vi++) {
      ctx.fillText(vibeLines[vi], W / 2, vibeY);
      vibeY += 44;
    }

    // 底部水印
    ctx.font = '500 28px ' + FONT;
    ctx.fillStyle = '#C4B8A8';
    ctx.fillText('扫码测测你是哪种读书人 ↑', W / 2, H - 60);

    return canvas;
  }

  // 把结果卡导出为可传端 API 的本地文件路径；无法转文件时回退 data URI
  function exportResultFilePath() {
    var canvas = makeResultCanvas();
    if (!canvas) return null;
    var dataUrl;
    try { dataUrl = canvas.toDataURL('image/png'); } catch (e) { return null; }
    if (hasAPI('writeTempFile')) {
      // 大图落成临时文件再传，避免超长 base64 上行；失败则直接用 data URI
      return miniTool().writeTempFile({ data: dataUrl }).then(function (res) {
        return res && res.filePath ? res.filePath : dataUrl;
      }).catch(function () { return dataUrl; });
    }
    return Promise.resolve(dataUrl);
  }

  // 原生存相册（降级：插入可长按预览图）
  function saveResultImage() {
    exportResultFilePath().then(function (path) {
      if (!path) { alert('无法生成图片'); return; }
      if (hasAPI('saveImageToPhotosAlbum')) {
        miniTool().saveImageToPhotosAlbum({ filePath: path }).then(function () {
          flashTip('已存入相册 ✓ 快去分享吧');
        }).catch(function () {
          showLongPressPreview(path);
        });
      } else {
        showLongPressPreview(path);
      }
    });
  }

  function showLongPressPreview(path) {
    var img = document.createElement('img');
    img.src = path;
    img.style.cssText = 'width:100%;max-width:360px;border-radius:12px;display:block;margin:16px auto 0';
    img.alt = '阅读人格结果卡';
    var existing = document.querySelector('.canvas-preview');
    if (existing) existing.parentNode.removeChild(existing);
    var container = el('div', 'canvas-preview');
    container.appendChild(img);
    var hint = el('p', 'save-hint');
    hint.textContent = '👆 长按图片保存到相册';
    container.appendChild(hint);
    document.querySelector('.result-screen').appendChild(container);
  }

  // 一键发笔记（postNote）—— 最强传播链路
  function postAsNote() {
    var info = TYPE_MAP[state.code] || { title: '独特读书人', icon: '📚', brief: state.code, vibe: '你的组合很特别！' };
    var title = '我是「' + info.title + '」阅读人格';
    var content = info.vibe + '\n\n#阅读人格测试 #读书 #readinghub';
    if (content.length > 1000) content = content.slice(0, 1000);
    if (title.length > 20) title = title.slice(0, 20);

    exportResultFilePath().then(function (path) {
      if (!path) { alert('无法生成图片'); return; }
      if (hasAPI('postNote')) {
        miniTool().postNote({
          title: title,
          content: content,
          pageType: 'photo_publish',
          mediaInfo: { image_resources: [{ url: path }] }
        }).then(function () {
          flashTip('已带入发布页 ✓ 点击发布即可');
        }).catch(function () {
          showLongPressPreview(path);
        });
      } else {
        showLongPressPreview(path);
      }
    });
  }

  // 测试结果持久化（setStorage 降级 localStorage）
  function persistResult() {
    var payload = JSON.stringify({ code: state.code, scores: state.scores, ts: Date.now() });
    if (hasAPI('setStorage')) {
      miniTool().setStorage({ key: 'readinghub:readtype', data: payload })
        .catch(function () { try { localStorage.setItem('readinghub:readtype', payload); } catch (e) {} });
    } else {
      try { localStorage.setItem('readinghub:readtype', payload); } catch (e) {}
    }
  }

  function flashTip(text) {
    var tip = document.querySelector('.result-tip');
    if (!tip) return;
    var old = tip.textContent;
    tip.textContent = text;
    setTimeout(function () { tip.textContent = old; }, 2000);
  }

  // ── 工具函数 ──────────────────────────────────────────────────

  function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var line = '';
    var chars = String(text || '');
    for (var ci = 0; ci < chars.length; ci++) {
      var ch = chars[ci];
      if (ch === '\n') { lines.push(line); line = ''; continue; }
      var test = line + ch;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = ch; }
      else { line = test; }
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRectFill(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ── 启动 ──────────────────────────────────────────────────────
  render();
})();
