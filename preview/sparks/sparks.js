// Rising embers from the blaze preview (option A): opening screen + FOLLOW THE FIRE. Decoration only, off with reduced motion.
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
  function embers(host,density){
    if(!host)return;
    const cv=document.createElement('canvas');cv.className='fx-embers';cv.setAttribute('aria-hidden','true');host.prepend(cv);
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
  const st=document.createElement('style');st.textContent='.fx-embers{position:absolute;inset:0;z-index:1;pointer-events:none;width:100%;height:100%}';document.head.appendChild(st);
  embers(document.getElementById('stage'),FINE?16000:12000);
  embers(document.getElementById('follow'),9000);
})();
