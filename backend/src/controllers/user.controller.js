import { User } from '../models/User.js';

// @desc    Get Current User Profile
// @route   GET /api/v1/users/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id) || req.user;
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college || 'National Institute of Technology',
        department: user.department || 'Computer Science & Engineering',
        batch: user.batch || '2026',
        bio: user.bio || '',
        avatar: user.avatar || '',
        privacySettings: user.privacySettings || { profileVisibility: 'public', showRank: true, showStats: true },
        developerScore: user.developerScore || { overall: 72 },
        profile: user.profile || {}
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update User Profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      college,
      department,
      batch,
      bio,
      avatar,
      privacySettings,
      role,
      skills,
      education,
      achievements,
      codingProfiles
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (college !== undefined) updates.college = college;
    if (department !== undefined) updates.department = department;
    if (batch !== undefined) updates.batch = batch;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (privacySettings !== undefined) updates.privacySettings = { ...user.privacySettings, ...privacySettings };

    const currentProfile = user.profile || {};
    updates.profile = {
      ...currentProfile,
      role: role !== undefined ? role : (currentProfile.role || 'Software Engineer'),
      skills: skills !== undefined ? skills : (currentProfile.skills || []),
      education: education !== undefined ? education : (currentProfile.education || ''),
      achievements: achievements !== undefined ? achievements : (currentProfile.achievements || ''),
      codingProfiles: {
        ...(currentProfile.codingProfiles || {}),
        ...(codingProfiles || {})
      }
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        department: updatedUser.department,
        batch: updatedUser.batch,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        privacySettings: updatedUser.privacySettings,
        developerScore: updatedUser.developerScore,
        profile: updatedUser.profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get All Users (Admin / Community)
// @route   GET /api/v1/users
// @access  Private
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    const safeUsers = users.map(u => ({
      id: u._id,
      name: u.name,
      college: u.college,
      department: u.department,
      batch: u.batch,
      developerScore: u.developerScore?.overall || 70,
      profile: {
        role: u.profile?.role,
        skills: u.profile?.skills
      }
    }));
    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (err) {
    next(err);
  }
};

export default { getMe, updateProfile, getAllUsers };
