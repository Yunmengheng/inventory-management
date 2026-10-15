"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/providers";
import { Button, Card, ErrorNote, LoadingBlock, PageHeader, StatusBadge, Table, Td, Th } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { useFormat, useI18n } from "@/lib/settings";
import type { StockTransfer } from "@/lib/types";

export default function TransferDetailPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const money = useFormat();
  const toast = useToast();
  const transfer = useApi<StockTransfer>(`/api/stock-transfers/${params.id}`);
  const [busy, setBusy] = useState(false);

  async function act(action: string) {
    setBusy(true);
    try {
      await api(`/api/stock-transfers/${params.id}`, { method: "PATCH", body: JSON.stringify({ action }) });
      toast(t("common.saved"));
      transfer.reload();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update", "bad");
    } finally {
      setBusy(false);
    }
  }

  const data = transfer.data;
  return (
    <div>
      <Link href="/stock-transfers" className="text-sm text-forest">{t("action.back")}</Link>
      <ErrorNote message={transfer.error} />
      {!data ? <LoadingBlock /> : (
        <>
          <PageHeader title={data.transferNumber} subtitle={`${data.sourceWarehouse?.name} → ${data.destWarehouse?.name}`} actions={<StatusBadge status={data.status} label={t(`status.${data.status}`)} />} />
          <Card className="mb-4 p-5 text-sm">
            <p>{t("label.date")}: {money.date(data.transferDate)}</p>
            {data.notes ? <p className="mt-2">{data.notes}</p> : null}
          </Card>
          <Card>
            <Table>
              <thead><tr><Th>{t("label.product")}</Th><Th>{t("label.quantity")}</Th><Th>{t("label.received")}</Th></tr></thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <Td>{item.product?.name}<div className="text-xs text-ink-soft">{item.product?.sku}</div></Td>
                    <Td>{item.requestedQty}</Td>
                    <Td>{item.receivedQty}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.status === "DRAFT" ? <Button disabled={busy} onClick={() => act("SUBMIT")}>{t("action.submit")}</Button> : null}
            {data.status === "PENDING_APPROVAL" ? <Button disabled={busy} onClick={() => act("APPROVE")}>{t("action.approve")}</Button> : null}
            {data.status === "APPROVED" ? <Button disabled={busy} onClick={() => act("SHIP")}>{t("action.ship")}</Button> : null}
            {data.status === "IN_TRANSIT" ? <Button disabled={busy} onClick={() => act("RECEIVE")}>{t("action.receive")}</Button> : null}
            {["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(data.status) ? <Button variant="danger" disabled={busy} onClick={() => act("CANCEL")}>{t("action.cancel")}</Button> : null}
          </div>
        </>
      )}
    </div>
  );
}
