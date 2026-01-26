import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getFilteredProfile = async (req: Request, res: Response) => {
	const { search, company, professional, experience, sort } = req.query;

     const where: any = {};
     
	if (search) {
		where.OR = [
			{ name: { contains: search as string, mode: "insensitive" } },
			{
				skillsOffered: {
					some: { name: { contains: search as string, mode: "insensitive" } },
				},
			},
			{
				skillsWanted: {
					some: { name: { contains: search as string, mode: "insensitive" } },
				},
			},
		];
	}

	if (company) {
		where.currentOrganization = {
			organization: { contains: company as string, mode: "insensitive" },
		};
	}

	if (professional) {
		const profs = (professional as string).split(",");
		where.professionDetails = {
			title: { in: profs },
		};
	}

	if (experience) {
		const exps = (experience as string).split(",");
		const expConditions: any[] = [];

		for (const range of exps) {
			if (range.includes("-")) {
				const [min, max] = range.split("-").map(Number);
				expConditions.push({
					experienceSummary: {
						years: { gte: min, lte: max },
					},
				});
			} else if (range.endsWith("+")) {
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
			} else {
				where.AND = [{ OR: expConditions }];
			}
		}
	}

	let orderBy: any = {};
	if (sort === "least-experienced") {
		orderBy = { experienceSummary: { years: "asc" } };
	} else if (sort === "recent-added-profile") {
		orderBy = { createdAt: "desc" };
	} else {
		orderBy = { experienceSummary: { years: "desc" } };
	}

	try {
		const users = await prisma.user.findMany({
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
          });
          
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

		res.json({ users: result });
	} catch (err) {
		console.error("❌ Prisma Error:", err);
		res.status(500).json({ error: "Database error" });
	}
};
