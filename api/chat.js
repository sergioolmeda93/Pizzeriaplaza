export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const mensaje = body?.mensaje;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta configurar la clave en Vercel." });
    }

    const prompt = "Eres el camarero de la Pizzería Plaza en España. Sé breve, amable y directo. Responde a este cliente: " + (mensaje || "Hola");
    
    // Aquí está el cambio definitivo: usamos el modelo estándar gemini-pro
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: "Google dice: " + (data.error.message || JSON.stringify(data.error)) });
    }

    const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text || "No he podido generar una respuesta.";
    return res.status(200).json({ respuesta: respuestaIA });

  } catch (error) {
    return res.status(500).json({ error: "Fallo interno: " + error.message });
  }
}
