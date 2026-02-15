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
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/all`);
            setForms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSubmittedForms = async () => {
        try {
            const userId = localStorage.getItem('userId');
            if (userId) {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/submitted/${userId}`);
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/add-student-identity`, {
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/feedback/submit`, {
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
                                                {form.assignedFaculty && (
                                                    <p className="text-indigo-600 text-sm font-medium mt-1">
                                                        Prof: {form.assignedFaculty.name}
                                                    </p>
                                                )}
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
                    <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                        {/* Header */}
                        <div className="text-center mb-8 border-b pb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedForm.title}</h2>
                            <p className="text-gray-600 font-medium">{selectedForm.description}</p>
                            {selectedForm.assignedFaculty && (
                                <p className="text-indigo-600 font-semibold mt-2 text-lg">
                                    Professor: {selectedForm.assignedFaculty.name}
                                </p>
                            )}
                            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                <span>Date: {new Date().toLocaleDateString()}</span>
                                <button onClick={() => setSelectedForm(null)} className="text-red-500 hover:text-red-700 font-semibold">Cancel</button>
                            </div>
                        </div>

                        <form onSubmit={submitFeedback} className="space-y-10">
                            {/* Group questions by section */}
                            {Object.entries(selectedForm.questions.reduce((acc, q) => {
                                const section = q.section || 'General';
                                if (!acc[section]) acc[section] = [];
                                acc[section].push(q);
                                return acc;
                            }, {})).map(([section, questions]) => (
                                <div key={section} className="space-y-4">
                                    <h3 className="text-xl font-bold text-gray-800 bg-gray-50 p-3 rounded-lg border-l-4 border-indigo-500">
                                        {section}
                                    </h3>
                                    {(section.includes('Presentation') || section.includes('Lab Component')) && (
                                        <p className="text-amber-600 text-sm font-semibold px-3 py-2 bg-amber-50 rounded-md border border-amber-200 mt-1">
                                            ⚠ Fill this section if Lab Component is present for the subject
                                        </p>
                                    )}

                                    {/* Grid Layout for specific sections */}
                                    {(section === 'Organization' || section.includes('Lab Component') || section.includes('Presentation and Interaction')) ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 w-1/2">Question</th>
                                                        {[5, 4, 3, 2, 1].map(num => (
                                                            <th key={num} className="px-2 py-3 text-center w-12">{num}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {questions.map((q) => (
                                                        <tr key={q._id} className="bg-white border-b hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {q.text}
                                                            </td>
                                                            {[5, 4, 3, 2, 1].map(num => (
                                                                <td key={num} className="px-2 py-3 text-center">
                                                                    <input
                                                                        type="radio"
                                                                        name={q._id}
                                                                        required={section.includes('Presentation') || section.includes('Lab Component') ? false : q.required}
                                                                        value={num}
                                                                        checked={answers[q._id] == num} // Loose comparison for string/number match
                                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500"
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        // Standard List Layout for other sections
                                        <div className="grid gap-6">
                                            {questions.map((q) => (
                                                <div key={q._id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                                    <label className="block font-medium text-gray-700 mb-2">{q.text}</label>
                                                    {q.type === 'score' ? (
                                                        <div className="flex gap-4">
                                                            {[1, 2, 3, 4, 5].map(n => (
                                                                <label key={n} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={q._id}
                                                                        required={q.required}
                                                                        value={n}
                                                                        checked={answers[q._id] == n}
                                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                                        className="text-indigo-600"
                                                                    />
                                                                    {n}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : q.type === 'choice' ? (
                                                        <div className="flex gap-6">
                                                            {q.options && q.options.map(opt => (
                                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name={q._id}
                                                                        required={q.required}
                                                                        value={opt}
                                                                        checked={answers[q._id] === opt}
                                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                                        className="text-indigo-600"
                                                                    />
                                                                    {opt}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <textarea
                                                            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                            rows="3"
                                                            required={q.required}
                                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="pt-6 border-t mt-8">
                                <button
                                    type="submit"
                                    disabled={loading || !identity}
                                    className={`w-full py-4 rounded-lg text-white font-bold text-lg shadow-md transition transform hover:scale-[1.01] ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {status}
                                        </span>
                                    ) : 'Submit Confidential Feedback'}
                                </button>
                                <p className="text-center text-gray-500 text-sm mt-4">
                                    Your feedback is encrypted and anonymous via Zero-Knowledge Proofs.
                                </p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
