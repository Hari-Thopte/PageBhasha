import {indianLanguages as languages} from './language-data.js';
import {setSiteLanguage,translatePage,currentLanguage} from './i18n.js';
const key='pagebhasha-preferences-v1';
const $=s=>document.querySelector(s);
let saved=null;
try{saved=JSON.parse(localStorage.getItem(key));}catch{}
const dialog=document.createElement('dialog');
dialog.className='learning-preferences';
dialog.setAttribute('aria-labelledby','preferences-title');
dialog.innerHTML=`<form method="dialog"><div class="eyebrow">LEARN YOUR WAY</div><h2 id="preferences-title" tabindex="-1">A little more <em>you.</em></h2><p>Choose what makes studying comfortable. You can change this anytime.</p><label for="pref-language">Lesson explanation language</label><select id="pref-language"></select><label for="pref-style">Explanation style</label><select id="pref-style"><option>Simple</option><option>Exam notes</option><option>Detailed</option></select><label for="pref-input">Start with</label><select id="pref-input"><option value="upload">Photo or PDF</option><option value="text">Paste text · less upload data</option></select><label for="pref-size">Reading text size</label><select id="pref-size"><option value="standard">Standard</option><option value="large">Large</option><option value="extra">Extra large</option></select><label class="toggle-label"><input id="pref-readable" type="checkbox"> Reading-friendly font and spacing</label><label class="toggle-label"><input id="pref-contrast" type="checkbox"> High contrast</label><label class="toggle-label"><input id="pref-motion" type="checkbox"> Reduce decorative motion</label><p class="fine-print">Your language and reading preferences are saved in this browser for your next visit. You can change them anytime.</p><p id="pref-feedback" role="status"></p><div class="lesson-actions"><button class="button primary" id="pref-save" value="save">Save preferences</button><button class="button secondary" value="skip">Maybe later</button><button class="button text-button" type="button" id="pref-reset">Reset</button></div></form>`;
document.body.append(dialog);
languages.forEach(([name,native])=>{const option=new Option(native,name);option.dataset.native='true';$('#pref-language').add(option);});
dialog.querySelectorAll('option:not([value])').forEach(option=>option.value=option.textContent);
function apply(p,initial=false){
 if(!p||typeof p!=='object')return;
 document.body.classList.toggle('large-reading',p.size==='large'||p.large===true);
 document.body.classList.toggle('extra-reading',p.size==='extra');
 document.body.classList.toggle('readable-font',p.readable===true);
 document.body.classList.toggle('high-contrast',p.contrast===true);
 document.body.classList.toggle('calm-reading',p.motion===true);
 if(languages.some(x=>x[0]===p.language)&&!(initial&&new URLSearchParams(location.search).has('language')))$('#language').value=p.language;
 if(['Simple','Exam notes','Detailed'].includes(p.style))$('#style').value=p.style;
 if(initial&&!location.search&&p.input==='text')$('[data-input="text"]').click();
 if(!initial)$('#style').dispatchEvent(new Event('change'));
}
function fill(){
 $('#pref-language').value=$('#language')?.value||saved?.language||'English';
 $('#pref-style').value=$('#style').value;
 $('#pref-input').value=saved?.input==='text'?'text':'upload';
 $('#pref-size').value=saved?.size||(saved?.large?'large':'standard');
 $('#pref-readable').checked=saved?.readable===true;
 $('#pref-contrast').checked=saved?.contrast===true;
 $('#pref-motion').checked=saved?.motion===true;
}
const trigger=document.createElement('button');trigger.type='button';trigger.className='inline-link';trigger.id='preferences-trigger';trigger.textContent='Learning preferences';
trigger.addEventListener('click',()=>{fill();dialog.showModal();$('#preferences-title').focus();});$('.workspace-nav').append(trigger);
dialog.querySelector('form').addEventListener('submit',event=>{
 if(event.submitter?.value!=='save')return;
 saved={language:$('#pref-language').value,style:$('#pref-style').value,input:$('#pref-input').value,size:$('#pref-size').value,readable:$('#pref-readable').checked,contrast:$('#pref-contrast').checked,motion:$('#pref-motion').checked};
 apply(saved);
 try{localStorage.setItem(key,JSON.stringify(saved));}catch{event.preventDefault();$('#pref-feedback').textContent='Applied for now. This browser could not save preferences.';}
});
$('#pref-reset').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}saved=null;document.body.classList.remove('large-reading','extra-reading','readable-font','high-contrast','calm-reading');fill();$('#pref-feedback').textContent='Saved reading preferences cleared. Choose a language from the header anytime.';});
apply(saved,true);
let skipped=false;try{skipped=sessionStorage.getItem('pagebhasha-onboarding-skipped')==='1';}catch{}
if(!saved&&!skipped&&!location.search){fill();dialog.showModal();}
dialog.addEventListener('close',()=>{if(dialog.returnValue==='skip'){try{sessionStorage.setItem('pagebhasha-onboarding-skipped','1');}catch{}}});
