// js/resim_permutasyon.js
document.addEventListener('DOMContentLoaded', () => {

  // === Arayüz Elementleri ===
  const encryptInput = document.getElementById('encryptImageInput');
  const encryptKeyInput = document.getElementById('encryptKey');
  const btnEncrypt = document.getElementById('btnEncrypt');
  const encryptCanvasOutput = document.getElementById('encryptCanvasOutput');

  const decryptInput = document.getElementById('decryptImageInput');
  const decryptKeyInput = document.getElementById('decryptKey');
  const btnDecrypt = document.getElementById('btnDecrypt');
  const decryptCanvasOutput = document.getElementById('decryptCanvasOutput');

  // Gizli canvaslar (işlem yapmak için)
  const encryptCanvasInput = document.getElementById('encryptCanvasInput');
  const decryptCanvasInput = document.getElementById('decryptCanvasInput');

  // === Yardımcı Fonksiyon: Resmi Canvas'a Yükle ===
  function loadImageToCanvas(file, canvas) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('Lütfen bir resim dosyası seçin.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(ctx);
        };
        img.onerror = () => reject('Resim yüklenemedi.');
        img.src = event.target.result;
      };
      reader.onerror = () => reject('Dosya okunamadı.');
      reader.readAsDataURL(file);
    });
  }

  // === Yardımcı Fonksiyon: Permütasyon Anahtarını Doğrula ve Çözümle ===
  // Girdi: "312" (string)
  // Çıktı: [2, 0, 1] (0-indeksli permütasyon dizisi)
  function parsePermutationKey(key) {
    // Sadece 1-9 arası rakamlardan oluşup oluşmadığını kontrol et
    if (!/^[1-9]{1,9}$/.test(key)) {
      alert('Hata: Anahtar sadece 1-9 arası rakamlardan oluşmalı ve en fazla 9 haneli olmalıdır.');
      return null;
    }

    const keyDigits = Array.from(key).map(d => parseInt(d));
    const keyLength = key.length;

    // Rakamların benzersiz olup olmadığını kontrol et
    if (new Set(keyDigits).size !== keyLength) {
      alert('Hata: Anahtar rakamları benzersiz olmalıdır (örn: 312).');
      return null;
    }

    // Anahtarın 1'den N'e kadar tüm rakamları içerip içermediğini kontrol et
    for (let i = 1; i <= keyLength; i++) {
      if (!keyDigits.includes(i)) {
        alert(`Hata: Anahtar ${keyLength} haneli ise 1'den ${keyLength}'e kadar olan tüm rakamları içermelidir (örn: 312).`);
        return null;
      }
    }

    // "312" -> [3, 1, 2] -> 0-indeksli hale getir: [2, 0, 1]
    const zeroIndexedKey = keyDigits.map(d => d - 1);
    return zeroIndexedKey;
  }

  // === Yardımcı Fonksiyon: Permütasyon Anahtarının Tersini Bul ===
  // [2, 0, 1] (Şifreleme anahtarı) -> [1, 2, 0] (Deşifreleme anahtarı)
  function getInverseKey(key) {
    const inverse = new Array(key.length);
    for (let i = 0; i < key.length; i++) {
      inverse[key[i]] = i;
    }
    return inverse;
  }

  // === Çekirdek Şifreleme Fonksiyonu ===
  function processImage(inputCanvas, outputCanvas, keyString, mode) {
    const key = parsePermutationKey(keyString);
    if (!key) return; // Anahtar geçersizse işlemi durdur

    const ctxInput = inputCanvas.getContext('2d');
    const imageData = ctxInput.getImageData(0, 0, inputCanvas.width, inputCanvas.height);
    const data = imageData.data; // Resmin piksel verisi ("düz metin")

    // Çıktı için yeni bir veri dizisi oluştur
    const outputData = new Uint8ClampedArray(data.length);
    const keyLength = key.length;
    
    // Şifreleme veya deşifreleme için doğru permütasyon anahtarını seç
    const permutationKey = (mode === 'encrypt') ? key : getInverseKey(key);

    // Bir piksel 4 bayttan oluşur (R, G, B, A)
    // Permütasyonu piksel blokları üzerinde yapacağız
    const pixelSize = 4; // RGBA
    const blockSize = keyLength * pixelSize; // Bayt cinsinden blok boyutu

    for (let i = 0; i < data.length; i += blockSize) {
      const block = data.slice(i, i + blockSize);
      const outputBlock = new Uint8ClampedArray(block.length);

      // Resmin sonuna geldiysek ve blok tam değilse, kalan pikselleri olduğu gibi kopyala
      if (block.length < blockSize) {
        outputData.set(block, i);
        continue;
      }

      // Permütasyonu uygula (piksel piksel)
      for (let j = 0; j < keyLength; j++) {
        // Kaynak pikselin blok içindeki başlangıç indeksi (0, 4, 8, ...)
        const sourcePixelIndex = j * pixelSize;
        
        // Hedef pikselin blok içindeki başlangıç indeksi
        const targetPixelIndex = permutationKey[j] * pixelSize;
        
        // 4 baytlık (R,G,B,A) piksel verisini kopyala
        outputBlock[targetPixelIndex]     = block[sourcePixelIndex];     // R
        outputBlock[targetPixelIndex + 1] = block[sourcePixelIndex + 1]; // G
        outputBlock[targetPixelIndex + 2] = block[sourcePixelIndex + 2]; // B
        outputBlock[targetPixelIndex + 3] = block[sourcePixelIndex + 3]; // A
      }

      outputData.set(outputBlock, i);
    }

    // Çıktı verisini al ve output canvas'a çiz
    outputCanvas.width = inputCanvas.width;
    outputCanvas.height = inputCanvas.height;
    const ctxOutput = outputCanvas.getContext('2d');
    const outputImageData = new ImageData(outputData, inputCanvas.width, inputCanvas.height);
    ctxOutput.putImageData(outputImageData, 0, 0);

    alert('İşlem tamamlandı!');
  }

  // === Olay Dinleyicileri (Butonlar) ===

  // Şifreleme Butonu
  btnEncrypt.addEventListener('click', () => {
    const file = encryptInput.files[0];
    const keyString = encryptKeyInput.value;
    if (!file) {
      alert('Lütfen şifrelenecek bir resim dosyası seçin.');
      return;
    }
    if (!keyString) {
      alert('Lütfen bir permütasyon anahtarı girin.');
      return;
    }

    // Resmi gizli canvas'a yükle, sonra işlemi başlat
    loadImageToCanvas(file, encryptCanvasInput)
      .then(() => {
        processImage(encryptCanvasInput, encryptCanvasOutput, keyString, 'encrypt');
      })
      .catch(alert);
  });

  // Deşifreleme Butonu
  btnDecrypt.addEventListener('click', () => {
    const file = decryptInput.files[0];
    const keyString = decryptKeyInput.value;
    if (!file) {
      alert('Lütfen deşifre edilecek bir resim dosyası seçin.');
      return;
    }
    if (!keyString) {
      alert('Lütfen bir permütasyon anahtarı girin.');
      return;
    }

    // Resmi gizli canvas'a yükle, sonra işlemi başlat
    loadImageToCanvas(file, decryptCanvasInput)
      .then(() => {
        processImage(decryptCanvasInput, decryptCanvasOutput, keyString, 'decrypt');
      })
      .catch(alert);
  });

  // === Sekme Yönetimi ve Dark Mode (Diğer modüllerden kopyalandı) ===
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