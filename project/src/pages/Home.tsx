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
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Express your thoughts and feelings. Our AI will help you understand your emotional patterns and provide personalized insights.
        </p>
      </div>

      <EntryForm onEntryCreated={handleEntryCreated} />

      <div key={refreshKey}>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Your Entries</h2>
        <History />
      </div>
    </div>
  );
}