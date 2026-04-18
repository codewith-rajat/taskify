import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { projectMembersAPI } from "../services/api";
import { setProjects } from "../state/dataSlice";

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    acceptInvitation();
  }, []);

  const acceptInvitation = async () => {
    try {
      const token = searchParams.get("token");
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      const response = await projectMembersAPI.acceptInvitation(token);
      setProjectName(response.projectName);
      setSuccess(true);
 
      setTimeout(() => {
        dispatch(setProjects([]));
        navigate("/projects");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Processing invitation...
            </p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ✅ Success!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been added to the project <strong>{projectName}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Redirecting to projects...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ❌ Error
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full rounded-lg bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
