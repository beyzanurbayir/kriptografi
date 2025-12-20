# Klasik Şifreleme Simülatörü

Bu proje, **Sezar (Caesar)**, **Doğrusal (Affine)**, **Vigenere**, **Resim Permütasyon** ve **Üç-Geçiş Protokolü** şifreleme gibi klasik kriptografi algoritmaları ve teknikleri için geliştirilmiş web tabanlı bir simülatördür. Uygulama, kullanıcıların metinleri veya resimleri şifrelemesine, deşifre etmesine ve şifreli metinler üzerinde temel kriptanaliz işlemleri yapmasına olanak tanır.

---

## Proje Yapısı

Uygulama, beş ana modülden oluşmaktadır:
1.  **Sezar Şifreleme:** Harflerin alfabe üzerinde sabit bir anahtar kadar kaydırılması prensibine dayanır.
2.  **Doğrusal Şifreleme:** `f(x) = ax + b (mod M)` matematiksel denklemini kullanarak daha karmaşık bir şifreleme sunar.
3.  **Vigenere Şifreleme:** Bir anahtar kelime kullanarak metindeki her harfi farklı miktarlarda kaydıran çoklu alfabeli bir şifrelemedir.
4.  **Resim Permütasyon Şifreleme:** Bir permütasyon anahtarı kullanarak resim dosyalarının piksellerini yeniden düzenleyerek şifreler.
5. **Üç-Geçiş Protokolü:** Anahtar paylaşımı yapmadan mesaj gönderimini sağlayan kalıcı bir protokol simülasyonudur.

---

## Ortak Özellikler

Tüm modüllerde aşağıdaki ortak özellikler bulunmaktadır:
- **Şifreleme ve Deşifreleme:** Kullanıcıdan alınan metni veya resmi belirlenen anahtarlara göre şifreler veya çözer.
- **Alfabe Desteği (Metin Modülleri):** Sezar ve Doğrusal modülleri Türkçe (29 harf) ve İngilizce (26 harf) alfabelerini destekler. Vigenere modülü şu anda sadece Türkçe alfabeyi desteklemektedir. Resim modülü alfabe kullanmaz.
- **Geçmiş (History) Kaydı (Metin Modülleri):** Sezar, Doğrusal ve Vigenere modüllerinde son yapılan şifreleme/deşifreleme işlemleri listelenir.
- **Dark/Light Mode:** Kullanıcı tercihine göre sayfa teması değiştirilebilir ve bu tercih tarayıcıya kaydedilir.
- **Ana Menüye Dön Butonu:** Her şifreleme sayfasından ana menüye kolayca geri dönülmesini sağlar.

---

## Modüle Özgü Özellikler

### Sezar Şifreleme
- **Frekans Analizi:** Şifreli metindeki harflerin kullanım sıklığını bir liste olarak gösterir.
- **Brute-Force Denemeleri:** Olası tüm anahtarlar (`k`) için deşifre denemelerini listeler.
- **Frekans Tabanlı Tahminler:** Sık kullanılan harflerden yola çıkarak olası doğru anahtarı tahmin eder ve öneri olarak sunar.

### Doğrusal Şifreleme
- **Anahtar Geçerliliği Kontrolü:** Şifreleme için kullanılan `a` anahtarının, alfabe uzunluğu ile aralarında asal olup olmadığını kontrol ederek kullanıcıyı uyarır.
- **Kapsamlı Brute-Force:** Olası tüm geçerli `a` ve `b` anahtar çiftleri için deşifre denemelerini listeler.

### Vigenere Şifreleme
- **Metin Tabanlı Anahtar:** Şifreleme anahtarı olarak bir kelime kullanılır.
- **Anahtar Uzunluğu Tahmini:** Şifreli metni analiz ederek, metni farklı miktarlarda kaydırıp aynı indisteki harflerin çakışma sayılarını hesaplar. En yüksek çakışma sayısını veren uzunluğu muhtemel anahtar uzunluğu olarak önerir.

### Resim Permütasyon Şifreleme
- **Resim Dosyası Girişi:** Şifrelemek veya deşifrelemek için kullanıcıdan bir resim dosyası alır.
- **Permütasyon Anahtarı:** 1-9 arası rakamlardan oluşan, en fazla 9 haneli ve benzersiz rakamlar içeren bir anahtar kullanır (örn: 35241).
- **Piksel Permütasyonu:** Resmin piksel verilerini bloklara ayırır ve her bloğun piksellerini anahtara göre yeniden düzenler.
- **Görsel Çıktı:** Şifrelenmiş veya deşifrelenmiş resmi doğrudan ekranda gösterir.

### Üç-Geçiş Protokolü
- **Protokol Denetimi:** Girilen P, A ve B değerlerinin kuralların (asallık, aralarındaki asallık) uygunluğunu denetler.
- **Adım Adım Simülasyon:** Mesajın kilitlenmesi ve açılma aşamalarını sonuçlarıyla birlikte listeler.
---

## Kurulum ve Çalıştırma

1.  Proje dosyalarını bilgisayarınıza indirin veya klonlayın.
2.  Ana dizinde bulunan **`index.html`** dosyasını herhangi bir modern web tarayıcısında açın.
3.  Karşınıza gelen menüden "Sezar Şifreleme", "Doğrusal Şifreleme", "Vigenere Şifreleme" veya "Resim Permütasyon Şifreleme" seçeneklerinden birini seçerek ilgili uygulamaya geçiş yapın.

---

## Kullanım Notları

- **Anahtar Değerleri:** Lütfen her algoritma için geçerli anahtar türlerine (sayı, kelime, permütasyon dizisi) ve kurallarına (asal olma, benzersiz rakamlar vb.) dikkat ediniz.
- **Tercihlerin Kaydedilmesi:** Alfabe seçimleriniz (ilgili modüllerde) ve tema tercihiniz, tarayıcınızın yerel depolama alanına (`localStorage`) kaydedilir.
- **Karakter Koruma (Metin Modülleri):** Metin tabanlı şifrelemelerde alfabe dışında kalan tüm karakterler (sayılar, boşluklar, noktalama işaretleri vb.) değiştirilmeden korunur.