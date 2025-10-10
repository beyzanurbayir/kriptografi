// js/menu.js
document.addEventListener('DOMContentLoaded', () => {
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
});