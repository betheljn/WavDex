import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import artistRoutes from "./routes/artistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import { updateArtistStockPrices } from "./services/stockService/stockUpdater.js"; // ✅ Import from new file

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Wavdex Backend Running!");
});

// Register API Routes
app.use("/artists", artistRoutes);
app.use("/users", userRoutes);
app.use("/investments", investmentRoutes);

// Manually trigger stock price update on startup
updateArtistStockPrices();

// ✅ Run the stock update function every 30 minutes
setInterval(updateArtistStockPrices, 30 * 60 * 1000);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});





