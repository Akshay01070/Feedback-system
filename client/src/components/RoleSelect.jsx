import { useNavigate, Navigate } from 'react-router-dom';

const roles = [
    {
        key: 'student',
        label: 'Student',
        icon: '🎓',
        description: 'Access feedback forms and submit responses',
        color: 'from-blue-500 to-blue-700',
        border: 'border-blue-400',
        hover: 'hover:shadow-blue-200',
        canRegister: true,
    },
    {
        key: 'teacher',
        label: 'Teacher',
        icon: '📖',
        description: 'View student feedback for your subjects',
        color: 'from-indigo-500 to-indigo-700',
        border: 'border-indigo-400',
        hover: 'hover:shadow-indigo-200',
        canRegister: true,
    },
    {
        key: 'admin',
        label: 'Admin',
        icon: '🛡️',
        description: 'Manage forms, faculty and responses',
        color: 'from-gray-700 to-gray-900',
        border: 'border-gray-500',
        hover: 'hover:shadow-gray-200',
        canRegister: false,
    },
];

const RoleSelect = () => {
    const navigate = useNavigate();

    // Redirect if already logged in
    const token = localStorage.getItem('token');
    const existingRole = localStorage.getItem('role');
    if (token && existingRole) {
        const routes = { admin: '/admin', teacher: '/teacher', student: '/student' };
        return <Navigate to={routes[existingRole] || '/student'} replace />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
            {/* Header */}
            <div className="text-center mb-12">
                <img src="/collegeLogo.png" alt="IIIT Gwalior Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
                <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight mb-3">
                    Feedback System
                </h1>
                <p className="text-gray-500 text-lg">
                    Atal Bihari Vajpayee — IIITM Gwalior
                </p>
                <p className="text-gray-400 mt-2 text-sm">Select your role to continue</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {roles.map((role) => (
                    <div
                        key={role.key}
                        className={`bg-white rounded-2xl shadow-lg border-2 ${role.border} ${role.hover} hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group`}
                        onClick={() => navigate(`/login/${role.key}`)}
                    >
                        {/* Gradient top bar */}
                        <div className={`h-2 bg-gradient-to-r ${role.color}`} />

                        <div className="p-8 flex flex-col items-center text-center">
                            <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 block">
                                {role.icon}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{role.label}</h2>
                            <p className="text-gray-500 text-sm mb-6">{role.description}</p>

                            <button
                                className={`w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r ${role.color} hover:opacity-90 transition`}
                            >
                                Login as {role.label}
                            </button>

                            {role.canRegister && (
                                <button
                                    className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline transition"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/register/${role.key}`); }}
                                >
                                    New {role.label}? Sign up
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoleSelect;
