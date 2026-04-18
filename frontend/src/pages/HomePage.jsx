import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { projectAPI, taskAPI } from "../services/api";
import { setProjects, setTasks } from "../state/dataSlice";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const HomePage = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const tasks = useSelector((state) => state.data.tasks);
  const projects = useSelector((state) => state.data.projects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await projectAPI.getAll();
        dispatch(setProjects(projectsData));
      
        let allTasks = [];
        if (projectsData && projectsData.length > 0) {
          const taskPromises = projectsData.map(project => 
            taskAPI.getByProject(project.id).catch(() => [])
          );
          const results = await Promise.all(taskPromises);
          allTasks = results.flat().filter(Boolean);
        }
        dispatch(setTasks(allTasks));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (loading) return <div className="p-8">Loading...</div>;

  const priorityCount = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const taskDistribution = Object.keys(priorityCount).map((key) => ({
    name: key,
    count: priorityCount[key],
  }));

  const statusCount = projects.reduce((acc, project) => {
    const status = project.endDate ? "Completed" : "Active";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const projectStatus = Object.keys(statusCount).map((key) => ({
    name: key,
    count: statusCount[key],
  }));

  const chartColors = isDarkMode
    ? {
        bar: "#8884d8",
        barGrid: "#303030",
        pieFill: "#4A90E2",
        text: "#FFFFFF",
      }
    : {
        bar: "#8884d8",
        barGrid: "#E0E0E0",
        pieFill: "#82ca9d",
        text: "#000000",
      };

  const taskColumns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Title", width: 200 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "priority", headerName: "Priority", width: 150 },
    { field: "dueDate", headerName: "Due Date", width: 150 },
  ];

  return (
    <div className="container h-full w-[100%] bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📊 Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your project overview.</p>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{tasks.filter(t => t.status === 'In Progress').length}</p>
            </div>
            <div className="text-4xl">⚙️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === 'Done').length}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

  
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📊 Task Priority Distribution
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={chartColors.barGrid}
                />
                <XAxis dataKey="name" stroke={chartColors.text} />
                <YAxis stroke={chartColors.text} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={chartColors.bar} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📈 Project Status
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="count" data={projectStatus} fill="#82ca9d" label>
                  {projectStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📋 Your Tasks
          </h3>
        </div>
        <div className="p-6">
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={tasks || []}
              columns={taskColumns}
              checkboxSelection
              pageSizeOptions={[10]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              sx={{
                '& .MuiDataGrid-root': {
                  backgroundColor: 'transparent',
                  border: 'none',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #e5e7eb',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
