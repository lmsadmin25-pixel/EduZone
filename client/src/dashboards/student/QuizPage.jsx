import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaClock } from 'react-icons/fa';
import api from '../../services/api';

const QuizPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/tests/${testId}`)
      .then(r => {
        setTest(r.data);
        setTimeLeft(r.data.duration * 60);
      })
      .catch(() => toast.error('Failed to load quiz'))
      .finally(() => setLoading(false));

    return () => clearInterval(timerRef.current);
  }, [testId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft > 0 && !result]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, option) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (result) return;
    clearInterval(timerRef.current);
    try {
      setSubmitting(true);
      const res = await api.post(`/tests/${testId}/submit`, { answers });
      setResult(res.data);
      toast.success(`Quiz completed! Score: ${res.data.score}/${res.data.totalMarks}`);
    } catch { toast.error('Submit failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>;
  if (!test) return <div className="text-center py-10 text-gray-400">Quiz not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
          <p className="text-sm text-gray-500">{test.questions?.length} questions • {test.totalMarks} marks</p>
        </div>
        {!result && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold
            ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
            <FaClock /> {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Result Banner */}
      {result && (
        <div className={`p-5 rounded-lg mb-6 ${result.percentage >= 50 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{result.percentage >= 50 ? '🎉 Passed!' : '😔 Try Again'}</h2>
            <p className="text-lg mt-1">Score: <strong>{result.score}/{result.totalMarks}</strong> ({result.percentage}%)</p>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {(result ? result.results : test.questions)?.map((q, i) => {
          const question = result ? q : q;
          const qId = result ? q.questionId : q._id;
          const qText = result ? q.questionText : q.questionText;
          const opts = result ? q.options : q.options;

          return (
            <div key={qId} className="bg-white border border-surface-300 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-8 h-8 flex-shrink-0 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{qText}</p>
                  {result && <p className="text-xs text-gray-400 mt-0.5">{q.marks} marks</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                {opts?.map((option, j) => {
                  let optClass = 'border border-surface-300 hover:border-primary-300 hover:bg-primary-50';

                  if (result) {
                    if (option === q.correctAnswer) optClass = 'border-green-500 bg-green-50 text-green-700';
                    else if (option === q.userAnswer && !q.isCorrect) optClass = 'border-red-500 bg-red-50 text-red-700';
                    else optClass = 'border-surface-300 opacity-60';
                  } else if (answers[qId] === option) {
                    optClass = 'border-primary-500 bg-primary-50 text-primary-700';
                  }

                  return (
                    <button
                      key={j}
                      onClick={() => handleAnswer(qId, option)}
                      disabled={!!result}
                      className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${optClass}`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!result && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Answered: {Object.keys(answers).length}/{test.questions?.length}
          </p>
          <button onClick={handleSubmit} disabled={submitting}
            className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">
            ← Back to Course
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
