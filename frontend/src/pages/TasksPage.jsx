import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { taskAPI, projectAPI } from "../services/api";
import { setTasks, setProjects } from "../state/dataSlice";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import TaskDetailModal from "../components/TaskDetailModal";

const TasksPage = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.data.tasks);
  const projects = useSelector((state) => state.data.projects);
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
    assignedTo: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectAPI.getAll();
      dispatch(setProjects(projectsData || []));
      
      let allTasks = [];
      if (projectsData && projectsData.length > 0) {
        const taskPromises = projectsData.map(project => 
          taskAPI.getByProject(project.id).catch(() => [])
        );
        const results = await Promise.all(taskPromises);
        allTasks = results.flat().filter(Boolean);
      }
      dispatch(setTasks(allTasks));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "projectId" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.projectId) {
      setError("Please select a project");
      return;
    }

    try {
      if (editingId) {
        await taskAPI.update(editingId, formData);
      } else {
        await taskAPI.create(formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        projectId: "",
        status: "To Do",
        priority: "Medium",
        dueDate: "",
        assignedTo: null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.delete(id);
        await fetchData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || "",
      assignedTo: task.assignedTo,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  if (loading) return <div className="p-8">Loading tasks...</div>;

  return (
    <div className="container h-full w-full bg-gray-100 p-8 dark:bg-gray-900">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Tasks</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              title: "",
              description: "",
              projectId: "",
              status: "To Do",
              priority: "Medium",
              dueDate: "",
              assignedTo: null,
            });
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          New Task
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {showForm && (
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            {editingId ? "Edit Task" : "New Task"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Project
                </label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                {editingId ? "Update Task" : "Create Task"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 dark:bg-gray-600 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={tasks || []}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              { field: "title", headerName: "Title", width: 200 },
              {
                field: "projectId",
                headerName: "Project",
                width: 150,
                valueFormatter: (value) => {
                  const project = projects.find((p) => p.id === value);
                  return project ? project.name : "N/A";
                },
              },
              { field: "status", headerName: "Status", width: 150 },
              { field: "priority", headerName: "Priority", width: 120 },
              { field: "dueDate", headerName: "Due Date", width: 150 },
              {
                field: "actions",
                headerName: "Actions",
                width: 150,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(params.row)}
                      className="rounded bg-blue-500 px-2 py-1 text-white text-xs hover:bg-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(params.row.id)}
                      className="rounded bg-red-500 px-2 py-1 text-white text-xs hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            pageSizeOptions={[10]}
            onRowClick={(params) => setSelectedTask(params.row)}
            sx={{
              cursor: 'pointer',
              '&& .MuiDataGrid-row:hover': {
                backgroundColor: '#f3f4f6'
              }
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
