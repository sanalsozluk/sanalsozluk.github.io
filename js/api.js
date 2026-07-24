// ===============================
// Supabase Bağlantısı
// ===============================
const SUPABASE_URL = 'https://difalookxdbxfxzccled.supabase.co';
const SUPABASE_KEY = 'sb_publishable_G10Fsdt377JuxE7aj5zWcw_L4mrlMPo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Api = {

    async getWord(word) {

        if (!word || !word.trim()) return { aranan: word, maddeler: [] };

        // SQL şemasına tam uyumlu ilişkisel ve iki yönlü Supabase sorgusu
        const { data: kelimelerData, error: kelimelerHata } = await supabaseClient
            .from('kelimeler')
            .select(`
                id,
                madde,
                kok,
                sira,
                guncelleme_tarihi,
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
                ),
                obek_iliskileri:kelime_iliskileri!obek_id (
                    bilesen:kelimeler!bilesen_id (
                        id,
                        madde
                    )
                ),
                bilesen_iliskileri:kelime_iliskileri!bilesen_id (
                    obek:kelimeler!obek_id (
                        id,
                        madde
                    )
                )
            `)
            .ilike('madde', word.trim())
            .order('sira', { ascending: true });


        if (kelimelerHata) {
            console.error("Veritabanı sorgu hatası:", kelimelerHata);
            return { aranan: word, maddeler: [] };
        }

        if (!kelimelerData || kelimelerData.length === 0) {
            return { aranan: word, maddeler: [] };
        }

        // Veritabanı çıktısını arayüzün beklediği yapıya dönüştürme
        const maddeler = kelimelerData.map(satir => {

            // 1. Telaffuz ve heceleme verisini işleme
            const ilkTelaffuz = satir.telaffuzlar?.[0] || null;
            const rawHece = ilkTelaffuz?.heceleme;
            
            // Heceleme metnini noktalardan veya çizgilerden ayırıp diziye dönüştürme
            const hecelemeListesi = rawHece 
                ? rawHece.split(/[\s·\-,]+/).filter(Boolean)
                : [];

            // 2. Anlamları ve bağlı ilişkisel verileri işleme
            const hamAnlamlar = (satir.anlamlar || []).sort((a, b) => a.sira - b.sira);

            // Aranan kelime bir söz öbeği ise, onu oluşturan alt bileşenler
            const bilesenler = (satir.obek_iliskileri || []).map(iliski => ({
                id: iliski.bilesen?.id,
                madde: iliski.bilesen?.madde
            })).filter(b => b.id); // Boş gelenleri temizleme
            
            // Aranan kelimenin içinde geçtiği büyük söz öbekleri
            const soz_obekleri = (satir.bilesen_iliskileri || []).map(iliski => ({
                id: iliski.obek?.id,
                madde: iliski.obek?.madde
            })).filter(o => o.id); // Boş gelenleri temizleme

            const anlamlar = hamAnlamlar.map(anlam => {
                const etiketler = (anlam.anlam_etiketleri || [])
                    .map(item => item.etiket?.ad)
                    .filter(Boolean);

                const ornekler = (anlam.ornekler || [])
                    .map(item => item.ornek)
                    .filter(Boolean);

                return {
                    id: anlam.id,
                    sira: anlam.sira,
                    tanim: anlam.tanim,
                    etiketler: etiketler,
                    ornekler: ornekler,
                };
            });

            return {
                id: satir.id,
                sira: satir.sira,
                kelime: satir.madde,
                kok: satir.kok,
                guncelleme_tarihi: satir.guncelleme_tarihi,

                tur: {
                    id: satir.tur?.id ?? null,
                    ad: satir.tur?.ad ?? ""
                },

                bilesenler: bilesenler,
                soz_obekleri: soz_obekleri, // Yeni eklenen veri alanı

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
    },

    async search(text) {
        if (!text || text.trim().length < 2)
            return [];

        const { data, error } = await supabaseClient
            .from("kelimeler")
            .select(`
                id,
                madde,
                sira,
                kok,
                guncelleme_tarihi,
                tur:turler (
                    id,
                    ad
                )
            `)
            .ilike("madde", text.trim() + "%")
            .order("madde")
            .order("sira")
            .limit(14);

        if (error) {
            console.error(error);
            return [];
        }

        return data.map(k => ({
            id: k.id,
            kelime: k.madde,
            sira: k.sira,
            kok: k.kok,
            guncelleme_tarihi: k.guncelleme_tarihi,
            tur: {
                id: k.tur?.id ?? null,
                ad: k.tur?.ad ?? ""
            }
        }));
    },
};