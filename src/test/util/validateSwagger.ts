import { z } from "zod";

type SwaggerSchema = {
    type: string;
    properties?: { [key: string]: SwaggerSchema };
    items?: SwaggerSchema;
};

function swaggerSchemaToZod(swaggerSchema: SwaggerSchema): z.ZodSchema {
    switch (swaggerSchema.type) {
        case "object":
            if (!swaggerSchema.properties) {
                throw new Error(
                    'Invalid Swagger schema: missing "properties" field for object type',
                );
            }
            return z
                .object(
                    Object.fromEntries(
                        Object.entries(swaggerSchema.properties).map(
                            ([propertyName, propertySchema]) => [
                                propertyName,
                                swaggerSchemaToZod(propertySchema),
                            ],
                        ),
                    ),
                )
                .strict();

        case "array":
            if (!swaggerSchema.items) {
                throw new Error(
                    'Invalid Swagger schema: missing "items" field for array type',
                );
            }

            return z.array(swaggerSchemaToZod(swaggerSchema.items));

        case "string":
            return z.string();

        case "number":
            return z.number();

        default:
            throw new Error(`Unsupported Swagger type: ${swaggerSchema.type}`);
    }
}

export default function validateSwagger(
    swaggerSchema: SwaggerSchema,
    response: ChaiHttp.Response,
) {
    return swaggerSchemaToZod(swaggerSchema).parse(response);
}
