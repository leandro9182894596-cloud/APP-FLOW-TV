import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import favoritesRoutes from "./routes/favoritesRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adsRoutes from "./routes/adsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ads", adsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
