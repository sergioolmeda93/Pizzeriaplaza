export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  console.log("➡️ PASO 1: Petición recibida en Vercel");

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    const mensaje = body?.mensaje;
    
    console.log("➡️ PASO 2: Mensaje del usuario:", mensaje);

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("➡️ PASO 3: ¿Encuentra la API Key de Vercel?:", apiKey ? "SÍ ✅" : "NO ❌");

    if (!apiKey) {
      return res.status(500).json({ error: "Falta configurar la clave en Vercel." });
    }

    const prompt = "Eres el camarero de la Pizzería Plaza en España. Sé breve, amable y directo. Responde a este cliente: " + (mensaje || "Hola");

    console.log("➡️ PASO 4: Enviando datos a Google...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    console.log("➡️ PASO 5: Respuesta de Google:", JSON.stringify(data));

    if (data.error) {
      return res.status(500).json({ error: "Google rechazó la clave: " + data.error.message });
    }

    const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    console.log("➡️ PASO 6: Todo éxito. Devolviendo a la web.");
    return res.status(200).json({ respuesta: respuestaIA });

  } catch (error) {
    console.error("🚨 ERROR CRÍTICO CAPTURADO:", error.message);
    return res.status(500).json({ error: "Fallo interno: " + error.message });
  }
}
