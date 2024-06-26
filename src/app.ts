import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" });
});
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "Success",
    message: "Welcome to Kazibyte API",
    version: "1.0.0",
    author: "ExzoBaidulKazi",
    github: "https://github.com/ExzoBaidulKazi",
    docs: "https://github.com/ExzoBaidulKazi/kazibyte_api",
    contact: "https://github.com/ExzoBaidulKazi/kazibyte_api",
  });
});

const port = process.env.PORT || 5000;
const serviceName = process.env.SERVICE_NAME || "kazibyte_api";

app.listen(port, () => {
  console.log(`${serviceName} is running on port ${port}`);
});

export default app;
