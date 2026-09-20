// Original browser animation inspired by the supplied classroom/book video.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const seenKey = 'pagebhasha-intro-seen-v2';
let active = null;
function skipMotion(){try{return reduced.matches||JSON.parse(localStorage.getItem('pagebhasha-preferences-v1')||'{}')?.motion===true||navigator.connection?.saveData;}catch{return reduced.matches;}}
function hasSeenIntro(){try{const p=new URLSearchParams(location.search);if(p.has('intro')||p.has('replay'))return false;return localStorage.getItem(seenKey)==='1';}catch{return false;}}
function markIntroSeen(){try{localStorage.setItem(seenKey,'1');}catch{}}
function playIntro({force=false}={}){
 if(active||skipMotion()||(!force&&hasSeenIntro()))return false;
 const previous=document.activeElement,scene=document.createElement('dialog');scene.className='opening-scene';scene.setAttribute('aria-label','Welcome to PageBhasha');
 scene.innerHTML=`<button class="intro-skip" type="button" autofocus>Skip intro <span aria-hidden="true">↗</span></button><div class="intro-art" aria-hidden="true"><div class="intro-halo"></div><div class="intro-rays"></div><div class="intro-book"><div class="intro-book-shadow"></div><div class="intro-sheet intro-left"><span>THE WORLD AROUND US</span><b>Every page.<br>A possibility.</b><div class="intro-plant">✳</div><i></i><i></i><i></i><i></i></div><div class="intro-sheet intro-right"><span>IN YOUR LANGUAGE</span><b>हर पन्ने में<br>एक नई दुनिया।</b><div class="intro-figure">अ ↔ A</div><i></i><i></i><i></i><i></i></div><div class="intro-turn intro-turn-one"><span>हिन्दी · தமிழ்</span><i></i><i></i><i></i><b>अ</b></div><div class="intro-turn intro-turn-two"><span>తెలుగు · বাংলা</span><i></i><i></i><i></i><b>অ</b></div><div class="intro-cover"><span>PAGEBHASHA</span><b>अ</b><small>A WORLD OF IDEAS</small></div></div><div class="intro-letters"><span>हिन्दी</span><span>தமிழ்</span><span>తెలుగు</span><span>বাংলা</span><span>मराठी</span><span>ગુજરાતી</span><span>ಕನ್ನಡ</span><span>മലയാളം</span></div><div class="intro-wordmark"><span class="intro-emblem">अ</span><h1>Page<span>Bhasha</span><em>.</em></h1><p>A world of ideas. In your language.</p></div><p class="intro-caption">Understanding begins with a page.</p></div>`;
 const river=document.createElement('div');river.className='intro-river';river.setAttribute('aria-hidden','true');
 const scripts=['अ','அ','అ','অ','ಕ','મ','മ','ਪ','ଅ','ا','ᱚ','ꯑ'];
 for(let lane=0;lane<4;lane++){
  const stream=document.createElement('div');stream.className='river-stream';stream.style.setProperty('--lane',lane);
  for(let i=0;i<12;i++){const letter=document.createElement('span');letter.textContent=scripts[(i+lane*3)%scripts.length];letter.style.setProperty('--i',i);stream.append(letter);}
  river.append(stream);
 }
 scene.querySelector('.intro-art').prepend(river);
 document.body.append(scene);const beforeOverflow=document.body.style.overflow;let timer,closing=false;
 const teardown=()=>{if(active!==scene)return;clearTimeout(timer);active=null;reduced.removeEventListener('change',onReduced);if(scene.open)scene.close();scene.remove();document.body.style.overflow=beforeOverflow;if(previous instanceof HTMLElement&&previous!==document.body)previous.focus({preventScroll:true});};
 const finish=(immediate=false)=>{if(closing||active!==scene)return;closing=true;if(immediate){teardown();return;}scene.classList.add('is-leaving');setTimeout(teardown,420);};
 const onReduced=event=>{if(event.matches)finish(true);};
 scene.querySelector('.intro-skip').addEventListener('click',()=>finish(true));scene.addEventListener('cancel',event=>{event.preventDefault();finish(true);});
 try{scene.showModal();}catch{scene.remove();return false;}active=scene;document.body.style.overflow='hidden';if(!force)markIntroSeen();reduced.addEventListener('change',onReduced);timer=setTimeout(()=>finish(),5000);return true;
}
const replay=document.createElement('button');replay.className='intro-replay button secondary small';replay.type='button';replay.textContent='Replay opening ↗';replay.addEventListener('click',()=>{if(skipMotion()){replay.textContent='Motion is off in your preferences';return;}playIntro({force:true});});
document.querySelector('footer')?.append(replay);
requestAnimationFrame(()=>playIntro());
