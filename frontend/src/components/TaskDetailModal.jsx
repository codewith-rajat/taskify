import React, { useState, useEffect } from "react";
import { X, Send, Trash2, Loader, Reply } from "lucide-react";
import FileUploadComponent from "./FileUploadComponent";

const TaskDetailModal = ({ task, onClose, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [task?.id]);

  const fetchComments = async () => {
    if (!task?.id) return;

    try {
      setLoadingComments(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/comments?taskId=${task.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("token");
      
      let messageContent = newComment;
      if (replyingTo) {
        const findComment = (commentsList) => {
          for (let comment of commentsList) {
            if (comment.id === replyingTo) return comment;
            if (comment.replies) {
              const found = findComment(comment.replies);
              if (found) return found;
            }
          }
          return null;
        };
        const parentComment = findComment(comments);
        if (parentComment) {
          messageContent = `@${parentComment.username} ${newComment}`;
        }
      }

      const response = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: messageContent,
          taskId: task.id,
          parentCommentId: replyingTo,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setReplyingTo(null);
        await fetchComments();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const renderComment = (comment, depth = 0) => {
   
    const renderCommentText = (text) => {
      const parts = text.split(/(@\w+)/);
      return parts.map((part, idx) => 
        part.startsWith('@') ? (
          <span key={idx} className="font-semibold text-blue-600 dark:text-blue-400">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-8 mt-3" : ""}`}>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.username || "User"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {renderCommentText(comment.content)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" /> Reply
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      "To Do": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "In Review": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "Done": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
    return colors[status] || colors["To Do"];
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        <div className="p-6 space-y-6">
   
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Description
              </p>
              <p className="text-gray-900 dark:text-white">
                {task.description || "No description"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Priority
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}
                >
                  {task.priority}
                </span>
              </div>

              {task.dueDate && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Due Date
                  </p>
                  <p className="text-gray-900 dark:text-white">{task.dueDate}</p>
                </div>
              )}
            </div>
          </div>

      
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <FileUploadComponent taskId={task.id} />
          </div>

       
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💬 Comments
            </h3>

         
            {loadingComments ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="h-5 w-5 animate-spin" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => renderComment(comment))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No comments yet. Be the first to comment!
              </p>
            )}

       
            <form onSubmit={handleAddComment} className="flex flex-col gap-2">
              {replyingTo && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm text-blue-600 dark:text-blue-400">
                  <span>Replying to comment #{replyingTo}</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-xs hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {submittingComment ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
