import { PrismaClient } from "@prisma/client";
import { getSpotifyArtistData } from "../spotifyService.js";
import { getYouTubeStats } from "../youtubeService.js";

const prisma = new PrismaClient();

// ✅ Function to update stock prices based on Spotify & YouTube data
const updateArtistStockPrices = async () => {
    try {
        console.log("🔄 Running stock price update...");

        const artists = await prisma.artist.findMany();

        for (let artist of artists) {
            let newStockPrice = artist.stockPrice;
            let changeFactor = 0;

            console.log(`📡 Fetching data for ${artist.name}...`);

            // ✅ Fetch Spotify Data
            const spotifyData = await getSpotifyArtistData(artist.name) || { popularity: 0, monthlyListeners: 0 };
            if (spotifyData) {
                const { popularity, monthlyListeners } = spotifyData;
                const lastMonthListeners = artist.lastMonthListeners ? Number(artist.lastMonthListeners) : Number(monthlyListeners);

                // 🔥 Compare monthly listeners change (Increase or Decrease)
                const listenerChange = ((Number(monthlyListeners) - lastMonthListeners) / (lastMonthListeners + 1)) || 0; // Avoid divide by zero
                changeFactor += listenerChange * 0.5; // 🔥 Increase weight for streaming growth

                console.log(`🎵 Spotify Data - Popularity: ${popularity}, Monthly Listeners: ${monthlyListeners}, Change: ${listenerChange.toFixed(3)}`);
            } else {
                console.log(`⚠️ No Spotify data found for ${artist.name}`);
            }

            // ✅ Fetch YouTube Data (Now with API failure fallback)
            let youtubeData = await getYouTubeStats(artist.name) || { totalViews: 0 };
            if (!youtubeData.totalViews) {
                console.log(`🚨 YouTube API Limit Reached (403) - Using last known values.`);
                youtubeData.totalViews = artist.lastTotalViews ? artist.lastTotalViews * 1.02 : 0; // Assume 2% growth if past data exists
            }

            if (youtubeData) {
                const { totalViews } = youtubeData;
                const lastTotalViews = artist.lastTotalViews ? Number(artist.lastTotalViews) : Number(totalViews);

                // 🔥 Compare views change (Increase or Decrease)
                const viewChange = ((Number(totalViews) - lastTotalViews) / (lastTotalViews + 1)) || 0; // Avoid divide by zero
                changeFactor += viewChange * 0.3; // 🔥 Increase YouTube weight

                console.log(`📺 YouTube Data - Total Views: ${Number(totalViews)}, Change: ${viewChange.toFixed(3)}`);
            } else {
                console.log(`⚠️ No YouTube data found for ${artist.name}`);
            }

            // ✅ **Stock Price Formula with Tiered Scaling**
            let basePrice = Math.max(
                5, // New base price to avoid undervaluing unknown artists
                (spotifyData.popularity * 3) + Math.sqrt(spotifyData.monthlyListeners) / 200 + (youtubeData.totalViews / 10_000_000)
            );

            // ✅ Apply Growth Factor to Stock Price
            newStockPrice *= (1 + changeFactor);

            // ✅ **Ensure unknown artists have a dynamic base price**
            if (newStockPrice < 5) {
                console.log(`🚨 Unknown Artist detected! Adjusting stock price to base price: $${basePrice.toFixed(2)}`);
                newStockPrice = basePrice;
            }

            // ✅ **Scaling Curve: High stock prices grow slower**
            if (artist.stockPrice > 50000) {
                newStockPrice = artist.stockPrice + ((newStockPrice - artist.stockPrice) * 0.5);
            } else if (artist.stockPrice > 20000) {
                newStockPrice = artist.stockPrice + ((newStockPrice - artist.stockPrice) * 0.7);
            }

            // 🔥 **Final Limit: Cap max increase at +30%**
            newStockPrice = Math.max(0.01, Math.min(newStockPrice, artist.stockPrice * 1.3));

            // ✅ Debugging: Log final calculated stock price
            console.log(`💰 Final calculated price for ${artist.name}: $${newStockPrice.toFixed(2)}`);

            // ✅ Save the updated stock price to the database
            await prisma.artist.update({
                where: { id: artist.id },
                data: { 
                    stockPrice: parseFloat(newStockPrice.toFixed(2)),
                    lastMonthListeners: spotifyData ? Number(spotifyData.monthlyListeners) : Number(artist.lastMonthListeners),
                    lastTotalViews: youtubeData ? Number(youtubeData.totalViews) : Number(artist.lastTotalViews)
                }
            });

            console.log(`✅ Final saved stock price for ${artist.name}: $${newStockPrice.toFixed(2)}`);
        }

        console.log("✅ Stock price update completed.");
    } catch (error) {
        console.error("❌ Error updating artist stock prices:", error);
    }
};

// ✅ Export function for use in index.js
export { updateArtistStockPrices };
















