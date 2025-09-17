import { useState, useEffect } from "react";
import { format, startOfMonth } from "date-fns";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import {
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Trash2,
  Download,
  Table,
  Grid,
  Calendar,
  Search,
  Filter,
} from "lucide-react";

interface Entry {
  id: string;
  created_at: string;
  mood: string;
  confidence: number;
  text: string | null;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Entry>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [showFilters, setShowFilters] = useState(false);
  const entriesPerPage = 8;
  const { user } = useAuth();
  const { isDark } = useTheme();

  const moodColors: Record<string, string> = {
    sad: "#3B82F6", // Calm Blue
    surprise: "#A855F7", // Bright Purple
    fear: "#F97316", // Deep Orange
    anger: "#DC2626", // Strong Red
    // grateful: "#9333EA", // Rich Purple
    neutral: "#6B7280", // Medium Gray
    positive: "#10B981", // Emerald Green
    negative: "#991B1B", // Dark Crimson
    // sadness: "#2563EB", // Deeper Blue (distinct from neutral sadness)
    disgust: "#065F46", // Deep Teal Green
    joy: "#FACC15", // Bright Golden
    unknown: "#9CA3AF", // Soft Gray
  };

  const moods = [
    "all",
    ...Object.keys(moodColors).filter((m) => m !== "unknown"),
  ];

  useEffect(() => {
    if (!user) {
      setError("Please sign in to view your entries.");
      setLoading(false);
      return;
    }
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("entries")
        .select("id, created_at, mood, confidence, text")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message || "Failed to fetch entries");

      const normalizedEntries =
        data?.map((entry) => ({
          ...entry,
          mood: entry.mood
            ? entry.mood.toLowerCase() === "sadness"
              ? "sad"
              : entry.mood.toLowerCase()
            : "unknown",
          text: entry.text || null,
        })) || [];

      setEntries(normalizedEntries);
      setFilteredEntries(normalizedEntries);
    } catch (error: any) {
      setError(error.message || "Failed to load entries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
      setEntries(entries.filter((entry) => entry.id !== id));
      setFilteredEntries(filteredEntries.filter((entry) => entry.id !== id));
    } catch (error: any) {
      setError(error.message || "Failed to delete entry. Please try again.");
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterEntries(term, moodFilter, dateRange);
  };

  const handleMoodFilter = (mood: string) => {
    setMoodFilter(mood);
    filterEntries(searchTerm, mood, dateRange);
  };

  const handleDateRange = (field: "start" | "end", value: string) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    filterEntries(searchTerm, moodFilter, newRange);
  };

  const filterEntries = (
    term: string,
    mood: string,
    range: { start: string; end: string }
  ) => {
    let filtered = entries;
    if (term) {
      filtered = filtered.filter((entry) =>
        entry.text?.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (mood !== "all") {
      filtered = filtered.filter((entry) => entry.mood === mood);
    }
    if (range.start && range.end) {
      filtered = filtered.filter(
        (entry) =>
          entry.created_at >= range.start && entry.created_at <= range.end
      );
    }
    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof Entry) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortField === "created_at") {
      return (
        direction * (new Date(aValue).getTime() - new Date(bValue).getTime())
      );
    }
    if (sortField === "mood" || sortField === "text") {
      return (
        direction * String(aValue || "").localeCompare(String(bValue || ""))
      );
    }
    if (sortField === "confidence") {
      return direction * (Number(aValue || 0) - Number(bValue || 0));
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const paginatedEntries = sortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Custom CSV export function
  const exportToCSV = () => {
    const headers = ["Date,Mood,Confidence,Text"];
    const csvContent = [
      ...headers,
      ...filteredEntries.map((entry) => {
        const formattedDate = format(
          new Date(entry.created_at),
          "MMM dd, yyyy HH:mm"
        );
        const mood = entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1);
        const confidence = `${(entry.confidence * 100).toFixed(0)}%`;
        const text = entry.text
          ? `"${entry.text.replace(/"/g, '""')}"`
          : "No text";
        return `${formattedDate},${mood},${confidence},${text}`;
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `journal_entries_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPagination = () => (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
        {Math.min(currentPage * entriesPerPage, filteredEntries.length)} of{" "}
        {filteredEntries.length} entries
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-all duration-200 text-sm"
          aria-label="Previous page"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              currentPage === page
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                : "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50"
            } transition-all duration-200`}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-all duration-200 text-sm"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-6">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-red-500 dark:text-red-400 text-center text-lg">
            {error}
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            {error.includes("sign in") ? (
              <Link
                to="/login"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md"
                aria-label="Sign in"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={fetchEntries}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md flex items-center space-x-2"
                aria-label="Retry fetching entries"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 mt-6">
      {/* Header Section */}
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          Journal Entries
        </h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          View and manage all your journal entries. Filter by mood, date, or
          search content to find what you need.
        </p>
      </div>

      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchEntries}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-all duration-200"
              aria-label="Refresh entries"
              title="Refresh entries"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "cards" : "table")
              }
              className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-all duration-200"
              aria-label={`Switch to ${
                viewMode === "table" ? "card" : "table"
              } view`}
              title={`Switch to ${
                viewMode === "table" ? "card" : "table"
              } view`}
            >
              {viewMode === "table" ? (
                <Grid className="w-5 h-5" />
              ) : (
                <Table className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={exportToCSV}
              className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 transition-all duration-200"
              aria-label="Export entries as CSV"
              title="Export entries as CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Filter Toggle */}

        {/* <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <span className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div> */}

        {/* Filters */}
        <div
          className={`${
            showFilters || !showFilters ? "block" : "hidden"
          } sm:block mb-6 space-y-4`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500"
                aria-label="Search entries by text"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={moodFilter}
                onChange={(e) => handleMoodFilter(e.target.value)}
                className="pl-10 w-full px-4 py-2 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                aria-label="Filter by mood"
              >
                {moods.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood === "all"
                      ? "All Moods"
                      : mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => handleDateRange("start", e.target.value)}
                  className="pl-10 w-full px-3 py-2 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  aria-label="Start date filter"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => handleDateRange("end", e.target.value)}
                  className="pl-10 w-full px-3 py-2 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  aria-label="End date filter"
                />
              </div>
            </div>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg text-center">
              No entries match your filters. Try adjusting your search or
              filters.
            </p>
            <Link
              to="/"
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md"
              aria-label="Start journaling"
            >
              Start Journaling
            </Link>
          </div>
        ) : viewMode === "table" ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200/50 dark:border-gray-700/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === "created_at" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="inline w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="inline w-4 h-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => handleSort("mood")}
                    >
                      <div className="flex items-center">
                        Mood
                        {sortField === "mood" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="inline w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="inline w-4 h-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => handleSort("confidence")}
                    >
                      <div className="flex items-center">
                        Confidence
                        {sortField === "confidence" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="inline w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="inline w-4 h-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {format(
                          new Date(entry.created_at),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                          style={{
                            backgroundColor:
                              moodColors[entry.mood] || moodColors.unknown,
                            color: "#fff",
                          }}
                        >
                          {entry.mood.charAt(0).toUpperCase() +
                            entry.mood.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                        {(entry.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label="Delete entry"
                          title="Delete entry"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination()}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {format(
                          new Date(entry.created_at),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                      <span
                        className="inline-block px-3 py-1 mt-2 rounded-full text-xs font-medium shadow-sm"
                        style={{
                          backgroundColor:
                            moodColors[entry.mood] || moodColors.unknown,
                          color: "#fff",
                        }}
                      >
                        {entry.mood.charAt(0).toUpperCase() +
                          entry.mood.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete entry"
                      title="Delete entry"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Confidence:</span>{" "}
                      <span className="font-semibold">
                        {(entry.confidence * 100).toFixed(0)}%
                      </span>
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Entry:
                      </p>
                      <p
                        className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3"
                        title={entry.text || "No text"}
                      >
                        {entry.text || "No text"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
