import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import KanbanBoard from "./components/KanbanBoard";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import { setUser } from "./state/dataSlice";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

const DashboardLayout = ({ children }) => {
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed
  );

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
          <Navbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        dispatch(setUser(JSON.parse(savedUser)));
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }
    setIsInitialized(true);
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? "dark" : ""}`}>
        <div className="text-center">
          <div className="inline-block">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register" || location.pathname.startsWith("/accept-invitation");

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/accept-invitation" element={<AcceptInvitationPage />} />
        </Routes>
      ) : (
        <DashboardLayout>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <KanbanBoard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </DashboardLayout>
      )}
    </div>
  );
};

// Main wrapper component
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
