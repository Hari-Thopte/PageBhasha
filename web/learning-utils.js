// Small, dependency-free formatting and source matching helpers.
export function plainMath(value) {
  const sub='₀₁₂₃₄₅₆₇₈₉', sup='⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(value??'').replace(/\$([^$\n]+)\$/g,(_,s)=>s)
    .replace(/\\(?:mathrm|text)\{([^{}]*)\}/g,'$1')
    .replace(/_\{([0-9]+)\}|_([0-9]+)/g,(_,a,b)=>[...(a||b)].map(n=>sub[n]).join(''))
    .replace(/\^\{([0-9]+)\}|\^([0-9]+)/g,(_,a,b)=>[...(a||b)].map(n=>sup[n]).join(''))
    .replace(/\\rightarrow/g,'→').replace(/\\leftrightarrow/g,'↔').replace(/\\times/g,'×').replace(/\\cdot/g,'·');
}
export function glossaryEntry(item) {
  if(item.term) return {term:item.term,definition:item.definition||item.explanation||''};
  const quote=String(item.quote||'');
  return {term:quote.split(/[,;:]/)[0].trim(),definition:item.explanation||quote};
}
// Whitespace normalization only: no fuzzy matching, guessed words or coordinates.
export function exactRange(text,quote) {
  const chars=[], positions=[];
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(/\s/.test(c)){if(chars.at(-1)!==' '){chars.push(' ');positions.push(i);}}
    else {chars.push(c);positions.push(i);}
  }
  const needle=String(quote).replace(/\s+/g,' ').trim(), hay=chars.join('');
  if(!needle)return null;
  const start=hay.indexOf(needle);
  if(start<0||hay.indexOf(needle,start+1)!==-1)return null;
  return [positions[start],positions[start+needle.length-1]+1];
}
export function pdfBoxes(words,quote) {
  const text=words.map(w=>w.text).join(' '), range=exactRange(text,quote);
  if(!range)return [];
  if((range[0]>0&&text[range[0]-1]!==' ')||(range[1]<text.length&&text[range[1]]!==' '))return [];
  let offset=0;const boxes=[];
  for(const word of words){const end=offset+word.text.length;if(offset<range[1]&&end>range[0])boxes.push(word.box);offset=end+1;}
  return boxes;
}
