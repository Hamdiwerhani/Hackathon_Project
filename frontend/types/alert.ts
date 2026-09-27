export type AlertSeverity = "critical" | "warning" | "info";
export type AlertType = "spike" | "leak" | "setpoint";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export type Alert = {
  id: string;
  buildingId: string;
  buildingName: string;
  zone: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  detectedAt: string;
};
