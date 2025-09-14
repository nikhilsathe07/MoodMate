import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import 'react-calendar/dist/Calendar.css';

interface EntryDate {
  date: string;
  mood: string;
  confidence: number;
}

export default function CalendarView() {
  const [entryDates, setEntryDates] = useState<EntryDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntries, setSelectedEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const moodColors = {
    happy: 'bg-yellow-400',
    sad: 'bg-blue-400',
    anxious: 'bg-orange-400',
    angry: 'bg-red-400',
    excited: 'bg-pink-400',
    grateful: 'bg-purple-400',
    neutral: 'bg-gray-400',
    positive: 'bg-green-400',
    negative: 'bg-red-500'
  };

  useEffect(() => {
    if (user) {
      fetchEntryDates();
    }
  }, [user]);

  useEffect(() => {
    fetchEntriesForDate(selectedDate);
  }, [selectedDate, user]);

  const fetchEntryDates = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('mood, confidence, created_at')
        .eq('user_id', user?.id);

      if (error) throw error;

      const dates = data?.map(entry => ({
        date: format(new Date(entry.created_at), 'yyyy-MM-dd'),
        mood: entry.mood,
        confidence: entry.confidence
      })) || [];

      setEntryDates(dates);
    } catch (error) {
      console.error('Error fetching entry dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntriesForDate = async (date: Date) => {
    try {
      const startOfDayISO = format(date, 'yyyy-MM-dd') + 'T00:00:00';
      const endOfDayISO = format(date, 'yyyy-MM-dd') + 'T23:59:59';

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startOfDayISO)
        .lte('created_at', endOfDayISO)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSelectedEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries for date:', error);
    }
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entryDates.filter(entry => entry.date === dateStr);
    
    if (dayEntries.length === 0) return null;

    // Get the predominant mood of the day
    const moodCounts = dayEntries.reduce((acc: Record<string, number>, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});

    const predominantMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    return (
      <div className="flex justify-center mt-1">
        <div className={`w-2 h-2 rounded-full ${moodColors[predominantMood as keyof typeof moodColors] || 'bg-gray-400'}`}></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Mood Calendar
        </h3>
        
        <div className="calendar-container">
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            tileContent={tileContent}
            className="custom-calendar dark:text-white"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(moodColors).map(([mood, color]) => (
            <div key={mood} className="flex items-center space-x-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${color}`}></div>
              <span className="text-gray-600 dark:text-gray-400 capitalize">{mood}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Entries for {format(selectedDate, 'PPP')}
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {selectedEntries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No entries for this date
            </p>
          ) : (
            selectedEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    moodColors[entry.mood as keyof typeof moodColors] || 'bg-gray-400'
                  } text-white`}>
                    {entry.mood}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(entry.created_at), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {entry.content}
                </p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Confidence: {Math.round(entry.confidence * 100)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        
        .custom-calendar .react-calendar__tile {
          background: transparent;
          border: 1px solid transparent;
          color: inherit;
          padding: 0.75rem 0.25rem;
        }
        
        .custom-calendar .react-calendar__tile:enabled:hover,
        .custom-calendar .react-calendar__tile:enabled:focus {
          background-color: rgba(147, 51, 234, 0.1);
        }
        
        .custom-calendar .react-calendar__tile--active {
          background: rgb(147, 51, 234) !important;
          color: white;
        }
        
        .custom-calendar .react-calendar__tile--now {
          background: rgba(147, 51, 234, 0.2);
        }
        
        .custom-calendar .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: rgb(107, 114, 128);
        }
        
        .custom-calendar .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        
        .custom-calendar .react-calendar__navigation button {
          background: rgba(147, 51, 234, 0.1);
          border: none;
          color: inherit;
          font-size: 1rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        
        .custom-calendar .react-calendar__navigation button:enabled:hover,
        .custom-calendar .react-calendar__navigation button:enabled:focus {
          background: rgba(147, 51, 234, 0.2);
        }
      `}</style>
    </div>
  );
}