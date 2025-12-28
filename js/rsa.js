// js/rsa.js
document.addEventListener('DOMContentLoaded', () => {

    // === Arayüz Elementleri ===
    const btnSimulate = document.getElementById('btnSimulate');
    const resultsSection = document.getElementById('results-section');
    const validationMsg = document.getElementById('validation-msg');
    const simulationSteps = document.getElementById('simulation-steps');

    // === Yardımcı Matematiksel Fonksiyonlar ===

    // En Büyük Ortak Bölen (EBOB)
    function gcd(a, b) {
        while (b) {
            a %= b;
            [a, b] = [b, a];
        }
        return a;
    }

    // Asallık Kontrolü
    function isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
    }

    // Modüler Ters Hesaplama (Genişletilmiş Öklid Algoritması)
    // d * e ≡ 1 (mod phi) denklemindeki d'yi bulur
    function modInverse(e, phi) {
        let m0 = phi, t, q;
        let x0 = 0, x1 = 1;
        if (phi === 1) return 0;
        while (e > 1) {
            q = Math.floor(e / phi);
            t = phi;
            phi = e % phi;
            e = t;
            t = x0;
            x0 = x1 - q * x0;
            x1 = t;
        }
        if (x1 < 0) x1 += m0;
        return x1;
    }

    // Modüler Üs Alma (base^exp % mod) - BigInt kullanımı kritik
    function modPow(base, exp, mod) {
        let res = BigInt(1);
        base = BigInt(base) % BigInt(mod);
        exp = BigInt(exp);
        let m = BigInt(mod);

        while (exp > 0n) {
            if (exp % 2n === 1n) res = (res * base) % m;
            base = (base * base) % m;
            exp = exp / 2n;
        }
        return Number(res);
    }

    // === Simülasyon Ana Fonksiyonu ===
    btnSimulate.addEventListener('click', () => {
        const p = parseInt(document.getElementById('inputP').value);
        const q = parseInt(document.getElementById('inputQ').value);
        const e = parseInt(document.getElementById('inputE').value);
        const m = parseInt(document.getElementById('inputM').value);

        // Giriş Alanı Kontrolü
        if (isNaN(p) || isNaN(q) || isNaN(e) || isNaN(m)) {
            alert("Lütfen tüm alanları geçerli sayılarla doldurun.");
            return;
        }

        resultsSection.style.display = 'block';
        simulationSteps.innerHTML = '';
        validationMsg.style.color = 'var(--text)';

        // 1. Protokol Kuralları Denetimi
        let errors = [];
        if (!isPrime(p)) errors.push(`p (${p}) bir asal sayı olmalıdır.`);
        if (!isPrime(q)) errors.push(`q (${q}) bir asal sayı olmalıdır.`);
        if (p === q) errors.push("p ve q birbirinden farklı asal sayılar olmalıdır.");
        
        const n = p * q;
        const phi = (p - 1) * (q - 1);

        if (gcd(e, phi) !== 1) {
            errors.push(`e (${e}) değeri, Φ(n) (${phi}) ile aralarında asal olmalıdır (ebob=1).`);
        }
        if (e <= 1 || e >= phi) {
            errors.push(`e değeri 1 < e < Φ(n) aralığında olmalıdır.`);
        }
        if (m >= n) {
            errors.push(`Mesaj m (${m}), n (${n}) değerinden küçük olmalıdır.`);
        }

        // Hata varsa göster ve dur
        if (errors.length > 0) {
            validationMsg.innerHTML = "❌ <strong>Uygun Olmayan Değerler:</strong><br>" + errors.join("<br>");
            validationMsg.style.color = "#f44336";
            return;
        }

        validationMsg.innerHTML = "✅ Girilen değerler RSA kurallarına uygundur.";
        validationMsg.style.color = "#4caf50";

        // 2. RSA Hesaplamaları
        const d = modInverse(e, phi); // Özel anahtar (private key)
        const c = modPow(m, e, n);   // Şifreleme: c = m^e mod n
        const decryptedM = modPow(c, d, n); // Deşifreleme: m = c^d mod n

        // 3. Sonuçları Yazdır
        const steps = [
            `<strong>Hesaplanan Parametreler:</strong>`,
            `n = p * q = <strong>${n}</strong>`,
            `Φ(n) = (p-1) * (q-1) = <strong>${phi}</strong>`,
            `Özel Anahtar (d): <strong>${d}</strong>`,
            `<br><strong>Protokol Çıktıları:</strong>`,
            `1. ALICI'nın Açık Anahtarı: <strong>{e: ${e}, n: ${n}}</strong>`,
            `2. GÖNDERİCİ'nin şifreleyip ilettiği değer (c): <strong>${c}</strong>`,
            `3. ALICI'nın deşifreleyip ulaştığı orijinal mesaj: <strong>${decryptedM}</strong>`
        ];

        steps.forEach(text => {
            const li = document.createElement('li');
            li.innerHTML = text;
            li.style.listStyleType = 'none';
            simulationSteps.appendChild(li);
        });
    });

    // === Tema Yönetimi (Ortak Özellik) ===
    const modeToggleCheckbox = document.getElementById('modeToggleCheckbox');
    if (modeToggleCheckbox) {
        const savedMode = localStorage.getItem('mode') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (savedMode === 'dark') {
            document.body.classList.add('dark');
            modeToggleCheckbox.checked = true;
        }
        modeToggleCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('mode', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
});