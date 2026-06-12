/* =================================================================
   PRELOADER — animated name
   ================================================================= */
(function(){
  const name="ANVAY";
  const el=document.getElementById('loaderName');
  [...name].forEach((ch,i)=>{
    const s=document.createElement('span');
    s.textContent=ch;
    s.style.animationDelay=(i*0.06)+'s';
    el.appendChild(s);
  });
  window.addEventListener('load',()=>{
    setTimeout(()=>document.getElementById('loader').classList.add('done'),1700);
  });
  // fallback
  setTimeout(()=>document.getElementById('loader').classList.add('done'),2600);
})();

/* =================================================================
   CUSTOM CURSOR + magnetic + hover states
   ================================================================= */
(function(){
  if(window.matchMedia('(pointer:coarse)').matches) return;
  const dot=document.getElementById('cDot'),ring=document.getElementById('cRing');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';});
  (function loop(){rx+=(mx-rx)*0.18;ry+=(my-ry)*0.18;
    ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();

  // hover targets
  const hovers='a,button,.work-card,.svc,.cat,.chip,.stat,[data-magnetic],input,textarea,select';
  document.querySelectorAll(hovers).forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      if(el.matches('input,textarea,select')) ring.classList.add('text');
      else ring.classList.add('hover');
    });
    el.addEventListener('mouseleave',()=>ring.classList.remove('hover','text'));
  });

  // magnetic buttons
  document.querySelectorAll('[data-magnetic]').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2;
      const y=e.clientY-r.top-r.height/2;
      btn.style.transform=`translate(${x*0.3}px,${y*0.4}px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='translate(0,0)');
  });
})();

/* =================================================================
   NEURAL NETWORK CANVAS — reacts to mouse
   ================================================================= */
(function(){
  const c=document.getElementById('neural'),x=c.getContext('2d');
  let w,h,DPR=Math.min(devicePixelRatio||1,2);
  let pts=[],cx,cy,D,t0=performance.now();
  let curVis=1,targetVis=1,brainAmt=0;
  const coarse=window.matchMedia('(pointer:coarse)').matches;
  let formed=coarse;                          // touch devices form on load (no hover)
  const mouse={x:-9999,y:-9999,active:false};

  // Load and cache the brain image
  const brainImg = new Image();
  brainImg.src = 'updated brain.png';
  let brainImgLoaded = false;
  let darkTintedCanvas = null;
  let lightTintedCanvas = null;

  brainImg.onload = () => {
    brainImgLoaded = true;
    cacheTintedImages();
  };

  function cacheTintedImages() {
    if (!brainImgLoaded) return;
    darkTintedCanvas = tintImage(brainImg, 204, 255, 0); // #CCFF00
    lightTintedCanvas = tintImage(brainImg, 90, 130, 0); // #5a8200
  }

  function tintImage(img, r, g, b) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    try {
      const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const brightness = (red + green + blue) / 3;
        if (brightness > 240) {
          data[i + 3] = 0;
        } else {
          const alpha = Math.max(0, 255 - brightness);
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = alpha;
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.error("Canvas image tinting failed:", e);
    }
    return tempCanvas;
  }

  // ---- Highly accurate anatomical lateral (side-view) human head/face/neck outline ----
  const HEAD_OUTLINE = [
    [0.10, 0.95], // Shoulder/back start
    [0.14, 0.85], [0.18, 0.72], [0.22, 0.62], // Neck back
    [0.16, 0.54], [0.12, 0.44], [0.14, 0.32], [0.20, 0.20], // Back of head
    [0.28, 0.12], [0.40, 0.08], [0.52, 0.08], [0.64, 0.12], // Top skull arch
    [0.72, 0.18], [0.76, 0.26], [0.76, 0.33], // Forehead
    [0.73, 0.36], // Nose bridge indent
    [0.82, 0.38], [0.82, 0.42], [0.74, 0.44], // Nose tip & bottom
    [0.78, 0.47], [0.74, 0.49], // Upper lip
    [0.72, 0.50], // Mouth center
    [0.76, 0.52], [0.72, 0.54], // Lower lip
    [0.75, 0.58], [0.72, 0.63], [0.66, 0.66], // Chin
    [0.56, 0.68], [0.46, 0.72], // Jawline
    [0.44, 0.80], [0.48, 0.95]  // Neck front / chest start
  ];
  function poly(arr){const p=new Path2D();arr.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();return p;}
  const headPath = poly(HEAD_OUTLINE);

  // Brain outline situated anatomically inside the skull
  const BRAIN_OUTLINE = [
    [0.26, 0.40], // Occipital base
    [0.28, 0.30], [0.34, 0.22], [0.42, 0.18], [0.52, 0.18], // Top cerebrum
    [0.60, 0.22], [0.65, 0.28], [0.66, 0.36], // Frontal cerebrum
    [0.64, 0.44], [0.58, 0.48], // Temporal lobe boundary
    [0.55, 0.52], [0.56, 0.58], [0.52, 0.62], [0.46, 0.62], // Cerebellum
    [0.44, 0.56], [0.42, 0.50], [0.34, 0.46]  // Brainstem top
  ];
  const brainPath = poly(BRAIN_OUTLINE);

  // Anatomical internal structural lines (sulci, fissures, skull thickness, spine)
  const SULCI = [
    // Spine columns
    [[0.32, 0.65], [0.32, 0.95]],
    [[0.34, 0.65], [0.34, 0.95]],
    // Face contours / skull inner line
    [[0.72, 0.28], [0.65, 0.38], [0.62, 0.48], [0.55, 0.58]],
    // Central sulcus
    [[0.44, 0.20], [0.42, 0.30], [0.44, 0.38]],
    // Lateral sulcus
    [[0.32, 0.38], [0.42, 0.39], [0.52, 0.36]],
    // Frontal grooves
    [[0.36, 0.24], [0.34, 0.32]],
    [[0.48, 0.24], [0.46, 0.32]],
    // Occipital grooves
    [[0.58, 0.26], [0.56, 0.34]],
    // Cerebellar stripes (Arbor Vitae)
    [[0.50, 0.54], [0.46, 0.57]],
    [[0.48, 0.52], [0.44, 0.55]]
  ];

  // Technical callouts with pointer lines mapping lateral head & spine anatomy
  const CALLOUTS = [
    { pt: [0.64, 0.12], text: "SYS.SENSORY // PARIETAL", align: "left", ox: 35, oy: -15 },
    { pt: [0.72, 0.20], text: "SYS.LOGIC // FRONTAL", align: "left", ox: 30, oy: -15 },
    { pt: [0.82, 0.38], text: "SYS.PERCEPTION", align: "left", ox: 25, oy: 0 },
    { pt: [0.14, 0.32], text: "SYS.VISION // OCCIPITAL", align: "right", ox: -30, oy: 0 },
    { pt: [0.18, 0.72], text: "SYS.TRANSMISSION // SPINE", align: "right", ox: -30, oy: 0 },
    { pt: [0.50, 0.74], text: "SYS.MOTOR // CEREBELLUM", align: "left", ox: 35, oy: 15 }
  ];

  // Internal circuit nodes redistributed to sit inside head/neck structure
  const NODES = [
    [0.48, 0.26], [0.44, 0.38], [0.28, 0.36], [0.44, 0.48], [0.34, 0.56],
    [0.33, 0.68], [0.33, 0.82], [0.64, 0.44], [0.60, 0.28], [0.36, 0.22]
  ];
  const EDGES = [
    [0, 1], [1, 2], [1, 3], [1, 4], [1, 9], // Cerebrum connections
    [4, 5], [5, 6], // Spinal cord down
    [1, 7], [0, 8], [7, 8], // Facial connection
    [2, 9], [9, 0] // Upper skull loop
  ];
  const probe=document.createElement('canvas').getContext('2d');

  // 3D rotation state variables
  let isDragging = false;
  let dragMoved = false;
  let startX = 0, startY = 0;
  let rotationX = 0, rotationY = 0;
  let targetRotationX = 0, targetRotationY = 0;

  function rotate3D(x, y, z, angleX, angleY) {
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    return [x1, y2, z2];
  }

  // Stars background (unaffected space particles)
  let stars = [];
  function initStars() {
    stars = [];
    const count = w < 700 ? 40 : 90;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.4, // larger radius for visibility (1.2px - 4.0px diameter)
        alpha: 0.35 + Math.random() * 0.40, // higher alpha (0.35 - 0.75) for clearly visible stars
        vx: -0.04 - Math.random() * 0.10, // uniform slow drift to the left (simulating space travel panning)
        vy: (Math.random() - 0.5) * 0.02, // extremely minor vertical float
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.003 + Math.random() * 0.008
      });
    }
  }

  function brainPoints(target){
    const raw=[];
    const step=0.012;
    // We want to generate dots inside the head, but make it denser inside the brain.
    for(let gx=0.05; gx<=0.95; gx+=step){
      for(let gy=0.05; gy<=0.98; gy+=step){
        const jx=gx+(Math.random()-.5)*step;
        const jy=gy+(Math.random()-.5)*step;
        const inHead = probe.isPointInPath(headPath, jx, jy);
        const inBrain = probe.isPointInPath(brainPath, jx, jy);
        
        if (inBrain) {
          const dist = Math.hypot(jx - 0.46, jy - 0.35);
          const bDepth = Math.sqrt(Math.max(0, 0.04 - dist * dist)) * 1.2;
          const sz = (Math.random() - 0.5) * bDepth;
          raw.push({sx:jx, sy:jy, sz:sz});
        } else if (inHead) {
          if (Math.random() < 0.35) {
            const dist = Math.hypot(jx - 0.45, jy - 0.55);
            const hDepth = Math.sqrt(Math.max(0, 0.09 - dist * dist)) * 1.2;
            const sz = (Math.random() - 0.5) * hDepth;
            raw.push({sx:jx, sy:jy, sz:sz});
          }
        }
      }
    }
    // Shuffle and slice
    for(let i=raw.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[raw[i],raw[j]]=[raw[j],raw[i]];}
    return raw.slice(0,target);
  }

  function size(){
    w=innerWidth;h=innerHeight;
    c.width=w*DPR;c.height=h*DPR;c.style.width=w+'px';c.style.height=h+'px';
    x.setTransform(DPR,0,0,DPR,0,0);
    cx = w * 0.5; cy = h * 0.48; D = Math.min(w, h) * 1.1;
    initStars();
    build();
  }

  function build(){
    const target=w<700?60:(w<1100?100:140);
    pts=brainPoints(target).map(p=>({
      sx:p.sx, sy:p.sy, sz:p.sz,
      x:Math.random()*w, y:Math.random()*h,           // scattered until summoned
      vx:(Math.random()-.5)*0.5, vy:(Math.random()-.5)*0.5,
      r:0.8+Math.random()*1.2,
      ph:Math.random()*Math.PI*2
    }));
  }

  addEventListener('mousedown', e => {
    if ((window.scrollY || 0) > h * 0.5) return;
    if (e.target.closest('a, button, input, textarea, select')) return;
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    e.preventDefault();
  });

  addEventListener('mousemove', e => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > 3) dragMoved = true;
      targetRotationY += dx * 0.008;
      targetRotationX += dy * 0.008;
      startX = e.clientX;
      startY = e.clientY;
    } else {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (!formed) {
        const dx = e.clientX - cx, dy = e.clientY - cy;
        if (dx * dx + dy * dy < (D * 0.55) * (D * 0.55)) formed = true;
      }
    }
  });

  addEventListener('mouseup', e => {
    isDragging = false;
    if (!dragMoved && (window.scrollY || 0) < h * 0.5) {
      for (const p of pts) {
        const dx = p.x - e.clientX, dy = p.y - e.clientY, d = Math.hypot(dx, dy);
        if (d < 220) {
          const f = (1 - d / 220) * 16;
          p.vx += dx / (d || 1) * f;
          p.vy += dy / (d || 1) * f;
        }
      }
    }
  });

  addEventListener('mouseout', () => {
    isDragging = false;
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function draw(now){
    const t=now-t0;
    x.clearRect(0,0,w,h);

    const sy=window.scrollY||0;
    const inHero = sy < h*0.45;
    // brain is "held" only while in the hero AND summoned; otherwise it releases
    // into the free, mouse-reactive network of connecting dots.
    const ambient = !inHero || !formed;

    // bright in hero, dimmed-but-alive once scrolled into the content
    const fade=Math.min(1, sy/(h*0.5));
    targetVis = 1 - fade*0.65;                   // 1.0 → 0.35
    curVis += (targetVis-curVis)*0.08;
    x.globalAlpha=curVis;

    const light=document.body.classList.contains('light');
    const baseRGB=light?'20,20,15':'236,234,227';
    const nearRGB=light?'90,130,0':'204,255,0';
    const baseNodeA=light?0.15:0.20, baseLineA=light?0.07:0.05;

    const breath=1+Math.sin(t*0.0006)*0.018;
    const sway=Math.sin(t*0.0004)*6;
    const MR=150, MR2=MR*MR;                      // mouse hot-radius (highlight)
    const AR=180, AR2=AR*AR;                      // attraction radius (ambient)
    const LD = ambient?65:28, LD2=LD*LD;         // long web vs tight brain wiring
    const brainHot = !ambient && curVis>0.5;      // scatter only when brain is focus

    // ── Starfield background (moving like space, cannot be interfered with, faded & light) ──
    x.save();
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;
      
      // Screen wrap
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;
      
      // Star twinkle
      const alpha = s.alpha * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase));
      x.fillStyle = `rgba(${baseRGB}, ${alpha})`;
      x.beginPath();
      x.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
      x.fill();
    });
        // angular, faceted brain — sharp edges + internal circuit wiring + nodes in 3D
    brainAmt += ((ambient?0:1)-brainAmt)*0.08;
    if(brainAmt>0.02){
      rotationX += (targetRotationX - rotationX) * 0.08;
      rotationY += (targetRotationY - rotationY) * 0.08;

      x.save();
      x.lineJoin='miter'; x.miterLimit=8; x.lineCap='butt';

      // Draw the updated brain background image
      const activeCanvas = light ? lightTintedCanvas : darkTintedCanvas;
      if (activeCanvas) {
        x.save();
        // Control image line opacity (subtle, matching neon aesthetics)
        x.globalAlpha = curVis * brainAmt * 0.22;
        
        const imgW = D * breath;
        const imgH = D * breath;
        
        // 3D parallax shift based on mouse dragging rotation
        const offsetX = rotationY * D * 0.08;
        const offsetY = -rotationX * D * 0.08;
        
        const imgX = cx + (0 - 0.45) * D * breath + sway + offsetX;
        const imgY = cy + (0 - 0.5) * D * breath + offsetY;
        
        x.drawImage(activeCanvas, imgX, imgY, imgW, imgH);
        x.restore();
      }

      // internal circuit pathways
      x.strokeStyle=`rgba(${nearRGB},${0.12*brainAmt})`; x.lineWidth=1;
      x.beginPath();
      for(const [a,b] of EDGES){
        const pA = NODES[a], pB = NODES[b];
        const [rxA, ryA, rzA] = rotate3D(pA[0] - 0.45, pA[1] - 0.5, 0, rotationX, rotationY);
        const perspA = 1.8 / (1.8 + rzA);
        const [rxB, ryB, rzB] = rotate3D(pB[0] - 0.45, pB[1] - 0.5, 0, rotationX, rotationY);
        const perspB = 1.8 / (1.8 + rzB);
        x.moveTo(cx + rxA * D * breath * perspA + sway, cy + ryA * D * breath * perspA);
        x.lineTo(cx + rxB * D * breath * perspB + sway, cy + ryB * D * breath * perspB);
      }
      x.stroke();

      // Outlines are now drawn via updated brain.png background image above

      // tech nodes (square synapses) at the circuit junctions in 3D
      const pulse=0.7+0.3*Math.sin(t*0.004);
      x.fillStyle=`rgba(${nearRGB},${0.18*brainAmt})`;
      for(const n of NODES){
        const [rx, ry, rz] = rotate3D(n[0] - 0.45, n[1] - 0.5, 0, rotationX, rotationY);
        const persp = 1.8 / (1.8 + rz);
        const px = cx + rx * D * breath * persp + sway;
        const py = cy + ry * D * breath * persp;
        x.fillRect(px-2,py-2,4,4);
      }

      // glowing core node in 3D
      x.fillStyle=`rgba(${nearRGB},${pulse*0.35*brainAmt})`;
      const core=NODES[1];
      const [crx, cry, crz] = rotate3D(core[0] - 0.45, core[1] - 0.5, 0, rotationX, rotationY);
      const cPersp = 1.8 / (1.8 + crz);
      x.fillRect(cx + crx * D * breath * cPersp + sway - 3.5, cy + cry * D * breath * cPersp - 3.5, 7, 7);

      // Technical labels/callouts with leader lines in 3D
      x.font = "bold 9px 'JetBrains Mono', monospace";
      x.lineWidth = 0.8;
      CALLOUTS.forEach(co => {
        const [rx, ry, rz] = rotate3D(co.pt[0] - 0.45, co.pt[1] - 0.5, 0, rotationX, rotationY);
        const persp = 1.8 / (1.8 + rz);
        const px = cx + rx * D * breath * persp + sway;
        const py = cy + ry * D * breath * persp;
        const tx = px + co.ox;
        const ty = py + co.oy;
        
        // Draw pointer line
        x.strokeStyle = `rgba(${nearRGB}, ${0.10 * brainAmt})`;
        x.beginPath();
        x.moveTo(px, py);
        x.lineTo(tx - (co.align === "left" ? 5 : -5), ty);
        x.lineTo(tx, ty);
        x.stroke();
        
        // Draw tiny circle at start
        x.beginPath();
        x.arc(px, py, 1.5, 0, 2 * Math.PI);
        x.fillStyle = `rgba(${nearRGB}, ${0.35 * brainAmt})`;
        x.fill();
        
        // Draw text label
        x.fillStyle = `rgba(${baseRGB}, ${0.25 * brainAmt})`;
        x.textAlign = co.align;
        x.textBaseline = "middle";
        x.fillText(co.text, tx + (co.align === "left" ? 4 : -4), ty);
      });

      x.restore();
    }

    const normalPath1 = new Path2D();
    const normalPath2 = new Path2D();
    const normalPath3 = new Path2D();
    const nearPath = new Path2D();
    let hasNormal1 = false, hasNormal2 = false, hasNormal3 = false, hasNear = false;

    for(let i=0;i<pts.length;i++){
      const p=pts[i];
      const mdx=mouse.x-p.x, mdy=mouse.y-p.y, md2=mdx*mdx+mdy*mdy;

      if(ambient){
        // ── previous interactive network: drift + cursor attraction ──
        p.vx+=(Math.random()-.5)*0.02; p.vy+=(Math.random()-.5)*0.02;
        if(mouse.active && md2<AR2){const dm=Math.sqrt(md2)||1; p.vx+=mdx/dm*0.06; p.vy+=mdy/dm*0.06;}
        p.vx*=0.985; p.vy*=0.985;
        const sp=Math.hypot(p.vx,p.vy); if(sp>2.2){p.vx*=2.2/sp;p.vy*=2.2/sp;}
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0){p.x=0;p.vx*=-1;} else if(p.x>w){p.x=w;p.vx*=-1;}
        if(p.y<0){p.y=0;p.vy*=-1;} else if(p.y>h){p.y=h;p.vy*=-1;}
      }else{
        // ── brain: spring to home, scatter away from cursor ──
        const [rx2, ry2, rz2] = rotate3D(p.sx - 0.45, p.sy - 0.5, p.sz, rotationX, rotationY);
        const persp = 1.8 / (1.8 + rz2);
        const hx = cx + rx2 * D * breath * persp + sway;
        const hy = cy + ry2 * D * breath * persp;
        p.vx+=(hx-p.x)*0.022; p.vy+=(hy-p.y)*0.022;
        if(brainHot && md2<MR2){const dm=Math.sqrt(md2)||1, f=(1-dm/MR)*3.4; p.vx-=mdx/dm*f; p.vy-=mdy/dm*f;}
        p.vx*=0.86; p.vy*=0.86;
        p.x+=p.vx; p.y+=p.vy;
      }

      const hot = mouse.active && md2<MR2 && (ambient || brainHot);
      const sh=0.6+0.4*Math.sin(t*0.002+p.ph);
      x.beginPath();x.arc(p.x,p.y,hot?p.r+1.6:p.r,0,6.2832);
      x.fillStyle=hot?`rgba(${nearRGB},0.95)`:`rgba(${baseRGB},${baseNodeA*sh})`;
      x.fill();

      for(let j=i+1;j<pts.length;j++){
        const q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d2=dx*dx+dy*dy;
        if(d2<LD2){
          const d=Math.sqrt(d2);
          const mNear=hot||(mouse.active&&(ambient||brainHot)&&((q.x-mouse.x)**2+(q.y-mouse.y)**2)<MR2);
          if(mNear){
            nearPath.moveTo(p.x,p.y);
            nearPath.lineTo(q.x,q.y);
            hasNear=true;
          }else{
            const ratio=d/LD;
            if(ratio<0.33){
              normalPath1.moveTo(p.x,p.y);
              normalPath1.lineTo(q.x,q.y);
              hasNormal1=true;
            }else if(ratio<0.66){
              normalPath2.moveTo(p.x,p.y);
              normalPath2.lineTo(q.x,q.y);
              hasNormal2=true;
            }else{
              normalPath3.moveTo(p.x,p.y);
              normalPath3.lineTo(q.x,q.y);
              hasNormal3=true;
            }
          }
        }
      }
    }

    if(hasNormal1){
      x.strokeStyle=`rgba(${baseRGB},${baseLineA*0.8})`;
      x.lineWidth=0.6;
      x.stroke(normalPath1);
    }
    if(hasNormal2){
      x.strokeStyle=`rgba(${baseRGB},${baseLineA*0.5})`;
      x.lineWidth=0.5;
      x.stroke(normalPath2);
    }
    if(hasNormal3){
      x.strokeStyle=`rgba(${baseRGB},${baseLineA*0.2})`;
      x.lineWidth=0.4;
      x.stroke(normalPath3);
    }
    if(hasNear){
      x.strokeStyle=`rgba(${nearRGB},0.35)`;
      x.lineWidth=1.0;
      x.stroke(nearPath);
    }
    x.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  size();requestAnimationFrame(draw);
  let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(size,180);});
})();

/* =================================================================
   SCROLL REVEAL
   ================================================================= */
(function(){
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();

/* =================================================================
   NAV scroll state + mobile menu
   ================================================================= */
(function(){
  const nav=document.getElementById('nav');
  addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
  const burger=document.getElementById('burger'),links=document.getElementById('navLinks');
  burger.addEventListener('click',()=>{burger.classList.toggle('open');links.classList.toggle('open');});
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    burger.classList.remove('open');links.classList.remove('open');}));
})();

/* =================================================================
   3D TILT + SPOTLIGHT on cards
   ================================================================= */
(function(){
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
      card.style.setProperty('--mx',(px*100)+'%');
      card.style.setProperty('--my',(py*100)+'%');
      const rotX=(0.5-py)*8, rotY=(px-0.5)*8;
      card.style.transform=`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
})();

/* =================================================================
   WORK FILTERS
   ================================================================= */
(function(){
  const btns=document.querySelectorAll('.filter');
  const cards=document.querySelectorAll('.work-card');
  btns.forEach(b=>b.addEventListener('click',()=>{
    btns.forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const f=b.dataset.filter;
    cards.forEach(c=>{
      const show=(f==='all'||c.dataset.cat===f);
      c.classList.toggle('hide',!show);
    });
  }));
})();

/* =================================================================
   HERO MARQUEE — duplicate for seamless loop
   ================================================================= */
(function(){
  const t=document.getElementById('marqueeTrack');
  t.innerHTML+=t.innerHTML;
})();

/* =================================================================
   CONTACT FORM -> mailto
   ================================================================= */
(function(){
  const btn=document.getElementById('sendBtn');
  const note=document.getElementById('formNote');
  
  // Set your deployed Render backend URL below (auto-detects local vs production)
  const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://anvay-portfolio-backend.onrender.com';

  btn.addEventListener('click',()=>{
    const n=document.getElementById('name').value.trim();
    const em=document.getElementById('email').value.trim();
    const ty=document.getElementById('type').value;
    const ms=document.getElementById('msg').value.trim();
    
    if(!n||!em||!ms){
      note.textContent='⚠ Please fill in your name, email and message.';
      note.style.color='#ff6b6b';
      return;
    }

    // Disable button to prevent double submission
    btn.disabled = true;
    btn.innerHTML = 'Sending enquiry...';
    note.textContent = '✓ Dispatching request to mailer...';
    note.style.color = 'var(--muted)';

    fetch(`${BACKEND_URL}/api/enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: n,
        email: em,
        type: ty,
        msg: ms
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.message || 'Server error'); });
      }
      return response.json();
    })
    .then(data => {
      note.textContent='✓ Enquiry sent successfully! I will reply within 24 hours.';
      note.style.color='var(--acid)';
      
      // Clear form inputs
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('msg').value = '';
    })
    .catch(err => {
      console.error('Submission error:', err);
      note.textContent = `⚠ Submission failed: ${err.message || 'Network error'}.`;
      note.style.color = '#ff6b6b';
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = 'Send enquiry <span class="arr">→</span>';
    });
  });
})();

/* =================================================================
   THEME TOGGLE (dark default ⇄ light)
   ================================================================= */
(function(){
  const btn=document.getElementById('themeToggle');
  // Persist when self-hosted; silently no-ops inside sandboxes that block storage.
  try{ if(localStorage.getItem('theme')==='light') document.body.classList.add('light'); }catch(e){}
  btn.addEventListener('click',()=>{
    const isLight=document.body.classList.toggle('light');
    try{ localStorage.setItem('theme',isLight?'light':'dark'); }catch(e){}
  });
})();