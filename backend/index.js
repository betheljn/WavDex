require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Wavdex Backend Running!");
});

// Fetch all artists
app.get("/artists", async (req, res) => {
    try {
        const artists = await prisma.artist.findMany();
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: "Error fetching artists" });
    }
});

// Add a new artist
app.post("/artists", async (req, res) => {
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

// Start server
app.listen(5001, () => {
    console.log("Server running on port 5000");
});

