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

// ======================================================
// NORMALIZATION
// ======================================================

function normalizeText(
  text: string
): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ");
}

function normalizeLine(
  line: string
): string {
  return line
    .replace(/\s+/g, " ")
    .trim();
}

// ======================================================
// MONEY
// ======================================================

function parseMoney(
  value: string
): number | null {
  let cleaned = value
    .replace(
      /[^\d.,-]/g,
      ""
    )
    .trim();

  if (!cleaned) {
    return null;
  }

  // 12,50 -> 12.50
  if (
    cleaned.includes(",") &&
    !cleaned.includes(".")
  ) {
    const parts =
      cleaned.split(",");

    if (
      parts.length === 2 &&
      parts[1].length === 2
    ) {
      cleaned =
        cleaned.replace(
          ",",
          "."
        );
    }
  }

  // 1,234.50 -> 1234.50
  if (
    cleaned.includes(",") &&
    cleaned.includes(".")
  ) {
    cleaned =
      cleaned.replace(
        /,/g,
        ""
      );
  }

  const result =
    Number.parseFloat(
      cleaned
    );

  return Number.isFinite(result)
    ? result
    : null;
}

function getMoneyValues(
  line: string
): number[] {
  const matches =
    line.match(
      /(?:AUD|USD|NZD|CHF|EUR|GBP|CAD|A\$|US\$|\$|€|£)?\s*-?\d+(?:[.,]\d{2})(?:\s*(?:AUD|USD|NZD|CHF|EUR|GBP|CAD))?/gi
    );

  if (!matches) {
    return [];
  }

  return matches
    .map(parseMoney)
    .filter(
      (
        value
      ): value is number =>
        value !== null
    );
}

// ======================================================
// STORE
// ======================================================

function detectStore(
  lines: string[],
  fullText: string
): string | null {
  const knownStores = [
    {
      pattern:
        /\bcoles\b/i,
      name: "Coles",
    },
    {
      pattern:
        /\bwoolworths\b/i,
      name: "Woolworths",
    },
    {
      pattern:
        /\baldi\b/i,
      name: "ALDI",
    },
    {
      pattern:
        /\biga\b/i,
      name: "IGA",
    },
    {
      pattern:
        /\bkmart\b/i,
      name: "Kmart",
    },
    {
      pattern:
        /\bofficeworks\b/i,
      name: "Officeworks",
    },
    {
      pattern:
        /\bbunnings\b/i,
      name: "Bunnings",
    },
    {
      pattern:
        /\bcostco\b/i,
      name: "Costco",
    },
  ];

  for (
    const store
    of knownStores
  ) {
    if (
      store.pattern.test(
        fullText
      )
    ) {
      return store.name;
    }
  }

  for (
    const line
    of lines.slice(
      0,
      8
    )
  ) {
    if (
      line.length < 3 ||
      line.length > 60
    ) {
      continue;
    }

    // Generic titles are NOT stores
    if (
      /^(cash\s+receipt|receipt|tax\s+invoice|invoice|sales\s+receipt)$/i.test(
        line
      )
    ) {
      continue;
    }

    // Address / contact / metadata
    if (
      /\b(address|adress|street|road|phone|tel|telephone|fax|email|e-mail|www|http|date|time|rechn)\b/i.test(
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

    if (
      getMoneyValues(
        line
      ).length > 0
    ) {
      continue;
    }

    if (
      !/[A-Za-zÀ-ÿ]/.test(
        line
      )
    ) {
      continue;
    }

    return line;
  }

  return null;
}

// ======================================================
// DATE
// ======================================================

function detectDate(
  text: string
): string | null {
  const patterns = [
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/,

    /\b\d{4}[./-]\d{1,2}[./-]\d{1,2}\b/,
  ];

  for (
    const pattern
    of patterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (match) {
      return match[0];
    }
  }

  return null;
}

// ======================================================
// TIME
// ======================================================

function detectTime(
  text: string
): string | null {
  const match =
    text.match(
      /\b(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\b/
    );

  return match
    ? match[0]
    : null;
}

// ======================================================
// TOTAL
// ======================================================

function isTotalLine(
  line: string
): boolean {
  if (
    /\bsub[-\s]?total\b/i.test(
      line
    )
  ) {
    return false;
  }

  return /\b(grand\s+total|amount\s+due|balance\s+due|total\s+due|total)\b/i.test(
    line
  );
}

function detectTotal(
  lines: string[]
): number | null {
  const candidates:
    number[] = [];

  for (
    const line
    of lines
  ) {
    if (
      !isTotalLine(
        line
      )
    ) {
      continue;
    }

    if (
      /\b(gst|vat|mwst|sales\s+tax|tax\s+included)\b/i.test(
        line
      )
    ) {
      continue;
    }

    const values =
      getMoneyValues(
        line
      );

    if (
      values.length > 0
    ) {
      candidates.push(
        values[
          values.length - 1
        ]
      );
    }
  }

  if (
    candidates.length ===
    0
  ) {
    return null;
  }

  return Math.max(
    ...candidates
  );
}

// ======================================================
// GST / VAT / TAX
// ======================================================

function detectGst(
  lines: string[]
): number | null {
  for (
    const line
    of lines
  ) {
    if (
      !/\b(gst|vat|mwst|sales\s+tax|tax\s+included|included\s+tax)\b/i.test(
        line
      )
    ) {
      continue;
    }

    const values =
      getMoneyValues(
        line
      );

    if (
      values.length ===
      0
    ) {
      continue;
    }

    return values[
      values.length - 1
    ];
  }

  return null;
}

// ======================================================
// ITEM SECTION END
// ======================================================

function findItemEndIndex(
  lines: string[]
): number {
  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    const line =
      lines[i];

    if (
      /\b(grand\s+total|sub[-\s]?total|subtotal|total\s*:|total\s+\d|total\s+for)\b/i.test(
        line
      )
    ) {
      return i;
    }
  }

  return lines.length;
}

// ======================================================
// QUANTITY / UNIT PRICE
// ======================================================

function isQuantityOrUnitPriceLine(
  line: string
): boolean {
  const value =
    line
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return (
    // 2 @ $4.50 EACH
    // 2 ® $4.50 EACH
    // 2 © $4.50 EACH
    /^\d+\s*[@®©]\s*(?:AUD\s*)?\$?\s*\d+(?:[.,]\d{2})\s*(?:EACH|EA)?$/i.test(
      value
    ) ||

    // 2 @ EACH
    // 2 ® EACH
    /^\d+\s*[@®©]\s*(?:EACH|EA)$/i.test(
      value
    ) ||

    // weird OCR symbol
    /^\d+\s*[^A-Za-z0-9\s]{1,3}\s*(?:AUD\s*)?\$?\s*\d+(?:[.,]\d{2})\s*(?:EACH|EA)\b/i.test(
      value
    ) ||

    // 2 x $4.50
    /^\d+\s*[xX]\s*(?:AUD\s*)?\$?\s*\d+(?:[.,]\d{2})\s*(?:EACH|EA)?$/i.test(
      value
    )
  );
}

// ======================================================
// METADATA / NON ITEM
// ======================================================

function isMetadataLine(
  line: string
): boolean {
  if (
    isQuantityOrUnitPriceLine(
      line
    )
  ) {
    return true;
  }

  return (
    /\b(total|subtotal|gst|vat|mwst|sales\s+tax|tax\s+included|eft|cash|change|credit|debit|visa|mastercard|balance|amount\s+due|purchase|payment|auth|approved)\b/i.test(
      line
    ) ||

    /\b(receipt|invoice|abn|address|adress|phone|telephone|tel|fax|email|e-mail|www|http|thank\s+you|loyalty|flybuys|card|date|time|rechn)\b/i.test(
      line
    ) ||

    /\b(entspricht\s+in\s+euro|conversion|exchange\s+rate)\b/i.test(
      line
    ) ||

    /^(description|item|items|qty|quantity|price|amount)$/i.test(
      line.trim()
    )
  );
}

// ======================================================
// CLEAN ITEM NAME
// ======================================================

function cleanItemName(
  line: string
): string {
  let name =
    line
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    isQuantityOrUnitPriceLine(
      name
    )
  ) {
    return "";
  }

  // Remove prices
  name = name.replace(
    /(?:AUD|USD|NZD|CHF|EUR|GBP|CAD|A\$|US\$|\$|€|£)?\s*-?\d+(?:[.,]\d{2})(?:\s*(?:AUD|USD|NZD|CHF|EUR|GBP|CAD))?/gi,
    " "
  );

  // Remove trailing "à"
  name = name.replace(
    /\s+[àa]\s*$/i,
    " "
  );

  // Symbols at start
  name = name.replace(
    /^[*%#@®©¥|;:,._\s]+/,
    ""
  );

  // x*¥MONDAY
  name = name.replace(
    /^[xX][*#%@®©¥]+\s*/i,
    ""
  );

  // 0OMO -> OMO
  name = name.replace(
    /^0(?=[A-Za-z]{2,})/,
    ""
  );

  // 2xLatte -> Latte
  name = name.replace(
    /^\d+\s*[xX]\s*/,
    ""
  );

  name = name.replace(
    /^[|;:,!]+\s*/,
    ""
  );

  return name
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

// ======================================================
// VALID ITEM NAME
// ======================================================

function isValidItemName(
  name: string
): boolean {
  if (
    name.length < 2
  ) {
    return false;
  }

  if (
    !/[A-Za-zÀ-ÿ]/.test(
      name
    )
  ) {
    return false;
  }

  if (
    isMetadataLine(
      name
    )
  ) {
    return false;
  }

  if (
    /^(each|ea|chf|aud|usd|eur)$/i.test(
      name
    )
  ) {
    return false;
  }

  return true;
}

// ======================================================
// ADD ITEM
// ======================================================

function addItem(
  items: ReceiptItem[],
  name: string,
  price: number
): void {
  const cleaned =
    cleanItemName(
      name
    );

  if (
    !isValidItemName(
      cleaned
    )
  ) {
    return;
  }

  if (
    !Number.isFinite(
      price
    ) ||
    price < 0 ||
    price > 100000
  ) {
    return;
  }

  const duplicate =
    items.some(
      (item) =>
        item.name
          .toLowerCase() ===
          cleaned.toLowerCase() &&
        Math.abs(
          item.price -
            price
        ) < 0.001
    );

  if (duplicate) {
    return;
  }

  items.push({
    name: cleaned,
    price,
  });
}

// ======================================================
// ITEM PARSER
// ======================================================

function detectItems(
  lines: string[]
): ReceiptItem[] {
  const items:
    ReceiptItem[] = [];

  const endIndex =
    findItemEndIndex(
      lines
    );

  const itemLines =
    lines.slice(
      0,
      endIndex
    );

  let pendingName:
    | string
    | null = null;

  for (
    let i = 0;
    i <
    itemLines.length;
    i++
  ) {
    const line =
      itemLines[i];

    if (
      isMetadataLine(
        line
      )
    ) {
      pendingName =
        null;

      continue;
    }

    const values =
      getMoneyValues(
        line
      );

    // ----------------------------------------------
    // Product + price
    //
    // Lorem 6.50
    //
    // 2xLatte Macchiato à 4.50 CHF 9.00
    //
    // Last money = item line total
    // ----------------------------------------------

    if (
      values.length > 0
    ) {
      const price =
        values[
          values.length - 1
        ];

      const name =
        cleanItemName(
          line
        );

      if (
        isValidItemName(
          name
        )
      ) {
        addItem(
          items,
          name,
          price
        );

        pendingName =
          null;

        continue;
      }

      // ------------------------------------------
      // Name and price split over two lines
      // ------------------------------------------

      if (
        pendingName
      ) {
        addItem(
          items,
          pendingName,
          price
        );

        pendingName =
          null;
      }

      continue;
    }

    if (
      line.length >= 2 &&
      line.length <= 90 &&
      /[A-Za-zÀ-ÿ]/.test(
        line
      )
    ) {
      pendingName =
        line;
    }
  }

  return items;
}

// ======================================================
// MAIN PARSER
// ======================================================

export function parseReceipt(
  rawText: string
): ParsedReceipt {
  const text =
    normalizeText(
      rawText
    );

  const lines =
    text
      .split("\n")
      .map(
        normalizeLine
      )
      .filter(
        (line) =>
          line.length >
          0
      );

  console.log(
    "===== NORMALIZED RECEIPT LINES ====="
  );

  lines.forEach(
    (
      line,
      index
    ) => {
      console.log(
        `${index}: ${line}`
      );
    }
  );

  const store =
    detectStore(
      lines,
      text
    );

  const date =
    detectDate(
      text
    );

  const time =
    detectTime(
      text
    );

  const total =
    detectTotal(
      lines
    );

  const gst =
    detectGst(
      lines
    );

  const items =
    detectItems(
      lines
    );

  const result:
    ParsedReceipt = {
      store,
      date,
      time,
      items,
      total,
      gst,
    };

  console.log(
    "===== PARSED RECEIPT ====="
  );

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;
}