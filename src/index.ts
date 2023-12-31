require("dotenv").config();
import express from "express";
import cors from "cors";
import routes from "./routes";
import logger from "./util/logger";

export const app = express();
const PORT =
    process.env.NODE_ENV === "test" ? process.env.TEST_PORT : process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api", routes);

app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}/api/docs`);
    logger.info(`environment: ${process.env.NODE_ENV}`);
});
