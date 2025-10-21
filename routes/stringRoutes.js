import { Router } from "express";
import analyzeLogic from "../logic.js";

const stringRoutes = Router();

stringRoutes.get("/strings", (req, res) => {
  const { value } = req.body;
  const properties = analyzeLogic(value);

  res.status(200).json({ properties });
});

stringRoutes.post("/strings", (req, res) => {
  const { value } = req.body;
  const properties = analyzeLogic(value);

  res.status(201).json({ properties });
});

export default stringRoutes;
