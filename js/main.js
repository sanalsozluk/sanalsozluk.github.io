async function loadFromUrl() {

    const kelime = Url.getWord();

    const madde = Url.getEntry();

    if (!kelime)
        return;

    // Şimdilik sahte veri
    const veri = await Api.getWord(kelime);

    olusturSekmeler(veri);

    if (madde != null) {

        const btn = document.querySelectorAll(".entry-tab")[madde];

        if (btn)
            btn.click();

    }

}