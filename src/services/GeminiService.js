
// TODO: User needs to provide their API Key here
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

// Gemini 2.0 Flash Update
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const GeminiService = {
    /**
     * Parses a natural language procurement request using Google Gemini 2.0 Flash.
     * @param {string} userText - The user's raw input (e.g., "500 torba çimento lazım").
     * @returns {Promise<Object>} - Structured JSON data.
     */
    parseProcurementRequest: async (userText) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('Gemini API Key missing. Falling back to simulation.');
            throw new Error('API_KEY_MISSING');
        }

        const systemPrompt = `
        Sen, "CepteŞef" isimli usta bir İnşaat Malzemesi Uzmanı ve Danışmanısın.
        Amacın sadece kullanıcının girdiği malzemeyi parse etmek değil; onlara değer katmak, eksiklerini sormak veya daha iyi alternatifler önermektir.
        
        Aşağıdaki JSON şemasını DİKKATLİCE doldurmalısın:
        {
            "category": "string (Örn: 'Beton', 'Asansör', 'Tuğla', 'Seramik')",
            "quantity": number,
            "unit": "string (Örn: 'm3', 'ton', 'adet')",
            "location": "string (Eğer metinde geçmiyorsa 'Belirtilmedi')",
            "ai_notes": "string (BURASI ÇOK ÖNEMLİ! Bu alana kullanıcıya doğrudan, bir uzman gibi hitap ederek Türkçe bir tavsiye veya soru yaz. Örneğin: kullanıcı Tuğla istiyorsa, 'Son dönemde Ytong fiyatları çok avantajlı, alternatif olarak değerlendirmek ister misiniz?' de. Asansör istiyorsa 'Asansör için kaç kişilik ve kaç duraklık bir sistem arıyorsunuz? Standart mı yoksa özel mi?' diye sor. Poz no girmişse detayını açıklayıp, rektifiyeli mi sırsız mı tercih ettiğini sor.)"
        }

        Kullanıcı girdisini analiz et ve her zaman "ai_notes" kısmında faydalı bir uzman yönlendirmesi ya da teknik detay sorusu üret.
        Kullanıcı Girdisi: "${userText}"
        `;

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Gemini API Error');
            }

            const data = await response.json();
            const rawText = data.candidates[0].content.parts[0].text;

            // Extract JSON from the response (remove Markdown code blocks if present)
            const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedResult = JSON.parse(jsonString);

            return parsedResult;

        } catch (error) {
            console.error('Gemini Service Error:', error);
            throw error;
        }
    }
};
