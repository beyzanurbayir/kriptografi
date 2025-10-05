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

  // Türkçe için sık harf sıralaması (kabaca) — frekans tahmini için kullanılacak
  const freqReference = {
    tr: ['a','e','i','n','r','t','l','k','m','o','u','s','y','d','b','g','ç','ü','ö','ş','v','h','p','z','c','f','j','ğ','ı'],
    en: ['e','t','a','o','i','n','s','r','h','l','d','c','u','m','f','y','w','g','p','b','v','k','x','q','j','z']
  };

  // === Yardımcı Fonksiyonlar ===
  function normalizeKey(k, len) {
    k = parseInt(k) || 0;
    k = ((k % len) + len) % len;
    return k;
  }

  function shiftChar(ch, key, alfabe, mode='encrypt') {
    if (!ch) return ch;
    const isLetter = ch.toLowerCase() !== ch.toUpperCase();
    const lower = ch.toLowerCase();
    const idx = alfabe.indexOf(lower);
    if (idx === -1) {
      // Alfabe dışı karakterleri koru
      return ch;
    }
    const len = alfabe.length;
    let newIndex;
    if (mode === 'encrypt') {
      newIndex = (idx + key) % len;
    } else {
      newIndex = (idx - key + len) % len;
    }
    const out = alfabe[newIndex];
    return (ch === ch.toUpperCase() && isLetter) ? out.toUpperCase() : out;
  }

  function processText(text, key, alfabe, mode='encrypt') {
    const k = normalizeKey(key, alfabe.length);
    let result = '';
    for (let ch of text) {
      result += shiftChar(ch, k, alfabe, mode);
    }
    return result;
  }

  // Harf frekansını hesapla (sadece alfabe içindeki harfleri sayar)
  function letterFrequencies(text, alfabe) {
    const freqs = {};
    for (let ch of alfabe) freqs[ch] = 0;
    let total = 0;
    for (let ch of text) {
      const lower = ch.toLowerCase();
      if (alfabe.indexOf(lower) !== -1) {
        freqs[lower] += 1;
        total += 1;
      }
    }
    return {freqs, total};
  }

  // Frekans tablosunu sıralı dizi olarak döndür
  function sortedFreqList(freqs) {
    const arr = Object.entries(freqs).map(([ch,c]) => ({ch, count: c}));
    arr.sort((a,b) => b.count - a.count);
    return arr;
  }

  // === Şifreleme ===
  document.getElementById('btnEncrypt').addEventListener('click', () => {
    const plain = document.getElementById('plainInput').value;
    const keyRaw = document.getElementById('keyEncrypt').value;
    const key = parseInt(keyRaw) || 0;
    const mode = document.getElementById('alphabetEncrypt').value;
    const alfabe = alfabetler[mode];
    if (!plain) { alert('Lütfen düz metin giriniz.'); return; }
    const cipher = processText(plain, key, alfabe, 'encrypt');
    document.getElementById('cipherOutput').value = cipher;
    // Şifrelerken kullanılan alfabe deşifre seçiminde seçili olsun
    const decryptSelect = document.getElementById('alphabetDecrypt');
    if (decryptSelect) decryptSelect.value = mode;
  });

  // === De-Şifreleme ===
  document.getElementById('btnDecrypt').addEventListener('click', () => {
    const cipher = document.getElementById('cipherInput').value;
    const keyRaw = document.getElementById('keyDecrypt').value;
    const key = parseInt(keyRaw) || 0;
    const mode = document.getElementById('alphabetDecrypt').value;
    const alfabe = alfabetler[mode];
    if (!cipher) { alert('Lütfen şifreli metin giriniz.'); return; }
    const plain = processText(cipher, key, alfabe, 'decrypt');
    document.getElementById('plainOutput').value = plain;
    // simetri için encrypt select de set edelim
    const encryptSelect = document.getElementById('alphabetEncrypt');
    if (encryptSelect) encryptSelect.value = mode;
  });

  // === Şifre Kırma ===
  document.getElementById('btnCrack').addEventListener('click', () => {
    const cipher = document.getElementById('crackInput').value;
    if (!cipher) { alert('Lütfen kırılacak şifreli metni giriniz.'); return; }
    const mode = document.getElementById('alphabetDecrypt').value || document.getElementById('alphabetEncrypt').value || 'tr';
    const alfabe = alfabetler[mode];
    // 1) Frekans analizi
    const {freqs, total} = letterFrequencies(cipher, alfabe);
    const sorted = sortedFreqList(freqs); // [{ch, count}, ...]
    // Göster: frekans sonuçları
    const freqResults = document.getElementById('freqResults');
    freqResults.innerHTML = `<strong>Harf Frekansları (alfabe: ${mode.toUpperCase()}, toplam harf: ${total})</strong><br/>`;
    const topN = 8;
    const top = sorted.slice(0, topN);
    freqResults.innerHTML += '<ol>' + top.map(x => `<li>${x.ch} : ${x.count}</li>`).join('') + '</ol>';

    // 2) Brute-force: tüm anahtarları dene ve listele
    const candidatesDiv = document.getElementById('crackCandidates');
    candidatesDiv.innerHTML = `<strong>Tüm anahtar sonuçları (brute-force, ${alfabe.length} anahtar):</strong><br/>`;
    const ul = document.createElement('div');
    ul.style.maxHeight = '360px';
    ul.style.overflow = 'auto';
    ul.style.padding = '6px';
    // Build brute-force list
    for (let k=0; k<alfabe.length; k++) {
      const cand = processText(cipher, k, alfabe, 'decrypt');
      // kısa ön izleme: eğer çok uzunsa ilk 200 karakter
      const preview = cand.length > 200 ? cand.slice(0,200) + '...' : cand;
      const wrap = document.createElement('div');
      wrap.style.padding = '6px';
      wrap.style.borderBottom = '1px dashed #ddd';
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

    // 3) Frekans tabanlı tahminler: en sık cipher harfini, referans sık harflerle eşleştir
    const suggestions = document.createElement('div');
    suggestions.style.marginTop = '12px';
    suggestions.innerHTML = `<strong>Frekans tabanlı öneriler (ilk ${topN} ile referans eşleşmeleri):</strong><br/>`;
    // top[0..] en sık cipher karakterleri
    const cipherTopChars = top.map(x => x.ch).filter(Boolean);
    const refOrder = freqReference[mode] || freqReference['tr'];
    const suggestedList = [];
    // eşleme: cipherTopChars[i] -> refOrder[j] için temiz anahtar hesapla
    for (let i=0; i<Math.min(cipherTopChars.length, 4); i++) {
      for (let j=0; j<Math.min(refOrder.length, 6); j++) {
        const c = cipherTopChars[i];
        const p = refOrder[j];
        // anahtar: shift such that p (plain) + key = c (cipher)  => key = idx(c) - idx(p)  (encrypt form)
        const idxC = alfabe.indexOf(c);
        const idxP = alfabe.indexOf(p);
        if (idxC === -1 || idxP === -1) continue;
        const keyGuess = ((idxC - idxP) % alfabe.length + alfabe.length) % alfabe.length;
        const dec = processText(cipher, keyGuess, alfabe, 'decrypt');
        suggestedList.push({key:keyGuess, map:`${c}→${p}`, dec});
      }
    }
    // Remove duplicates by key
    const uniq = [];
    const seenKeys = new Set();
    for (const s of suggestedList) {
      if (!seenKeys.has(s.key)) { uniq.push(s); seenKeys.add(s.key); }
    }
    if (uniq.length === 0) {
      suggestions.innerHTML += '<div>(Öneri bulunamadı)</div>';
    } else {
      suggestions.innerHTML += '<ol>' + uniq.map(s => `<li>k=${s.key} (eşleme: ${s.map}) — <button class="useCandidateBtn" data-k="${s.key}" data-mode="${mode}">Kullan</button> <span style="font-family:monospace;display:block;margin-top:4px">${escapeHtml(s.dec.slice(0,200))}${s.dec.length>200?'...':''}</span></li>`).join('') + '</ol>';
    }
    candidatesDiv.appendChild(suggestions);

    // add handlers for buttons
    document.querySelectorAll('.useCandidateBtn').forEach(b => {
      b.addEventListener('click', (e) => {
        const k = parseInt(b.dataset.k);
        const m = b.dataset.mode;
        applyCandidateToDecryptTab(cipher, k, m);
      });
    });
    document.querySelectorAll('.copyCandidateBtn').forEach(b => {
      b.addEventListener('click', (e) => {
        const text = decodeURIComponent(b.dataset.text);
        copyToClipboard(text);
        b.textContent = 'Kopyalandı';
        setTimeout(()=> b.textContent = 'Kopyala', 1200);
      });
    });
  });

  // === Yardım: adayı deşifre sekmesine uygula ve göster ===
  function applyCandidateToDecryptTab(cipherText, key, mode) {
    // Set decrypt tab values and trigger decryption
    const decryptSelect = document.getElementById('alphabetDecrypt');
    const cipherInput = document.getElementById('cipherInput');
    const keyInput = document.getElementById('keyDecrypt');
    const plainOutput = document.getElementById('plainOutput');

    if (decryptSelect) decryptSelect.value = mode;
    if (cipherInput) cipherInput.value = cipherText;
    if (keyInput) keyInput.value = key;
    // switch to decrypt tab
    switchToTab('decrypt');
    // perform decryption and display
    const alfabe = alfabetler[mode];
    const plain = processText(cipherText, key, alfabe, 'decrypt');
    if (plainOutput) plainOutput.value = plain;
  }

  // Sekme geçişi yardımcı
  function switchToTab(tabId) {
    const tabs = document.querySelectorAll('.tabs button');
    const sections = document.querySelectorAll('.tab');
    tabs.forEach(b => {
      if (b.dataset.tab === tabId) b.classList.add('active'); else b.classList.remove('active');
    });
    sections.forEach(s => {
      if (s.id === tabId) s.classList.add('active'); else s.classList.remove('active');
    });
  }

  // Basit kopyalama fonksiyonu
  function copyToClipboard(text) {
    try {
      navigator.clipboard.writeText(text);
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  // HTML escape (gösterim için güvenli)
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  // === Sekme Yönetimi (ilk yüklemede çalışır) ===
  const tabs = document.querySelectorAll('.tabs button');
  const sections = document.querySelectorAll('.tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      sections.forEach(s => s.id === target ? s.classList.add('active') : s.classList.remove('active'));
    });
  });

  // === Dark/Light Mode Toggle ===
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    // Buton tıklama
    modeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      if(document.body.classList.contains('dark')){
        modeToggle.textContent = '☀️ Light Mode';
      } else {
        modeToggle.textContent = '🌙 Dark Mode';
      }
    });

    // Başlangıçta buton metnini güncelle (opsiyonel: sistem teması)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark');
      modeToggle.textContent = '☀️ Light Mode';
    } else {
      modeToggle.textContent = '🌙 Dark Mode';
    }
  }

});
