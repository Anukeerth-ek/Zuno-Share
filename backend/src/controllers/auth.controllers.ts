import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { comparePassword, hashPassword } from "../utils/hash.utils";

const jwt = require("jsonwebtoken");

export const signup = async (req: Request, res: Response) => {
     const { name, email, password } = req.body;

     if (!email || !password) {
          return res.status(400).json({ message: "Email and password is required" });
     }

     const existingUser = await prisma.user.findUnique({
          where: { email },
     });

     if (existingUser) {
          return res.status(409).json({ message: "User already exist" });
     }

     const hashdedUserPassword = await hashPassword(password);

     const newUser = await prisma.user.create({
          data: { name, email, password: hashdedUserPassword },
     });

     res.status(201).json({ message: "user created", user: { id: newUser.id, email: newUser.email } });
};

export const login = async (req: Request, res: Response) => {
     const { email, password } = req.body; // Fixed typo

     const user = await prisma.user.findUnique({ where: { email } }); // Fixed syntax

     if (!user) {
          return res.status(404).json({ message: "User not found" });
     }

     const isValid = await comparePassword(password, user?.password); // Fixed variable name

     if (!isValid) {
          return res.status(404).json({ message: "Invalid Credentials" });
     }

     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

     res.json({ token });
};

export default { signup, login };