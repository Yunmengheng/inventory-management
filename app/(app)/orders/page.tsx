"use client";

import Link from "next/link";
import { ArrowLeftRight, ClipboardList, Receipt } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";
import { useI18n } from "@/lib/settings";

const cards = [
  { href: "/purchase-orders", title: "nav.purchase", body: "orders.purchaseBody", icon: ClipboardList },
  { href: "/sales-orders", title: "nav.sales", body: "orders.salesBody", icon: Receipt },
  { href: "/stock-transfers", title: "nav.transfers", body: "orders.transferBody", icon: ArrowLeftRight },
];

export default function OrdersPage() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader title={t("page.orders")} subtitle={t("sub.orders")} />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full p-6 transition hover:-translate-y-0.5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mist text-forest"><Icon size={18} /></span>
                <h2 className="mt-5 font-serif text-3xl">{t(card.title)}</h2>
                <p className="mt-2 text-sm text-ink-soft">{t(card.body)}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
