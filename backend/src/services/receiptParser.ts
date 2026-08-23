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

export function parseReceipt(text: string): ParsedReceipt {
    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // Store
    let store: string | null = null;

    if (text.toLowerCase().includes("coles")) {
        store = "Coles";
    }

    // Date and time
    const dateMatch = text.match(/\b\d{2}\/\d{2}\/\d{2,4}\b/);
    const timeMatch = text.match(/\b\d{1,2}:\d{2}\b/);

    const date = dateMatch ? dateMatch[0] : null;
    const time = timeMatch ? timeMatch[0] : null;

    // Total
    let total: number | null = null;

    const totalMatch = text.match(
        /Total\s+for\s+\d+\s+items[:\s]*\$?\s*(\d+\.\d{2})/i
    );

    if (totalMatch) {
        total = parseFloat(totalMatch[1]);
    }

    // GST
    let gst: number | null = null;

    const gstMatch = text.match(
        /GST\s+INCLUDED\s+IN\s+TOTAL\s+\$?\s*(\d+\.\d{2})/i
    );

    if (gstMatch) {
        gst = parseFloat(gstMatch[1]);
    }

    // Items
    const items: ReceiptItem[] = [];

    for (const line of lines) {
        const itemMatch = line.match(
            /^(.+?)\s+\$?\s*(\d+\.\d{2})$/
        );

        if (!itemMatch) {
            continue;
        }

        const name = itemMatch[1]
            .replace(/^[*%#\s]+/, "")
            .trim();

        const price = parseFloat(itemMatch[2]);

        // Ignore receipt summary/payment lines
        if (
            /total|gst|eft|saving|purchase|aud/i.test(name)
        ) {
            continue;
        }

        items.push({
            name,
            price
        });
    }

    return {
        store,
        date,
        time,
        items,
        total,
        gst
    };
}