import { Heart, Smile, Frown, Meh, Zap, Angry } from 'lucide-react';

interface MoodResultProps {
  mood: string;
  confidence: number;
}

const moodConfig = {
  happy: { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  sad: { icon: Frown, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  anxious: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  angry: { icon: Angry, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  excited: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800' },
  grateful: { icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' },
  neutral: { icon: Meh, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-200 dark:border-gray-800' },
  positive: { icon: Smile, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  negative: { icon: Frown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' }
};

export default function MoodResult({ mood, confidence }: MoodResultProps) {
  const config = moodConfig[mood as keyof typeof moodConfig] || moodConfig.neutral;
  const Icon = config.icon;
  
  const confidencePercentage = Math.round(confidence * 100);

  const getSuggestion = (mood: string) => {
    const suggestions = {
      sad: "Consider taking a gentle walk, listening to uplifting music, or reaching out to a friend who makes you smile.",
      anxious: "Try some deep breathing exercises, meditation, or writing down what's worrying you to help process these feelings.",
      angry: "Take some time to cool down. Deep breaths, physical exercise, or journaling can help channel this energy positively.",
      negative: "Remember that difficult feelings are temporary. Consider doing something kind for yourself or others today."
    };
    return suggestions[mood as keyof typeof suggestions];
  };

  const suggestion = getSuggestion(mood);

  return (
    <div className={`p-6 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            Detected Mood: {mood}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Confidence: {confidencePercentage}%
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500`}
          style={{ width: `${confidencePercentage}%` }}
        ></div>
      </div>

      {suggestion && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Suggestion:</span> {suggestion}
          </p>
        </div>
      )}
    </div>
  );
}