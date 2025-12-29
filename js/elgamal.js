// js/elgamal.js
document.addEventListener('DOMContentLoaded', () => {
    const btnSimulate = document.getElementById('btnSimulate');
    const resultsSection = document.getElementById('results-section');
    const validationMsg = document.getElementById('validation-msg');
    const simulationSteps = document.getElementById('simulation-steps');

    // Matematiksel Yardımcılar
    function gcd(a, b) { while (b) { a %= b; [a, b] = [b, a]; } return a; }

    function isPrime(n) {
        if (n <= 1) return false;
        for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
        return true;
    }

    function modPow(base, exp, mod) {
        let res = BigInt(1);
        base = BigInt(base) % BigInt(mod);
        exp = BigInt(exp);
        while (exp > 0n) {
            if (exp % 2n === 1n) res = (res * base) % BigInt(mod);
            base = (base * base) % BigInt(mod);
            exp = exp / 2n;
        }
        return res;
    }

    // İlkel Kök (Primitive Root) Kontrolü
    function isPrimitiveRoot(alpha, p) {
        if (gcd(alpha, p) !== 1) return false;
        let phi = p - 1;
        let factors = [];
        let n = phi;
        for (let i = 2; i * i <= n; i++) {
            if (n % i === 0) {
                factors.push(i);
                while (n % i === 0) n /= i;
            }
        }
        if (n > 1) factors.push(n);

        for (let f of factors) {
            if (modPow(alpha, phi / f, p) === 1n) return false;
        }
        return true;
    }

    // Modüler Ters (Fermat'ın Küçük Teoremi: p asalken a^(p-2) mod p)
    function modInverse(a, p) {
        return modPow(a, p - 2, p);
    }

    btnSimulate.addEventListener('click', () => {
        const p = parseInt(document.getElementById('inputP').value);
        const alpha = parseInt(document.getElementById('inputAlpha').value);
        const b = parseInt(document.getElementById('inputB').value);
        const k = parseInt(document.getElementById('inputK').value);
        const m = parseInt(document.getElementById('inputM').value);

        if (isNaN(p) || isNaN(alpha) || isNaN(b) || isNaN(k) || isNaN(m)) {
            alert("Lütfen tüm alanları doldurun."); return;
        }

        resultsSection.style.display = 'block';
        simulationSteps.innerHTML = '';
        let errors = [];

        if (!isPrime(p)) errors.push(`p (${p}) asal sayı olmalıdır.`);
        else if (!isPrimitiveRoot(alpha, p)) errors.push(`${alpha} değeri mod ${p} için bir ilkel kök değildir.`);
        
        if (b <= 1 || b >= p - 1) errors.push(`b değeri 1 < b < ${p-1} aralığında olmalıdır.`);
        if (k <= 1 || k >= p - 1) errors.push(`k değeri 1 < k < ${p-1} aralığında olmalıdır.`);
        if (m >= p) errors.push(`Mesaj m, p'den küçük olmalıdır.`);

        if (errors.length > 0) {
            validationMsg.innerHTML = "❌ <strong>Hata:</strong><br>" + errors.join("<br>");
            validationMsg.style.color = "#f44336"; return;
        }

        validationMsg.innerHTML = "✅ Değerler El-Gamal kurallarına uygundur.";
        validationMsg.style.color = "#4caf50";

        // Hesaplamalar
        const h = modPow(alpha, b, p); // Açık anahtar parçası
        const c1 = modPow(alpha, k, p); // Şifre 1
        const c2 = (BigInt(m) * modPow(h, k, p)) % BigInt(p); // Şifre 2
        
        const s = modPow(c1, b, p); // Ortak gizli (decryption için)
        const decryptedM = (BigInt(c2) * modInverse(Number(s), p)) % BigInt(p);

        const steps = [
            `1. ALICI'nın Açık Anahtarı (p, α, h): <strong>(${p}, ${alpha}, ${h})</strong>`,
            `2. GÖNDERİCİ'nin ilettiği ikili şifre (c1, c2): <strong>(${c1}, ${c2})</strong>`,
            `3. ALICI'nın hesapladığı ara değer (c1ᵇ mod p): <strong>${s}</strong>`,
            `4. ALICI'nın ulaştığı orijinal mesaj: <strong>${decryptedM}</strong>`
        ];

        steps.forEach(text => {
            const li = document.createElement('li');
            li.innerHTML = text;
            li.style.listStyleType = 'none';
            simulationSteps.appendChild(li);
        });
    });

    // Tema Yönetimi (Dark Mode) - menu.js ile aynı mantık
    const modeToggleCheckbox = document.getElementById('modeToggleCheckbox');
    if (modeToggleCheckbox) {
        const savedMode = localStorage.getItem('mode') || 'light';
        if (savedMode === 'dark') { document.body.classList.add('dark'); modeToggleCheckbox.checked = true; }
        modeToggleCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('mode', document.body.classList.contains('dark') ? 'dark' : 'light');
        });
    }
});