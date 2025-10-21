import { Router } from "express";

const stringRoutes = Router();

stringRoutes.get("/strings", (req, res) => {
  res.status(200).send("it worked");
});

stringRoutes.post("/strings", (req, res) => {
  const { stringValue } = req.body;

  res.status(201).json(stringValue);
});

export default stringRoutes;
