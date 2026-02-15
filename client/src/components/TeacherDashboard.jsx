import { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/responses`);
            const allResponses = res.data;

            const userId = localStorage.getItem('userId');
            const role = localStorage.getItem('role');

            if (role === 'teacher') {
                const myResponses = allResponses.filter(r => r.formId && r.formId.assignedFaculty === userId);
                setResponses(myResponses);
            } else {
                setResponses(allResponses);
            }
        } catch (err) {
            console.error('Error fetching responses:', err);
        } finally {
            setLoading(false);
        }
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
                            /* Expanded view - show all responses for the selected subject */
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
                                        <div key={response._id} className="border p-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="font-bold text-gray-700">Response #{idx + 1}</span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(response.submittedAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {response.answers?.map((ans, i) => (
                                                    <div key={i} className="text-sm">
                                                        <span className="text-gray-500">{ans.questionText}: </span>
                                                        <span className="font-medium">{ans.answer || '—'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Subject list view - compact cards */
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
    );
};

export default TeacherDashboard;
