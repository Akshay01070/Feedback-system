import { useState, useEffect } from 'react';
import axios from 'axios';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import { BrowserProvider, Contract } from 'ethers';
import FeedbackABI from '../abis/Feedback.json';

const StudentDashboard = () => {
    const [identity, setIdentity] = useState(null);
    const [forms, setForms] = useState([]);
    const [submittedFormIds, setSubmittedFormIds] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // Constants
    const GROUP_ID = 1;
    const CONTRACT_ADDRESS = "0xExampleAddress";

    useEffect(() => {
        const savedIdentity = localStorage.getItem('blockFeedback_identity');
        if (savedIdentity) {
            setIdentity(new Identity(savedIdentity));
        }
        fetchForms();
        fetchSubmittedForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/feedback/all');
            setForms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubmittedForms = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const res = await axios.get(`http://localhost:5000/api/feedback/submitted/${userId}`);
                setSubmittedFormIds(res.data.submittedFormIds || []);
            }
        } catch (err) {
            console.error(err);
        }
    };


    const createIdentity = async () => {
        const newIdentity = new Identity();
        setIdentity(newIdentity);
        localStorage.setItem('blockFeedback_identity', newIdentity.toString());

        try {
            const userId = localStorage.getItem('userId');
            await axios.post('http://localhost:5000/api/admin/add-student-identity', {
                userId,
                identityCommitment: newIdentity.commitment.toString()
            });
            alert('Identity Created & Sent for Verification!');
        } catch (err) {
            console.error(err);
            alert('Failed to send identity to server');
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers({ ...answers, [questionId]: value });
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        if (!identity) return alert('Create Identity first');
        if (!selectedForm) return;

        setLoading(true);
        setStatus('Generating Proof...');

        try {
            // Prepare answers for DB
            const formattedAnswers = selectedForm.questions.map(q => ({
                questionId: q._id,
                questionText: q.text,
                answer: answers[q._id]
            }));

            // 1. ZK Proof Generation (Mocked for now as we don't have full chain setup)
            // const group = new Group(GROUP_ID);
            // group.addMember(identity.commitment);
            // const fullProof = await generateProof(identity, group, BigInt(GROUP_ID), 1);

            console.log("Mocking ZK Proof generation...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

            setStatus('Submitting to Server...');

            // 2. Submit to Backend
            await axios.post('http://localhost:5000/api/feedback/submit', {
                formId: selectedForm._id,
                answers: formattedAnswers,
                studentId: localStorage.getItem('userId') // Optional
            });

            // 3. Mock Blockchain Transaction
            console.log("Mocking Blockchain Transaction...");
            // if (window.ethereum) { ... }

            setStatus('Feedback Submitted Successfully!');
            alert('Feedback Submitted Successfully!');

            // Add this form to submitted list so it shows as completed
            setSubmittedFormIds(prev => [...prev, selectedForm._id]);

            setSelectedForm(null);
            setAnswers({});

        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.msg || err.response?.data || err.message;
            setStatus('Submission Failed: ' + errorMsg);
            alert('Submission Failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-gray-800">Student Dashboard</h1>

                {/* Identity Section */}
                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4">Your Anonymous Identity</h2>
                    {identity ? (
                        <div className="text-green-600">
                            <p>Identity Active</p>
                            <p className="text-xs text-gray-400 mt-2 truncate">{identity.commitment.toString()}</p>
                        </div>
                    ) : (
                        <button
                            onClick={createIdentity}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Generate & Register Identity
                        </button>
                    )}
                </div>

                {/* Feedback Forms List */}
                {!selectedForm ? (
                    <div className="p-6 bg-white rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Available Feedback Forms</h2>
                        {forms.length === 0 ? (
                            <p className="text-gray-500">No active forms available.</p>
                        ) : (
                            <div className="space-y-4">
                                {forms.map(form => {
                                    const isSubmitted = submittedFormIds.includes(form._id);
                                    return (
                                        <div key={form._id} className={`border p-4 rounded-lg flex justify-between items-center ${isSubmitted ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'}`}>
                                            <div>
                                                <h3 className="font-bold text-lg">{form.title}</h3>
                                                <p className="text-gray-600 text-sm">{form.description}</p>
                                            </div>
                                            {isSubmitted ? (
                                                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-medium">
                                                    ✓ Completed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedForm(form)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Start
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    // Selected Form View
                    <div className="p-6 bg-white rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">{selectedForm.title}</h2>
                            <button onClick={() => setSelectedForm(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>

                        <form onSubmit={submitFeedback} className="space-y-6">
                            {selectedForm.questions.map((q, i) => (
                                <div key={q._id || i} className="space-y-2">
                                    <label className="block font-medium text-gray-700">{i + 1}. {q.text}</label>
                                    {q.type === 'score' ? (
                                        <select
                                            className="w-full p-2 border rounded-md"
                                            required={q.required}
                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        >
                                            <option value="">Select Score</option>
                                            {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    ) : q.type === 'choice' ? (
                                        <select
                                            className="w-full p-2 border rounded-md"
                                            required={q.required}
                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        >
                                            <option value="">Select Option</option>
                                            {q.options && q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <textarea
                                            className="w-full p-2 border rounded-md"
                                            rows="3"
                                            required={q.required}
                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                type="submit"
                                disabled={loading || !identity}
                                className={`w-full py-3 rounded-lg text-white font-bold transition ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {loading ? status : 'Submit Feedback'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
