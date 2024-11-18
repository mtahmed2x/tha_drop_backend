import { Response } from "express";

type CustomError = Error & {
  code?: number | string;
  response?: { status: number };
};

function handleError(error: CustomError, res: Response) {
  if (error.code === 11000) {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }

  if (error.name === "MongoNetworkError") {
    return res.status(503).json({ error: error.message });
  }

  if (error.name === "MongoTimeoutError") {
    return res.status(504).json({ error: error.message });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({ error: error.message });
  }

  if (error.name === "WriteConcernError") {
    return res.status(500).json({ error: error.message });
  }

  if (error.code === "EADDRINUSE") {
    return res.status(500).json({ error: error.message });
  }

  if (error.code === "ENOENT") {
    return res.status(500).json({ error: error.message });
  }

  if (error.response && error.response.status === 502) {
    return res.status(502).json({ error: error.message });
  }

  return res.status(500).json({ error: error.message });
}

export default handleError;
