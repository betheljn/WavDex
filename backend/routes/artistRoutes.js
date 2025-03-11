import express from "express";
import { PrismaClient } from "@prisma/client";
import { getSpotifyArtistData } from "../services/spotifyService.js";
import { getYouTubeStats } from "../services/youtubeService.js";


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
    const { name, genre } = req.body;

    try {
        console.log(`📡 Attempting to add artist: ${name}`);

        // ✅ Fetch engagement data
        const spotifyData = await getSpotifyArtistData(name) || { popularity: 0, monthlyListeners: 0 };
        const youtubeData = await getYouTubeStats(name) || { totalViews: 0 };

        // ✅ Calculate initial price
        let basePrice = 10.00;
        basePrice = Math.max(
            10,
            (spotifyData.popularity * 2) + (spotifyData.monthlyListeners / 1_000_000) + (youtubeData.totalViews / 10_000_000)
        );

        console.log(`🎵 Spotify Popularity: ${spotifyData.popularity}, Monthly Listeners: ${spotifyData.monthlyListeners}`);
        console.log(`📺 YouTube Total Views: ${youtubeData.totalViews}`);
        console.log(`💰 Calculated Stock Price: ${basePrice.toFixed(2)}`);

        // ✅ Create the new artist with the calculated stock price
        const newArtist = await prisma.artist.create({
            data: {
                name,
                genre,
                stockPrice: parseFloat(basePrice.toFixed(2)),
                lastMonthListeners: spotifyData ? spotifyData.monthlyListeners : 0,
                lastTotalViews: youtubeData ? youtubeData.totalViews : 0,
            },
        });

        console.log(`✅ Artist '${name}' created successfully`);
        res.json(newArtist);
    } catch (error) {
        console.error(`❌ Error creating artist:`, error);
        res.status(500).json({ error: "Error creating artist", details: error.message });
    }
});



export default router;

