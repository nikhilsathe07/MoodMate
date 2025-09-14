import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { analyzeMood } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import MoodResult from './MoodResult';

interface EntryFormProps {
  onEntryCreated?: () => void;
}

export default function EntryForm({ onEntryCreated }: EntryFormProps) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodResult, setMoodResult] = useState<any>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsAnalyzing(true);
    try {
      // Analyze mood
      const mood = await analyzeMood(content);
      
      // Save to database
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        text: content,       // 🔹 must match table column
        mood: mood.mood,
        confidence: mood.confidence
      });

      if (error) throw error;

      setMoodResult(mood);
      setContent('');
      if (onEntryCreated) onEntryCreated();
    } catch (error) {
      console.error('Error creating entry:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="journal-entry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How are you feeling today?
          </label>
          <textarea
            id="journal-entry"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day, thoughts, or feelings..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isAnalyzing}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>{isAnalyzing ? 'Analyzing mood...' : 'Save Entry'}</span>
        </button>
      </form>

      {moodResult && (
        <div className="mt-6">
          <MoodResult mood={moodResult.mood} confidence={moodResult.confidence} />
        </div>
      )}
    </div>
  );
}