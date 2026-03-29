import express from "express";
import { getJobs } from "../controllers/jobs.js";

export const jobsRouter = express.Router();

jobsRouter.get("/jobs", getJobs);
