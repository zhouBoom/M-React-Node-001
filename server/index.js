import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("🚀 Server is running normally!");
});
app.listen(4000, () => console.log("✅ Server running on http://localhost:4000"));
