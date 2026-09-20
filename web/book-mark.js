const art = `<svg class="pb-book" viewBox="0 0 64 60" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false"><rect x="21" y="5" width="36" height="50" rx="5" fill="#acbc96"/><rect x="22" y="3" width="33" height="49" rx="4" fill="#284f3f"/><path d="M25 8h26v40H25z" fill="#fffdf0"/><path d="M29 16h17m-17 7h17m-17 7h17m-17 7h12" stroke="#afbea3" stroke-width="1.5"/><g class="pb-left"><path d="M22 9Q12 5 3 9v39q10-3 19 2" fill="#fffcf0" stroke="#315c48" stroke-width="2"/><path d="M7 17h10M7 24h10M7 31h10M7 38h7" stroke="#b2c0a6" stroke-width="1.3"/></g><g class="pb-leaf"><path d="M23 8h26v40H23z" fill="#fffdf0" stroke="#cbd2be"/><path d="M28 16h15m-15 7h15m-15 7h15m-15 7h10" stroke="#b2c0a6" stroke-width="1.3"/></g><g class="pb-cover"><rect x="20" y="3" width="34" height="48" rx="4" fill="#315c48"/><path d="M23 5v44" stroke="#b7c59b" stroke-width="2"/><text x="37" y="32" fill="#f6f0d9" font-size="25" font-weight="700" text-anchor="middle" font-family="system-ui,sans-serif">अ</text><path d="M43 41h6m-6 4h6" stroke="#c0cea7"/></g></svg>`;

export function createBookMark(className = '') {
  const book = document.createElement('span');
  book.className = ['book-mark', className].filter(Boolean).join(' ');
  book.setAttribute('aria-hidden', 'true');
  book.innerHTML = `<span class="brand-volume"><span class="volume-base"></span><span class="volume-sheet sheet-one"></span><span class="volume-sheet sheet-two"></span><span class="volume-cover"><span class="cover-outside"><span>अ</span><b></b></span><span class="cover-inside"></span></span></span>`;
  return book;
}

export function replaceBrandImages(root = document) {
  root.querySelectorAll('.brand img').forEach(img => img.replaceWith(createBookMark()));
}

export function createLearningAnimation() {
  const element = document.createElement('div');
  element.className = 'learning-animation';
  element.innerHTML = `<div class="learning-spark" aria-hidden="true"><svg viewBox="0 0 120 100" fill="none"><circle class="idea-halo" cx="60" cy="42" r="30" fill="#efc775" fill-opacity=".22"/><path d="M46 54c-18-19-7-42 14-42s32 23 14 42l-5 9H51z" fill="#f8e2a3" stroke="#315c48" stroke-width="2.5"/><path d="M52 71h16m-14 7h12M60 62V42m-9-5 9 7 9-7" stroke="#315c48" stroke-width="2.5" stroke-linecap="round"/><g class="idea-rays" stroke="#b78a35" stroke-width="2.5" stroke-linecap="round"><path d="M60 2v4M22 37h7m62 0h7M29 10l6 6m50 0 6-6"/></g><path class="idea-line" d="M26 92h68" stroke="#719169" stroke-width="3" stroke-linecap="round"/></svg></div><p class="learning-quote">Every question is a step towards understanding.</p>`;
  return element;
}

export function watchLearningQuotes(host, translate = text => text) {
  const quotes = ['Every question is a step towards understanding.', 'Take it one idea at a time.', 'A small question can lead to a big discovery.', 'You do not have to understand everything at once.'];
  let timer, index = 0;
  const update = () => { const quote=host.querySelector('.learning-quote'); if(quote) quote.textContent=translate(quotes[index++ % quotes.length]); };
  const sync = () => { clearInterval(timer); if(!host.hidden){update(); timer=setInterval(update,6500);} };
  new MutationObserver(sync).observe(host,{attributes:true,attributeFilter:['hidden']});
  sync();
}
