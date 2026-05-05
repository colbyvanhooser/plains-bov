
// v2const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType, LevelFormat,
  ImageRun, VerticalAlign
} = require("docx");
const fs = require("fs");
const path = require("path");

const PLAINS_BLUE = "334462";

function makeHeaderCell(text, widthDXA) {
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    shading: { fill: PLAINS_BLUE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
    },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Calibri", size: 18 })]
    })]
  });
}

function makeDataCell(text, widthDXA) {
  return new TableCell({
    width: { size: widthDXA, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: text || "", font: "Calibri", size: 18 })]
    })]
  });
}

function buildForSaleTable(comps) {
  const cols = [2000, 1400, 1000, 1400, 1280, 1080]; // sum = 8160 (fits in 9360 with margins)
  const headers = ["Address", "City", "Size (SF)", "Year Built", "Asking Price", "Price/SF"];
  
  const avg = comps.length
    ? (comps.reduce((sum, c) => sum + parseFloat((c.pricePerSF || "0").replace(/[$,]/g, "")), 0) / comps.length).toFixed(2)
    : "0";

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: headers.map((h, i) => makeHeaderCell(h, cols[i]))
      }),
      ...comps.map(c => new TableRow({
        children: [
          makeDataCell(c.address, cols[0]),
          makeDataCell(c.city, cols[1]),
          makeDataCell(c.size, cols[2]),
          makeDataCell(c.yearBuilt, cols[3]),
          makeDataCell(c.askingPrice, cols[4]),
          makeDataCell(c.pricePerSF, cols[5]),
        ]
      }))
    ]
  });
}

function buildRecentSalesTable(comps) {
  const cols = [2200, 1400, 1400, 1480, 1480]; // sum = 7960
  const headers = ["Address", "City", "Year Built", "Sale Date", "Sale Price/SF"];

  const avg = comps.length
    ? (comps.reduce((sum, c) => sum + parseFloat((c.pricePerSF || "0").replace(/[$,]/g, "")), 0) / comps.length).toFixed(2)
    : "0";

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: headers.map((h, i) => makeHeaderCell(h, cols[i]))
      }),
      ...comps.map(c => new TableRow({
        children: [
          makeDataCell(c.address, cols[0]),
          makeDataCell(c.city, cols[1]),
          makeDataCell(c.yearBuilt, cols[2]),
          makeDataCell(c.saleDate, cols[3]),
          makeDataCell(c.pricePerSF, cols[4]),
        ]
      }))
    ]
  });
}

function buildLeaseTable(comps) {
  const cols = [2200, 1400, 1400, 1480, 1480];
  const headers = ["Address", "City", "Year Built", "Signed Date", "Price/SF/Yr NNN"];

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({
        children: headers.map((h, i) => makeHeaderCell(h, cols[i]))
      }),
      ...comps.map(c => new TableRow({
        children: [
          makeDataCell(c.address, cols[0]),
          makeDataCell(c.city, cols[1]),
          makeDataCell(c.yearBuilt, cols[2]),
          makeDataCell(c.signedDate, cols[3]),
          makeDataCell(c.pricePerSFYear, cols[4]),
        ]
      }))
    ]
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun("")] });
}

function boldLabel(label, value) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, bold: true, font: "Calibri", size: 22 }),
      new TextRun({ text: " " + value, font: "Calibri", size: 22 }),
    ]
  });
}

function sectionHeader(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: "Calibri", size: 22 })]
  });
}

function bodyPara(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

function bulletPara(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

module.exports = async function handler(req, res) {  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const payload = req.body;
  const { date, client, property, comps, keyComps, sections } = payload;

  // Step 1: Get narrative from Claude
  const prompt = `You are a commercial real estate valuation assistant for Plains Commercial Real Estate, LLC.

Generate a professional BOV valuation narrative for the following property:

Property: ${property.address}, ${property.city}
Building Size: ${property.size}
Lot Size: ${property.lotSize}
Zoning: ${property.zoning}

For-Sale Comps: ${JSON.stringify(comps.forSale)}
Recent Sales Comps: ${JSON.stringify(comps.recentSales)}
Lease Comps: ${JSON.stringify(comps.lease)}

Key Comp 1 (inferior/similar): ${keyComps.comp1}
Key Comp 2 (superior/similar): ${keyComps.comp2}

Write ONLY the "Suggested Sale/Lease Price" narrative section, matching this exact Plains BOV style:

"Based on a market comparison of available listings and recent executed sale comps, the subject property's estimated market value is between $X - $Y per square foot, equating to a total property value between $Z - $W, depending on site condition, accessibility, and potential buyer/user type. Property values vary greatly based on factors related to street frontage, highway proximity, traffic exposure, and overall demand in the submarket.

In our opinion, this property is similar if not slightly superior to [Key Comp 1 address] ($X/SF) and slightly inferior to [Key Comp 2 address] ($Y/SF) in terms of location, constraints, and demographics. These comps would indicate a $X to $Y per square foot valuation, assuming the site's attributes align with use potential.

To the degree that location or access proves more challenging than these comparables, the value should trend toward the lower end of the range provided.

In our professional opinion, pricing the property between $X-$Y per square foot...reflects the current market environment for adequately located, commercially zoned retail assets in the [city] market, accounting for the site's specific strengths and challenges."

Also write 3-4 Strengths bullets and 3-4 Challenges bullets based on the property details and market.

Return as JSON with keys: narrative, strengths (array), challenges (array).
Return ONLY valid JSON, no markdown, no preamble.`;

  let narrative = "";
  let strengths = [];
  let challenges = [];

  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json();
    const raw = claudeData.content?.[0]?.text;
    if (!raw) throw new Error("No response from Claude");

    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    narrative = parsed.narrative || "";
    strengths = parsed.strengths || [];
    challenges = parsed.challenges || [];
  } catch (e) {
    return res.status(500).json({ error: "Claude error: " + e.message });
  }

  // Step 2: Build the Word document
  try {
    const logoPath = path.join(process.cwd(), "public", "plains-logo.png");
    const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;

    const children = [];

    // Logo
    if (logoBuffer) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new ImageRun({ data: logoBuffer, transformation: { width: 300, height: 80 }, type: "png" })]
      }));
    } else {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PLAINS Commercial Real Estate", bold: true, font: "Calibri", size: 28, color: PLAINS_BLUE })]
      }));
    }

    children.push(spacer());

    // Date + client block
    children.push(bodyPara(date));
    children.push(spacer());
    if (client.entity) children.push(bodyPara(client.entity));
    children.push(bodyPara(client.name));
    children.push(bodyPara(client.address));
    children.push(bodyPara(client.cityStateZip));
    children.push(spacer());
    children.push(new Paragraph({
      children: [new TextRun({ text: `RE: Broker's Opinion of Value: ${property.address}`, bold: true, font: "Calibri", size: 22 })]
    }));
    children.push(spacer());
    children.push(bodyPara(`Dear ${client.name},`));
    children.push(spacer());
    children.push(bodyPara(`Thank you for the opportunity to provide an opinion of value for the property located at ${property.address} in ${property.city}. The below information and recommendations are based on market conditions, comparable leases and sales, competitive properties, and our general understanding of the market.`));
    children.push(spacer());

    // Property Info
    children.push(sectionHeader("Property Information"));
    children.push(spacer());
    children.push(boldLabel("Location:", `${property.address}, ${property.city}`));
    children.push(boldLabel("Market:", property.city));
    children.push(boldLabel("Building Size:", property.size + (property.lotSize ? `, on ${property.lotSize}.` : "")));
    children.push(boldLabel("Zoning:", property.zoning));
    children.push(spacer());

    // Strengths & Challenges
    children.push(sectionHeader("Property Strengths and Challenges"));
    children.push(spacer());
    children.push(new Paragraph({ children: [new TextRun({ text: "Strengths:", bold: true, font: "Calibri", size: 22 })] }));
    strengths.forEach(s => children.push(bulletPara(s)));
    children.push(spacer());
    children.push(new Paragraph({ children: [new TextRun({ text: "Challenges:", bold: true, font: "Calibri", size: 22 })] }));
    challenges.forEach(c => children.push(bulletPara(c)));
    children.push(spacer());

    // For Sale Comps
    if (sections.forSale && comps.forSale.length > 0) {
      const avg = (comps.forSale.reduce((sum, c) => sum + parseFloat((c.pricePerSF || "0").replace(/[$,]/g, "")), 0) / comps.forSale.length).toFixed(2);
      children.push(new Paragraph({
        children: [new TextRun({ text: `Current Available Comparable Properties for Sale: Average Price per SF - $${avg}/SF`, bold: true, font: "Calibri", size: 22 })]
      }));
      children.push(spacer());
      children.push(buildForSaleTable(comps.forSale));
      children.push(spacer());
    }

    // Recent Sales
    if (sections.recentSales && comps.recentSales.length > 0) {
      const avg = (comps.recentSales.reduce((sum, c) => sum + parseFloat((c.pricePerSF || "0").replace(/[$,]/g, "")), 0) / comps.recentSales.length).toFixed(2);
      children.push(new Paragraph({
        children: [new TextRun({ text: `Recent Comparable Sales: Average Price per SF - $${avg}/SF`, bold: true, font: "Calibri", size: 22 })]
      }));
      children.push(spacer());
      children.push(buildRecentSalesTable(comps.recentSales));
      children.push(spacer());
    }

    // Lease Comps
    if (sections.lease && comps.lease.length > 0) {
      const avg = (comps.lease.reduce((sum, c) => sum + parseFloat((c.pricePerSFYear || "0").replace(/[$,]/g, "")), 0) / comps.lease.length).toFixed(2);
      children.push(new Paragraph({
        children: [new TextRun({ text: `Recent Comparable Lease Activity: Average Price Per SF Per Year NNN - $${avg}/SF NNN`, bold: true, font: "Calibri", size: 22 })]
      }));
      children.push(spacer());
      children.push(buildLeaseTable(comps.lease));
      children.push(spacer());
    }

    // Narrative
    children.push(sectionHeader("Suggested Sale/Lease Price"));
    children.push(spacer());
    narrative.split("\n\n").forEach(para => {
      if (para.trim()) children.push(bodyPara(para.trim()));
      children.push(spacer());
    });

    // Closing
    children.push(bodyPara("Thank you for reaching out to us to assist you in this matter. If you have any questions, please do not hesitate to reach out."));
    children.push(spacer());
    children.push(bodyPara("Sincerely,"));
    children.push(spacer());
    children.push(new Paragraph({ children: [new TextRun({ text: "Colby Vanhooser", bold: true, font: "Calibri", size: 22 })] }));
    children.push(bodyPara("Plains Commercial Real Estate, LLC"));
    children.push(bodyPara("330 NW 10th Street"));
    children.push(bodyPara("Oklahoma City, OK 73103"));

    const doc = new Document({
      numbering: {
        config: [{
          reference: "bullets",
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }]
        }]
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `BOV_${property.address.replace(/\s+/g, "_")}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (e) {
    res.status(500).json({ error: "Document generation error: " + e.message });
  }
}