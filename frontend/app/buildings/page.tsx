import { api } from "@/lib/api";
import BuildingsBoard from "@/components/BuildingsBoard";

export default async function BuildingsPage() {
  const buildings = await api.getBuildings();
  return <BuildingsBoard buildings={buildings} />;
}
