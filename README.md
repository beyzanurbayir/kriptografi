# Sezar Şifreleme Web Uygulaması

Bu proje, **Sezar (Caesar) şifrelemesi** için geliştirilmiş **web tabanlı bir uygulamadır**.  
Uygulama, hem metinleri şifrelemenizi hem de şifreleri çözmenizi sağlar. Ayrıca harf frekans analizi ve brute-force denemeleri ile şifre çözme desteği sunar.

---

## Özellikler

- **Şifreleme ve deşifreleme**: Kullanıcıdan alınan metni belirlenen anahtara göre şifreler veya çözer.
- **Türkçe ve İngilizce alfabe desteği**.
- **Harf frekans listesi**: Şifreli metindeki harflerin kullanım sıklığını listeler.
- **Brute-force anahtar denemeleri**: Tüm olası anahtarlar ile şifre çözümünü listeler.
- **Frekans tabanlı tahminler**: Sık kullanılan harfler üzerinden otomatik anahtar önerileri sunar.
- **Geçmiş (history) kaydı**: Son yapılan şifreleme ve deşifreleme işlemlerini listeler.
- **Dark/Light Mode**: Tercihinize göre sayfa temasını değiştirebilirsiniz. Tercihleriniz tarayıcıya kaydedilir.

---

## Alfabe ve Anahtar

- **Türkçe alfabe**: 29 harf  
  `a, b, c, ç, d, e, f, g, ğ, h, ı, i, j, k, l, m, n, o, ö, p, r, s, ş, t, u, ü, v, y, z`  
  **Mod işlemleri:** mod 29

- **İngilizce alfabe**: 26 harf  
  `a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z`  
  **Mod işlemleri:** mod 26

Anahtar değerleri alfabenin uzunluğuna göre döngüsel olarak uygulanır. Negatif değerler de otomatik olarak dönüştürülür.

---

## Kurulum ve Çalıştırma

1. Bu projeyi bilgisayarınıza indirin veya klonlayın.
2. `index.html` dosyasını herhangi bir modern web tarayıcısında açın.  
   - Alternatif olarak, **VSCode Live Server** uzantısını kullanabilirsiniz.
3. Şifreleme veya deşifreleme işlemlerinizi uygulama arayüzünden gerçekleştirin.

---

## Kullanım Notları

- Anahtar değerini 0 ile alfabe uzunluğu-1 arasında giriniz.
- Alfabe seçiminde yaptığınız değişiklikler ve tema tercihleriniz tarayıcıya kaydedilir.
- Şifreleme ve deşifreleme sırasında alfabe dışında kalan karakterler korunur.

---