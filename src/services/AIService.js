import { supabase } from '../lib/supabase';

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
     * Simulates AI parsing of natural language text into structured procurement data.
     * In production, this would call an OpenAI/LLM endpoint.
     * @param {string} text - User's raw input
     * @returns {Promise<Object>} - Structured data
     */
    parseRequest: async (text) => {
        // Simulate network delay for "Thinking..." effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerText = text.toLowerCase();
        let detectedCategory = 'Genel Malzeme';
        let detectedUnit = 'adet';
        let detectedQuantity = null;
        let detectedUrgency = 'Normal';
        let detectedEquipment = [];

        // 1. Keyword Extraction for Category
        for (const [key, value] of Object.entries(MOCK_CATEGORIES)) {
            if (lowerText.includes(key)) {
                detectedCategory = value.category;
                detectedUnit = value.unit;

                // Add related equipment if any
                if (MOCK_EQUIPMENT[key]) {
                    detectedEquipment = MOCK_EQUIPMENT[key];
                }
                break;
            }
        }

        // 2. Simple Quantity Extraction (finds number before unit or first number)
        const numbers = text.match(/\d+/g);
        if (numbers && numbers.length > 0) {
            detectedQuantity = numbers[0];
        }

        // 3. Urgency Detection
        if (lowerText.includes('acil') || lowerText.includes('hemen') || lowerText.includes('yarın')) {
            detectedUrgency = 'Yüksek (Acil)';
        }

        return {
            category: detectedCategory,
            item: detectedCategory, // Simplification
            quantity: detectedQuantity,
            unit: detectedUnit,
            urgency: detectedUrgency,
            requirements: detectedEquipment,
            ai_confidence: 0.95, // Fake confidence score
            ai_notes: `Talep içeriğinden "${detectedCategory}" kategorisi tespit edildi.`
        };
    },

    /**
     * Findings matching suppliers for a given request.
     * Uses a simple tagging/category logic + randomization for demo.
     */
    findMatches: async (requestId, parsedData) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // 1. Get Sellers (Profiles with 'corporate' type or 'is_contractor' false)
            // Ideally we'd filter by category tags, but for now we'll fetch general sellers
            const { data: sellers, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_type', 'corporate')
                .limit(5);

            if (error) throw error;

            if (!sellers || sellers.length === 0) return [];

            // 2. Calculate "Match Score" simulation
            const matches = sellers.map(seller => {
                // Random score between 70 and 99 for demo effect
                const score = Math.floor(Math.random() * (99 - 70 + 1)) + 70;

                // Determine badges based on score
                const reasons = [];
                if (score > 90) reasons.push('Yüksek Stok Kapasitesi');
                if (score > 85) reasons.push('Bölge Uzmanı');
                if (Math.random() > 0.5) reasons.push('Hızlı Teslimat');

                return {
                    request_id: requestId,
                    seller_id: seller.id,
                    match_score: score,
                    match_reasons: reasons,
                    seller_info: { // Return seller info for UI display without joining
                        full_name: seller.full_name,
                        avatar_url: seller.avatar_url,
                        rating: (4 + Math.random()).toFixed(1) // Fake rating 4.0 - 5.0
                    }
                };
            });

            // Sort by score
            matches.sort((a, b) => b.match_score - a.match_score);

            // 3. (Optional) In real app, we would insert into market_ai_matches here
            // await supabase.from('market_ai_matches').insert(matches.map(m => ({
            //     request_id: m.request_id,
            //     seller_id: m.seller_id,
            //     match_score: m.match_score,
            //     match_reasons: m.match_reasons
            // })));

            return matches;

        } catch (error) {
            console.error('Error finding matches:', error);
            return [];
        }
    },

    /**
     * Saves the confirmed request to the database
     */
    createRequest: async (userId, originalText, parsedData) => {
        const { data, error } = await supabase
            .from('market_ai_requests')
            .insert({
                user_id: userId,
                original_text: originalText,
                parsed_data: parsedData,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
