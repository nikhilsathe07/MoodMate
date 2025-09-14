import CalendarView from '../components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Mood Calendar
        </h1>
        <p className="text-xl text-gray-700 dark:text-black-300 max-w-3xl mx-auto text-center leading-relaxed">
          Visualize your emotional journey through time. Each day shows your
          predominant mood based on your journal entries.
        </p>
      </div>

      <CalendarView />
    </div>
  );
}