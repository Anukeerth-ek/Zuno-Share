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
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma"); // or your prisma import
const router = express_1.default.Router();
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI // e.g. http://localhost:4000/api/google/callback
);
function normalizeTokens(tokens) {
    var _a;
    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.access_token))
        throw new Error("No access token from Google");
    return {
        accessToken: tokens.access_token,
        refreshToken: (_a = tokens.refresh_token) !== null && _a !== void 0 ? _a : "",
        scope: tokens.scope,
        tokenType: tokens.token_type,
        // prisma BigInt field: convert JS number | undefined to BigInt | null
        expiryDate: typeof tokens.expiry_date === "number" ? BigInt(tokens.expiry_date) : null,
    };
}
// Start OAuth. The frontend will redirect here.
router.get("/auth", (req, res) => {
    const { token } = req.query;
    if (!token)
        return res.status(400).json({ message: "Missing user token" });
    // Validate the JWT early (optional but nicer errors)
    try {
        const decoded = jsonwebtoken_1.default.verify(String(token), process.env.JWT_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.userId))
            throw new Error("Bad token payload");
    }
    catch (_a) {
        return res.status(400).json({ message: "Invalid token" });
    }
    const scopes = [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: scopes,
        state: String(token), // we pass the *JWT* here
    });
    return res.redirect(url);
});
// OAuth callback
router.get("/callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = String(req.query.code || "");
    const stateToken = String(req.query.state || "");
    if (!code || !stateToken) {
        res.status(400).send("Missing code or state");
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(stateToken, process.env.JWT_SECRET);
        const userId = decoded.userId;
        if (!userId) {
            res.status(400).send("Invalid token data");
            return;
        }
        const { tokens } = yield oauth2Client.getToken(code);
        const safe = normalizeTokens(tokens);
        yield prisma_1.prisma.googleToken.upsert({
            where: { userId },
            update: safe,
            create: Object.assign({ userId }, safe),
        });
        // ✅ After success, bounce back to your frontend sessions page
        const redirectUrl = process.env.FRONTEND_SESSIONS_URL || "http://localhost:3000/sessions";
        return res.redirect(redirectUrl);
    }
    catch (err) {
        console.error("Google OAuth callback error:", err);
        return res.status(500).send("Google authentication failed");
    }
}));
exports.default = router;
