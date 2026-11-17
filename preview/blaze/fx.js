// BORN FIRE — "flashy" layer, loaded after site.js on both pages. Decoration only (all aria-hidden);
// it never touches the hero player, the carousel or any text. Off with prefers-reduced-motion.
(function(){
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
  const el=(tag,cls)=>{const e=document.createElement(tag);e.className=cls;e.setAttribute('aria-hidden','true');return e;};

  // marquee band under the hero: words already on the page
  const WORDS=['Born Fire','Calling Choir','1st Live Album','Hip-Hop Gospel','Live in Seoul','2026'];
  const marq=el('div','fx-marq');
  const band=c=>{const b=el('div','fx-marq__band fx-marq__band--'+c),r=el('div','fx-marq__row');const s=WORDS.map(w=>`<span>${w}</span>`).join('');r.innerHTML=s+s+s+s;b.append(r);return b;};
  marq.append(band('a'),band('b'));
  const stage=document.getElementById('stage');stage.after(marq);

  // light sweep on the big section titles
  document.querySelectorAll('#tracks .display, .about .display, .credits .display').forEach(h=>h.classList.add('fx-shine'));

  // scroll progress line
  const bar=el('div','fx-bar');document.body.appendChild(bar);
  const prog=()=>{const m=document.documentElement.scrollHeight-innerHeight;bar.style.transform=`scaleX(${m>0?Math.min(1,scrollY/m):0})`;};
  addEventListener('scroll',prog,{passive:true});addEventListener('resize',prog);prog();

  if(RM)return;
  document.body.appendChild(el('div','fx-grain'));

  // cursor glow + photo tilt (mouse only)
  if(FINE){
    const g=el('div','fx-glow');document.body.appendChild(g);
    let x=0,y=0,raf=0;
    addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;g.classList.add('on');if(!raf)raf=requestAnimationFrame(()=>{raf=0;g.style.transform=`translate(${x}px,${y}px)`;});},{passive:true});
    document.addEventListener('mouseleave',()=>g.classList.remove('on'));
    const img=document.querySelector('.about__img');
    if(img){img.addEventListener('mousemove',e=>{const r=img.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
      img.style.setProperty('--ry',(px*8).toFixed(2)+'deg');img.style.setProperty('--rx',(-py*8).toFixed(2)+'deg');});
      img.addEventListener('mouseleave',()=>{img.style.setProperty('--ry','0deg');img.style.setProperty('--rx','0deg');});}
  }

  // rising embers (canvas), only drawn while their section is on screen
  function embers(host,density){
    const cv=el('canvas','fx-embers');host.prepend(cv);
    const ctx=cv.getContext('2d');let W=0,H=0,DPR=1,P=[],on=false,raf=0;
    const spawn=(p,init)=>{p.x=Math.random()*W;p.y=init?Math.random()*H:H+10;p.r=.6+Math.random()*2.2;p.vy=.25+Math.random()*.9;p.vx=(Math.random()-.5)*.3;
      p.ph=Math.random()*6.28;p.life=0;p.max=.5+Math.random()*.5;p.h=18+Math.random()*28;return p;};
    const size=()=>{DPR=Math.min(2,devicePixelRatio||1);W=host.clientWidth;H=host.clientHeight;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
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
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(size,150);});size();
  }
  embers(stage,FINE?16000:12000);
  const outro=document.getElementById('follow');if(outro)embers(outro,9000);
})();
