import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MoodStats {
  mood: string;
  count: number;
}

export default function StatsPie() {
  const [stats, setStats] = useState<MoodStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('mood')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Count mood occurrences
      const moodCounts = data?.reduce((acc: Record<string, number>, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {}) || {};

      const statsArray = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count: count as number
      }));

      setStats(statsArray);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const moodColors = {
    happy: '#F59E0B',
    sad: '#3B82F6',
    anxious: '#F97316',
    angry: '#EF4444',
    excited: '#EC4899',
    grateful: '#8B5CF6',
    neutral: '#6B7280',
    positive: '#10B981',
    negative: '#DC2626'
  };

  const chartData = {
    labels: stats.map(s => s.mood.charAt(0).toUpperCase() + s.mood.slice(1)),
    datasets: [
      {
        data: stats.map(s => s.count),
        backgroundColor: stats.map(s => moodColors[s.mood as keyof typeof moodColors] || '#6B7280'),
        borderColor: '#fff',
        borderWidth: 2,
      }
    ]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = stats.reduce((sum, stat) => sum + stat.count, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} entries (${percentage}%)`;
          }
        }
      }
    }
  };

  const totalEntries = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Mood Distribution
      </h3>
      
      {totalEntries > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total entries: {totalEntries}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Pie data={chartData} options={options} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No entries yet. Start journaling to see your mood distribution!</p>
        </div>
      )}
    </div>
  );
}