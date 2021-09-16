const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const userService = require('../services/userService');

async function register(req, res) {
    req.body.role = 'regular';
    try {
        const user = await userService.create(req.body);
        return res.status(200).json({user});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

async function login(req, res) {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).json({error: "Email doesn't exist."});
    }

    const isMatched = await user.comparePassword(req.body.password);
    if (isMatched) {
        const token = jwt.sign({currentUser: user}, process.env.TOKEN_SECRET);
        return res.status(200).json({'auth-token': token});
    } else {
        return res.status(400).json({error: "Password doesn't match."});
    }
}

function verifyLoggedIn(req, res, next) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({error: "Access Denied"});
    }

    try {
        req.currentUser = jwt.verify(token, process.env.TOKEN_SECRET).currentUser;
        next();
    } catch (error) {
        return res.status(401).json({error: "Access Denied"});
    }
}

function verifyManagerOrAdmin(req, res, next) {
    if (req.currentUser.role !== "admin" && req.currentUser.role !== "manager") {
        return res.status(401).json({error: "Access Denied"});

    }
    next();
}

function verifySelfOrManagerOrAdmin(req, res, next) {
    const isSelf = req.currentUser._id === req.params.id;
    if (!isSelf && req.currentUser.role !== "admin" && req.currentUser.role !== "manager") {
        return res.status(401).json({error: "Access Denied"});
    }
    next();
}

function verifyOwnerOrAdmin(req, res, next) {
    verifyOwner(req, res);
    if (req.currentUser.role !== "admin") {
        return res.status(401).json({error: "Access Denied"});
    }
    next();
}

function verifyOwner(req, res) {
    if (req.currentUser._id !== req.record.userId) {
        return res.status(401).json({error: "Access Denied"});
    }
}

module.exports = { register, login, verifyLoggedIn, verifySelfOrManagerOrAdmin, verifyManagerOrAdmin, verifyOwnerOrAdmin }