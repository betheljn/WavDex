import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEO_STATS_URL = "https://www.googleapis.com/youtube/v3/videos";

// ✅ Function to get YouTube video stats for an artist
// ✅ Function to Fetch YouTube Statistics
export const getYouTubeStats = async (artistName) => {
    try {
        console.log(`📡 Fetching YouTube data for ${artistName}...`);

        // 🔎 Step 1: Search for the artist’s official channel
        const searchResponse = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                key: YOUTUBE_API_KEY,
                q: artistName,
                part: "snippet",
                type: "channel",
                maxResults: 1,
            },
        });

        if (searchResponse.data.items.length === 0) {
            console.log(`⚠️ No YouTube channel found for ${artistName}`);
            return { totalViews: 0 };
        }

        const channelId = searchResponse.data.items[0].id.channelId;

        // 🔎 Step 2: Get the most recent videos and calculate total views
        const videoResponse = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                key: YOUTUBE_API_KEY,
                channelId,
                part: "snippet",
                order: "date",
                type: "video",
                maxResults: 5,
            },
        });

        const videoIds = videoResponse.data.items.map((video) => video.id.videoId).join(",");

        if (!videoIds) {
            console.log(`⚠️ No videos found for ${artistName}`);
            return { totalViews: 0 };
        }

        // 🔎 Step 3: Get video stats
        const statsResponse = await axios.get(YOUTUBE_VIDEO_STATS_URL, {
            params: {
                key: YOUTUBE_API_KEY,
                id: videoIds,
                part: "statistics",
            },
        });

        let totalViews = 0;
        statsResponse.data.items.forEach((video) => {
            totalViews += parseInt(video.statistics.viewCount, 10);
        });

        console.log(`📺 YouTube Total Views for ${artistName}: ${totalViews}`);

        return { totalViews };

    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error(`🚨 YouTube API Limit Reached (403) - Returning last known values.`);
            return { totalViews: 0 };
        }
        console.error(`❌ Error fetching YouTube data: ${error.message}`);
        return { totalViews: 0 };
    }
};