import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setIsSidebarCollapsed } from "../state/globalSlice";
import { setProjects } from "../state/dataSlice";
import { projectAPI } from "../services/api";
import {
  Home,
  Briefcase,
  Search,
  Settings,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Layers3,
  LogOut,
  LayoutGrid,
} from "lucide-react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isSidebarCollapsed = useSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const projects = useSelector((state) => state.data.projects);
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  useEffect(() => {
    
    const fetchProjects = async () => {
      try {
        const data = await projectAPI.getAll();
        dispatch(setProjects(data || []));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const sidebarClassNames = `fixed left-0 top-0 flex flex-col h-screen justify-between shadow-lg
    transition-all duration-300 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto
    ${isSidebarCollapsed ? "w-20" : "w-64"}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        
        <div className="z-50 flex min-h-[56px] items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900">
          {!isSidebarCollapsed && (
            <div className="text-lg font-bold text-white truncate">
              PM Board
            </div>
          )}
          <button
            className="p-1 hover:bg-white/20 rounded transition-colors"
            onClick={() => {
              dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
            }}
          >
            {isSidebarCollapsed ? (
              <ChevronUp className="h-5 w-5 text-white rotate-90" />
            ) : (
              <ChevronDown className="h-5 w-5 text-white rotate-90" />
            )}
          </button>
        </div>

        <nav className="z-10 w-full space-y-1">
          <SidebarLink
            icon={Home}
            label="Home"
            href="/"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Briefcase}
            label="Projects"
            href="/projects"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={LayoutGrid}
            label="Kanban"
            href="/kanban"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={LayoutGrid}
            label="Tasks"
            href="/tasks"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Search}
            label="Search"
            href="/search"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Settings}
            label="Settings"
            href="/settings"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={User}
            label="Users"
            href="/users"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
          <SidebarLink
            icon={Users}
            label="Teams"
            href="/teams"
            location={location}
            isCollapsed={isSidebarCollapsed}
          />
        </nav>

        {!isSidebarCollapsed && (
          <>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowProjects((prev) => !prev)}
                className="flex w-full items-center justify-between text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors"
              >
                <span>📁 Projects</span>
                {showProjects ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {showProjects &&
              projects?.map((project) => (
                <SidebarLink
                  key={project.id}
                  icon={Briefcase}
                  label={project.name}
                  href={`/projects/${project.id}`}
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
              ))}
          </>
        )}

        {!isSidebarCollapsed && (
          <>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowPriority((prev) => !prev)}
                className="flex w-full items-center justify-between text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold text-sm transition-colors"
              >
                <span>🎯 Priority</span>
                {showPriority ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {showPriority && (
              <>
                <SidebarLink
                  icon={AlertCircle}
                  label="Urgent"
                  href="/priority/urgent"
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                  icon={ShieldAlert}
                  label="High"
                  href="/priority/high"
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                  icon={AlertTriangle}
                  label="Medium"
                  href="/priority/medium"
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                  icon={AlertOctagon}
                  label="Low"
                  href="/priority/low"
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                  icon={Layers3}
                  label="Backlog"
                  href="/priority/backlog"
                  location={location}
                  isCollapsed={isSidebarCollapsed}
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="z-10 flex w-full flex-col items-center gap-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-white font-medium transition-colors gap-2"
        >
          <LogOut className="h-4 w-4" /> {!isSidebarCollapsed && "Logout"}
        </button>
      </div>
    </div>
  );
};

const SidebarLink = ({ href, icon: Icon, label, location, isCollapsed }) => {
  const isActive = location.pathname === href;

  return (
    <Link href={href} to={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-all hover:bg-blue-50 dark:hover:bg-gray-800 ${
          isActive ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-600" : "border-l-4 border-transparent"
        } ${isCollapsed ? "justify-center px-4 py-3" : "justify-start px-6 py-3"}`}
        title={isCollapsed ? label : ""}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-600 dark:text-gray-400"}`} />
        {!isCollapsed && (
          <span className={`font-medium truncate ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
