import { Request, Response } from "express";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";

export const updateUserProfile = async (req: Request & { userId?: string }, res: Response) => {
     const {
          bio,
          avatarUrl,
          timeZone,
          skillsOffered = [],
          skillsWanted = [],
          professionTitle,
          organization,
          experienceYears,
          experienceDescription,
          currentStatus,
          linkedin,
          github,
          twitter,
          website,
     } = req.body;

     if (!req.userId) {
          res.status(401).json({ message: "Unauthorized" });
          return 
     }

     try {
          // 1. Upsert skills (gracefully handle empty arrays)
          const offeredSkillRecords = await Promise.all(
               (skillsOffered || []).map((name: string) => getOrCreateSkill(name))
          );
          const wantedSkillRecords = await Promise.all(
               (skillsWanted || []).map((name: string) => getOrCreateSkill(name))
          );

          // 2. Prepare nested updates conditionally
          const data: any = {
               bio,
               avatarUrl,
               timeZone,
               skillsOffered: {
                    set: [],
                    connect: offeredSkillRecords.map((skill) => ({ id: skill.id })),
               },
               skillsWanted: {
                    set: [],
                    connect: wantedSkillRecords.map((skill) => ({ id: skill.id })),
               },
          };

          if (professionTitle) {
               data.professionDetails = {
                    upsert: {
                         update: { title: professionTitle },
                         create: { title: professionTitle },
                    },
               };
          }

          if (organization) {
               data.currentOrganization = {
                    upsert: {
                         update: { organization },
                         create: { organization },
                    },
               };
          }

          if (experienceYears || experienceDescription) {
               data.experienceSummary = {
                    upsert: {
                         update: {
                              years: Number(experienceYears) || 0,
                              description: experienceDescription || '',
                         },
                         create: {
                              years: Number(experienceYears) || 0,
                              description: experienceDescription || '',
                         },
                    },
               };
          }

          if (currentStatus) {
               data.currentStatus = {
                    upsert: {
                         update: { status: currentStatus },
                         create: { status: currentStatus },
                    },
               };
          }

          if (linkedin || github || twitter || website) {
               data.socialLinks = {
                    upsert: {
                         update: {
                              linkedin: linkedin || '',
                              github: github || '',
                              twitter: twitter || '',
                              website: website || '',
                         },
                         create: {
                              linkedin: linkedin || '',
                              github: github || '',
                              twitter: twitter || '',
                              website: website || '',
                         },
                    },
               };
          }

          // 3. Update the user
          const updatedUser = await prisma.user.update({
               where: { id: req.userId },
               data,
               include: {
                    skillsOffered: true,
                    skillsWanted: true,
                    professionDetails: true,
                    currentOrganization: true,
                    experienceSummary: true,
                    currentStatus: true,
                    socialLinks: true,
               },
          });

          res.status(200).json({ message: "Profile updated", user: updatedUser });
     } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Error updating profile" });
     }
};


async function getOrCreateSkill(name: string) {
     return await prisma.skill.upsert({
          where: { name },
          update: {},
          create: { name },
     });
}

export const getAllProfiles = async (req: Request, res: Response) => {
     try {
          let currentUserId: string | null = null;

          const authHeader = req.headers.authorization;
          const token = authHeader?.split(" ")[1];

          if (token) {
               try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
                    currentUserId = decoded.userId;
               } catch {
                    console.log("Invalid token");
               }
          }

          const users = await prisma.user.findMany({
               where: currentUserId ? { id: { not: currentUserId } } : {},
               take: 20, // ✅ Optimized: limit initial fetch
               include: {
                    skillsOffered: true,
                    professionDetails: true,
                    currentOrganization: true,
                    experienceSummary: true,
                    currentStatus: true,
                    socialLinks: true,
                    receivedConnections: {
                         select: {
                              id: true,
                              senderId: true,
                         },
                    },
                    sentConnections: {
                         select: {
                              id: true,
                              receiverId: true,
                         },
                    },
               },
          });

          res.json({ users });
     } catch (error) {
          console.error("Error fetching users:", error);
          res.status(500).json({ message: "Server error" });
     }
};
