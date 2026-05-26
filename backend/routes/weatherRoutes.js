import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { WeatherService } from "../services/weatherService.js";

const router = Router();

router.get("/intelligence", requireAuth, async (req, res, next) => {
  try {
    const location = {
      village: req.query.village,
      taluka: req.query.taluka,
      district: req.query.district,
      state: req.query.state,
    };
    const result = await WeatherService.getCurrentWeather(location, req.query.cropName, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
