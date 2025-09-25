const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W = canvas.width = 800;
let H = canvas.height = 600;

let ROUND = 20

let agents = [];
let running = false;
let animationFrame;
let recorder;
let recordedChunks = [];
let speedFactor = 1;
let winnerMessage = null;
let winnerTimeout;

// util
function rand(min,max){ return Math.random()*(max-min)+min; }
function distance(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

// Agent class
class Agent {
  constructor(spec) {
    this.setSpecies(spec);
    this.r = ROUND; // ROUND
    this.x = rand(this.r, W - this.r);
    this.y = rand(this.r, H - this.r);
    this.vx = rand(-1.5, 1.5);
    this.vy = rand(-1.5, 1.5);
  }

  setSpecies(spec) {
    this.specId = spec.id;
    this.specName = spec.name;
    this.color = spec.color || '#888';
    this.emoji = spec.emoji || '';
    this.image = spec.image || '';

    // reset gambar kalau ganti species
    this.imgObj = null;
    if (this.image) {
      this.imgObj = new Image();
      this.imgObj.src = this.image;
    }
  }


  update() {
    this.x += this.vx * speedFactor;
    this.y += this.vy * speedFactor;
    if (this.x - this.r < 0 || this.x + this.r > W) this.vx *= -1;
    if (this.y - this.r < 0 || this.y + this.r > H) this.vy *= -1;
  }

  draw(ctx) {
  ctx.save();
  ctx.translate(this.x, this.y);

  // bikin lingkaran clip
  ctx.beginPath();
  ctx.arc(0, 0, this.r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (this.image) {
    if (!this.imgObj) {
      this.imgObj = new Image();
      this.imgObj.src = this.image;
    }
    if (this.imgObj.complete) {
      const iw = this.imgObj.width;
      const ih = this.imgObj.height;
      if (iw && ih) {
        // hitung rasio gambar
        const scale = Math.max((this.r * 2) / iw, (this.r * 2) / ih);
        const sw = (this.r * 2) / scale;
        const sh = (this.r * 2) / scale;
        const sx = (iw - sw) / 2;
        const sy = (ih - sh) / 2;

        // crop & gambar biar cover
        ctx.drawImage(this.imgObj, sx, sy, sw, sh, -this.r, -this.r, this.r * 2, this.r * 2);
      }
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
    }
  } else {
    // fallback emoji
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.r, -this.r, this.r * 2, this.r * 2);
    if (this.emoji) {
      ctx.font = this.r + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(this.emoji, 0, 2);
    }
  }

  ctx.restore();
  }

}


// build agents
function rebuildWorld(){
  agents = [];
  speciesConfig.forEach(s=>{
    for(let i=0;i<s.count;i++){
      agents.push(new Agent(s));
    }
  });
  winnerMessage = null;
}

// interactions
function stepInteractions(){
  for(let i=agents.length-1;i>=0;i--){
    const a = agents[i];
    for(let j=i-1;j>=0;j--){
      const b = agents[j];
      const d = distance(a,b);
      if(d < a.r + b.r){
        const sa = speciesConfig.find(s=>s.id===a.specId);
        const sb = speciesConfig.find(s=>s.id===b.specId);
        const aCanEatB = sa.canAttackNames.includes(sb.name);
        const bCanEatA = sb.canAttackNames.includes(sa.name);

        if(aCanEatB && !bCanEatA){ b.setSpecies(sa); }
        if(bCanEatA && !aCanEatB){ a.setSpecies(sb); }
      }
    }
  }
    // tampilkan jumlah species
  ctx.save();
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0,0,0,0.7)";

  let line = 0;
  speciesConfig.forEach(s => {
    const count = agents.filter(a => a.specId === s.id).length;
    ctx.fillText(`${s.name}: ${count}`, 10, 10 + line * 20);
    line++;
  });

  ctx.restore();

}

// loop
function loop(){
  // isi background putih full
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, W, H);

  agents.forEach(a=>{ a.update(); a.draw(ctx); });
  stepInteractions();

  if(winnerMessage){
    ctx.save();
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(winnerMessage, W/2, H/2);
    ctx.restore();
  }

  if(running){
    const alive = {};
    agents.forEach(a=>{ alive[a.specName] = (alive[a.specName]||0)+1; });
    const aliveSpecies = Object.keys(alive);
    if(aliveSpecies.length===1 && !winnerMessage){
      winnerMessage = `Winner: ${aliveSpecies[0]}`;
      clearTimeout(winnerTimeout);
      winnerTimeout = setTimeout(()=> stopGame(true), 5000);
    }
    animationFrame = requestAnimationFrame(loop);
  }
}



// UI
document.getElementById('btnStart').onclick = ()=>{
  if(running) return;
  rebuildWorld();
  running = true;
  if(document.getElementById('chkRecord').checked) startRecording();
  loop();
};
document.getElementById('btnStop').onclick = ()=> stopGame(true);
document.getElementById('speedSlider').oninput = e=>{
  speedFactor = parseFloat(e.target.value);
};

function stopGame(download=false){
  running = false;
  cancelAnimationFrame(animationFrame);
  if(download && document.getElementById('chkRecord').checked) stopRecording();
}

// init
rebuildWorld();
