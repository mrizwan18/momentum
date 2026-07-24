import type { RecommendationRecord } from "@momentum/types";
import type { MomentumDatabase } from "../db";
import {
  createRecommendation,
  type CreateRecommendationInput,
} from "../factories/recommendation-factory";

export type { CreateRecommendationInput };

export interface RecommendationRepository {
  /** Selecting *which* recommendation to generate is the engine's job — this only persists one. */
  create(input: CreateRecommendationInput): Promise<RecommendationRecord>;
  getLatest(): Promise<RecommendationRecord | undefined>;
}

export function createRecommendationRepository(
  db: MomentumDatabase,
): RecommendationRepository {
  return {
    async create(input) {
      return db.transaction("rw", db.recommendations, async () => {
        const record = createRecommendation(input);
        await db.recommendations.add(record);
        return record;
      });
    },

    async getLatest() {
      return db.recommendations.orderBy("createdAt").reverse().first();
    },
  };
}
