import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { SAMPLE_OFFERS, CATEGORIES, type Offer, type Category } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const categoriesWithCounts: Category[] = CATEGORIES.map((cat) => ({
    ...cat,
    offerCount: SAMPLE_OFFERS.filter((o) => o.category === cat.id).length,
  }));

  app.get("/api/offers", (req: Request, res: Response) => {
    const { category, search, featured } = req.query;
    let filtered = [...SAMPLE_OFFERS];

    if (category && typeof category === "string") {
      filtered = filtered.filter((o) => o.category === category);
    }

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.companyName.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q)
      );
    }

    if (featured === "true") {
      filtered = filtered.filter((o) => o.featured);
    }

    res.json(filtered);
  });

  app.get("/api/offers/:id", (req: Request, res: Response) => {
    const offer = SAMPLE_OFFERS.find((o) => o.id === req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.json(offer);
  });

  app.get("/api/categories", (_req: Request, res: Response) => {
    res.json(categoriesWithCounts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
