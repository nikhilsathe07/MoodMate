import { useState, useEffect, useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface MoodStats {
  mood: string;
  count: number;
}

const moodColors: Record<string, string> = {
  happy: "#F59E0B", // Yellow
  sad: "#3B82F6", // Blue
  anxious: "#F97316", // Orange
  angry: "#EF4444", // Red
  excited: "#EC4899", // Pink
  grateful: "#8B5CF6", // Purple
  neutral: "#4B5563", // Darker gray
  positive: "#10B981", // Green
  negative: "#DC2626", // Dark red
  sadness: "#3B82F6", // Map to sad
  disgust: "#047857", // Dark green, distinct
  joy: "#FBBF24", // Bright yellow, distinct
  unknown: "#D1D5DB", // Light gray
};

export default function StatsPie() {
  const [stats, setStats] = useState<MoodStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setLoading(false);
      setError("Please sign in to view your mood statistics.");
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("entries")
        .select("mood")
        .eq("user_id", user?.id);

      if (error) throw error;

      // Log unique moods
      // const uniqueMoods = [...new Set(data?.map((entry) => entry.mood))];
      // console.log("Unique Supabase moods:", uniqueMoods);

      // Count mood occurrences, normalize and map
      const moodCounts =
        data?.reduce((acc: Record<string, number>, entry) => {
          let mood = (entry.mood || "unknown").toLowerCase();
          // Map known variations
          if (mood === "sadness") mood = "sad";
          if (mood === "joy") mood = "joy";
          if (mood === "disgust") mood = "disgust";
          acc[mood] = (acc[mood] || 0) + 1;
          return acc;
        }, {}) || {};

      const statsArray = Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count: count as number,
      }));

      // Log stats with colors
      // console.log(
      //   "Processed stats with colors:",
      //   statsArray.map((s) => ({
      //     mood: s.mood,
      //     count: s.count,
      //     color: moodColors[s.mood] || moodColors.unknown,
      //   }))
      // );

      setStats(statsArray);
    } catch (error) {
      // console.error("Error fetching stats:", error);
      setError("Failed to load mood statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const data = {
      labels: stats.map(
        (s) => s.mood.charAt(0).toUpperCase() + s.mood.slice(1)
      ),
      datasets: [
        {
          data: stats.map((s) => s.count),
          backgroundColor: stats.map(
            (s) => moodColors[s.mood] || moodColors.unknown
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };
    // console.log("Chart data:", data);
    return data;
  }, [stats]);

  const options: ChartOptions<"pie"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = stats.reduce((sum, stat) => sum + stat.count, 0);
              const percentage = total
                ? ((context.parsed / total) * 100).toFixed(1)
                : "0.0";
              return `${context.label}: ${context.parsed} entries (${percentage}%)`;
            },
          },
        },
      },
    }),
    [stats]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64 text-red-500 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>Please sign in to view your mood statistics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Mood Distribution
      </h3>

      {stats.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total entries: {stats.reduce((sum, stat) => sum + stat.count, 0)}
            </p>
          </div>
          <div className="flex justify-center">
            <div
              className="w-full h-80 sm:h-96"
              aria-label="Pie chart of mood distribution"
            >
              <Pie data={chartData} options={options} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <p>No entries yet. Start journaling to see your mood distribution!</p>
          <Link
            to="/"
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Start Journaling
          </Link>
        </div>
      )}
    </div>
  );
}
