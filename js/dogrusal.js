// js/dogrusal.js
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

  // === Yardımcı Matematiksel Fonksiyonlar ===

  function obeb(a, b) {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  function modInverse(a, M) {
    for (let x = 1; x < M; x++) {
      if (((a % M) * (x % M)) % M == 1) {
        return x;
      }
    }
    return 1;
  }

  // === Ana Şifreleme Fonksiyonları ===

  function processText(text, a, b, alfabe, mode = 'encrypt') {
    const M = alfabe.length;

    if (obeb(a, M) !== 1) {
      alert(`Hata: 'a' anahtarı (${a}), alfabe uzunluğu (${M}) ile aralarında asal olmalıdır. Lütfen geçerli bir 'a' değeri seçin.`);
      return '';
    }

    const a_inv = modInverse(a, M);

    return Array.from(text).map(char => {
      const lower = char.toLocaleLowerCase('tr-TR');
      const idx = alfabe.indexOf(lower);

      if (idx === -1) {
        return char;
      }

      let newIndex;
      if (mode === 'encrypt') {
        newIndex = (a * idx + b) % M;
      } else { // decrypt
        newIndex = (a_inv * ((idx - b + M) % M)) % M;
      }

      const out = alfabe[newIndex];
      const isUpperCase = char !== lower;
      return isUpperCase ? out.toLocaleUpperCase('tr-TR') : out;
    }).join('');
  }
  
  // === Arayüz Bağlantıları ===
  
  const encryptSelect = document.getElementById('alphabetEncrypt');
  const decryptSelect = document.getElementById('alphabetDecrypt');

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
  function addToHistory(type, input, output, keyA, keyB, alfabe) {
      const listId = type === 'encrypt' ? 'encryptHistoryList' : 'decryptHistoryList';
      const list = document.getElementById(listId);
      if (!list) return;
      const li = document.createElement('li');
      li.innerHTML = `<strong>a=${keyA}, b=${keyB}, alfabe=${alfabe}</strong> — Input: ${escapeHtml(input)} | Output: ${escapeHtml(output)}`;
      list.prepend(li);
      if (list.children.length > 10) list.removeChild(list.lastChild);
  }

  // === Şifreleme ===
  document.getElementById('btnEncrypt').addEventListener('click', () => {
    const plain = document.getElementById('plainInput').value;
    const keyA = parseInt(document.getElementById('keyAEncrypt').value) || 0;
    const keyB = parseInt(document.getElementById('keyBEncrypt').value) || 0;
    const mode = encryptSelect.value;
    const alfabe = alfabetler[mode];

    if (!plain) { alert('Lütfen düz metin giriniz.'); return; }
    
    const cipher = processText(plain, keyA, keyB, alfabe, 'encrypt');
    if (cipher) {
        document.getElementById('cipherOutput').value = cipher;
        addToHistory('encrypt', plain, cipher, keyA, keyB, mode);
    }
  });

  // === De-Şifreleme ===
  document.getElementById('btnDecrypt').addEventListener('click', () => {
    const cipher = document.getElementById('cipherInput').value;
    const keyA = parseInt(document.getElementById('keyADecrypt').value) || 0;
    const keyB = parseInt(document.getElementById('keyBDecrypt').value) || 0;
    const mode = decryptSelect.value;
    const alfabe = alfabetler[mode];

    if (!cipher) { alert('Lütfen şifreli metin giriniz.'); return; }

    const plain = processText(cipher, keyA, keyB, alfabe, 'decrypt');
    if(plain) {
        document.getElementById('plainOutput').value = plain;
        addToHistory('decrypt', cipher, plain, keyA, keyB, mode);
    }
  });

  // === Şifre Kırma ===
  document.getElementById('btnCrack').addEventListener('click', () => {
    const cipher = document.getElementById('crackInput').value;
    if (!cipher) { alert('Lütfen kırılacak şifreli metni giriniz.'); return; }

    const crackAlphabetSelect = document.getElementById('alphabetCrack');
    const mode = crackAlphabetSelect.value;
    const alfabe = alfabetler[mode];
    const M = alfabe.length;

    const candidatesDiv = document.getElementById('crackCandidates');
    candidatesDiv.innerHTML = '<h4>Çözüm Adayları Hesaplanıyor...</h4>';
    
    const valid_a_values = [];
    for (let i = 1; i < M; i++) {
        if (obeb(i, M) === 1) {
            valid_a_values.push(i);
        }
    }
    
    let candidatesHTML = '';
    for (const a of valid_a_values) {
      for (let b = 0; b < M; b++) {
        const cand = processText(cipher, a, b, alfabe, 'decrypt');
        const preview = cand.length > 200 ? cand.slice(0, 200) + '...' : cand;
        
        candidatesHTML += `
          <div style="padding:6px; border-bottom:1px dashed #ddd;">
            <div><strong>a=${a}, b=${b}</strong></div>
            <div style="white-space:pre-wrap;font-family:monospace;margin:6px 0">${escapeHtml(preview)}</div>
            <div>
              <button class="useCandidateBtn" data-a="${a}" data-b="${b}">Kullan</button>
              <button class="copyCandidateBtn" data-text="${encodeURIComponent(cand)}">Kopyala</button>
            </div>
          </div>
        `;
      }
    }
    candidatesDiv.innerHTML = candidatesHTML;

    document.querySelectorAll('.useCandidateBtn').forEach(b => {
        b.addEventListener('click', () => {
            const keyA = parseInt(b.dataset.a);
            const keyB = parseInt(b.dataset.b);
            applyCandidateToDecryptTab(cipher, keyA, keyB);
        });
    });

    document.querySelectorAll('.copyCandidateBtn').forEach(b => {
        b.addEventListener('click', () => {
            const text = decodeURIComponent(b.dataset.text);
            copyToClipboard(text);
            b.textContent = 'Kopyalandı';
            setTimeout(() => b.textContent = 'Kopyala', 1200);
        });
    });
  });

  function applyCandidateToDecryptTab(cipherText, keyA, keyB) {
      const cipherInput = document.getElementById('cipherInput');
      const keyAInput = document.getElementById('keyADecrypt');
      const keyBInput = document.getElementById('keyBDecrypt');
      const plainOutput = document.getElementById('plainOutput');
      const crackAlphabetSelect = document.getElementById('alphabetCrack');

      if (cipherInput) cipherInput.value = cipherText;
      if (keyAInput) keyAInput.value = keyA;
      if (keyBInput) keyBInput.value = keyB;
      if (decryptSelect && crackAlphabetSelect) {
          decryptSelect.value = crackAlphabetSelect.value;
      }
      
      switchToTab('decrypt');

      const alfabe = alfabetler[decryptSelect.value];
      if (plainOutput) {
          plainOutput.value = processText(cipherText, keyA, keyB, alfabe, 'decrypt');
      }
  }

  // === localStorage ve Alfabe Seçimi ===
  if(encryptSelect){
    const saved = localStorage.getItem('alphabetEncryptLinear');
    if(saved) encryptSelect.value = saved;
    encryptSelect.addEventListener('change', e => localStorage.setItem('alphabetEncryptLinear', e.target.value));
  }

  if(decryptSelect){
    const saved = localStorage.getItem('alphabetDecryptLinear');
    if(saved) decryptSelect.value = saved;
    decryptSelect.addEventListener('change', e => localStorage.setItem('alphabetDecryptLinear', e.target.value));
  }

  // === Dark/Light Mode (YENİ VERSİYON) ===
  const modeToggleCheckbox = document.getElementById('modeToggleCheckbox');
  if (modeToggleCheckbox) {
    // Sayfa yüklendiğinde kayıtlı temayı uygula ve anahtarı ayarla
    const savedMode = localStorage.getItem('mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedMode === 'dark') {
        document.body.classList.add('dark');
        modeToggleCheckbox.checked = true;
    }

    // Anahtar değiştiğinde temayı değiştir ve kaydet
    modeToggleCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('mode', isDark ? 'dark' : 'light');
    });
  }

  // === Sekme Yönetimi ===
  function switchToTab(tabId) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab').forEach(s => s.id === tabId ? s.classList.add('active') : s.classList.remove('active'));
  }

  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      switchToTab(target);
    });
  });
});