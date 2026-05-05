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
}