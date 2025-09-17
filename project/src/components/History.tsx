import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Search, Edit3, Trash2, Filter } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import MoodResult from "./MoodResult";


// made changes here
interface Entry {
  id: string;
  text: string; // changed from content to text
  mood: string;
  confidence: number;
  created_at: string;
}

export default function History() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user } = useAuth();

  const moods = [
    "sad",
    "surprise",
    "fear",
    "anger",
    "neutral",
    "positive",
    "negative",
    "disgust",
    "joy",
  ];


  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedMood]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5); // Only fetch last 5 entries

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    // Work only with the last 5 entries (already limited in fetch)
    let filtered = [...entries];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((entry) =>
        entry.text
          ? entry.text.toLowerCase().includes(searchTerm.toLowerCase())
          : false
      );
    }

    // Apply mood filter
    if (selectedMood) {
      filtered = filtered.filter((entry) => entry.mood === selectedMood);
    }

    setFilteredEntries(filtered);
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from("entries")
        .update({ content: editContent })
        .eq("id", id);

      if (error) throw error;

      setEditingId(null);
      setEditContent("");
      fetchEntries(); // Refetch to get updated data
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const { error } = await supabase.from("entries").delete().eq("id", id);

      if (error) throw error;
      fetchEntries(); // Refetch to update the list
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const startEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-5 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search recent entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none transition-all"
            >
              <option value="">All moods</option>
              {moods.map((mood) => (
                <option key={mood} value={mood} className="capitalize">
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-5">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {entries.length === 0
                ? "No journal entries yet. Start writing!"
                : "No recent entries match your search."}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-5 border border-gray-200/50 dark:border-gray-700/50 transition-all hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}
                </div>
                <div className="flex space-x-1">
                  {/* Entities edit button */}

                  {/* <button
                    onClick={() => startEdit(entry)}
                    className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button> */}

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingId === entry.id ? (
                <div className="space-y-4 mt-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(entry.id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap leading-relaxed">
                    {entry.text}
                  </p>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700/50">
                    <MoodResult
                      mood={entry.mood}
                      confidence={entry.confidence}
                    />
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
