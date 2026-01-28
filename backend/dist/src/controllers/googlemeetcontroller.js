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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleOAuthCallback = exports.startGoogleOAuth = void 0;
const googleCalendar_1 = require("../lib/googleCalendar");
const prisma_1 = require("../lib/prisma");
const startGoogleOAuth = (req, res) => {
    const scopes = ["https://www.googleapis.com/auth/calendar.events"];
    const url = googleCalendar_1.oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
    });
    res.redirect(url);
};
exports.startGoogleOAuth = startGoogleOAuth;
const handleGoogleOAuthCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    const userId = req.user.id; // from authenticateUser middleware
    try {
        const { tokens } = yield googleCalendar_1.oAuth2Client.getToken(code);
        yield prisma_1.prisma.googleToken.upsert({
            where: { userId },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                scope: tokens.scope,
                tokenType: tokens.token_type,
                expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
            create: {
                userId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                scope: tokens.scope,
                tokenType: tokens.token_type,
                expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
        });
        res.send("✅ Google Calendar connected! You can now approve sessions.");
    }
    catch (error) {
        console.error("OAuth callback error:", error);
        res.status(500).send("Failed to connect Google account");
    }
});
exports.handleGoogleOAuthCallback = handleGoogleOAuthCallback;
