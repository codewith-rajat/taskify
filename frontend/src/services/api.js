const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const authAPI = {
  register: (userData) =>
    fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  logout: () => {
    localStorage.removeItem("token");
    return Promise.resolve();
  },
  getCurrentUser: () => fetchWithAuth("/auth/me"),
};

export const projectAPI = {
  getAll: () => fetchWithAuth("/projects"),
  getById: (id) => fetchWithAuth(`/projects/${id}`),
  create: (projectData) =>
    fetchWithAuth("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),
  update: (id, projectData) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    }),
  delete: (id) =>
    fetchWithAuth(`/projects/${id}`, {
      method: "DELETE",
    }),
};

export const taskAPI = {
  getByProject: (projectId) =>
    fetchWithAuth(`/tasks?projectId=${projectId}`),
  getById: (id) => fetchWithAuth(`/tasks/${id}`),
  create: (taskData) =>
    fetchWithAuth("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    }),
  update: (id, taskData) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    }),
  delete: (id) =>
    fetchWithAuth(`/tasks/${id}`, {
      method: "DELETE",
    }),
  updateStatus: (id, status) =>
    fetchWithAuth(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
export const userAPI = {
  getAll: () => fetchWithAuth("/users"),
  getById: (id) => fetchWithAuth(`/users/${id}`),
  update: (id, userData) =>
    fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
};

export const teamAPI = {
  getAll: () => fetchWithAuth("/teams"),
  getById: (id) => fetchWithAuth(`/teams/${id}`),
  create: (teamData) =>
    fetchWithAuth("/teams", {
      method: "POST",
      body: JSON.stringify(teamData),
    }),
  update: (id, teamData) =>
    fetchWithAuth(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(teamData),
    }),
  delete: (id) =>
    fetchWithAuth(`/teams/${id}`, {
      method: "DELETE",
    }),
};

export const searchAPI = {
  search: (query) =>
    fetchWithAuth(`/search?q=${encodeURIComponent(query)}`),
};

export const commentAPI = {
  getByTask: (taskId) => fetchWithAuth(`/comments?taskId=${taskId}`),
  create: (commentData) =>
    fetchWithAuth("/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    }),
  delete: (id) =>
    fetchWithAuth(`/comments/${id}`, {
      method: "DELETE",
    }),
};

export const projectMembersAPI = {
  getMembers: (projectId) => fetchWithAuth(`/project-members/${projectId}`),
  inviteMember: (projectId, email) =>
    fetchWithAuth(`/project-members/${projectId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  acceptInvitation: (token) =>
    fetchWithAuth(`/project-members/accept`, {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  removeMember: (projectId, memberId) =>
    fetchWithAuth(`/project-members/${projectId}/members/${memberId}`, {
      method: "DELETE",
    }),
};
