import  { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { format, subDays, startOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MoodData {
  date: string;
  averageMood: number;
  entryCount: number;
}

export default function MoodChart() {
  const [data, setData] = useState<MoodData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isDark } = useTheme();

  const moodToValue = {
    sad: 1,
    negative: 2,
    anxious: 3,
    neutral: 4,
    angry: 3,
    excited: 6,
    grateful: 7,
    happy: 8,
    positive: 7
  };

  useEffect(() => {
    if (user) {
      fetchMoodData();
    }
  }, [user]);

  const fetchMoodData = async () => {
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      
      const { data: entries, error } = await supabase
        .from('entries')
        .select('mood, confidence, created_at')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date and calculate average mood
      const moodByDate = entries?.reduce((acc: Record<string, { total: number; count: number }>, entry) => {
        const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
        const moodValue = moodToValue[entry.mood as keyof typeof moodToValue] || 4;
        
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 };
        }
        
        acc[date].total += moodValue * entry.confidence;
        acc[date].count += entry.confidence;
        
        return acc;
      }, {}) || {};

      // Create data array for last 30 days
      const moodData: MoodData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dayData = moodByDate[date];
        
        moodData.push({
          date,
          averageMood: dayData ? dayData.total / dayData.count : 4,
          entryCount: dayData ? Math.round(dayData.count) : 0
        });
      }

      setData(moodData);
    } catch (error) {
      console.error('Error fetching mood data:', error);
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

  const chartData = {
    labels: data.map(d => format(new Date(d.date), 'MMM dd')),
    datasets: [
      {
        label: 'Mood Trend',
        data: data.map(d => d.averageMood),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: data.map(d => {
          if (d.averageMood >= 6) return '#10B981'; // Green for good mood
          if (d.averageMood >= 4) return '#F59E0B'; // Yellow for neutral
          return '#EF4444'; // Red for low mood
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const mood = context.parsed.y;
            let moodLabel = 'Neutral';
            if (mood >= 7) moodLabel = 'Very Positive';
            else if (mood >= 5.5) moodLabel = 'Positive';
            else if (mood >= 4.5) moodLabel = 'Neutral';
            else if (mood >= 3) moodLabel = 'Negative';
            else moodLabel = 'Very Negative';
            
            return `Mood: ${moodLabel} (${mood.toFixed(1)})`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 1,
        max: 8,
        ticks: {
          stepSize: 1,
          color: isDark ? '#9CA3AF' : '#6B7280',
          callback: (value) => {
            const moodLabels = {
              1: 'Very Sad',
              2: 'Sad',
              3: 'Low',
              4: 'Neutral',
              5: 'Okay',
              6: 'Good',
              7: 'Great',
              8: 'Excellent'
            };
            return moodLabels[value as keyof typeof moodLabels] || '';
          }
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        }
      },
      x: {
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          maxTicksLimit: 10,
        },
        grid: {
          color: isDark ? '#374151' : '#E5E7EB',
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Mood Trend (Last 30 Days)
      </h3>
      
      {data.some(d => d.entryCount > 0) ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No mood data available yet. Start journaling to see your trends!</p>
        </div>
      )}
    </div>
  );
}