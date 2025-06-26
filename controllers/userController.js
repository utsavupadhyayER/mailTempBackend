require('dotenv').config();

const User = require("../models/User");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

// GET 
// /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true });
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};


// GET 
// /api/users
exports.getUserById = async (req, res) => {
    const userId = req.jwtData.userId; // Get the user ID from the JWT token
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Server error' });
    }
};

// POST 
// /api/users
exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send({ success: false, error: "Name, email, and password are required" });
    }
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send({ success: false, error: "User already exists" });
        }

        // Create a new user
        user = new User({ username, email, password: bcrypt.hashSync(password) });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

        return res.status(201).send({ success: true, token, username, email, message: "User registered successfully" });
    } catch (error) {
        console.error("Error in signup:", error.message);
        return res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};

// PUT 
// /api/users/:id
exports.updateUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userId = req.jwtData.userId;

    if (!username || !password) {
        return res.status(400).send({ success: false, error: "Username and password are required" });
    }
    try {
        // Find the user
        const user = await User.findOneAndUpdate({ _id: userId }, { username, password: bcrypt.hashSync(password) }, { new: true });

        if (!user) {
            return res.status(404).send({ success: false, error: "User does not exist" });
        }

        res.status(200).send({ success: true, message: "User updated successfully", username: user.username });

    } catch (error) {
        if (error.code === 11000) {
            console.error('Duplicate key error: Username already exists.');
            return res.status(400).send({ success: false, error: "Username already exists" });
        }
        console.error("Error in update user:", error.message);
        return res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};

// DELETE 
// /api/users
exports.deleteUser = async (req, res) => {
    const userId = req.jwtData.userId;
    if (!userId) {
        return res.status(400).send({ success: false, error: "ID is required" });
    }
    try {
        // Find the user by ID
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).send({ success: false, error: "User does not exist" });
        };

        // Delete the user
        await User.deleteOne({ _id: userId });
        return res.status(200).send({ success: true, message: "User deleted successfully" });

    } catch (error) {
        console.error("Error in delete user:", error.message);
        return res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};
