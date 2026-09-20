import {replaceBrandImages} from './book-mark.js';
const motionAllowed=()=>{
 try{return !matchMedia('(prefers-reduced-motion: reduce)').matches&&!JSON.parse(localStorage.getItem('pagebhasha-preferences-v1')||'{}').motion&&!navigator.connection?.saveData;}
 catch{return false;}
};
let leaving=false;
const reset=()=>{leaving=false;document.querySelector('.page-handoff')?.remove();document.documentElement.removeAttribute('aria-busy');};
window.addEventListener('pageshow',reset);
try{
 const arrival=Number(sessionStorage.getItem('pagebhasha-page-arrival'));
 sessionStorage.removeItem('pagebhasha-page-arrival');
 if(Date.now()-arrival<10000&&motionAllowed()){document.body.classList.add('page-arriving');setTimeout(()=>document.body.classList.remove('page-arriving'),600);}
}catch{}
document.addEventListener('click',event=>{
 const link=event.target.closest?.('a[href]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self')||!motionAllowed())return;
 const url=new URL(link.href,location.href);
 if(url.origin!==location.origin||url.pathname!=='/study'||location.pathname==='/study')return;
 event.preventDefault();if(leaving)return;leaving=true;
 const overlay=document.createElement('div');overlay.className='page-handoff';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
 overlay.innerHTML='<div class="page-handoff-symbols" aria-hidden="true">अ · அ · অ · అ</div><p>A little space to understand.</p>';
 document.body.append(overlay);document.documentElement.setAttribute('aria-busy','true');
 requestAnimationFrame(()=>overlay.classList.add('is-active'));
 setTimeout(()=>{try{sessionStorage.setItem('pagebhasha-page-arrival',String(Date.now()));}catch{}location.assign(url.href);},320);
 // Restore interaction if navigation fails.
 setTimeout(reset,5000);
});
import {languages,indianLanguages} from './language-data.js';
import {initI18n} from './i18n.js';
export {languages};
export const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{const old=sessionStorage.getItem('pagebhasha-notebook');if(old&&!localStorage.getItem('pagebhasha-notebook'))localStorage.setItem('pagebhasha-notebook',old);sessionStorage.removeItem('pagebhasha-notebook');}catch{}
export function notebook(){try{const entries=JSON.parse(localStorage.getItem('pagebhasha-notebook')||'[]');return Array.isArray(entries)?entries.filter(x=>x&&typeof x.title==='string'&&Array.isArray(x.explanation)).slice(0,10):[];}catch{return [];}}
replaceBrandImages();
const count=document.querySelector('#history-count');if(count)count.textContent=notebook().length;
// Each language owns its interaction and remains a useful keyboard/touch link.
document.querySelectorAll('.ribbon-inner > b').forEach(label=>{
 const language=languages.find(item=>item[2]===label.lang);if(!language)return;
 const link=document.createElement('a');link.className='ribbon-language';link.href='/study?language='+encodeURIComponent(language[0]);
 link.lang=label.lang;link.setAttribute('aria-label','Learn in '+language[0]);
 const native=document.createElement('strong');native.textContent=label.textContent;
 const caption=document.createElement('small');caption.textContent=language[0]+' ↗';caption.lang='en';
 link.append(native,caption);label.replaceWith(link);
});
document.querySelectorAll('.ribbon-inner > i').forEach(star=>star.setAttribute('aria-hidden','true'));
const landing=document.querySelector('#home-view');
if(landing){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const art=landing.querySelector('.hero-art');
 const fields=[art,landing.querySelector('.manifesto'),landing.querySelector('.language-section')].filter(Boolean);
 fields.forEach((section,index)=>{
  section.classList.add('has-script-drift');
  const decoration=document.createElement('div');decoration.className='script-drift';decoration.setAttribute('aria-hidden','true');
  const groups=[['অ','ಅ','മ'],['அ','अ','అ'],['અ','অ','ಅ']];
  groups[index].forEach((glyph,i)=>{const span=document.createElement('span');span.className='drift-glyph glyph-'+i;span.textContent=glyph;decoration.append(span);});
  section.prepend(decoration);
 });
 let pending=false;
 const clamp=value=>Math.max(0,Math.min(1,value));
 function updateMotion(){
  pending=false;
  const amount=reduced.matches?0:(innerWidth<640?.5:1);
  if(art){const rect=art.getBoundingClientRect();const progress=clamp((innerHeight*.8-rect.top)/(innerHeight*.8+rect.height*.45));const eased=progress*progress*(3-2*progress);
   art.style.setProperty('--story-rise',(-eased*26*amount)+'px');
   art.style.setProperty('--story-scale',1+eased*.035*amount);
   art.style.setProperty('--note-rise',(-eased*42*amount)+'px');
   art.style.setProperty('--tag-rise',(-eased*65*amount)+'px');
  }
  fields.forEach(section=>{const rect=section.getBoundingClientRect();const progress=clamp((innerHeight-rect.top)/(innerHeight+rect.height));section.style.setProperty('--drift-y',((.5-progress)*80*amount)+'px');});
 }
 function queueMotion(){if(!pending){pending=true;requestAnimationFrame(updateMotion);}}
 window.addEventListener('scroll',queueMotion,{passive:true});window.addEventListener('resize',queueMotion);reduced.addEventListener('change',queueMotion);updateMotion();
}
const grid=document.querySelector('#language-grid');if(grid){grid.innerHTML=indianLanguages.map(([name,native,lang])=>`<a class="language-choice" href="/study?language=${encodeURIComponent(name)}"><strong lang="${lang}">${native}</strong><span>${name}</span></a>`).join('');}
document.querySelectorAll('[data-sample]').forEach(button=>{if(!document.querySelector('#study-view'))button.addEventListener('click',()=>location.href='/study?sample=1');});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.step-card,.manifesto,.language-section,.cta-section').forEach(e=>observer.observe(e));
if(location.hash==='#study'&&!document.querySelector('#study-view'))location.replace('/study');
const list=document.querySelector('#saved-lessons');
if(list){const render=()=>{const entries=notebook();list.innerHTML=entries.length?entries.map(x=>`<a class="saved-card" href="/study?lesson=${encodeURIComponent(x.id)}"><span class="eyebrow">${x.sample?'CURATED SAMPLE':'YOUR LESSON'} · ${escape(x.style)}</span><h2>${escape(x.title)}</h2><p>${escape(x.summary)}</p><span class="saved-meta">${escape(x.language)} · ${escape(x.level)} <b>Open lesson ↗</b></span></a>`).join(''):'<div class="notebook-empty"><span>▤</span><h2>A home for your lightbulb moments.</h2><p>Your lessons will appear here. They stay on this browser and device until cleared. Uploaded pages are not stored.</p><a class="button primary" href="/study">Create your first lesson ↗</a></div>';document.querySelector('#clear-saved').disabled=!entries.length;};render();document.querySelector('#clear-saved').addEventListener('click',()=>{try{localStorage.removeItem('pagebhasha-notebook');render();if(count)count.textContent='0';}catch{document.querySelector('#notebook-message').textContent='Storage is unavailable. Clear this site’s browser data to remove saved notes.';}});}

await initI18n();
