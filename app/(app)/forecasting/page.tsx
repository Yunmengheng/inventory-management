"use client";

import { useState } from "react";
import { Button, Card, ErrorNote, LoadingBlock, PageHeader, StatusBadge, Table, Td, Th } from "@/components/ui";
import { useApi } from "@/lib/client";
import { formatQty } from "@/lib/format";
import { useI18n } from "@/lib/settings";

type Forecast = {
  generatedAt: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    dailyAvg: number;
    demand7: number;
    demand30: number;
    currentStock: number;
    daysRemaining: number | null;
    reorderQty: number;
    signal: "healthy" | "soon" | "critical";
  }[];
};

const tone = { healthy: "ACTIVE", soon: "PROCESSING", critical: "CANCELLED" };

export default function ForecastingPage() {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const forecast = useApi<Forecast>(`/api/forecasting?t=${tick}`);

  return (
    <div>
      <PageHeader
        title={t("page.forecast")}
        subtitle={t("sub.forecast")}
        actions={<Button disabled={busy} onClick={() => { setBusy(true); setTick((n) => n + 1); setTimeout(() => setBusy(false), 400); }}>{t("action.recalculate")}</Button>}
      />
      <ErrorNote message={forecast.error} />
      <Card>
        {forecast.loading || !forecast.data ? <LoadingBlock /> : (
          <Table>
            <thead>
              <tr>
                <Th>{t("label.product")}</Th><Th>{t("label.avg")}</Th><Th>{t("label.d7")}</Th><Th>{t("label.d30")}</Th>
                <Th>{t("label.stock")}</Th><Th>{t("label.days")}</Th><Th>{t("label.reorderQty")}</Th><Th>{t("label.signal")}</Th>
              </tr>
            </thead>
            <tbody>
              {forecast.data.items.map((item) => (
                <tr key={item.productId} className="border-t border-line">
                  <Td className="font-medium">{item.name}<div className="text-xs text-ink-soft">{item.sku}</div></Td>
                  <Td className="tabular-nums">{formatQty(item.dailyAvg)}</Td>
                  <Td className="tabular-nums">{formatQty(item.demand7)}</Td>
                  <Td className="tabular-nums">{formatQty(item.demand30)}</Td>
                  <Td className="tabular-nums">{formatQty(item.currentStock)}</Td>
                  <Td className="tabular-nums">{item.daysRemaining == null ? "—" : formatQty(item.daysRemaining)}</Td>
                  <Td className="tabular-nums">{item.reorderQty}</Td>
                  <Td><StatusBadge status={tone[item.signal]} label={t(`signal.${item.signal}`)} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
