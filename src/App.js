import { useState } from "react";

const PLAINS_BLUE = "#334462";
const PLAINS_LIGHT = "#f4f6f9";
const PLAINS_BORDER = "#d0d7e3";

const sectionStyle = {
  background: "#fff",
  border: `1px solid ${PLAINS_BORDER}`,
  borderRadius: 8,
  padding: "24px 28px",
  marginBottom: 24,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: PLAINS_BLUE,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${PLAINS_BORDER}`,
  borderRadius: 5,
  fontFamily: "Calibri, sans-serif",
  fontSize: 14,
  color: "#222",
  boxSizing: "border-box",
  outline: "none",
};

const sectionHeaderStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#fff",
  background: PLAINS_BLUE,
  padding: "8px 14px",
  borderRadius: 5,
  marginBottom: 18,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

function Field({ label, value, onChange, placeholder, type = "text", half }) {
  return (
    <div style={{ flex: half ? "0 0 calc(50% - 8px)" : "1 1 100%", marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function CompRow({ comp, index, section, onUpdate, onRemove }) {
  const fields =
    section === "forSale"
      ? ["address", "city", "size", "yearBuilt", "askingPrice", "pricePerSF"]
      : section === "recentSales"
      ? ["address", "city", "yearBuilt", "saleDate", "pricePerSF"]
      : ["address", "city", "yearBuilt", "signedDate", "pricePerSFYear"];

  const placeholders = {
    address: "123 Main St",
    city: "OKC",
    size: "2,310",
    yearBuilt: "1985",
    askingPrice: "$350,000",
    pricePerSF: "$161.46",
    saleDate: "1/15/2025",
    signedDate: "3/1/2025",
    pricePerSFYear: "$15.00",
  };

  const labels = {
    address: "Address",
    city: "City",
    size: "Size (SF)",
    yearBuilt: "Year Built",
    askingPrice: "Asking Price",
    pricePerSF: "Price/SF",
    saleDate: "Sale Date",
    signedDate: "Signed Date",
    pricePerSFYear: "Price/SF/Yr NNN",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 8,
        background: PLAINS_LIGHT,
        borderRadius: 5,
        padding: "8px 10px",
      }}
    >
      <span style={{ fontSize: 12, color: "#888", minWidth: 20, textAlign: "center" }}>
        {index + 1}
      </span>
      {fields.map((f) => (
        <div key={f} style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{labels[f]}</div>
          <input
            value={comp[f] || ""}
            onChange={(e) => onUpdate(index, f, e.target.value)}
            placeholder={placeholders[f]}
            style={{ ...inputStyle, padding: "5px 8px", fontSize: 12 }}
          />
        </div>
      ))}
      <button
        onClick={() => onRemove(index)}
        style={{
          background: "none",
          border: "none",
          color: "#aaa",
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          padding: "0 4px",
        }}
        title="Remove"
      >
        ×
      </button>
    </div>
  );
}

function CompSection({ title, section, comps, onUpdate, onAdd, onRemove }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: PLAINS_BLUE }}>{title}</div>
        <button
          onClick={onAdd}
          style={{
            background: PLAINS_BLUE,
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "5px 14px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "Calibri, sans-serif",
          }}
        >
          + Add Row
        </button>
      </div>
      {comps.length === 0 && (
        <div style={{ fontSize: 13, color: "#aaa", padding: "10px 0" }}>
          No comps added yet. Click "+ Add Row" or paste CoStar data below.
        </div>
      )}
      {comps.map((comp, i) => (
        <CompRow
          key={i}
          comp={comp}
          index={i}
          section={section}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default function App() {
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [clientEntity, setClientEntity] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCityStateZip, setClientCityStateZip] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propCity, setPropCity] = useState("");
  const [propSize, setPropSize] = useState("");
  const [propLotSize, setPropLotSize] = useState("");
  const [propZoning, setPropZoning] = useState("Commercial");
  const [includeForSale, setIncludeForSale] = useState(true);
  const [includeRecentSales, setIncludeRecentSales] = useState(true);
  const [includeLease, setIncludeLease] = useState(false);
  const [forSaleComps, setForSaleComps] = useState([]);
  const [recentSalesComps, setRecentSalesComps] = useState([]);
  const [leaseComps, setLeaseComps] = useState([]);
  const [keyComp1, setKeyComp1] = useState("");
  const [keyComp2, setKeyComp2] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const addComp = (setter) => setter((prev) => [...prev, {}]);
  const updateComp = (setter) => (index, field, value) =>
    setter((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  const removeComp = (setter) => (index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  const handleGenerate = async () => {
    if (!clientName) { setError("Please enter a client name before generating."); return; }
    if (!propAddress) { setError("Please enter the property address before generating."); return; }
    setError(null);
    setGenerating(true);
    setResult(null);

    const payload = {
      date,
      client: { entity: clientEntity, name: clientName, address: clientAddress, cityStateZip: clientCityStateZip },
      property: { address: propAddress, city: propCity, size: propSize, lotSize: propLotSize, zoning: propZoning },
      comps: { forSale: includeForSale ? forSaleComps : [], recentSales: includeRecentSales ? recentSalesComps : [], lease: includeLease ? leaseComps : [] },
      keyComps: { comp1: keyComp1, comp2: keyComp2 },
      sections: { forSale: includeForSale, recentSales: includeRecentSales, lease: includeLease },
    };

    try {
    const {
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

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
    } catch (e) {
      setError("Something went wrong. Make sure the API route is set up.");
    }
    setGenerating(false);
  };

  return (
    <div style={{ background: PLAINS_LIGHT, minHeight: "100vh", fontFamily: "Calibri, sans-serif" }}>
      {/* Header */}
      <div style={{ background: PLAINS_BLUE, padding: "18px 0", textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.12em" }}>PLAINS</div>
        <div style={{ fontSize: 13, color: "#a8b8cc", letterSpacing: "0.08em" }}>Commercial Real Estate</div>
        <div style={{ fontSize: 11, color: "#7a93b0", marginTop: 4 }}>BOV Generator</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Date + Client */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>Client Information</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Field label="Date" value={date} onChange={setDate} half />
            <Field label="Client Entity / LLC" value={clientEntity} onChange={setClientEntity} placeholder="Pontus DQ Portfolio LLC" half />
            <Field label="Client Contact Name" value={clientName} onChange={setClientName} placeholder="Glen Pace" half />
            <Field label="Street Address" value={clientAddress} onChange={setClientAddress} placeholder="75413 14th Green Dr." half />
            <Field label="City, State, ZIP" value={clientCityStateZip} onChange={setClientCityStateZip} placeholder="Indian Wells, CA 92210" half />
          </div>
        </div>

        {/* Property Info */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>Property Information</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Field label="Property Address" value={propAddress} onChange={setPropAddress} placeholder="720 W Choctaw Ave" half />
            <Field label="City / Market" value={propCity} onChange={setPropCity} placeholder="Chickasha" half />
            <Field label="Building Size (SF)" value={propSize} onChange={setPropSize} placeholder="2,310 SF" half />
            <Field label="Lot Size (acres)" value={propLotSize} onChange={setPropLotSize} placeholder="0.66 acres" half />
            <Field label="Zoning" value={propZoning} onChange={setPropZoning} placeholder="Commercial" half />
          </div>
        </div>

        {/* Comp Sections Toggle */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>Comparable Data</div>

          {/* Section toggles */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
            {[
              { label: "For-Sale Listings", state: includeForSale, setter: setIncludeForSale },
              { label: "Recent Sales", state: includeRecentSales, setter: setIncludeRecentSales },
              { label: "Lease Comps", state: includeLease, setter: setIncludeLease },
            ].map(({ label, state, setter }) => (
              <label key={label} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          {includeForSale && (
            <CompSection
              title="Section I — Current Available Comparable Properties for Sale"
              section="forSale"
              comps={forSaleComps}
              onUpdate={updateComp(setForSaleComps)}
              onAdd={() => addComp(setForSaleComps)}
              onRemove={removeComp(setForSaleComps)}
            />
          )}
          {includeRecentSales && (
            <CompSection
              title="Section II — Recent Comparable Sales"
              section="recentSales"
              comps={recentSalesComps}
              onUpdate={updateComp(setRecentSalesComps)}
              onAdd={() => addComp(setRecentSalesComps)}
              onRemove={removeComp(setRecentSalesComps)}
            />
          )}
          {includeLease && (
            <CompSection
              title="Section III — Recent Comparable Lease Activity"
              section="lease"
              comps={leaseComps}
              onUpdate={updateComp(setLeaseComps)}
              onAdd={() => addComp(setLeaseComps)}
              onRemove={removeComp(setLeaseComps)}
            />
          )}
        </div>

        {/* Key Comps for Narrative */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>Key Comps for Valuation Narrative</div>
          <p style={{ fontSize: 13, color: "#666", marginTop: 0, marginBottom: 16 }}>
            Enter the addresses of the 2 comps you want anchored in the narrative (one inferior/similar, one superior/similar).
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <Field label="Key Comp 1 (inferior / similar)" value={keyComp1} onChange={setKeyComp1} placeholder="700 N 1st St — $150.99/SF" half />
            <Field label="Key Comp 2 (superior / similar)" value={keyComp2} onChange={setKeyComp2} placeholder="2311 Red Wheat Dr — $158.10/SF" half />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: 6, padding: "12px 16px", marginBottom: 20, color: "#c0392b", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Generate Button */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              background: generating ? "#7a93b0" : PLAINS_BLUE,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "14px 48px",
              fontSize: 15,
              fontWeight: 700,
              cursor: generating ? "not-allowed" : "pointer",
              fontFamily: "Calibri, sans-serif",
              letterSpacing: "0.05em",
              transition: "background 0.2s",
            }}
          >
            {generating ? "Generating BOV..." : "Generate BOV"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ ...sectionStyle, borderColor: PLAINS_BLUE }}>
            <div style={sectionHeaderStyle}>Generated Valuation Narrative</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "#222" }}>
              {result}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}