import express from "express";
import type { Express } from "express";
import { setupSwagger } from "./utils/setUpSwagger";

const app: Express = express();

const PORT = 5000;

setupSwagger(app);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
