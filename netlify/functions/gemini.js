exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed" 
    };
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const payload = JSON.parse(event.body);
  const prompt = payload.contents?.[0]?.parts?.[0]?.text;

  // 1. Try Groq first (as requested by user)
  if (GROQ_API_KEY && prompt) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        const text = groqData.choices[0].message.content;
        
        // Format as Gemini response for frontend compatibility
        return {
          statusCode: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            candidates: [{ content: { parts: [{ text: text }] } }]
          })
        };
      }
      console.warn(`Groq failed with status ${groqResponse.status}. Trying Gemini fallback...`);
    } catch (error) {
      console.warn(`Groq error: ${error.message}. Trying Gemini fallback...`);
    }
  }

  // 2. Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body
      });

      if (response.ok) {
        const data = await response.json();
        return {
          statusCode: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(data)
        };
      }
    } catch (error) {
      return { 
        statusCode: 500, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: { message: `All AI models failed: ${error.message}` } }) 
      };
    }
  }

  return { 
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: { message: "No API keys configured or request invalid" } }) 
  };
};
