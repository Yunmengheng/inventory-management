"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { blankLine, LineEditor, type DraftLine } from "@/components/lines";
import { useToast } from "@/components/providers";
import { Button, Card, Field, PageHeader, Select, TextArea, TextInput } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { round2, toDateInput } from "@/lib/format";
import { useFormat, useI18n } from "@/lib/settings";
import type { Meta } from "@/lib/types";

export default function NewPurchaseOrderPage() {
  const { t } = useI18n();
  const money = useFormat();
  const toast = useToast();
  const router = useRouter();
  const meta = useApi<Meta>("/api/meta");
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [expected, setExpected] = useState(toDateInput(new Date(Date.now() + 3 * 86400000)));
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([blankLine()]);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!meta.data || ready) return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productId") || "";
    const product = meta.data.products.find((item) => item.id === productId);
    setSupplierId(params.get("supplierId") || meta.data.suppliers[0]?.id || "");
    setWarehouseId(params.get("warehouseId") || meta.data.warehouses[0]?.id || "");
    if (product) {
      setLines([{ key: "prefill", productId: product.id, quantity: String(Math.max(1, Math.ceil(product.minStock || 1))), price: String(product.costPrice) }]);
    }
    setReady(true);
  }, [meta.data, ready]);

  const total = round2(lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.price) || 0), 0));

  async function save(status: "DRAFT" | "SUBMITTED") {
    setBusy(true);
    try {
      const order = await api<{ id: string }>("/api/purchase-orders", {
        method: "POST",
        body: JSON.stringify({
          supplierId,
          warehouseId,
          expectedDelivery: expected,
          notes,
          status,
          items: lines.filter((line) => line.productId).map((line) => ({ productId: line.productId, quantity: Number(line.quantity), unitCost: Number(line.price) })),
        }),
      });
      router.push(`/purchase-orders/${order.id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save", "bad");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title={t("page.newPurchase")} subtitle={t("sub.purchase")} />
      <Card className="grid gap-5 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("label.supplier")}>
            <Select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
              {meta.data?.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
            </Select>
          </Field>
          <Field label={t("label.warehouse")}>
            <Select value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}>
              {meta.data?.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
            </Select>
          </Field>
          <Field label={t("label.expected")}><TextInput type="date" value={expected} onChange={(event) => setExpected(event.target.value)} /></Field>
        </div>
        <LineEditor lines={lines} onChange={setLines} products={meta.data?.products || []} showPrice priceLabel={t("label.cost")} priceOf={(product) => product.costPrice} />
        <Field label={t("label.notes")}><TextArea value={notes} onChange={(event) => setNotes(event.target.value)} /></Field>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-serif text-3xl tabular-nums">{money.usd(total)}</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => save("DRAFT")}>{t("action.saveDraft")}</Button>
            <Button disabled={busy} onClick={() => save("SUBMITTED")}>{t("action.submit")}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
