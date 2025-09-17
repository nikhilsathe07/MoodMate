import CalendarView from "../components/CalendarView";

export default function CalendarPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mt-6">
      {/* Header Section */}
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Mood Calendar
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Visualize your emotional journey through time. Each day shows your
          predominant mood based on your journal entries.
        </p>
      </div>

      {/* Calendar Container */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <CalendarView />
      </div>
    </div>
  );
}
