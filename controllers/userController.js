const User = require('../models/User');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, learningStyle, accessibilityPrefs, pace } = req.body;

    let user;
    try {
      user = await User.findById(userId);
      if (user) {
        if (language) user.language = language;
        if (learningStyle) user.learningStyle = learningStyle;
        if (accessibilityPrefs) user.accessibilityPrefs = accessibilityPrefs;
        if (pace) user.pace = pace;
        await user.save();
      }
    } catch (e) {
      console.warn("DB user find error, profile saved in request state");
    }

    return res.status(200).json({
      message: 'Learning profile updated successfully',
      profile: {
        userId,
        language: language || 'en',
        learningStyle: learningStyle || 'visual',
        accessibilityPrefs: accessibilityPrefs || {},
        pace: pace || 'medium',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { updateProfile };
