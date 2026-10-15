"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, EmptyState, ErrorNote, LoadingBlock, PageHeader, Pagination, StatusBadge, Table, Td, Th } from "@/components/ui";
import { qs, useApi } from "@/lib/client";
import { useFormat, useI18n } from "@/lib/settings";
import type { LowStockRow, PageResult } from "@/lib/types";

export default function LowStockPage() {
  const { t } = useI18n();
  const money = useFormat();
  const [level, setLevel] = useState("ALL");
  const [page, setPage] = useState(1);
  const list = useApi<PageResult<LowStockRow>>(qs("/api/low-stock", { level, page, pageSize: 10 }));
  const filters = ["ALL", "critical", "warning"] as const;

  return (
    <div>
      <PageHeader title={t("page.lowStock")} subtitle={t("sub.lowStock")} />
      <ErrorNote message={list.error} />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { setLevel(item); setPage(1); }}
            className={`rounded-full px-4 py-2 text-sm ${level === item ? "bg-forest text-white" : "border border-line bg-white"}`}
          >
            {t(item === "ALL" ? "label.all" : `label.${item}`)}
          </button>
        ))}
      </div>
      <Card>
        {list.loading ? <LoadingBlock /> : !list.data?.data.length ? <EmptyState title={t("empty.title")} body={t("empty.body")} /> : (
          <Table>
            <thead>
              <tr>
                <Th>{t("label.product")}</Th><Th>{t("label.sku")}</Th><Th>{t("label.warehouse")}</Th><Th>{t("label.quantity")}</Th>
                <Th>{t("label.min")}</Th><Th>{t("label.shortage")}</Th><Th>{t("label.updated")}</Th><Th />
              </tr>
            </thead>
            <tbody>
              {list.data.data.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <Td className="font-medium">{row.product}</Td>
                  <Td>{row.sku}</Td>
                  <Td>{row.warehouse}</Td>
                  <Td className="tabular-nums">{row.quantity}</Td>
                  <Td className="tabular-nums">{row.minStock}</Td>
                  <Td className="tabular-nums text-copper">{row.shortage}</Td>
                  <Td>{money.date(row.updatedAt)}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={row.level === "critical" ? "CANCELLED" : "PROCESSING"} label={t(`label.${row.level}`)} />
                      <Link href={`/purchase-orders/new?productId=${row.productId}&warehouseId=${row.warehouseId}&supplierId=${row.supplierId || ""}`}>
                        <Button className="px-3 py-1.5">{t("action.reorder")}</Button>
                      </Link>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <Pagination page={page} pageSize={list.data?.pageSize || 10} total={list.data?.total || 0} onPage={setPage} />
      </Card>
    </div>
  );
}
