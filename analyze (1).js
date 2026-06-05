exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: { message: 'Service temporairement indisponible. Merci de contacter peter7nance@gmail.com' } })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Convertir le format Anthropic vers OpenAI
    const openaiBody = {
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: body.system },
        ...body.messages
      ]
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(openaiBody)
    });

    const data = await response.json();

    // Convertir la réponse OpenAI vers le format Anthropic attendu par le front-end
    const converted = {
      content: [
        { type: 'text', text: data.choices?.[0]?.message?.content || '' }
      ]
    };

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(converted)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'Erreur serveur : ' + err.message } })
    };
  }
};
