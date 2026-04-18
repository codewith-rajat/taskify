import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { taskAPI } from "../services/api";
import TaskDetailModal from "./TaskDetailModal";

const TaskCard = ({ task, onTaskClick }) => {
  const priorityColors = {
    "Urgent": "bg-red-500",
    "High": "bg-orange-500",
    "Medium": "bg-yellow-500",
    "Low": "bg-green-500"
  };

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={() => onTaskClick(task)}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all cursor-move hover:shadow-md ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
        {task.title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold text-white px-2 py-1 rounded ${priorityColors[task.priority] || 'bg-gray-500'}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            📅 {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

const StatusColumn = ({ status, tasks, onTaskClick, onDrop }) => {
  const statusColors = {
    "To Do": "bg-gray-100 dark:bg-gray-700",
    "In Progress": "bg-blue-100 dark:bg-blue-900/30",
    "In Review": "bg-purple-100 dark:bg-purple-900/30",
    "Done": "bg-green-100 dark:bg-green-900/30"
  };

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item) => {
      onDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`${statusColors[status]} rounded-lg p-4 ${isOver ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          {status}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {tasks.filter((t) => t.status === status).length} tasks
        </p>
      </div>

      <div className="space-y-3 min-h-[400px]">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-3 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors">
        <Plus size={18} className="mr-2" /> Add Task
      </button>
    </div>
  );
};

const KanbanBoard = ({ projectId }) => {
  const tasks = useSelector((state) => state.data.tasks);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const isDarkMode = useSelector((state) => state.global.isDarkMode);

  const taskStatus = ["To Do", "In Progress", "In Review", "Done"];


  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDrop = async (taskId, newStatus) => {
    try {
      await taskAPI.updateStatus(taskId, newStatus);
      const updatedTasks = localTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setLocalTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">🎯 Kanban Board</h1>

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              tasks={localTasks}
              onTaskClick={setSelectedTask}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
