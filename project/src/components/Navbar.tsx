import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Sparkles,
  Notebook,
  Moon,
  Sun,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/dashboard", icon: Sparkles, label: "Dashboard" },
    { to: "/entries", icon: Notebook, label: "All-Entries" },
  ];

  // Extract display name from email
  const getUserDisplayName = (email: string) => {
    return email.split("@")[0];
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl py-2 shadow-lg"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            aria-label="MoodMate Home"
          >
            <div className="p-2 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 shadow-md group-hover:scale-105 transition-transform duration-300">
              <img
                src="/notebook-svgrepo-com.svg"
                alt="MoodMate Logo"
                className="w-8 h-8"
              />
            </div>
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400">
              MoodMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  isActive(item.to)
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                aria-label={item.label}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 
               text-purple-600 dark:text-purple-300 hover:scale-105 hover:shadow-lg transition-all duration-300"
              aria-label={
                isDark ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px] uppercase">
                    {getUserDisplayName(user.email)}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg 
             hover:bg-red-600 transition duration-200 shadow hover:shadow-md"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:inline font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 
                   hover:text-purple-600 dark:hover:text-purple-400 
                   rounded-xl transition-colors duration-300"
                  aria-label="Sign in"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                   rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 
                   shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  aria-label="Sign up"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className={`p-3 rounded-2xl transition-all duration-300 transform ${
                isMenuOpen
                  ? "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/60 dark:to-red-800/60 text-red-600 dark:text-red-300 scale-105 shadow-lg"
                  : "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-600 dark:text-purple-300 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 shadow-md"
              }`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isMenuOpen ? "max-h-[85vh] opacity-100 pb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive(item.to)
                    ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-between px-4 gap-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
               bg-gradient-to-r from-purple-100 to-pink-100 
               dark:from-purple-900/50 dark:to-pink-900/50 
               text-purple-600 dark:text-purple-300 
               hover:from-purple-200 hover:to-pink-200 
               dark:hover:from-purple-800/50 dark:hover:to-pink-800/50 
               transition-all duration-300 shadow-sm hover:shadow-md"
                  aria-label={
                    isDark ? "Switch to light theme" : "Switch to dark theme"
                  }
                >
                  {isDark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      {/* <span className="hidden xs:inline font-medium"> */}
                      <span>
                        Light Mode
                      </span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      {/* <span className="hidden xs:inline font-medium"> */}
                      <span>
                        Dark Mode
                      </span>
                    </>
                  )}
                </button>

                {/* Sign Out */}
                {user && (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                 bg-gradient-to-r from-red-100 to-red-200 
                 dark:from-red-900/50 dark:to-red-800/50 
                 text-red-600 dark:text-red-300 
                 hover:from-red-200 hover:to-red-300 
                 dark:hover:from-red-800/50 dark:hover:to-red-700/50 
                 transition-all duration-300 shadow-sm hover:shadow-md"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                    {/* <span className="hidden xs:inline font-medium"> */}
                    <span>
                      Sign Out
                    </span>
                  </button>
                )}
              </div>

              {user ? (
                <div className="flex items-center space-x-4 px-4 py-4 mt-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-inner">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Logged in as
                    </p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase truncate">
                      {getUserDisplayName(user.email)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-3 mt-4 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3.5 text-center text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                    aria-label="Sign in"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3.5 text-center text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                    aria-label="Sign up"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
