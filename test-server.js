import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: "Test server working!" });
});

const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`Test server running on port ${port}`);
}); 