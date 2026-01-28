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
exports.saveTokensToDB = saveTokensToDB;
exports.getTokensFromDB = getTokensFromDB;
// backend/src/lib/tokenStorage.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function saveTokensToDB(userId, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userId) {
            throw new Error("No userId provided when saving Google tokens");
        }
        return prisma.googleToken.upsert({
            where: { userId },
            update: {
                accessToken: tokens.access_token || "",
                refreshToken: tokens.refresh_token || undefined,
                scope: tokens.scope || "",
                tokenType: tokens.token_type || "",
                expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
            create: {
                userId,
                accessToken: tokens.access_token || "",
                refreshToken: tokens.refresh_token || '',
                scope: tokens.scope || "",
                tokenType: tokens.token_type || "",
                expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            },
        });
    });
}
function getTokensFromDB(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.googleToken.findUnique({
            where: { userId },
        });
    });
}
