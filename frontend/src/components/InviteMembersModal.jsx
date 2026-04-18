import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { projectMembersAPI } from '../services/api';

const InviteMembersModal = ({ projectId, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await projectMembersAPI.inviteMember(projectId, email);
      setInviteLink(response.inviteLink);
      setEmail('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-white">Invite Member</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!inviteLink ? (
          <form onSubmit={handleInvite}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="member@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              ✓ Invitation sent successfully!
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium dark:text-gray-300">
                Share this link with the member:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={copyToClipboard}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                The link expires in 7 days
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
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
