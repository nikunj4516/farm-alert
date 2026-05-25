import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { NewsRecommendationService } from "../services/newsRecommendationService.js";

const router = Router();

const pagination = (req) => ({
  page: Math.max(Number(req.query.page || 1), 1),
  limit: Math.min(Math.max(Number(req.query.limit || 10), 1), 50),
  category: req.query.category,
});

router.get("/", async (req, res, next) => {
  try {
    const result = await NewsRecommendationService.getLatest(pagination(req));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/personalized", requireAuth, async (req, res, next) => {
  try {
    const result = await NewsRecommendationService.getPersonalized({
      userId: req.user.id,
      ...pagination(req),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
