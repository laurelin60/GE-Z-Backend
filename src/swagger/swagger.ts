import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { options } from "./swaggerDoc";

const swaggerDocument = swaggerJSDoc(options);

function swagger(path: string, router: express.Router) {
    router.use(path, swaggerUi.serve);
    router.get(path, swaggerUi.setup(swaggerDocument));
}

export default swagger;
