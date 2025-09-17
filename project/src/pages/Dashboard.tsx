import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import MoodChart from "../components/MoodChart";
import StatsPie from "../components/StatsPie";
import { BarChart3, TrendingUp, Calendar, Heart } from "lucide-react";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  subDays as subtractDays,
} from "date-fns";

interface Stats {
  totalEntries: number;
  thisWeekEntries: number;
  avgMood: string;
  streak: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    thisWeekEntries: 0,
    avgMood: "--",
    streak: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get all entries for calculations
      const { data: entries, error: entriesError } = await supabase
        .from("entries")
        .select("id, created_at, mood")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (entriesError) throw entriesError;

      // Calculate total entries
      const totalEntries = entries?.length || 0;

      // Calculate this week's entries
      const startOfWeekDate = startOfWeek(new Date());
      const endOfWeekDate = endOfWeek(new Date());

      const thisWeekEntries =
        entries?.filter((entry) => {
          const entryDate = new Date(entry.created_at);
          return entryDate >= startOfWeekDate && entryDate <= endOfWeekDate;
        }).length || 0;

      // Calculate average mood (based on mood frequency)
      let avgMood = "--";
      if (entries && entries.length > 0) {
        const moodCount: Record<string, number> = {};
        entries.forEach((entry) => {
          const mood = entry.mood?.toLowerCase() || "unknown";
          moodCount[mood] = (moodCount[mood] || 0) + 1;
        });

        // Find most frequent mood
        const mostFrequentMood =
          Object.entries(moodCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          "Neutral";

        avgMood =
          mostFrequentMood.charAt(0).toUpperCase() + mostFrequentMood.slice(1);
      }

      // Calculate streak (consecutive days with entries)
      let streak = 0;
      if (entries && entries.length > 0) {
        const entryDates = entries.map((entry) =>
          new Date(entry.created_at).toDateString()
        );
        const uniqueDates = [...new Set(entryDates)].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );

        let currentDate = new Date();
        for (let i = 0; i < uniqueDates.length; i++) {
          const entryDate = new Date(uniqueDates[i]);
          if (isSameDay(entryDate, currentDate)) {
            streak++;
            currentDate = subtractDays(currentDate, 1);
          } else {
            break;
          }
        }
      }

      setStats({
        totalEntries,
        thisWeekEntries,
        avgMood,
        streak,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh stats when needed (you can call this from other components)
  const refreshStats = () => {
    if (user) {
      fetchStats();
    }
  };

  const statCards = [
    {
      title: "Total Entries",
      value: loading ? "--" : stats.totalEntries,
      icon: BarChart3,
      gradient: "from-purple-500 to-purple-600",
      iconColor: "text-purple-200",
      textColor: "text-purple-100",
    },
    {
      title: "This Week",
      value: loading ? "--" : stats.thisWeekEntries,
      icon: Calendar,
      gradient: "from-pink-500 to-pink-600",
      iconColor: "text-pink-200",
      textColor: "text-pink-100",
    },
    {
      title: "Avg Mood",
      value: loading ? "--" : stats.avgMood,
      icon: Heart,
      gradient: "from-indigo-500 to-indigo-600",
      iconColor: "text-indigo-200",
      textColor: "text-indigo-100",
    },
    {
      title: "Streak",
      value: loading ? "--" : `${stats.streak} days`,
      icon: TrendingUp,
      gradient: "from-teal-500 to-teal-600",
      iconColor: "text-teal-200",
      textColor: "text-teal-100",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mt-6">
      {/* Header Section */}
      <div className="text-center py-4 sm:py-6">
        <div className="flex justify-center gap-4 items-center mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mood Analytics
          </h1>

          {/* <button
            onClick={refreshStats}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Refresh dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button> */}

        </div>

        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Discover patterns in your emotional well-being and track your journey
          over time.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.gradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs sm:text-sm font-medium ${card.textColor}`}
                >
                  {card.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1">
                  {card.value}
                </p>
              </div>
              <card.icon
                className={`w-6 h-6 sm:w-8 sm:h-8 ${card.iconColor}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <MoodChart />
        </div>
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <StatsPie />
        </div>
      </div>
    </div>
  );
}
