import Question from "../models/Question.js";

// Función auxiliar para respuestas amistosas
const friendlyResponses = (text) => {
  const msg = text.toLowerCase();

  if (/(hola|buenas|buen día|buenas tardes|buenas noches)/.test(msg)) {
    return "¡Hola! ¿En qué puedo ayudarte hoy?";
  }

  if (/(gracias|muchas gracias)/.test(msg)) {
    return "¡De nada! Siempre estoy aquí para ayudarte ";
  }

  if (/(adiós|nos vemos|chao)/.test(msg)) {
    return "¡Hasta luego! Que tengas un buen día ";
  }

  if (/(tengo una duda|quiero preguntar|puedes ayudarme)/.test(msg)) {
    return "¡Claro! Pregúntame lo que quieras sobre Blue Fruit";
  }

  return null; // No es un mensaje amistoso, seguimos con la búsqueda
};

// Controlador principal
export const getAnswer = async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Falta la pregunta" });

  try {
    // 1️⃣ Ver si es un mensaje amigable
    const friendly = friendlyResponses(question);
    if (friendly) return res.json({ answer: friendly });

    // 2️⃣ Buscar en la base de datos
    const found = await Question.findOne({
      question: { $regex: question, $options: "i" } // búsqueda insensible a mayúsculas
    });

    if (found) {
      return res.json({ answer: found.answer });
    } else {
      return res.json({ answer: "Lo siento, solo puedo responder preguntas sobre Blue Fruit" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al buscar la respuesta" });
  }
};

// Agregar nueva pregunta-respuesta (para admin)
export const addQuestion = async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "Faltan datos" });

  try {
    const newQA = new Question({ question, answer });
    await newQA.save();
    res.json({ message: "Pregunta añadida correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la pregunta" });
  }
};
