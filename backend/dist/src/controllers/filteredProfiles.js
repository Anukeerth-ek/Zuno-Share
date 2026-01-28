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
exports.getFilteredProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const getFilteredProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, company, professional, experience, sort, page = "1", limit = "10" } = req.query;
    const userId = req.userId;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    // Exclude existing connections and self if user is logged in
    if (userId) {
        const connections = yield prisma_1.default.connection.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
                status: { in: ["ACCEPTED", "PENDING"] },
            },
            select: { senderId: true, receiverId: true },
        });
        const excludedUserIds = new Set();
        excludedUserIds.add(userId);
        connections.forEach((c) => {
            excludedUserIds.add(c.senderId);
            excludedUserIds.add(c.receiverId);
        });
        where.id = { notIn: Array.from(excludedUserIds) };
    }
    if (search) {
        const searchCondition = {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                {
                    skillsOffered: {
                        some: { name: { contains: search, mode: "insensitive" } },
                    },
                },
                {
                    skillsWanted: {
                        some: { name: { contains: search, mode: "insensitive" } },
                    },
                },
            ],
        };
        if (where.AND) {
            where.AND.push(searchCondition);
        }
        else {
            where.AND = [searchCondition];
        }
    }
    if (company) {
        const companyCondition = {
            currentOrganization: {
                organization: { contains: company, mode: "insensitive" },
            },
        };
        if (where.AND) {
            where.AND.push(companyCondition);
        }
        else {
            where.AND = [companyCondition];
        }
    }
    if (professional) {
        const profs = professional.split(",");
        const profCondition = {
            professionDetails: {
                title: { in: profs },
            },
        };
        if (where.AND) {
            where.AND.push(profCondition);
        }
        else {
            where.AND = [profCondition];
        }
    }
    if (experience) {
        const exps = experience.split(",");
        const expConditions = [];
        for (const range of exps) {
            if (range.includes("-")) {
                const [min, max] = range.split("-").map(Number);
                expConditions.push({
                    experienceSummary: {
                        years: { gte: min, lte: max },
                    },
                });
            }
            else if (range.endsWith("+")) {
                const min = parseInt(range);
                expConditions.push({
                    experienceSummary: {
                        years: { gte: min },
                    },
                });
            }
        }
        if (expConditions.length > 0) {
            if (where.AND) {
                where.AND.push({ OR: expConditions });
            }
            else {
                where.AND = [{ OR: expConditions }];
            }
        }
    }
    let orderBy = {};
    if (sort === "least-experienced") {
        orderBy = { experienceSummary: { years: "asc" } };
    }
    else if (sort === "recent-added-profile") {
        orderBy = { createdAt: "desc" };
    }
    else {
        orderBy = { experienceSummary: { years: "desc" } };
    }
    try {
        const [users, total] = yield Promise.all([
            prisma_1.default.user.findMany({
                where,
                include: {
                    currentOrganization: {
                        select: { organization: true },
                    },
                    experienceSummary: {
                        select: { years: true, description: true },
                    },
                    professionDetails: {
                        select: { title: true },
                    },
                    skillsOffered: {
                        select: { id: true, name: true, category: true },
                    },
                    skillsWanted: {
                        select: { id: true, name: true, category: true },
                    },
                },
                orderBy,
                skip,
                take: limitNum,
            }),
            prisma_1.default.user.count({ where }),
        ]);
        const result = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            avatarUrl: u.avatarUrl,
            createdAt: u.createdAt,
            currentOrganization: u.currentOrganization || { organization: null },
            experienceSummary: u.experienceSummary || { years: null, description: null },
            professionDetails: u.professionDetails || { title: null },
            skillsOffered: u.skillsOffered || [],
            skillsWanted: u.skillsWanted || [],
        }));
        res.json({
            users: result,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (err) {
        console.error("❌ Prisma Error:", err);
        res.status(500).json({ error: "Database error" });
    }
});
exports.getFilteredProfile = getFilteredProfile;
