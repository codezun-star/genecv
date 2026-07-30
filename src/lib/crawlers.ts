/**
 * Rastreadores de los motores de respuestas.
 *
 * Un `User-agent: *` que permite todo ya los deja pasar, así que nombrarlos
 * puede parecer redundante. No lo es, por tres razones.
 *
 * La primera es cómo se lee robots.txt: un rastreador obedece **un solo**
 * grupo, el más específico que coincida con su nombre, e ignora `*` por
 * completo. Este sitio ya tiene un `Disallow: /api/` en el grupo general, así
 * que cualquier grupo específico tiene que repetirlo o esos agentes se
 * quedarían sin la exclusión — de ahí que la lista se comparta con robots.ts
 * y no se escriba dos veces.
 *
 * La segunda es que dos de estos nombres no son rastreadores sino
 * interruptores: `Google-Extended` y `Applebot-Extended` no descargan nada,
 * solo deciden si el contenido ya rastreado puede usarse para responder en
 * Gemini y en Apple Intelligence. Solo existen aquí.
 *
 * La tercera es la distinción entre índice y visita: `GPTBot` o `ClaudeBot`
 * rastrean para construir un índice, mientras que `ChatGPT-User`,
 * `Claude-User` y `Perplexity-User` van a buscar la página **en el momento**
 * en que alguien pregunta algo. Bloquear los segundos no protege nada —la
 * visita ya la pidió una persona— pero deja al asistente respondiendo de
 * memoria en lugar de con la página real.
 */
export const ANSWER_ENGINE_CRAWLERS = [
  // OpenAI: índice de búsqueda, rastreo general y visita a petición del usuario.
  "OAI-SearchBot",
  "GPTBot",
  "ChatGPT-User",
  // Anthropic (Claude).
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity: índice y visita a petición.
  "PerplexityBot",
  "Perplexity-User",
  // Google (Gemini y las respuestas generadas en Search) y Apple Intelligence.
  // No descargan nada por su cuenta: autorizan el uso de lo ya rastreado.
  "Google-Extended",
  "Applebot-Extended",
  // Los asistentes del resto de buscadores.
  "DuckAssistBot",
  "Amazonbot",
  "MistralAI-User",
  "cohere-ai",
  "meta-externalagent",
] as const;
