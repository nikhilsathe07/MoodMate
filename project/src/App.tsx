
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Auth from './pages/Auth';
import EntriesPage from './pages/EntriesPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Background Gradient */}
          {/* <div
            className="min-h-screen bg-gradient-to-br 
                from-violet-100 via-rose-100 to-sky-100 
                dark:from-gray-950 dark:via-fuchsia-800/30 dark:to-indigo-800/30 
                transition-colors duration-300"
          > */}

          <div
            className="min-h-screen bg-gradient-to-br
    from-pink-50 via-purple-50 to-indigo-100
    dark:from-gray-950 dark:via-purple-950 dark:to-slate-900
    bg-[length:200%_200%] animate-gradient-flow
    transition-colors duration-700"
          >
            
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/entries"
                  element={
                    <ProtectedRoute>
                      <EntriesPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;