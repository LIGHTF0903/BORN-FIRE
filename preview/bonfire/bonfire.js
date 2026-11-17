// BORN FIRE — "BONFIRE" concept (preview). Shared by the KO and EN preview pages.
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
   1. Shader fire (WebGL). mode 0: a wide wall of flame (the stage's bottom edge), mode 1: one bonfire (the ring's centre)
   ===================================================================================== */
const FS=`precision mediump float;
uniform vec2 R;uniform float T;uniform float M;uniform float P;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/R;float asp=R.x/R.y;vec2 p=vec2(uv.x*asp,uv.y);float c;
 if(M<.5){
  p.x+=(P-uv.x)*uv.y*.5;
  float q=fbm(vec2(p.x*3.4,p.y*1.7-T*1.05));float q2=fbm(vec2(p.x*7.5+q*2.2,p.y*3.6-T*2.));
  float e=abs(uv.x-.5)*2.;float prof=1.-.62*e*e;
  c=(prof*.82-uv.y*1.75+q*.95+q2*.5-.58)*1.75;
  c*=smoothstep(0.,.32,uv.y)*.92;
 }else{
  float d=abs(uv.x-.5)*2.;
  float q=fbm(vec2(p.x*2.6,p.y*2.1-T*1.25));float q2=fbm(vec2(p.x*5.5+q*1.6,p.y*4.2-T*2.3));
  c=(1.15-d*d*(2.4+uv.y*7.)-uv.y*1.3+(q+q2*.6)*.9-.55)*1.5;
  c*=smoothstep(0.,.12,uv.y);
 }
 c=clamp(c,0.,1.);
 vec3 col=vec3(1.3*c,.95*c*c*c+.04*c,.4*pow(c,6.));
 float a=smoothstep(0.,.7,c);
 gl_FragColor=vec4(col*a,a);}`;
function fire(canvas,mode,scale){
  const gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false});if(!gl)return null;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return null;gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T'),uM=gl.getUniformLocation(pr,'M'),uP=gl.getUniformLocation(pr,'P');
  gl.uniform1f(uM,mode);let raf=0,t0=performance.now()-Math.random()*9e3,lean=.5,leanTo=.5;
  const size=()=>{const w=Math.max(1,Math.round(canvas.clientWidth*scale)),h=Math.max(1,Math.round(canvas.clientHeight*scale));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(uR,w,h);};
  const draw=()=>{size();lean+=(leanTo-lean)*.04;gl.uniform1f(uT,(performance.now()-t0)/1000);gl.uniform1f(uP,lean);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
  const loop=()=>{draw();raf=requestAnimationFrame(loop);};
  return{start(){if(!raf){if(RM){draw();return;}loop();}},stop(){cancelAnimationFrame(raf);raf=0;},lean(x){leanTo=x;},draw};
}

/* =====================================================================================
   2. Sparks rise from the fire and settle into the "Born Fire" logo; a finger or the mouse scatters them
   ===================================================================================== */
(function(){
  const stage=document.getElementById('stage'), logo=stage.querySelector('.stage__logo'), cv=document.getElementById('heroSparks');
  if(RM||!cv.getContext){stage.classList.add('nofx');return;}
  const g=cv.getContext('2d');let W=0,H=0,ps=[],amb=[],t0=0,raf=0,mx=-999,my=-999,landed=false;
  function build(){W=stage.clientWidth;H=stage.clientHeight;cv.width=W*DPR;cv.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);
    const r=logo.getBoundingClientRect(), s=stage.getBoundingClientRect(), fs=parseFloat(getComputedStyle(logo).fontSize);
    const o=document.createElement('canvas');o.width=W;o.height=H;const x=o.getContext('2d');
    x.font=`${fs}px "Pinyon Script"`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(logo.textContent.trim(),W/2,r.top-s.top+r.height/2);
    const d=x.getImageData(0,0,W,H).data;let pts=[];
    const step=Math.max(2,Math.round(fs/38));
    for(let y=0;y<H;y+=step)for(let xx=0;xx<W;xx+=step)if(d[(y*W+xx)*4+3]>140)pts.push([xx+(Math.random()-.5)*step,y+(Math.random()-.5)*step]);  // jittered so it reads as embers, not a dot grid
    const max=W<700?1500:2600;if(pts.length>max){pts=pts.sort(()=>Math.random()-.5).slice(0,max);}
    const old=ps;ps=pts.map((p,k)=>{const q=old[k];return q&&landed?Object.assign(q,{tx:p[0],ty:p[1]}):{
      x:W*(.15+Math.random()*.7),y:H*.9+Math.random()*H*.1,vx:(Math.random()-.5)*1.5,vy:-(2+Math.random()*3),
      tx:p[0],ty:p[1],d:p[0]/W*700+Math.random()*1100,s:.7+Math.random()*1.1,ph:Math.random()*6.3,hot:Math.random()};});
    amb=Array.from({length:W<700?18:34},()=>newAmb(true));}
  const newAmb=init=>({x:W*(.1+Math.random()*.8),y:init?H*(.55+Math.random()*.45):H+10,v:.5+Math.random()*1.4,w:Math.random()*6.3,s:.6+Math.random()*1.4,l:0,L:120+Math.random()*220});
  function frame(now){const t=now-t0;g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
    let settled=0;
    for(const p of ps){if(t<p.d)continue;
      const dx=p.tx-p.x,dy=p.ty-p.y;p.vx=(p.vx+dx*.018)*.86;p.vy=(p.vy+dy*.018)*.86;
      const mdx=p.x-mx,mdy=p.y-my,md=mdx*mdx+mdy*mdy;if(md<6400){const f=(6400-md)/6400*3.2;const m=Math.sqrt(md)||1;p.vx+=mdx/m*f;p.vy+=mdy/m*f-.4;}
      const px=p.x,py=p.y;p.x+=p.vx;p.y+=p.vy;const sp=Math.abs(p.vx)+Math.abs(p.vy);if(sp<.25)settled++;
      const tw=.62+.38*Math.sin(now*.004+p.ph);
      if(sp>1.2){const L=Math.min(1,7/sp);g.strokeStyle=`rgba(255,${150+p.hot*80|0},70,.8)`;g.lineWidth=p.s;g.beginPath();g.moveTo(p.x-p.vx*L,p.y-p.vy*L);g.lineTo(p.x,p.y);g.stroke();}
      else{const z=p.s*1.25;g.fillStyle=p.hot>.85?`rgba(255,244,214,${tw})`:`rgba(255,${170+p.hot*60|0},${70+p.hot*60|0},${tw})`;g.fillRect(p.x-z/2,p.y-z/2,z,z);}}
    if(!landed&&settled>ps.length*.85){landed=true;stage.classList.add('lit');}
    for(let k=0;k<amb.length;k++){const a=amb[k];a.l++;a.w+=.04;a.x+=Math.sin(a.w)*.6;a.y-=a.v;
      const al=Math.min(1,a.l/30)*Math.max(0,1-a.l/a.L);g.fillStyle=`rgba(255,${150+(k*37)%80},60,${al*.9})`;g.fillRect(a.x,a.y,a.s,a.s);
      if(a.l>a.L)amb[k]=newAmb(false);}
    raf=requestAnimationFrame(frame);}
  const move=e=>{const r=stage.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;};
  stage.addEventListener('pointermove',move,{passive:true});stage.addEventListener('pointerdown',move,{passive:true});
  stage.addEventListener('pointerleave',()=>{mx=my=-999;});addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){mx=my=-999;}});
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,150);});
  (document.fonts?document.fonts.load('40px "Pinyon Script"'):Promise.resolve()).then(()=>{build();t0=performance.now();
    setTimeout(()=>{landed=true;stage.classList.add('lit');},4200);  // the glow comes in even on a slow device
    whileVisible(stage,()=>{if(!raf)raf=requestAnimationFrame(frame);},()=>{cancelAnimationFrame(raf);raf=0;});});
})();

/* the stage's bottom edge burns into the page; the flames lean toward the pointer */
(function(){const cv=document.getElementById('edgeFire'),f=cv&&fire(cv,0,.5);if(!f){cv&&cv.remove();return;}
  whileVisible(cv,f.start,f.stop);
  addEventListener('pointermove',e=>f.lean(e.clientX/innerWidth),{passive:true});})();

/* =====================================================================================
   3. Sparks escaping through a church window (the manifesto: "sparks flying beyond the church walls")
   ===================================================================================== */
function emberField(cv,opt){const g=cv.getContext('2d');let W=0,H=0,ps=[],raf=0;
  const size=()=>{W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;g.setTransform(DPR,0,0,DPR,0,0);};
  const mk=()=>opt.spawn(W,H);
  function loop(){g.clearRect(0,0,W,H);g.globalCompositeOperation='lighter';
    while(ps.length<opt.count(W))ps.push(Object.assign(mk(),{l:Math.random()*60}));
    for(let k=0;k<ps.length;k++){const p=ps[k];p.l++;p.w+=.035;p.x+=p.vx+Math.sin(p.w)*.5;p.y-=p.vy;p.vx*=.995;
      const a=Math.min(1,p.l/25)*Math.max(0,1-p.l/p.L);const r=p.r*(1+(1-a)*.6);
      const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r*4);gr.addColorStop(0,`rgba(255,226,170,${a})`);gr.addColorStop(.3,`rgba(255,140,50,${a*.55})`);gr.addColorStop(1,'rgba(255,90,31,0)');
      g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,r*4,0,6.29);g.fill();
      if(p.l>p.L||p.y<-20)ps[k]=mk();}
    raf=requestAnimationFrame(loop);}
  addEventListener('resize',()=>{if(raf)size();});
  return{start(){if(!raf){size();loop();}},stop(){cancelAnimationFrame(raf);raf=0;},add(p){ps.push(p);if(ps.length>opt.count(W)*2)ps.shift();},size:()=>({W,H})};}
(function(){const sec=document.getElementById('album'),cv=sec.querySelector('.sparks');
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){sec.classList.add('in');o.disconnect();}},{rootMargin:'0px 0px -15% 0px'}).observe(sec);
  if(RM)return;
  // born at the foot of the arch, they rise and fan out past its walls
  const f=emberField(cv,{count:W=>Math.round(Math.min(70,W/14)),spawn:(W,H)=>({x:W/2+(Math.random()-.5)*W*.12,y:H*.82+Math.random()*H*.12,
    vx:(Math.random()-.5)*2.6,vy:.6+Math.random()*1.5,w:Math.random()*6.3,r:.6+Math.random()*1.6,l:0,L:200+Math.random()*260})});
  whileVisible(sec,f.start,f.stop);})();

/* =====================================================================================
   4. Tracklist: twelve cards standing in a circle around the bonfire (drag, swipe, arrows, wheel, keys)
   ===================================================================================== */
const pyre=document.getElementById('flow'), scene=document.getElementById('scene'), ringEl=document.getElementById('ring'), world=document.getElementById('world');
ringEl.innerHTML=TRACKS.map((t,i)=>`<button class="card${t[3]?'':' soon'}" type="button" data-i="${i}" tabindex="-1" aria-label="${t[0]} ${t[1]}${t[3]?'':' ('+PAGE.soon+')'}">
  <span class="card__f" style="background-image:url('${photo(i)}')"><span class="card__n">${t[0]}</span><span class="card__badge">${badge(i)}</span></span>
  <span class="card__glow"></span><span class="card__b" aria-hidden="true"></span></button>`).join('');
const cards=[...ringEl.children];
const fName=document.getElementById('frontName'), fCredit=document.getElementById('frontCredit'), fBadge=document.getElementById('frontBadge'), fPlay=document.getElementById('frontPlay'), fcount=document.getElementById('flowCount'), front=document.getElementById('front');
let R=400, ang=0, target=0, raf=0, k=.11, shown=-1, drag=null;
const frontIdx=()=>idx(Math.round(-ang/STEP));
function measure(){const cw=cards[0].offsetWidth||200;R=Math.round(cw/(2*Math.tan(Math.PI/N))*1.08);world.style.setProperty('--R',R);
  cards.forEach((c,i)=>{c.style.transform=`rotateY(${i*STEP}deg) translateZ(${R}px)`;});}
function render(){ringEl.style.transform=`rotateY(${ang}deg)`;
  cards.forEach((c,i)=>{let rel=((i*STEP+ang)%360+540)%360-180;const a=Math.abs(rel);
    c.style.setProperty('--k',Math.min(.82,Math.max(0,(a-12)/120)).toFixed(3));
    c.style.setProperty('--g',(a<100?(1-a/100)*.9:0).toFixed(3));
    const isF=a<STEP/2;if(isF!==c.classList.contains('is-front')){c.classList.toggle('is-front',isF);c.tabIndex=isF?0:-1;}});
  const f=frontIdx();if(f!==shown)showFront(f);}
function showFront(i){const first=shown<0;shown=i;
  const set=()=>{fBadge.innerHTML=badge(i);fName.innerHTML=tl(TRACKS[i][1]);fCredit.innerHTML=credit(i);fPlay.hidden=!TRACKS[i][3];front.classList.remove('swap');};
  fcount.innerHTML=`<b>${TRACKS[i][0]}</b> / ${String(N).padStart(2,'0')}`;
  if(first||RM){set();return;}front.classList.add('swap');clearTimeout(showFront.t);showFront.t=setTimeout(set,180);}
function tick(){ang+=(target-ang)*k;if(Math.abs(target-ang)<.02&&!drag){ang=target;render();raf=0;k=.11;return;}render();raf=requestAnimationFrame(tick);}
const kick=()=>{if(!raf)raf=requestAnimationFrame(tick);};
function goTo(i){const cur=Math.round(-target/STEP);target=-(cur+wrapD(i-cur))*STEP;k=.11;kick();}
const step=d=>{target=Math.round(target/STEP)*STEP-d*STEP;k=.11;kick();};
document.getElementById('flowPrev').onclick=()=>step(-1);
document.getElementById('flowNext').onclick=()=>step(1);
fPlay.onclick=e=>play(frontIdx(),e);
pyre.addEventListener('keydown',e=>{if(th.classList.contains('on'))return;
  if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  else if(e.key==='Enter'&&(e.target===pyre)){play(frontIdx(),null);}});
// drag / swipe: one card width of movement turns the ring one place; a flick carries on
scene.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,a:ang,moved:false,id:e.pointerId,lx:e.clientX,lt:performance.now(),v:0};});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;
  if(!drag.moved){if(Math.abs(dx)<6)return;if(Math.abs(e.clientY-drag.y)>Math.abs(dx)){drag=null;return;}drag.moved=true;scene.classList.add('dragging');try{scene.setPointerCapture(drag.id);}catch(_){}}
  const now=performance.now();drag.v=(e.clientX-drag.lx)/Math.max(1,now-drag.lt);drag.lx=e.clientX;drag.lt=now;
  ang=target=drag.a+dx/cards[0].offsetWidth*STEP;render();});
function endDrag(cancel){if(!drag)return;const d=drag;drag=null;scene.classList.remove('dragging');if(!d.moved)return;
  pyre.dataset.justDragged='1';setTimeout(()=>delete pyre.dataset.justDragged,50);
  if(cancel){target=d.a;}else{const fl=Math.max(-3,Math.min(3,d.v*1.6));target=Math.round((ang+fl*STEP)/STEP)*STEP;}k=.09;kick();}
addEventListener('pointerup',()=>endDrag(false));addEventListener('pointercancel',()=>endDrag(true));
addEventListener('blur',()=>endDrag(true));
let wAcc=0,wT;scene.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();wAcc+=e.deltaX;clearTimeout(wT);
  if(Math.abs(wAcc)>60){step(Math.sign(wAcc));wAcc=0;}wT=setTimeout(()=>wAcc=0,200);},{passive:false});
cards.forEach(c=>c.addEventListener('click',e=>{if(pyre.dataset.justDragged)return;const i=+c.dataset.i;
  if(c.classList.contains('is-front'))play(i,e);else goTo(i);}));
let rsT;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(()=>{measure();render();},120);});
measure();
// first time it comes into view the ring turns once around the fire and stops on the title track
target=-TITLE*STEP;ang=RM?target:target+300;render();
new IntersectionObserver((es,o)=>{if(!es[0].isIntersecting)return;o.disconnect();if(RM)return;
  const a0=ang,a1=target,t0=performance.now(),D=2400;cancelAnimationFrame(raf);raf=0;
  const spin=now=>{if(drag||Math.abs(target-a1)>.01){kick();return;}const q=Math.min(1,(now-t0)/D);ang=a0+(a1-a0)*(1-Math.pow(1-q,4));render();if(q<1)requestAnimationFrame(spin);};
  requestAnimationFrame(spin);},{rootMargin:'0px 0px -25% 0px'}).observe(scene);
(function(){const cv=document.getElementById('coreFire'),f=cv&&fire(cv,1,.6);if(!f){cv&&cv.remove();return;}whileVisible(scene,f.start,f.stop);})();

/* =====================================================================================
   5. Theatre: the song's live video opens in a ring of fire from the point you tapped
   ===================================================================================== */
const th=document.getElementById('th'), thBg=document.getElementById('thBg'), thRing=document.getElementById('thRing'), fpFrame=document.getElementById('fplayerFrame');
const fpend=document.getElementById('fpend'), thT=document.getElementById('thTitle'), thC=document.getElementById('thCredit'), thX=document.getElementById('thClose');
let inl=null, cur=-1, ytWait=0, thT0=0, opener=null;
function nextPlayable(i,dir=1){for(let s=1;s<=N;s++){const j=idx(i+dir*s);if(TRACKS[j][3])return j;}return i;}
const hideEnd=()=>{if(fpend.contains(document.activeElement))thX.focus({preventScroll:true});fpend.hidden=true;};
function onInlState(e){if(e.data===YT.PlayerState.ENDED)fpend.hidden=false;else if(e.data===YT.PlayerState.PLAYING)hideEnd();}
function play(i,ev){const t=TRACKS[i];if(!t||!t[3])return;if(window.pauseStage)window.pauseStage();cur=i;hideEnd();
  const n=TRACKS[nextPlayable(i)];document.getElementById('fpendNext').textContent=n[0]+'. '+n[1];
  thT.innerHTML=`<span style="color:var(--fire-2)">${t[0]}</span>&nbsp; ${badge(i)}${tl(t[1])}`;thC.innerHTML=credit(i);thBg.style.backgroundImage=`url('${photo(i)}')`;
  if(th.dataset.closing)return;
  if(!th.classList.contains('on')){opener=document.activeElement;
    const x=ev&&ev.clientX?ev.clientX:innerWidth/2, y=ev&&ev.clientY?ev.clientY:innerHeight/2;
    th.style.setProperty('--ox',x+'px');th.style.setProperty('--oy',y+'px');
    thRing.style.setProperty('--ox',x+'px');thRing.style.setProperty('--oy',y+'px');th.classList.remove('done');th.style.clipPath=`circle(0px at ${x}px ${y}px)`;
    thT0=performance.now();th.classList.add('on');th.removeAttribute('aria-hidden');document.documentElement.classList.add('th-open');
    reveal(x,y,true);thX.focus({preventScroll:true});}
  if(inl&&inl.loadVideoById){inl.loadVideoById(t[3]);return;}
  fpFrame.innerHTML='<div id="fpYT"></div>';inl=null;
  const mk=()=>{inl=new YT.Player('fpYT',{videoId:t[3],host:'https://www.youtube-nocookie.com',
    playerVars:Object.assign({autoplay:1,rel:0,playsinline:1,modestbranding:1},window.__MUTE_CARDS?{mute:1}:{}),events:{onReady:e=>e.target.playVideo(),onStateChange:onInlState}});
    const f=fpFrame.querySelector('iframe');if(f)f.title=`${t[1]} — ${PAGE.live}`;};
  clearInterval(ytWait);if(window.YT&&YT.Player)mk();else{ytWait=setInterval(()=>{if(window.YT&&YT.Player){clearInterval(ytWait);mk();}},100);}}
// the circle grows from the tap point; its edge is a ring of fire (JS-driven so every browser animates it the same way)
let revRaf=0;
function reveal(x,y,open){cancelAnimationFrame(revRaf);const far=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+60;
  const D=RM?0:(open?900:480),t0=performance.now(),ease=q=>q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;
  th.classList.remove('done');thRing.classList.toggle('go',!RM);
  const f=now=>{const q=D?Math.min(1,(now-t0)/D):1,r=far*(open?ease(q):1-ease(q));
    th.style.clipPath=`circle(${r.toFixed(1)}px at ${x}px ${y}px)`;thRing.style.setProperty('--r',r.toFixed(1)+'px');
    thRing.style.opacity=open?(q<.8?1:(1-q)*5):(q<.2?q*5:1-q);
    if(q<1){revRaf=requestAnimationFrame(f);return;}
    thRing.classList.remove('go');thRing.style.opacity='';
    if(open){th.classList.add('in','done');th.style.clipPath='';}
    else{th.classList.remove('on','in');th.setAttribute('aria-hidden','true');th.style.clipPath='';delete th.dataset.closing;}};
  revRaf=requestAnimationFrame(f);}
function closeTh(){if(!th.classList.contains('on')||th.dataset.closing)return;th.dataset.closing='1';clearInterval(ytWait);
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  document.documentElement.classList.remove('th-open');
  try{inl&&inl.destroy();}catch(_){}inl=null;fpFrame.innerHTML='';fpend.hidden=true;
  const ox=parseFloat(th.style.getPropertyValue('--ox'))||innerWidth/2, oy=parseFloat(th.style.getPropertyValue('--oy'))||innerHeight/2;reveal(ox,oy,false);
  if(cur>=0&&cur!==frontIdx())goTo(cur);
  (opener&&opener.focus?opener:cards[cur]).focus({preventScroll:true});
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
   6. About: the photo burns in (noise dissolve with a glowing edge), once, when it comes into view
   ===================================================================================== */
(function(){const box=document.getElementById('burn');if(!box)return;const src=box.dataset.src, pos=()=>getComputedStyle(box.firstElementChild).backgroundPosition||'50% 50%';  // same crop as the CSS image
  if(RM)return;
  const cv=document.createElement('canvas');const gl=cv.getContext('webgl',{premultipliedAlpha:true});if(!gl)return;
  const FSB=`precision mediump float;uniform sampler2D S;uniform float P;uniform vec2 Sc;uniform vec2 Of;varying vec2 v;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
  float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.1;a*=.5;}return s;}
  void main(){vec2 uv=v*Sc+Of;vec4 im=texture2D(S,uv);
   float nz=fbm(v*5.)*.75+(1.-v.y)*.35;float e=P*1.45-nz;
   if(e<0.){gl_FragColor=vec4(0.);return;}
   float band=1.-smoothstep(0.,.07,e);
   vec3 c=mix(im.rgb,vec3(1.,.55,.15)*1.6,band*.9)+vec3(1.,.8,.4)*pow(band,4.)*.8;
   float a=smoothstep(0.,.012,e);gl_FragColor=vec4(c*a,a);}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;v.y=1.-v.y;gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FSB));gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const al=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  const uP=gl.getUniformLocation(pr,'P'),uSc=gl.getUniformLocation(pr,'Sc'),uOf=gl.getUniformLocation(pr,'Of');
  const img=new Image();img.src=src;let p=0,done=false,started=false;
  function fit(){const w=box.clientWidth,h=box.clientHeight;cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR);gl.viewport(0,0,cv.width,cv.height);
    // background-size:cover with the same position as the CSS image
    const ir=img.width/img.height,br=w/h;let sx=1,sy=1;if(br>ir)sy=ir/br;else sx=br/ir;
    const [px,py]=pos().split(' ').map(s=>parseFloat(s)/100);gl.uniform2f(uSc,sx,sy);gl.uniform2f(uOf,(1-sx)*px,(1-sy)*py);}
  const draw=()=>{gl.uniform1f(uP,p);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
  img.onload=()=>{const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    box.appendChild(cv);box.classList.add('gl');fit();draw();
    new IntersectionObserver((es,o)=>{if(es[0].isIntersecting&&!started){started=true;o.disconnect();const t0=performance.now();
      const run=now=>{p=Math.min(1,(now-t0)/2600);p=1-Math.pow(1-p,2);draw();if(p<1)requestAnimationFrame(run);else done=true;};requestAnimationFrame(run);}},{rootMargin:'0px 0px -20% 0px'}).observe(box);};
  addEventListener('resize',()=>{if(box.classList.contains('gl')){fit();draw();}});})();

/* =====================================================================================
   7. Credits roll in; the closing headline heats up where you point (it drifts on its own on touch screens)
   ===================================================================================== */
(function(){const cg=document.querySelector('.cgrid');[...cg.children].forEach((d,i)=>d.style.transitionDelay=(i*.12)+'s');
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){cg.classList.add('in');o.disconnect();}},{rootMargin:'0px 0px -10% 0px'}).observe(cg);})();
(function(){const sec=document.getElementById('follow'),heat=document.getElementById('heat'),hot=heat.querySelector('.heat__hot'),cv=sec.querySelector('.sparks');
  if(RM){hot.remove();return;}
  const f=emberField(cv,{count:W=>Math.round(Math.min(80,W/15)),spawn:(W,H)=>({x:Math.random()*W,y:H+Math.random()*H*.3,vx:(Math.random()-.5)*.6,vy:.4+Math.random()*1.1,w:Math.random()*6.3,r:.6+Math.random()*1.8,l:0,L:300+Math.random()*400})});
  let hx=.5,hy=.5,tx=.5,ty=.6,auto=true,lastMove=0,raf=0,lastSpark=0;
  const set=()=>{hot.style.setProperty('--hx',(hx*100).toFixed(2)+'%');hot.style.setProperty('--hy',(hy*100).toFixed(2)+'%');};
  function loop(now){if(auto||now-lastMove>2500){auto=true;tx=.5+Math.sin(now/1700)*.42;ty=.5+Math.sin(now/1100)*.3;}
    hx+=(tx-hx)*.12;hy+=(ty-hy)*.12;set();raf=requestAnimationFrame(loop);}
  sec.addEventListener('pointermove',e=>{const r=heat.getBoundingClientRect();tx=(e.clientX-r.left)/r.width;ty=(e.clientY-r.top)/r.height;auto=false;lastMove=performance.now();
    // a few sparks fly off the pointer
    if(lastMove-lastSpark>30){lastSpark=lastMove;const s=sec.getBoundingClientRect();
      for(let k=0;k<2;k++)f.add({x:e.clientX-s.left,y:e.clientY-s.top,vx:(Math.random()-.5)*2,vy:1+Math.random()*2,w:Math.random()*6,r:.5+Math.random()*1.4,l:10,L:70+Math.random()*80});}},{passive:true});
  whileVisible(sec,()=>{f.start();if(!raf)raf=requestAnimationFrame(loop);},()=>{f.stop();cancelAnimationFrame(raf);raf=0;});})();

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
