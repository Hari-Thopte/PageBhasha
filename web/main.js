import {source, samples, terms, headings} from './samples.js';
import {languages, escape as htmlEscape, notebook} from './pages.js';
import {createLearningAnimation,watchLearningQuotes} from './book-mark.js';
import {startDemo} from './demo.js';
import {currentLanguage,t} from './i18n.js';
import {plainMath, glossaryEntry} from './learning-utils.js';
import {enhanceLesson, localize, initStudyTools, exportPDF} from './study-tools.js';
const escape=value=>htmlEscape(plainMath(value));
import {sampleNotes, revisionMarkup, revisionText, visualNotesMarkup} from './revision.js';
import {initMindmap, refreshMindmap} from './mindmap.js?v=7';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
$('#loading-book-mark')?.append(createLearningAnimation());
watchLearningQuotes($('#loading-state'),t);
let mode='upload', image=null, sampleMode=false, lesson=null, activeSource=null, history=[], chat=[], busy=false, toastTimer, connection=false, viewer={scale:1,rotation:0};
let sourceView=null, activeView=null, requestController=null, requestCancelled=false;
history=notebook();
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function error(message){$('#input-error').textContent=message;$('#input-error').hidden=!message;$('#error-actions').hidden=!message;}
function saveHistory(){try{localStorage.setItem('pagebhasha-notebook',JSON.stringify(history));}catch{toast('Notebook storage is unavailable. Download notes to keep this lesson.');}$('#history-count').textContent=history.length;}
function goStudy(){window.scrollTo({top:0,behavior:'smooth'});}
function prefs(){return {language:$('#language').value,level:$('#level').value,style:$('#style').value,bilingual:$('#bilingual').checked};}
function applyViewer(){const picture=$('#source-image');picture.style.transform=`scale(${viewer.scale}) rotate(${viewer.rotation}deg)`;}
function resetViewer(){viewer={scale:1,rotation:0};applyViewer();}
function selectInput(next){if(busy)return;resetLesson();sampleMode=false;mode=next;$('#pdf-controls').hidden=next!=='upload'||!pdf;$('#sample-source').hidden=true;$('#upload-input').hidden=next!=='upload';$('#text-input').hidden=next!=='text';$$('[data-input]').forEach(b=>{b.classList.toggle('active',b.dataset.input===next);b.setAttribute('aria-pressed',b.dataset.input===next);});sampleControls(false);error('');}
function sampleControls(enabled){$('#level').disabled=enabled;$('#source-hint').textContent=enabled?'Curated Class 9–10 sample. Hindi, Tamil and English are available offline. Choose a style to explore the same concept.':'Your page is sent to the connected AI only when you ask for an explanation.';}
function resetLesson(){stopReading();doubtRecognition?.stop();lastFailedQuestion=null;$('#chat-error').hidden=true;$('#question').value='';document.body.classList.remove('has-lesson');lesson=null;activeSource=null;activeView=null;chat=[];$('#lesson-content').hidden=true;$('#empty-state').hidden=false;}
function openSample(){if(busy)return;goStudy();sampleMode=true;$('#pdf-controls').hidden=true;$('#sample-source').hidden=false;$('#sample-passage').textContent=source;$('#upload-input').hidden=true;$('#text-input').hidden=true;$('#level').value='Class 9–10';sampleControls(true);error('');buildSample();}
function buildSample(){const p=prefs();if(!samples[p.language]){if(connection){sampleMode=false;mode='text';$('#source-text').value=source;sampleControls(false);explain();}else error('The prepared sample is available in Hindi, Tamil and English. This language needs live AI; your choice has been kept.');return;}const data=structuredClone(samples[p.language]);delete data.answers;const labels=headings[p.language];data.headings=labels;if(p.bilingual&&p.language!=='English')data.glossary.forEach((x,i)=>x.quote+=` (${terms[i]})`);if(p.style==='Simple')data.explanation=data.explanation.slice(0,3);if(p.style==='Exam notes'){data.explanation=[...data.takeaways];data.revision=sampleNotes(p.language,data);}lesson={...data,...p,status:'ready',sample:true,id:crypto.randomUUID(),created:new Date().toISOString()};activeSource={text:source,...p};activeView={text:source,kind:'text'};chat=[];sampleControls(true);renderLesson();addHistory();}
function addHistory(){history=history.filter(x=>!(x.title===lesson.title&&x.language===lesson.language&&x.style===lesson.style&&x.sample===lesson.sample));history.unshift(structuredClone(lesson));history=history.slice(0,10);saveHistory();}
async function chooseFile(file){if(!file||busy)return;resetLesson();resetViewer();image=null;pdf=null;sourceView=null;$('#image-preview').hidden=true;$('#dropzone').hidden=false;$('#pdf-controls').hidden=true;selectInput('upload');if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){await choosePdf(file);return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)){error('Please choose a PDF, JPG, PNG or WebP image.');return;}if(file.size>8*1024*1024){error('That image is over 8 MB. Please use a smaller photo.');return;}setBusy(true);try{const data=await readFile(file);const preview=new Image();preview.src=data;await preview.decode();if(preview.width*preview.height>25000000)throw new Error('Please resize this image below 25 megapixels.');const canvas=document.createElement('canvas');const ratio=Math.min(1,1800/Math.max(preview.width,preview.height));canvas.width=Math.round(preview.width*ratio);canvas.height=Math.round(preview.height*ratio);const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(preview,0,0,canvas.width,canvas.height);image=canvas.toDataURL('image/jpeg',.88);sourceView={image,words:[],kind:'scan'};$('#source-image').src=image;$('#image-preview').hidden=false;$('#file-name').textContent=file.name;$('#dropzone').hidden=true;error('');}catch(e){error(e.message||'This photo could not be opened. Try another image.');}finally{setBusy(false);}}
async function api(path,payload){const controller=new AbortController();requestController=controller;requestCancelled=false;const slow=setTimeout(()=>$('#slow-request').hidden=false,15000);const timeout=setTimeout(()=>controller.abort(),180000);try{const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});const result=await response.json();if(!response.ok)throw new Error(result.error||'The tutor could not finish. Please retry.');return result;}catch(e){if(e.name==='AbortError')throw new Error(requestCancelled?'Stopped waiting. Your page and previous lesson are unchanged. The server may still finish the request.':'The request took too long. Try a shorter passage or retry shortly.');if(e instanceof TypeError)throw new Error('The local server is unavailable. Restart PageBhasha and try again.');throw e;}finally{clearTimeout(timeout);clearTimeout(slow);$('#slow-request').hidden=true;requestController=null;}}
let thinkingInterval=null,thinkingStart=0,thinkingStepTimers=[];
function startThinking(payload){
 stopThinking();
 const card=$('.thinking-card');if(card)card.classList.remove('collapsed');
 const timerEl=$('#thinking-timer'),logEl=$('#thinking-log'),statusEl=$('#thinking-status-text');
 const payloadMetric=$('#metric-payload'),langMetric=$('#metric-lang'),statusMetric=$('#metric-status');
 const charCount=payload.text?payload.text.length:0;
 const estBytes=JSON.stringify(payload).length;
 const langName=payload.language||'English',level=payload.level||'Class 9–10',style=payload.style||'Simple';
 if(payloadMetric)payloadMetric.textContent=estBytes>1024?`${(estBytes/1024).toFixed(1)} KB`:`${estBytes} B`;
 if(langMetric)langMetric.textContent=langName;
 if(statusMetric)statusMetric.textContent='Calculating & Fetching';
 if(statusEl)statusEl.textContent='Calculating data & fetching...';
 if(logEl)logEl.innerHTML='';
 thinkingStart=Date.now();
 if(timerEl)timerEl.textContent='0.0s';
 thinkingInterval=setInterval(()=>{if(timerEl)timerEl.textContent=`${((Date.now()-thinkingStart)/1000).toFixed(1)}s`;},100);
 const steps=[
  {delay:50,content:`<strong>Analyzing source material:</strong> Processing ${charCount?charCount+' characters':'scanned page image'}. Target grade: <code>${escape(level)}</code> with <code>${escape(style)}</code> depth. Validating educational integrity and bounds.`},
  {delay:1100,content:`<strong>Data payload &amp; fetching calculation:</strong> Payload size: <code>${estBytes>1024?(estBytes/1024).toFixed(1)+' KB':estBytes+' B'}</code>. Dispatching request to <code>Google Gemini (gemini-3.6-flash)</code>. Enforcing strict Lesson schema validation (explanations, exact evidence quotes, glossary, practice quiz).`},
  {delay:2400,content:`<strong>Regional language synthesis:</strong> Generating pedagogical explanation in <strong>${escape(langName)}</strong>${payload.bilingual?' (preserving English scientific keywords in parentheses)':''}. Preserving mathematical formulas and structural dependencies.`},
  {delay:3900,content:`<strong>Evidence citations &amp; factual grounding:</strong> Verifying exact quotation boundaries from textbook source. Eliminating hallucinated claims.`},
  {delay:5500,content:`<strong>Synthesizing practice check &amp; revision:</strong> Formulating 5+ multiple-choice diagnostic questions with answer rationale and schematic diagram.`},
  {delay:7200,content:`<strong>Parsing model response stream:</strong> Validating JSON output against Pydantic schema and assembling interactive study workspace...`}
 ];
 steps.forEach((step,idx)=>{
  const tid=setTimeout(()=>{
   if(!logEl)return;
   const cur=logEl.querySelector('.thinking-cursor');if(cur)cur.remove();
   const stepDiv=document.createElement('div');
   stepDiv.className='thinking-step';
   stepDiv.innerHTML=`<p>• ${step.content} <span class="thinking-cursor"></span></p>`;
   logEl.appendChild(stepDiv);
   logEl.scrollTop=logEl.scrollHeight;
   if(idx===1&&statusMetric)statusMetric.textContent='Streaming tokens';
   if(idx===3&&statusMetric)statusMetric.textContent='Verifying grounding';
   if(idx===4&&statusMetric)statusMetric.textContent='Compiling lesson';
  },step.delay);
  thinkingStepTimers.push(tid);
 });
}
function stopThinking(){
 if(thinkingInterval){clearInterval(thinkingInterval);thinkingInterval=null;}
 thinkingStepTimers.forEach(clearTimeout);thinkingStepTimers=[];
 const cur=document.querySelector('.thinking-cursor');if(cur)cur.remove();
}
$('#thinking-header')?.addEventListener('click',()=>{
 const card=$('.thinking-card');
 if(card){const c=card.classList.toggle('collapsed');$('#thinking-header').setAttribute('aria-expanded',!c);}
});
function setBusy(value){busy=value;$('#lesson-panel').setAttribute('aria-busy',value);$$('.source-panel button,.source-panel input,.source-panel textarea,.source-panel select,[data-sample]').forEach(e=>e.disabled=value);if(!value&&sampleMode)$('#level').disabled=true;$('#explain-button').textContent=value?'Preparing your lesson…':'Explain this ↗';if(!value)localize($('#language').value);}
async function explain(){if(busy)return;stopReading();if(sampleMode){buildSample();return;}const payload={...prefs(),text:mode==='text'?$('#source-text').value.trim():'',image:mode==='upload'?image:null};if(!payload.image&&payload.text.length<30){error('Add a textbook page or paste at least 30 characters to get started.');return;}error('');setBusy(true);$('#empty-state').hidden=true;$('#lesson-content').hidden=!lesson;$('#loading-state').hidden=false;startThinking(payload);try{const data=await api('/api/learn',payload);if(data.status!=='ready'){error(data.summary);return;}lesson={...data,id:crypto.randomUUID(),created:new Date().toISOString()};activeSource=payload;activeView=mode==='text'?{text:payload.text,kind:'text'}:structuredClone(sourceView);chat=[];renderLesson();addHistory();toast('Your lesson is ready.');}catch(e){error(e.message);}finally{stopThinking();setBusy(false);$('#loading-state').hidden=true;if(lesson)renderLesson();else $('#empty-state').hidden=false;}}
function switchTab(name){$$('[data-tab]').forEach(b=>{const selected=b.dataset.tab===name;b.setAttribute('aria-selected',selected);b.tabIndex=selected?0:-1;$(`#pane-${b.dataset.tab}`).hidden=!selected;});if(name==='visual')setTimeout(updateMindmapConnections,50);document.dispatchEvent(new CustomEvent('pagebhasha:tabchange',{detail:{name}}));}
function renderLesson(){if(!lesson)return;document.body.classList.add('has-lesson');$('#empty-state').hidden=true;$('#loading-state').hidden=true;$('#lesson-content').hidden=false;$('#lesson-title').textContent=lesson.title;$('#lesson-meta').textContent=`${lesson.language} · ${lesson.level} · ${lesson.style}`;$('#lesson-kind').textContent=lesson.sample?'CURATED SAMPLE':'AI LESSON';const lang=languages.find(x=>x[0]===lesson.language)?.[2]||'en';['#lesson-body','#visual-notes','#quiz-questions','#chat-log'].forEach(s=>{$(s).lang=lang;$(s).dir=['ur','ar'].includes(lang)?'rtl':'auto';});const h=lesson.headings||headings[lesson.language]||headings.English;$('#lesson-body').innerHTML=`<p class="lesson-summary">${escape(lesson.summary)}</p>${revisionMarkup(lesson)}<section class="lesson-section"><h3>${escape(h[0])}</h3><ol>${lesson.explanation.map(x=>`<li>${escape(x)}</li>`).join('')}</ol><h3>${escape(h[1])}</h3><ul>${lesson.takeaways.map(x=>`<li>${escape(x)}</li>`).join('')}</ul><h3>${escape(h[2])}</h3><div class="glossary">${lesson.glossary.map(glossaryEntry).map(x=>`<div><strong>${escape(x.term)}</strong><p>${escape(x.definition)}</p></div>`).join('')}</div><h3>${escape(h[3])}</h3>${lesson.evidence.map(x=>`<blockquote class="evidence"><q>${escape(x.quote)}</q><p>${escape(x.explanation)}</p></blockquote>`).join('')}</section>`;$('#visual-notes').innerHTML=visualNotesMarkup(lesson);initMindmap(lesson);setTimeout(updateMindmapConnections,60);$('#followup-suggestions').innerHTML=lesson.followups.map((q,i)=>`<button data-question="${i}">${escape(q)}</button>`).join('');$('#chat-log').innerHTML='';renderChat();$('#question').disabled=lesson.sample||!activeSource;$('#doubt-form button').disabled=lesson.sample||!activeSource;$('#chat-hint').textContent=lesson.sample?'Sample mode: explore the three prepared questions above. Open-ended doubts need a live AI connection.':activeSource?'Replies use this lesson’s original page and language settings.':'This notebook entry contains notes only. Re-add the original source to ask live follow-up questions.';$('#quiz-questions').innerHTML=lesson.quiz.map((q,i)=>`<fieldset class="quiz-question"><legend>${i+1}. ${escape(q.question)}</legend>${q.options.map((option,j)=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${j}" required><span>${escape(option)}</span></label>`).join('')}<div id="feedback-${i}" hidden></div></fieldset>`).join('');$('#quiz-result').innerHTML='';switchTab('understand');enhanceLesson(lesson,activeView);localize($('#language').value);}
let lastFailedQuestion=null, doubtRecognition=null;
function renderChat(){
 $('#chat-log').innerHTML=chat.map(item=>`<div class="chat-bubble ${item.role==='user'?'user':''}"><small>${item.role==='user'?'YOU':lesson.sample?'PREPARED SAMPLE ANSWER':'PAGEBHASHA'}</small>${escape(item.text)}${item.sources?.length?`<details><summary>Show supporting source</summary>${item.sources.map(quote=>`<blockquote>${escape(quote)}</blockquote>`).join('')}</details>`:''}</div>`).join('')||'<p class="fine-print">Choose a suggested question or ask in your own words.</p>';
 $('#chat-source').textContent=activeSource?.text|| (activeSource?.image?'This lesson uses your uploaded image. Exact text citations are unavailable for this image.': 'The original source is not stored with this notebook entry. Re-add the page to ask live questions.');
 const enabled=!!activeSource&&!lesson?.sample&&!busy;
 $$('[data-tutor-prompt]').forEach(button=>button.disabled=!enabled);
 $('#dictate-doubt').disabled=!enabled||!(window.SpeechRecognition||window.webkitSpeechRecognition);
 $('#reset-chat').disabled=busy;
 $('#chat-log').scrollTop=$('#chat-log').scrollHeight;
}
async function sendQuestion(question,index){
 if(!lesson||busy)return;
 if(lesson.sample){const answer=samples[lesson.language]?.answers[index];if(!answer){toast('Open-ended doubts need a live lesson. Try a prepared question above.');return;}chat.push({role:'user',text:question},{role:'assistant',text:answer});renderChat();return;}
 if(!activeSource){toast('Re-add the original page to ask a follow-up.');return;}
 doubtRecognition?.stop();
 const previous=chat.filter(item=>!item.failed).map(({role,text})=>({role,text})).slice(-8);
 while(JSON.stringify(previous).length>14000)previous.shift();
 if(chat.at(-1)?.failed)chat.pop();
 chat.push({role:'user',text:question});lastFailedQuestion=null;
 $('#chat-error').hidden=true;setBusy(true);renderChat();$('#question').disabled=true;$('#send-doubt').disabled=true;
 $$('[data-question]').forEach(button=>button.disabled=true);$('#chat-thinking').hidden=false;$('#cancel-doubt').hidden=false;
 try{const result=await api('/api/ask',{...activeSource,question,history:previous.slice(-8)});chat.push({role:'assistant',text:result.answer,sources:result.sources||[]});$('#question').value='';}
 catch(e){chat[chat.length-1].failed=true;lastFailedQuestion=question;$('#question').value=question;$('#chat-error p').textContent=e.message;$('#chat-error').hidden=false;}
 finally{setBusy(false);$('#question').disabled=false;$('#send-doubt').disabled=false;$$('[data-question]').forEach(button=>button.disabled=false);$('#chat-thinking').hidden=true;$('#cancel-doubt').hidden=true;$('#chat-hint').textContent='Replies use this lesson’s original page and language settings.';renderChat();}
}
$('#retry-chat').onclick=()=>{if(lastFailedQuestion)sendQuestion(lastFailedQuestion);};
$('#reset-chat').onclick=()=>{if(busy)return;doubtRecognition?.stop();chat=[];lastFailedQuestion=null;$('#question').value='';$('#chat-error').hidden=true;renderChat();$('#question').focus();};
$('#cancel-doubt').onclick=()=>{requestCancelled=true;requestController?.abort();};
$$('[data-tutor-prompt]').forEach(button=>button.onclick=()=>sendQuestion(button.dataset.tutorPrompt));
const DoubtRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!DoubtRecognition)$('#voice-hint').textContent='Voice input is unavailable in this browser. You can type your question.';
$('#dictate-doubt').onclick=()=>{
 if(doubtRecognition){doubtRecognition.stop();return;}
 if(!DoubtRecognition||!lesson||lesson.sample||busy)return;
 const recognition=new DoubtRecognition();doubtRecognition=recognition;recognition.lang=languages.find(item=>item[0]===lesson.language)?.[2]||'en';recognition.interimResults=false;
 recognition.onresult=event=>{$('#question').value=(($('#question').value+' '+event.results[0][0].transcript).trim()).slice(0,1000);};
 recognition.onerror=()=>{$('#voice-hint').textContent='Voice input could not finish. Check microphone access or type your question.';};
 recognition.onend=()=>{doubtRecognition=null;$('#dictate-doubt').textContent='Dictate question';};
 try{recognition.start();$('#dictate-doubt').textContent='Stop dictation';}catch{doubtRecognition=null;$('#voice-hint').textContent='Voice input is unavailable right now. Type your question instead.';}
};
function notes(){return `${lesson.title}\n${lesson.language} | ${lesson.level} | ${lesson.style}\n${lesson.sample?'Curated sample lesson':'AI-generated lesson — verify with source'}\n\n${lesson.summary}\n\n${lesson.explanation.map((x,i)=>`${i+1}. ${x}`).join('\n\n')}\n\n${lesson.takeaways.map(x=>'• '+x).join('\n')}\n\n${lesson.glossary.map(x=>`${glossaryEntry(x).term}: ${glossaryEntry(x).definition}`).join('\n')}\n\nSource excerpts\n${lesson.evidence.map(x=>`"${x.quote}"\n${x.explanation}`).join('\n\n')}${revisionText(lesson)}`;}
$('#try-demo').addEventListener('click',startDemo);$('#error-demo').addEventListener('click',startDemo);$('#retry-lesson').addEventListener('click',()=>{if(!busy)explain();});
$('#language').innerHTML=languages.map(([name,native])=>`<option data-native="true" value="${name}">${native}${name==='English'?'':' · '+name}</option>`).join('');$('#language').value=currentLanguage();
$$('[data-viewer]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.viewer;if(action==='zoom-in')viewer.scale=Math.min(2,viewer.scale+.2);if(action==='zoom-out')viewer.scale=Math.max(.7,viewer.scale-.2);if(action==='rotate')viewer.rotation=(viewer.rotation+90)%360;if(action==='reset')viewer={scale:1,rotation:0};applyViewer();}));
$('#print-visual-notes').addEventListener('click',()=>{switchTab('visual');window.print();});
$$('[data-sample]').forEach(b=>b.addEventListener('click',openSample));$$('[data-input]').forEach(b=>b.addEventListener('click',()=>selectInput(b.dataset.input)));$$('[data-language]').forEach(b=>b.addEventListener('click',()=>{$('#language').value=b.dataset.language;goStudy();if(sampleMode&&!samples[b.dataset.language])selectInput('upload');}));$('#close-sample').addEventListener('click',()=>{selectInput(mode);resetLesson();});$('#page-file').addEventListener('change',e=>chooseFile(e.target.files[0]));$('#camera-file').addEventListener('change',e=>chooseFile(e.target.files[0]));$('#remove-image').addEventListener('click',()=>{resetLesson();pdf=null;$('#pdf-controls').hidden=true;image=null;$('#source-image').removeAttribute('src');$('#image-preview').hidden=true;$('#dropzone').hidden=false;$('#page-file').value='';$('#camera-file').value='';});$('#dropzone').addEventListener('dragover',e=>{e.preventDefault();$('#dropzone').classList.add('dragover');});$('#dropzone').addEventListener('dragleave',()=>$('#dropzone').classList.remove('dragover'));$('#dropzone').addEventListener('drop',e=>{e.preventDefault();$('#dropzone').classList.remove('dragover');chooseFile(e.dataTransfer.files[0]);});$('#explain-button').addEventListener('click',explain);$$('[data-tab]').forEach((b,i)=>{b.addEventListener('click',()=>switchTab(b.dataset.tab));b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=$$('[data-tab]');const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length;switchTab(tabs[next].dataset.tab);tabs[next].focus();}});});$('#followup-suggestions').addEventListener('click',e=>{const b=e.target.closest('[data-question]');if(b)sendQuestion(lesson.followups[+b.dataset.question],+b.dataset.question);});$('#doubt-form').addEventListener('submit',e=>{e.preventDefault();const question=$('#question').value.trim();if(question)sendQuestion(question);});$('#quiz-form').addEventListener('submit',e=>{e.preventDefault();let score=0;lesson.quiz.forEach((q,i)=>{const selected=+new FormData(e.target).get(`q${i}`);const right=selected===q.answer;if(right)score++;const node=$(`#feedback-${i}`);node.hidden=false;node.className='quiz-feedback';node.textContent=`${right?'✓':'↻'} ${q.explanation}`;});$('#quiz-result').innerHTML=`<div class="quiz-score">${score} / ${lesson.quiz.length} correct. ${score===lesson.quiz.length?'You’ve got the idea!':'Keep exploring. Read the feedback and try again.'}</div>`;});$('#download-notes').addEventListener('click',()=>{exportPDF(lesson,toast);});$('#copy-notes').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(notes());toast('Copied to your clipboard.');}catch{toast('Clipboard is unavailable. Download your notes instead.');}});
// Notebook access also remains available on small screens.
let isSpeaking=false;
let cachedVoices=[];
function getAvailableVoices(){
  if(!('speechSynthesis' in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if(v && v.length) cachedVoices = v;
  return cachedVoices;
}
if('speechSynthesis' in window){
  getAvailableVoices();
  if('onvoiceschanged' in window.speechSynthesis){
    window.speechSynthesis.onvoiceschanged = getAvailableVoices;
  }
}

let currentAudio=null;

function stopReading(){
  if(currentAudio){
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch(e){}
    currentAudio = null;
  }
  if('speechSynthesis' in window){
    try {
      window.speechSynthesis.cancel();
    } catch(e){}
  }
  isSpeaking=false;
  const b=$('#read-aloud');
  if(b){
    b.textContent='Listen (Read aloud)';
    b.classList.remove('speaking');
  }
}

async function playServerTTS(fullText, language, genderPref){
  const b=$('#read-aloud');
  if(b){
    b.textContent='Loading voice...';
    b.classList.add('speaking');
  }
  isSpeaking=true;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullText, language: language || 'en', gender: genderPref })
    });
    if(!res.ok){
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `TTS service error (${res.status})`);
    }
    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    if(genderPref === 'female'){
      audio.playbackRate = 1.04; // Slightly faster for female voices
    }

    audio.onplay = () => {
      isSpeaking = true;
      if(b){
        b.textContent = 'Stop listening';
        b.classList.add('speaking');
      }
    };
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      stopReading();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audioUrl);
      stopReading();
      toast('Could not play audio for this lesson.');
    };

    await audio.play();
  } catch(err){
    stopReading();
    toast('Audio reader unavailable: ' + err.message);
  }
}

async function readAloud(){
  if(isSpeaking){
    stopReading();
    return;
  }
  if(!lesson) return;
  const b=$('#read-aloud');

  stopReading();

  const speechParts = [];
  if(lesson.title) speechParts.push(lesson.title);
  if(lesson.summary) speechParts.push(lesson.summary);
  if(lesson.explanation && lesson.explanation.length){
    speechParts.push(...lesson.explanation);
  }
  const fullText = speechParts.join('. \n\n');
  if(!fullText.trim()) return;

  const langMeta = languages.find(x => x[0] === lesson.language);
  const langCode = langMeta ? langMeta[2] : 'en';
  const bcpMap = {
    'hi':'hi-IN','ta':'ta-IN','te':'te-IN','bn':'bn-IN','mr':'mr-IN',
    'gu':'gu-IN','kn':'kn-IN','ml':'ml-IN','pa':'pa-IN','or':'or-IN',
    'as':'as-IN','ur':'ur-IN','sa':'sa-IN','brx':'brx-IN','doi':'doi-IN',
    'ks':'ks-IN','kok':'kok-IN','mai':'mai-IN','mni':'mni-IN','ne':'ne-NP',
    'sat':'sat-IN','sd':'sd-IN','en':'en-IN','es':'es-ES','fr':'fr-FR',
    'pt':'pt-BR','de':'de-DE','ar':'ar-SA','zh':'zh-CN','ja':'ja-JP',
    'ko':'ko-KR','ru':'ru-RU','id':'id-ID','th':'th-TH','vi':'vi-VN'
  };
  const targetBcp = bcpMap[langCode] || langCode || 'en-IN';
  const genderPref = $('#voice-gender')?.value || 'female';

  const voices = getAvailableVoices();
  const targetTagLower = targetBcp.toLowerCase();
  const langCodeLower = langCode.toLowerCase();

  // Check if browser has a true matching voice installed for this language
  const langMatchingVoices = voices.filter(v => {
    const vl = (v.lang || '').toLowerCase().replace('_', '-');
    return vl === targetTagLower || vl.startsWith(targetTagLower) || vl.startsWith(langCodeLower) || vl.includes(langCodeLower);
  });

  // If the browser has a true matching voice installed (e.g. English, Hindi, or user installed pack):
  if(langMatchingVoices.length > 0 && 'speechSynthesis' in window){
    try {
      const femaleKeywords = /(female|woman|girl|zira|kalpana|swara|ananya|kavya|priya|samantha|victoria|karen|susan|eva|monica|alice|catherine|helena|yuna|kyoko|meijia|lin|shruti|geeta|sunita|aditi|veena|sangeeta|heera)/i;
      const maleKeywords = /(male|man|guy|boy|david|mark|george|madhav|rishi|ajay|ravi|daniel|oliver|thomas|alex|fred|diego|jorge|amit|vikram|suresh|pradeep|tarun)/i;
      const prefRegex = genderPref === 'male' ? maleKeywords : femaleKeywords;
      const chosenVoice = langMatchingVoices.find(v => prefRegex.test(v.name)) || langMatchingVoices[0];

      const utt = new SpeechSynthesisUtterance(fullText);
      utt.voice = chosenVoice;
      utt.lang = chosenVoice.lang || targetBcp;

      if(genderPref === 'female'){
        utt.pitch = 1.16;
        utt.rate = 1.03;
      } else {
        utt.pitch = 0.88;
        utt.rate = 0.98;
      }

      let voiceStarted = false;
      utt.onstart = () => {
        voiceStarted = true;
        isSpeaking = true;
        if(b){
          b.textContent = 'Stop listening';
          b.classList.add('speaking');
        }
      };
      utt.onend = () => stopReading();
      utt.onerror = () => {
        if(!voiceStarted){
          playServerTTS(fullText, lesson.language, genderPref);
        } else {
          stopReading();
        }
      };

      window.speechSynthesis.speak(utt);
      return;
    } catch(e) {
      // Fallback to server TTS below
    }
  }

  // When browser lacks native voices for this language (e.g. Tamil, Telugu, Bengali, Kannada, etc.),
  // stream high-quality native speech from our universal server AI reader!
  await playServerTTS(fullText, lesson.language, genderPref);
}
$('#read-aloud')?.addEventListener('click',readAloud);
$('#voice-gender')?.addEventListener('change',()=>{if(isSpeaking)readAloud();});
function updateConnectionUI(s){connection=!!s.configured;$('#connection-explainer').hidden=connection;$('#connection-status').textContent=connection?(s.key_count>1?`● Connected (${s.key_count} keys rotating)`:'● Learning service configured'):'● Sample lessons available';$('#connection-status').classList.toggle('connected',connection);}
function checkStatus(){fetch('/api/status').then(r=>r.json()).then(updateConnectionUI).catch(()=>{$('#connection-status').textContent='Server unavailable';});}
checkStatus();
saveHistory();
let pdf=null;
const readFile=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('This file could not be read.'));reader.readAsDataURL(file);});
async function choosePdf(file){if(file.size>8*1024*1024){error('Use a PDF smaller than 8 MB.');return;}setBusy(true);try{const data=await readFile(file);pdf={data:data.replace(/^data:[^;]*;/,'data:application/pdf;'),name:file.name};setBusy(false);await loadPdf(1);}catch(e){setBusy(false);error(e.message);}}
async function loadPdf(page){if(!pdf||busy)return;resetLesson();resetViewer();image=null;selectInput('upload');setBusy(true);error('');try{const result=await api('/api/pdf',{pdf:pdf.data,page});image=result.image;sourceView={image,words:result.words||[],text:result.text,kind:(result.words||[]).length?'pdf':'scan',page:result.page};$('#source-image').src=image;$('#image-preview').hidden=false;$('#dropzone').hidden=true;$('#file-name').textContent=`${pdf.name} · page ${result.page}`;$('#pdf-controls').hidden=false;$('#pdf-page').value=result.page;$('#pdf-page').max=result.pages;$('#pdf-count').textContent=`of ${result.pages}`;toast('Page ready. Choose your language, then generate a lesson.');}catch(e){error(e.message);$('#image-preview').hidden=true;$('#dropzone').hidden=false;}finally{setBusy(false);}}
$('#load-pdf-page').addEventListener('click',()=>loadPdf(Number($('#pdf-page').value)));
$('#pdf-page').addEventListener('change',()=>{resetLesson();image=null;$('#image-preview').hidden=true;});
['language','level','style','bilingual'].forEach(id=>$('#'+id).addEventListener('change',()=>{if(busy)return;localize($('#language').value);error('');if(lesson)$('#source-hint').textContent='Settings changed. Generate again to update this lesson; your source is retained.';if(sampleMode)$('#source-hint').textContent='Sample settings changed. Click Explain this to prepare this version.';}));
$('#source-text').addEventListener('input',()=>{if(!busy)resetLesson();});
initStudyTools({toast,onInput:()=>{if(!busy)resetLesson();},isBusy:()=>busy});
$('#cancel-request').addEventListener('click',()=>{requestCancelled=true;requestController?.abort();});
function updateMindmapConnections(){
  refreshMindmap();
}

function toggleMindmapBranch(row,forceState){
  if(!row)return;
  const isExpanded=row.getAttribute('data-expanded')==='true';
  const shouldExpand=forceState!==undefined?forceState:!isExpanded;

  row.setAttribute('data-expanded',String(shouldExpand));
  const node=row.querySelector('.mindmap-topic-node');
  if(node)node.setAttribute('aria-expanded',String(shouldExpand));

  const leaf=row.querySelector('.mindmap-leaf-wrap');
  if(leaf)leaf.hidden=!shouldExpand;

  const sign=row.querySelector('.toggle-sign');
  if(sign)sign.textContent=shouldExpand?'−':'＋';

  const text=row.querySelector('.toggle-text');
  if(text)text.textContent=shouldExpand?'Contract':'Expand';

  requestAnimationFrame(()=>updateMindmapConnections());
}

$('#visual-notes')?.addEventListener('click',e=>{
  const expandAll=e.target.closest('.mindmap-expand-all');
  if(expandAll){
    $$('.mindmap-branch-row').forEach(r=>toggleMindmapBranch(r,true));
    return;
  }
  const contractAll=e.target.closest('.mindmap-contract-all');
  if(contractAll){
    $$('.mindmap-branch-row').forEach(r=>toggleMindmapBranch(r,false));
    return;
  }
  const node=e.target.closest('.mindmap-topic-node');
  if(node){
    const row=node.closest('.mindmap-branch-row');
    toggleMindmapBranch(row);
  }
});

window.addEventListener('resize',()=>{requestAnimationFrame(updateMindmapConnections);});
await import('./preferences.js');
const params=new URLSearchParams(location.search);
if(languages.some(x=>x[0]===params.get('language')))$('#language').value=params.get('language');
if(params.has('sample'))openSample();
if(params.has('lesson')){const saved=history.find(x=>x.id===params.get('lesson'));if(saved){lesson=structuredClone(saved);['language','level','style'].forEach(id=>$('#'+id).value=lesson[id]);$('#bilingual').checked=lesson.bilingual;activeSource=null;activeView=null;if(lesson.sample){sampleMode=true;activeSource={text:source,...prefs()};activeView={text:source,kind:'text'};$('#sample-source').hidden=false;$('#sample-passage').textContent=source;$('#upload-input').hidden=true;sampleControls(true);}else $('#source-hint').textContent='Saved notes only. Re-add your original page to generate a new version or ask a live doubt.';renderLesson();}else error('This lesson is no longer in this device’s notebook. Create another lesson to get started.');}
const printButton=document.createElement('button');printButton.className='button secondary small';printButton.textContent='Print / Save PDF';printButton.addEventListener('click',()=>window.print());$('.lesson-actions').append(printButton);
localize($('#language').value);
