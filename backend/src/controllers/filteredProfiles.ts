import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getFilteredProfile = async (req: any, res: Response) => {
	const { search, company, professional, experience, sort, page = "1", limit = "10" } = req.query;
	const userId = req.user?.id;

	const pageNum = parseInt(page as string) || 1;
	const limitNum = parseInt(limit as string) || 10;
	const skip = (pageNum - 1) * limitNum;

	const where: any = {};

	// Exclude existing connections and self if user is logged in
	if (userId) {
		const connections = await prisma.connection.findMany({
			where: {
				OR: [{ senderId: userId }, { receiverId: userId }],
				status: { in: ["ACCEPTED", "PENDING"] },
			},
			select: { senderId: true, receiverId: true },
		});

		const excludedUserIds = new Set<string>();
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
			],
		};

		if (where.AND) {
			where.AND.push(searchCondition);
		} else {
			where.AND = [searchCondition];
		}
	}

	if (company) {
		const companyCondition = {
			currentOrganization: {
				organization: { contains: company as string, mode: "insensitive" },
			},
		};

		if (where.AND) {
			where.AND.push(companyCondition);
		} else {
			where.AND = [companyCondition];
		}
	}

	if (professional) {
		const profs = (professional as string).split(",");
		const profCondition = {
			professionDetails: {
				title: { in: profs },
			},
		};

		if (where.AND) {
			where.AND.push(profCondition);
		} else {
			where.AND = [profCondition];
		}
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
		const [users, total] = await Promise.all([
			prisma.user.findMany({
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
			prisma.user.count({ where }),
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
	} catch (err) {
		console.error("❌ Prisma Error:", err);
		res.status(500).json({ error: "Database error" });
	}
};
