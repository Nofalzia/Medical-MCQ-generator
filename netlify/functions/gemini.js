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

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: "Invalid JSON" };
  }
  
  const prompt = payload.contents?.[0]?.parts?.[0]?.text;
  let failures = [];

  // 1. Try Groq first
  if (GROQ_API_KEY && prompt) {
    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY.trim()}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      const groqData = await groqResponse.json();

      if (groqResponse.ok) {
        const text = groqData.choices[0].message.content;
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ candidates: [{ content: { parts: [{ text: text }] } }] })
        };
      } else {
        failures.push(`Groq Error (${groqResponse.status}): ${groqData.error?.message || 'Unknown'}`);
      }
    } catch (error) {
      failures.push(`Groq Exception: ${error.message}`);
    }
  }

  // 2. Fallback to Gemini
  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: event.body
      });

      const data = await response.json();

      if (response.ok) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(data)
        };
      } else {
        failures.push(`Gemini Error (${response.status}): ${data.error?.message || 'Unknown'}`);
      }
    } catch (error) {
      failures.push(`Gemini Exception: ${error.message}`);
    }
  }

  // Final failure report
  let missing = [];
  if (!GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!GROQ_API_KEY)   missing.push("GROQ_API_KEY");
  if (!prompt)         missing.push("Prompt/Payload");

  let errorMsg = "All AI models failed.";
  if (missing.length > 0) {
    errorMsg = `Configuration Error: Missing ${missing.join(", ")}. Please check Netlify Environment Variables.`;
  } else if (failures.length > 0) {
    errorMsg = `API Failures: ${failures.join(" | ")}`;
  }

  return { 
    statusCode: 500, 
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ error: { message: errorMsg } }) 
  };
};
