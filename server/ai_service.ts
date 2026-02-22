import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generatePlot(genre: string, theme?: string) {
  const prompt = `
    أنت مساعد كاتب روائي محترف. قم بإنشاء مخطط لرواية باللغة العربية الفصحى.
    النوع: ${genre}
    ${theme ? `الموضوع: ${theme}` : ""}
    
    المطلوب:
    1. ملخص للحبكة (Plot Summary)
    2. قائمة بالشخصيات الرئيسية (الاسم، الدور، وصف موجز)
    3. مخطط للفصول (عنوان الفصل، ملخص موجز للأحداث) - اقترح 5-10 فصول.

    الرد يجب أن يكون بتنسيق JSON فقط:
    {
      "plot": "ملخص الحبكة...",
      "characters": [
        {"name": "...", "role": "...", "description": "..."}
      ],
      "chapters": [
        {"title": "...", "outline": "...", "sequence": 1}
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateChapter(
  chapterTitle: string,
  outline?: string,
  previousContent?: string,
  characters?: any[]
) {
  const prompt = `
    أنت كاتب روائي محترف. اكتب محتوى لفصل من رواية باللغة العربية الفصحى الرصينة.
    
    عنوان الفصل: ${chapterTitle}
    ${outline ? `ملخص الفصل: ${outline}` : ""}
    ${characters ? `الشخصيات الموجودة: ${characters.map(c => c.name + " (" + c.role + ")").join(", ")}` : ""}
    ${previousContent ? `سياق سابق (آخر ما حدث): ${previousContent.slice(-500)}` : ""}

    اكتب بأسلوب أدبي، مع وصف للمشاعر والأماكن والحوارات.
    اكتب حوالي 500-1000 كلمة.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}
