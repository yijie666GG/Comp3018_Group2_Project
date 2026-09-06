export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  store: string | null;
  date: string | null;
  time: string | null;
  items: ReceiptItem[];
  total: number | null;
  gst: number | null;
}

/**
 * Convert common money text into a number.
 *
 * Supports:
 * 12.50
 * 12,50
 * $12.50
 * AUD 12.50
 * CHF 12.50
 */
function parseMoney(value: string): number | null {
  let cleaned = value
    .replace(/[^\d.,-]/g, "")
    .trim();

  if (!cleaned) {
    return null;
  }

  // Example: 12,50 -> 12.50
  if (
    cleaned.includes(",") &&
    !cleaned.includes(".")
  ) {
    const parts = cleaned.split(",");

    if (
      parts.length === 2 &&
      parts[1].length === 2
    ) {
      cleaned = cleaned.replace(",", ".");
    }
  }

  // Example: 1,234.50 -> 1234.50
  if (
    cleaned.includes(",") &&
    cleaned.includes(".")
  ) {
    cleaned = cleaned.replace(/,/g, "");
  }

  const number = parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
}

/**
 * Find all money-like values from one line.
 */
function getMoneyValues(line: string): number[] {
  const matches = line.match(
    /(?:AUD|USD|NZD|CHF|EUR|GBP|CAD|A\$|US\$|\$|€|£)?\s*\d+(?:[.,]\d{2})/gi
  );

  if (!matches) {
    return [];
  }

  return matches
    .map(parseMoney)
    .filter(
      (value): value is number =>
        value !== null
    );
}

/**
 * Detect store name.
 */
function detectStore(
  lines: string[],
  text: string
): string | null {
  const knownStores = [
    { pattern: /\bcoles\b/i, name: "Coles" },
    {
      pattern: /\bwoolworths\b/i,
      name: "Woolworths",
    },
    { pattern: /\baldi\b/i, name: "ALDI" },
    { pattern: /\biga\b/i, name: "IGA" },
    { pattern: /\bkmart\b/i, name: "Kmart" },
    {
      pattern: /\bofficeworks\b/i,
      name: "Officeworks",
    },
    {
      pattern: /\bbunnings\b/i,
      name: "Bunnings",
    },
    {
      pattern: /\bcostco\b/i,
      name: "Costco",
    },
  ];

  for (const store of knownStores) {
    if (store.pattern.test(text)) {
      return store.name;
    }
  }

  /**
   * Fallback:
   * Use first plausible header line.
   */
  for (const line of lines.slice(0, 6)) {
    if (line.length < 3 || line.length > 60) {
      continue;
    }

    if (
      /receipt|tax invoice|invoice|abn|phone|tel|www|http/i.test(
        line
      )
    ) {
      continue;
    }

    if (
      /\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(
        line
      )
    ) {
      continue;
    }

    if (getMoneyValues(line).length > 0) {
      continue;
    }

    return line;
  }

  return null;
}

/**
 * Detect date.
 *
 * Supports:
 * 28/08/2026
 * 28-08-2026
 * 28.08.2026
 */
function detectDate(
  text: string
): string | null {
  const match = text.match(
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/
  );

  return match
    ? match[0]
    : null;
}

/**
 * Detect time.
 *
 * Supports:
 * 13:29
 * 13:29:17
 */
function detectTime(
  text: string
): string | null {
  const match = text.match(
    /\b(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\b/
  );

  return match
    ? match[0]
    : null;
}

/**
 * Detect final receipt total.
 */
function detectTotal(
  lines: string[]
): number | null {
  const totalPatterns = [
    /\bgrand\s+total\b/i,
    /\bamount\s+due\b/i,
    /\bbalance\s+due\b/i,
    /\btotal\s+due\b/i,
    /\btotal\b/i,
  ];

  for (const pattern of totalPatterns) {
    for (const line of lines) {
      if (!pattern.test(line)) {
        continue;
      }

      // Ignore values that are clearly tax/subtotal lines.
      if (
        /subtotal|gst|vat|tax|saving|discount/i.test(
          line
        )
      ) {
        continue;
      }

      const values = getMoneyValues(line);

      if (values.length > 0) {
        return values[values.length - 1];
      }
    }
  }

  return null;
}

/**
 * Detect GST / VAT / tax.
 */
function detectGst(
  lines: string[]
): number | null {
  for (const line of lines) {
    if (
      !/gst|vat|tax included|mwst|must/i.test(
        line
      )
    ) {
      continue;
    }

    const values = getMoneyValues(line);

    if (values.length > 0) {
      // Usually the tax amount is the last money value.
      return values[values.length - 1];
    }
  }

  return null;
}

/**
 * Check whether a line is receipt metadata rather than an item.
 */
function isIgnoredItemLine(
  line: string
): boolean {
  return /total|subtotal|gst|vat|tax|eft|saving|discount|purchase|cash|change|credit|debit|visa|mastercard|balance|amount due|receipt|invoice|abn|auth|payment|thank you/i.test(
    line
  );
}

/**
 * Remove money, currency and quantity parts from item name.
 */
function cleanItemName(
  line: string
): string {
  return line
    .replace(
      /(?:AUD|USD|NZD|CHF|EUR|GBP|CAD|A\$|US\$|\$|€|£)?\s*\d+(?:[.,]\d{2})/gi,
      " "
    )
    .replace(/^[*%#@\s]+/, "")
    .replace(/^\d+\s*[xX]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detect receipt items.
 */
function detectItems(
  lines: string[]
): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    if (isIgnoredItemLine(line)) {
      continue;
    }

    const values = getMoneyValues(line);

    if (values.length === 0) {
      continue;
    }

    /**
     * Examples:
     *
     * Milk 3.50
     *
     * 2x Latte Macchiato 4.50 9.00
     *
     * Use the LAST amount as the item's final line price.
     */
    const price =
      values[values.length - 1];

    const name =
      cleanItemName(line);

    if (name.length < 2) {
      continue;
    }

    // Item name should contain letters.
    if (!/[A-Za-zÀ-ÿ]/.test(name)) {
      continue;
    }

    // Avoid duplicates.
    const duplicate = items.some(
      (item) =>
        item.name.toLowerCase() ===
          name.toLowerCase() &&
        item.price === price
    );

    if (duplicate) {
      continue;
    }

    items.push({
      name,
      price,
    });
  }

  return items;
}

export function parseReceipt(
  text: string
): ParsedReceipt {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(
      (line) =>
        line.length > 0
    );

  const store =
    detectStore(lines, text);

  const date =
    detectDate(text);

  const time =
    detectTime(text);

  const total =
    detectTotal(lines);

  const gst =
    detectGst(lines);

  const items =
    detectItems(lines);

  return {
    store,
    date,
    time,
    items,
    total,
    gst,
  };
}