"use client";

import Link from "next/link";
import { SalesLine, StockBars } from "@/components/charts";
import { useAuth } from "@/components/providers";
import { Card, ErrorNote, LoadingBlock, PageHeader, StatusBadge, Table, Td, Th } from "@/components/ui";
import { useApi } from "@/lib/client";
import { useFormat, useI18n } from "@/lib/settings";
import type { LowStockRow } from "@/lib/types";

type Dashboard = {
  kpis: { products: number; stockValue: number; lowStock: number; pendingOrders: number };
  stockByCategory: { name: string; quantity: number }[];
  sales: { date: string; label: string; total: number }[];
  activity: { id: string; product: string; type: string; quantity: number; warehouse: string; createdAt: string }[];
  lowStock: LowStockRow[];
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const money = useFormat();
  const { data, loading, error } = useApi<Dashboard>("/api/dashboard");
  const hour = new Date().getHours();
  const greet = hour < 12 ? t("greet.morning") : hour < 17 ? t("greet.afternoon") : t("greet.evening");

  return (
    <div>
      <PageHeader title={`${greet}, ${user?.name.split(" ")[0] || ""}`} subtitle={t("sub.dashboard")} />
      <ErrorNote message={error} />
      {loading || !data ? <LoadingBlock /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 2xl:grid-cols-4">
            <Kpi label={t("dash.products")} value={String(data.kpis.products)} hint={t("sub.products")} />
            <Kpi label={t("dash.value")} value={money.usd(data.kpis.stockValue)} hint="USD at cost" />
            <Kpi label={t("dash.low")} value={String(data.kpis.lowStock)} hint={t("sub.lowStock")} />
            <Kpi label={t("dash.pending")} value={String(data.kpis.pendingOrders)} hint={t("sub.orders")} />
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-3 font-serif text-2xl">{t("dash.byCategory")}</h2>
              <StockBars data={data.stockByCategory} />
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 font-serif text-2xl">{t("dash.sales30")}</h2>
              <SalesLine data={data.sales} />
            </Card>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <h2 className="px-5 pt-5 font-serif text-2xl">{t("dash.activity")}</h2>
              <Table>
                <thead><tr><Th>{t("label.product")}</Th><Th>{t("label.type")}</Th><Th>{t("label.quantity")}</Th><Th>{t("label.warehouse")}</Th><Th>{t("label.date")}</Th></tr></thead>
                <tbody>
                  {data.activity.map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <Td>{row.product}</Td>
                      <Td><StatusBadge status={row.type} label={t(`status.${row.type}`)} /></Td>
                      <Td className="tabular-nums">{row.quantity > 0 ? `+${row.quantity}` : row.quantity}</Td>
                      <Td>{row.warehouse}</Td>
                      <Td>{money.dateTime(row.createdAt)}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
            <Card className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-2xl">{t("dash.lowTable")}</h2>
                <Link href="/low-stock" className="text-sm text-forest">{t("nav.lowStock")}</Link>
              </div>
              <div className="grid gap-3">
                {data.lowStock.map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-3 border-b border-line pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{row.product}</p>
                      <p className="text-xs text-ink-soft">{row.warehouse} · {row.sku}</p>
                    </div>
                    <p className="text-sm tabular-nums text-copper">{row.quantity} / {row.minStock}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
      <p className="mt-3 font-serif text-3xl leading-none tracking-tight tabular-nums sm:text-[2rem] 2xl:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-ink-soft">{hint}</p>
    </Card>
  );
}
