import { api } from "@/lib/api";
import InvoicesBoard from "@/components/InvoicesBoard";

export default async function InvoicesPage() {
  const invoices = await api.getInvoices();
  return <InvoicesBoard invoices={invoices} />;
}
