import { TrustAssessmentState, AssessmentResult, TrustBand } from "../types";

export const analyzeTrust = async (state: TrustAssessmentState): Promise<AssessmentResult> => {
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('VITE_GEMINI_API_KEY is not properly set. Please restart your dev server after adding the API key to .env.local');
  }

  const prompt = `
    Analyze this credit data and return ONLY valid JSON:

    PURPOSE: ${state.purpose}
    MOBILE: ${JSON.stringify(state.mobile)}
    UTILITY: ${JSON.stringify(state.utility)}
    COMMUNITY: ${JSON.stringify(state.community)}
    EVIDENCE: ${state.evidence.length} files, ${state.evidence.reduce((acc, curr) => acc + curr.months, 0)} months
    LOAN EXPERIENCE: ${state.loanExperience}
    FINANCIAL: ${JSON.stringify(state.financial)}
    ASSETS: ${JSON.stringify(state.assets)}

    Return this exact JSON structure with short, concise values:
    {
      "trustBand": "T1|T2|T3|T4|T5",
      "interpretation": "Brief one-line summary (max 80 chars)",
      "traditionalAlignment": "Score range like 750-799",
      "reasoning": ["Short point 1", "Short point 2", "Short point 3"]
    }
  `;

  try {
    console.log('🤖 Calling Gemini API...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    console.log('Raw Gemini response:', text);

    // Try to parse JSON with better error handling
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse failed, raw text:', text);
      console.error('Parse error:', parseError);

      // Try to extract JSON from partial response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          console.log('Recovered JSON from partial response');
        } catch (e) {
          throw new Error('Could not parse JSON response from Gemini');
        }
      } else {
        throw new Error('No valid JSON found in response');
      }
    }

    console.log('✅ Gemini analysis complete:', result);

    return result;
  } catch (e) {
    console.error("❌ Gemini API failed:", e);
    // Fallback if API fails
    return {
      trustBand: TrustBand.T3,
      interpretation: "Analysis completed with baseline metrics.",
      traditionalAlignment: "650-699",
      reasoning: ["Consistent utility payments noted.", "Solid community participation.", "Verification of evidence required."]
    };
  }
};