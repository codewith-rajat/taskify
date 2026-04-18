import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { projectMembersAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { setProjects } from '../state/dataSlice';

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processing invitation...');

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setStatus('error');
          setMessage('Invalid invitation link');
          return;
        }

        await projectMembersAPI.acceptInvitation(token);
        setStatus('success');
        setMessage('Invitation accepted! Redirecting to projects...');
        
        // Clear projects cache to force refresh
        dispatch(setProjects([]));
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/projects');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Failed to accept invitation');
      }
    };

    acceptInvitation();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {status === 'loading' && 'Processing Invitation'}
            {status === 'success' && '✓ Success!'}
            {status === 'error' && '✗ Error'}
          </h1>
        </div>

        <div className={`rounded-lg p-6 ${
          status === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20' 
            : status === 'error' 
            ? 'bg-red-50 dark:bg-red-900/20' 
            : 'bg-blue-50 dark:bg-blue-900/20'
        }`}>
          <p className={`text-center ${
            status === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : status === 'error' 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-blue-700 dark:text-blue-400'
          }`}>
            {message}
          </p>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
