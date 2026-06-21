"use client";

import { useMemo, useState } from "react";
import {
  computeInvoice,
  formatINR,
  type LineItem,
  type PriceMode,
  type SupplyType,
} from "@/lib/gst";
import {
  DIGITAL_HEROES_URL,
  OWNER_EMAIL,
  OWNER_NAME,
} from "@/lib/site";

const GST_PRESETS = [0, 5, 12, 18, 28];

let idCounter = 0;
const newItem = (over: Partial<LineItem> = {}): LineItem => ({
  id: `item-${++idCounter}`,
  description: "",
  qty: 1,
  rate: 0,
  gstRate: 18,
  ...over,
});

export default function Home() {
  const [items, setItems] = useState<LineItem[]>([
    newItem({ description: "Item / Service", qty: 1, rate: 1000, gstRate: 18 }),
  ]);
  const [supplyType, setSupplyType] = useState<SupplyType>("intra");
  const [priceMode, setPriceMode] = useState<PriceMode>("exclusive");
  const [discountPct, setDiscountPct] = useState(0);
  const [seller, setSeller] = useState("");
  const [buyer, setBuyer] = useState("");

  const totals = useMemo(
    () => computeInvoice(items, { supplyType, priceMode, discountPct }),
    [items, supplyType, priceMode, discountPct]
  );

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const removeItem = (id: string) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));

  const addItem = () => setItems((prev) => [...prev, newItem()]);

  const reset = () => {
    setItems([newItem({ description: "Item / Service", qty: 1, rate: 1000, gstRate: 18 })]);
    setDiscountPct(0);
    setSeller("");
    setBuyer("");
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
      {/* Header */}
      <header className="no-print mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            GST Invoice Calculator <span className="text-indigo-600">🇮🇳</span>
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Add your items, pick CGST/SGST or IGST, handle GST-inclusive or
            exclusive prices, and get an instant, printable invoice. Free, no
            signup.
          </p>
        </div>
        <a
          href={DIGITAL_HEROES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          ⚡ Built for Digital Heroes
        </a>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: inputs ── */}
        <section className="no-print space-y-6">
          {/* Options */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type of supply
                </label>
                <Toggle
                  value={supplyType}
                  onChange={(v) => setSupplyType(v as SupplyType)}
                  options={[
                    { value: "intra", label: "Intra-state (CGST + SGST)" },
                    { value: "inter", label: "Inter-state (IGST)" },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Entered price is
                </label>
                <Toggle
                  value={priceMode}
                  onChange={(v) => setPriceMode(v as PriceMode)}
                  options={[
                    { value: "exclusive", label: "GST exclusive" },
                    { value: "inclusive", label: "GST inclusive" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Optional parties */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Seller / business (optional)">
              <input
                className={inputCls}
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                placeholder="Your business name"
              />
            </Field>
            <Field label="Buyer / client (optional)">
              <input
                className={inputCls}
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                placeholder="Client name"
              />
            </Field>
          </div>

          {/* Line items */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Line items</h2>
              <span className="text-xs text-slate-400">{items.length} item(s)</span>
            </div>

            <div className="space-y-3">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      #{i + 1}
                    </span>
                    <button
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      className="text-xs font-medium text-rose-500 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-slate-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className={`${inputCls} mb-2`}
                    value={it.description}
                    onChange={(e) =>
                      updateItem(it.id, { description: e.target.value })
                    }
                    placeholder="Description"
                  />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Field label="Qty" tight>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, { qty: parseFloat(e.target.value) })
                        }
                      />
                    </Field>
                    <Field label="Rate (₹)" tight>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={it.rate}
                        onChange={(e) =>
                          updateItem(it.id, { rate: parseFloat(e.target.value) })
                        }
                      />
                    </Field>
                    <Field label="GST %" tight>
                      <select
                        className={inputCls}
                        value={it.gstRate}
                        onChange={(e) =>
                          updateItem(it.id, {
                            gstRate: parseFloat(e.target.value),
                          })
                        }
                      >
                        {GST_PRESETS.map((r) => (
                          <option key={r} value={r}>
                            {r}%
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Amount" tight>
                      <div className="flex h-[38px] items-center rounded-md bg-white px-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        {formatINR(totals.items[i]?.total ?? 0)}
                      </div>
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={addItem}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                + Add item
              </button>
              <button
                onClick={reset}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Reset
              </button>
              <div className="ml-auto flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">
                  Discount %
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountPct}
                  onChange={(e) =>
                    setDiscountPct(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))
                  }
                  className="w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Right: invoice summary ── */}
        <section className="print-area h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Invoice summary</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {supplyType === "intra" ? "Intra-state" : "Inter-state"}
            </span>
          </div>

          {(seller || buyer) && (
            <div className="space-y-1 text-sm text-slate-600">
              {seller && (
                <p>
                  <span className="text-slate-400">From: </span>
                  {seller}
                </p>
              )}
              {buyer && (
                <p>
                  <span className="text-slate-400">To: </span>
                  {buyer}
                </p>
              )}
            </div>
          )}

          <Row label="Subtotal" value={formatINR(totals.subTotal)} />
          {totals.totalDiscount > 0 && (
            <Row
              label={`Discount (${discountPct}%)`}
              value={`− ${formatINR(totals.totalDiscount)}`}
              muted
            />
          )}
          <Row label="Taxable value" value={formatINR(totals.taxableValue)} />

          {/* Tax breakup by rate */}
          <div className="rounded-lg bg-slate-50 p-3">
            {totals.rateGroups.length === 0 ? (
              <p className="text-center text-xs text-slate-400">No items yet</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400">
                    <th className="pb-1 text-left font-medium">GST</th>
                    <th className="pb-1 text-right font-medium">Taxable</th>
                    {supplyType === "intra" ? (
                      <>
                        <th className="pb-1 text-right font-medium">CGST</th>
                        <th className="pb-1 text-right font-medium">SGST</th>
                      </>
                    ) : (
                      <th className="pb-1 text-right font-medium">IGST</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {totals.rateGroups.map((g) => (
                    <tr key={g.gstRate}>
                      <td className="py-0.5 text-left">{g.gstRate}%</td>
                      <td className="py-0.5 text-right">{formatINR(g.taxable)}</td>
                      {supplyType === "intra" ? (
                        <>
                          <td className="py-0.5 text-right">{formatINR(g.cgst)}</td>
                          <td className="py-0.5 text-right">{formatINR(g.sgst)}</td>
                        </>
                      ) : (
                        <td className="py-0.5 text-right">{formatINR(g.igst)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {supplyType === "intra" ? (
            <>
              <Row label="CGST" value={formatINR(totals.cgst)} muted />
              <Row label="SGST" value={formatINR(totals.sgst)} muted />
            </>
          ) : (
            <Row label="IGST" value={formatINR(totals.igst)} muted />
          )}
          <Row label="Total GST" value={formatINR(totals.totalTax)} />
          {totals.roundOff !== 0 && (
            <Row label="Round off" value={formatINR(totals.roundOff)} muted />
          )}

          <div className="flex items-center justify-between rounded-lg bg-indigo-600 px-4 py-3 text-white">
            <span className="text-sm font-medium">Grand total</span>
            <span className="text-xl font-bold">
              {formatINR(totals.roundedTotal)}
            </span>
          </div>

          <button
            onClick={() => window.print()}
            className="no-print w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            🖨️ Print / Save as PDF
          </button>
        </section>
      </div>

      {/* Footer — owner identity + Digital Heroes link (required) */}
      <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p>
            Built by <span className="font-semibold text-slate-700">{OWNER_NAME}</span>{" "}
            ·{" "}
            <a
              href={`mailto:${OWNER_EMAIL}`}
              className="text-indigo-600 hover:underline"
            >
              {OWNER_EMAIL}
            </a>
          </p>
          <a
            href={DIGITAL_HEROES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-slate-700 hover:text-indigo-600"
          >
            Built for Digital Heroes →
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Calculations follow standard Indian GST rules. Always verify against
          your accountant for official filing.
        </p>
      </footer>
    </main>
  );
}

/* ── small presentational helpers ── */
const inputCls =
  "w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function Field({
  label,
  children,
  tight,
}: {
  label: string;
  children: React.ReactNode;
  tight?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={`mb-1 block ${tight ? "text-[11px]" : "text-xs"} font-medium text-slate-500`}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-slate-500" : "font-medium text-slate-700"}>
        {label}
      </span>
      <span className={muted ? "text-slate-600" : "font-semibold text-slate-900"}>
        {value}
      </span>
    </div>
  );
}

function Toggle({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
            value === o.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
