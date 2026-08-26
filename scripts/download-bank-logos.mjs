import fs from "node:fs/promises"
import path from "node:path"

const root = process.cwd()
const webDir = path.join(root, "web-preview", "assets", "banks")
const iosAssetsDir = path.join(root, "QLCTApp", "Assets.xcassets")
const bankJsonPath = path.join(root, "vietqr-banks.json")

const bankCodeByID = {
  agribank: "VBA",
  acb: "ACB",
  abbank: "ABB",
  bac_a_bank: "BAB",
  bvbank: "VCCB",
  baoviet_bank: "BVB",
  vietinbank: "ICB",
  pvcombank: "PVCB",
  bidv: "BIDV",
  seabank: "SEAB",
  msb: "MSB",
  kienlongbank: "KLB",
  techcombank: "TCB",
  lpbank: "LPB",
  nam_a_bank: "NAB",
  vietcombank: "VCB",
  hdbank: "HDB",
  ocb: "OCB",
  mbbank: "MB",
  ncb: "NCB",
  vib: "VIB",
  scb_vietnam: "SCB",
  shb: "SHB",
  saigonbank: "SGICB",
  sacombank: "STB",
  pgbank: "PGB",
  tpbank: "TPB",
  vietabank: "VAB",
  vpbank: "VPB",
  vietbank: "VIETBANK",
  eximbank: "EIB",
  gpbank: "GPB",
  vcbneo: "CBB",
  vikki_bank: "Vikki",
  mbv: "MBV",
  ivb: "IVB",
  vrb: "VRB",
  cimb_vietnam: "CIMB",
  hong_leong_vietnam: "HLBVN",
  hsbc_vietnam: "HSBC",
  public_bank_vietnam: "PBVN",
  shinhan_vietnam: "SHBVN",
  standard_chartered_vietnam: "SCVN",
  uob_vietnam: "UOB",
  woori_vietnam: "WVN",
  vbsp: "VBSP",
  vdb: "VDB",
  coopbank: "COOPBANK"
}

const manualLogoURLs = {
  anz_vietnam: "https://login.anz.com/internetbanking/assets/img/anz-logo.1785394898705.svg"
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "QLCTApp/1.0 logo bootstrap" }
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || ""
  }
}

function extensionFor(contentType, url) {
  if (contentType.includes("svg") || url.endsWith(".svg")) return "svg"
  if (contentType.includes("webp") || url.endsWith(".webp")) return "webp"
  if (contentType.includes("jpeg") || url.endsWith(".jpg") || url.endsWith(".jpeg")) return "jpg"
  return "png"
}

async function writeIOSImageSet(bankID, filename, bytes) {
  const setDir = path.join(iosAssetsDir, `BankLogo_${bankID}.imageset`)
  const isVector = filename.toLowerCase().endsWith(".svg")
  const image = {
    idiom: "universal",
    filename
  }
  if (!isVector) image.scale = "1x"

  const contents = {
    images: [image],
    info: {
      author: "xcode",
      version: 1
    }
  }
  if (isVector) {
    contents.properties = {
      "preserves-vector-representation": true
    }
  }

  await ensureDir(setDir)
  await fs.writeFile(path.join(setDir, filename), bytes)
  await fs.writeFile(
    path.join(setDir, "Contents.json"),
    JSON.stringify(contents, null, 2)
  )
}

async function main() {
  await ensureDir(webDir)
  await ensureDir(iosAssetsDir)
  await fs.writeFile(
    path.join(iosAssetsDir, "Contents.json"),
    JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2)
  )

  const vietQR = JSON.parse((await fs.readFile(bankJsonPath, "utf8")).replace(/^\uFEFF/, "")).data
  const byCode = new Map(vietQR.map(bank => [String(bank.code).toUpperCase(), bank]))
  const logoMap = {}
  const missing = []

  for (const [bankID, code] of Object.entries(bankCodeByID)) {
    const bank = byCode.get(code.toUpperCase())
    if (!bank?.logo) {
      missing.push(bankID)
      continue
    }

    try {
      const { bytes, contentType } = await fetchBuffer(bank.logo)
      const ext = extensionFor(contentType, bank.logo)
      const filename = `${bankID}.${ext}`
      await fs.writeFile(path.join(webDir, filename), bytes)
      await writeIOSImageSet(bankID, filename, bytes)
      logoMap[bankID] = `assets/banks/${filename}`
      console.log(`ok ${bankID} <- ${bank.logo}`)
    } catch (error) {
      missing.push(bankID)
      console.warn(`missing ${bankID}: ${error.message}`)
    }
  }

  for (const [bankID, url] of Object.entries(manualLogoURLs)) {
    try {
      const { bytes, contentType } = await fetchBuffer(url)
      const ext = extensionFor(contentType, url)
      const filename = `${bankID}.${ext}`
      await fs.writeFile(path.join(webDir, filename), bytes)
      await writeIOSImageSet(bankID, filename, bytes)
      logoMap[bankID] = `assets/banks/${filename}`
      console.log(`ok ${bankID} <- ${url}`)
    } catch (error) {
      missing.push(bankID)
      console.warn(`missing ${bankID}: ${error.message}`)
    }
  }

  await fs.writeFile(
    path.join(webDir, "logo-map.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), logoMap, missing }, null, 2)
  )

  console.log(`downloaded ${Object.keys(logoMap).length} logos`)
  if (missing.length) console.log(`missing: ${[...new Set(missing)].join(", ")}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
