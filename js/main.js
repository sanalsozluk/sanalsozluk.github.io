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

    const entrySelector = document.getElementById("entry-selector");
    const overviewPage = document.getElementById("overview-page");
    const entryPage = document.getElementById("entry-page");
    const notFoundPage = document.getElementById("not-found-page");
    const scrollSpyNav = document.getElementById("scroll-spy-nav");
    const rightSidebar = document.getElementById("right-sidebar");

    // KELİME BULUNAMADI DURUMU
    if (!veri || !veri.maddeler || veri.maddeler.length === 0) {
        // İlgisiz tüm panelleri gizle
        if (entrySelector) entrySelector.classList.add("hidden");
        if (overviewPage) overviewPage.style.display = "none";
        if (entryPage) entryPage.style.display = "none";
        if (scrollSpyNav) scrollSpyNav.style.display = "none";
        if (rightSidebar) rightSidebar.style.display = "none";

        // Bulunamadı kartındaki metni dinamik doldur ve görünür yap
        const notFoundWordEl = document.getElementById("not-found-word");
        if (notFoundWordEl) notFoundWordEl.textContent = `"${kelime}"`;
        if (notFoundPage) notFoundPage.style.display = "block";
        
        return; // İşlev burada sonlanır, aşağıdaki kodlar çalışmaz.
    }

    // KELİME BULUNDU DURUMU
    
    // 1. Önce hata ekranını gizle
    if (notFoundPage) notFoundPage.style.display = "none";

    // 2. Gizlediğin tüm yapıları css varsayılanlarına döndür (sıfırla)
    // style.display içine "" (boş metin) atamak, satır içi stili siler ve css dosyasındaki kuralların geçerli olmasını sağlar.
    if (rightSidebar) rightSidebar.style.display = "";
    if (scrollSpyNav) scrollSpyNav.style.display = "";
    if (overviewPage) overviewPage.style.display = "";
    if (entryPage) entryPage.style.display = "";
    
    // 3. Sekme seçiciye eklediğin gizleme sınıfını kaldır
    if (entrySelector) entrySelector.classList.remove("hidden");

    // 4. Verileri arayüze bas
    olusturSekmeler(veri);
}

// window.onload atamasını geçmek yerine standart olay dinleyicisi kullanıldı
window.addEventListener("load", loadFromUrl);