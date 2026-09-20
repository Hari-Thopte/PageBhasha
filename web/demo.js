import {createLearningAnimation} from './book-mark.js';
import {translatePage} from './i18n.js';
let active=null;
export function startDemo(){
 if(active){active.focus();return;}
 const previous=document.activeElement,dialog=document.createElement('dialog');active=dialog;
 dialog.className='demo-dialog';dialog.setAttribute('aria-labelledby','demo-title');
 let step=0,sourceType='text',resultTab='understand';
 const titles=['Welcome to Learning Mode','Bring a page or a passage','Make it yours','Explain this','Explore your lesson','Ready for your own page?'];
 const descriptions=[
  'This guided example works without AI. Your own page and saved lessons stay untouched.',
  'Choose Upload a page for a PDF or photo, or Paste text for a paragraph. For a PDF, choose the page you want to study.',
  'Choose your language, class and explanation style. Exam notes creates a revision board; Simple gives a short explanation.',
  'When your page and settings are ready, click Explain this. A gentle learning animation and study quotes appear while your lesson is prepared. You can cancel while waiting.',
  'Read the explanation, switch to visual notes, or check your understanding. Live lessons also let you ask follow-up questions.',
  'Upload a page or paste a paragraph. Pick your language and choose Explain this. Your site language is remembered on this browser.'
 ];
 const passage='Green plants use sunlight to make food from carbon dioxide and water. Chlorophyll absorbs light energy. Oxygen is released during photosynthesis.';
 const result=()=>`<div class="demo-tabs" role="tablist" aria-label="Demo lesson sections"><button role="tab" data-result="understand" aria-selected="${resultTab==='understand'}">Understand</button><button role="tab" data-result="visual" aria-selected="${resultTab==='visual'}">Visual notes</button><button role="tab" data-result="practice" aria-selected="${resultTab==='practice'}">Quick practice</button></div><div role="tabpanel">${resultTab==='understand'?'<h3 class="demo-result-title">How plants make food</h3><p>Think of a leaf as a tiny kitchen. Sunlight provides energy; water and carbon dioxide are the ingredients. The plant makes food and releases oxygen.</p><p class="demo-notice">In a live lesson, View in source helps you check the supporting excerpt.</p>':resultTab==='visual'?'<h3 class="demo-result-title">Photosynthesis at a glance</h3><div class="demo-poster"><section><h3>Inputs</h3><p>Water + carbon dioxide + sunlight</p></section><section><h3>Outputs</h3><p>Food for the plant + oxygen</p></section></div>':'<fieldset class="quiz-question"><legend>What provides the energy for photosynthesis?</legend><label class="quiz-option"><input type="radio" name="demo-answer" value="water">Water</label><label class="quiz-option"><input type="radio" name="demo-answer" value="sunlight">Sunlight</label><p class="demo-feedback" role="status" hidden></p></fieldset>'}</div>`;
 function render(){
  let content='';
  if(step===0)content='<div class="demo-paper"><strong>One page. Your language.</strong><hr><hr><hr></div><p>Follow six short steps, then try your own page.</p>';
  if(step===1)content=`<div class="demo-tabs" role="tablist" aria-label="Demo source types"><button role="tab" data-source="text" aria-selected="${sourceType==='text'}">Paste text</button><button role="tab" data-source="photo" aria-selected="${sourceType==='photo'}">Photo</button><button role="tab" data-source="pdf" aria-selected="${sourceType==='pdf'}">PDF</button></div>${sourceType==='text'?'<label for="demo-passage">Example passage</label><textarea id="demo-passage" readonly>'+passage+'</textarea>':'<div class="demo-paper"><strong>Photosynthesis</strong><hr><hr><hr><p>'+(sourceType==='pdf'?'Example PDF · page 1':'Example textbook photo')+'</p></div><p>Choose a clear page with readable text. This is an illustration; no file is being uploaded.</p>'}`;
  if(step===2)content='<p><strong>Language</strong> → <span>Your preferred language</span></p><p><strong>Class</strong> → <span>Your study level</span></p><p><strong>Style</strong> → <span>Simple, Detailed or Exam notes</span></p><p>Keep English subject terms if you want to recognise them in your textbook.</p>';
  if(step===3)content='<div class="loading-mark demo-loading"></div><p>Reading your page and preparing an explanation…</p><p class="demo-notice">Demo preview only. No AI request is running.</p>';
  if(step===4)content=result();
  if(step===5)content='<div class="demo-paper"><strong>Your next lightbulb moment.</strong><hr><hr></div><p>You can reopen See Demo whenever you need a reminder.</p>';
  dialog.innerHTML=`<div class="demo-top"><p><span>GUIDED DEMO</span> · ${step+1} / 6</p><button type="button" class="demo-button" data-close>Close demo ×</button></div><div class="demo-progress" aria-hidden="true">${titles.map((_,i)=>`<span class="${i<=step?'done':''}"></span>`).join('')}</div><h2 id="demo-title" tabindex="-1">${titles[step]}</h2><p>${descriptions[step]}</p><div class="demo-preview">${content}</div><div class="demo-actions"><button type="button" class="button secondary small" data-back ${step===0?'disabled':''}>Back</button><button type="button" class="button primary small" data-next>${step===5?'Start my lesson':'Next step →'}</button></div>`;
  dialog.querySelector('.demo-loading')?.append(createLearningAnimation());
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.querySelector('[data-back]').onclick=()=>{step--;render();};
  dialog.querySelector('[data-next]').onclick=()=>{if(step===5){dialog.close();return;}step++;render();};
  dialog.querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>{sourceType=b.dataset.source;render();});
  dialog.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>{resultTab=b.dataset.result;render();});
  dialog.querySelectorAll('[name="demo-answer"]').forEach(r=>r.onchange=()=>{const feedback=dialog.querySelector('.demo-feedback');feedback.hidden=false;feedback.textContent=r.value==='sunlight'?'Correct! Sunlight provides the energy.':'Try again. Water is an ingredient; think about the energy source.';translatePage(dialog);});
  translatePage(dialog);if(dialog.open)dialog.querySelector('#demo-title').focus({preventScroll:true});
 }
 document.body.append(dialog);render();dialog.showModal();dialog.querySelector('#demo-title').focus();
 dialog.addEventListener('close',()=>{active=null;dialog.remove();previous?.focus({preventScroll:true});});
}
