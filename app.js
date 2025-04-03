import express from "express";
import { sendMessage } from "./model.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  const response = await sendMessage(message);
  res.send({ message: response });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
