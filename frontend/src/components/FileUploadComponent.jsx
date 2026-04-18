import React, { useState, useEffect } from "react";
import { Upload, Download, Trash2, FileIcon, Loader } from "lucide-react";

const FileUploadComponent = ({ taskId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/uploads/task/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Error fetching attachments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/uploads/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        await fetchAttachments();
        e.target.value = ""; // Reset input
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!window.confirm("Delete this attachment?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/uploads/${attachmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchAttachments();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <Upload className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">
            Attachments
          </h3>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-sm">
            {error}
          </div>
        )}

        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Click to upload</span>
            </>
          )}
        </label>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Max 10MB • Images, PDF, Word documents
        </p>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader className="h-5 w-5 animate-spin" />
        </div>
      ) : files.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {files.length} file(s) attached
          </h4>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatFileSize(file.file_size)} • by {file.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`http://localhost:5000/api/uploads/download/${file.id}`}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 rounded transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No attachments yet. Upload your first file!
        </p>
      )}
    </div>
  );
};

export default FileUploadComponent;
