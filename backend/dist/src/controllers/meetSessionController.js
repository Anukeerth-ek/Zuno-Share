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
exports.getRoadmap = exports.saveRoadmap = exports.deleteSession = exports.acceptSession = exports.getMySessions = exports.requestSession = void 0;
const prisma_1 = require("../lib/prisma");
const googleCalendar_1 = require("../lib/googleCalendar");
const client_1 = require("@prisma/client");
const requestSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startTime, mentorId, selectedSkillNames } = req.body;
        if (!mentorId || !selectedSkillNames || !startTime) {
            res.status(400).json({ message: "mentorId, selectedSkillNames and startTime are required" });
            return;
        }
        const skill = yield prisma_1.prisma.skill.findUnique({ where: { name: selectedSkillNames } });
        if (!skill) {
            res.status(404).json({ message: `Skill '${selectedSkillNames}' not found` });
            return;
        }
        const learnerId = req.userId;
        // Prevent duplicate active requests: check for existing PENDING/CONFIRMED session
        const existing = yield prisma_1.prisma.session.findFirst({
            where: {
                mentorId,
                learnerId,
                skillId: skill.id,
                status: { in: [client_1.SessionStatus.PENDING, client_1.SessionStatus.CONFIRMED] },
            },
        });
        if (existing) {
            res.status(400).json({ message: "A session request for this skill with this mentor already exists." });
            return;
        }
        const session = yield prisma_1.prisma.session.create({
            data: {
                mentor: { connect: { id: mentorId } },
                learner: { connect: { id: learnerId } },
                skill: { connect: { id: skill.id } },
                scheduledAt: new Date(startTime),
                status: client_1.SessionStatus.PENDING,
            },
        });
        res.status(201).json({ message: "Session request created", session });
        return;
    }
    catch (e) {
        console.error("requestSession error:", e);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.requestSession = requestSession;
const getMySessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
        const requestedSessions = yield prisma_1.prisma.session.findMany({
            where: { learnerId: userId },
            include: {
                mentor: { select: { name: true } },
                learner: { select: { name: true } },
                skill: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        const receivedSessions = yield prisma_1.prisma.session.findMany({
            where: { mentorId: userId },
            include: {
                mentor: { select: { name: true } },
                learner: { select: { name: true } },
                skill: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            requestedSessions,
            receivedSessions,
        });
    }
    catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Failed to fetch sessions" });
    }
});
exports.getMySessions = getMySessions;
const acceptSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const sessionId = String(req.params.id);
    const { status } = req.body;
    const allowed = [
        client_1.SessionStatus.CONFIRMED,
        client_1.SessionStatus.REJECTED,
        client_1.SessionStatus.CANCELLED,
        client_1.SessionStatus.COMPLETED,
    ];
    if (!allowed.includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
    }
    let session = null; // Declare session variable in outer scope
    try {
        console.log("[DB] Finding session with ID:", sessionId);
        session = yield prisma_1.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                mentor: { select: { id: true, email: true } },
                learner: { select: { email: true } },
                skill: { select: { name: true } },
            },
        });
        console.log("[DB] Session result:", session);
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }
        // ✅ Only the mentor can approve/confirm this session
        if (status === "CONFIRMED" && req.userId !== session.mentorId) {
            res.status(403).json({ message: "Only the mentor can approve this session" });
            return;
        }
        let meetLink = session.meetLink || null;
        if (status === "CONFIRMED" && !meetLink) {
            console.log("[DB] Fetching mentor tokens for user:", session.mentorId);
            const mentorTokens = yield prisma_1.prisma.googleToken.findUnique({
                where: { userId: session.mentorId },
            });
            console.log("[DB] Mentor tokens found:", !!mentorTokens);
            if (!(mentorTokens === null || mentorTokens === void 0 ? void 0 : mentorTokens.accessToken)) {
                console.log("[ERROR] No Google tokens found for mentor:", session.mentorId);
                res.status(400).json({ message: "Mentor Google tokens not found" });
                return;
            }
            if (!session.scheduledAt) {
                console.error("[ERROR] session.scheduledAt is null or undefined");
            }
            const startISO = session.scheduledAt.toISOString();
            const endISO = new Date(session.scheduledAt.getTime() + 60 * 60 * 1000).toISOString();
            const timeZone = "UTC";
            console.log("[Google API] Creating meet event...");
            console.log("[DEBUG] Event details:", {
                summary: `SkillSwap: ${session.skill.name}`,
                startTime: startISO,
                endTime: endISO,
                attendees: [
                    ...(((_a = session.mentor) === null || _a === void 0 ? void 0 : _a.email) ? [{ email: session.mentor.email }] : []),
                    ...(((_b = session.learner) === null || _b === void 0 ? void 0 : _b.email) ? [{ email: session.learner.email }] : []),
                ],
            });
            const link = yield (0, googleCalendar_1.createMeetEvent)({
                summary: `SkillSwap: ${session.skill.name}`,
                description: "Mentorship Session",
                startTime: startISO,
                endTime: endISO,
                timeZone,
                attendees: [
                    ...(((_c = session.mentor) === null || _c === void 0 ? void 0 : _c.email) ? [{ email: session.mentor.email }] : []),
                    ...(((_d = session.learner) === null || _d === void 0 ? void 0 : _d.email) ? [{ email: session.learner.email }] : []),
                ],
                tokens: {
                    accessToken: mentorTokens.accessToken,
                    refreshToken: mentorTokens.refreshToken || undefined,
                },
            });
            //    console.log("[Google API] Meet link generated:", link);
            meetLink = link;
        }
        //   console.log("[DB] Updating session with new status:", status);
        const updated = yield prisma_1.prisma.session.update({
            where: { id: sessionId },
            data: {
                status: status,
                meetLink: meetLink !== null && meetLink !== void 0 ? meetLink : undefined,
            },
        });
        //   console.log("[DB] Updated session:", updated);
        res.json({ message: `Session ${status.toLowerCase()}`, session: updated });
    }
    catch (e) {
        console.error("acceptSession error:", e);
        console.error("Error details:", {
            message: e.message,
            stack: e.stack,
            status: status,
            sessionId: sessionId,
            userId: req.userId,
        });
        // Provide more specific error messages
        if ((_e = e.message) === null || _e === void 0 ? void 0 : _e.includes("Google tokens not found")) {
            res.status(400).json({
                message: "Google Calendar not connected. Please connect your Google account first.",
            });
        }
        else if ((_f = e.message) === null || _f === void 0 ? void 0 : _f.includes("insufficient authentication scopes")) {
            // Clear the invalid tokens and ask user to re-authenticate
            try {
                yield prisma_1.prisma.googleToken.delete({
                    where: { userId: session.mentorId },
                });
                console.log("[DB] Cleared invalid Google tokens for user:", session.mentorId);
            }
            catch (deleteError) {
                console.error("[DB] Failed to clear invalid tokens:", deleteError);
            }
            res.status(400).json({ message: "Google Calendar needs to be reconnected. Please re-authenticate." });
        }
        else if ((_g = e.message) === null || _g === void 0 ? void 0 : _g.includes("Google Meet")) {
            res.status(500).json({ message: "Failed to create Google Meet. Please try again." });
        }
        else {
            res.status(500).json({ message: "Internal server error", details: e.message });
        }
    }
});
exports.acceptSession = acceptSession;
const deleteSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = String(req.params.id);
        const session = yield prisma_1.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }
        yield prisma_1.prisma.session.delete({ where: { id: sessionId } });
        res.json({ message: "Session deleted successfully" });
        return;
    }
    catch (e) {
        console.error("deleteSession error:", e);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.deleteSession = deleteSession;
const saveRoadmap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = String(req.params.id);
        const { roadmap } = req.body; // roadmap = { nodes, edges, viewport }
        const session = yield prisma_1.prisma.session.findUnique({ where: { id: sessionId } });
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }
        const updated = yield prisma_1.prisma.session.update({
            where: { id: sessionId },
            data: { roadmap },
        });
        res.json({ message: "Roadmap saved successfully", roadmap: updated.roadmap });
        return;
    }
    catch (e) {
        console.error("saveRoadmap error:", e);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.saveRoadmap = saveRoadmap;
// Get roadmap
const getRoadmap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = String(req.params.id);
        const session = yield prisma_1.prisma.session.findUnique({
            where: { id: sessionId },
            select: { roadmap: true },
        });
        if (!session) {
            res.status(404).json({ message: "Session not found" });
            return;
        }
        res.json(session.roadmap || {});
        return;
    }
    catch (e) {
        console.error("getRoadmap error:", e);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
});
exports.getRoadmap = getRoadmap;
