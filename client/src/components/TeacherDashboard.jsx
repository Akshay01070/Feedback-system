import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const TeacherDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/responses/teacher/${userId}`);
            setResponses(res.data);
        } catch (err) {
            console.error('Error fetching responses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Infer section from question text for old responses missing the section field
    const labKeywords = ['experiment', 'lab manual', 'methodical', 'laboratory', 'lab session', 'creative was'];
    const generalKeywords = ['Five best', 'work load', 'lectures held regularly', 'like / dislike', 'hours per week', 'additional comments'];
    const getSection = (ans) => {
        if (ans.section) return ans.section;
        const t = (ans.questionText || '').toLowerCase();
        if (labKeywords.some(k => t.includes(k))) return 'Presentation and Interaction (Lab Component - Optional)';
        if (generalKeywords.some(k => t.toLowerCase().includes(k.toLowerCase()))) return 'General Comments';
        return 'Subject Feedback';
    };

    // Group responses by form title
    const groupedResponses = responses.reduce((acc, r) => {
        const formTitle = r.formId?.title || 'Unknown Form';
        const formId = r.formId?._id || 'unknown';
        if (!acc[formId]) {
            acc[formId] = { title: formTitle, responses: [] };
        }
        acc[formId].responses.push(r);
        return acc;
    }, {});

    return (
        <>
            <Navbar />
            <div className="min-h-screen p-8 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-8">Teacher Dashboard</h1>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Student Feedback Responses</h2>
                            <p className="text-gray-500 text-sm">View anonymous feedback submitted by students</p>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <p className="text-gray-500 text-center py-8">Loading responses...</p>
                            ) : Object.keys(groupedResponses).length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No feedback responses yet.</p>
                            ) : expandedSubject ? (
                                <div>
                                    <button
                                        onClick={() => setExpandedSubject(null)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4"
                                    >
                                        ← Back to Subjects
                                    </button>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                        {groupedResponses[expandedSubject]?.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        {groupedResponses[expandedSubject]?.responses.length} response(s)
                                    </p>
                                    <div className="space-y-4">
                                        {groupedResponses[expandedSubject]?.responses.map((response, idx) => (
                                            <div key={response._id} className="border-2 border-indigo-200 rounded-xl bg-white shadow-md overflow-hidden">
                                                <div className="flex justify-between items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
                                                    <span className="font-bold text-lg">📝 Response #{idx + 1}</span>
                                                    <span className="text-xs text-indigo-100">
                                                        {new Date(response.submittedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="p-5 space-y-5">
                                                    {(() => {
                                                        const sections = {};
                                                        response.answers?.forEach(ans => {
                                                            const sec = getSection(ans);
                                                            if (!sections[sec]) sections[sec] = [];
                                                            sections[sec].push(ans);
                                                        });
                                                        return Object.entries(sections).map(([section, answers]) => (
                                                            <div key={section} className="space-y-2">
                                                                <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wide bg-indigo-50 px-3 py-2 rounded-lg border-l-4 border-indigo-500">
                                                                    {section === 'Organization' ? 'Subject Feedback' : section}
                                                                </h4>
                                                                <div className="grid gap-1 pl-2">
                                                                    {answers.map((ans, i) => (
                                                                        <div key={i} className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0 text-sm">
                                                                            <span className="text-gray-600 flex-1 pr-4">{ans.questionText}</span>
                                                                            <span className="font-semibold text-gray-900 text-right min-w-[60px]">{ans.answer || '—'}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(groupedResponses).map(([formId, group]) => (
                                        <div
                                            key={formId}
                                            onClick={() => setExpandedSubject(formId)}
                                            className="border p-5 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-all"
                                        >
                                            <h3 className="font-bold text-lg text-gray-800">{group.title}</h3>
                                            <p className="text-indigo-600 font-medium text-sm mt-1">
                                                {group.responses.length} response(s)
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">Click to view</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherDashboard;
