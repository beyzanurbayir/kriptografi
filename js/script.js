// js/script.js
document.addEventListener('DOMContentLoaded', () => {

  // === Alfabeler ===
  const alfabetler = {
    tr: ['a','b','c','ç','d','e','f','g','ğ','h','ı','i',
         'j','k','l','m','n','o','ö','p','r','s','ş','t',
         'u','ü','v','y','z'],
    en: ['a','b','c','d','e','f','g','h','i','j','k','l',
         'm','n','o','p','q','r','s','t','u','v','w','x',
         'y','z']
  };

  // === Frekans referansı ===
  const freqReference = {
    tr: ['a','e','i','n','r','t','l','k','m','o','u','s','y','d','b','g','ç','ü','ö','ş','v','h','p','z','c','f','j','ğ','ı'],
    en: ['e','t','a','o','i','n','s','r','h','l','d','c','u','m','f','y','w','g','p','b','v','k','x','q','j','z']
  };

  // === Yardımcı Fonksiyonlar ===
  function normalizeKey(k, len) {
    k = parseInt(k) || 0;
    return ((k % len) + len) % len;
  }

  // --- GÜNCELLENMİŞ FONKSİYON ---
  // Türkçe karakter ('İ', 'ı' vb.) ve hata kontrolleri için güncellendi.
  function shiftChar(ch, key, alfabe, mode = 'encrypt') {
    // Hata kontrolü: Karakter tanımsız veya boş ise dokunmadan geri döndür.
    if (!ch) {
      return ch;
    }

    // Türkçe'ye özgü büyük/küçük harf dönüşümünü doğru yapmak için 'tr-TR' kullanılır.
    const lower = ch.toLocaleLowerCase('tr-TR');

    // Karakterin alfabe içinde olup olmadığını kontrol et.
    const idx = alfabe.indexOf(lower);
    if (idx === -1) {
      return ch; // Alfabe dışı karakterleri (boşluk, noktalama vb.) koru
    }

    // Harfin büyük mü küçük mü olduğunu başta kontrol et.
    const isUpperCase = ch !== lower;

    // Şifreleme/Deşifreleme işlemini yap.
    const len = alfabe.length;
    const newIndex = mode === 'encrypt'
      ? (idx + key) % len
      : (idx - key + len) % len;

    const out = alfabe[newIndex];

    // Orijinal harf büyükse, sonucu da Türkçe'ye uygun şekilde büyük harfe çevir.
    return isUpperCase ? out.toLocaleUpperCase('tr-TR') : out;
  }


  function processText(text, key, alfabe, mode='encrypt') {
    const k = normalizeKey(key, alfabe.length);
    return Array.from(text).map(ch => shiftChar(ch, k, alfabe, mode)).join('');
  }

  // --- GÜNCELLENMİŞ FONKSİYON ---
  // "ch.ch" yazım hatası düzeltildi.
  function letterFrequencies(text, alfabe) {
    const freqs = {};
    for (let ch of alfabe) freqs[ch] = 0;
    let total = 0;
    for (let ch of text) {
      const lower = ch.toLocaleLowerCase('tr-TR');
      if (alfabe.includes(lower)) {
        freqs[lower]++;
        total++;
      }
    }
    return {freqs, total};
  }

  function sortedFreqList(freqs) {
    return Object.entries(freqs)
                 .map(([ch,c]) => ({ch,count:c}))
                 .sort((a,b) => b.count - a.count);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  // === History Fonksiyonu ===
  function addToHistory(type, input, output, key, alfabe) {
    const listId = type === 'encrypt' ? 'encryptHistoryList' : 'decryptHistoryList';
    const list = document.getElementById(listId);
    if (!list) return;
    const li = document.createElement('li');
    li.innerHTML = `<strong>k=${key}, alfabe=${alfabe}</strong> — Input: ${escapeHtml(input)} | Output: ${escapeHtml(output)}`;
    list.prepend(li);
    if (list.children.length > 10) list.removeChild(list.lastChild);
  }

  // === localStorage Alfabe ===
  const encryptSelect = document.getElementById('alphabetEncrypt');
  const decryptSelect = document.getElementById('alphabetDecrypt');

  if(encryptSelect){
    const saved = localStorage.getItem('alphabetEncrypt');
    if(saved) encryptSelect.value = saved;
    encryptSelect.addEventListener('change', e => localStorage.setItem('alphabetEncrypt', e.target.value));
  }

  if(decryptSelect){
    const saved = localStorage.getItem('alphabetDecrypt');
    if(saved) decryptSelect.value = saved;
    decryptSelect.addEventListener('change', e => localStorage.setItem('alphabetDecrypt', e.target.value));
  }

  // === Dark/Light Mode ===
  const modeToggle = document.getElementById('modeToggle');
  if(modeToggle){
    const savedMode = localStorage.getItem('mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if(savedMode === 'dark') document.body.classList.add('dark');
    modeToggle.textContent = savedMode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    modeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('mode', isDark ? 'dark' : 'light');
      modeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // === Şifreleme ===
  document.getElementById('btnEncrypt').addEventListener('click', () => {
    const plain = document.getElementById('plainInput').value;
    const key = parseInt(document.getElementById('keyEncrypt').value) || 0;
    const mode = encryptSelect.value;
    const alfabe = alfabetler[mode];
    if(!plain){ alert('Lütfen düz metin giriniz.'); return; }
    const cipher = processText(plain, key, alfabe, 'encrypt');
    document.getElementById('cipherOutput').value = cipher;
    if(decryptSelect) decryptSelect.value = mode;
    addToHistory('encrypt', plain, cipher, key, mode);
  });

  // === De-Şifreleme ===
  document.getElementById('btnDecrypt').addEventListener('click', () => {
    const cipher = document.getElementById('cipherInput').value;
    const key = parseInt(document.getElementById('keyDecrypt').value) || 0;
    const mode = decryptSelect.value;
    const alfabe = alfabetler[mode];
    if(!cipher){ alert('Lütfen şifreli metin giriniz.'); return; }
    const plain = processText(cipher, key, alfabe, 'decrypt');
    document.getElementById('plainOutput').value = plain;
    if(encryptSelect) encryptSelect.value = mode;
    addToHistory('decrypt', cipher, plain, key, mode);
  });

  // === Şifre Kırma ===
  function drawFrequencyChart(freqs, alfabe) {
    const canvas = document.getElementById('freqCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const total = Object.values(freqs).reduce((a,b)=>a+b,0);
    const barWidth = canvas.width / alfabe.length * 0.8;
    const gap = canvas.width / alfabe.length * 0.2;
    alfabe.forEach((ch,i)=>{
      const freq = freqs[ch]/total;
      const barHeight = freq*canvas.height;
      ctx.fillStyle = '#007acc';
      ctx.fillRect(i*(barWidth+gap), canvas.height-barHeight, barWidth, barHeight);
      ctx.fillStyle = '#222';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ch, i*(barWidth+gap)+barWidth/2, canvas.height-2);
    });
  }

  document.getElementById('btnCrack').addEventListener('click', () => {
    const cipher = document.getElementById('crackInput').value;
    if(!cipher){ alert('Lütfen kırılacak şifreli metni giriniz.'); return; }
    const mode = decryptSelect?.value || encryptSelect?.value || 'tr';
    const alfabe = alfabetler[mode];

    const {freqs, total} = letterFrequencies(cipher, alfabe);
    drawFrequencyChart(freqs, alfabe);

    const sorted = sortedFreqList(freqs);
    const freqResults = document.getElementById('freqResults');
    freqResults.innerHTML = `<strong>Harf Frekansları (alfabe: ${mode.toUpperCase()}, toplam harf: ${total})</strong><br/>`;
    const topN = 8;
    const top = sorted.slice(0, topN);
    freqResults.innerHTML += '<ol>' + top.map(x => `<li>${x.ch} : ${x.count}</li>`).join('') + '</ol>';

    // Brute-force ve frekans tabanlı öneriler
    const candidatesDiv = document.getElementById('crackCandidates');
    candidatesDiv.innerHTML = '';
    const ul = document.createElement('div');
    ul.style.maxHeight = '360px';
    ul.style.overflow = 'auto';
    ul.style.padding = '6px';

    for(let k=0;k<alfabe.length;k++){
      const cand = processText(cipher, k, alfabe, 'decrypt');
      const preview = cand.length>200?cand.slice(0,200)+'...':cand;
      const wrap = document.createElement('div');
      wrap.style.padding='6px';
      wrap.style.borderBottom='1px dashed #ddd';
      wrap.innerHTML = `
        <div><strong>k = ${k}</strong></div>
        <div style="white-space:pre-wrap;font-family:monospace;margin:6px 0">${escapeHtml(preview)}</div>
        <div>
          <button class="useCandidateBtn" data-k="${k}" data-mode="${mode}">Kullan</button>
          <button class="copyCandidateBtn" data-text="${encodeURIComponent(cand)}">Kopyala</button>
        </div>
      `;
      ul.appendChild(wrap);
    }
    candidatesDiv.appendChild(ul);

    // Frekans tabanlı öneriler
    const suggestions = document.createElement('div');
    suggestions.style.marginTop='12px';
    suggestions.innerHTML = `<strong>Frekans tabanlı öneriler:</strong><br/>`;
    const cipherTopChars = top.map(x=>x.ch).filter(Boolean);
    const refOrder = freqReference[mode]||freqReference['tr'];
    const suggestedList=[];
    for(let i=0;i<Math.min(cipherTopChars.length,4);i++){
      for(let j=0;j<Math.min(refOrder.length,6);j++){
        const c=cipherTopChars[i], p=refOrder[j];
        const idxC=alfabe.indexOf(c), idxP=alfabe.indexOf(p);
        if(idxC===-1 || idxP===-1) continue;
        const keyGuess = ((idxC-idxP)%alfabe.length + alfabe.length)%alfabe.length;
        const dec = processText(cipher,keyGuess,alfabe,'decrypt');
        suggestedList.push({key:keyGuess,map:`${c}→${p}`,dec});
      }
    }
    // Remove duplicates
    const uniq=[], seen=new Set();
    for(const s of suggestedList){ if(!seen.has(s.key)){ uniq.push(s); seen.add(s.key); } }
    if(uniq.length===0) suggestions.innerHTML+='<div>(Öneri bulunamadı)</div>';
    else suggestions.innerHTML += '<ol>' + uniq.map(s=>`<li>k=${s.key} (eşleme: ${s.map}) — <button class="useCandidateBtn" data-k="${s.key}" data-mode="${mode}">Kullan</button> <span style="font-family:monospace;display:block;margin-top:4px">${escapeHtml(s.dec.slice(0,200))}${s.dec.length>200?'...':''}</span></li>`).join('')+'</ol>';
    candidatesDiv.appendChild(suggestions);

    document.querySelectorAll('.useCandidateBtn').forEach(b=>b.addEventListener('click',()=>applyCandidateToDecryptTab(cipher,parseInt(b.dataset.k),b.dataset.mode)));
    document.querySelectorAll('.copyCandidateBtn').forEach(b=>b.addEventListener('click',()=>{ const text=decodeURIComponent(b.dataset.text); copyToClipboard(text); b.textContent='Kopyalandı'; setTimeout(()=>b.textContent='Kopyala',1200); }));
  });

  function applyCandidateToDecryptTab(cipherText,key,mode){
    if(decryptSelect) decryptSelect.value = mode;
    const cipherInput = document.getElementById('cipherInput');
    const keyInput = document.getElementById('keyDecrypt');
    const plainOutput = document.getElementById('plainOutput');
    if(cipherInput) cipherInput.value = cipherText;
    if(keyInput) keyInput.value = key;
    switchToTab('decrypt');
    const alfabe = alfabetler[mode];
    if(plainOutput) plainOutput.value = processText(cipherText,key,alfabe,'decrypt');
  }

  function switchToTab(tabId){
    document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tabId));
    document.querySelectorAll('.tab').forEach(s=>s.id===tabId ? s.classList.add('active') : s.classList.remove('active'));
  }

  // === Sekme Yönetimi ===
  document.querySelectorAll('.tabs button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=btn.dataset.tab;
      switchToTab(target);
    });
  });

});