export type SupplyType = "intra" | "inter";
export type PriceMode = "exclusive" | "inclusive";

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  gstRate: number; // percentage, e.g. 18
}

export interface ComputedItem extends LineItem {
  taxableBeforeDiscount: number;
  taxable: number; // after discount
  discount: number;
  tax: number;
  total: number; // taxable + tax
}

export interface RateGroup {
  gstRate: number;
  taxable: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface InvoiceTotals {
  items: ComputedItem[];
  rateGroups: RateGroup[];
  supplyType: SupplyType;
  subTotal: number; // sum of line amounts (qty*rate, as entered)
  totalDiscount: number;
  taxableValue: number; // after discount, pre-tax
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number; // taxableValue + totalTax
  roundOff: number;
  roundedTotal: number;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function computeInvoice(
  rawItems: LineItem[],
  opts: {
    supplyType: SupplyType;
    priceMode: PriceMode;
    discountPct: number;
  }
): InvoiceTotals {
  const { supplyType, priceMode, discountPct } = opts;
  const disc = Math.min(Math.max(discountPct || 0, 0), 100) / 100;

  const items: ComputedItem[] = rawItems.map((it) => {
    const qty = Number(it.qty) || 0;
    const rate = Number(it.rate) || 0;
    const gstRate = Number(it.gstRate) || 0;
    const lineAmount = qty * rate;

    // Taxable value depends on whether entered price includes GST.
    const taxableBeforeDiscount =
      priceMode === "inclusive"
        ? lineAmount / (1 + gstRate / 100)
        : lineAmount;

    const taxable = taxableBeforeDiscount * (1 - disc);
    const discount = taxableBeforeDiscount - taxable;
    const tax = taxable * (gstRate / 100);

    return {
      ...it,
      qty,
      rate,
      gstRate,
      taxableBeforeDiscount: round2(taxableBeforeDiscount),
      taxable: round2(taxable),
      discount: round2(discount),
      tax: round2(tax),
      total: round2(taxable + tax),
    };
  });

  // Group by GST rate for the tax summary table.
  const groupMap = new Map<number, RateGroup>();
  for (const it of items) {
    const g = groupMap.get(it.gstRate) ?? {
      gstRate: it.gstRate,
      taxable: 0,
      tax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    };
    g.taxable += it.taxable;
    g.tax += it.tax;
    groupMap.set(it.gstRate, g);
  }

  const rateGroups = Array.from(groupMap.values())
    .sort((a, b) => a.gstRate - b.gstRate)
    .map((g) => {
      const taxable = round2(g.taxable);
      const tax = round2(g.tax);
      if (supplyType === "intra") {
        return {
          ...g,
          taxable,
          tax,
          cgst: round2(tax / 2),
          sgst: round2(tax / 2),
          igst: 0,
        };
      }
      return { ...g, taxable, tax, cgst: 0, sgst: 0, igst: tax };
    });

  const subTotal = round2(items.reduce((s, i) => s + i.qty * i.rate, 0));
  const totalDiscount = round2(items.reduce((s, i) => s + i.discount, 0));
  const taxableValue = round2(items.reduce((s, i) => s + i.taxable, 0));
  const totalTax = round2(items.reduce((s, i) => s + i.tax, 0));

  const cgst = supplyType === "intra" ? round2(totalTax / 2) : 0;
  const sgst = supplyType === "intra" ? round2(totalTax / 2) : 0;
  const igst = supplyType === "inter" ? totalTax : 0;

  const grandTotal = round2(taxableValue + totalTax);
  const roundedTotal = Math.round(grandTotal);
  const roundOff = round2(roundedTotal - grandTotal);

  return {
    items,
    rateGroups,
    supplyType,
    subTotal,
    totalDiscount,
    taxableValue,
    cgst,
    sgst,
    igst,
    totalTax,
    grandTotal,
    roundOff,
    roundedTotal,
  };
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
