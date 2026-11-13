(function () {
  "use strict";

  // ---- Korean translations (English lives in index.html for SEO) ----
  var KO = {
    "nav.listen": "듣기",
    "nav.watch": "영상",
    "nav.tracks": "트랙",
    "nav.about": "소개",
    "hero.eyebrow": "대한민국 최초 힙합 가스펠 쇼콰이어",
    "hero.sub": "CALLING GOSPEL LIVE SHOW VOL.1 — 콜링콰이어 정규 1집. 가스펠 하모니와 라이브 밴드, 스트리트 댄스가 하나의 불꽃이 된 그날 밤을 그대로 담았습니다.",
    "hero.out": "지금 발매",
    "hero.listen": "지금 듣기",
    "hero.watch": "라이브 영상 보기",
    "listen.title": "어디서든 듣기",
    "listen.lead": "자주 쓰는 플랫폼에서 BORN FIRE를 만나보세요.",
    "watch.title": "라이브 쇼 영상",
    "watch.lead": "2026년 3월 7일, 콜링 가스펠 쇼 〈BORN FIRE〉 현장 라이브 녹음.",
    "tracks.title": "트랙리스트",
    "tracks.lead": "곡을 누르면 라이브 무대 영상으로 이동합니다.",
    "tracks.bonus": "보너스",
    "tracks.soon": "영상 공개 예정",
    "about.title": "콜링콰이어 소개",
    "about.p1": "콜링콰이어는 다이내믹한 보컬 하모니에 어반 스트리트 댄스, 비보이, 라이브 밴드를 더한 대한민국 최초의 힙합 가스펠 쇼콰이어입니다. 서울을 기반으로, 모든 무대에서 하나의 메시지를 전합니다. ‘진리를 세상 문화 속으로.’",
    "about.p2": "BORN FIRE는 교회 밖 다음세대를 위한 가스펠 라이브 쇼에서 시작됐습니다. 크라우드펀딩으로 함께한 후원자들과 2026년 3월 7일 그날 밤을 라이브로 담았고, ‘하나님의 불씨’를 주제로 한 오리지널 10곡과 보너스 무대 2곡을 세상에 내놓습니다.",
    "about.verse": "“여호와의 사자가 떨기나무 가운데로서 나오는 불꽃 안에서 그에게 나타나시니라”",
    "credits.ep": "총괄 프로듀서 · 크리에이티브 디렉터",
    "credits.amp": "공동 음악 프로듀서",
    "credits.vocal": "보컬 프로듀싱 · 에디팅",
    "credits.mix": "믹싱 · 마스터링",
    "credits.band": "밴드 마스터 · 건반",
    "credits.feat": "피처링",
    "credits.dist": "유통",
    "connect.title": "불꽃을 따라오세요",
    "connect.site": "공식 홈페이지",
    "connect.share": "앨범 공유하기",
    "connect.booking": "공연 초청 · 섭외 · 언론 문의:",
    "footer.presented": "콜링문화사역단 제공"
  };
  var VERSE_CITE = { en: "Exodus 3:2 (KJV)", ko: "출애굽기 3:2 (개역한글)" };
  var SOON = { en: "Soon", ko: "준비 중" };

  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var EN = {};
  nodes.forEach(function (el) { EN[el.getAttribute("data-i18n")] = el.innerHTML; });

  function setLang(lang) {
    var dict = lang === "ko" ? KO : EN;
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    document.documentElement.lang = lang;
    var cite = document.querySelector(".verse cite");
    if (cite) cite.textContent = VERSE_CITE[lang];
    document.querySelectorAll(".platform.is-soon").forEach(function (a) { a.setAttribute("data-soon", SOON[lang]); });
    document.querySelectorAll(".lang [data-lang]").forEach(function (s) {
      s.classList.toggle("is-active", s.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem("bf-lang", lang); } catch (e) {}
  }

  // Streaming links that are still "#" are shown as "coming soon"
  document.querySelectorAll(".platform").forEach(function (a) {
    if (a.getAttribute("href") === "#") {
      a.classList.add("is-soon");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("tabindex", "-1");
    } else {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  var initial = "en";
  try {
    var params = new URLSearchParams(location.search);
    initial = params.get("lang") || localStorage.getItem("bf-lang") ||
      ((navigator.language || "").toLowerCase().indexOf("ko") === 0 ? "ko" : "en");
  } catch (e) {}
  setLang(initial === "ko" ? "ko" : "en");

  document.querySelector(".lang").addEventListener("click", function () {
    setLang(document.documentElement.lang === "ko" ? "en" : "ko");
  });

  // Click-to-load YouTube (keeps the page fast)
  document.querySelectorAll(".video").forEach(function (box) {
    var btn = box.querySelector(".video__play");
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + box.getAttribute("data-yt") + "?autoplay=1&rel=0";
      f.title = box.getAttribute("data-title") || "YouTube video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      box.replaceChild(f, btn);
    });
  });

  // Share
  var share = document.querySelector(".share");
  if (share) share.addEventListener("click", function () {
    var data = { title: "BORN FIRE — Calling Choir", text: "Korea's first hip-hop gospel show choir. BORN FIRE is out now.", url: location.href.split("?")[0].split("#")[0] };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data.url).then(function () {
        var old = share.innerHTML;
        share.textContent = document.documentElement.lang === "ko" ? "링크 복사됨" : "Link copied";
        setTimeout(function () { share.innerHTML = old; }, 1800);
      });
    }
  });

  // Embers
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var host = document.querySelector(".embers");
  if (host && !reduce) {
    for (var i = 0; i < 28; i++) {
      var e = document.createElement("span");
      e.className = "ember";
      e.style.left = Math.random() * 100 + "%";
      e.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");
      e.style.animationDuration = 7 + Math.random() * 9 + "s";
      e.style.animationDelay = -Math.random() * 14 + "s";
      var s = 2 + Math.random() * 3;
      e.style.width = e.style.height = s + "px";
      host.appendChild(e);
    }
  }
})();
