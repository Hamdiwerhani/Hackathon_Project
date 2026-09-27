import { api } from "@/lib/api";
import AlertsBoard from "@/components/AlertsBoard";

export default async function AlertsPage() {
  const alerts = await api.getAlerts();
  return <AlertsBoard alerts={alerts} />;
}
