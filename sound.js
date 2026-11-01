const FlightSound=(()=>{
 let audio,master,engineGain,rcsGain,rumbleGain,failed=false,ready=false;
 let muted=false,volume=.35,tail=0,lastContact=-Infinity,trackedShip=null;
 const voices=new Set();
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
   audio=new Context();master=audio.createGain();master.gain.value=0;
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
  ready=false;tail=0;
  if(!audio||failed)return;
  for(const source of voices){try{source.stop();}catch(error){}}voices.clear();
  for(const gain of [master,engineGain,rumbleGain,rcsGain]){gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setValueAtTime(0,audio.currentTime);}
 }
 function effect(impact=false,strength=1){
  if(!audio||failed||!ready||muted||document.hidden||!document.hasFocus()||audio.state!=='running')return;
  const now=audio.currentTime,duration=impact?.32:.22,level=impact?.12+.18*strength:.12*strength;
  tail=Math.max(tail,now+duration);
  const source=noise(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  source.loop=false;filter.type=impact?'lowpass':'bandpass';filter.frequency.value=impact?550+strength*900:1500;filter.Q.value=impact?.7:2;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(level,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  source.connect(filter);filter.connect(gain);gain.connect(master);
  voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(now);source.stop(now+duration);
  const frequencies=impact?[90,170]:[340,790,1270];
  for(const frequency of frequencies){
   const tone=audio.createOscillator(),envelope=audio.createGain();tone.type='sine';tone.frequency.setValueAtTime(frequency,now);tone.frequency.exponentialRampToValueAtTime(frequency*(impact?.45:.9),now+duration);
   envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level*.4/frequencies.length,now+.003);envelope.gain.exponentialRampToValueAtTime(.0001,now+duration);
   tone.connect(envelope);envelope.connect(master);voices.add(tone);tone.onended=()=>{voices.delete(tone);tone.disconnect();envelope.disconnect();};tone.start(now);tone.stop(now+duration);
  }
 }
 function latchClick(time,strength,pitch=1){
  const source=noise(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  source.loop=false;filter.type='bandpass';filter.frequency.setValueAtTime(1500*pitch,time);
  filter.frequency.exponentialRampToValueAtTime(750*pitch,time+.025);filter.Q.value=1.4;
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(.11*strength,time+.002);gain.gain.exponentialRampToValueAtTime(.0001,time+.03);
  source.connect(filter);filter.connect(gain);gain.connect(master);
  voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};
  source.start(time);source.stop(time+.04);
 }
 function gearStart(deploying=true){
  if(!audio||failed||!ready||muted||document.hidden||!document.hasFocus()||audio.state!=='running')return;
  const now=audio.currentTime,duration=1.7;
  tail=Math.max(tail,now+duration+.1);
  latchClick(now,deploying?1:.8,deploying?1:1.18);
  latchClick(now+.07,deploying?.75:.6,deploying?.82:.95);
  const motor=audio.createOscillator(),motorGain=audio.createGain(),motorFilter=audio.createBiquadFilter();
  motor.type='sawtooth';motor.frequency.setValueAtTime(deploying?54:71,now+.09);
  motor.frequency.linearRampToValueAtTime(deploying?49:66,now+duration);
  motorFilter.type='lowpass';motorFilter.frequency.value=340;motorFilter.Q.value=.8;
  motorGain.gain.setValueAtTime(0,now+.09);
  motorGain.gain.linearRampToValueAtTime(deploying?.055:.042,now+.17);
  motorGain.gain.setValueAtTime(deploying?.055:.042,now+duration-.12);
  motorGain.gain.linearRampToValueAtTime(0,now+duration);
  motor.connect(motorFilter);motorFilter.connect(motorGain);motorGain.connect(master);
  voices.add(motor);motor.onended=()=>{voices.delete(motor);motor.disconnect();motorFilter.disconnect();motorGain.disconnect();};
  motor.start(now+.09);motor.stop(now+duration+.01);
  const texture=noise(),textureFilter=audio.createBiquadFilter(),textureGain=audio.createGain();
  texture.loop=false;textureFilter.type='bandpass';textureFilter.frequency.value=deploying?260:330;textureFilter.Q.value=.9;
  textureGain.gain.setValueAtTime(0,now+.09);
  textureGain.gain.linearRampToValueAtTime(deploying?.018:.014,now+.2);
  textureGain.gain.setValueAtTime(deploying?.018:.014,now+duration-.12);
  textureGain.gain.linearRampToValueAtTime(0,now+duration);
  texture.connect(textureFilter);textureFilter.connect(textureGain);textureGain.connect(master);
  voices.add(texture);texture.onended=()=>{voices.delete(texture);texture.disconnect();textureFilter.disconnect();textureGain.disconnect();};
  texture.start(now+.09);texture.stop(now+duration+.01);
 }
 function gearLock(strength=1,deploying=true){
  if(!audio||failed||!ready||muted||document.hidden||!document.hasFocus()||audio.state!=='running')return;
  const now=audio.currentTime,s=Math.max(.4,Math.min(1.6,strength));
  tail=Math.max(tail,now+.16);
  const knock=audio.createOscillator(),knockGain=audio.createGain();
  knock.type='sine';knock.frequency.setValueAtTime(deploying?105:125,now);
  knock.frequency.exponentialRampToValueAtTime(deploying?48:58,now+.055);
  knockGain.gain.setValueAtTime(0,now);knockGain.gain.linearRampToValueAtTime(.26*s,now+.003);knockGain.gain.exponentialRampToValueAtTime(.0001,now+.07);
  knock.connect(knockGain);knockGain.connect(master);
  voices.add(knock);knock.onended=()=>{voices.delete(knock);knock.disconnect();knockGain.disconnect();};
  knock.start(now);knock.stop(now+.09);
  const body=noise(),bodyFilter=audio.createBiquadFilter(),bodyGain=audio.createGain();
  body.loop=false;bodyFilter.type='lowpass';bodyFilter.frequency.value=240;
  bodyGain.gain.setValueAtTime(.10*s,now);bodyGain.gain.exponentialRampToValueAtTime(.0001,now+.038);
  body.connect(bodyFilter);bodyFilter.connect(bodyGain);bodyGain.connect(master);
  voices.add(body);body.onended=()=>{voices.delete(body);body.disconnect();bodyFilter.disconnect();bodyGain.disconnect();};
  body.start(now);body.stop(now+.05);
  const followTime=now+.042,follow=audio.createOscillator(),followGain=audio.createGain();
  follow.type='sine';follow.frequency.setValueAtTime(deploying?72:88,followTime);
  follow.frequency.exponentialRampToValueAtTime(deploying?40:48,followTime+.038);
  followGain.gain.setValueAtTime(0,followTime);followGain.gain.linearRampToValueAtTime(.13*s,followTime+.002);followGain.gain.exponentialRampToValueAtTime(.0001,followTime+.048);
  follow.connect(followGain);followGain.connect(master);
  voices.add(follow);follow.onended=()=>{voices.delete(follow);follow.disconnect();followGain.disconnect();};
  follow.start(followTime);follow.stop(followTime+.07);
 }
 button.addEventListener('click',()=>{muted=!muted;button.textContent=muted?'SOUND: OFF':'SOUND: ON';button.setAttribute('aria-pressed',String(muted));if(muted)silence();else unlock();});
 slider.addEventListener('input',()=>{volume=Number(slider.value)/100;unlock();});
 addEventListener('pointerdown',unlock);
 addEventListener('keydown',event=>{if(!event.repeat)unlock();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){silence();if(audio&&!failed)audio.suspend().catch(()=>{});}});
 addEventListener('blur',silence);addEventListener('pagehide',silence);
 const originalUpdate=update;
 update=function(dt){
  const current=ship,playing=state==='play'&&current&&dt>0;
  if(current!==trackedShip){trackedShip=current;lastContact=-Infinity;}
  const before=playing?current.gear.progress:0;
  const target=playing?current.gear.target:0;
  originalUpdate(dt);
  if(!playing||ship!==current)return;
  const after=current.gear.progress;
  if(target===1&&before<.999&&after>=.999)gearLock(1.2,true);
  if(target===0&&before>.001&&after<=.001)gearLock(.9,false);
 };
 addEventListener('keydown',event=>{
  if(event.code!=='KeyG'||event.repeat||event.ctrlKey||event.metaKey||event.altKey||state!=='play'||!ship)return;
  const target=event.target;if(target&&(target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
  gearStart(ship.gear.target===1);
 });
 const originalDust=spawnDust;
 spawnDust=function(x,y,speed,side){
  originalDust(x,y,speed,side);
  if(state!=='play'||!ship)return;
  if(ship!==trackedShip){trackedShip=ship;lastContact=-Infinity;}
  if(missionTime-lastContact<.12)return;
  lastContact=missionTime;effect(true,Math.min(1,Math.max(0,speed)/8.5));
 };
 function tick(){
  if(audio&&!failed){
   const enabled=ready&&!muted&&!document.hidden&&document.hasFocus();
   const active=enabled&&typeof state!=='undefined'&&state==='play'&&typeof ship!=='undefined'&&ship;
   let main=0,rcs=0;
   if(active)for(const jet of ship.jets||[]){if(Math.hypot(jet.fx,jet.fy)<=0)continue;const strength=Math.max(0,Math.min(1,jet.strength||0));if(jet.name==='main')main=Math.max(main,strength);else rcs=Math.max(rcs,strength);}
   const now=audio.currentTime;
   master.gain.setTargetAtTime(enabled&&(active||now<tail)?volume:0,now,.025);
   engineGain.gain.setTargetAtTime(main*.28,now,main?.035:.07);
   rumbleGain.gain.setTargetAtTime(main*.09,now,.045);
   rcsGain.gain.setTargetAtTime(rcs*.065,now,rcs?.008:.025);
  }
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);return {silence};
})();