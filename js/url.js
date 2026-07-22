// ===============================
// TDSS URL Yöneticisi
// ===============================

const Url = {

    // Geçerli kelimeyi döndürür
    getWord() {

        const parts = window.location.pathname.split("/").filter(Boolean);

        const index = parts.indexOf("s");

        if (index === -1) return null;

        return decodeURIComponent(parts[index + 1] || "");

    },

    // Geçerli madde numarası (#1, #2...)
    getEntry() {

        if (!window.location.hash) return null;

        return parseInt(window.location.hash.substring(1));

    },

    // URL'yi değiştir (geri tuşuna ekler)
    go(word, entry = null) {

        let url = "/s/" + encodeURIComponent(word);

        if (entry)
            url += "#" + entry;

        history.pushState({}, "", url);

    },

    // URL'yi değiştir (geri tuşuna eklemez)
    replace(word, entry = null) {

        let url = "/s/" + encodeURIComponent(word);

        if (entry)
            url += "#" + entry;

        history.replaceState({}, "", url);

    }

};


// Tarayıcı geri/ileri tuşları
window.addEventListener("popstate", () => {

    if (typeof loadFromUrl === "function")
        loadFromUrl();

});