import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const CreateQuizPage = () => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    api.get('/courses/educator/my-courses').then(r => setCourses(r.data)).catch(() => {});
    setLoaded(true);
  }

  const addQuestion = () => setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);

  const updateQ = (i, field, val) => {
    const q = [...questions];
    q[i][field] = val;
    setQuestions(q);
  };

  const updateOption = (qi, oi, val) => {
    const q = [...questions];
    q[qi].options[oi] = val;
    setQuestions(q);
  };

  const removeQ = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const generateWithAI = async () => {
    if (!aiText.trim()) return toast.error('Enter text to generate from');
    if (!courseId) return toast.error('Select a course first');
    try {
      setAiLoading(true);
      const res = await api.post('/ai/generate-quiz', { content: aiText, courseId, title: title || 'AI Quiz', numQuestions: 5 });
      toast.success('AI Quiz generated and saved!');
      setQuestions(res.data.questions || []);
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSave = async () => {
    if (!courseId || !title) return toast.error('Course and title are required');
    try {
      setSaving(true);
      await api.post('/tests', { title, courseId, duration, questions });
      toast.success('Quiz saved!');
      setTitle(''); setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 }]);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Quiz</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Creation */}
        <div className="space-y-4">
          <div className="bg-white border border-surface-300 rounded-lg p-5 space-y-4">
            <h2 className="font-semibold text-gray-800">Quiz Details</h2>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
            <input type="text" placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Duration (min):</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-20 px-3 py-2 border border-surface-300 rounded-lg text-sm" />
            </div>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-surface-300 rounded-lg p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Question {i + 1}</h3>
                {questions.length > 1 && <button onClick={() => removeQ(i)} className="text-xs text-red-500 hover:underline">Remove</button>}
              </div>
              <input type="text" placeholder="Question text" value={q.questionText} onChange={e => updateQ(i, 'questionText', e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg text-sm mb-3" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {q.options.map((o, j) => (
                  <input key={j} type="text" placeholder={`Option ${j + 1}`} value={o} onChange={e => updateOption(i, j, e.target.value)}
                    className="px-3 py-2 border border-surface-300 rounded-lg text-sm" />
                ))}
              </div>
              <div className="flex gap-3">
                <select value={q.correctAnswer} onChange={e => updateQ(i, 'correctAnswer', e.target.value)} className="flex-1 px-3 py-2 border border-surface-300 rounded-lg text-sm">
                  <option value="">Correct Answer</option>
                  {q.options.filter(o => o).map((o, j) => <option key={j} value={o}>{o}</option>)}
                </select>
                <input type="number" value={q.marks} min={1} max={10} onChange={e => updateQ(i, 'marks', Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-surface-300 rounded-lg text-sm" placeholder="Marks" />
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={addQuestion} className="px-4 py-2 bg-surface-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-surface-200">+ Add Question</button>
            <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>

        {/* AI Generation */}
        <div className="bg-white border border-surface-300 rounded-lg p-5 h-fit">
          <h2 className="font-semibold text-gray-800 mb-3">🤖 AI Quiz Generator</h2>
          <p className="text-sm text-gray-500 mb-3">Paste study material and let AI create MCQ questions automatically.</p>
          <textarea value={aiText} onChange={e => setAiText(e.target.value)} rows={10} placeholder="Paste your notes or study content here..."
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm mb-3" />
          <button onClick={generateWithAI} disabled={aiLoading}
            className="w-full py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 disabled:opacity-50">
            {aiLoading ? 'Generating...' : '✨ Generate Quiz with AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizPage;
