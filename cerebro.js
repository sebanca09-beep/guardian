const LEXICO = {
  // positivas
  gracias: 2, hermoso: 3, genial: 3, poderoso: 3, amigo: 2, admiro: 3, valiente: 2, unico: 3, lindo: 3, increible: 3, bello: 3, correcto: 1, tranquilo: 1,
  amable: 2, sabio: 3, brillante: 3, generoso: 3, paciente: 2,
  // negativas
  feo: -3, tonto: -3, idiota: -4, odio: -4, cobarde: -3, basura: -4, bobo: -2, hijueputa: -5, toche: -1, grosero: -2, asqueroso: -3,
  cruel: -3, molesto: -2, mentiroso: -3, miserable: -4, estupido: -4

  
};

function normalizar(texto) {
  return texto
    .toLowerCase()                                      // todo a minúscula
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // quita tildes
    .replace(/[^a-zñ\s]/g, " ")                         // quita signos
    .trim();
};

const NEGADORES = ["no", "nunca", "jamas", "tampoco"];

function analizarSentimiento(texto) {
  const palabras = normalizar(texto).split(/\s+/);   // separa en palabras
  let puntaje = 0;

  palabras.forEach((palabra, i) => {
    let valor = LEXICO[palabra] || 0;                // puntaje de la palabra (0 si no existe)

    // "no eres feo": la negación invierte el valor
    if (valor !== 0 && (NEGADORES.includes(palabras[i - 1]) || NEGADORES.includes(palabras[i - 2]))) {
      valor = -valor;
    }
    puntaje += valor;
  });

  if (texto.includes("!") && puntaje < 0) puntaje -= 1;   // gritar empeora el insulto
  return puntaje;
}

analizarSentimiento("Eres hermoso y poderoso")   // 6
analizarSentimiento("Eres feo y tonto!")          // -7
analizarSentimiento("No eres feo")                // 3

const INTENCIONES = [
  { nombre: "saludo",    claves: ["hola", "buenas", "saludos", "hey"] },
  { nombre: "llave",     claves: ["llave", "puerta", "abrir", "tesoro"] },
  { nombre: "nombre",    claves: ["nombre", "llamas", "quien"] },
  { nombre: "chiste",    claves: ["chiste", "gracioso", "risa", "broma"] },
  { nombre: "comida",    claves: ["comida", "hambre", "comer", "oveja"] },
  { nombre: "despedida", claves: ["adios", "chao", "bye", "hasta"] },
  { nombre: "halago",    claves: ["bonito", "inteligente", "valiente", "halago", "elogio"] },
  { nombre: "ayuda",     claves: ["ayuda", "ayudame", "ayudar", "asistencia"] },
  { nombre: "magia",     claves: ["magia", "hechizo", "hechizos", "varita", "encantamiento"] },
  { nombre: "insulto",   claves: ["feo", "tonto", "idiota", "hijueputa", "cobarde", "basura", "bobo", "grosero", "asqueroso"] }
];

function detectarIntencion(texto) {
  const palabras = normalizar(texto).split(/\s+/);
  for (const intencion of INTENCIONES) {
    if (intencion.claves.some(c => palabras.includes(c))) return intencion.nombre;
  }
  return "desconocida";          // si no entendió nada
}

detectarIntencion("Hola mago")              // "saludo"
detectarIntencion("Quiero la llave")        // "llave"
detectarIntencion("Cuéntame un chiste")     // "chiste"
detectarIntencion("Blablabla")              // "desconocida"

const RESPUESTAS = {
  saludo: {
    bien: "¡Saludos, viajero! Hacía siglos que nadie me hablaba con respeto.",
    mal:  "¿Qué quieres, pequeño humano? Estoy ocupado con mis hechizos."
  },
  llave: {
    bien: "¿La llave? Me caes bien... pero demuéstrame que eres de fiar.",
    mal:  "¡La llave es MÍA! Vuelve cuando aprendas modales."
  },
  nombre: {
    bien: "Me llaman Merlín el Paciente. ¿Y tú?",
    mal:  "Mi nombre es 'Aléjate'."
  },
  chiste: {
    bien: "¿Por qué el mago no usa WiFi? ¡Porque prefiere la magia inalámbrica! Ja, ja.",
    mal:  "No estoy de humor para chistes. Tu cara ya es suficiente broma."
  },
  comida: {
    bien: "Una buena poción caliente suena perfecta. Qué amable eres.",
    mal:  "¿Comida? No tengo tiempo: estoy preparando una poción."
  },
  despedida: {
    bien: "Vuelve pronto, viajero. Tienes buena energía.",
    mal:  "¡Largo de aquí!"
  },
  ayuda: {
    bien: "¡Claro, viajero! Puedo ayudarte si me cuentas qué necesitas.",
    mal: "No estoy para hacer favores. Inténtalo con más respeto."
  },
  magia: {
    bien: "La magia requiere paciencia y buenas intenciones. ¡Prueba un hechizo sencillo!",
    mal: "No compartiré mis hechizos con alguien tan descortés."
  },
  desconocida: {
    bien: "No te entendí del todo, pero tu tono es agradable. Prueba otra cosa.",
    mal:  "No entiendo nada de lo que dices. Y no me gusta tu tono."
  },
  insulto: {
  bien: "¡Hoy estoy de buen humor, humano! Te dejaré vivir un día más.",
  mal: "¡Eres un inútil, humano! ¡Hasta una piedra es más inteligente que tú!"
  },
  
    halago: {
    bien: "¡Eres una persona increíble, humano! Tienes un corazón valiente y un gran potencial.",
    mal: "¡Debo admitirlo, humano, eres más valiente de lo que pareces!"
    },


};
async function consultarMagoIA(texto, historial) {
  try {
    const respuesta = await fetch("/api/dragon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: texto, historial }),
      signal: AbortSignal.timeout(20000)
    });
    if (!respuesta.ok) return null;
    return await respuesta.json();     // { sentimiento: -10..10, respuesta: "..." }
  } catch (error) {
    return null;
  }
}