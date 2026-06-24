import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

/* STUDENT */
import StudentDashboard from "./pages/StudentDashboard";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import VideoLearning from "./pages/VideoLearning";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

/* INSTRUCTOR */
import InstructorDashboard from "./pages/InstructorDashboard";
import ManageCourses from "./pages/ManageCourses";
import ManageStudents from "./pages/ManageStudents";
import InstructorAnalytics from "./pages/InstructorAnalytics";
import InstructorSettings from "./pages/InstructorSettings";

/* ADMIN */
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import CourseApproval from "./pages/CourseApproval";
import PlatformAnalytics from "./pages/PlatformAnalytics";
import AdminSettings from "./pages/AdminSettings";

/* AUTH */
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========================= */}
        {/* PUBLIC ROUTES */}
        {/* ========================= */}

        <Route
          path="/"
          element={<WelcomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* ========================= */}
        {/* STUDENT ROUTES */}
        {/* ========================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute role="student">
              <MyCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:id"
          element={
            <ProtectedRoute role="student">
              <CourseDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:id/learning"
          element={
            <ProtectedRoute role="student">
              <VideoLearning />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute role="student">
              <ProgressAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute role="student">
              <Certificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute role="student">
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* INSTRUCTOR ROUTES */}
        {/* ========================= */}

        <Route
          path="/instructor-dashboard"
          element={
            <ProtectedRoute role="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-courses"
          element={
            <ProtectedRoute role="instructor">
              <ManageCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-students"
          element={
            <ProtectedRoute role="instructor">
              <ManageStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor-analytics"
          element={
            <ProtectedRoute role="instructor">
              <InstructorAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor-settings"
          element={
            <ProtectedRoute role="instructor">
              <InstructorSettings />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* ADMIN ROUTES */}
        {/* ========================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-management"
          element={
            <ProtectedRoute role="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-approval"
          element={
            <ProtectedRoute role="admin">
              <CourseApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/platform-analytics"
          element={
            <ProtectedRoute role="admin">
              <PlatformAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-settings"
          element={
            <ProtectedRoute role="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* ========================= */}
        {/* FALLBACK */}
        {/* ========================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;