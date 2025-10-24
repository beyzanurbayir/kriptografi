// js/vigenere.js
document.addEventListener('DOMContentLoaded', () => {

  // === Alfabe (Sadece Türkçe) ===
  const alfabe = ['a','b','c','ç','d','e','f','g','ğ','h','ı','i',
                  'j','k','l','m','n','o','ö','p','r','s','ş','t',
                  'u','ü','v','y','z'];
  const M = alfabe.length; // M = 29

  // === Yardımcı Fonksiyonlar ===

  // Anahtar kelimeyi düz metin/şifreli metin uzunluğuna uyarlar
  function prepareKey(key, text, textLength) {
    const lowerKey = key.toLocaleLowerCase('tr-TR');
    let prepared = '';
    let keyIndex = 0;
    for (let i = 0; i < textLength; i++) {
      // Sadece alfabe harflerini anahtara dahil et
      const charLower = lowerKey[keyIndex % lowerKey.length];
      if (alfabe.includes(charLower)) {
          prepared += charLower;
          keyIndex++;
      } else {
          // Eğer anahtarda alfabe dışı karakter varsa atla, metin uzunluğu kadar döngüye devam et
          // Ancak bu durum idealde olmamalı, anahtar sadece harf içermeli
      }
    }
     // Düzeltme: Anahtarın sadece metindeki harflere denk gelecek şekilde uzatılması
     let finalKey = '';
     let currentKeyIndex = 0;
     for(let i = 0; i < textLength; i++) {
         const textCharLower = text.charAt(i).toLocaleLowerCase('tr-TR');
         if(alfabe.includes(textCharLower)) {
             finalKey += prepared.charAt(currentKeyIndex % prepared.length);
             currentKeyIndex++;
         } else {
             finalKey += ' '; // Alfabe dışı karakterlere boşluk ata (işleme girmeyecek)
         }
     }

    return finalKey;
  }
  
    // Anahtar kelimeyi temizleme (sadece alfabe harflerini bırak)
    function cleanKey(key) {
        let cleaned = '';
        const lowerKey = key.toLocaleLowerCase('tr-TR');
        for (let char of lowerKey) {
            if (alfabe.includes(char)) {
                cleaned += char;
            }
        }
        if (cleaned.length === 0) {
            alert("Hata: Anahtar kelime en az bir geçerli Türkçe harf içermelidir.");
            return null; // Geçersiz anahtar
        }
        return cleaned;
    }


  // === Ana Şifreleme Fonksiyonları ===

  function processText(text, key, mode = 'encrypt') {
      const cleanedKey = cleanKey(key);
      if (!cleanedKey) return ''; // Geçersiz anahtar durumunda boş dön

      const preparedKey = prepareKey(cleanedKey, text, text.length); // Anahtarı metin uzunluğuna uyarla
      let result = '';

      for (let i = 0; i < text.length; i++) {
          const textChar = text[i];
          const textCharLower = textChar.toLocaleLowerCase('tr-TR');
          const keyChar = preparedKey[i]; // Uyumlu anahtar harfi

          const textCharIndex = alfabe.indexOf(textCharLower);

          if (textCharIndex === -1) {
              result += textChar; // Alfabe dışı karakteri koru
              continue;
          }

          const keyCharIndex = alfabe.indexOf(keyChar);
          let newIndex;

          if (mode === 'encrypt') {
              newIndex = (textCharIndex + keyCharIndex) % M;
          } else { // decrypt
              newIndex = (textCharIndex - keyCharIndex + M) % M;
          }

          const newChar = alfabe[newIndex];
          result += (textChar === textCharLower) ? newChar : newChar.toLocaleUpperCase('tr-TR');
      }
      return result;
  }


  // === Anahtar Uzunluğu Bulma Fonksiyonu (Kasiski Benzeri - Çakışma Sayımı) ===
  function findKeyLength(cipherText, maxKeyLength) {
    const results = [];
    const cleanedCipherText = cipherText.toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü]/g, ''); // Sadece harfleri al

    if (cleanedCipherText.length < 2) {
        return { // Yeterli veri yoksa boş sonuç dön
            scores: [],
            bestGuess: null
        };
    }


    for (let shift = 1; shift <= maxKeyLength; shift++) {
      let coincidenceCount = 0;
      for (let i = 0; i < cleanedCipherText.length - shift; i++) {
        if (cleanedCipherText[i] === cleanedCipherText[i + shift]) {
          coincidenceCount++;
        }
      }
      results.push({ length: shift, count: coincidenceCount });
    }

    // Sonuçları çakışma sayısına göre büyükten küçüğe sırala
    results.sort((a, b) => b.count - a.count);

    // En yüksek skoru al (eğer varsa)
    const bestGuess = results.length > 0 ? results[0].length : null;

    return { scores: results, bestGuess: bestGuess };
  }


  // === Arayüz Bağlantıları ===

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  
  // === History Fonksiyonu ===
  function addToHistory(type, input, output, key) {
    const listId = type === 'encrypt' ? 'encryptHistoryList' : 'decryptHistoryList';
    const list = document.getElementById(listId);
    if (!list) return;
    const li = document.createElement('li');
    li.innerHTML = `<strong>Anahtar=${escapeHtml(key)}</strong> — Input: ${escapeHtml(input)} | Output: ${escapeHtml(output)}`;
    list.prepend(li);
    if (list.children.length > 10) list.removeChild(list.lastChild);
  }

  // === Şifreleme ===
  document.getElementById('btnEncrypt').addEventListener('click', () => {
    const plain = document.getElementById('plainInput').value;
    const key = document.getElementById('keyEncrypt').value;

    if (!plain) { alert('Lütfen düz metin giriniz.'); return; }
    if (!key) { alert('Lütfen bir anahtar kelime giriniz.'); return; }
    
    const cipher = processText(plain, key, 'encrypt');
    if (cipher !== '') { // Sadece geçerli anahtar varsa sonucu göster ve kaydet
      document.getElementById('cipherOutput').value = cipher;
      addToHistory('encrypt', plain, cipher, key);
    }
  });

  // === De-Şifreleme ===
  document.getElementById('btnDecrypt').addEventListener('click', () => {
    const cipher = document.getElementById('cipherInput').value;
    const key = document.getElementById('keyDecrypt').value;

    if (!cipher) { alert('Lütfen şifreli metin giriniz.'); return; }
    if (!key) { alert('Lütfen bir anahtar kelime giriniz.'); return; }

    const plain = processText(cipher, key, 'decrypt');
     if (plain !== '') { // Sadece geçerli anahtar varsa sonucu göster ve kaydet
      document.getElementById('plainOutput').value = plain;
      addToHistory('decrypt', cipher, plain, key);
    }
  });

  // === Anahtar Uzunluğu Bulma ===
  document.getElementById('btnFindKeyLength').addEventListener('click', () => {
    const cipher = document.getElementById('keyLengthInput').value;
    const maxLen = parseInt(document.getElementById('maxKeyLength').value) || 10;

    if (!cipher) { alert('Lütfen analiz edilecek şifreli metni giriniz.'); return; }
    if (maxLen < 1) { alert('Maksimum anahtar uzunluğu en az 1 olmalıdır.'); return; }

    const resultsDiv = document.getElementById('keyLengthResults');
    resultsDiv.innerHTML = '<h4>Anahtar Uzunluğu Hesaplanıyor...</h4>';

    // Hesaplama zaman alabileceğinden setTimeout ile UI'ın donmasını engelle
    setTimeout(() => {
        const { scores, bestGuess } = findKeyLength(cipher, maxLen);
        
        let htmlResult = '<strong>Çakışma Sayısı Skorları:</strong><ol>';
        scores.forEach(item => {
            htmlResult += `<li>Anahtar Uzunluğu: ${item.length} → Çakışma Sayısı: ${item.count}</li>`;
        });
        htmlResult += '</ol>';

        if (bestGuess !== null) {
            htmlResult += `<p><strong>Muhtemel Anahtar Uzunluğu: ${bestGuess}</strong> (En yüksek çakışma sayısına göre)</p>`;
        } else {
             htmlResult += '<p>Yeterli veri bulunamadığı için anahtar uzunluğu tahmin edilemedi.</p>';
        }

        resultsDiv.innerHTML = htmlResult;
    }, 50); // 50 milisaniye gecikme

  });


  // === Sekme Yönetimi ve Dark Mode (Diğerlerinden kopyalandı) ===
  const modeToggleCheckbox = document.getElementById('modeToggleCheckbox');
  if (modeToggleCheckbox) {
    const savedMode = localStorage.getItem('mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedMode === 'dark') {
        document.body.classList.add('dark');
        modeToggleCheckbox.checked = true;
    }
    modeToggleCheckbox.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('mode', isDark ? 'dark' : 'light');
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