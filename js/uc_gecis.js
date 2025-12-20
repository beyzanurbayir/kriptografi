// js/uc_gecis.js
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
    // a * x ≡ 1 (mod m) denklemindeki x'i bulur
    function modInverse(a, m) {
        let m0 = m, t, q;
        let x0 = 0, x1 = 1;
        if (m === 1) return 0;
        while (a > 1) {
            q = Math.floor(a / m);
            t = m;
            m = a % m;
            a = t;
            t = x0;
            x0 = x1 - q * x0;
            x1 = t;
        }
        if (x1 < 0) x1 += m0;
        return x1;
    }

    // Modüler Üs Alma (base^exp % mod) - Büyük sayılar için BigInt kullanılır
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
        const P = parseInt(document.getElementById('inputP').value);
        const A = parseInt(document.getElementById('inputA').value);
        const B = parseInt(document.getElementById('inputB').value);
        const K = parseInt(document.getElementById('inputK').value);

        // Giriş Kontrolü
        if (isNaN(P) || isNaN(A) || isNaN(B) || isNaN(K)) {
            alert("Lütfen tüm alanları geçerli sayılarla doldurun.");
            return;
        }

        resultsSection.style.display = 'block';
        simulationSteps.innerHTML = '';
        validationMsg.style.color = 'var(--text)';

        // 1. Protokol Kuralları Denetimi
        let errors = [];
        if (!isPrime(P)) errors.push(`P (${P}) bir asal sayı olmalıdır.`);
        if (gcd(A, P - 1) !== 1) errors.push(`A anahtarı (${A}), P-1 (${P - 1}) ile aralarında asal olmalıdır.`);
        if (gcd(B, P - 1) !== 1) errors.push(`B anahtarı (${B}), P-1 (${P - 1}) ile aralarında asal olmalıdır.`);
        if (K >= P) errors.push(`Mesaj değeri K (${K}), P'den (${P}) küçük olmalıdır.`);

        if (errors.length > 0) {
            validationMsg.innerHTML = "❌ <strong>Uygun Olmayan Değerler:</strong><br>" + errors.join("<br>");
            validationMsg.style.color = "#f44336";
            return;
        }

        validationMsg.innerHTML = "✅ Girilen değerler protokol kurallarına uygundur.";
        validationMsg.style.color = "#4caf50";

        // 2. Hesaplamalar
        const aInv = modInverse(A, P - 1);
        const bInv = modInverse(B, P - 1);

        // Adım 1: Gönderici K'yı A ile kilitler
        const step1 = modPow(K, A, P);
        // Adım 2: Alıcı gelen mesajı B ile kilitler
        const step2 = modPow(step1, B, P);
        // Adım 3: Gönderici kendi kilidini (A^-1) açar
        const step3 = modPow(step2, aInv, P);
        // Adım 4: Alıcı kendi kilidini (B^-1) açar ve K'ya ulaşır
        const step4 = modPow(step3, bInv, P);

        // 3. Sonuçları Ekrana Yazdır
        const steps = [
            `<strong>A anahtarının tersi (A⁻¹):</strong> ${aInv}`,
            `<strong>B anahtarının tersi (B⁻¹):</strong> ${bInv}`,
            `<br><strong>Süreç Adımları:</strong>`,
            `1. Gönderici K mesajını A ile kilitledi: <strong>${step1}</strong>`,
            `2. Alıcı aldığı mesajı B ile kilitledi: <strong>${step2}</strong>`,
            `3. Gönderici aldığı mesajı A⁻¹ ile açtı: <strong>${step3}</strong> (Bu değer Kᴮ mod P'ye eşittir)`,
            `4. Alıcı aldığı mesajı B⁻¹ ile açtı: <strong>${step4}</strong> (Orijinal mesaj K geri elde edildi)`
        ];

        steps.forEach(text => {
            const li = document.createElement('li');
            li.innerHTML = text;
            li.style.listStyleType = 'none';
            simulationSteps.appendChild(li);
        });
    });

    // === Karanlık Mod ve Tema Yönetimi (Diğer sayfalardan kopyalandı) ===
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