import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/contact', form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('Failed to send message');
    } finally { setLoading(false); }
  };

  return (
    <div className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Contact Us</h1>
        <p className="text-gray-500 text-center mt-1">Have a question? We'd love to hear from you.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: <FaEnvelope className="text-xl text-primary-500" />, title: 'Email', value: 'support@eduzone.com' },
            { icon: <FaPhone className="text-xl text-primary-500" />, title: 'Phone', value: '+91 7653061135' },
            { icon: <FaMapMarkerAlt className="text-xl text-primary-500" />, title: 'Address', value: 'Bhubaneswar, India' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-surface-300 rounded-lg p-5 text-center">
              <div className="flex justify-center mb-2">{c.icon}</div>
              <h3 className="font-semibold text-gray-800">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-surface-300 rounded-lg p-8 mt-8 max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" required placeholder="Your Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
            <input type="email" required placeholder="Your Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <input type="text" required placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <textarea required placeholder="Your Message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5}
            className="w-full px-3 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
