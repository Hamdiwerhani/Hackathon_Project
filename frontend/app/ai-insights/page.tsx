import { api } from "@/lib/api";
import RecommendationsBoard from "@/components/RecommendationsBoard";

export default async function AiInsightsPage() {
  const recommendations = await api.getRecommendations();
  return <RecommendationsBoard recommendations={recommendations} />;
}
