const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'invalid');

// Helper: extract JSON from model response (handles markdown code blocks)
const parseJSON = (text) => {
  try {
    // Strip markdown code fences if present (```json ... ```)
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON array or object within the text
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Could not parse JSON from AI response');
  }
};

// Generate MCQ quiz questions from text content
const generateQuiz = async (content, numQuestions = 5) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'invalid') {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an expert quiz maker. Generate exactly ${numQuestions} multiple choice questions based on the content below.

RULES:
- Each question must have exactly 4 options (labeled as full text, NOT A/B/C/D)
- The correctAnswer must be one of the option texts exactly as written
- Marks should be 1, 2, or 3 based on difficulty
- Return ONLY a valid JSON array, no markdown, no explanation

JSON format:
[
  {
    "questionText": "Question here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Option 1",
    "marks": 1
  }
]

Content to generate questions from:
${content.substring(0, 4000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Quiz AI raw response (first 200 chars):', text.substring(0, 200));

    const questions = parseJSON(text);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned invalid quiz format');
    }
    return questions;
  } catch (error) {
    console.error('AI Quiz Generation Error:', error.message);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

// Summarize notes/text content
const summarizeNotes = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'invalid') {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an expert study assistant. Analyze the following content and provide a structured summary.

Return ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "summary": "A clear, concise 2-3 paragraph summary of the main concepts",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "keyConcepts": ["Concept 1", "Concept 2", "Concept 3", "Concept 4", "Concept 5"]
}

Content to analyze:
${content.substring(0, 4000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Summarize AI raw response (first 200 chars):', text.substring(0, 200));

    const parsed = parseJSON(text);
    if (!parsed.summary || !parsed.keyPoints || !parsed.keyConcepts) {
      throw new Error('AI returned incomplete summary format');
    }
    return parsed;
  } catch (error) {
    console.error('AI Summarize Error:', error.message);
    throw new Error(`Failed to summarize notes: ${error.message}`);
  }
};

// Rule-based course recommendations
const getRecommendations = async (enrolledCategories, allCourses) => {
  try {
    const recommended = allCourses.filter(course =>
      enrolledCategories.includes(course.category)
    );
    recommended.sort((a, b) => b.rating - a.rating);
    return recommended.slice(0, 6);
  } catch (error) {
    console.error('Recommendation Error:', error.message);
    throw new Error('Failed to generate recommendations');
  }
};

module.exports = { generateQuiz, summarizeNotes, getRecommendations };
