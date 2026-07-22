function loadFromUrl() {
    // Soru işaretinden sonraki kısmı alıyoruz
    var aranan = window.location.search.substring(1);
    
    if (aranan) {
        // Türkçe harfleri ve boşlukları okunabilir formata dönüştür
        var kelime = decodeURIComponent(aranan);
        
        // Adres çubuğunu kullanıcının görmek istediği yapıya geri çevir
        window.history.replaceState(null, null, "/s/" + kelime);
        
        // Burada veriyi ekrana basacak asıl işlevini çağırmalısın
        // Örneğin: sözlükVerisiniYükle(kelime);
    } else {
        // Doğrudan /s/ adresine girildiyse yapılacak işlem
        console.log("Herhangi bir kelime aranmadı.");
    }
}

window.onload = loadFromUrl;