import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="mt-3 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 space-x-4">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
