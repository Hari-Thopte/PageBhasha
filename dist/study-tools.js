import {languages,escape} from './pages.js';
import {exactRange,pdfBoxes} from './learning-utils.js';
const $=s=>document.querySelector(s);
import {setSiteLanguage,t} from './i18n.js';
export function localize(language){
 /* Keep website interface in English; only explain textbook content in the selected language. */
}
let activeDialog=null;
function showEvidence(lesson,view,index){
 const evidence=lesson.evidence[index];if(!evidence)return;
 activeDialog?.close();activeDialog?.remove();
 const dialog=document.createElement('dialog');activeDialog=dialog;dialog.className='source-dialog';dialog.setAttribute('aria-labelledby','source-dialog-title');
 dialog.innerHTML='<button type="button" class="button secondary small">Close source</button><h2 id="source-dialog-title">Check the source</h2><p class="fine-print">This excerpt was selected by the tutor. Compare it with the original; a match confirms location, not that the explanation is correct.</p><div class="source-comparison"><div class="original-source"></div><aside><h3>Quoted evidence</h3><blockquote></blockquote><p class="evidence-meaning"></p><p class="location-status" role="status"></p></aside></div>';
 dialog.querySelector('blockquote').textContent=evidence.quote;dialog.querySelector('.evidence-meaning').textContent=evidence.explanation;
 const original=dialog.querySelector('.original-source'),status=dialog.querySelector('.location-status');
 if(view?.kind==='text'){
  const passage=document.createElement('p');passage.className='source-passage';const range=exactRange(view.text,evidence.quote);
  if(range){passage.append(view.text.slice(0,range[0]));const mark=document.createElement('mark');mark.textContent=view.text.slice(...range);passage.append(mark,view.text.slice(range[1]));status.textContent='Exact excerpt located in your pasted text.';}
  else{passage.textContent=view.text;status.textContent='Exact location unavailable: the excerpt is not a unique exact match.';}
  original.append(passage);
 }else if(view?.image){
  const page=document.createElement('div');page.className='evidence-page';const img=document.createElement('img');img.src=view.image;img.alt='Original textbook page'+(view.page?' '+view.page:'');page.append(img);original.append(page);
  const boxes=view.kind==='pdf'?pdfBoxes(view.words,evidence.quote):[];
  for(const box of boxes){const mark=document.createElement('span');mark.className='source-box';mark.setAttribute('aria-hidden','true');['left','top','width','height'].forEach((prop,i)=>mark.style[prop]=(box[i]*100)+'%');page.append(mark);}
  status.textContent=boxes.length?'Exact excerpt located in the PDF’s text layer. Check alignment against the page.':view.kind==='scan'?'Exact location unavailable for this scan. No reliable text coordinates are available.':'Exact location unavailable: no unique text-layer match. No highlight has been guessed.';
 }else{original.textContent='The original page is not stored in your notebook. Re-add it to check this quote visually.';status.textContent='Original source unavailable.';}
 document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();activeDialog=null;});dialog.showModal();
}
export function enhanceLesson(lesson,view){
 document.querySelectorAll('#lesson-body .evidence').forEach((node,i)=>{const b=document.createElement('button');b.type='button';b.className='inline-link source-link';b.textContent='View in source ↗';b.onclick=()=>showEvidence(lesson,view,i);node.append(b);});
 const steps=document.querySelectorAll('#lesson-body .lesson-section > ol > li');
 for(const link of lesson.source_links||[]){const node=steps[link.explanation_index];if(!node)continue;for(const index of link.evidence_indexes||[]){if(!lesson.evidence[index])continue;const b=document.createElement('button');b.className='inline-link source-link';b.type='button';b.textContent='Source '+(index+1)+' ↗';b.onclick=()=>showEvidence(lesson,view,index);node.append(b);}}
 $('#quiz-questions').onchange=event=>{const input=event.target;if(input.type!=='radio')return;const i=Number(input.name.slice(1)),q=lesson.quiz[i],right=Number(input.value)===q.answer,node=$('#feedback-'+i);node.hidden=false;node.className='quiz-feedback';node.setAttribute('role','status');node.textContent=(right?'✓ Correct. ':'↻ Try again. ')+q.explanation;};
 let seen=false;try{seen=localStorage.getItem('pagebhasha-tabs-seen')==='1';}catch{}
 if(!seen&&!$('#tab-tour')){
  const tip=document.createElement('div');tip.id='tab-tour';tip.className='tab-tour';tip.setAttribute('role','region');tip.setAttribute('aria-label','Study workspace tour');
  const tabNames=['understand','visual','doubts','practice'];const descriptions=['Understand: read the explanation and check its source.','Visual notes: revise with a compact board and source-supported process diagrams.','Ask a doubt: ask follow-up questions about your page.','Quick practice: choose an answer for immediate feedback.'];let step=0;
  tip.innerHTML='<p></p><button type="button" class="inline-link">Next tip</button><button type="button" class="inline-link">Dismiss tour</button>';
  const onTabChange=event=>{const next=tabNames.indexOf(event.detail?.name);if(next<0)return;step=next;render();};
  const finish=()=>{document.removeEventListener('pagebhasha:tabchange',onTabChange);document.querySelectorAll('.tour-target').forEach(n=>n.classList.remove('tour-target'));try{localStorage.setItem('pagebhasha-tabs-seen','1');}catch{}tip.remove();};
  const render=()=>{tip.querySelector('p').textContent=(step+1)+'/4 · '+descriptions[step];document.querySelectorAll('[data-tab]').forEach((n,i)=>n.classList.toggle('tour-target',i===step));tip.querySelector('button').textContent=step===3?'Got it':'Next tip';};
  tip.querySelector('button').onclick=()=>{if(step===3){finish();return;}document.querySelector(`[data-tab="${tabNames[step+1]}"]`)?.click();};tip.querySelectorAll('button')[1].onclick=finish;document.addEventListener('pagebhasha:tabchange',onTabChange);$('.lesson-tabs').after(tip);render();
 }
}
export function initStudyTools({toast,onInput,isBusy}){
 const button=document.createElement('button');button.type='button';button.className='button secondary small';button.textContent='Dictate passage';$('#text-input').append(button);
 const note=document.createElement('p');note.className='fine-print';note.textContent='Voice input uses your browser’s speech service, which may send audio to its provider. Check the transcript before generating.';$('#text-input').append(note);
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Recognition){button.disabled=true;note.textContent='Voice input is not supported in this browser. Paste or type a passage instead.';return;}
 let recognition=null;
 button.onclick=()=>{if(isBusy())return;if(recognition){recognition.stop();return;}const r=new Recognition();recognition=r;r.lang=languages.find(x=>x[0]===$('#language').value)?.[2]||'en';r.continuous=false;r.interimResults=false;button.textContent='Stop dictation';
 r.onresult=e=>{const addition=[...e.results].map(x=>x[0].transcript).join(' ');$('#source-text').value=($('#source-text').value+' '+addition).trim().slice(0,16000);onInput();};
 r.onerror=e=>toast(e.error==='not-allowed'?'Microphone permission was denied. You can still paste text.':'Voice input could not finish. Try again or type your passage.');
 r.onend=()=>{recognition=null;button.textContent='Dictate passage';};try{r.start();}catch{recognition=null;button.textContent='Dictate passage';toast('Voice input is unavailable right now.');}};
}
export async function exportPDF(lesson,toast){
 const b=$('#download-notes');b.disabled=true;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
 try{const response=await fetch('https://fmpe1czgw7.execute-api.ap-south-1.amazonaws.com/prod/notes-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lesson),signal:controller.signal});if(!response.ok)throw Error('PDF export could not finish. Please retry.');const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');link.href=url;link.download='PageBhasha-'+lesson.language+'-notes.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('PDF downloaded.');}catch(e){toast(e.name==='AbortError'?'PDF export timed out. Please retry.':e.message);}finally{clearTimeout(timer);b.disabled=false;}
}

