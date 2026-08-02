"use client";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

const CI_API_KEY = import.meta.env.VITE_CI_API_KEY;

// ... [Keep MSRP, depreciated, MKT, ROUTES, ENG, BODY, MAKES constants exactly as they were] ...
const MSRP = {
  Toyota: {
    Camry: 28000,
    Corolla: 22000,
    RAV4: 30000,
    Highlander: 38000,
    "Land Cruiser": 58000,
    "4Runner": 40000,
    Tacoma: 30000,
    Avalon: 37000,
    Venza: 34000,
    Sienna: 35000,
    Prius: 28000,
    Tundra: 38000,
  },
  Honda: {
    Accord: 28000,
    Civic: 24000,
    "CR-V": 30000,
    Pilot: 38000,
    "HR-V": 24000,
    Odyssey: 38000,
    Ridgeline: 39000,
  },
  "Mercedes-Benz": {
    "C-Class": 44000,
    "E-Class": 56000,
    "S-Class": 115000,
    GLE: 58000,
    GLC: 47000,
    "G-Class": 145000,
    GLS: 82000,
    "A-Class": 35000,
    CLA: 40000,
    "AMG GT": 120000,
  },
  BMW: {
    "3 Series": 44000,
    "5 Series": 56000,
    "7 Series": 95000,
    X3: 47000,
    X5: 63000,
    X7: 78000,
    X1: 39000,
    "4 Series": 50000,
    M3: 75000,
    M5: 108000,
  },
  Lexus: {
    ES: 42000,
    RX: 50000,
    GX: 58000,
    LX: 90000,
    IS: 40000,
    NX: 42000,
    UX: 35000,
    LC: 95000,
    LS: 78000,
  },
  Ford: {
    Explorer: 36000,
    "F-150": 34000,
    Escape: 29000,
    Edge: 38000,
    Mustang: 30000,
    Expedition: 55000,
    Bronco: 33000,
    Ranger: 28000,
  },
  Hyundai: {
    Tucson: 29000,
    "Santa Fe": 33000,
    Elantra: 22000,
    Sonata: 27000,
    Palisade: 37000,
    Kona: 24000,
    "Ioniq 5": 42000,
  },
  Kia: {
    Sportage: 30000,
    Sorento: 33000,
    Telluride: 37000,
    K5: 27000,
    Forte: 20000,
    EV6: 43000,
    Carnival: 35000,
  },
  Nissan: {
    Altima: 26000,
    Pathfinder: 35000,
    Rogue: 29000,
    Murano: 35000,
    Sentra: 21000,
    Frontier: 30000,
    Kicks: 22000,
  },
  Chevrolet: {
    Equinox: 29000,
    Tahoe: 55000,
    Suburban: 58000,
    Malibu: 26000,
    Silverado: 37000,
    Traverse: 35000,
    Blazer: 37000,
  },
  "Range Rover": {
    Sport: 85000,
    Velar: 60000,
    Evoque: 48000,
    Defender: 55000,
    Discovery: 60000,
  },
  Audi: {
    A4: 40000,
    A6: 56000,
    A8: 88000,
    Q5: 45000,
    Q7: 58000,
    Q8: 70000,
    "e-tron": 72000,
    RS6: 120000,
  },
  Porsche: {
    Cayenne: 75000,
    Macan: 60000,
    Panamera: 92000,
    911: 115000,
    Taycan: 88000,
  },
  Volkswagen: {
    Tiguan: 30000,
    Atlas: 35000,
    Golf: 30000,
    Jetta: 22000,
    "ID.4": 40000,
    Touareg: 55000,
  },
  Jeep: {
    "Grand Cherokee": 40000,
    Wrangler: 32000,
    Cherokee: 34000,
    Compass: 28000,
    Gladiator: 38000,
  },
};
function depreciated(msrp, age) {
  const k = [1, 0.78, 0.66, 0.58, 0.52, 0.48];
  if (age <= 0) return msrp;
  if (age < k.length) return msrp * k[age];
  return msrp * k[k.length - 1] * Math.pow(0.94, age - k.length + 1);
}
const MKT = {
  us: { m: 1, d: 0.75, n: "US auction" },
  cn: { m: 0.7, d: 1, n: "China dealer" },
  be: { m: 1.15, d: 0.8, n: "EU auction" },
  uk: { m: 1.1, d: 0.8, n: "UK auction" },
  ae: { m: 0.95, d: 0.85, n: "UAE market" },
};
const ROUTES = {
  us: {
    label: "United States",
    flag: "🇺🇸",
    rates: { sedan: 2800, suv: 3400, truck: 3800 },
    transit: "28–35",
  },
  cn: {
    label: "China",
    flag: "🇨🇳",
    rates: { sedan: 2200, suv: 2800, truck: 3200 },
    transit: "30–40",
  },
  be: {
    label: "Belgium",
    flag: "🇧🇪",
    rates: { sedan: 1800, suv: 2400, truck: 2800 },
    transit: "18–25",
  },
  uk: {
    label: "UK",
    flag: "🇬🇧",
    rates: { sedan: 2000, suv: 2600, truck: 3000 },
    transit: "20–28",
  },
  ae: {
    label: "UAE",
    flag: "🇦🇪",
    rates: { sedan: 1600, suv: 2100, truck: 2500 },
    transit: "14–20",
  },
};
const ENG = [
  { label: "Under 2,000cc", value: "u2", rate: 0 },
  { label: "2,000 – 3,999cc", value: "m4", rate: 0.02 },
  { label: "4,000cc and above", value: "o4", rate: 0.04 },
];
const BODY = [
  { label: "Sedan / Hatch", value: "sedan" },
  { label: "SUV / Crossover", value: "suv" },
  { label: "Truck / Van", value: "truck" },
];
const MAKES = Object.keys(MSRP).map((make) => ({
  make,
  models: Object.keys(MSRP[make]),
}));
const NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => NOW - i);
const XR = 1400;
const fmt = (v) => "₦" + Math.round(v).toLocaleString("en-NG");
const fmtU = (v) => "$" + Math.round(v).toLocaleString("en-US");

function calcDuties({ fob, ship, ins, eng }) {
  const cif = fob + ship + ins,
    duty = 0.2 * cif,
    nac = 0.05 * cif;
  const sp = ENG.find((e) => e.value === eng) || ENG[0];
  const green = cif * sp.rate,
    sur = 0.07 * duty,
    other = 0.04 * fob;
  const fees = duty + nac + green + sur + other,
    sub = cif + fees,
    vat = 0.075 * sub;
  return {
    cif,
    duty,
    nac,
    green,
    sur,
    other,
    fees,
    sub,
    vat,
    total: sub + vat,
    gp: `${sp.rate * 100}%`,
  };
}

async function fetchCarImage(make, model, year) {
  const params = new URLSearchParams({
    api_key: CI_API_KEY,
    make,
    year: String(year),
    format: "webp",
    width: "1200",
  });
  if (model) params.set("model", model);

  try {
    console.log("[CarImages] Fetching image →", params.toString());
    const res = await fetch(
      `https://carimagesapi.com/api/v1/signed-url?${params.toString()}`,
    );
    console.log("[CarImages] Response status:", res.status);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

    const data = await res.json();
    console.log("[CarImages] Response data:", data);
    if (!data?.url) throw new Error("No image URL returned in response");

    console.log("[CarImages] Image URL ready:", data.url);
    return data.url;
  } catch (err) {
    console.error("[CarImages] Error fetching car image:", err);
    throw err;
  }
}

// ── Components ────────────────────────────────────────────────────

function Row({ label, val, bold, green }) {
  return (
    <div
      className={`flex justify-between items-baseline ${bold ? "pt-4 pb-1 border-t border-white/10 mt-2" : "py-2"}`}
    >
      <span
        className={`text-[13px] ${bold ? "font-semibold text-white/50" : "text-white/40"}`}
      >
        {label}
      </span>
      <span
        className={`font-mono tracking-tighter ${bold ? "text-lg font-extrabold text-white" : green ? "text-sm font-medium text-white" : "text-sm font-medium text-white/80"}`}
      >
        {fmt(val)}
      </span>
    </div>
  );
}

const GlassCard = ({ children, className = "" }) => (
  <div className={` backdrop-blur-xl  rounded-[24px] shadow-2xl ${className}`}>
    {children}
  </div>
);

function Select({
  label,
  value,
  options,
  placeholder,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div>
      <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full min-w-0 flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-left focus:border-white/50 outline-none cursor-pointer ${className}`}
        >
          <span
            className={`truncate ${selected ? "text-white" : "text-white/40"}`}
          >
            {selected ? selected.label : placeholder}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {open && (
          <ul className="absolute z-30 mt-2 w-full max-h-60 overflow-y-auto rounded-xl bg-[#0b0b0f] border border-white/10 shadow-2xl py-1">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${value === o.value ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CarPreview({ make, model, year }) {
  const [imgSrc, setImgSrc] = useState("");
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const url = await fetchCarImage(make, model, year);
        if (cancelled) return;
        setImgSrc(url);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error(
          "[CarImages] Load failed for",
          { make, model, year },
          err,
        );
        setStatus("error");
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [make, model, year, attempt]);

  return (
    <GlassCard className="relative aspect-[16/10] overflow-hidden mb-8">
      {status === "ready" ? (
        <img
          src={imgSrc}
          alt={`${year} ${make} ${model}`}
          className="w-full h-full object-cover"
        />
      ) : status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center text-white/40 text-xl">
            !
          </div>
          <p className="text-white/50 text-sm font-semibold">
            Couldn't load the car image.
          </p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="px-5 py-2 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.97]"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-5 bg-black/40">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/70 animate-spin" />
          </div>
          <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            Loading car image
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ── Main App ──────────────────────────────────────────────────────

export default function CarApp() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(NOW - 3));
  const [customMode, setCustomMode] = useState(false);
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customYear, setCustomYear] = useState(String(NOW - 3));
  const [origin, setOrigin] = useState("us");
  const [body, setBody] = useState("sedan");
  const [eng, setEng] = useState("m4");
  const [fobManual, setFobManual] = useState("");
  const [usingEst, setUsingEst] = useState(true);
  const [done, setDone] = useState(false);
  const resultRef = useRef(null);

  const route = ROUTES[origin];
  const effMake = (customMode ? customMake : make).trim();
  const effModel = (customMode ? customModel : model).trim();
  const effYear = customMode ? customYear : year;
  const models = useMemo(
    () => MAKES.find((c) => c.make === make)?.models || [],
    [make],
  );
  const estFOB = useMemo(() => {
    if (customMode || !effMake || !effModel) return null;
    const ms = MSRP[effMake]?.[effModel];
    if (!ms) return null;
    const { m, d } = MKT[origin];
    return (
      Math.round((depreciated(ms * m, NOW - Number(effYear)) * d) / 100) * 100
    );
  }, [customMode, effMake, effModel, effYear, origin]);

  const useEstimate = usingEst && !customMode && !!estFOB;
  const fobUSD = useEstimate ? estFOB || 0 : Number(fobManual) || 0;
  const shipUSD = route.rates[body];
  const fobN = fobUSD * XR,
    shipN = shipUSD * XR,
    insN = fobN * 0.012;
  const result = useMemo(
    () =>
      fobUSD <= 0
        ? null
        : calcDuties({ fob: fobN, ship: shipN, ins: insN, eng }),
    [fobN, shipN, insN, eng, fobUSD],
  );
  const carLabel =
    effMake && effModel ? `${effYear} ${effMake} ${effModel}` : null;

  const go = useCallback(() => {
    if (result) {
      setDone(true);
      setTimeout(
        () =>
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      );
    }
  }, [result, resultRef]);

  return (
    <div className="relative min-h-screen bg-black text-slate-50 font-sans  overflow-x-hidden">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease forwards; }
        .animate-up { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Decorative Blobs */}
      <div className="fixed -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-white/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] bg-white/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Nav */}
      <nav className="relative z-10 flex justify-between items-center px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-white/20">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
            >
              <path d="M7 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M17 17m-2 0a2 2 0 104 0 2 2 0 10-4 0M5 17H3v-6l2-5h9l4 5h1a2 2 0 012 2v4h-2M9 17h6" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter">
            Ship2Lagos
          </span>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
            USD/NGN
          </span>
          <span className="font-mono text-sm font-bold text-white">
            ₦{XR.toLocaleString()}
          </span>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col lg:flex-row">
        {/* Left: Car Preview Column */}
        <div className="w-full lg:w-[45%] lg:sticky lg:top-0 lg:h-[calc(100vh-80px)] flex flex-col justify-center px-6 lg:px-12 py-8">
          <div className="max-w-xl mx-auto w-full">
            {!effMake || !effModel ? (
              <div className="text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6 tracking-tight">
                  Import your car to Lagos,{" "}
                  <span className="text-white">hassle-free.</span>
                </h1>
                <p className="text-white/40 text-lg leading-relaxed">
                  Accurate duty estimates, shipping costs, and live car
                  previews. Calculate your landed price in seconds.
                </p>
              </div>
            ) : (
              <div className="animate-fade-in mt-40">
                <CarPreview
                  key={`${effMake}||${effModel}||${effYear}`}
                  make={effMake}
                  model={effModel}
                  year={effYear}
                />

                <div className="flex justify-center">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-4">
                    <span className="text-2xl">{route.flag}</span>
                    <span className="text-sm font-bold">{route.label}</span>
                    <span className="text-white/20">→</span>
                    <span className="text-2xl">🇳🇬</span>
                    <span className="text-sm font-bold">Lagos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Calculator Column */}
        <div className="w-full lg:w-[55%] px-6 lg:px-12 py-8 lg:pb-32">
          <div className="max-w-lg mx-auto">
            {carLabel && (
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={`https://carimagesapi.com/brand-logo?make=${encodeURIComponent(effMake)}`}
                  className="h-8 invert opacity-80"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  alt={effMake}
                />
                <h2 className="text-2xl font-black tracking-tight">
                  {carLabel}
                </h2>
              </div>
            )}

            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-widest">
                  Vehicle Specification
                </h3>
                {customMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomMode(false);
                      setCustomMake("");
                      setCustomModel("");
                      setDone(false);
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    ← Back to catalogue list
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {customMode ? (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
                        Manufacturer
                      </label>
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:border-white/50 outline-none"
                        placeholder="e.g. Tesla"
                        value={customMake}
                        onChange={(e) => {
                          setCustomMake(e.target.value);
                          setDone(false);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
                        Model
                      </label>
                      <input
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:border-white/50 outline-none"
                        placeholder="e.g. Model 3"
                        value={customModel}
                        onChange={(e) => {
                          setCustomModel(e.target.value);
                          setDone(false);
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Select
                      label="Manufacturer"
                      value={make}
                      placeholder="Select Make"
                      options={[
                        ...MAKES.map((c) => ({ value: c.make, label: c.make })),
                        { value: "__other__", label: "Not listed / Other" },
                      ]}
                      onChange={(v) => {
                        if (v === "__other__") {
                          setCustomMode(true);
                          setCustomMake("");
                          setMake("");
                        } else {
                          setCustomMode(false);
                          setMake(v);
                        }
                        setModel("");
                        setDone(false);
                      }}
                    />
                    <Select
                      label="Model"
                      value={model}
                      placeholder="Select Model"
                      options={models.map((m) => ({ value: m, label: m }))}
                      onChange={(v) => {
                        setModel(v);
                        setDone(false);
                      }}
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
                    Year
                  </label>
                  {customMode ? (
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm placeholder:text-white/20 focus:border-white/50 outline-none"
                      placeholder="e.g. 2022"
                      value={customYear}
                      onChange={(e) => {
                        setCustomYear(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        );
                        setDone(false);
                      }}
                    />
                  ) : (
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/50 outline-none appearance-none cursor-pointer"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        setDone(false);
                      }}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
                    Body
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/50 outline-none appearance-none cursor-pointer"
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                      setDone(false);
                    }}
                  >
                    {BODY.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/30 uppercase mb-2 block">
                    Engine
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/50 outline-none appearance-none cursor-pointer"
                    value={eng}
                    onChange={(e) => {
                      setEng(e.target.value);
                      setDone(false);
                    }}
                  >
                    {ENG.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-6">
                Origin & Shipping
              </h3>
              <div className="grid grid-cols-5 gap-2 mb-8">
                {Object.entries(ROUTES).map(([k, r]) => (
                  <button
                    key={k}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${origin === k ? "bg-white/10 border-white text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.2)]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}
                    onClick={() => {
                      setOrigin(k);
                      setDone(false);
                    }}
                  >
                    <span className="text-xl leading-none">{r.flag}</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">
                      {k}
                    </span>
                  </button>
                ))}
              </div>

              <h3 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">
                FOB Value (USD)
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-white/10 p-1 rounded-lg flex">
                    <button
                      className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all disabled:opacity-30 ${useEstimate ? "bg-white text-black shadow-lg shadow-white/20" : "text-white/40 hover:text-white"}`}
                      disabled={customMode || !estFOB}
                      onClick={() => setUsingEst(true)}
                    >
                      ESTIMATE
                    </button>
                    <button
                      className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${!useEstimate ? "bg-white text-black shadow-lg shadow-white/20" : "text-white/40 hover:text-white"}`}
                      onClick={() => setUsingEst(false)}
                    >
                      MANUAL
                    </button>
                  </div>
                  <span className="font-mono text-xl font-black text-white">
                    {fmtU(fobUSD)}
                  </span>
                </div>
                {customMode && (
                  <p className="text-[10px] text-white/30 mb-3 leading-relaxed">
                    This car isn't in our catalogue, so the estimate is manual.
                    Enter the FOB value below.
                  </p>
                )}
                {!useEstimate && (
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-white/50 outline-none font-mono"
                    placeholder="Enter manual price..."
                    value={fobManual}
                    onChange={(e) =>
                      setFobManual(e.target.value.replace(/\D/g, ""))
                    }
                  />
                )}
              </div>

              <button
                className="w-full py-5 bg-white hover:bg-white/80 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-white/20"
                disabled={fobUSD <= 0}
                onClick={go}
              >
                Calculate Landed Cost
              </button>
            </GlassCard>

            {/* Results Section */}
            {done && result && (
              <div ref={resultRef} className="mt-8 animate-up">
                <GlassCard className="p-8">
                  <div className="text-center mb-10">
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mb-2">
                      Total Landed Cost
                    </p>
                    <h3 className="text-5xl font-black font-mono tracking-tighter mb-1">
                      {fmt(result.total)}
                    </h3>
                    <p className="text-lg text-white font-mono font-bold">
                      ≈ {fmtU(result.total / XR)}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">
                        Cost Breakdown
                      </p>
                      <Row label="FOB Purchase Price" val={fobN} />
                      <Row label="Ocean Freight (RoRo)" val={shipN} />
                      <Row label="Marine Insurance" val={insN} />
                    </div>

                    <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-2 mb-3">
                        Customs & Levies
                      </p>
                      <Row label="Import Duty (20%)" val={result.duty} />
                      <Row label="NAC Levy (5%)" val={result.nac} />
                      <Row
                        label={`Green Tax (${result.gp})`}
                        val={result.green}
                      />
                      <Row label="VAT (7.5%)" val={result.vat} />
                    </div>

                    <div className="pt-2">
                      <Row
                        label="Total Amount Payable"
                        val={result.total}
                        bold
                        green
                      />
                    </div>
                  </div>
                </GlassCard>

                <div className="mt-6 px-6 text-[10px] leading-relaxed text-white/20 text-center">
                  <strong>Disclaimer:</strong> This calculation is an estimate
                  based on a current rate of ₦{XR}. Actual customs valuation at
                  the port may vary. Terminal handling and clearing agent fees
                  are not included.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
