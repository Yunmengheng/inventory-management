"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, ErrorNote, LoadingBlock, PageHeader, StatusBadge, Table, Td, Th } from "@/components/ui";
import { useApi } from "@/lib/client";
import { useFormat, useI18n } from "@/lib/settings";
import type { Party, SalesOrder } from "@/lib/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const money = useFormat();
  const customer = useApi<Party & { salesOrders: SalesOrder[] }>(`/api/customers/${params.id}`);
  const data = customer.data;
  return (
    <div>
      <Link href="/customers" className="text-sm text-forest">{t("action.back")}</Link>
      <ErrorNote message={customer.error} />
      {!data ? <LoadingBlock /> : (
        <>
          <PageHeader title={data.name} subtitle={[data.city, data.phone, data.email].filter(Boolean).join(" · ")} actions={<StatusBadge status={data.status} label={t(`status.${data.status}`)} />} />
          <Card className="mb-4 p-5 text-sm">
            <p>{data.contactPerson}</p>
            <p>{data.address}</p>
            {data.notes ? <p className="mt-2 text-ink-soft">{data.notes}</p> : null}
          </Card>
          <Card>
            <h2 className="px-5 pt-5 font-serif text-2xl">{t("nav.sales")}</h2>
            <Table>
              <thead><tr><Th>{t("label.order")}</Th><Th>{t("label.date")}</Th><Th>{t("label.status")}</Th><Th>{t("label.total")}</Th></tr></thead>
              <tbody>
                {data.salesOrders.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <Td><Link className="text-forest" href={`/sales-orders/${order.id}`}>{order.orderNumber}</Link></Td>
                    <Td>{money.date(order.orderDate)}</Td>
                    <Td><StatusBadge status={order.status} label={t(`status.${order.status}`)} /></Td>
                    <Td>{money.usd(order.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
