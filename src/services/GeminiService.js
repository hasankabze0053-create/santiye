
// TODO: User needs to provide their API Key here
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;

export const GeminiService = {
    /**
     * Parses a natural language procurement request using Google Gemini 1.5 Flash.
     * @param {string} userText - The user's raw input (e.g., "500 torba çimento lazım").
     * @returns {Promise<Object>} - Structured JSON data.
     */
    parseProcurementRequest: async (userText) => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('Gemini API Key missing. Falling back to simulation.');
            throw new Error('API_KEY_MISSING');
        }

        const systemPrompt = `
        You are an expert AI Construction Procurement Assistant.
        Your goal is to parse user requests into structured JSON data for a construction marketplace.
        
        Output MUST be a valid JSON object with the following schema:
        {
            "category": "string (e.g., 'Beton', 'Demir', 'Boya')",
            "quantity": number,
            "unit": "string (e.g., 'm3', 'ton', 'adet')",
            "urgency": "string ('Normal', 'Acil', 'Çok Acil')",
            "location": "string (inferred from text or 'Belirtilmedi')",
            "requirements": ["string (e.g., 'Pompalı', 'C30', 'Nakliye Dahil')"],
            "ai_notes": "string (brief expert advice or summary)"
        }

        If the input is unclear, make your best guess for optional fields but keep category accurate.
        User Input: "${userText}"
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
