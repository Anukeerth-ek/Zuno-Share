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
const client_1 = require("@prisma/client");
// import { PrismaClient } from '@prisma/client';
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Skills
        const jsSkill = yield prisma.skill.create({
            data: {
                name: "JavaScript",
                category: "Web Development",
            },
        });
        const reactSkill = yield prisma.skill.create({
            data: {
                name: "React",
                category: "Frontend",
            },
        });
        // Create Users
        const mentor = yield prisma.user.create({
            data: {
                name: "Alice Mentor",
                email: "alice@example.com",
                password: "hashedpassword1", // Use hashed version in real app
                bio: "Experienced frontend developer",
                avatarUrl: "https://i.pravatar.cc/150?u=alice",
                skillsOffered: {
                    connect: [{ id: jsSkill.id }, { id: reactSkill.id }],
                },
            },
        });
        const learner = yield prisma.user.create({
            data: {
                name: "Bob Learner",
                email: "bob@example.com",
                password: "hashedpassword2",
                bio: "Looking to learn React",
                avatarUrl: "https://i.pravatar.cc/150?u=bob",
                skillsWanted: {
                    connect: [{ id: reactSkill.id }],
                },
            },
        });
        // Create a session between Alice (mentor) and Bob (learner)
        yield prisma.session.create({
            data: {
                mentorId: mentor.id,
                learnerId: learner.id,
                skillId: reactSkill.id,
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
                status: "CONFIRMED",
                feedback: null,
            },
        });
        console.log("✅ Seed data inserted successfully!");
    });
}
main()
    .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
