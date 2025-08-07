import { RequestHandler } from "express";

export const handleDemo = (req, res) => {
  res.json({
    message: "Demo endpoint working!",
    timestamp: new Date().toISOString(),
    status: "success",
  });
};
