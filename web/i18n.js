import {indianLanguages} from './language-data.js';
const preferenceKey='pagebhasha-preferences-v1';
const normalize=value=>value.replace(/\s+/g,' ').trim();
const originals=new WeakMap(),attributes=new WeakMap(),catalogs=new Map();
let language='English',dictionary={},sequence=0,observer;
const exclude='script,style,textarea,option[data-native],.brand,.book-mark,.script-drift,.art-tag,.words-visual,.translation-card [lang],#sample-passage,#source-image,#lesson-body,#visual-notes,#quiz-questions,#chat-log,#lesson-title,.saved-card h2,.saved-card p,.source-passage,.evidence-meaning,.original-source,[data-no-translate]';
export function readPreferences(){try{const value=JSON.parse(localStorage.getItem(preferenceKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
export function currentLanguage(){return language;}
export function t(text){return dictionary[normalize(text)]||text;}
function translateText(node){
 const parent=node.parentElement;if(!parent||parent.closest(exclude))return;
 const value=node.nodeValue,old=originals.get(node);
 const source=old&&old.output===value?old.source:value;
 const key=normalize(source);if(!key)return;
 const output=dictionary[key]?source.replace(source.trim(),dictionary[key]):source;
 originals.set(node,{source,output});if(value!==output)node.nodeValue=output;
}
export function translatePage(root=document.body){
 if(!root)return;
 observer?.disconnect();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode()))translateText(node);
 root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(el=>{
  if(el.closest(exclude))return;
  const state=attributes.get(el)||{};
  for(const key of ['aria-label','placeholder','title']){
   if(!el.hasAttribute(key))continue;
   const value=el.getAttribute(key),old=state[key],source=old&&old.output===value?old.source:value,output=t(source);
   state[key]={source,output};if(value!==output)el.setAttribute(key,output);
  }attributes.set(el,state);
 });
 observer?.observe(document.body,{subtree:true,childList:true,characterData:true});
}
export async function setSiteLanguage(name,{save=true}={}){
 const item=indianLanguages.find(x=>x[0]===name);if(!item)return false;
 const ticket=++sequence;
 try{
  if(!catalogs.has('en')){const base=await fetch('/locales/en.json');if(base.ok)catalogs.set('en',await base.json());}
  if(!catalogs.has(item[2])){
   const response=await fetch('/locales/'+item[2]+'.json');if(!response.ok)throw Error('catalog');
   catalogs.set(item[2],await response.json());
  }
 }catch{
  // A missing catalogue must never make the study workspace unusable. Keep
  // the selected language and use the English catalogue until its reviewed
  // translation is shipped.
  if(catalogs.has('en')) { dictionary=catalogs.get('en'); } else {
   try { const response=await fetch('/locales/en.json'); catalogs.set('en',await response.json()); dictionary=catalogs.get('en'); }
   catch { dictionary={}; }
  }
  catalogs.set(item[2],dictionary);
 }
 if(ticket!==sequence)return false;
 language=name;dictionary=catalogs.get(item[2]);
 const translated=Object.entries(dictionary).filter(([key,value])=>key!==value).length;
 const usable=name==='English'||translated/Math.max(1,Object.keys(catalogs.get('en')||dictionary).length)>.8;
 document.documentElement.lang=usable?item[2]:'en';document.documentElement.dir=usable&&['ur','ks','sd'].includes(item[2])?'rtl':'ltr';
 const status=document.querySelector('#locale-status');if(status){status.dataset.noTranslate='';status.hidden=usable;status.textContent=usable?'':`${item[1]} is saved as your preferred language. Some interface text is still shown in English while this translation is being completed.`;}
 if(save){try{localStorage.setItem(preferenceKey,JSON.stringify({...readPreferences(),language:name}));}catch{}}
 if(save&&new URLSearchParams(location.search).has('language')){const url=new URL(location.href);url.searchParams.set('language',name);history.replaceState(null,'',url);}
 const select=document.querySelector('#site-language');if(select)select.value=name;
 translatePage();document.dispatchEvent(new CustomEvent('pagebhasha:language',{detail:{language:name,code:item[2]}}));return true;
}
export async function initI18n(){
 // Preserve form values before translated labels change their implicit HTML values.
 document.querySelectorAll('option:not([value])').forEach(option=>option.value=option.textContent);
 let queued=false;
 observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;translatePage();});});
 const prefs=readPreferences();document.body.classList.toggle('calm-reading',prefs.motion===true);document.body.classList.toggle('high-contrast',prefs.contrast===true);
 await setSiteLanguage('English',{save:false});
}
