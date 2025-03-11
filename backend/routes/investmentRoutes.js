import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import moment from "moment";

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

// ✅ Create an Investment (User must be logged in)
router.post("/", authMiddleware, async (req, res) => {
    const { artistId, amount } = req.body;

    try {
        // ✅ Get userId from authenticated user (JWT token)
        const userId = req.user.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized: Missing user ID" });

        // ✅ Check if the artist exists
        const artist = await prisma.artist.findUnique({ where: { id: artistId } });
        if (!artist) return res.status(404).json({ error: "Artist not found" });

        // ✅ Create the investment
        const investment = await prisma.investment.create({
            data: { userId, artistId, amount },
        });

        res.json(investment);
    } catch (error) {
        console.error("Investment Creation Error:", error);
        res.status(500).json({ error: "Error creating investment", details: error.message });
    }
});

// ✅ Get Investment History for Logged-in User
router.get("/history", authMiddleware, async (req, res) => {
    const userId = req.user.userId; // Get user ID from JWT

    try {
        const investments = await prisma.investment.findMany({
            where: { userId },
            include: { artist: true }, // Include artist details
            orderBy: { createdAt: "desc" }, // Sort by latest investments
        });

        // ✅ Format the response
        const formattedInvestments = investments.map((investment) => ({
            investmentId: investment.id,
            artistName: investment.artist.name,
            artistGenre: investment.artist.genre,
            investedAmount: `$${investment.amount.toFixed(2)}`, // Format as currency
            stockPrice: `$${investment.artist.stockPrice.toFixed(2)}`, // Show stock price
            date: moment(investment.createdAt).format("MMMM Do YYYY, h:mm a") // Format date
        }));

        res.json({ totalInvestments: formattedInvestments.length, investments: formattedInvestments });
    } catch (error) {
        console.error("Error fetching investment history:", error);
        res.status(500).json({ error: "Error fetching investment history", details: error.message });
    }
});

// ✅ Sell an Investment (Delete)
router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId; // Ensure user can only delete their own investments

    try {
        // ✅ Check if investment exists
        const investment = await prisma.investment.findUnique({
            where: { id },
            include: { artist: true }
        });

        if (!investment) {
            return res.status(404).json({ error: "Investment not found" });
        }

        // ✅ Ensure user owns this investment
        if (investment.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized to sell this investment" });
        }

        // ✅ Delete the investment
        await prisma.investment.delete({ where: { id } });

        res.json({
            message: "Investment successfully sold",
            artist: investment.artist.name,
            amountRefunded: `$${investment.amount.toFixed(2)}`
        });
    } catch (error) {
        console.error("Error selling investment:", error);
        res.status(500).json({ error: "Error selling investment", details: error.message });
    }
});

export default router;
