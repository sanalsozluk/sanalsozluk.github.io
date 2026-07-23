// ===============================
// TDSS URL Yöneticisi
// ===============================

// Uygulamanın çalıştığı kök dizini (GitHub Pages vb. barındırma hizmetleri için)
// Eğer doğrudan alan adındaysan bunu "" olarak bırakabilirsin.
// Alt dizindeysen (örneğin site.com/sozluk/) "/sozluk" yapmalısın.
const KOK_DIZIN = "";

const Url = {
    // Geçerli kelimeyi döndürür
    getWord() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const index = parts.indexOf("s");

        if (index === -1) return null;

        const islenmemisKelime = parts[index + 1] || "";
        
        try {
            return decodeURIComponent(islenmemisKelime);
        } catch (hata) {
            // Bozuk URL kodlaması geldiğinde uygulamayı çökmekten kurtarır
            console.error("Bağlantı metni çözümlenemedi:", hata);
            return null;
        }
    },

    // Geçerli madde numarası (#1, #2...)
    getEntry() {
        if (!window.location.hash) return null;

        // İlk karakteri atıp onluk tabanda sayıya çevir
        const deger = parseInt(window.location.hash.substring(1), 10);

        // Eğer elde edilen değer NaN (sayı değil) ise null döndür
        return isNaN(deger) ? null : deger;
    },

    // URL'yi değiştir (geri tuşuna ekler)
    go(word, entry = null) {
        let url = KOK_DIZIN + "/s/" + encodeURIComponent(word);
        
        if (entry) {
            url += "#" + entry;
        }

        window.history.pushState({}, "", url);
    },

    // URL'yi değiştir (geri tuşuna eklemez)
    replace(word, entry = null) {
        let url = KOK_DIZIN + "/s/" + encodeURIComponent(word);

        if (entry) {
            url += "#" + entry;
        }

        window.history.replaceState({}, "", url);
    }
};

// Tarayıcı geri/ileri tuşları
window.addEventListener("popstate", () => {
    if (typeof loadFromUrl === "function") {
        loadFromUrl();
    }
});