// ===============================
// Supabase Bağlantısı
// ===============================
const SUPABASE_URL = 'https://difalookxdbxfxzccled.supabase.co';
const SUPABASE_KEY = 'sb_publishable_G10Fsdt377JuxE7aj5zWcw_L4mrlMPo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Api = {

    async getWord(word) {

        if (!word || !word.trim()) return { aranan: word, maddeler: [] };

        // SQL şemasına tam uyumlu ilişkisel Supabase sorgusu
        const { data: kelimelerData, error: kelimelerHata } = await supabaseClient
            .from('kelimeler')
            .select(`
                id,
                madde,
                sira,
                tur:turler ( id, ad ),
                koken:kokenler (
                    id,
                    aciklama,
                    dil:diller ( id, ad, kisaltma )
                ),
                telaffuzlar (
                    ipa,
                    heceleme,
                    ses_dosyasi
                ),
                anlamlar (
                    id,
                    sira,
                    tanim,
                    ornekler ( id, ornek, kaynak ),
                    anlam_etiketleri (
                        etiket:etiketler ( id, ad )
                    )
                )
            `)
            .ilike('madde', word.trim())
            .order('sira', { ascending: true });

        console.log("Hata:", kelimelerHata);
        console.log("Veri:", kelimelerData);
        console.log(JSON.stringify(word));

        if (kelimelerHata) {
            console.error("Veritabanı sorgu hatası:", kelimelerHata);
            return { aranan: word, maddeler: [] };
        }

        if (!kelimelerData || kelimelerData.length === 0) {
            return { aranan: word, maddeler: [] };
        }

        // Veritabanı çıktısını arayüzün (renderMadde / olusturSekmeler) beklediği formata dönüştürme
        const maddeler = kelimelerData.map(satir => {

            // 1. Telaffuz ve heceleme verisini işleme
            const ilkTelaffuz = satir.telaffuzlar?.[0] || null;
            const rawHece = ilkTelaffuz?.heceleme;
            
            // Heceleme metnini noktalardan/çizgilerden ayırıp diziye dönüştürme
            const hecelemeListesi = rawHece 
                ? rawHece.split(/[\s·\-,]+/).filter(Boolean)
                : [];

            // 2. Anlamları ve bağlı ilişkisel verileri (etiketler, örnekler) işleme
            const hamAnlamlar = (satir.anlamlar || []).sort((a, b) => a.sira - b.sira);
            
            const anlamlar = hamAnlamlar.map(anlam => {
                // anlam_etiketleri üzerinden etiket adlarını çekme
                const etiketler = (anlam.anlam_etiketleri || [])
                    .map(item => item.etiket?.ad)
                    .filter(Boolean);

                // ornekler tablosundan örnek metinlerini çekme
                const ornekler = (anlam.ornekler || [])
                    .map(item => item.ornek)
                    .filter(Boolean);

                return {
                    id: anlam.id,
                    sira: anlam.sira,
                    tanim: anlam.tanim,
                    etiketler: etiketler,
                    ornekler: ornekler
                };
            });

            return {
                id: satir.id,
                sira: satir.sira,
                kelime: satir.madde,

                tur: {
                    id: satir.tur?.id ?? null,
                    ad: satir.tur?.ad ?? ""
                },

                // Kelime seviyesinde etiket tablosu DDL içinde bulunmuyor, boş dizi dönülüyor
                etiketler: [],

                telaffuz: {
                    ipa: ilkTelaffuz?.ipa ?? null,
                    ses: ilkTelaffuz?.ses_dosyasi ?? null
                },

                heceleme: hecelemeListesi,

                koken: {
                    dil: satir.koken?.dil?.ad ?? "",
                    kisa: satir.koken?.dil?.kisaltma || satir.koken?.dil?.ad || "",
                    aciklama: satir.koken?.aciklama ?? ""
                },

                anlamlar: anlamlar
            };
        });

        return { aranan: word, maddeler };

    }

};