import { useState, useEffect } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/feedback/responses');
            setResponses(res.data);
        } catch (err) {
            console.error('Error fetching responses:', err);
        } finally {
            setLoading(false);
        }
    };

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
                        ) : responses.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No feedback responses yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {responses.map(response => (
                                    <div key={response._id} className="border p-4 rounded-lg hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-lg text-blue-600">
                                                {response.formId?.title || 'Unknown Form'}
                                            </h3>
                                            <span className="text-xs text-gray-400">
                                                {new Date(response.submittedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {response.answers?.map((ans, i) => (
                                                <div key={i} className="text-sm flex">
                                                    <span className="text-gray-500 w-40 flex-shrink-0">{ans.questionText}:</span>
                                                    <span className="font-medium">{ans.answer}</span>
                                                </div>
                                            ))}
                                        </div>
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
