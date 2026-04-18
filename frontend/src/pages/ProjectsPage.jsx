import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { projectAPI } from "../services/api";
import { setProjects } from "../state/dataSlice";
import { Plus, Trash2, Edit2, AlertCircle, Users } from "lucide-react";
import InviteMembersModal from "../components/InviteMembersModal";

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.data.projects);
  const isDarkMode = useSelector((state) => state.global.isDarkMode);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getAll();
      dispatch(setProjects(data || []));
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
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingId) {
        await projectAPI.update(editingId, formData);
      } else {
        await projectAPI.create(formData);
      }
      await fetchProjects();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        status: "Active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectAPI.delete(id);
        await fetchProjects();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date || new Date().toISOString().split("T")[0],
      endDate: project.end_date || "",
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  if (loading) return <div className="p-8">Loading projects...</div>;

  return (
    <div className="container h-full w-full bg-gray-100 p-8 dark:bg-gray-900">
      {showInviteModal && (
        <InviteMembersModal
          projectId={selectedProjectId}
          onClose={() => setShowInviteModal(false)}
          onInviteSent={() => fetchProjects()}
        />
      )}

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">Projects</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              status: "Active",
              startDate: new Date().toISOString().split("T")[0],
              endDate: "",
            });
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          New Project
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
            {editingId ? "Edit Project" : "New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter project name"
                />
              </div>
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
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
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
                placeholder="Enter project description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
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
                {editingId ? "Update Project" : "Create Project"}
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
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={projects || []}
            columns={[
              { field: "id", headerName: "ID", width: 70 },
              { field: "name", headerName: "Name", width: 200 },
              { field: "description", headerName: "Description", width: 250 },
              { field: "status", headerName: "Status", width: 120 },
              { 
                field: "start_date", 
                headerName: "Start Date", 
                width: 150,
                renderCell: (params) => {
                  const value = params.value;
                  if (!value) return "-";
                  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = value.split('-');
                    return `${month}/${day}/${year}`;
                  }
                  return value;
                }
              },
              { 
                field: "end_date", 
                headerName: "End Date", 
                width: 150,
                renderCell: (params) => {
                  const value = params.value;
                  if (!value) return "-";
                  if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const [year, month, day] = value.split('-');
                    return `${month}/${day}/${year}`;
                  }
                  return value;
                }
              },
              {
                field: "actions",
                headerName: "Actions",
                width: 200,
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProjectId(params.row.id);
                        setShowInviteModal(true);
                      }}
                      className="rounded bg-green-500 px-2 py-1 text-white text-xs hover:bg-green-600"
                      title="Invite members"
                    >
                      <Users className="h-4 w-4" />
                    </button>
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

export default ProjectsPage;
