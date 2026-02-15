import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateFeedbackForm = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([
        { text: 'Overall Score (0-5)', type: 'score' },
        { text: 'Performance Review', type: 'text' },
        { text: 'Explanation', type: 'text' },
        { text: 'Homework', type: 'text' }
    ]);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState('text');

    const addQuestion = () => {
        if (!newQuestionText) return;
        setQuestions([...questions, { text: newQuestionText, type: newQuestionType }]);
        setNewQuestionText('');
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/feedback/create', {
                title,
                description,
                questions
            });
            alert('Feedback Form Created Successfully!');
            navigate('/admin');
        } catch (err) {
            console.error(err);
            alert('Failed to create form');
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Feedback Form</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Form Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>

                        <div className="space-y-4 mb-6">
                            {questions.map((q, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                    <span>{index + 1}. {q.text} <span className="text-xs text-gray-500">({q.type})</span></span>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(index)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="New Question Text"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                            />
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-md"
                                value={newQuestionType}
                                onChange={(e) => setNewQuestionType(e.target.value)}
                            >
                                <option value="text">Text</option>
                                <option value="score">Score (0-5)</option>
                                <option value="choice">Multiple Choice</option>
                            </select>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700"
                        >
                            Create Form
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFeedbackForm;
