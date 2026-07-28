export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { mensaje } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = "Eres el camarero de la Pizzería Plaza en España. Sé breve, amable y directo. Responde a este cliente: " + mensaje;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    const respuestaIA = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ respuesta: respuestaIA });
    
  } catch (error) {
    return res.status(500).json({ error: "Error en el servidor o clave inválida." });
  }
}
