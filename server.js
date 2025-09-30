import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🚀 SERVER http://localhost:${PORT}`);
});
