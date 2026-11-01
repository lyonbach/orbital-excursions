const FlightSound=(()=>{
 let audio,master,engineGain,rcsGain,rumbleGain,failed=false,ready=false;
 let muted=false,volume=.35;
 const panel=document.createElement('div');
 panel.style.cssText='position:fixed;right:12px;bottom:12px;z-index:1000;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#080e1ce8;border:1px solid #40516b;border-radius:8px;color:#dfe7ff;font:12px monospace';
 const button=document.createElement('button');button.type='button';button.textContent='SOUND: ON';button.setAttribute('aria-pressed','false');
 const label=document.createElement('label');label.textContent='Volume ';
 const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='35';slider.setAttribute('aria-label','Sound volume');slider.style.width='90px';
 label.append(slider);panel.append(button,label);document.body.append(panel);
 function noise(){
  const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;return source;
 }
 function init(){
  if(audio||failed)return;
  try{
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)throw new Error('Web Audio unavailable');
   audio=new Context();
   master=audio.createGain();master.gain.value=0;
   const compressor=audio.createDynamicsCompressor();compressor.threshold.value=-18;compressor.ratio.value=6;master.connect(compressor);compressor.connect(audio.destination);
   engineGain=audio.createGain();engineGain.gain.value=0;engineGain.connect(master);
   const exhaust=noise(),low=audio.createBiquadFilter();low.type='lowpass';low.frequency.value=450;low.Q.value=.65;exhaust.connect(low);low.connect(engineGain);exhaust.start();
   rumbleGain=audio.createGain();rumbleGain.gain.value=0;rumbleGain.connect(master);
   const rumble=audio.createOscillator();rumble.type='sine';rumble.frequency.value=38;rumble.connect(rumbleGain);rumble.start();
   const whine=audio.createOscillator(),whineGain=audio.createGain();whine.type='triangle';whine.frequency.value=110;whineGain.gain.value=.06;whine.connect(whineGain);whineGain.connect(engineGain);whine.start();
   rcsGain=audio.createGain();rcsGain.gain.value=0;rcsGain.connect(master);
   const gas=noise(),high=audio.createBiquadFilter();high.type='highpass';high.frequency.value=1800;gas.connect(high);high.connect(rcsGain);gas.start();
  }catch(error){failed=true;button.textContent='SOUND UNAVAILABLE';button.disabled=true;slider.disabled=true;if(audio)audio.close().catch(()=>{});}
 }
 function unlock(){
  if(document.hidden||muted||failed)return;init();
  if(audio)audio.resume().then(()=>{ready=audio.state==='running';}).catch(()=>{ready=false;});
 }
 function silence(){
  ready=false;
  if(!audio||failed)return;
  for(const gain of [master,engineGain,rumbleGain,rcsGain]){gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setValueAtTime(0,audio.currentTime);}
 }
 button.addEventListener('click',()=>{muted=!muted;button.textContent=muted?'SOUND: OFF':'SOUND: ON';button.setAttribute('aria-pressed',String(muted));if(muted)silence();else unlock();});
 slider.addEventListener('input',()=>{volume=Number(slider.value)/100;unlock();});
 addEventListener('pointerdown',unlock);
 addEventListener('keydown',event=>{if(!event.repeat)unlock();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();if(audio&&!failed)audio.suspend().catch(()=>{});}});
 addEventListener('blur',silence);
 addEventListener('pagehide',silence);
 function tick(){
  if(audio&&!failed){
   const active=ready&&!muted&&!document.hidden&&document.hasFocus()&&typeof state!=='undefined'&&state==='play'&&typeof ship!=='undefined'&&ship;
   let main=0,rcs=0;
   if(active)for(const jet of ship.jets||[]){if(Math.hypot(jet.fx,jet.fy)<=0)continue;const strength=Math.max(0,Math.min(1,jet.strength||0));if(jet.name==='main')main=Math.max(main,strength);else rcs=Math.max(rcs,strength);}
   const now=audio.currentTime;
   master.gain.setTargetAtTime(active?volume:0,now,.025);
   engineGain.gain.setTargetAtTime(main*.28,now,main?.035:.07);
   rumbleGain.gain.setTargetAtTime(main*.09,now,.045);
   rcsGain.gain.setTargetAtTime(rcs*.065,now,rcs?.008:.025);
  }
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
 return {silence};
})();
