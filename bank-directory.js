const VIETNAM_BANKS = [
  ["agribank", "Agribank", "Agribank", "domesticCommercial", "#b61f2c", ["agribank", "vietnam bank for agriculture", "vbard", "nhno", "nhno pttn"]],
  ["acb", "ACB", "ACB", "domesticCommercial", "#1269b0", ["acb", "acb bank", "asia commercial bank", "ngan hang a chau"]],
  ["abbank", "ABBANK", "AB", "domesticCommercial", "#19a15f", ["abbank", "ab bank", "an binh bank"]],
  ["bac_a_bank", "Bac A Bank", "BAB", "domesticCommercial", "#0f7d4f", ["bac a bank", "bacabank", "baca bank", "ngan hang bac a"]],
  ["bvbank", "BVBank", "BVB", "domesticCommercial", "#1f8ed5", ["bvbank", "bv bank", "viet capital bank", "vietcapital bank", "ngan hang ban viet"]],
  ["baoviet_bank", "BAOVIET Bank", "BV", "domesticCommercial", "#f0a000", ["baoviet bank", "bao viet bank", "baovietbank"]],
  ["vietinbank", "VietinBank", "VTB", "domesticCommercial", "#0f62a8", ["vietinbank", "vietin bank", "incombank", "icbv", "ngan hang cong thuong"]],
  ["pvcombank", "PVcomBank", "PVC", "domesticCommercial", "#008fb3", ["pvcombank", "pv com bank", "pvcom bank", "western bank", "pvfc"]],
  ["bidv", "BIDV", "BIDV", "domesticCommercial", "#0069aa", ["bidv", "bank for investment and development", "ngan hang dau tu va phat trien"]],
  ["seabank", "SeABank", "SEA", "domesticCommercial", "#e45a20", ["seabank", "sea bank", "seamobile", "ngan hang dong nam a"]],
  ["msb", "MSB", "MSB", "domesticCommercial", "#f05a22", ["msb", "msb bank", "maritime bank", "maritimebank", "vietnam maritime bank"]],
  ["kienlongbank", "KienlongBank", "KLB", "domesticCommercial", "#4d9b37", ["kienlongbank", "kien long bank", "kienlong bank", "klb"]],
  ["techcombank", "Techcombank", "TCB", "domesticCommercial", "#e31b23", ["techcombank", "techcom bank", "tcb"]],
  ["lpbank", "LPBank", "LPB", "domesticCommercial", "#8b1d5b", ["lpbank", "lp bank", "lienvietpostbank", "lien viet post bank", "lienvietbank", "lvpb"]],
  ["nam_a_bank", "Nam A Bank", "NAB", "domesticCommercial", "#0f78bd", ["nam a bank", "namabank", "nam a", "nab"]],
  ["vietcombank", "Vietcombank", "VCB", "domesticCommercial", "#007a3d", ["vietcombank", "vietcom bank", "vcb digibank", "vcb", "bank for foreign trade"]],
  ["hdbank", "HDBank", "HDB", "domesticCommercial", "#d91f26", ["hdbank", "hd bank", "housing development bank"]],
  ["ocb", "OCB", "OCB", "domesticCommercial", "#18a05e", ["ocb", "ocb bank", "ocb omni", "orient commercial bank"]],
  ["mbbank", "MB", "MB", "domesticCommercial", "#1b4f9c", ["mbbank", "mb bank", "military bank", "ngan hang quan doi"]],
  ["ncb", "NCB", "NCB", "domesticCommercial", "#c49a38", ["ncb", "ncb bank", "national citizen bank", "navibank", "navi bank"]],
  ["vib", "VIB", "VIB", "domesticCommercial", "#f58220", ["vib", "vib bank", "myvib", "vietnam international bank"]],
  ["scb_vietnam", "SCB", "SCB", "domesticCommercial", "#113f8c", ["scb", "scb vietnam", "saigon commercial bank"]],
  ["shb", "SHB", "SHB", "domesticCommercial", "#f58220", ["shb", "shb bank", "saigon hanoi bank", "saigon-hanoi bank"]],
  ["saigonbank", "SAIGONBANK", "SGB", "domesticCommercial", "#0072bc", ["saigonbank", "saigon bank", "sgb"]],
  ["sacombank", "Sacombank", "STB", "domesticCommercial", "#005baa", ["sacombank", "sacom bank", "stb", "saigon thuong tin", "sai gon thuong tin", "ngan hang sai gon tai loc"]],
  ["pgbank", "PGBank", "PGB", "domesticCommercial", "#f47b20", ["pgbank", "pg bank", "petrolimex bank", "pg bank petrolimex"]],
  ["tpbank", "TPBank", "TPB", "domesticCommercial", "#5c2483", ["tpbank", "tp bank", "tien phong bank", "tienphong bank"]],
  ["vietabank", "VietABank", "VAB", "domesticCommercial", "#d71920", ["vietabank", "viet a bank", "vab", "ngan hang viet a"]],
  ["vpbank", "VPBank", "VPB", "domesticCommercial", "#1f9c4d", ["vpbank", "vp bank", "vpb", "vietnam prosperity bank"]],
  ["vietbank", "Vietbank", "VBB", "domesticCommercial", "#005bac", ["vietbank", "viet bank", "viet nam thuong tin bank"]],
  ["eximbank", "Eximbank", "EIB", "domesticCommercial", "#0b78bd", ["eximbank", "exim bank", "eib"]],
  ["gpbank", "GPBank", "GPB", "transformedBank", "#009b72", ["gpbank", "gp bank", "global petro bank"]],
  ["vcbneo", "VCBNeo", "NEO", "transformedBank", "#00a859", ["vcbneo", "vcb neo", "cb bank", "cbbank", "construction bank"]],
  ["vikki_bank", "Vikki Bank", "VIK", "transformedBank", "#ef476f", ["vikki bank", "vikki", "dong a bank", "donga bank", "dab", "vikki dab"]],
  ["mbv", "MBV", "MBV", "transformedBank", "#1b4f9c", ["mbv", "modern bank of vietnam", "oceanbank", "ocean bank"]],
  ["ivb", "Indovina Bank", "IVB", "jointVenture", "#006b54", ["indovina bank", "ivb", "indovina"]],
  ["vrb", "VRB", "VRB", "jointVenture", "#0055a4", ["vrb", "viet nga bank", "vietnam russia bank", "vietnam-russia bank"]],
  ["anz_vietnam", "ANZ Vietnam", "ANZ", "foreignOwned", "#0073cf", ["anz", "anz vietnam", "anz bank vietnam"]],
  ["cimb_vietnam", "CIMB Vietnam", "CIMB", "foreignOwned", "#b11f2a", ["cimb", "cimb bank", "cimb vietnam"]],
  ["hong_leong_vietnam", "Hong Leong Bank Vietnam", "HLB", "foreignOwned", "#d71920", ["hong leong bank", "hong leong vietnam", "hlb"]],
  ["hsbc_vietnam", "HSBC Vietnam", "HSBC", "foreignOwned", "#db0011", ["hsbc", "hsbc bank", "hsbc vietnam", "hongkong and shanghai banking corporation"]],
  ["public_bank_vietnam", "Public Bank Vietnam", "PBVN", "foreignOwned", "#e31b23", ["public bank", "public bank vietnam", "pbvn", "vid public bank"]],
  ["shinhan_vietnam", "Shinhan Bank Vietnam", "SHB", "foreignOwned", "#0046ad", ["shinhan", "shinhan bank", "shinhan sol", "sol"]],
  ["standard_chartered_vietnam", "Standard Chartered Vietnam", "SC", "foreignOwned", "#0f8f61", ["standard chartered", "standard chartered bank", "standard chartered vietnam"]],
  ["uob_vietnam", "UOB Vietnam", "UOB", "foreignOwned", "#004b9b", ["uob", "uob bank", "uob vietnam", "uob tmrw", "tmrw"]],
  ["woori_vietnam", "Woori Bank Vietnam", "WOO", "foreignOwned", "#0067b1", ["woori", "woori bank", "woori vietnam", "woori won"]],
  ["vbsp", "Ngân hàng Chính sách Xã hội", "VBSP", "policyBank", "#007a3d", ["vbsp", "nhcsxh", "vietnam bank for social policies", "ngan hang chinh sach xa hoi"]],
  ["vdb", "Ngân hàng Phát triển Việt Nam", "VDB", "policyBank", "#0069aa", ["vdb", "vietnam development bank", "ngan hang phat trien viet nam"]],
  ["coopbank", "Co-opBank", "COOP", "cooperativeBank", "#00845f", ["coopbank", "co-opbank", "coop bank", "cooperative bank of vietnam", "cov"]]
].map(([id, displayName, shortName, category, color, aliases]) => ({
  id,
  displayName,
  shortName,
  category,
  color,
  aliases
}))

const BANK_LOGO_OVERRIDES = {
  anz_vietnam: "assets/banks/anz_vietnam.svg"
}

const BANK_LOGO_MISSING = new Set(["vdb"])

function normalizeBankText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .replace(/[-_:/().,;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function aliasPattern(alias) {
  const normalized = normalizeBankText(alias).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|\\s)${normalized}(?=\\s|$)`, "i")
}

function findBankByID(id) {
  return VIETNAM_BANKS.find(bank => bank.id === id)
}

function findBankByName(name) {
  const normalized = normalizeBankText(name)
  return VIETNAM_BANKS.find(bank =>
    normalizeBankText(bank.displayName) === normalized ||
    normalizeBankText(bank.shortName) === normalized
  )
}

function matchBank(text) {
  const normalized = normalizeBankText(text)
  const matches = []

  for (const bank of VIETNAM_BANKS) {
    const aliases = [bank.displayName, bank.shortName, ...bank.aliases]
    for (const alias of aliases) {
      const normalizedAlias = normalizeBankText(alias)
      if (!normalizedAlias) continue
      if (aliasPattern(alias).test(normalized)) {
        matches.push({
          bank,
          matchedAlias: alias,
          confidence: normalizedAlias === normalizeBankText(bank.displayName) || normalizedAlias === normalizeBankText(bank.shortName) ? 1 : 0.95,
          length: normalizedAlias.length
        })
      }
    }
  }

  return matches.sort((a, b) => b.length - a.length || b.confidence - a.confidence)[0] || null
}

function bankLogo(bankOrName, size = "regular") {
  const bank = typeof bankOrName === "string"
    ? findBankByID(bankOrName) || findBankByName(bankOrName) || matchBank(bankOrName)?.bank
    : bankOrName

  const color = bank?.color || "#00899a"
  const shortName = bank?.shortName || "BANK"
  const label = shortName.length > 4 ? shortName.slice(0, 4) : shortName
  const logoPath = bank && !BANK_LOGO_MISSING.has(bank.id)
    ? BANK_LOGO_OVERRIDES[bank.id] || `assets/banks/${bank.id}.png`
    : ""

  return `
    <div class="bank-logo ${size} ${logoPath ? "has-image" : ""}" style="--bank-color:${color}" title="${bank?.displayName || "Ngân hàng"}">
      ${logoPath ? `<img src="${logoPath}" alt="${bank.displayName}" loading="lazy" onerror="this.hidden=true;this.parentElement.classList.remove('has-image')" />` : ""}
      <span>${label}</span>
    </div>
  `
}

function iconSvg(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M12 7v5l3 2"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 21h4"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-5"/></svg>',
    key: '<svg viewBox="0 0 24 24"><path d="M15 7a4 4 0 1 0 2 3.5L22 15v3h-3v3h-3l-4.5-4.5"/><path d="M7 10h.01"/></svg>',
    upload: '<svg viewBox="0 0 24 24"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>',
    user: '<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 11.7-2.7L20 8"/><path d="M18 15a7 7 0 0 1-11.7 2.7L4 16"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14"/><path d="M9 7V4h6v3"/></svg>',
    info: '<svg viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M12 11v6M12 7h.01"/></svg>',
    coin: '<svg viewBox="0 0 24 24"><path d="M12 20c5 0 9-2 9-4.5V8.5C21 6 17 4 12 4S3 6 3 8.5v7C3 18 7 20 12 20Z"/><path d="M3 8.5C3 11 7 13 12 13s9-2 9-4.5"/><path d="M3 12c0 2.5 4 4.5 9 4.5s9-2 9-4.5"/></svg>',
    wallet: '<svg viewBox="0 0 24 24"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v2h-4.5a3.5 3.5 0 0 0 0 7H20v1a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M15.5 11H21v3h-5.5a1.5 1.5 0 0 1 0-3Z"/></svg>',
    receipt: '<svg viewBox="0 0 24 24"><path d="M7 3h10a1 1 0 0 1 1 1v17l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    piggy: '<svg viewBox="0 0 24 24"><path d="M5 12a6 6 0 0 1 6-6h3.5A4.5 4.5 0 0 1 19 10.5h1.5V15H19a5 5 0 0 1-2 2.3V20h-3v-2h-4v2H7v-2.4A6 6 0 0 1 5 12Z"/><path d="M8 8 6 5M15 10h.01"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/><path d="M2 10h20M6 15h5"/></svg>',
    house: '<svg viewBox="0 0 24 24"><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>',
    laptop: '<svg viewBox="0 0 24 24"><path d="M6 5h12a1 1 0 0 1 1 1v9H5V6a1 1 0 0 1 1-1Z"/><path d="M3 18h18"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/></svg>',
    wifi: '<svg viewBox="0 0 24 24"><path d="M4 10a12 12 0 0 1 16 0M7 13a7 7 0 0 1 10 0M10 16a3 3 0 0 1 4 0"/><path d="M12 20h.01"/></svg>',
    bank: '<svg viewBox="0 0 24 24"><path d="M3 10h18L12 4 3 10Z"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8M4 20h16"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><path d="M7 3v4M17 3v4M4 8h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z"/></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-9"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"/><path d="m19 13.5 2-1.5-2-1.5-.5-1.3.8-2.4-2.5-1.4-1.8 1.7-1.4-.2L12 4h-3l-.7 2.9-1.4.2L5.1 5.4 2.6 6.8l.8 2.4-.5 1.3L1 12l1.9 1.5.5 1.3-.8 2.4 2.5 1.4 1.8-1.7 1.4.2L9 20h3l.7-2.9 1.4-.2 1.8 1.7 2.5-1.4-.8-2.4.4-1.3Z"/></svg>'
  }

  return icons[name] || icons.card
}
