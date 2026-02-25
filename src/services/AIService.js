import { GeminiService } from './GeminiService';

// Mock Data for Simulation Mode
const MOCK_CATEGORIES = {
    'beton': { category: 'Hazır Beton', unit: 'm3' },
    'çimento': { category: 'Çimento', unit: 'torba' },
    'demir': { category: 'İnşaat Demiri', unit: 'ton' },
    'tuğla': { category: 'Tuğla', unit: 'adet' },
    'boya': { category: 'Boya', unit: 'lt' },
    'seramik': { category: 'Seramik', unit: 'm2' },
    'parke': { category: 'Parke', unit: 'm2' },
    'asansör': { category: 'Asansör', unit: 'adet' },
};

const MOCK_EQUIPMENT = {
    'beton': ['Beton Pompası', 'Transmikser'],
    'asansör': ['Montaj Ekibi', 'Vinç'],
};

export const AIService = {

    /**
     * Parses natural language text into structured procurement data.
     * Tries Google Gemini AI first; falls back to simulation if parsing fails or key is missing.
     * @param {string} text - User's raw input
     * @returns {Promise<Object>} - Structured data
     */
    parseRequest: async (text) => {
        // 1. Try Real AI (Gemini)
        try {
            console.log('Attempting Gemini AI analysis...');
            const aiResult = await GeminiService.parseProcurementRequest(text);
            return aiResult;
        } catch (error) {
            console.log('Gemini AI failed or key missing, falling back to simulation:', error.message);
            // Fall through to simulation logic...
        }

        // 2. Simulation Logic (Fallback)
        console.log('Running Simulation Fallback...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerText = text.toLowerCase();
        let detectedCategory = 'Genel Malzeme';
        let detectedUnit = 'adet';
        let detectedQuantity = null;
        let detectedUrgency = 'Normal';
        let aiAdvice = "Talebinizi aldık. İlgili tedarikçilerin size en iyi teklifi verebilmesi için ilanınızı onaylayarak markete gönderebilirsiniz.";

        // Akıllı Danışman Simülasyonu
        if (lowerText.includes('tuğla')) {
            detectedCategory = 'Tuğla';
            aiAdvice = "Tuğla siparişi vermek istediğinizi görüyorum. Ancak son dönemde Ytong (Gazbeton) fiyatları oldukça avantajlı ve yalıtım açısından daha iyi olabilir. İlanınızı tuğla yerine ytong olarak revize etmek ister misiniz?";
        } else if (lowerText.includes('asansör')) {
            detectedCategory = 'Asansör';
            aiAdvice = "Asansör talebinizi aldım. Lakin satıcıların net fiyat verebilmesi için kaç kişilik olacağı, kaç durak olacağı ve kabin tipi gibi detayları ilana eklemelisiniz.";
        } else if (lowerText.includes('seramik') || lowerText.match(/\d{2}\.\d{3}\.\d{4}/)) {
            detectedCategory = 'Seramik / İnce Yapı';
            aiAdvice = "Seramik/Poz No talebinizi inceledim. Lütfen talebinize ürünün rektifiyeli mi, sırsız mı olduğu ve kalınlık (mm) bilgisini de ekleyin ki firmalar size doğru teklifi atabilsin.";
        } else if (lowerText.includes('beton')) {
            detectedCategory = 'Hazır Beton';
            aiAdvice = "Beton dökümü için pompa isteyip istemediğinizi veya 'C30' gibi bir dayanım sınıfını detaylarda belirtirseniz fiyatlar daha doğru gelecektir.";
        }

        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            detectedQuantity = numbers[0];
        }

        if (lowerText.includes('acil') || lowerText.includes('hemen') || lowerText.includes('yarın')) {
            detectedUrgency = 'Yüksek (Acil)';
        }

        return {
            category: detectedCategory,
            quantity: detectedQuantity,
            unit: detectedUnit,
            location: 'Belirtilmedi',
            ai_notes: aiAdvice
        };
    }
};
