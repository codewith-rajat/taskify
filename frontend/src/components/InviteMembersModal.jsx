import React, { useState } from "react";
import { X, Users, Copy, Check } from "lucide-react";
import { projectMembersAPI } from "../services/api";

const InviteMembersModal = ({ projectId, onClose, onInviteSent }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    try {
      setLoading(true);
      const response = await projectMembersAPI.inviteMember(projectId, email);
      setInvitationLink(response.invitationLink);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
       
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invite Members
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

      
        {!success ? (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter member's email"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Invitation"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Check className="h-5 w-5" />
                <p className="font-semibold">Invitation sent successfully!</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                />
                <button
                  onClick={handleCopyLink}
                  className="rounded-lg bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share this link with the member to join the project. Link expires in 7 days.
            </p>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteMembersModal;
