// BORN FIRE — "BONFIRE" preview, cinematic cut. Shared by the KO and EN preview pages.
// Each page first defines TRACKS (track list) and PAGE (asset base path + its own words).
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
const DPR=Math.min(2,window.devicePixelRatio||1);
// Title lines: a trailing (…) goes on its own line so a break never falls inside it
const tl=s=>{const m=s.match(/^(.*\S)\s+(\([^()]*\))$/);return m?`<span class="tl">${m[1]}</span><span class="tl tl--p">${m[2]}</span>`:`<span class="tl">${s}</span>`;};
// Credit lines: a leading Lead/Feat/Bonus part stays on line 1, the rest goes to line 2 (separator dropped)
const cr=s=>{const m=s.match(/^((?:Lead|Feat|Bonus)\b.*?)\s+[\/·]\s+(.+)$/);return m?`<span class="cr">${m[1]}</span><span class="cr">${m[2]}</span>`:`<span class="cr">${s}</span>`;};
const isBonus=c=>/^Bonus(?![A-Za-z])/.test(c);
const noBonus=c=>c.replace(/^Bonus\s*(?:[·\/]\s*)?/,'');
const TITLE=7; // 모닥불
const N=TRACKS.length, STEP=360/N;
const badge=i=>i===TITLE?'<span class="badge">TITLE</span>':isBonus(TRACKS[i][2])?'<span class="badge badge--bonus">BONUS</span>':'';
const PLAYSVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>';
const photo=i=>`${PAGE.base}assets/cards/${TRACKS[i][0]}.jpg`;
const credit=i=>TRACKS[i][3]?cr(noBonus(TRACKS[i][2])):PAGE.soonCredit;
const idx=k=>((k%N)+N)%N;
const wrapD=d=>{d=idx(d);return d>N/2?d-N:d;};
// run a frame loop only while an element is on screen
function whileVisible(el,start,stop){new IntersectionObserver(es=>{es[0].isIntersecting?start():stop();},{rootMargin:'80px'}).observe(el);}

/* =====================================================================================
   1. Rising embers (canvas), drawn only while their section is on screen
   ===================================================================================== */
function embers(cv,density){if(RM||!cv||!cv.getContext)return;const host=cv.parentElement;
  const ctx=cv.getContext('2d');let W=0,H=0,P=[],on=false,raf=0;
  const spawn=(p,init)=>{p.x=Math.random()*W;p.y=init?Math.random()*H:H+10;p.r=.6+Math.random()*2.2;p.vy=.25+Math.random()*.9;p.vx=(Math.random()-.5)*.3;
    p.ph=Math.random()*6.28;p.max=.5+Math.random()*.5;p.h=18+Math.random()*28;return p;};
  const size=()=>{W=host.clientWidth;H=host.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    const n=Math.round(Math.min(90,Math.max(24,W*H/density)));P=Array.from({length:n},(_,i)=>spawn(P[i]||{},true));};
  const tick=()=>{raf=on?requestAnimationFrame(tick):0;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    for(const p of P){p.ph+=.03;p.x+=p.vx+Math.sin(p.ph)*.35;p.y-=p.vy;const f=Math.max(0,Math.min(1,p.y/H));
      const a=p.max*(0.25+0.75*f)*(0.7+0.3*Math.sin(p.ph*3));
      const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);gr.addColorStop(0,`hsla(${p.h+20},100%,75%,${a})`);gr.addColorStop(.35,`hsla(${p.h},100%,55%,${a*.6})`);gr.addColorStop(1,`hsla(${p.h},100%,50%,0)`);
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,6.283);ctx.fill();
      if(p.y<-20||p.x<-20||p.x>W+20)spawn(p,false);}};
  const go=v=>{on=v&&!document.hidden;if(on&&!raf)raf=requestAnimationFrame(tick);};
  let vis=false;new IntersectionObserver(es=>{vis=es[0].isIntersecting;go(vis);}).observe(host);
  document.addEventListener('visibilitychange',()=>go(vis));
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,150);});size();}

/* =====================================================================================
   2. Stage: the logo burns in
   ===================================================================================== */
(function(){const stage=document.getElementById('stage');
  const go=()=>stage.classList.add('cue');
  if(RM){go();return;}
  (document.fonts?Promise.race([document.fonts.load('40px "Pinyon Script"'),new Promise(r=>setTimeout(r,1200))]):Promise.resolve()).then(()=>setTimeout(go,250));
  embers(document.getElementById('heroEmbers'),FINE?16000:12000);})();

/* manifesto: the headline rises */
(function(){const sec=document.getElementById('album');
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){sec.classList.add('in');o.disconnect();}},{rootMargin:'0px 0px -15% 0px'}).observe(sec);})();

/* =====================================================================================
   4. Tracklist: a reflective carousel; the song in front fills the room behind it
   ===================================================================================== */
const pyre=document.getElementById('flow'), scene=document.getElementById('scene'), ringEl=document.getElementById('ring');
ringEl.innerHTML=TRACKS.map((t,i)=>`<button class="card${t[3]?'':' soon'}" type="button" data-i="${i}" tabindex="-1" aria-label="${t[0]} ${t[1]}${t[3]?'':' ('+PAGE.soon+')'}">
  <span class="card__f" style="background-image:url('${photo(i)}')"><span class="card__n">${t[0]}</span><span class="card__badge">${badge(i)}</span></span></button>`).join('');
const cards=[...ringEl.children];
const fName=document.getElementById('frontName'), fCredit=document.getElementById('frontCredit'), fBadge=document.getElementById('frontBadge'), fPlay=document.getElementById('frontPlay'), fcount=document.getElementById('flowCount'), front=document.getElementById('front');
const back=[...document.getElementById('tback').children];let backOn=0;
let pos=TITLE, target=TITLE, raf=0, shown=-1, drag=null, spread=RM?1:0, cw=200;
const frontIdx=()=>idx(Math.round(pos));
function measure(){cw=cards[0].offsetWidth||200;}
// where a card sits for a given distance d from the front (d is fractional while moving)
function render(){const gap=cw*.74, far=cw*.46;
  cards.forEach((c,i)=>{let d=i-pos;d=((d%N)+N+N/2)%N-N/2;const a=Math.abs(d),s=Math.sign(d),near=Math.min(1,a);
    const x=s*(near*gap+Math.max(0,a-1)*far)*spread, z=-(near*cw*.42+Math.max(0,a-1)*cw*.22), ry=-s*near*34;
    c.style.transform=`translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
    c.style.opacity=(a>3.6?0:a>2.6?3.6-a:1)*(spread<1?Math.min(1,spread*1.4+(a<.5?1:0)):1);
    c.style.zIndex=String(100-Math.round(a*10));c.style.visibility=a>3.7?'hidden':'visible';
    c.style.setProperty('--k',Math.min(.72,a*.26).toFixed(3));
    const isF=a<.5;if(isF!==c.classList.contains('is-front')){c.classList.toggle('is-front',isF);c.tabIndex=isF?0:-1;}});
  const f=frontIdx();if(f!==shown)showFront(f);}
function showFront(i){const first=shown<0;shown=i;
  // the room behind: cross-fade to this song's photo
  const nb=back[backOn^1];nb.style.backgroundImage=`url('${photo(i)}')`;nb.classList.add('on');back[backOn].classList.remove('on');backOn^=1;
  const set=()=>{fBadge.innerHTML=badge(i);fName.innerHTML=tl(TRACKS[i][1]);fCredit.innerHTML=credit(i);fPlay.hidden=!TRACKS[i][3];front.classList.remove('swap');};
  fcount.innerHTML=`<b>${TRACKS[i][0]}</b> / ${String(N).padStart(2,'0')}`;
  if(first||RM){set();return;}front.classList.add('swap');clearTimeout(showFront.t);showFront.t=setTimeout(set,180);}
function tick(){pos+=(target-pos)*.12;if(Math.abs(target-pos)<.002&&!drag){pos=target;render();raf=0;return;}render();raf=requestAnimationFrame(tick);}
const kick=()=>{if(!raf)raf=requestAnimationFrame(tick);};
function goTo(i){target=target+wrapD(i-Math.round(target));kick();}
const step=d=>{target=Math.round(target)+d;kick();};
fPlay.onclick=()=>play(frontIdx());
pyre.addEventListener('keydown',e=>{if(th.classList.contains('on'))return;
  if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  else if(e.key==='Enter'&&(e.target===pyre)){play(frontIdx());}});
// drag / swipe: one card's spacing of movement moves one place; a flick carries on
scene.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,p:pos,moved:false,id:e.pointerId,lx:e.clientX,lt:performance.now(),v:0};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<6)return;if(Math.abs(e.clientY-drag.y)>Math.abs(dx)){drag=null;return;}drag.moved=true;scene.classList.add('dragging');try{scene.setPointerCapture(drag.id);}catch(_){}}
  const now=performance.now();drag.v=(e.clientX-drag.lx)/Math.max(1,now-drag.lt);drag.lx=e.clientX;drag.lt=now;
  pos=target=drag.p-dx/(cw*.74);render();});
function endDrag(cancel){if(!drag)return;const d=drag;drag=null;scene.classList.remove('dragging');if(!d.moved)return;
  pyre.dataset.justDragged='1';setTimeout(()=>delete pyre.dataset.justDragged,50);
  if(cancel){target=d.p;}else{const fl=Math.max(-3,Math.min(3,-d.v*1.4));target=Math.round(pos+fl);}kick();}
addEventListener('pointerup',()=>endDrag(false));addEventListener('pointercancel',()=>endDrag(true));
addEventListener('blur',()=>endDrag(true));
let wAcc=0,wT;scene.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();wAcc+=e.deltaX;clearTimeout(wT);
  if(Math.abs(wAcc)>60){step(Math.sign(wAcc));wAcc=0;}wT=setTimeout(()=>wAcc=0,200);},{passive:false});
cards.forEach(c=>c.addEventListener('click',()=>{if(pyre.dataset.justDragged)return;const i=+c.dataset.i;
  if(c.classList.contains('is-front'))play(i);else goTo(i);}));
let rsT;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{measure();render();},120);});
measure();render();
// first view: the cards fan out from the title track
new IntersectionObserver((es,o)=>{if(!es[0].isIntersecting)return;o.disconnect();if(RM)return;
  const t0=performance.now(),D=1500;const f=now=>{const q=Math.min(1,(now-t0)/D);spread=1-Math.pow(1-q,4);render();if(q<1)requestAnimationFrame(f);};
  requestAnimationFrame(f);},{rootMargin:'0px 0px -25% 0px'}).observe(scene);

/* =====================================================================================
   5. Theatre: the card you tapped grows into the song's live video
   ===================================================================================== */
const th=document.getElementById('th'), thBg=document.getElementById('thBg'), ghost=document.getElementById('ghost'), fplayer=document.getElementById('fplayer'), fpFrame=document.getElementById('fplayerFrame');
const fpend=document.getElementById('fpend'), thT=document.getElementById('thTitle'), thC=document.getElementById('thCredit'), thX=document.getElementById('thClose');
let inl=null, cur=-1, ytWait=0, thT0=0, opener=null;
function nextPlayable(i,dir=1){for(let s=1;s<=N;s++){const j=idx(i+dir*s);if(TRACKS[j][3])return j;}return i;}
const hideEnd=()=>{if(fpend.contains(document.activeElement))thX.focus({preventScroll:true});fpend.hidden=true;};
function onInlState(e){if(e.data===YT.PlayerState.ENDED)fpend.hidden=false;else if(e.data===YT.PlayerState.PLAYING)hideEnd();}
function play(i){const t=TRACKS[i];if(!t||!t[3])return;if(window.pauseStage)window.pauseStage();cur=i;hideEnd();
  const n=TRACKS[nextPlayable(i)];document.getElementById('fpendNext').textContent=n[0]+'. '+n[1];
  thT.innerHTML=`<span style="color:var(--fire-2)">${t[0]}</span>&nbsp; ${badge(i)}${tl(t[1])}`;thC.innerHTML=credit(i);thBg.style.backgroundImage=`url('${photo(i)}')`;
  if(th.dataset.closing)return;
  if(!th.classList.contains('on')){opener=document.activeElement;
    thT0=performance.now();th.classList.add('on');th.removeAttribute('aria-hidden');document.documentElement.classList.add('th-open');
    grow(cards[i].querySelector('.card__f'),i,true);thX.focus({preventScroll:true});}
  if(inl&&inl.loadVideoById){inl.loadVideoById(t[3]);return;}
  fpFrame.innerHTML='<div id="fpYT"></div>';inl=null;
  const mk=()=>{inl=new YT.Player('fpYT',{videoId:t[3],host:'https://www.youtube-nocookie.com',
    playerVars:Object.assign({autoplay:1,rel:0,playsinline:1,modestbranding:1},window.__MUTE_CARDS?{mute:1}:{}),events:{onReady:e=>e.target.playVideo(),onStateChange:onInlState}});
    const f=fpFrame.querySelector('iframe');if(f)f.title=`${t[1]} — ${PAGE.live}`;};
  clearInterval(ytWait);if(window.YT&&YT.Player)mk();else{ytWait=setInterval(()=>{if(window.YT&&YT.Player){clearInterval(ytWait);mk();}},100);}}
// the card's photo lifts out and grows to the player's place (open), or shrinks back onto the card (close)
let growT=0;
function grow(cardEl,i,open){clearTimeout(growT);
  const box=r=>({left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  const c=cardEl.getBoundingClientRect(), p=fplayer.getBoundingClientRect();
  const visible=c.width>0&&c.bottom>0&&c.top<innerHeight;
  const done=()=>{ghost.classList.remove('go');ghost.style.opacity='';if(open)th.classList.add('in');
    else{th.classList.remove('on','fading');th.setAttribute('aria-hidden','true');delete th.dataset.closing;}};
  if(RM||!visible){if(open){th.classList.add('in');}else{th.classList.remove('in');done();}return;}
  ghost.style.backgroundImage=`url('${photo(i)}')`;
  const from=open?c:p, to=open?p:c;
  ghost.classList.remove('go');Object.assign(ghost.style,box(from),{borderRadius:open?'12px':'14px',opacity:'1'});
  if(!open)th.classList.remove('in');
  void ghost.offsetWidth;ghost.classList.add('go');
  Object.assign(ghost.style,box(to),{borderRadius:open?'14px':'12px'});
  growT=setTimeout(()=>{if(open){th.classList.add('in');ghost.style.opacity='0';growT=setTimeout(done,360);}else done();},open?650:620);}
function closeTh(){if(!th.classList.contains('on')||th.dataset.closing)return;th.dataset.closing='1';clearInterval(ytWait);
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  document.documentElement.classList.remove('th-open');
  try{inl&&inl.destroy();}catch(_){}inl=null;fpFrame.innerHTML='';fpend.hidden=true;
  if(cur>=0&&cur!==frontIdx()){goTo(cur);pos=target;render();}
  const ci=cur>=0?cur:frontIdx();th.classList.add('fading');grow(cards[ci].querySelector('.card__f'),ci,false);
  (opener&&opener.focus?opener:cards[ci]).focus({preventScroll:true});
  if(window.resumeStage)window.resumeStage();}
thX.onclick=closeTh;
document.getElementById('thPrev').onclick=()=>play(nextPlayable(cur,-1));
document.getElementById('thNext').onclick=()=>play(nextPlayable(cur,1));
document.getElementById('fpendGo').onclick=()=>play(nextPlayable(cur));
document.getElementById('fpendReplay').onclick=()=>{hideEnd();try{inl.seekTo(0,true);inl.playVideo();}catch(_){}};
th.addEventListener('click',e=>{if(performance.now()-thT0<400)return;if(!e.target.closest('.fplayer,.th__nav,.th__x,.th__meta'))closeTh();});
// keyboard while a video is open: Esc closes, Tab stays inside, YouTube's own shortcuts work without clicking the video
addEventListener('keydown',e=>{
  if(!th.classList.contains('on')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='Escape'){e.preventDefault();closeTh();return;}
  if(e.key==='Tab'){const f=[...th.querySelectorAll('button,a[href]')].filter(x=>x.offsetParent!==null&&!x.closest('[hidden]'));if(!f.length)return;
    const a=f[0],z=f[f.length-1],c=document.activeElement;if(e.shiftKey?(c===a||!th.contains(c)):(c===z||!th.contains(c))){e.preventDefault();(e.shiftKey?z:a).focus();}return;}
  if((e.key===' '||e.key==='Enter')&&e.target.closest&&e.target.closest('button,a[href]'))return;
  const p=inl;if(!p||!p.getPlayerState)return;
  const kk=e.key.toLowerCase(), t=()=>p.getCurrentTime()||0, d=()=>p.getDuration()||0, seek=x=>p.seekTo(Math.max(0,Math.min(d(),x)),true);
  let hit=true;
  if(kk===' '||kk==='k'){p.getPlayerState()===1?p.pauseVideo():p.playVideo();}
  else if(kk==='arrowleft')seek(t()-5); else if(kk==='arrowright')seek(t()+5);
  else if(kk==='j')seek(t()-10); else if(kk==='l')seek(t()+10);
  else if(kk==='arrowup'||kk==='arrowdown'){let v=p.getVolume();if(kk==='arrowup'){if(p.isMuted())p.unMute();v=Math.min(100,v+5);}else v=Math.max(0,v-5);p.setVolume(v);}
  else if(kk==='m'){p.isMuted()?p.unMute():p.mute();}
  else if(kk==='f'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else{const el=fpFrame.querySelector('iframe');if(el&&el.requestFullscreen)el.requestFullscreen().catch(()=>{});}}
  else if(/^[0-9]$/.test(kk))seek(d()*(+kk)/10);
  else hit=false;
  if(hit){e.preventDefault();e.stopImmediatePropagation();}
},true);
addEventListener('blur',()=>{setTimeout(()=>{const a=document.activeElement;
  if(th.classList.contains('on')&&a&&a.tagName==='IFRAME'&&th.contains(a)&&!document.fullscreenElement){a.blur();window.focus();thX.focus({preventScroll:true});}},120);});

/* =====================================================================================
   6. About: gentle tilt under the mouse; credits roll in; the closing lights aim up when it comes into view
   ===================================================================================== */
(function(){const img=document.getElementById('aimg');if(!img||!FINE||RM)return;
  img.addEventListener('mousemove',e=>{const r=img.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    img.style.setProperty('--ry',(px*8).toFixed(2)+'deg');img.style.setProperty('--rx',(-py*8).toFixed(2)+'deg');});
  img.addEventListener('mouseleave',()=>{img.style.setProperty('--ry','0deg');img.style.setProperty('--rx','0deg');});})();
(function(){const cg=document.querySelector('.cgrid');[...cg.children].forEach((d,i)=>d.style.transitionDelay=(i*.12)+'s');
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){cg.classList.add('in');o.disconnect();}},{rootMargin:'0px 0px -10% 0px'}).observe(cg);})();
(function(){const sec=document.getElementById('follow');
  embers(sec.querySelector('canvas.embers'),9000);})();

/* whole page: section-title light sweep, scroll progress line, warm glow under the mouse */
document.querySelectorAll('.about .display, .credits .display').forEach(h=>h.classList.add('shine'));
(function(){const bar=document.getElementById('pbar');
  const prog=()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${m>0?Math.min(1,scrollY/m):0})`;};
  addEventListener('scroll',prog,{passive:true});addEventListener('resize',prog);prog();
  if(RM||!FINE)return;const g=document.getElementById('cglow');let x=0,y=0,raf=0;
  addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;g.classList.add('on');if(!raf)raf=requestAnimationFrame(()=>{raf=0;g.style.transform=`translate(${x}px,${y}px)`;});},{passive:true});
  document.addEventListener('mouseleave',()=>g.classList.remove('on'));})();

/* ---------- nav + reveals ---------- */
const nav=document.getElementById('nav');
const navSolid=()=>nav.classList.toggle('solid',scrollY>innerHeight*0.85);
addEventListener('scroll',navSolid,{passive:true});navSolid();
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ---------- full-screen background live video — same behaviour as the live page ---------- */
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
  // While a song's video plays, the background video is paused (its sound setting is left as it was)
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

/* ---------- Listen popup (same behaviour as the live page) ---------- */
(function(){const d=document.getElementById('lsn'),o=document.getElementById('lsnOpen'),bx=d.querySelector('.lsn__box');let t=0;
function open(){clearTimeout(t);d.classList.remove('out');d.classList.add('on');d.removeAttribute('aria-hidden');requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));bx.focus({preventScroll:true});}
function close(){if(!d.classList.contains('on')||d.classList.contains('out'))return;d.classList.remove('in');d.classList.add('out');o.focus({preventScroll:true});t=setTimeout(()=>{d.classList.remove('on','out');d.setAttribute('aria-hidden','true');},RM?0:300);}
o.addEventListener('click',open);d.addEventListener('click',e=>{if(!e.target.closest('.lsn__list a'))close();});
document.addEventListener('keydown',e=>{if(!d.classList.contains('in'))return;
  if(e.key==='Escape'){e.stopImmediatePropagation();close();return;}
  if(e.key!=='Tab')return;const a=d.querySelectorAll('.lsn__list a'),f=a[0],l=a[a.length-1],c=document.activeElement;
  if(e.shiftKey?(c===f||!bx.contains(c)||c===bx):(c===l||!bx.contains(c))){e.preventDefault();(e.shiftKey?l:f).focus();}},true);})();

/* ---------- Email (PC and phones alike): copy the address, then reveal the 'open in mail app' link ---------- */
(function(){const b=document.getElementById('mailBtn'),o=document.getElementById('mailOpen');if(!b)return;const t=b.querySelector('.mail-txt'),orig=t.textContent;let h=0;
b.addEventListener('click',e=>{let p=null;try{p=navigator.clipboard&&navigator.clipboard.writeText('callingchoir@gmail.com');}catch(_){p=null;}
  e.preventDefault();
  const show=()=>{if(o){o.classList.add('on');}};
  if(p)p.then(()=>{t.textContent=b.dataset.copied;clearTimeout(h);h=setTimeout(()=>{t.textContent=orig;},1500);show();}).catch(show);else show();});})();
