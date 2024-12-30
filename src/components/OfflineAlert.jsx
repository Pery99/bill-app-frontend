import { SignalSlashIcon } from '@heroicons/react/24/outline';

function OfflineAlert({ onRetry }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-50 p-4 rounded-lg shadow-lg border border-red-100 max-w-md">
      <div className="flex items-start space-x-3">
        <SignalSlashIcon className="w-6 h-6 text-red-600" />
        <div>
          <h3 className="text-sm font-medium text-red-800">You're offline</h3>
          <p className="text-sm text-red-600 mt-1">
            Check your internet connection
          </p>
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfflineAlert;
