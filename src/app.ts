import express from "express";
import cors from "cors";
import tokens from "./routes/tokens";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/tokens", tokens);

app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error("Internal Error:", err);
  res.status(500).json({ error: "server error" });
});

export default app;
