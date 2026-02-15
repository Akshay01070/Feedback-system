import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
