'use client';

export default function StatusToggle({ status, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggle('active')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Active
      </button>
      <button
        onClick={() => onToggle('paused')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          status === 'paused'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Paused
      </button>
      <button
        onClick={() => onToggle('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          status === 'all'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
    </div>
  );
}
