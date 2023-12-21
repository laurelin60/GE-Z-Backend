import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { options } from "./swaggerDoc";

const swaggerDocument = swaggerJSDoc(options);

function swagger(path: string, app: Express) {
    app.use(path, swaggerUi.serve);
    app.get(path, swaggerUi.setup(swaggerDocument));
}

export default swagger;
