// Netlify Serverless Function: Gemini API Proxy
// 클라이언트에서 API Key를 숨기고 서버에서 Gemini API를 호출합니다.

exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // OPTIONS 요청 (CORS preflight) 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // POST 요청만 허용
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 요청 본문 파싱
    const { prompt } = JSON.parse(event.body);

    if (!prompt || typeof prompt !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid prompt' })
      };
    }

    // Netlify 환경 변수에서 API Key 가져오기
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API Key not configured' })
      };
    }

    // System Prompt 정의
    const systemPrompt = `당신은 댄서 섭외 요구사항을 분석하는 전문가입니다.

[출력 형식]
{
  "hardFilters": {
    "gender": "male" | "female" | null,
    "heightCm": {"min": number | null, "max": number | null},
    "hairColor": string | null,
    "kidsFriendly": boolean | null,
    "actingMin": number | null,
    "singingMin": number | null,
    "sfxMakeupOk": boolean | null,
    "cosplayExperience": boolean | null,
    "horrorReady": boolean | null,
    "gamerNerd": boolean | null
  },
  "softScores": {
    "tag_fresh": 0.0 ~ 1.0,
    "tag_dark": 0.0 ~ 1.0,
    "tag_sexy": 0.0 ~ 1.0,
    "tag_cute": 0.0 ~ 1.0,
    "tag_elegant": 0.0 ~ 1.0,
    "tag_trendy": 0.0 ~ 1.0,
    "tag_classic": 0.0 ~ 1.0,
    "tag_experimental": 0.0 ~ 1.0,
    "tag_commercial": 0.0 ~ 1.0,
    "tag_athletic": 0.0 ~ 1.0,
    "tag_slim": 0.0 ~ 1.0,
    "tag_tall": 0.0 ~ 1.0,
    "tag_young": 0.0 ~ 1.0,
    "tag_mature": 0.0 ~ 1.0,
    "tag_technical": 0.0 ~ 1.0,
    "tag_powerful": 0.0 ~ 1.0,
    "tag_soft": 0.0 ~ 1.0,
    "tag_energetic": 0.0 ~ 1.0,
    "tag_calm": 0.0 ~ 1.0,
    "tag_street": 0.0 ~ 1.0
  }
}

[규칙]
1. 순수 JSON만 출력 (마크다운 없음)
2. hardFilters: 필수 조건 (불만족 시 제외)
3. softScores: 선호 가중치 (0.0~1.0)
4. 키워드 매핑:
   - "여성/여자/female" → gender: female
   - "남성/남자/male" → gender: male
   - "키 183 이상" → heightCm.min: 183
   - "금발/블론드" → hairColor: "blonde"
   - "어린이/키즈" → kidsFriendly: true
   - "연기력" → actingMin: 70 (0-100)
   - "코스프레" → cosplayExperience: true
   - "공포/호러" → horrorReady: true
   - "게이머" → gamerNerd: true`;

    // Gemini API 호출
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: `\n\n[사용자 요구사항]\n${prompt}` }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return {
        statusCode: geminiResponse.status,
        headers,
        body: JSON.stringify({ 
          error: 'Gemini API failed', 
          details: errorText 
        })
      };
    }

    const geminiData = await geminiResponse.json();
    
    // 응답에서 텍스트 추출
    const textResponse = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!textResponse) {
      console.error('Empty response from Gemini:', geminiData);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Empty response from Gemini' })
      };
    }

    // JSON 파싱 (마크다운 코드 블록 제거)
    let cleanedText = textResponse.trim();
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', textResponse);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to parse Gemini response',
          raw: textResponse
        })
      };
    }

    // 성공 응답
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        result: parsedResult,
        raw: textResponse
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
