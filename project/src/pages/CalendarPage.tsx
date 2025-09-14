import React from 'react';
import CalendarView from '../components/CalendarView';

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Mood Calendar
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Visualize your emotional journey through time. Each day shows your predominant mood based on your journal entries.
        </p>
      </div>

      <CalendarView />
    </div>
  );
}