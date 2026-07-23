function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);

    // Durum 1: 404.html'den köke "?redirect=..." ile gelindi
    const yonlendirilenYol = params.get("redirect");
    if (yonlendirilenYol) {
        window.history.replaceState(null, "", yonlendirilenYol);
    }
    // Durum 2: 404.html'den /s/index.html'e "?kelime=..." ile gelindi
    else if (params.has("kelime")) {
        const kelime = params.get("kelime");
        const hash = window.location.hash;
        window.history.replaceState(null, "", "/s/" + encodeURIComponent(kelime) + hash);
    }

    // Yönlendirmeler bitti, güncel adresten kelimeyi alıyoruz
    const kelime = Url.getWord();

    if (kelime) {
        kelimeVerisiniGetir(kelime);
    } else {
        // Kelime yoksa ve anasayfadaysak sahte veriyi (veya varsayılan durumu) yükle
        olusturSekmeler(apiDummyData);
    }
}

// Kelimeyi API'den çekip arayüzü günceller
async function kelimeVerisiniGetir(kelime) {
    const veri = await Api.getWord(kelime);

    if (!veri || !veri.maddeler || veri.maddeler.length === 0) {
        // Kelime veritabanında bulunamadığında arayüzü temizleme (Veri sızıntısını önleme)
        document.getElementById("entry-selector").classList.add("hidden");
        document.getElementById("overview-page").style.display = "none";
        document.getElementById("scroll-spy-nav").style.display = "none";
        
        document.getElementById("entry-page").style.display = "";
        
        // Başlığı bulunamadı olarak güncelle
        document.querySelector("[data-api='word-title']").textContent = `"${kelime}" bulunamadı`;
        
        // Önceki kelimeden kalan bilgi kırıntılarını temizle
        document.querySelector("[data-api='grammar-info']").textContent = "";
        document.querySelector("[data-api='pronunciation']").textContent = "";
        document.querySelector("[data-api='syllables']").textContent = "";
        document.querySelector("[data-api='etymology-short']").textContent = "";
        document.querySelector("[data-api='etymology-detailed']").textContent = "";
        document.getElementById("meanings-container").innerHTML = "";
        
        return;
    }

    olusturSekmeler(veri);
}

// window.onload atamasını ezip geçmek yerine standart olay dinleyicisi kullanıldı
window.addEventListener("load", loadFromUrl);