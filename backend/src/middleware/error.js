import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: error.issues.map((issue) => issue.message).join(", ")
    });
  }

  const status = error.status || 500;
  if (status >= 500) {
    console.error("Request failed:", error);
  }

  res.status(status).json({
    message: status >= 500 ? "Internal server error" : error.message || "Request failed"
  });
}
