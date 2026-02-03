import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const statusSchema = z.object({
     status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED"]),
});

const profileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  timeZone: z.string().optional(),
  skillsOffered: z.array(z.string()).optional(),
  skillsWanted: z.array(z.string()).optional(),

  professionTitle: z.string().optional(),
  organization: z.string().optional(),
  experienceYears: z.string().optional(), // keep as string since coming from req.body
  experienceDescription: z.string().optional(),
  currentStatus: z.string().optional(),

  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  twitter: z.string().url().optional(),
  website: z.string().url().optional(),
});




interface AuthenticatedRequest extends Request {
     user?: { id: string };
}

export const updateSessionStatus = async (req: AuthenticatedRequest, res: Response) => {
     const mentorId = req.userId;
     const { id } = req.params;

     const parsed = statusSchema.safeParse(req.body);
     if (!parsed.success) {
          res.status(400).json({
               message: "Invalid status",
               errors: parsed.error.format(),
          });
          return;
     }

     const { status } = parsed.data;

     try {
          const session = await prisma.session.findFirst({
               where: { id, mentorId },
          });

          if (!session) {
               res.status(404).json({
                    message: "Session not found or unauthorized",
               });
               return;
          }

          const updatedSession = await prisma.session.update({
               where: { id },
               data: { status: status as any }, // Cast to 'any' or 'SessionStatus' if imported
          });

          res.status(200).json({ session: updatedSession });
          return;
     } catch (error) {
          console.error("Error updating session:", error);
          res.status(500).json({ message: "Server error" });
          return;
     }
};

export const createUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return 
  }

  try {
    const {
      name,
      bio,
      timeZone,
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


    const avatarUrl = req.body.avatarUrl || (req.file ? `/uploads/${req.file.filename}` : undefined);

    const rawSkillsOffered = req.body.skillsOffered || req.body["skillsOffered[]"] || [];
    const rawSkillsWanted = req.body.skillsWanted || req.body["skillsWanted[]"] || [];

    const skillsOffered = Array.isArray(rawSkillsOffered)
      ? rawSkillsOffered.map((s) => s.trim().toLowerCase())
      : [];

    const skillsWanted = Array.isArray(rawSkillsWanted)
      ? rawSkillsWanted.map((s) => s.trim().toLowerCase())
      : [];

    // Disconnect existing skills
    await prisma.user.update({
      where: { id: userId },
      data: {
        skillsOffered: { set: [] },
        skillsWanted: { set: [] },
      },
    });

    const updateData: any = {
      name,
      bio,
      avatarUrl,
      timeZone,
      skillsOffered: {
        connectOrCreate: skillsOffered.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
      skillsWanted: {
        connectOrCreate: skillsWanted.map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
    };

    if (professionTitle) {
      updateData.professionDetails = {
        upsert: {
          update: { title: professionTitle },
          create: { title: professionTitle },
        },
      };
    }

    if (organization) {
      updateData.currentOrganization = {
        upsert: {
          update: { organization },
          create: { organization },
        },
      };
    }

    if (experienceYears) {
      updateData.experienceSummary = {
        upsert: {
          update: {
            years: Number(experienceYears),
            description: experienceDescription || "",
          },
          create: {
            years: Number(experienceYears),
            description: experienceDescription || "",
          },
        },
      };
    }

    if (currentStatus) {
      updateData.currentStatus = {
        upsert: {
          update: { status: currentStatus },
          create: { status: currentStatus },
        },
      };
    }

    if (linkedin || github || twitter || website) {
      updateData.socialLinks = {
        upsert: {
          update: { linkedin, github, twitter, website },
          create: { linkedin, github, twitter, website },
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};



interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getUserProfile = async (req: Request & { userId?: string }, res: Response) => {
   if (!req.userId) {
     res.status(401).json({ message: "Unauthorized" });
     return 
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return 
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/userController.ts
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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


    if (!user) {
      res.status(404).json({ message: "User not found" });
      return
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
