require("dotenv").config();
import swagger from "./swagger/swagger";
import express from "express";
import cors from "cors";
import routes from "./routes";
import logger from "./util/logger";

export const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

swagger("/api/docs", app);

app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}/api/docs`);
    logger.info(`environment: ${process.env.NODE_ENV}`);
});
