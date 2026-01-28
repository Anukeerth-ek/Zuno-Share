"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const hash_utils_1 = require("../utils/hash.utils");
const jwt = require("jsonwebtoken");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password is required" });
    }
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        return res.status(409).json({ message: "User already exist" });
    }
    const hashdedUserPassword = yield (0, hash_utils_1.hashPassword)(password);
    const newUser = yield prisma_1.default.user.create({
        data: { name, email, password: hashdedUserPassword },
    });
    res.status(201).json({ message: "user created", user: { id: newUser.id, email: newUser.email } });
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body; // Fixed typo
    const user = yield prisma_1.default.user.findUnique({ where: { email } }); // Fixed syntax
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isValid = yield (0, hash_utils_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password); // Fixed variable name
    if (!isValid) {
        return res.status(404).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
});
exports.login = login;
exports.default = { signup: exports.signup, login: exports.login };
