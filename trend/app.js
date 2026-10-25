(function () {
  var SUBJ = [
    { k: 'c', name: '공통', short: '공', full: '수학Ⅰ · 수학Ⅱ', range: '1–22번' },
    { k: 'p', name: '확통', short: '확', full: '확률과 통계', range: '23–30번' },
    { k: 'm', name: '미적', short: '미', full: '미적분', range: '23–30번' }
  ];
  var data = window.TREND || { playlist: '', rounds: [] };
  var ua = navigator.userAgent || '';
  var ANDROID = /Android/i.test(ua);
  var MOBILE = ANDROID || /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var INAPP = /KAKAOTALK/i.test(ua) ? '카카오톡'
    : /NAVER\(inapp|NAVER\//i.test(ua) ? '네이버 앱'
    : /BAND\//i.test(ua) ? '밴드'
    : /Instagram/i.test(ua) ? '인스타그램'
    : /Line\//i.test(ua) ? '라인'
    : /DaumApps/i.test(ua) ? '다음 앱' : '';
  var state = { sel: null };
  var KAKAO_CHAT = 'https://pf.kakao.com/_nGLZX/chat';
  var ICON_TALK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.3 4.6 6.7L5.6 21l4-2.6c.8.1 1.6.2 2.4.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>';
  // 카카오톡 안에서 열리면 바깥 브라우저(크롬·사파리)로 넘긴다. 거기서는 영상이 유튜브 앱으로 열린다.
  function kakaoOut() { return 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href); }
  if (INAPP === '카카오톡') location.href = kakaoOut();

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function vid(r, k) { return r[k] && r[k][0] ? { id: r[k][0], len: r[k][1] || '' } : null; }
  function count(r) { return SUBJ.filter(function (s) { return vid(r, s.k); }).length; }
  function find(n) { return data.rounds.filter(function (r) { return r.n === n; })[0] || null; }
  function webUrl(id) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id); }
  function videoLink(id) {
    if (ANDROID && !INAPP) {
      return { href: 'intent://www.youtube.com/watch?v=' + encodeURIComponent(id) + '#Intent;scheme=https;package=com.google.android.youtube;S.browser_fallback_url=' + encodeURIComponent(webUrl(id)) + ';end', target: '' };
    }
    return { href: webUrl(id), target: MOBILE ? '' : ' target="_blank" rel="noopener"' };
  }
  function chromeOut() {
    return 'intent://' + location.host + location.pathname + '#Intent;scheme=https;package=com.android.chrome;end';
  }

  function defaultRound() {
    var h = (location.hash.match(/^#r(\d+)$/) || [])[1];
    if (h && find(+h)) return +h;
    var withVideo = data.rounds.filter(function (r) { return count(r) > 0; });
    return withVideo.length ? withVideo[withVideo.length - 1].n : (data.rounds[0] || {}).n;
  }

  function tileHtml(r) {
    var dots = SUBJ.map(function (s) { return '<span class="dot' + (vid(r, s.k) ? ' on' : '') + '" data-s="' + s.k + '" aria-hidden="true">' + s.short + '</span>'; }).join('');
    var c = count(r);
    return '<button type="button" class="tile' + (c ? '' : ' empty') + '" data-round="' + r.n + '" aria-pressed="' + (r.n === state.sel) + '" aria-label="' + r.n + '회차, 영상 ' + c + '개">' +
      '<span class="tile-num">' + r.n + '<small>회</small></span><span class="dots">' + dots + '</span></button>';
  }

  function subjHtml(r, s) {
    var v = vid(r, s.k);
    var head = '<span class="subj-name"><span class="subj-mark" aria-hidden="true"></span>' + s.name + '</span>';
    if (!v) {
      return '<div class="subj off" data-s="' + s.k + '">' + head + '<span class="subj-meta">' + s.full + ' · ' + s.range + '</span><span class="subj-go">영상 준비 중</span></div>';
    }
    var link = videoLink(v.id);
    return '<a class="subj" href="' + esc(link.href) + '"' + link.target + ' data-s="' + s.k + '">' + head +
      '<span class="subj-meta">' + s.full + ' · ' + s.range + (v.len ? ' · ' + esc(v.len) : '') + '</span>' +
      '<span class="subj-go"><span class="play" aria-hidden="true"></span>유튜브로 보기</span></a>';
  }

  function inappHtml() {
    if (!INAPP) return '';
    var btn = INAPP === '카카오톡' ? '<a class="btn btn-primary" href="' + esc(kakaoOut()) + '">다른 브라우저로 열기</a>'
      : ANDROID ? '<a class="btn btn-primary" href="' + esc(chromeOut()) + '">크롬으로 열기</a>' : '';
    return '<div class="inapp"><p><strong>' + INAPP + ' 안에서 열려 있어요.</strong> 여기서는 영상이 유튜브 앱 대신 웹으로 열릴 수 있어요. ' +
      '아래 버튼이나 화면 구석의 <b>⋮</b>(또는 공유) 버튼에서 「다른 브라우저로 열기」를 고르면 유튜브 앱으로 바로 볼 수 있어요.</p>' + btn + '</div>';
  }

  function render() {
    var r = find(state.sel);
    var total = data.rounds.reduce(function (a, x) { return a + count(x); }, 0);
    var panel = '';
    if (r) {
      var c = count(r);
      panel = '<div class="panel-head"><h2>' + r.n + '회차</h2><span class="panel-note">' + (c === 3 ? '공통 · 선택과목 영상 모두 올라옴' : c === 0 ? '아직 올라온 영상이 없어요' : '영상 ' + c + '개 올라옴') + '</span></div>' +
        '<div class="subjects">' + SUBJ.map(function (s) { return subjHtml(r, s); }).join('') + '</div>';
    }
    document.getElementById('app').innerHTML =
      '<div class="wrap look-emblem"><header class="mast"><div class="brand"><img class="emblem" src="emblem.png" alt="최준호 T 엠블럼">' +
      '<div class="brand-text"><span class="eyebrow">2027학년도 대학수학능력시험 대비 · 수학 영역</span><h1>The Trend 모의고사</h1></div></div>' +
      '<div class="mast-row"><span class="mast-sub">회차별 해설강의 · 최준호 T · 영상 ' + total + '개</span><span class="mast-links">' +
      '<a class="btn" href="https://www.youtube.com/playlist?list=' + esc(data.playlist) + '" target="_blank" rel="noopener">재생목록 전체 보기 ↗</a></span></div></header>' +
      inappHtml() +
      '<div class="layout"><section aria-labelledby="pick"><p class="label" id="pick">회차 고르기</p><div class="rounds">' + data.rounds.map(tileHtml).join('') + '</div>' +
      '<p class="legend">칸 아래 공 · 확 · 미 표시가 진한 과목은 영상이 올라와 있어요.</p></section>' +
      '<section class="panel" id="panel" aria-live="polite">' + panel + '</section></div>' +
      '<section class="contact" aria-labelledby="ask"><p class="label" id="ask">질문 · 문의</p>' +
      '<a class="kakao" href="' + KAKAO_CHAT + '"' + (MOBILE ? '' : ' target="_blank" rel="noopener"') + '>' + ICON_TALK +
      '<span>최준호수학연구소 카톡채널로 문의하기</span><span class="go" aria-hidden="true">›</span></a></section>' +
      '<footer class="foot">영상을 누르면 유튜브에서 열려요.</footer></div>';
  }

  function select(n, scroll) {
    state.sel = n;
    try { history.replaceState(null, '', '#r' + n); } catch (e) {}
    render();
    if (scroll && window.matchMedia('(max-width: 779px)').matches) {
      var p = document.getElementById('panel');
      if (p) p.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-round]');
    if (t) select(+t.dataset.round, true);
  });
  window.addEventListener('hashchange', function () {
    var h = (location.hash.match(/^#r(\d+)$/) || [])[1];
    if (h && find(+h) && +h !== state.sel) select(+h, false);
  });

  state.sel = defaultRound();
  render();
})();
