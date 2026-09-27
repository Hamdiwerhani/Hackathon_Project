export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type Invoice = {
  id: string;
  buildingId: string;
  building: string;
  period: string;
  issueDate: string;
  dueDate: string;
  kWh: number;
  amount: number;
  status: InvoiceStatus;
  provider: string;
};
