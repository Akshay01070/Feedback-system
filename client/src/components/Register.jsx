import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';

const roleConfig = {
    student: {
        label: 'Student',
        icon: '🎓',
        color: 'bg-blue-600 hover:bg-blue-700',
        ring: 'focus:ring-blue-500',
        gradient: 'from-blue-500 to-blue-700',
        showName: false,
    },
    teacher: {
        label: 'Teacher',
        icon: '📖',
        color: 'bg-indigo-600 hover:bg-indigo-700',
        ring: 'focus:ring-indigo-500',
        gradient: 'from-indigo-500 to-indigo-700',
        showName: true,
    },
};

const Register = () => {
    const { role } = useParams();
    const config = roleConfig[role] || roleConfig.student;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedRole = localStorage.getItem('role');
        if (token && savedRole) {
            navigate(`/${savedRole}`, { replace: true });
        }
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                name: config.showName ? name : undefined,
                email,
                password,
                role,
            });
            toast.success('Registration Successful! Please Login.');
            navigate(`/login/${role}`);
        } catch (err) {
            toast.error('Registration failed. The email may already be in use.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
            <div className="w-full max-w-md">
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
                >
                    ← Back to role selection
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-r ${config.gradient} p-6 text-center text-white`}>
                        <span className="text-5xl block mb-2">{config.icon}</span>
                        <h2 className="text-2xl font-bold">{config.label} Sign Up</h2>
                    </div>

                    <div className="p-8 space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleRegister} className="space-y-5">
                            {config.showName && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Dr. Joydeep"
                                        className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${config.ring}`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${config.ring}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 ${config.ring}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full px-4 py-2 font-bold text-white rounded-md transition ${config.color} focus:outline-none focus:ring-2 ${config.ring}`}
                            >
                                Create {config.label} Account
                            </button>
                        </form>

                        <p className="text-sm text-center text-gray-500">
                            Already have an account?{' '}
                            <Link to={`/login/${role}`} className="font-medium text-blue-600 hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
