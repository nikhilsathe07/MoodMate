import React from "react";
import EntryForm from "../components/EntryForm";
import History from "../components/History";

export default function Home() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleEntryCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 mt-6">
      {/* Hero Section */}
      <div className="text-center py-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Welcome to Your Journal
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mx-auto leading-relaxed">
          ✨ Express your thoughts and feelings. Our AI helps you discover
          emotional patterns and offers personalized insights.
        </p>
      </div>

      {/* Entry Form Section */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <EntryForm onEntryCreated={handleEntryCreated} />
      </div>

      {/* History Section */}
      <div
        key={refreshKey}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Entries
        </h2>
        <History />
      </div>
    </div>
  );
}
