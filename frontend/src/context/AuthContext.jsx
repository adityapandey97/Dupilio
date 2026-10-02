import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

const GUEST_USER = {
  id: 'guest-preview',
  name: 'Developer (Preview)',
  email: 'preview@dupilio.dev',
  isGuest: true,
  college: 'National Institute of Technology',
  department: 'Computer Science & Engineering',
  batch: '2026',
  bio: 'Building scalable software & competing across LeetCode, Codeforces, and CodeChef.',
  privacySettings: {
    profileVisibility: 'public',
    showRank: true,
    showStats: true,
    showEmail: false
  },
  developerScore: {
    overall: 74,
    dimensions: {
      problemSolving: 78,
      competitiveProgramming: 72,
      consistency: 70,
      contestParticipation: 68,
      gitHubActivity: 80,
      projectActivity: 75
    }
  },
  profile: {
    role: 'Full-Stack Developer & Competitive Programmer',
    skills: ['DSA', 'React', 'JavaScript', 'Node.js', 'C++', 'System Design', 'FastAPI'],
    education: 'B.Tech Computer Science & Engineering',
    achievements: 'Dupilio Unified Developer',
    codingProfiles: {
      leetcode: 'aditya_lc',
      codeforces: 'tourist_fan',
      codechef: 'chef_aditya',
      hackerrank: 'aditya_hr',
      gfg: 'aditya_gfg',
      atcoder: 'aditya_ac',
      github: 'adityapandey97'
    },
    codingStats: {
      leetcodeSolved: 218,
      codeforcesSolved: 94,
      codechefSolved: 68,
      hackerrankSolved: 54,
      gfgSolved: 85,
      atcoderSolved: 48,
      completedTopics: ['Arrays', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Trees']
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(GUEST_USER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('dupilio_token') || localStorage.getItem('hireprep_token');
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
        const storedUser = localStorage.getItem('dupilio_user') || localStorage.getItem('hireprep_current_user');
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

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('dupilio_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.error('Failed to update profile:', e.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
