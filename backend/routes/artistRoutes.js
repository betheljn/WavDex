import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Fetch all artists
router.get("/", async (req, res) => {
    try {
        const artists = await prisma.artist.findMany();
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: "Error fetching artists" });
    }
});

// Add a new artist
router.post("/", async (req, res) => {
    const { name, genre, stockPrice } = req.body;
    try {
        const newArtist = await prisma.artist.create({
            data: { name, genre, stockPrice },
        });
        res.json(newArtist);
    } catch (error) {
        res.status(500).json({ error: "Error creating artist" });
    }
});

export default router;

