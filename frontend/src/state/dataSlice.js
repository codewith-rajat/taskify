import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  projects: [],
  tasks: [],
  users: [],
  teams: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setUser,
  setProjects,
  setTasks,
  setUsers,
  setTeams,
  addTask,
  updateTask,
  deleteTask,
} = dataSlice.actions;

export default dataSlice.reducer;
