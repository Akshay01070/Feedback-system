import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateFeedbackForm = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionType, setNewQuestionType] = useState('text');
    const [newQuestionSection, setNewQuestionSection] = useState('General');

    // Dates & Elective Constraints
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [allowedEmails, setAllowedEmails] = useState([]);

    // Faculty Assignment
    const [facultyList, setFacultyList] = useState([]);
    const [assignedFaculty, setAssignedFaculty] = useState('');



    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/feedback/faculty-list');
                setFacultyList(res.data);
            } catch (err) {
                console.error("Failed to fetch faculty list", err);
            }
        };
        fetchFaculty();
    }, []);

    const loadStandardTemplate = () => {

        const orgQuestions = [
            { text: 'Objectives and plan of the subject were specified', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Coverage and depth of the subject was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Pace of teaching / learning and communication skill were', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'The topics provided new knowledge was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Prescribed reading material was available', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'In terms of organization, clarity and presentation of the fundamental concepts, the lectures were', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Instructor\'s oral presentation in terms of audibility and articulation was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Instructor\'s whiteboard (or ppt) presentation in terms of organization and legibility was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Encouragements given by the instructor to think and reason, logically and objectively was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Instructor\'s response to the questions asked in the class was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'The availability and approachability of instructors outside class was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'Instructor\'s attitude towards teaching of this course was', type: 'score', section: 'Subject Feedback', predefined: true },
            { text: 'The overall quality of the teaching was', type: 'score', section: 'Subject Feedback', predefined: true },
        ];

        const labQuestions = [
            { text: 'The experiments provided new insights', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Handouts / lab manuals were available', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Methodical / systematic work was emphasized', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Your presentation before going to the laboratory was', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Instructor\'s feedback on your report was prompt', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'During the lab session, your interaction with the instructor was useful', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Encouragement given by the instructor to think and be creative was', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
            { text: 'Overall, the laboratory experience was', type: 'score', section: 'Presentation and Interaction (Lab Component - Optional)', predefined: true },
        ];

        const generalQuestions = [
            { text: 'Would you rate this subject as one of the Five best subjects you had so far?', type: 'choice', options: ['Yes', 'No'], section: 'General Comments', predefined: true },
            { text: 'The work load in this subject in comparison to the subjects this semester was', type: 'choice', options: ['Very little', 'Just right', 'Too heavy'], section: 'General Comments', predefined: true },
            { text: 'Were the lectures held regularly and on time?', type: 'choice', options: ['Yes', 'No'], section: 'General Comments', predefined: true },
            { text: 'What did you like / dislike about this subject?', type: 'text', section: 'General Comments', predefined: true },
            { text: 'In additional to the class hours, how many hours per week did you put in?', type: 'text', section: 'General Comments', predefined: true },
            { text: 'Please give additional comments to improve the subject further', type: 'text', section: 'General Comments', predefined: true }
        ];

        // Always include all sections - lab is optional for students
        setQuestions([...orgQuestions, ...labQuestions, ...generalQuestions]);
    };

    // Load template by default on mount
    useEffect(() => { loadStandardTemplate(); }, []);

    const addQuestion = () => {
        if (!newQuestionText) return;
        setQuestions([...questions, { text: newQuestionText, type: newQuestionType, section: newQuestionSection }]);
        setNewQuestionText('');
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            // Regex to match anything that looks like an email address anywhere in the text
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
            const foundEmails = text.match(emailRegex) || [];
            
            // Deduplicate and convert to lowercase
            const uniqueEmails = [...new Set(foundEmails.map(e => e.toLowerCase()))];
            
            setAllowedEmails(uniqueEmails);
            toast.success(`Found and added ${uniqueEmails.length} valid student emails from CSV!`);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (allowedEmails.length === 0) {
            const confirmPublic = window.confirm("You haven't uploaded a student email CSV. This means ALL students on campus will be able to see and submit this form. Are you sure you want to proceed?");
            if (!confirmPublic) return;
        }

        try {
            await axios.post('http://localhost:5000/api/feedback/create', {
                title,
                description,
                questions,
                assignedFaculty,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                allowedEmails: allowedEmails.length > 0 ? allowedEmails : undefined
            });
            toast.success('Feedback Form Created Successfully!');
            navigate('/admin');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create form');
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-100">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Create Feedback Form</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Form Title (Subject Name)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assign Subject Professor</label>
                        <select
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={assignedFaculty}
                            onChange={(e) => setAssignedFaculty(e.target.value)}
                        >
                            <option value="">-- Select Professor --</option>
                            {facultyList.map(f => (
                                <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date & Time (Optional)</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">When should students be able to start submitting?</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date & Time (Optional)</label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">When should the form expire and disappear?</p>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                            Specific Student Targeting (Elective Subjects)
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            Upload a CSV file containing student emails. Only these students will be able to see and submit this form. If left empty, <strong>all</strong> students will see it.
                        </p>
                        <input 
                            type="file" 
                            accept=".csv, .txt" 
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {allowedEmails.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md shadow-sm">
                                <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                                    <span className="text-lg">✅</span> 
                                    Targeting activated for {allowedEmails.length} specific student{allowedEmails.length !== 1 ? 's' : ''}.
                                </p>
                            </div>
                        )}
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description / Subject Details</label>
                        <textarea
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-bold text-gray-700">Questions ({questions.length})</h2>
                        {questions.map((q, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                <div>
                                    <span className="text-xs font-semibold uppercase text-indigo-600">[{q.section || 'General'}]</span>
                                    <p className="font-medium text-gray-800">{q.text}</p>
                                    <span className="text-xs text-gray-500">Type: {q.type}</span>
                                </div>
                                {!q.predefined && (
                                    <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Question */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                        <h3 className="font-bold text-blue-700">Add Custom Question</h3>
                        <input
                            type="text"
                            placeholder="Question text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={newQuestionType}
                                onChange={(e) => setNewQuestionType(e.target.value)}
                            >
                                <option value="text">Text</option>
                                <option value="score">Score (1-5)</option>
                                <option value="choice">Choice</option>
                            </select>
                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={newQuestionSection}
                                onChange={(e) => setNewQuestionSection(e.target.value)}
                            >
                                <option value="General">General</option>
                                <option value="Organization">Organization</option>
                                <option value="Presentation and Interaction (Lab Component - Optional)">Lab Component (Optional)</option>
                                <option value="General Comments">General Comments</option>
                            </select>
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-green-600 text-white rounded-md font-bold text-lg hover:bg-green-700"
                    >
                        Create Form
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFeedbackForm;
