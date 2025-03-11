import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ✅ Function to get an access token
const getSpotifyAccessToken = async () => {
    const authOptions = {
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI 
        })
    };

    const response = await axios(authOptions);
    return response.data.access_token;
};

// ✅ Function to get artist popularity
const getSpotifyArtistData = async (artistName) => {
    try {
        const token = await getSpotifyAccessToken();

        const searchResponse = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (searchResponse.data.artists.items.length === 0) {
            console.log(`No Spotify data found for ${artistName}`);
            return null;
        }

        const artist = searchResponse.data.artists.items[0];

        return {
            name: artist.name,
            popularity: artist.popularity, // Score 0-100
            monthlyListeners: artist.followers.total // Approximate audience size
        };
    } catch (error) {
        console.error("Error fetching Spotify data:", error.message);
        return null;
    }
};

export { getSpotifyArtistData };
