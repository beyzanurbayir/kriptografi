// js/dogrusal.js
document.addEventListener('DOMContentLoaded', () => {

  // === Alfabe (Sadece İngilizce) ===
  const alfabe = ['a','b','c','d','e','f','g','h','i','j','k','l',
                  'm','n','o','p','q','r','s','t','u','v','w','x',
                  'y','z'];
  const M = alfabe.length; // M = 26

  // === Yardımcı Matematiksel Fonksiyonlar ===

  // a'nın 26 ile aralarında asal olup olmadığını kontrol eder (OBEB/GCD)
  function obeb(a, b) {
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  // a'nın mod 26'ya göre modüler tersini bulur
  function modInverse(a) {
    for (let x = 1; x < M; x++) {
      if (((a % M) * (x % M)) % M == 1) {
        return x;
      }
    }
    return 1; // Hata durumunda
  }

  // === Ana Şifreleme Fonksiyonları ===

  function processText(text, a, b, mode = 'encrypt') {
    if (obeb(a, M) !== 1) {
      alert(`Hata: 'a' anahtarı (${a}) 26 ile aralarında asal olmalıdır. Lütfen 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25 gibi bir değer seçin.`);
      return '';
    }

    const a_inv = modInverse(a);

    return Array.from(text).map(char => {
      const lower = char.toLowerCase();
      const idx = alfabe.indexOf(lower);

      if (idx === -1) {
        return char; // Alfabe dışı karakterleri koru
      }

      let newIndex;
      if (mode === 'encrypt') {
        newIndex = (a * idx + b) % M;
      } else { // decrypt
        newIndex = (a_inv * ((idx - b + M) % M)) % M;
      }

      const out = alfabe[newIndex];
      return char === lower ? out : out.toUpperCase();
    }).join('');
  }

  // === Arayüz Bağlantıları ===

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // === Şifreleme ===
  document.getElementById('btnEncrypt').addEventListener('click', () => {
    const plain = document.getElementById('plainInput').value;
    const keyA = parseInt(document.getElementById('keyAEncrypt').value) || 0;
    const keyB = parseInt(document.getElementById('keyBEncrypt').value) || 0;

    if (!plain) { alert('Lütfen düz metin giriniz.'); return; }
    
    const cipher = processText(plain, keyA, keyB, 'encrypt');
    document.getElementById('cipherOutput').value = cipher;
  });

  // === De-Şifreleme ===
  document.getElementById('btnDecrypt').addEventListener('click', () => {
    const cipher = document.getElementById('cipherInput').value;
    const keyA = parseInt(document.getElementById('keyADecrypt').value) || 0;
    const keyB = parseInt(document.getElementById('keyBDecrypt').value) || 0;

    if (!cipher) { alert('Lütfen şifreli metin giriniz.'); return; }

    const plain = processText(cipher, keyA, keyB, 'decrypt');
    document.getElementById('plainOutput').value = plain;
  });

  // === Şifre Kırma ===
  document.getElementById('btnCrack').addEventListener('click', () => {
    const cipher = document.getElementById('crackInput').value;
    if (!cipher) { alert('Lütfen kırılacak şifreli metni giriniz.'); return; }

    const candidatesDiv = document.getElementById('crackCandidates');
    candidatesDiv.innerHTML = '';
    
    const valid_a_values = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

    for (const a of valid_a_values) {
      for (let b = 0; b < M; b++) {
        const cand = processText(cipher, a, b, 'decrypt');
        const preview = cand.length > 200 ? cand.slice(0, 200) + '...' : cand;
        
        const wrap = document.createElement('div');
        wrap.style.padding = '6px';
        wrap.style.borderBottom = '1px dashed #ddd';
        wrap.innerHTML = `
          <div><strong>a=${a}, b=${b}</strong></div>
          <div style="white-space:pre-wrap;font-family:monospace;margin:6px 0">${escapeHtml(preview)}</div>
        `;
        candidatesDiv.appendChild(wrap);
      }
    }
  });


  // === Sekme Yönetimi ve Dark Mode (Sezar'dan kopyalandı) ===
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    const savedMode = localStorage.getItem('mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedMode === 'dark') document.body.classList.add('dark');
    modeToggle.textContent = savedMode === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    modeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('mode', isDark ? 'dark' : 'light');
      modeToggle.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

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