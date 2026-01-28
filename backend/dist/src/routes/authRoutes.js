"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { signup, login } = require('../controllers/auth.controllers');
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
exports.default = router;
