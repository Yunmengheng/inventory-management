"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { KhmerInvoice, toInvoice } from "@/components/invoice";
import { useToast } from "@/components/providers";
import { Button, Card, ErrorNote, LoadingBlock, Modal, PageHeader, StatusBadge, Table, Td, Th } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { useFormat, useI18n } from "@/lib/settings";
import type { SalesOrder } from "@/lib/types";

export default function SalesOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const money = useFormat();
  const toast = useToast();
  const order = useApi<SalesOrder>(`/api/sales-orders/${params.id}`);
  const [busy, setBusy] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  async function act(action: string) {
    setBusy(true);
    try {
      await api(`/api/sales-orders/${params.id}`, { method: "PATCH", body: JSON.stringify({ action }) });
      toast(t("common.saved"));
      order.reload();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update", "bad");
    } finally {
      setBusy(false);
    }
  }

  const data = order.data;
  return (
    <div>
      <Link href="/sales-orders" className="text-sm text-forest">{t("action.back")}</Link>
      <ErrorNote message={order.error} />
      {!data ? <LoadingBlock /> : (
        <>
          <PageHeader
            title={data.orderNumber}
            subtitle={`${data.customer?.name || t("label.walkIn")} · ${data.warehouse?.name || ""}`}
            actions={<StatusBadge status={data.status} label={t(`status.${data.status}`)} />}
          />
          <Card className="mb-4 grid gap-2 p-5 text-sm md:grid-cols-4">
            <p>{t("label.date")}: {money.date(data.orderDate)}</p>
            <p>{t("label.delivery")}: {money.date(data.deliveryDate)}</p>
            <p>{t("label.discount")}: {money.usd(data.discount)}</p>
            <p>{t("label.total")}: {money.usd(data.total)}</p>
          </Card>
          <Card>
            <Table>
              <thead><tr><Th>{t("label.product")}</Th><Th>{t("label.quantity")}</Th><Th>{t("label.price")}</Th><Th>{t("label.total")}</Th></tr></thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <Td>{item.product?.name}<div className="text-xs text-ink-soft">{item.product?.sku}</div></Td>
                    <Td>{item.quantity}</Td>
                    <Td className="tabular-nums">{money.usd(item.unitPrice)}</Td>
                    <Td className="tabular-nums">{money.usd(item.quantity * item.unitPrice)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.status === "DRAFT" ? <Button disabled={busy} onClick={() => act("CONFIRM")}>{t("action.confirm")}</Button> : null}
            {data.status === "CONFIRMED" ? <Button disabled={busy} onClick={() => act("PROCESS")}>{t("action.process")}</Button> : null}
            {["CONFIRMED", "PROCESSING"].includes(data.status) ? <Button disabled={busy} onClick={() => act("COMPLETE")}>{t("action.complete")}</Button> : null}
            {["DRAFT", "CONFIRMED", "PROCESSING"].includes(data.status) ? <Button variant="danger" disabled={busy} onClick={() => act("CANCEL")}>{t("action.cancel")}</Button> : null}
            {data.status !== "CANCELLED" ? <Button variant="outline" onClick={() => setPrintOpen(true)}>{t("action.print")}</Button> : null}
          </div>
          <Modal open={printOpen} title={t("action.print")} onClose={() => setPrintOpen(false)} wide>
            <KhmerInvoice order={toInvoice(data, t("label.walkIn"))} />
          </Modal>
        </>
      )}
    </div>
  );
}
