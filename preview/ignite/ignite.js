// BORN FIRE — "IGNITE" redesign (preview). Shared by the KO and EN preview pages.
// Each page first defines TRACKS (track list) and PAGE (asset base path + its own words).
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
// Title lines: a trailing (…) goes on its own line so a break never falls inside it
const tl=s=>{const m=s.match(/^(.*\S)\s+(\([^()]*\))$/);return m?`<span class="tl">${m[1]}</span><span class="tl tl--p">${m[2]}</span>`:`<span class="tl">${s}</span>`;};
// Credit lines: a leading Lead/Feat/Bonus part stays on line 1, the rest goes to line 2 (separator dropped)
const cr=s=>{const m=s.match(/^((?:Lead|Feat|Bonus)\b.*?)\s+[\/·]\s+(.+)$/);return m?`<span class="cr">${m[1]}</span><span class="cr">${m[2]}</span>`:s;};
// Bonus tracks get a BONUS badge (like TITLE); the 'Bonus' word is dropped from the credit line
const isBonus=c=>/^Bonus(?![A-Za-z])/.test(c);
const noBonus=c=>c.replace(/^Bonus\s*(?:[·\/]\s*)?/,'');
const TITLE=7; // 모닥불
const badge=i=>i===TITLE?'<span class="badge">TITLE</span>':isBonus(TRACKS[i][2])?'<span class="badge badge--bonus">BONUS</span>':'';
const N=TRACKS.length, PLAYSVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>';
const photo=i=>`${PAGE.base}assets/cards/${TRACKS[i][0]}.jpg`;
const credit=i=>TRACKS[i][3]?cr(noBonus(TRACKS[i][2])):PAGE.soonCredit;
const label=i=>`${TRACKS[i][0]} ${TRACKS[i][1]}${TRACKS[i][3]?'':' ('+PAGE.soon+')'}`;

// ---------- hero title: split into letters that rise in ----------
(function(){const m=document.getElementById('mega');if(!m)return;let k=0;
  m.innerHTML=m.textContent.trim().split(/\s+/).map(w=>`<span class="w">${[...w].map(ch=>`<span class="c" style="animation-delay:${(.15+0.07*k++).toFixed(2)}s">${ch}</span>`).join('')}</span>`).join('');})();

// ---------- tracklist: sticky photo + editorial list (desktop, landscape) and a photo rail (phones) ----------
const tlist=document.getElementById('tlist'), tframe=document.getElementById('tframe'), tframeImgs=document.getElementById('tframeImgs');
const rail=document.getElementById('rail');
tlist.innerHTML=TRACKS.map((t,i)=>`<li><button class="trk${t[3]?'':' soon'}" type="button" data-i="${i}" aria-label="${label(i)}">
  <span class="trk__n">${t[0]}</span>
  <span class="trk__main"><span class="trk__name">${badge(i)}${tl(t[1])}</span><span class="trk__credit">${credit(i)}</span></span>
  <span class="trk__go" aria-hidden="true">${PLAYSVG}</span></button></li>`).join('');
tframeImgs.innerHTML=TRACKS.map((t,i)=>`<img src="${photo(i)}" alt="" width="600" height="840" decoding="async"${i===TITLE?'':' loading="lazy"'}>`).join('');
rail.innerHTML=TRACKS.map((t,i)=>`<button class="rcard" type="button" data-i="${i}" aria-label="${label(i)}" style="background-image:url('${photo(i)}')">
  <span class="rcard__n">${t[0]}</span>
  <span class="rcard__t">${badge(i)}<span class="rcard__name">${tl(t[1])}</span><span class="rcard__credit">${credit(i)}</span></span>
  ${t[3]?`<span class="rcard__play">${PLAYSVG} ${PAGE.watch}</span>`:''}</button>`).join('');
const rows=[...tlist.querySelectorAll('.trk')], imgs=[...tframeImgs.children], rcards=[...rail.children];
const tfN=document.getElementById('tframeN'), tfB=document.getElementById('tframeBadge');
let active=-1, zTop=1;
function setActive(i,instant){if(i===active)return;const prev=active;active=i;
  rows.forEach((r,k)=>r.classList.toggle('on',k===i));
  tfN.textContent=TRACKS[i][0];tfB.innerHTML=badge(i);tframe.setAttribute('aria-label',label(i));
  const im=imgs[i];imgs.forEach(x=>{if(x!==im&&x!==imgs[prev])x.classList.remove('show','base');});
  if(prev>=0&&imgs[prev]){imgs[prev].classList.add('base');}
  im.classList.remove('show','base');im.style.zIndex=++zTop;
  if(instant||RM()){im.classList.add('base');}else{void im.offsetWidth;im.classList.add('show');}}
setActive(TITLE,true);
rows.forEach(r=>{const i=+r.dataset.i;
  r.addEventListener('mouseenter',()=>setActive(i));r.addEventListener('focus',()=>setActive(i));
  r.addEventListener('click',()=>{setActive(i);play(i,r);});});
tframe.addEventListener('click',()=>play(active,tframe));
// rail: counter + progress follow the card in the middle; tap the middle card to play, a side card to centre it
const rcount=document.getElementById('railCount'), rbar=document.getElementById('railBar');
let rOn=-1;
const cx=c=>{const r=c.getBoundingClientRect(),q=rail.getBoundingClientRect();return r.left-q.left+rail.scrollLeft+r.width/2;};  // card centre in the rail's scroll coordinates
function railSync(){const mid=rail.scrollLeft+rail.clientWidth/2;let best=0,bd=1e9;
  rcards.forEach((c,k)=>{const d=Math.abs(cx(c)-mid);if(d<bd){bd=d;best=k;}});
  if(best===rOn)return;rOn=best;rcards.forEach((c,k)=>c.classList.toggle('on',k===best));
  rcount.innerHTML=`<b>${TRACKS[best][0]}</b> / ${String(N).padStart(2,'0')}`;rbar.style.transform=`scaleX(${(best+1)/N})`;}
const railTo=(i,smooth)=>{const c=rcards[i];rail.scrollTo({left:cx(c)-rail.clientWidth/2,behavior:smooth&&!RM()?'smooth':'auto'});};
rail.addEventListener('scroll',railSync,{passive:true});
rcards.forEach(c=>c.addEventListener('click',()=>{const i=+c.dataset.i;if(i===rOn)play(i,c);else railTo(i,true);}));
const railInit=()=>{if(rail.clientWidth){railTo(TITLE,false);railSync();}};
railInit();addEventListener('load',railInit);
let railW=rail.clientWidth;addEventListener('resize',()=>{if(rail.clientWidth&&!railW){railInit();}railW=rail.clientWidth;});

// ---------- theatre: the track's live video, full screen over a blurred photo ----------
const th=document.getElementById('th'), thBg=document.getElementById('thBg'), fpFrame=document.getElementById('fplayerFrame');
const fpend=document.getElementById('fpend'), thN=document.getElementById('thN'), thT=document.getElementById('thTitle'), thC=document.getElementById('thCredit');
let inl=null, cur=-1, opener=null, ytWait=0, thT0=0;
function nextPlayable(i,dir=1){for(let k=1;k<=N;k++){const j=((i+dir*k)%N+N)%N;if(TRACKS[j][3])return j;}return i;}
const hideEnd=()=>{if(fpend.contains(document.activeElement))document.getElementById('thClose').focus({preventScroll:true});fpend.hidden=true;};
function onInlState(e){if(e.data===YT.PlayerState.ENDED){fpend.hidden=false;}else if(e.data===YT.PlayerState.PLAYING){hideEnd();}}
function play(i,from){const t=TRACKS[i];if(!t||!t[3])return;if(window.pauseStage)window.pauseStage();
  if(from)opener=from;cur=i;hideEnd();
  const n=TRACKS[nextPlayable(i)];document.getElementById('fpendNext').textContent=n[0]+'. '+n[1];
  thN.textContent=t[0];thT.innerHTML=badge(i)+tl(t[1]);thC.innerHTML=credit(i);thBg.style.backgroundImage=`url('${photo(i)}')`;
  if(!th.classList.contains('on')){thT0=performance.now();th.classList.add('on');th.removeAttribute('aria-hidden');document.documentElement.classList.add('th-open');
    requestAnimationFrame(()=>requestAnimationFrame(()=>th.classList.add('in')));document.getElementById('thClose').focus({preventScroll:true});}
  if(inl&&inl.loadVideoById){inl.loadVideoById(t[3]);return;}
  fpFrame.innerHTML='<div id="fpYT"></div>';inl=null;
  const mk=()=>{inl=new YT.Player('fpYT',{videoId:t[3],host:'https://www.youtube-nocookie.com',
    playerVars:Object.assign({autoplay:1,rel:0,playsinline:1,modestbranding:1},window.__MUTE_CARDS?{mute:1}:{}),events:{onReady:e=>e.target.playVideo(),onStateChange:onInlState}});
    const f=fpFrame.querySelector('iframe');if(f)f.title=`${t[1]} — ${PAGE.live}`;};
  clearInterval(ytWait);if(window.YT&&YT.Player)mk();else{ytWait=setInterval(()=>{if(window.YT&&YT.Player){clearInterval(ytWait);mk();}},100);}}
function closeTh(){if(!th.classList.contains('on'))return;clearInterval(ytWait);
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  th.classList.remove('in');document.documentElement.classList.remove('th-open');
  try{inl&&inl.destroy();}catch(_){}inl=null;fpFrame.innerHTML='';fpend.hidden=true;
  setTimeout(()=>{if(!th.classList.contains('in')){th.classList.remove('on');th.setAttribute('aria-hidden','true');}},RM()?0:600);
  if(cur>=0){setActive(cur);if(rail.clientWidth)railTo(cur,false);}
  const back=opener&&opener.classList.contains('rcard')?rcards[cur]:opener&&opener.classList.contains('trk')?rows[cur]:opener;
  if(back)back.focus({preventScroll:true});
  if(window.resumeStage)window.resumeStage();}
document.getElementById('thClose').onclick=closeTh;
document.getElementById('thPrev').onclick=()=>play(nextPlayable(cur,-1));
document.getElementById('thNext').onclick=()=>play(nextPlayable(cur,1));
document.getElementById('fpendGo').onclick=()=>play(nextPlayable(cur));
document.getElementById('fpendReplay').onclick=()=>{hideEnd();try{inl.seekTo(0,true);inl.playVideo();}catch(_){}};
// a click on the dark backdrop (not the video or its buttons) closes
th.addEventListener('click',e=>{if(performance.now()-thT0<300)return;if(!e.target.closest('.fplayer,.th__nav,.th__x,.th__meta'))closeTh();});
// Keyboard while the video is open: Esc closes; YouTube's own shortcuts are re-created so they work without clicking the video
addEventListener('keydown',e=>{
  if(!th.classList.contains('on')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Escape'){e.preventDefault();closeTh();return;}
  if(e.key==='Tab'){const f=[...th.querySelectorAll('button:not([hidden]),a[href]')].filter(x=>x.offsetParent!==null&&!x.closest('[hidden]'));
    if(!f.length)return;const a=f[0],z=f[f.length-1],c=document.activeElement;
    if(e.shiftKey?(c===a||!th.contains(c)):(c===z||!th.contains(c))){e.preventDefault();(e.shiftKey?z:a).focus();}return;}
  if((e.key===' '||e.key==='Enter')&&e.target.closest&&e.target.closest('button,a[href]'))return;
  const p=inl;if(!p||!p.getPlayerState)return;
  const k=e.key.toLowerCase(), t=()=>p.getCurrentTime()||0, d=()=>p.getDuration()||0, seek=x=>p.seekTo(Math.max(0,Math.min(d(),x)),true);
  let hit=true;
  if(k===' '||k==='k'){p.getPlayerState()===1?p.pauseVideo():p.playVideo();}
  else if(k==='arrowleft')seek(t()-5); else if(k==='arrowright')seek(t()+5);
  else if(k==='j')seek(t()-10); else if(k==='l')seek(t()+10);
  else if(k==='arrowup'||k==='arrowdown'){let v=p.getVolume();if(k==='arrowup'){if(p.isMuted())p.unMute();v=Math.min(100,v+5);}else v=Math.max(0,v-5);p.setVolume(v);}
  else if(k==='m'){p.isMuted()?p.unMute():p.mute();}
  else if(k==='f'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else{const el=fpFrame.querySelector('iframe');if(el&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});}}
  else if(/^[0-9]$/.test(k))seek(d()*(+k)/10);
  else hit=false;
  if(hit){e.preventDefault();e.stopImmediatePropagation();}
},true);
// clicking inside the YouTube player moves focus into it (another site); hand it back so Esc keeps working
addEventListener('blur',()=>{setTimeout(()=>{const a=document.activeElement;
  if(th.classList.contains('on')&&a&&a.tagName==='IFRAME'&&th.contains(a)&&!document.fullscreenElement){a.blur();window.focus();document.getElementById('thClose').focus({preventScroll:true});}},120);});

// ---------- nav, progress line, reveals ----------
const nav=document.getElementById('nav'), bar=document.getElementById('progress');
const onScroll=()=>{const y=scrollY;nav.classList.toggle('solid',y>innerHeight*0.85);
  const h=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${h>0?y/h:0})`;};
addEventListener('scroll',onScroll,{passive:true});onScroll();
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv,.thead').forEach(el=>io.observe(el));

// ---------- motion: hero title parallax, About photo parallax, marquee ----------
(function(){if(RM())return;
  const mega=document.getElementById('mega');
  const rowsM=[...document.querySelectorAll('.marq__row')], marq=document.querySelector('.marq');
  let lastY=scrollY, vel=0, off=0, marqOn=false, ticking=false;
  new IntersectionObserver(es=>{marqOn=es[0].isIntersecting;if(marqOn)loop();}).observe(marq);
  function frame(){const y=scrollY;
    if(y<innerHeight*1.2)mega.style.transform=`translate3d(0,${(y*0.32).toFixed(1)}px,0)`;
    ticking=false;}
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(frame);}},{passive:true});frame();
  // marquee: drifts on its own and speeds up with scroll speed
  let w0=0;
  function loop(){if(!marqOn)return;const y=scrollY;vel=vel*0.9+(y-lastY)*0.1;lastY=y;
    off+=0.6+Math.min(14,Math.abs(vel)*0.35);
    rowsM.forEach((r,k)=>{const w=r.scrollWidth/2||1;const o=off%w;r.style.transform=`translate3d(${k%2?o-w:-o}px,0,0)`;});
    requestAnimationFrame(loop);}
})();

// ---------- cursor (mouse only) ----------
(function(){if(!FINE||RM())return;
  const c=document.createElement('div');c.className='cur';c.setAttribute('aria-hidden','true');
  c.innerHTML=`<div class="cur__ring">${PLAYSVG}</div><div class="cur__dot"></div>`;document.body.appendChild(c);
  const ring=c.firstChild, dot=c.lastChild;let x=-100,y=-100,rx=-100,ry=-100,raf=0;dot.style.transform=ring.style.transform='translate3d(-100px,-100px,0)';
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;c.classList.add('on');
    const t=e.target.closest?e.target:null;
    c.classList.toggle('play',!!(t&&t.closest('.trk:not(.soon),.tframe,.rcard')));
    c.classList.toggle('hover',!!(t&&t.closest('a,button,.lang'))&&!c.classList.contains('play'));
    c.classList.toggle('hide',!!(t&&t.closest('.th,.lsn,.stage.idle')));
    if(!raf)raf=requestAnimationFrame(tick);},{passive:true});
  document.addEventListener('mouseleave',()=>c.classList.remove('on'));
  function tick(){rx+=(x-rx)*.18;ry+=(y-ry)*.18;dot.style.transform=`translate3d(${x}px,${y}px,0)`;ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    raf=Math.abs(x-rx)+Math.abs(y-ry)>.3?requestAnimationFrame(tick):0;}
  // magnetic buttons
  document.querySelectorAll('.mag').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();
    b.style.transform=`translate(${((e.clientX-r.left-r.width/2)*.18).toFixed(1)}px,${((e.clientY-r.top-r.height/2)*.28).toFixed(1)}px)`;});
    b.addEventListener('mouseleave',()=>{b.style.transform='';});});
})();

// ---------- embers in the bottom section ----------
(function(){const sec=document.getElementById('follow');if(!sec||RM())return;
  const cv=document.createElement('canvas');cv.setAttribute('aria-hidden','true');sec.prepend(cv);const g=cv.getContext('2d');
  let W=0,H=0,on=false,ps=[];const DPR=Math.min(2,devicePixelRatio||1);
  const size=()=>{W=sec.clientWidth;H=sec.clientHeight;cv.width=W*DPR;cv.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);};
  const mk=()=>({x:Math.random()*W,y:H+Math.random()*H*.5,r:.6+Math.random()*2.2,vy:.35+Math.random()*1.1,vx:(Math.random()-.5)*.4,w:Math.random()*6.28,l:0,L:260+Math.random()*420});
  const count=()=>Math.round(Math.min(90,W/16));
  function loop(){if(!on)return;g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
    while(ps.length<count())ps.push(mk());
    ps.forEach((p,k)=>{p.l++;p.w+=.03;p.x+=p.vx+Math.sin(p.w)*.35;p.y-=p.vy;const a=Math.max(0,Math.min(1,p.l/40))*Math.max(0,1-p.l/p.L);
      const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);gr.addColorStop(0,`rgba(255,214,150,${a})`);gr.addColorStop(.35,`rgba(255,130,40,${a*.6})`);gr.addColorStop(1,'rgba(255,90,31,0)');
      g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,p.r*4,0,6.29);g.fill();if(p.l>p.L||p.y<-20)ps[k]=mk();});
    requestAnimationFrame(loop);}
  new IntersectionObserver(es=>{on=es[0].isIntersecting;if(on){size();loop();}}).observe(sec);
  addEventListener('resize',()=>{if(on)size();});
})();

// ---------- full-screen background live video (muted autoplay loop, tap to unmute) — same behaviour as the live page ----------
(function(){
  const stage=document.getElementById('stage'), btn=document.getElementById('stage-sound'), VID='jKdQVbeaqe4', START=140;
  // Data-saver on (Android Chrome / Samsung Internet): keep the still poster (the .stage background) and never load the background video
  const SAVE=!!(navigator.connection&&navigator.connection.saveData);
  if(SAVE)stage.classList.add('still');
  let player=null, ready=false;
  const stopped=()=>{const s=player.getPlayerState();return s!==YT.PlayerState.PLAYING&&s!==YT.PlayerState.BUFFERING;};
  window.onYouTubeIframeAPIReady=function(){
    if(SAVE)return;
    player=new YT.Player('stage-player',{videoId:VID,host:'https://www.youtube-nocookie.com',
      playerVars:Object.assign({autoplay:1,mute:1,controls:0,start:START,playsinline:1,rel:0,modestbranding:1,disablekb:1,iv_load_policy:3,fs:0},
        FINE?{vq:'hd1080'}:{}),  // PC: ask for 1080p; phones/tablets: YouTube picks automatically
      events:{
        onReady:e=>{ready=true;e.target.mute();e.target.getIframe().tabIndex=-1;},
        onStateChange:e=>{if(e.data===YT.PlayerState.PLAYING)stage.classList.add('playing');
                          if(e.data===YT.PlayerState.ENDED){holdUntil=Date.now()+5000;wake();e.target.seekTo(START,true);e.target.playVideo();}}
      }});
    window.__stagePlayer=player;
  };
  const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';document.head.appendChild(t);
  btn.addEventListener('click',()=>{
    if(!ready)return;
    const unmute=!stage.classList.contains('unmuted');
    if(unmute){player.unMute();lastVol=vol();player.setVolume(lastVol);if(stopped())player.playVideo();}else{player.mute();}
    stage.classList.toggle('unmuted',unmute);btn.setAttribute('aria-pressed',String(unmute));
    btn.setAttribute('aria-label',unmute?PAGE.mute:PAGE.unmute);
  });
  let idleT; let holdUntil=Date.now()+6000; const wake=()=>{stage.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>stage.classList.add('idle'),Math.max(2500,holdUntil-Date.now()));};
  ['mousemove','touchstart','keydown','scroll'].forEach(ev=>addEventListener(ev,wake,{passive:true}));
  btn.addEventListener('focus',wake); wake();
  // While a track video plays, the background video is paused (its sound setting is left as it was)
  let pausedForCard=false;
  window.pauseStage=()=>{if(!ready||pausedForCard)return;try{if(player.getPlayerState()!==YT.PlayerState.PAUSED){player.pauseVideo();pausedForCard=true;}}catch(_){}};
  window.resumeStage=()=>{if(!pausedForCard)return;pausedForCard=false;try{player.playVideo();}catch(_){}};
  // Scroll-linked fade: 100% at the top, ~67% at the album intro, then evenly down to 50% at the bottom of the page
  let lastVol=-1;
  const album=document.getElementById('album');
  const FLOOR=0.5;
  const vol=()=>{const H=innerHeight,y=scrollY,y0=album.offsetTop,v0=1-y0/(H*3),end=document.documentElement.scrollHeight-H;
    const v=y<=y0?1-y/(H*3):v0-(v0-FLOOR)*Math.min(1,(y-y0)/Math.max(1,end-y0));return Math.round(100*Math.max(FLOOR,v));};
  const fade=()=>{if(!ready||!stage.classList.contains('unmuted'))return;const v=vol();if(v!==lastVol){player.setVolume(v);lastVol=v;}};
  addEventListener('scroll',fade,{passive:true});
})();

// ---------- Listen popup (same behaviour as the live page) ----------
(function(){const d=document.getElementById('lsn'),o=document.getElementById('lsnOpen'),bx=d.querySelector('.lsn__box');let t=0;
function open(){clearTimeout(t);d.classList.remove('out');d.classList.add('on');d.removeAttribute('aria-hidden');requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));bx.focus({preventScroll:true});}
function close(){if(!d.classList.contains('on')||d.classList.contains('out'))return;d.classList.remove('in');d.classList.add('out');o.focus({preventScroll:true});t=setTimeout(()=>{d.classList.remove('on','out');d.setAttribute('aria-hidden','true');},RM()?0:300);}
o.addEventListener('click',open);d.addEventListener('click',e=>{if(!e.target.closest('.lsn__list a'))close();});
document.addEventListener('keydown',e=>{if(!d.classList.contains('in'))return;
  if(e.key==='Escape'){e.stopImmediatePropagation();close();return;}
  if(e.key!=='Tab')return;const a=d.querySelectorAll('.lsn__list a'),f=a[0],l=a[a.length-1],c=document.activeElement;
  if(e.shiftKey?(c===f||!bx.contains(c)||c===bx):(c===l||!bx.contains(c))){e.preventDefault();(e.shiftKey?l:f).focus();}},true);})();

// ---------- Email (PC and phones alike): copy the address, then reveal the 'open in mail app' link ----------
(function(){const b=document.getElementById('mailBtn'),o=document.getElementById('mailOpen');if(!b)return;const t=b.querySelector('.mail-txt'),orig=t.textContent;let h=0;
b.addEventListener('click',e=>{let p=null;try{p=navigator.clipboard&&navigator.clipboard.writeText('callingchoir@gmail.com');}catch(_){p=null;}
  e.preventDefault();
  const show=()=>{if(o){o.classList.add('on');}};
  if(p)p.then(()=>{t.textContent=b.dataset.copied;clearTimeout(h);h=setTimeout(()=>{t.textContent=orig;},1500);show();}).catch(show);else show();});})();
