import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import { options } from "./swaggerDoc";

const swaggerDocument = swaggerJSDoc(options);

function swagger(path: string, router: express.Router) {
    router.use(path, swaggerUi.serve);
    router.get(path, swaggerUi.setup(swaggerDocument));
}

export default swagger;
