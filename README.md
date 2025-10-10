# Klasik Şifreleme Simülatörü

Bu proje, **Sezar (Caesar)** ve **Doğrusal (Affine)** şifreleme gibi klasik kriptografi algoritmaları için geliştirilmiş web tabanlı bir simülatördür. Uygulama, kullanıcıların metinleri şifrelemesine, deşifre etmesine ve şifreli metinler üzerinde temel kriptanaliz işlemleri yapmasına olanak tanır.

---

## Proje Yapısı

Uygulama, iki ana modülden oluşmaktadır:
1.  **Sezar Şifreleme:** Harflerin alfabe üzerinde sabit bir anahtar kadar kaydırılması prensibine dayanır.
2.  **Doğrusal Şifreleme:** `f(x) = ax + b (mod M)` matematiksel denklemini kullanarak daha karmaşık bir şifreleme sunar.

---

## Ortak Özellikler

Her iki modülde de aşağıdaki ortak özellikler bulunmaktadır:
- **Şifreleme ve Deşifreleme:** Kullanıcıdan alınan metni belirlenen anahtarlara göre şifreler veya çözer.
- **Türkçe ve İngilizce Alfabe Desteği:** İşlemler, 29 harfli Türkçe veya 26 harfli İngilizce alfabelerine göre yapılabilir.
- **Geçmiş (History) Kaydı:** Son yapılan şifreleme ve deşifreleme işlemleri, kullanılan anahtarlarla birlikte listelenir.
- **Dark/Light Mode:** Kullanıcı tercihine göre sayfa teması değiştirilebilir ve bu tercih tarayıcıya kaydedilir.

---

## Modüle Özgü Özellikler

### Sezar Şifreleme
- **Frekans Analizi:** Şifreli metindeki harflerin kullanım sıklığını bir liste olarak gösterir.
- **Brute-Force Denemeleri:** Olası tüm anahtarlar (`k`) için deşifre denemelerini listeler.
- **Frekans Tabanlı Tahminler:** Sık kullanılan harflerden yola çıkarak olası doğru anahtarı tahmin eder ve öneri olarak sunar.

### Doğrusal Şifreleme
- **Anahtar Geçerliliği Kontrolü:** Şifreleme için kullanılan `a` anahtarının, alfabe uzunluğu ile aralarında asal olup olmadığını kontrol ederek kullanıcıyı uyarır.
- **Kapsamlı Brute-Force:** Olası tüm geçerli `a` ve `b` anahtar çiftleri için deşifre denemelerini listeler.

---

## Kurulum ve Çalıştırma

1.  Proje dosyalarını bilgisayarınıza indirin veya klonlayın.
2.  Ana dizinde bulunan **`index.html`** dosyasını herhangi bir modern web tarayıcısında açın.
3.  Karşınıza gelen menüden "Sezar Şifreleme" veya "Doğrusal Şifreleme" seçeneklerinden birini seçerek ilgili uygulamaya geçiş yapın.

---

## Kullanım Notları

- **Anahtar Değerleri:** Lütfen her algoritma için geçerli anahtar aralıklarına ve kurallarına dikkat ediniz.
- **Tercihlerin Kaydedilmesi:** Alfabe seçimleriniz ve tema tercihiniz, tarayıcınızın yerel depolama alanına (`localStorage`) kaydedilir.
- **Karakter Koruma:** Şifreleme ve deşifreleme sırasında alfabe dışında kalan tüm karakterler (sayılar, boşluklar, noktalama işaretleri vb.) değiştirilmeden korunur.