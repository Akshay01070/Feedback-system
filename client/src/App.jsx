import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RoleSelect from './components/RoleSelect';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import CreateFeedbackForm from './components/CreateFeedbackForm';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
        <Routes>
          {/* Role selection landing page */}
          <Route path="/" element={<RoleSelect />} />

          {/* Auth — role comes from URL param */}
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/:role" element={<Register />} />

          {/* Legacy redirects (keep old /login and /register working) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboards */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/create-feedback" element={
            <ProtectedRoute role="admin"><CreateFeedbackForm /></ProtectedRoute>
          } />
          <Route path="/student" element={
            <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/teacher" element={
            <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
