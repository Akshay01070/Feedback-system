import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    const roleLabels = {
        student: { label: 'Student', icon: '🎓', color: 'bg-blue-600' },
        teacher: { label: 'Teacher', icon: '📖', color: 'bg-indigo-600' },
        admin: { label: 'Admin', icon: '🛡️', color: 'bg-gray-800' },
    };

    const config = roleLabels[role] || roleLabels.student;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className={`${config.color} text-white px-6 py-3 flex justify-between items-center shadow-md`}>
            <div className="flex items-center gap-3">
                <img src="/collegeLogo.png" alt="IIIT Gwalior" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg">IIITM Gwalior Feedback</span>
                <span className="text-white/60 text-sm">| {config.label}</span>
            </div>
            <div className="flex items-center gap-4">
                {name && (
                    <span className="text-sm text-white/80">
                        Hello, <strong>{name}</strong>
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
