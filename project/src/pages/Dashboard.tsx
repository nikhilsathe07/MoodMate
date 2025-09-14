import React from 'react';
import MoodChart from '../components/MoodChart';
import StatsPie from '../components/StatsPie';
import { BarChart3, TrendingUp, Calendar, Heart } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Mood Analytics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover patterns in your emotional well-being and track your journey over time.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Entries</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">This Week</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <Calendar className="w-8 h-8 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Avg Mood</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <Heart className="w-8 h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Streak</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-200" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <MoodChart />
        <StatsPie />
      </div>
    </div>
  );
}