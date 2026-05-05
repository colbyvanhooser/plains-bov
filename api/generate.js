export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const payload = req.body;

  const prompt = `You are a commercial real estate valuation assistant for Plains Commercial Real Estate, LLC. 

Generate a professional BOV valuation narrative for the following property:

Property: ${payload.property.address}, ${payload.property.city}
Building Size: ${payload.property.size}
Lot Size: ${payload.property.lotSize}
Zoning: ${payload.property.zoning}

For-Sale Comps: ${JSON.stringify(payload.comps.forSale)}
Recent Sales Comps: ${JSON.stringify(payload.comps.recentSales)}
Lease Comps: ${JSON.stringify(payload.comps.lease)}

Key Comp 1 (inferior/similar): ${payload.keyComps.comp1}
Key Comp 2 (superior/similar): ${payload.keyComps.comp2}

Write the full "Suggested Sale/Lease Price" narrative section only, matching this exact style and structure from a previous Plains BOV:

"Based on a market comparison of available listings and recent executed sale comps, the subject property's estimated market value is between $X - $Y per square foot, equating to a total property value between $Z - $W, depending on site condition, accessibility, and potential buyer/user type...

In our opinion, this property is similar if not slightly superior to [Key Comp 1 address] ($X/SF) and slightly inferior to [Key Comp 2 address] ($Y/SF) in terms of location, constraints, and demographics. These comps would indicate a $X to $Y per square foot valuation...

In our professional opinion, pricing the property between $X-$Y per square foot...reflects the current market environment..."

Use the exact Plains tone — professional, direct, market-grounded.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
console.log("Claude response:", JSON.stringify(data));
console.log("Content array:", JSON.stringify(data.content));
console.log("Error from Anthropic:", JSON.stringify(data.error));
const narrative = data.content?.[0]?.text;
    if (!narrative) throw new Error("No response from Claude");
    res.status(200).json({ narrative });
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
}