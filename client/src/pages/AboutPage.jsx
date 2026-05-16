import { FaGraduationCap, FaRobot, FaUsers, FaShieldAlt } from 'react-icons/fa';

const AboutPage = () => (
  <div>
    <section className="bg-primary-500 text-white section-padding py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold">About EduZone</h1>
        <p className="text-primary-200 mt-3">AI-Powered Learning Management System built for the future of education.</p>
      </div>
    </section>
    <section className="section-padding">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">EduZone is an AI-powered e-learning platform designed to make quality education accessible to everyone. We combine cutting-edge AI technology with expert-crafted courses to provide a personalized learning experience.</p>
          <p className="text-gray-600 leading-relaxed mt-4">Built as a MERN stack application, EduZone features intelligent quiz generation, automated note summarization, and smart course recommendations — all powered by AI.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <FaGraduationCap className="text-2xl text-primary-500" />, title: 'Expert Courses', desc: 'Curated content by industry professionals' },
            { icon: <FaRobot className="text-2xl text-accent-500" />, title: 'AI Features', desc: 'Smart learning with AI assistance' },
            { icon: <FaUsers className="text-2xl text-green-500" />, title: 'Community', desc: 'Learn together with peers worldwide' },
            { icon: <FaShieldAlt className="text-2xl text-blue-500" />, title: 'Secure', desc: 'Enterprise-grade data security' },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-surface-300 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">{f.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800">{f.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
