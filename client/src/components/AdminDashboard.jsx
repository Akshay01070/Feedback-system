import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ pendingCount: 0, onChainCount: 0 });
    const [forms, setForms] = useState([]);
    const [responses, setResponses] = useState([]);
    const [activeTab, setActiveTab] = useState('forms');
    const [expandedSubject, setExpandedSubject] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const formsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/all`);
            setForms(formsRes.data);

            const responsesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/feedback/responses`);
            setResponses(responsesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const triggerBatch = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/force-batch`);
            alert(res.data.msg + (res.data.count ? ` (${res.data.count} users processed)` : ''));
        } catch (err) {
            console.error(err);
            alert('Error triggering batch process');
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
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-blue-500">
                        <h3 className="text-gray-500 text-sm">Active Forms</h3>
                        <p className="text-3xl font-bold text-gray-800">{forms.length}</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
                        <h3 className="text-gray-500 text-sm">Total Responses</h3>
                        <p className="text-3xl font-bold text-gray-800">{responses.length}</p>
                    </div>
                    <div className="p-6 bg-white rounded-xl shadow-sm border-l-4 border-purple-500">
                        <h3 className="text-gray-500 text-sm">On-Chain Users</h3>
                        <p className="text-3xl font-bold text-gray-800">{stats.onChainCount || 0}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-bold mb-4">Actions</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={triggerBatch}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                        >
                            Force Batch Processing
                        </button>
                        <a
                            href="/admin/create-feedback"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition inline-block"
                        >
                            Create Feedback Form
                        </a>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('forms')}
                            className={`flex-1 py-3 text-center font-medium transition ${activeTab === 'forms' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Created Forms ({forms.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('responses'); setExpandedSubject(null); }}
                            className={`flex-1 py-3 text-center font-medium transition ${activeTab === 'responses' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Feedback Responses ({responses.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'forms' ? (
                            forms.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No forms created yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {forms.map(form => (
                                        <div key={form._id} className="border p-4 rounded-lg hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg">{form.title}</h3>
                                                    <p className="text-gray-600 text-sm">{form.description}</p>
                                                    {form.assignedFaculty && (
                                                        <p className="text-indigo-600 text-sm font-medium mt-1">Professor: {form.assignedFaculty.name}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {form.questions?.length || 0} questions • Created {new Date(form.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${form.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {form.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            Object.keys(groupedResponses).length === 0 ? (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
