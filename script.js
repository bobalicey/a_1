"use strict";
const canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
const $ = id => document.getElementById(id);
const W = 960, H = 600, pivot = { x: 480, y: 105 };
let state = "ready", level = 1, score = 0, target = 650, remaining = 60;
let items = [], angle = 0, swingTime = 0, length = 34, hookState = "swing", cargo = null, last = null;
let popups = [];
function updateHUD() {
  $("level").textContent = level; $("score").textContent = score;
  $("target").textContent = target; $("time").textContent = Math.ceil(remaining) + "s";
  $("grab").disabled = state !== "playing" || hookState !== "swing";
}
function makeItems() {
  const layout = [ [150,260,"gold",30], [360,300,"gold",19], [700,265,"rock",28], [815,380,"gold",38], [505,415,"gold",34], [235,445,"rock",32], [640,510,"diamond",15], [105,545,"gold",23], [405,550,"gold",23], [790,540,"rock",24], [595,310,"diamond",14], [885,235,"gold",18] ];
  return layout.map(([x,y,type,r],i) => ({x:level%2 ? x : W-x,y,type,r,active:true, value:type === "diamond" ? 500 : type === "rock" ? 20 : Math.round(r*7), speed:type === "rock" ? 65 : type === "diamond" ? 225 : 230-r*3, phase:i}));
}
function startLevel() {
  remaining = 60; target = 650 + (level-1)*500; items = makeItems();
  hookState = "swing"; length = 34; angle = 0; swingTime = 0; cargo = null; popups = [];
  state = "playing"; $("overlay").hidden = true; updateHUD();
}
function fire() { if(state === "playing" && hookState === "swing") {hookState = "out"; updateHUD();} }
function finish() {
  state = score >= target ? "won" : "lost";
  $("badge").textContent = state === "won" ? "开采成功" : "时间到";
  $("title").textContent = state === "won" ? "好运，来自好眼力。" : "再试一次，黄金在等你。";
  $("message").textContent = `本关结束，累计 ${score} 金币，目标 ${target} 金币。`;
  $("start").textContent = state === "won" ? "下一关 →" : "重新挑战 →";
  $("announcement").textContent = $("message").textContent;
  $("overlay").hidden = false; updateHUD();
}
function tip() { return {x:pivot.x + Math.sin(angle)*length,y:pivot.y + Math.cos(angle)*length}; }
function update(dt) {
  if(state !== "playing") return;
  remaining = Math.max(0, remaining-dt);
  if(remaining === 0) {finish();return;}
  if(hookState === "swing") {swingTime += dt; angle = Math.sin(swingTime*1.65)*1.15;}
  else if(hookState === "out") {
    // Small movement steps prevent skipping a small diamond at low frame rates.
    const steps = Math.ceil(440*dt/5);
    for(let i=0;i<steps && hookState === "out";i++) {
      length += 440*dt/steps; const p = tip();
      const hit = items.find(o=>o.active && Math.hypot(o.x-p.x,o.y-p.y)<o.r+7);
      if(hit) {cargo=hit;hit.active=false;hookState="back";}
      else if(p.x<15 || p.x>W-15 || p.y>H-15) hookState="back";
    }
  } else {
    length -= (cargo ? cargo.speed : 420)*dt;
    if(length<=34) {
      length=34;
      if(cargo) {score+=cargo.value;popups.push({text:`+${cargo.value}`,life:1.5});$("announcement").textContent=`获得 ${cargo.value} 金币`;}
      cargo=null;hookState="swing";
      if(!items.some(o=>o.active)) {finish();return;}
    }
  }
  popups.forEach(p=>p.life-=dt);popups=popups.filter(p=>p.life>0);updateHUD();
}
function mineral(o,x=o.x,y=o.y) {
  ctx.save();ctx.translate(x,y);ctx.beginPath();
  if(o.type === "diamond") {
    ctx.moveTo(-o.r,-o.r/3);ctx.lineTo(-o.r/2,-o.r);ctx.lineTo(o.r/2,-o.r);ctx.lineTo(o.r,-o.r/3);ctx.lineTo(0,o.r);ctx.closePath();
  } else { for(let i=0;i<8;i++) {const a=i*Math.PI/4, r=o.r*(i%2?.9:1);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath(); }
  const g=ctx.createLinearGradient(-o.r,-o.r,o.r,o.r);
  g.addColorStop(0,o.type==="gold"?"#ffe387":o.type==="diamond"?"#ceffff":"#b2b0a4");
  g.addColorStop(1,o.type==="gold"?"#c47f20":o.type==="diamond"?"#269cae":"#565d57");
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=o.type==="gold"?"#a16415":o.type==="diamond"?"#e0ffff":"#454b43";ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-o.r*.5,-o.r*.3);ctx.lineTo(o.r*.3,-o.r*.5);ctx.strokeStyle="#ffffff70";ctx.stroke();ctx.restore();
}
function draw() {
  const earth=ctx.createLinearGradient(0,130,0,H);earth.addColorStop(0,"#694c32");earth.addColorStop(1,"#30291f");ctx.fillStyle=earth;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#b9d4b3";ctx.fillRect(0,0,W,105);ctx.fillStyle="#608558";ctx.fillRect(0,100,W,12);ctx.fillStyle="#9e774a";ctx.fillRect(0,112,W,18);
  ctx.strokeStyle="#b48b5225";ctx.lineWidth=2;
  for(let i=0;i<45;i++){let x=(i*137)%W,y=155+(i*79)%430;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+15,y+4);ctx.stroke();}
  ctx.fillStyle="#455d40";for(let i=0;i<12;i++)ctx.fillRect(i*89,96,4,10);
  // Miner and winding machine.
  ctx.fillStyle="#d7a975";ctx.beginPath();ctx.arc(480,49,17,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#edbb45";ctx.fillRect(459,31,42,10);ctx.beginPath();ctx.arc(480,33,17,Math.PI,0);ctx.fill();
  ctx.fillStyle="#3a655d";ctx.fillRect(462,65,36,30);ctx.fillStyle="#dbb584";ctx.fillRect(446,72,16,9);ctx.fillRect(498,72,16,9);
  ctx.fillStyle="#47362a";ctx.fillRect(450,93,60,12);ctx.fillStyle="#c09961";ctx.beginPath();ctx.arc(480,99,12,0,Math.PI*2);ctx.fill();
  items.filter(o=>o.active).forEach(o=>mineral(o));
  const p=tip();ctx.strokeStyle="#e4c697";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pivot.x,pivot.y);ctx.lineTo(p.x,p.y);ctx.stroke();
  if(cargo) mineral(cargo,p.x,p.y+cargo.r*.5);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-angle);ctx.strokeStyle="#d7dcd3";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-13,-4);ctx.lineTo(-10,10);ctx.lineTo(-3,15);ctx.moveTo(13,-4);ctx.lineTo(10,10);ctx.lineTo(3,15);ctx.stroke();ctx.restore();
  ctx.textAlign="center";ctx.font="bold 26px system-ui";ctx.fillStyle="#ffe49a";popups.forEach(p=>{ctx.globalAlpha=Math.min(1,p.life);ctx.fillText(p.text,480,150-(1.5-p.life)*35);});ctx.globalAlpha=1;
}
$("start").addEventListener("click",()=>{if(state === "won")level++;else{level=1;score=0;}startLevel();});
$("restart").addEventListener("click",()=>{level=1;score=0;startLevel();});
$("grab").addEventListener("click",fire);canvas.addEventListener("pointerdown",fire);
document.addEventListener("keydown",e=>{if(["Space","ArrowDown"].includes(e.code) && !["BUTTON","INPUT","TEXTAREA"].includes(e.target.tagName)){e.preventDefault();if(!e.repeat)fire();}});
// Pause elapsed game time when the tab is hidden.
document.addEventListener("visibilitychange",()=>{last=null;});
function frame(now){const dt=last===null?0:Math.min((now-last)/1000,.1);last=now;if(!document.hidden)update(dt);draw();requestAnimationFrame(frame);}
items=makeItems();updateHUD();requestAnimationFrame(frame);
