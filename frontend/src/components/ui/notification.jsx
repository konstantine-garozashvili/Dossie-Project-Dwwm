/**
 * Notification component for displaying Firebase notifications
 */

import { useState, useEffect } from 'react';
import { onMessageListener } from '../../lib/firebase';
import { X } from 'lucide-react';

/**
 * NotificationToast component displays Firebase notifications in the UI
 * @returns {JSX.Element|null} The notification toast component
 */
export function NotificationToast() {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Set up Firebase message listener
    const unsubscribe = onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
          data: payload.data
        });
        setShow(true);
      })
      .catch((err) => console.error('Failed to set up message listener:', err));

    // Auto-hide notification after 5 seconds
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setShow(false);
      }, 5000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [show]);

  if (!show || !notification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.body}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShow(false)}
            >
              <span className="sr-only">Fermer</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * NotificationRequestButton component displays a button to request notification permissions
 * @param {Object} props - Component props
 * @param {Function} props.onRequest - Function to call when requesting permissions
 * @param {boolean} props.disabled - Whether the button is disabled
 * @returns {JSX.Element} The notification request button component
 */
export function NotificationRequestButton({ onRequest, disabled = false }) {
  return (
    <button
      onClick={onRequest}
      disabled={disabled}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      Activer les notifications
    </button>
  );
}