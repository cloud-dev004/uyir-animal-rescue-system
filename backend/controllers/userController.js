const User = require('../models/User');
const Case = require('../models/Case');
const bcrypt = require('bcryptjs');

exports.registerUser = async (req, res) => {
    try {
        const { name, phone, password, district, skills, role, age, position } = req.body;
        
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is strictly required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            phone,
            password: hashedPassword,
            district,
            skills,
            role: role || 'citizen',
            age,
            position,
            location: { type: 'Point', coordinates: [0, 0] }
        });

        await newUser.save();
        
        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;
        
        if (!phone || !password) {
            return res.status(400).json({ success: false, message: 'Phone number and password are required' });
        }

        const user = await User.findOne({ phone });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Compare password input with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid authentication credentials' });
        }

        // Dynamically compute the total rescue count from the Case collection
        const actualRescueCount = await Case.countDocuments({ volunteerId: user._id });
        
        // Return full user with accurately computed count
        const userResponse = user.toObject();
        userResponse.rescueCount = actualRescueCount;

        if (userResponse.credits < 100) userResponse.badge = 'bronze';
        else if (userResponse.credits >= 100 && userResponse.credits < 400) userResponse.badge = 'silver';
        else if (userResponse.credits >= 400) userResponse.badge = 'gold';

        // Also save this sync to database for consistency
        if (user.badge !== userResponse.badge) {
            user.badge = userResponse.badge;
            await user.save();
        }

        res.status(200).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
