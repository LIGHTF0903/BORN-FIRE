// BORN FIRE — shared by the KO page (/) and the EN page (/en/).
// Each page first defines TRACKS (track list) and PAGE (asset base path + its own button/label words).
// Title lines: a trailing (…) goes on its own line so a break never falls inside it
const tl=s=>{const m=s.match(/^(.*\S)\s+(\([^()]*\))$/);return m?`<span class="tl">${m[1]}</span><span class="tl tl--p">${m[2]}</span>`:`<span class="tl">${s}</span>`;};
// Credit lines: a leading Lead/Feat/Bonus part stays on line 1, the rest goes to line 2 (separator dropped)
const cr=s=>{const m=s.match(/^((?:Lead|Feat|Bonus)\b.*?)\s+[\/·]\s+(.+)$/);return m?`<span class="cr">${m[1]}</span><span class="cr">${m[2]}</span>`:s;};
// Bonus tracks get a BONUS badge (like TITLE); the 'Bonus' word is dropped from the credit line
const isBonus=c=>/^Bonus(?![A-Za-z])/.test(c);
const noBonus=c=>c.replace(/^Bonus\s*(?:[·\/]\s*)?/,'');
const badge=(i,c)=>i===TITLE?'<span class="fcard__badge">TITLE</span>':isBonus(c)?'<span class="fcard__badge fcard__badge--bonus">BONUS</span>':'';
const TITLE = 7; // 모닥불

// Coverflow tracklist (starts on the title track)
const flow=document.getElementById('flow'), fstage=document.getElementById('flowStage'), fcount=document.getElementById('flowCount');
// Card photos: assets/cards/NN.jpg — sharp 1080p frames from each official live video, cropped 600x840
const N=TRACKS.length, PLAYSVG='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>';
fstage.innerHTML = TRACKS.map((t,i)=>`
  <button class="fcard${t[3]?'':' soon'}" type="button" data-i="${i}" ${t[3]?`style="background:#111 url('${PAGE.base}assets/cards/${t[0]}.jpg') 50% 50%/cover no-repeat"`:''} aria-label="${t[0]} ${t[1]}${t[3]?'':' ('+PAGE.soon+')'}">
    <span class="fcard__n">${t[0]}</span>
    <span class="fcard__t">${badge(i,t[2])}<span class="fcard__name">${tl(t[1])}</span><span class="fcard__credit">${t[3]?cr(noBonus(t[2])):PAGE.soonCredit}</span></span>
    <span class="fcard__play">${PLAYSVG} ${PAGE.watch}</span>
  </button>`).join('');
const cards=[...fstage.children];
let pos=TITLE;            // continuous position (index of the centred card)
const idx=k=>((k%N)+N)%N;  // wrap any card number into 0..N-1
const centre=()=>idx(Math.round(pos));
const wrap=d=>{d=idx(d);return d>N/2?d-N:d;};
const fplayer=document.getElementById('fplayer'), fpFrame=document.getElementById('fplayerFrame');
let openedAt=0;
const fpend=document.getElementById('fpend');
let inlIdx=-1;
function nextPlayable(i){for(let k=1;k<=N;k++){const j=(i+k)%N;if(TRACKS[j][3])return j;}return i;}
// hiding the end screen while one of its buttons has focus would drop focus to the page top; hand it to the centre card
const hideEnd=()=>{if(fpend.contains(document.activeElement))cards[centre()].focus({preventScroll:true});fpend.hidden=true;};
function syncExtras(i){inlIdx=i;hideEnd();
  const n=TRACKS[nextPlayable(i)];document.getElementById('fpendNext').textContent=n[0]+'. '+n[1];}
function onInlState(e){if(e.data===YT.PlayerState.ENDED){fpend.hidden=false;}else if(e.data===YT.PlayerState.PLAYING){hideEnd();}}
document.getElementById('fpendGo').onclick=()=>{const j=nextPlayable(inlIdx);go(Math.round(pos)+wrap(j-pos));};
document.getElementById('fpendReplay').onclick=()=>{hideEnd();try{inl.seekTo(0,true);inl.playVideo();}catch(_){}};
function playInline(i){const t=TRACKS[i];if(!t||!t[3])return;if(window.pauseStage)window.pauseStage();openedAt=performance.now();syncExtras(i);
  if(!fplayer.hidden&&inl&&inl.loadVideoById){inl.loadVideoById(t[3]);return;}
  fpFrame.innerHTML='<div id="fpYT"></div>';fplayer.hidden=false;inl=null;
  if(matchMedia('(orientation:landscape) and (max-height:500px)').matches)requestAnimationFrame(()=>fplayer.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));  // sideways phone: bring the video fully into view
  const mk=()=>{inl=new YT.Player('fpYT',{videoId:t[3],host:'https://www.youtube-nocookie.com',
    playerVars:{autoplay:1,rel:0,playsinline:1,modestbranding:1},events:{onReady:e=>e.target.playVideo(),onStateChange:onInlState}});
    const f=fpFrame.querySelector('iframe');if(f)f.title=`${t[1]} — ${PAGE.live}`;};
  clearInterval(ytWait);if(window.YT&&YT.Player)mk();else{ytWait=setInterval(()=>{if(window.YT&&YT.Player){clearInterval(ytWait);mk();}},100);}}
// inlVol: volume tracked here while keys are pressed (getVolume() lags right after setVolume()); after a 1s pause it is
// re-read from the player, so a volume set with YouTube's own slider is the starting point; ytWait: pending wait for the YouTube API
let inl=null, inlVol=100, inlVolAt=0, ytWait=0;
function stopInline(){clearInterval(ytWait);if(fplayer.hidden)return;if(fplayer.contains(document.activeElement))cards[centre()].focus({preventScroll:true});  // focus on a hidden button would be lost
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});try{inl&&inl.destroy();}catch(_){}inl=null;fpFrame.innerHTML='';fplayer.hidden=true;fpend.hidden=true;if(window.resumeStage)window.resumeStage();}
// Click anywhere outside the open video closes it (the < > buttons switch videos instead)
document.addEventListener('click',e=>{if(fplayer.hidden||performance.now()-openedAt<300||flow.dataset.justDragged)return;  // a drag's trailing click must not close the video

  if(e.target.closest('#fplayer,#flowPrev,#flowNext,.fcard'))return;stopInline();});
// ESC closes the inline player from anywhere on the page
// YouTube's own shortcuts, re-created here so ESC can also close the player
addEventListener('keydown',e=>{
  if(fplayer.hidden||e.ctrlKey||e.metaKey||e.altKey)return;
  const tag=(e.target.tagName||'');if(tag==='INPUT'||tag==='TEXTAREA')return;
  if((e.key===' '||e.key==='Enter')&&e.target.closest&&e.target.closest('button,a[href],[role="button"],summary,select')&&!(e.key===' '&&e.target.classList.contains('fcard')))return;  // Space on the focused card pauses (its click would restart the video)
  if(e.key==='Escape'){stopInline();return;}
  const p=inl;if(!p||!p.getPlayerState)return;
  const k=e.key.toLowerCase(), t=()=>p.getCurrentTime()||0, d=()=>p.getDuration()||0, seek=x=>p.seekTo(Math.max(0,Math.min(d(),x)),true);
  let hit=true;
  if(k===' '||k==='k'){p.getPlayerState()===1?p.pauseVideo():p.playVideo();}
  else if(k==='arrowleft')seek(t()-5); else if(k==='arrowright')seek(t()+5);
  else if(k==='j')seek(t()-10); else if(k==='l')seek(t()+10);
  else if(k==='arrowup'||k==='arrowdown'){if(performance.now()-inlVolAt>1000)inlVol=p.getVolume();inlVolAt=performance.now();
    if(k==='arrowup'){if(p.isMuted())p.unMute();inlVol=Math.min(100,inlVol+5);}else inlVol=Math.max(0,inlVol-5);p.setVolume(inlVol);}
  else if(k==='m'){p.isMuted()?p.unMute():p.mute();}
  else if(k==='f'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else{const el=fpFrame.querySelector('iframe')||fplayer;if(el.requestFullscreen)el.requestFullscreen().catch(()=>{});}}  // iPhone Safari has no element fullscreen
  else if(/^[0-9]$/.test(k))seek(d()*(+k)/10);
  else hit=false;
  if(hit){e.preventDefault();e.stopImmediatePropagation();}
},true);
// Clicking inside the YouTube player moves keyboard focus into it (a separate site), so the page stops hearing ESC.
// After such a click, hand focus back to the page (clicks on the video controls still work).
addEventListener('blur',()=>{setTimeout(()=>{const a=document.activeElement;
  if(!fplayer.hidden&&a&&a.tagName==='IFRAME'&&fplayer.contains(a)&&!document.fullscreenElement){a.blur();window.focus();flow.focus({preventScroll:true});}},120);});
let gap=250;  // card spacing (CSS --gap), re-measured on resize
// --gap can be a calc() (landscape phones); a hidden probe resolves it to pixels
const gapProbe=document.createElement('i');gapProbe.style.cssText='position:absolute;visibility:hidden;width:var(--gap)';flow.appendChild(gapProbe);
const measureGap=()=>{gap=gapProbe.offsetWidth||250;};
let shownK=-1;  // counter is rewritten only when the centre card changes (it is aria-live)
function layout(){
  cards.forEach((c,i)=>{
    const d=wrap(i-pos), a=Math.abs(d);
    const x=d*gap*(1-Math.min(a,3)*0.06);
    const rot=Math.max(-55,Math.min(55,-d*32));
    const sc=1-Math.min(a,4)*0.11;
    c.style.transform=`translateX(${x}px) translateZ(${-a*90}px) rotateY(${rot}deg) scale(${sc})`;
    c.style.zIndex=100-Math.round(a*10);
    c.style.opacity=a>3.6?0:1;
    c.style.filter=`brightness(${1-Math.min(a,3)*0.18})`;
    c.style.pointerEvents=a>3.2?'none':'';
    c.classList.toggle('is-center',a<0.5);
    c.tabIndex=a<0.5?0:-1;
  });
  const k=centre();if(k===shownK)return;shownK=k;
  fcount.innerHTML=`<b>${TRACKS[k][0]}</b> / ${String(N).padStart(2,'0')}`;
}
function go(target){
  const moving=Math.round(target)!==Math.round(pos), playing=!fplayer.hidden;
  if(moving&&playing){ // skip cards without a video while a video is playing
    const dir=Math.sign(Math.round(target)-Math.round(pos))||1;let k=Math.round(target),guard=0;
    while(!TRACKS[idx(k)][3]&&guard++<N)k+=dir;target=k;}
  flow.classList.add('anim');pos=target;layout();
  if(document.activeElement&&document.activeElement.classList.contains('fcard'))cards[centre()].focus({preventScroll:true});  // keyboard focus follows the centre card
  if(moving&&playing)playInline(centre());}
document.getElementById('flowPrev').onclick=()=>go(Math.round(pos)-1);
document.getElementById('flowNext').onclick=()=>go(Math.round(pos)+1);
flow.addEventListener('keydown',e=>{if(!fplayer.hidden)return;if(e.key==='ArrowRight'){e.preventDefault();go(Math.round(pos)+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(Math.round(pos)-1);}
  if(e.key==='Enter'&&e.target===flow)playInline(centre());if(e.key==='Escape')stopInline();});
// drag / swipe
let drag=null;
fstage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,p:pos,moved:false,id:e.pointerId};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<6)return;if(Math.abs(e.clientY-drag.y)>Math.abs(dx)){drag=null;return;}drag.moved=true;drag.wasPlaying=!fplayer.hidden;if(drag.wasPlaying){try{const s=inl&&inl.getPlayerState&&inl.getPlayerState();drag.running=s!==2&&s!==0;inl&&inl.pauseVideo();}catch(_){}fplayer.style.visibility='hidden';}flow.classList.remove('anim');fstage.classList.add('dragging');try{fstage.setPointerCapture(drag.id);}catch(_){}}  // running: only a paused/ended video stays stopped after the drag (a just-loaded one is still unstarted)
  pos=drag.p-dx/gap;layout();});
// One place ends every drag: finger lifted, or the browser/OS cancelled it (edge-swipe, scroll takeover, app switch).
// A cancelled drag snaps back to the card it started on; a hidden-while-dragging video is always shown again.
function endDrag(cancelled){if(!drag)return;const moved=drag.moved,wasPlaying=drag.wasPlaying,running=drag.running,start=drag.p;drag=null;fstage.classList.remove('dragging');
  if(!moved)return;
  flow.dataset.justDragged='1';setTimeout(()=>delete flow.dataset.justDragged,50);
  if(cancelled)pos=start;
  if(wasPlaying){fplayer.style.visibility='';pos=Math.round(pos);const k=idx(pos);
    if(k===inlIdx&&inl){flow.classList.add('anim');layout();if(running)try{inl.playVideo();}catch(_){}}  // a video paused (or finished) before the drag stays as it was
    else if(TRACKS[k][3]){flow.classList.add('anim');layout();playInline(k);}else{stopInline();go(pos);}}
  else go(Math.round(pos));}
addEventListener('pointerup',()=>endDrag(false));
addEventListener('pointercancel',()=>endDrag(true));
// only when the carousel itself loses capture (a card's implicit touch capture moving to the carousel also fires this, bubbling)
fstage.addEventListener('lostpointercapture',e=>{if(e.target===fstage)endDrag(true);});
addEventListener('blur',()=>endDrag(true));
document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag(true);});
// horizontal wheel / trackpad swipe (vertical wheel keeps scrolling the page)
let wheelAcc=0,wheelT;
fstage.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();wheelAcc+=e.deltaX;
  clearTimeout(wheelT);if(Math.abs(wheelAcc)>60){go(Math.round(pos)+Math.sign(wheelAcc));wheelAcc=0;}wheelT=setTimeout(()=>wheelAcc=0,200);},{passive:false});
// click: side card -> bring to centre, centre card -> play
fstage.addEventListener('click',e=>{if(flow.dataset.justDragged)return;const c=e.target.closest('.fcard');if(!c)return;const i=+c.dataset.i;
  if(c.classList.contains('is-center')){playInline(i);}else{go(Math.round(pos)+wrap(i-pos));}});
addEventListener('resize',()=>{measureGap();layout();});
measureGap();layout();

// Nav turns solid after the video
const nav=document.getElementById('nav');
const navSolid=()=>nav.classList.toggle('solid',scrollY>innerHeight*0.85);
addEventListener('scroll',navSolid,{passive:true}); navSolid();

// Reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

// Full-screen background live video (muted autoplay loop, tap to unmute)
(function(){
  const stage=document.getElementById('stage'), btn=document.getElementById('stage-sound'), VID='jKdQVbeaqe4', START=140;
  // Data-saver on (Android Chrome / Samsung Internet): keep the still poster (the .stage background) and never load the background video
  const SAVE=!!(navigator.connection&&navigator.connection.saveData);
  if(SAVE)stage.classList.add('still');
  let player=null, ready=false;
  // not playing: paused, or never started (autoplay blocked: unstarted/cued)
  const stopped=()=>{const s=player.getPlayerState();return s!==YT.PlayerState.PLAYING&&s!==YT.PlayerState.BUFFERING;};
  window.onYouTubeIframeAPIReady=function(){
    if(SAVE)return;
    player=new YT.Player('stage-player',{videoId:VID,host:'https://www.youtube-nocookie.com',
      playerVars:Object.assign({autoplay:1,mute:1,controls:0,start:START,playsinline:1,rel:0,modestbranding:1,disablekb:1,iv_load_policy:3,fs:0},
        matchMedia('(hover: hover) and (pointer: fine)').matches?{vq:'hd1080'}:{}),  // PC: ask for 1080p; phones/tablets: YouTube picks automatically
      events:{
        onReady:e=>{ready=true;e.target.mute();e.target.getIframe().tabIndex=-1;},  // autoplay=1 starts it; extra playVideo() calls make YouTube flash its play/pause icon; tabIndex: decorative (aria-hidden), kept out of the Tab order
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
