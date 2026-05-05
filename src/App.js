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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.error) { setError(data.error); } 
      else { setResult(data.narrative); }
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