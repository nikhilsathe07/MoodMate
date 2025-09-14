import React from 'react';
import EntryForm from '../components/EntryForm';
import History from '../components/History';

export default function Home() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleEntryCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Welcome to Your Journal
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
          ✨ Express your thoughts and feelings. Our AI helps you discover
          emotional patterns and offers personalized insights for a better you.
        </p>
      </div>

      <EntryForm onEntryCreated={handleEntryCreated} />

      <div key={refreshKey}>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Your Entries
        </h2>
        <History />
      </div>
    </div>
  );
}