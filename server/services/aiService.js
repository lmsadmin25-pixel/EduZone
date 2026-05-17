const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'invalid');

// Generate MCQ quiz questions from text content
const generateQuiz = async (content, numQuestions = 5) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              questionText: { type: SchemaType.STRING, description: 'The question' },
              options: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Exactly 4 answer options'
              },
              correctAnswer: { type: SchemaType.STRING, description: 'The correct option text' },
              marks: { type: SchemaType.NUMBER, description: 'Marks for this question (1-5)' }
            },
            required: ['questionText', 'options', 'correctAnswer', 'marks']
          }
        }
      }
    });

    const prompt = `Generate exactly ${numQuestions} multiple choice questions based on the following content. Each question should have exactly 4 options and one correct answer. Assign marks between 1-5 based on difficulty.\n\nContent:\n${content}`;

    const result = await model.generateContent(prompt);
    const questions = JSON.parse(result.response.text());
    return questions;
  } catch (error) {
    console.error('AI Quiz Generation Error:', error.message);
    throw new Error('Failed to generate quiz using AI');
  }
};

// Summarize notes/text content
const summarizeNotes = async (content) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { type: SchemaType.STRING, description: 'A concise summary of the content' },
            keyPoints: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'List of important key points'
            },
            keyConcepts: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: 'List of key concepts/terms to remember'
            }
          },
          required: ['summary', 'keyPoints', 'keyConcepts']
        }
      }
    });

    const prompt = `Analyze the following study content and provide:\n1. A concise summary (2-3 paragraphs)\n2. Important key points (5-8 bullet points)\n3. Key concepts/terms to remember (5-10 items)\n\nContent:\n${content}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('AI Summarize Error:', error.message);
    throw new Error('Failed to summarize notes using AI');
  }
};

// Simple rule-based course recommendations
const getRecommendations = async (enrolledCategories, allCourses) => {
  try {
    // Filter courses that match enrolled categories but are not already enrolled
    const recommended = allCourses.filter(course =>
      enrolledCategories.includes(course.category)
    );

    // Sort by rating (highest first) and return top 6
    recommended.sort((a, b) => b.rating - a.rating);
    return recommended.slice(0, 6);
  } catch (error) {
    console.error('Recommendation Error:', error.message);
    throw new Error('Failed to generate recommendations');
  }
};

module.exports = { generateQuiz, summarizeNotes, getRecommendations };
