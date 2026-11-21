// BORN FIRE — shared by the KO page (/) and the EN page (/en/).
// Each page first defines TRACKS (track list) and PAGE (asset base path + its own button/label words).
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
// Title lines: a trailing (…) goes on its own line so a break never falls inside it
const tl=s=>{const m=s.match(/^(.*\S)\s+(\([^()]*\))$/);return m?`<span class="tl">${m[1]}</span><span class="tl tl--p">${m[2]}</span>`:`<span class="tl">${s}</span>`;};
// Credit lines: a leading Lead/Feat/Bonus part stays on line 1, the rest goes to line 2 (separator dropped)
const cr=s=>{const m=s.match(/^((?:Lead|Feat|Bonus)\b.*?)\s+[\/·]\s+(.+)$/);return m?`<span class="cr">${m[1]}</span><span class="cr">${m[2]}</span>`:`<span class="cr">${s}</span>`;};
const isBonus=c=>/^Bonus(?![A-Za-z])/.test(c);
const noBonus=c=>c.replace(/^Bonus\s*(?:[·\/]\s*)?/,'');
const TITLE=7; // 모닥불
const N=TRACKS.length;
const badge=i=>i===TITLE?'<span class="badge">TITLE</span>':isBonus(TRACKS[i][2])?'<span class="badge badge--bonus">BONUS</span>':'';
const PLAYSVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>';
const photo=i=>`${PAGE.base}assets/cards/${TRACKS[i][0]}.jpg`;
const credit=i=>TRACKS[i][3]?cr(noBonus(TRACKS[i][2])):PAGE.soonCredit;
const idx=k=>((k%N)+N)%N;
const wrapD=d=>{d=idx(d);return d>N/2?d-N:d;};

/* =====================================================================================
   Tracklist: a reflective carousel; the song in front fills the room behind it
   ===================================================================================== */
const pyre=document.getElementById('flow'), scene=document.getElementById('scene'), ringEl=document.getElementById('ring');
ringEl.innerHTML=TRACKS.map((t,i)=>`<button class="card${t[3]?'':' soon'}" type="button" data-i="${i}" tabindex="-1" aria-label="${t[0]} ${t[1]}${t[3]?'':' ('+PAGE.soon+')'}">
  <span class="card__f" style="background-image:url('${photo(i)}')"></span><span class="card__n">${t[0]}</span><span class="card__t"><span class="card__badge">${badge(i)}</span><span class="card__name">${tl(t[1])}</span></span></button>`).join('');
const cards=[...ringEl.children];
const fCredit=document.getElementById('frontCredit'), fBadge=document.getElementById('frontBadge'), fcount=document.getElementById('flowCount'), front=document.getElementById('front');
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
    const isF=a<.5;if(isF!==c.classList.contains('is-front')){c.classList.toggle('is-front',isF);c.tabIndex=isF?0:-1;
      // keyboard focus follows the front card, so ← / → then Enter plays the song now in front
      if(isF&&cards.includes(document.activeElement))c.focus({preventScroll:true});}});
  const f=frontIdx();if(f!==shown)showFront(f);}
function showFront(i){const first=shown<0;shown=i;
  // the room behind: cross-fade to this song's photo
  const nb=back[backOn^1];nb.style.backgroundImage=`url('${photo(i)}')`;nb.classList.add('on');back[backOn].classList.remove('on');backOn^=1;
  const set=()=>{fBadge.innerHTML=badge(i);fCredit.innerHTML=credit(i);front.classList.remove('swap');};
  fcount.innerHTML=`<b>${TRACKS[i][0]}</b> / ${String(N).padStart(2,'0')}`;
  if(first||RM){set();return;}front.classList.add('swap');clearTimeout(showFront.t);showFront.t=setTimeout(set,180);}
function tick(){pos+=(target-pos)*.12;if(Math.abs(target-pos)<.002&&!drag){pos=target;render();raf=0;return;}render();raf=requestAnimationFrame(tick);}
const kick=()=>{if(!raf)raf=requestAnimationFrame(tick);};
function goTo(i){touched();target=target+wrapD(i-Math.round(target));kick();}
const step=d=>{touched();target=Math.round(target)+d;kick();};
// the tap hint on the centre card goes away for good (until reload) once the carousel is touched in any way
const touched=()=>pyre.classList.add('touched');
// it sits over the centre card's top-right corner (outside the 3D cards, so nothing clips it)
scene.insertAdjacentHTML('beforeend','<span class="tap-hint" aria-hidden="true"><b>TAP</b><svg viewBox="0 0 16 16"><path d="M2 9.5 3.5 4M6.5 11.5 11 7.5M7.5 15.5l5.5-.5"/></svg></span>');
pyre.addEventListener('keydown',e=>{if(th.classList.contains('on'))return;
  if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  else if(e.key==='Enter'&&(e.target===pyre)){play(frontIdx());}});
// drag / swipe: one card's spacing of movement moves one place; a flick carries on
scene.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,p:pos,moved:false,id:e.pointerId,lx:e.clientX,lt:performance.now(),v:0};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<6)return;if(Math.abs(e.clientY-drag.y)>Math.abs(dx)){drag=null;return;}drag.moved=true;touched();scene.classList.add('dragging');try{scene.setPointerCapture(drag.id);}catch(_){}}
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
   Video window: the card you tapped grows into the song's live video
   ===================================================================================== */
const th=document.getElementById('th'), thBg=document.getElementById('thBg'), ghost=document.getElementById('ghost'), fplayer=document.getElementById('fplayer'), fpFrame=document.getElementById('fplayerFrame');
const fpend=document.getElementById('fpend'), thT=document.getElementById('thTitle'), thC=document.getElementById('thCredit'), thX=document.getElementById('thClose');
let inl=null, cur=-1, ytWait=0, thT0=0, opener=null;
function nextPlayable(i,dir=1){for(let s=1;s<=N;s++){const j=idx(i+dir*s);if(TRACKS[j][3])return j;}return i;}
const hideEnd=()=>{if(fpend.contains(document.activeElement))thX.focus({preventScroll:true});fpend.hidden=true;};
// the player shows as soon as it is created (the song photo stays underneath while YouTube loads)
const goLive=()=>fplayer.classList.add('live');
function onInlState(e){if(e.data===YT.PlayerState.ENDED)fpend.hidden=false;else if(e.data===YT.PlayerState.PLAYING)hideEnd();}
function play(i){touched();const t=TRACKS[i];if(!t||!t[3])return;if(window.pauseStage)window.pauseStage();cur=i;hideEnd();
  const n=TRACKS[nextPlayable(i)];document.getElementById('fpendNext').textContent=n[0]+'. '+n[1];
  const b=badge(i);thT.innerHTML=`${b?`<span class="th__b">${b}</span>`:''}<span style="color:var(--fire-2)">${t[0]}</span>&nbsp; ${tl(t[1])}`;thC.innerHTML=credit(i);thBg.style.backgroundImage=`url('${photo(i)}')`;
  if(th.dataset.closing)return;
  fplayer.classList.remove('live');fplayer.style.backgroundImage=`url('${photo(i)}')`;
  if(!th.classList.contains('on')){opener=document.activeElement;
    thT0=performance.now();th.classList.add('on');th.removeAttribute('aria-hidden');document.documentElement.classList.add('th-open');
    grow(cards[i].querySelector('.card__f'),i,true);thX.focus({preventScroll:true});}
  const name=()=>{const f=fpFrame.querySelector('iframe');if(f)f.title=`${t[1]} — ${PAGE.live}`;};
  if(inl&&inl.loadVideoById){inl.loadVideoById(t[3]);name();goLive();return;}
  fpFrame.innerHTML='<div id="fpYT"></div>';inl=null;
  const mk=()=>{inl=new YT.Player('fpYT',{videoId:t[3],host:'https://www.youtube-nocookie.com',
    playerVars:Object.assign({autoplay:1,rel:0,playsinline:1,modestbranding:1},window.__MUTE_CARDS?{mute:1}:{}),events:{onReady:e=>e.target.playVideo(),onStateChange:onInlState}});
    name();goLive();};  // the YouTube player shows right away, even while it is still loading
  // until the YouTube API has loaded, wait for it (a new song or closing the window cancels the wait)
  clearInterval(ytWait);if(window.YT&&YT.Player)mk();else ytWait=setInterval(()=>{if(window.YT&&YT.Player){clearInterval(ytWait);mk();}},100);}
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
  const pr=getComputedStyle(fplayer).borderTopLeftRadius||'14px';
  ghost.classList.remove('go');Object.assign(ghost.style,box(from),{borderRadius:open?'12px':pr,opacity:'1'});
  if(!open)th.classList.remove('in');
  void ghost.offsetWidth;ghost.classList.add('go');
  Object.assign(ghost.style,box(to),{borderRadius:open?pr:'12px'});
  // open: when the photo is nearly in place (~85%), the player (YouTube, loaded or not) takes over while the photo fades
  if(open){growT=setTimeout(()=>{th.classList.add('in');ghost.style.opacity='0';growT=setTimeout(done,420);},300);}
  else growT=setTimeout(done,620);}
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

// Nav turns solid after the video
const nav=document.getElementById('nav');
const navSolid=()=>nav.classList.toggle('solid',scrollY>innerHeight*0.85);
addEventListener('scroll',navSolid,{passive:true}); navSolid();

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// Full-screen background live video (muted autoplay loop, tap to unmute)
(function(){
  const stage=document.getElementById('stage'), btn=document.getElementById('stage-sound'), VID=PAGE.hero||'jKdQVbeaqe4',
    // preview: phones held upright start where the owner's vertical cut starts (PAGE.heroStartUp)
    START=(PAGE.heroStartUp!=null&&matchMedia('(max-width:600px) and (orientation:portrait)').matches)?PAGE.heroStartUp:(PAGE.heroStart??140);
  // Data-saver on (Android Chrome / Samsung Internet): keep the still poster (the .stage background) and never load the background video
  const SAVE=!!(navigator.connection&&navigator.connection.saveData);
  if(SAVE)stage.classList.add('still');
  let player=null, ready=false; let showT=0; const UPRIGHT=matchMedia('(max-width:600px) and (orientation:portrait)').matches;
  // not playing: paused, or never started (autoplay blocked: unstarted/cued)
  const stopped=()=>{const s=player.getPlayerState();return s!==YT.PlayerState.PLAYING&&s!==YT.PlayerState.BUFFERING;};
  window.onYouTubeIframeAPIReady=function(){
    if(SAVE)return;
    player=new YT.Player('stage-player',{videoId:VID,host:'https://www.youtube-nocookie.com',
      playerVars:Object.assign({autoplay:1,mute:1,controls:0,start:START,playsinline:1,rel:0,modestbranding:1,disablekb:1,iv_load_policy:3,fs:0},
        FINE?{vq:'hd1080'}:{}),  // PC: ask for 1080p; phones/tablets: YouTube picks automatically
      events:{
        onReady:e=>{ready=true;e.target.mute();e.target.getIframe().tabIndex=-1;},  // autoplay=1 starts it; extra playVideo() calls make YouTube flash its play/pause icon; tabIndex: decorative (aria-hidden), kept out of the Tab order
        onStateChange:e=>{clearTimeout(showT);
                          // preview: held upright the whole player frame is on screen, so wait out YouTube's start-up title / 'More videos' overlay (about 3 s) before showing it
                          if(e.data===YT.PlayerState.PLAYING){if(UPRIGHT)showT=setTimeout(()=>stage.classList.add('playing'),3000);else stage.classList.add('playing');}
                          // preview: while YouTube isn't playing (paused, ended, autoplay blocked) the poster shows instead, so YouTube's own pause screen ('More videos', title) never appears
                          else if(e.data===YT.PlayerState.PAUSED||e.data===YT.PlayerState.ENDED||e.data===YT.PlayerState.CUED)stage.classList.remove('playing');
                          if(e.data===YT.PlayerState.ENDED){holdUntil=Date.now()+5000;wake();e.target.seekTo(START,true);e.target.playVideo();}}
      }});
  };
  const t=document.createElement('script');t.src='https://www.youtube.com/iframe_api';document.head.appendChild(t);
  // preview: opened upright, the hero loops the same stretch as the owner's vertical cut (PAGE.heroStartUp to PAGE.heroEndUp)
  if(PAGE.heroEndUp!=null&&START===PAGE.heroStartUp)setInterval(()=>{if(ready&&player.getPlayerState()===YT.PlayerState.PLAYING&&player.getCurrentTime()>=PAGE.heroEndUp){holdUntil=Date.now()+5000;wake();player.seekTo(START,true);}},200);
  btn.addEventListener('click',()=>{
    if(!ready)return;
    const unmute=!stage.classList.contains('unmuted');
    if(unmute){player.unMute();lastVol=vol();player.setVolume(lastVol);if(stopped())player.playVideo();}else{player.mute();}
    stage.classList.toggle('unmuted',unmute);btn.setAttribute('aria-pressed',String(unmute));
    btn.setAttribute('aria-label',unmute?PAGE.mute:PAGE.unmute);
  });
  // Hide the sound button after 2.5s of no activity; show it again on mouse move / touch / key / scroll
  let idleT; let holdUntil=Date.now()+6000; const wake=()=>{stage.classList.remove('idle');clearTimeout(idleT);idleT=setTimeout(()=>stage.classList.add('idle'),Math.max(2500,holdUntil-Date.now()));};
  ['mousemove','touchstart','keydown','scroll'].forEach(ev=>addEventListener(ev,wake,{passive:true}));
  btn.addEventListener('focus',wake); wake();
  // While a track video plays, the background video is paused (its sound setting is left as it was);
  // when the track video is closed, the background picks up again from where it stopped.
  let pausedForCard=false;
  window.pauseStage=()=>{if(!ready||pausedForCard)return;try{if(player.getPlayerState()!==YT.PlayerState.PAUSED){player.pauseVideo();pausedForCard=true;}}catch(_){}};
  window.resumeStage=()=>{if(!pausedForCard)return;pausedForCard=false;try{player.playVideo();}catch(_){}};
  // Scroll-linked fade: music keeps playing while scrolling, getting quieter (as if from a distance)
  let lastVol=-1;
  const album=document.getElementById('album');
  // Same drop as before down to the album intro; below it the volume keeps falling evenly
  // and reaches 50% exactly at the bottom of the page
  const FLOOR=0.5;
  const vol=()=>{const H=innerHeight,y=scrollY,y0=album.offsetTop,v0=1-y0/(H*3),end=document.documentElement.scrollHeight-H;
    const v=y<=y0?1-y/(H*3):v0-(v0-FLOOR)*Math.min(1,(y-y0)/Math.max(1,end-y0));return Math.round(100*Math.max(FLOOR,v));};
  const fade=()=>{if(!ready||!stage.classList.contains('unmuted'))return;const v=vol();if(v!==lastVol){player.setVolume(v);lastVol=v;}};
  addEventListener('scroll',fade,{passive:true});
  // (No pause/resume on scroll: each resume makes YouTube flash its play icon in the middle of the video)
})();

// Listen popup
(function(){const d=document.getElementById('lsn'),o=document.getElementById('lsnOpen'),bx=d.querySelector('.lsn__box');
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;let t=0;
function open(){clearTimeout(t);d.classList.remove('out');d.classList.add('on');d.removeAttribute('aria-hidden');requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.add('in')));bx.focus({preventScroll:true});}
function close(){if(!d.classList.contains('on')||d.classList.contains('out'))return;d.classList.remove('in');d.classList.add('out');o.focus({preventScroll:true});t=setTimeout(()=>{d.classList.remove('on','out');d.setAttribute('aria-hidden','true');},RM()?0:300);}
o.addEventListener('click',open);d.addEventListener('click',e=>{if(!e.target.closest('.lsn__list a'))close();});
// Esc closes; Tab stays inside the open popup (aria-modal)
document.addEventListener('keydown',e=>{if(!d.classList.contains('in'))return;
  if(e.key==='Escape'){e.stopImmediatePropagation();close();return;}
  if(e.key!=='Tab')return;const a=d.querySelectorAll('.lsn__list a'),f=a[0],l=a[a.length-1],c=document.activeElement;
  if(e.shiftKey?(c===f||!bx.contains(c)||c===bx):(c===l||!bx.contains(c))){e.preventDefault();(e.shiftKey?l:f).focus();}},true);})();

// Email (PC and phones alike): copy the address, then reveal the 'open in mail app' link
(function(){const b=document.getElementById('mailBtn'),o=document.getElementById('mailOpen');if(!b)return;const t=b.querySelector('.mail-txt'),orig=t.textContent;let h=0;
b.addEventListener('click',e=>{let p=null;try{p=navigator.clipboard&&navigator.clipboard.writeText('callingchoir@gmail.com');}catch(_){p=null;}
  e.preventDefault();
  const show=()=>{if(o){o.classList.add('on');}};
  if(p)p.then(()=>{t.textContent=b.dataset.copied;clearTimeout(h);h=setTimeout(()=>{t.textContent=orig;},1500);show();}).catch(show);else show();});})();
// In-page links (nav, Scroll, 'watch every song') scroll to their section without adding #… to the address,
// so a refresh stays where the visitor was instead of jumping back to that section.
(function(){
  const go=el=>{if(!el.hasAttribute('tabindex')&&!el.matches('a[href],button,input,select,textarea'))el.setAttribute('tabindex','-1');
    el.focus({preventScroll:true});el.scrollIntoView({block:'start'});};
  document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;const id=decodeURIComponent(a.getAttribute('href').slice(1));
    const el=id&&document.getElementById(id);if(!el)return;e.preventDefault();go(el);});
  // Where the page opens (the <head> script switched off the browser's own scroll restoration and removed any #…):
  // a refresh / back / forward returns to the spot the visitor left; an opened #… link shows that section; otherwise the top.
  const KEY='bf-y:'+location.pathname, nt=(performance.getEntriesByType('navigation')[0]||{}).type;
  addEventListener('pagehide',()=>{try{sessionStorage.setItem(KEY,String(Math.round(scrollY)));}catch(_){}});
  let place=null;
  if(window.BF_HASH){let id=window.BF_HASH;try{id=decodeURIComponent(id);}catch(_){}const el=document.getElementById(id);if(el)place=()=>el.scrollIntoView({behavior:'instant',block:'start'});}
  else if(nt==='reload'||nt==='back_forward'){let y=null;try{y=sessionStorage.getItem(KEY);}catch(_){}if(y!==null&&+y>0)place=()=>scrollTo({top:+y,behavior:'instant'});}
  if(place){let moved=false;const stop=()=>{moved=true;};['wheel','touchstart','keydown','mousedown'].forEach(ev=>addEventListener(ev,stop,{passive:true,once:true}));
    place();addEventListener('load',()=>{if(!moved)place();},{once:true});}
})();
