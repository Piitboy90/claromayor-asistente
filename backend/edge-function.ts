// ============================================
// CLAROMAYOR - ASISTENTE DE LENGUAJE OFICIAL
// Edge Function: claromayor-asistente
// ============================================
// Esta función recibe una pregunta de un mayor sobre
// lenguaje burocrático/oficial y devuelve una explicación
// clara, breve y respetuosa.
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
// CORS permite que tu web (en CodePen, GitHub Pages, etc.)
// pueda llamar a esta función desde otro dominio.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ============================================
// SYSTEM PROMPT - EL "CEREBRO" DE LA APP
// ============================================
// Esto define CÓMO debe responder la IA.
// Este prompt está diseñado específicamente para mayores.

const SYSTEM_PROMPT = `Eres un asistente que ayuda a personas mayores de 65 años a entender el lenguaje oficial, bancario, médico y administrativo de España.

REGLAS ESTRICTAS DE TU RESPUESTA:

1. LENGUAJE:
   - Usa palabras simples y cotidianas
   - Frases cortas (máximo 15 palabras por frase)
   - NUNCA uses tecnicismos sin explicarlos
   - NO uses anglicismos (di "correo" en vez de "email")
   - Trata de "usted" (es la forma respetuosa)

2. ESTRUCTURA DE LA RESPUESTA:
   - Empieza con la respuesta directa en 1 frase
   - Después da un ejemplo concreto si ayuda
   - Termina con un consejo práctico si aplica
   - Máximo 4-5 frases en total

3. TONO:
   - Cálido y respetuoso, nunca condescendiente
   - Como un nieto explicando algo a su abuelo con paciencia
   - Si la persona parece confundida, sé extra clara

4. SI NO ENTIENDES LA PREGUNTA:
   - Pide aclaración de forma amable
   - Sugiere ejemplos de qué podría querer saber
   - NO inventes nunca información

5. TEMAS QUE PUEDES EXPLICAR:
   - Términos bancarios (IBAN, comisión, transferencia, etc.)
   - Vocabulario médico básico (analítica, derivación, receta electrónica)
   - Trámites administrativos (DNI, certificado digital, cita previa)
   - Cartas oficiales y burocracia

6. TEMAS QUE NO DEBES TRATAR:
   - Diagnósticos médicos específicos
   - Asesoramiento legal vinculante
   - Decisiones financieras concretas (qué invertir, etc.)
   En esos casos, recomienda hablar con un profesional de confianza.

EJEMPLO DE BUENA RESPUESTA:

Pregunta del usuario: "¿Qué es una comisión de mantenimiento?"

Tu respuesta:
"Es el dinero que el banco le cobra cada mes solo por tener la cuenta abierta. Por ejemplo, si su banco le quita 15 euros cada mes sin haber hecho nada, eso es la comisión de mantenimiento. Si tiene su pensión domiciliada, puede pedirle al banco que se la quite."`;

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

serve(async (req: Request) => {
  // Manejo de peticiones CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ============================================
    // VALIDACIÓN: Método HTTP
    // ============================================

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Solo se aceptan peticiones POST" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // OBTENER Y PARSEAR BODY
    // ============================================

    let requestBody: { pregunta?: string };

    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "El formato de la petición no es válido" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { pregunta } = requestBody;

    // ============================================
    // VALIDACIÓN: Campo 'pregunta'
    // ============================================

    if (!pregunta || typeof pregunta !== "string") {
      return new Response(
        JSON.stringify({ error: "Por favor, escriba una pregunta" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const preguntaLimpia = pregunta.trim();

    if (preguntaLimpia.length === 0) {
      return new Response(
        JSON.stringify({ error: "La pregunta no puede estar vacía" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (preguntaLimpia.length > 500) {
      return new Response(
        JSON.stringify({ error: "La pregunta es demasiado larga. Por favor, sea más breve." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // OBTENER API KEY DE OPENAI
    // ============================================

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      console.error("❌ OPENAI_API_KEY no está configurada");
      return new Response(
        JSON.stringify({ error: "El servicio no está disponible en este momento" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // LLAMAR A OPENAI API
    // ============================================

    console.log(`📝 Procesando pregunta: "${preguntaLimpia.substring(0, 50)}..."`);

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: preguntaLimpia,
            },
          ],
          max_tokens: 300,
          temperature: 0.5,
        }),
      }
    );

    // ============================================
    // VALIDAR RESPUESTA DE OPENAI
    // ============================================

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      const errorMessage = errorData.error?.message || "Error desconocido";

      console.error(`❌ Error de OpenAI (${openaiResponse.status}):`, errorMessage);

      return new Response(
        JSON.stringify({
          error: "Lo siento, no he podido procesar su pregunta. Por favor, inténtelo de nuevo.",
        }),
        {
          status: openaiResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // PROCESAR RESPUESTA DE OPENAI
    // ============================================

    const data = await openaiResponse.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("❌ Respuesta de OpenAI con estructura inesperada:", data);
      return new Response(
        JSON.stringify({ error: "Respuesta inválida del servicio" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const respuesta = data.choices[0].message.content;

    console.log(`✅ Respuesta generada: ${respuesta.length} caracteres`);

    // ============================================
    // DEVOLVER RESPUESTA AL CLIENTE
    // ============================================

    return new Response(
      JSON.stringify({
        respuesta: respuesta,
        pregunta_original: preguntaLimpia,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // ============================================
    // MANEJO DE ERRORES NO CAPTURADOS
    // ============================================

    console.error("❌ Error no controlado:", error);

    return new Response(
      JSON.stringify({
        error: "Ha ocurrido un problema. Por favor, inténtelo de nuevo más tarde.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
