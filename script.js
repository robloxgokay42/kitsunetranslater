// Arayüzdeki HTML elementlerini seçiyoruz
const sourceTextarea = document.getElementById('source-text');
const targetTextarea = document.getElementById('target-text');
const swapButton = document.getElementById('swap-button');
const listenSourceButton = document.getElementById('listen-source');
const listenTargetButton = document.getElementById('listen-target');
const copyTargetButton = document.getElementById('copy-target');
const sourceWordCount = document.getElementById('source-word-count');
const sourceLangLabel = document.getElementById('source-lang-label');
const targetLangLabel = document.getElementById('target-lang-label');

// Kelime/Karakter Sayacı ve Sınırı
const MAX_CHAR_COUNT = 1000;
let typingTimer; // Yazma gecikmesi için timer

sourceTextarea.addEventListener('input', () => {
    // Karakter sayısını güncelle
    const charCount = sourceTextarea.value.length;
    sourceWordCount.textContent = charCount;

    // Eğer limit aşılırsa, fazla karakterleri kes
    if (charCount > MAX_CHAR_COUNT) {
        sourceTextarea.value = sourceTextarea.value.slice(0, MAX_CHAR_COUNT);
        sourceWordCount.textContent = MAX_CHAR_COUNT;
    }

    // Kullanıcı yazdıkça çeviri fonksiyonunu çağır
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        translateText(sourceTextarea.value);
    }, 500); // 500 milisaniye (0.5 saniye) sonra çeviri başlar
});

// Dil Değiştirme (Swap) Butonu İşlevi
swapButton.addEventListener('click', () => {
    // Butonun dönüş animasyonunu ekle
    swapButton.classList.add('rotated');
    setTimeout(() => {
        swapButton.classList.remove('rotated');
    }, 400); // Animasyon süresi

    // Metin kutularının ve dillerin yerini değiştir
    const tempText = sourceTextarea.value;
    sourceTextarea.value = targetTextarea.value;
    targetTextarea.value = tempText;

    const tempLang = sourceLangLabel.textContent;
    sourceLangLabel.textContent = targetLangLabel.textContent;
    targetLangLabel.textContent = tempLang;

    // Metinleri değiştirdikten sonra çeviri işlemini yeniden başlat
    translateText(sourceTextarea.value);
});

// Sesli Okuma (Text-to-Speech) Fonksiyonu
function speakText(text, lang) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang; // Dil kodunu ayarla (ör: 'en-US' veya 'tr-TR')
        speechSynthesis.speak(utterance);
    } else {
        alert("Üzgünüm, tarayıcınız bu özelliği desteklemiyor.");
    }
}

listenSourceButton.addEventListener('click', () => {
    // Kaynak dilin kodunu belirle (Örnek: "İNGİLİZCE" -> "en-US")
    const langCode = sourceLangLabel.textContent === 'İNGİLİZCE' ? 'en-US' : 'tr-TR';
    speakText(sourceTextarea.value, langCode);
});

listenTargetButton.addEventListener('click', () => {
    // Hedef dilin kodunu belirle
    const langCode = targetLangLabel.textContent === 'TÜRKÇE' ? 'tr-TR' : 'en-US';
    speakText(targetTextarea.value, langCode);
});

// Çeviri Kopyalama Butonu
copyTargetButton.addEventListener('click', () => {
    targetTextarea.select();
    document.execCommand('copy');
    alert('Çeviri kopyalandı!');
});

// Çeviri İşlevini Gerçekleştiren Fonksiyon (LibreTranslate API Entegrasyonu)
async function translateText(text) {
    if (text.trim() === '') {
        targetTextarea.value = '';
        return;
    }

    const sourceLang = sourceLangLabel.textContent === 'İNGİLİZCE' ? 'en' : 'tr';
    const targetLang = targetLangLabel.textContent === 'TÜRKÇE' ? 'tr' : 'en';

    targetTextarea.value = 'Çevriliyor...';

    try {
        const response = await fetch('https://translate.argosopentech.com/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const data = await response.json();
        targetTextarea.value = data.translatedText;

    } catch (error) {
        console.error('Çeviri sırasında bir hata oluştu:', error);
        targetTextarea.value = 'Hata: Çeviri yapılamadı. Lütfen internet bağlantınızı kontrol edin.';
    }
}
