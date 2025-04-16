import express from "express";
import { sendMessage } from "./model.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const response = await sendMessage(message);
  res.send({ message: response });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});