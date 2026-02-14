import swaggerJsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cephi Gaming API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/docs/*.ts", "./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
