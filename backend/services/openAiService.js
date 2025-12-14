const OpenAI = require("openai");
const schemaContext = require("../utils/schemaContext");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const interpretQuestion = async (question) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: schemaContext },
      { role: "user", content: question }
    ],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { interpretQuestion };
