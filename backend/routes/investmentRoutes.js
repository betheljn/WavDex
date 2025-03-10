import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get All Investments
router.get("/", async (req, res) => {
    try {
        const investments = await prisma.investment.findMany({
            include: { artist: true, user: true },
        });
        res.json(investments);
    } catch (error) {
        res.status(500).json({ error: "Error fetching investments" });
    }
});

// Create an Investment
router.post("/", async (req, res) => {
    const { userId, artistId, amount } = req.body;

    try {
        const investment = await prisma.investment.create({
            data: { userId, artistId, amount },
        });

        res.json(investment);
    } catch (error) {
        res.status(500).json({ error: "Error creating investment" });
    }
});

// Delete an Investment
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.investment.delete({ where: { id } });
        res.json({ message: "Investment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting investment" });
    }
});

export default router;
