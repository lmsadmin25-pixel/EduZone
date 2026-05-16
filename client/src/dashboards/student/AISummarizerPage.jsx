import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AISummarizerPage = () => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!content.trim()) return toast.error('Please enter some content');
    try {
      setLoading(true);
      const res = await api.post('/ai/summarize', { content });
      setResult(res.data);
    } catch { toast.error('Failed to summarize'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Notes Summarizer</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Enter Your Notes</h2>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} placeholder="Paste your notes or study material here..."
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <button onClick={handleSummarize} disabled={loading}
            className="mt-3 px-6 py-2.5 bg-accent-500 text-primary-900 font-semibold rounded-lg hover:bg-accent-400 disabled:opacity-50">
            {loading ? 'Summarizing...' : '✨ Summarize with AI'}
          </button>
        </div>

        <div className="bg-white border border-surface-300 rounded-lg p-5">
          <h2 className="font-semibold text-gray-800 mb-3">AI Summary</h2>
          {result ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-primary-500 mb-1">Summary</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-500 mb-1">Key Points</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {result.keyPoints?.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-500 mb-1">Key Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {result.keyConcepts?.map((c, i) => (
                    <span key={i} className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm">Enter text and click summarize to see AI-generated summary</p>}
        </div>
      </div>
    </div>
  );
};

export default AISummarizerPage;
