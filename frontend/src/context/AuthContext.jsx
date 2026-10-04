import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const GUEST_USER = {
  id: 'guest-preview',
  name: 'Developer',
  email: 'developer@dupilio.dev',
  isGuest: true,
  college: 'National Institute of Technology',
  department: 'Computer Science & Engineering',
  batch: '2026',
  bio: 'Connect coding handles to sync real-time ratings, problems solved, and contest calendars.',
  privacySettings: {
    profileVisibility: 'public',
    showRank: true,
    showStats: true,
    showEmail: false
  },
  developerScore: {
    overall: 0,
    dimensions: {
      problemSolving: 0,
      competitiveProgramming: 0,
      consistency: 0,
      contestParticipation: 0,
      gitHubActivity: 0,
      projectActivity: 0
    }
  },
  profile: {
    role: 'Software Developer',
    skills: ['DSA', 'React', 'Node.js', 'C++'],
    education: 'B.Tech Computer Science & Engineering',
    achievements: 'Dupilio Unified Developer',
    codingProfiles: {},
    codingStats: {
      leetcodeSolved: 0,
      codeforcesSolved: 0,
      codechefSolved: 0,
      hackerrankSolved: 0,
      gfgSolved: 0,
      atcoderSolved: 0,
      completedTopics: []
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(GUEST_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('dupilio_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('dupilio_user', JSON.stringify(res.user));
          }
        } catch (e) {
          localStorage.removeItem('dupilio_token');
          localStorage.removeItem('dupilio_user');
          setUser(GUEST_USER);
        }
      } else {
        const storedUser = localStorage.getItem('dupilio_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(GUEST_USER);
          }
        } else {
          setUser(GUEST_USER);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      localStorage.setItem('dupilio_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed.';
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, college, department, batch) => {
    try {
      const res = await api.register(name, email, password, college, department, batch);
      setUser(res.user);
      localStorage.setItem('dupilio_user', JSON.stringify(res.user));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const logout = () => {
    api.logout();
    setUser(GUEST_USER);
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...updatedFields,
        privacySettings: {
          ...prev.privacySettings,
          ...(updatedFields.privacySettings || {})
        },
        profile: {
          ...prev.profile,
          ...(updatedFields.profile || {})
        }
      };
      localStorage.setItem('dupilio_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
