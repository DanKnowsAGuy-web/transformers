#!/usr/bin/env node
/**
 * Generates a pure static HTML site for GitHub Pages (Energy Plus transformers).
 * Output: /workspace/static-export/
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "static-export");
const data = JSON.parse(readFileSync(join(ROOT, "scripts/site-data.json"), "utf8"));

const {
  COMPANY_LEGAL,
  SITE_URL,
  SITE_HREF,
  PHONE,
  PHONE_HREF,
  EMAIL,
  EMAIL_HREF,
  ADDRESS_LINE,
  ENTITY_NOTE,
  categories,
  products,
  SMS_BODY = "",
  SMS_HREF = "",
  EMAIL_SUBJECT = "Transformer inquiry — Energy Plus",
  EMAIL_BODY = "",
  FORMSPREE_ENDPOINT = "",
} = data;

const EMAIL_MAILTO =
  "mailto:" +
  EMAIL +
  "?subject=" +
  encodeURIComponent(EMAIL_SUBJECT) +
  (EMAIL_BODY ? "&body=" + encodeURIComponent(EMAIL_BODY) : "");

function phoneA(label, className = "contact-phone") {
  return `<a class="${className}" href="${esc(SMS_HREF || PHONE_HREF)}" data-contact="phone">${label}</a>`;
}

function emailA(label, className = "contact-email") {
  return `<a class="${className}" href="${esc(EMAIL_MAILTO)}" data-contact="email">${label}</a>`;
}

function contactBootScript() {
  const payload = {
    phone: PHONE,
    phoneTel: PHONE_HREF,
    email: EMAIL,
    smsHref: SMS_HREF,
    emailHref: EMAIL_MAILTO,
    formspree: FORMSPREE_ENDPOINT || "",
    smsBody: SMS_BODY,
  };
  return `<script>window.EP_CONTACT = ${JSON.stringify(payload)};</script>`;
}


function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function prefix(depth) {
  return depth === 0 ? "" : "../".repeat(depth);
}

function productPath(p) {
  return `transformers/${p.categoryId}/${p.id}/`;
}

function categoryPath(id) {
  return `transformers/${id}/`;
}

function write(relPath, html) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
  console.log("  wrote", relPath);
}

function head({ title, description, depth }) {
  const p = prefix(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0B2545">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="${p}assets/img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${p}assets/css/styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>`;
}

function header(depth, active = "") {
  const p = prefix(depth);
  return `
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${p}" aria-label="ENERGY+ home">
      <img src="${p}assets/img/logo-dark.png" alt="ENERGY+" width="160" height="45" class="brand-logo">
    </a>
    <nav class="nav-desktop" aria-label="Primary">
      <a href="${p}transformers/" class="${active === "transformers" ? "is-active" : ""}">Transformers</a>
      <a href="${p}#how-we-work">How We Work</a>
      <a href="${p}#applications">Applications</a>
      <a href="${p}#quality">Quality</a>
      <a href="${p}quote/">Request Quote</a>
    </nav>
    <div class="header-actions">
      ${phoneA(esc(PHONE), "contact-phone phone-link")}
      <a class="btn btn-accent btn-sm" href="${p}quote/">Get a Quote</a>
      <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="nav-mobile" data-nav-mobile hidden>
    <a href="${p}transformers/">Transformers</a>
    <a href="${p}#how-we-work">How We Work</a>
    <a href="${p}#applications">Applications</a>
    <a href="${p}#quality">Quality</a>
    <a href="${p}quote/">Request Quote</a>
    <div class="nav-mobile-cats">
      <p class="eyebrow">Product lines</p>
      ${categories.map((c) => `<a href="${p}${categoryPath(c.id)}">${esc(c.name)}</a>`).join("\n")}
    </div>
    ${phoneA("Text " + esc(PHONE), "contact-phone btn btn-accent")}
    ${emailA(esc(EMAIL), "contact-email btn btn-outline")}
  </div>
</header>`;
}

function footer(depth) {
  const p = prefix(depth);
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div>
      <a href="${p}" aria-label="ENERGY+ home">
        <img src="${p}assets/img/logo-white.png" alt="ENERGY+" width="160" height="45" class="brand-logo brand-logo-on-dark">
      </a>
      <p class="footer-blurb">Independent transformer procurement—power, distribution, specialty, and reactors up to 1,250 MVA / 765 kV. One source. Any transformer. Delivered.</p>
      <div class="footer-contact">
        ${phoneA(esc(PHONE), "contact-phone")}
        ${emailA(esc(EMAIL), "contact-email")}
        <a href="${SITE_HREF}" target="_blank" rel="noreferrer">${esc(SITE_URL)}</a>
      </div>
      <p class="footer-legal">${esc(COMPANY_LEGAL)}<br>${esc(ENTITY_NOTE)}<br>${esc(ADDRESS_LINE)}</p>
    </div>
    <div>
      <h3 class="footer-heading">Product range</h3>
      <ul class="footer-list">
        ${categories.map((c) => `<li><a href="${p}${categoryPath(c.id)}">${esc(c.name)}</a></li>`).join("\n")}
      </ul>
    </div>
    <div>
      <h3 class="footer-heading">Company</h3>
      <ul class="footer-list">
        <li><a href="${p}#how-we-work">How we work</a></li>
        <li><a href="${p}#quality">Quality & compliance</a></li>
        <li><a href="${p}quote/">Request a quote</a></li>
      </ul>
    </div>
    <div>
      <h3 class="footer-heading">Capacity</h3>
      <ul class="footer-list muted">
        <li>Up to 1,250 MVA</li>
        <li>Up to 765 kV</li>
        <li>Lead times from 3 months</li>
        <li>IEC · IEEE · GOST · NEMA</li>
        <li>FAT with remote witness</li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>© ${new Date().getFullYear()} ${esc(COMPANY_LEGAL)}. Independent procurement services. Not a manufacturer.</p>
    <p>Specifications subject to project requirements.</p>
  </div>
</footer>
${contactBootScript()}
<script src="${p}assets/js/site.js"></script>
</body>
</html>`;
}

function breadcrumb(items, depth) {
  const p = prefix(depth);
  return `<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol>
    ${items
      .map((item, i) => {
        const last = i === items.length - 1;
        if (last || !item.href) {
          return `<li aria-current="page">${esc(item.label)}</li>`;
        }
        return `<li><a href="${p}${item.href}">${esc(item.label)}</a></li>`;
      })
      .join("\n")}
  </ol>
</nav>`;
}

function quoteCta(depth) {
  const p = prefix(depth);
  return `
<section class="section">
  <div class="container">
    <div class="cta-panel">
      <p class="eyebrow accent">Request a quote</p>
      <h2>Ready to source a transformer?</h2>
      <p class="lede">Send your specs—type, capacity, voltages, application, and delivery date—and we will confirm availability and return a formal quote.</p>
      <div class="cta-actions">
        <a class="btn btn-accent btn-lg" href="${p}quote/">Submit project specs</a>
        ${phoneA(esc(PHONE), "contact-phone btn btn-outline-light btn-lg")}
        ${emailA(esc(EMAIL), "contact-email link-on-dark")}
      </div>
    </div>
  </div>
</section>`;
}

function homePage() {
  const depth = 0;
  const catCards = categories
    .map(
      (c) => `
    <a class="cat-card" href="${categoryPath(c.id)}">
      <div class="cat-card-img"><img src="${c.image}" alt="" loading="lazy"></div>
      <div class="cat-card-body">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.tagline)}</p>
        <span class="cat-card-meta">${c.itemCount} products</span>
      </div>
    </a>`,
    )
    .join("\n");

  return (
    head({
      title: "Energy Plus | Transformer Procurement Services",
      description:
        "One source for power, distribution, and specialty transformers up to 1,250 MVA / 765 kV. Quote to delivery with lead times from 3 months.",
      depth,
    }) +
    header(depth, "home") +
    `
<main id="main">
  <section class="hero">
    <div class="hero-bg">
      <img src="assets/img/hero-substation.jpg" alt="">
    </div>
    <div class="container hero-inner">
      <p class="hero-badge">Transformer Procurement Services</p>
      <h1>One source. Any transformer. <span class="accent-text">Delivered.</span></h1>
      <p class="hero-lede">Power, distribution, and specialty transformers—and reactors—sourced through our manufacturing network up to <strong>1,250 MVA / 765 kV</strong>. You send the specs. We own quote to delivery.</p>
      <div class="hero-actions">
        <a class="btn btn-accent btn-lg" href="quote/">Request a quote</a>
        <a class="btn btn-outline-light btn-lg" href="transformers/">Browse product range</a>
      </div>
      <div class="hero-stats">
        <div><strong>1,250 MVA</strong><span>Max capacity</span></div>
        <div><strong>765 kV</strong><span>Max voltage</span></div>
        <div><strong>3 mo+</strong><span>Lead times from</span></div>
      </div>
    </div>
  </section>

  <section class="value-strip">
    <div class="container value-grid">
      <div class="value-item">
        <h2>One agreement</h2>
        <p>No multi-vendor maze. One MSA covers your procurement relationship from quote through delivery.</p>
      </div>
      <div class="value-item">
        <h2>Lead times from 3 months</h2>
        <p>Availability confirmed before you commit. Complex or high-capacity units get clear timelines up front.</p>
      </div>
      <div class="value-item">
        <h2>Full capacity range</h2>
        <p>From small distribution units to the largest power transformers in service—whatever your application requires.</p>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="container split">
      <div>
        <p class="eyebrow accent">Who we are</p>
        <h2 class="section-title">The single point of contact for transformer procurement</h2>
        <p>When a facility needs a transformer, the search typically leads to a maze: multiple manufacturers, long lead queues, unclear delivery timelines, and no single party taking ownership. Energy Plus was built to solve that problem.</p>
        <p>We function as your sole-source procurement partner across the full capacity and voltage range. You send specs. We identify the right solution from our manufacturing network, confirm availability and lead time, and manage the process from quote to delivery. <strong>One agreement. One point of accountability.</strong></p>
        <div class="callout">
          <p class="eyebrow accent">How the process works</p>
          <p>Submit an RFP with specs and project timeline. We assess production availability across our network and respond with a confirmed quote. Lead times are as short as 3 months depending on unit type and current queue.</p>
        </div>
      </div>
      <div class="feature-grid">
        <div class="feature-card"><h3>Global sourcing</h3><p>We source globally at our discretion. Country of origin varies by order and specification.</p></div>
        <div class="feature-card"><h3>Non-manufacturer</h3><p>Independent procurement and price negotiation. Manufacturer warranties pass through to the buyer.</p></div>
        <div class="feature-card"><h3>Logistics managed</h3><p>Air or sea freight, customs, insurance, certification, and site delivery coordinated end-to-end.</p></div>
        <div class="feature-card"><h3>UL & testing</h3><p>UL where required. Routine, type, and short-circuit testing with remote FAT witnessing.</p></div>
      </div>
    </div>
  </section>

  <section class="section section-elevated" id="transformers">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow accent">Product range</p>
          <h2 class="section-title">Transformers & reactors</h2>
          <p class="lede">Custom-engineered units sourced through our manufacturing network and delivered to your site—up to 1,250 MVA / 765 kV.</p>
        </div>
        <a class="btn btn-outline" href="transformers/">View all products</a>
      </div>
      <div class="cat-grid">${catCards}</div>
    </div>
  </section>

  <section class="section" id="how-we-work">
    <div class="container">
      <p class="eyebrow accent">How to engage</p>
      <h2 class="section-title">Four steps from request to site delivery</h2>
      <p class="lede">Starting a procurement conversation is straightforward. Provide your project specs and we take it from there.</p>
      <ol class="steps">
        <li><span class="step-n">01</span><h3>Submit an RFP</h3><p>Include transformer type, capacity (MVA), primary and secondary voltage (kV), application, installation environment, and required delivery date.</p></li>
        <li><span class="step-n">02</span><h3>Availability & quote</h3><p>We assess production availability and lead times across our manufacturing network and return a formal quote.</p></li>
        <li><span class="step-n">03</span><h3>MSA & production</h3><p>Upon agreement, we execute a single MSA and coordinate production, certification, and logistics.</p></li>
        <li><span class="step-n">04</span><h3>Delivery & support</h3><p>Shipment is tracked to your site. Post-delivery support is available for commissioning, maintenance, and parts.</p></li>
      </ol>
    </div>
  </section>

  <section class="section section-dark" id="applications">
    <div class="container">
      <p class="eyebrow accent">Applications we serve</p>
      <h2 class="section-title on-dark">Utility, industrial, and commercial power</h2>
      <p class="lede on-dark">Our sourcing network supports transformer requirements across a broad range of applications and industries.</p>
      <div class="app-grid">
        <div class="app-card">
          <h3>Commercial & industrial</h3>
          <ul>
            <li>Manufacturing facilities</li>
            <li>Data centers and high buildings</li>
            <li>Real estate and development portfolios</li>
            <li>EV charging infrastructure</li>
            <li>Oil, gas, and petrochemical</li>
          </ul>
        </div>
        <div class="app-card">
          <h3>Utility & grid infrastructure</h3>
          <ul>
            <li>Substation replacements</li>
            <li>Transmission upgrades</li>
            <li>Renewable energy integration</li>
            <li>Industrial power plants</li>
            <li>Railway and traction systems</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="quality">
    <div class="container">
      <div class="split">
        <div>
          <p class="eyebrow accent">Quality & compliance</p>
          <h2 class="section-title">Tested to international standards</h2>
          <p>Units sourced through Energy Plus are manufactured and tested in compliance with recognized international standards. All routine testing, type testing, and special testing is performed prior to delivery.</p>
        </div>
        <dl class="spec-grid">
          <div><dt>Standards</dt><dd>IEC, IEEE, GOST, NEMA</dd></div>
          <div><dt>Quality</dt><dd>ISO 9001 certified manufacturing</dd></div>
          <div><dt>Safety</dt><dd>OHSAS 18001 compliant facilities</dd></div>
          <div><dt>Short-circuit</dt><dd>KEMA, CESI, or equivalent labs</dd></div>
          <div><dt>FAT</dt><dd>Live remote witness available</dd></div>
          <div><dt>Lab capacity</dt><dd>Up to 1,250 MVA / 765 kV</dd></div>
        </dl>
      </div>
      <div class="table-wrap">
        <div class="table-head">
          <h3>Short-circuit type tested configurations</h3>
          <p>Independently tested at internationally accredited third-party laboratories</p>
        </div>
        <table>
          <thead><tr><th>Capacity</th><th>Voltage class</th><th>Configuration</th></tr></thead>
          <tbody>
            <tr><td>450 MVA</td><td>400 kV</td><td>Autotransformer</td></tr>
            <tr><td>250 MVA</td><td>400 kV</td><td>Autotransformer</td></tr>
            <tr><td>125 MVA</td><td>400 kV</td><td>Power Transformer</td></tr>
            <tr><td>100 MVA</td><td>154 kV</td><td>Power Transformer</td></tr>
            <tr><td>62.5 MVA</td><td>154 kV</td><td>Power Transformer</td></tr>
            <tr><td>25 MVA</td><td>33 kV</td><td>Power Transformer</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  ${quoteCta(depth)}
</main>
<div class="mobile-bar">
  ${phoneA("Text " + esc(PHONE), "contact-phone btn btn-accent")}
</div>
` +
    footer(depth)
  );
}

function catalogPage() {
  const depth = 1;
  const p = prefix(depth);
  const cards = categories
    .map(
      (c) => `
    <a class="cat-card" href="${p}${categoryPath(c.id)}">
      <div class="cat-card-img"><img src="${p}${c.image}" alt="" loading="lazy"></div>
      <div class="cat-card-body">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description)}</p>
        <span class="cat-card-meta">${c.itemCount} products →</span>
      </div>
    </a>`,
    )
    .join("\n");

  return (
    head({
      title: "Transformers & Reactors | Energy Plus",
      description:
        "Browse power, distribution, specialty transformers and reactors. Up to 1,250 MVA / 765 kV.",
      depth,
    }) +
    header(depth, "transformers") +
    `
<main id="main">
  <div class="page-hero">
    <div class="container">
      ${breadcrumb([{ label: "Home", href: "" }, { label: "Transformers" }], depth)}
      <h1>Transformers & reactors</h1>
      <p class="lede">Custom-engineered units through our manufacturing network. One agreement, quote to delivery.</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="cat-grid">${cards}</div>
    </div>
  </section>
  ${quoteCta(depth)}
</main>` +
    footer(depth)
  );
}

function categoryPage(cat) {
  const depth = 2;
  const p = prefix(depth);
  const items = products.filter((x) => x.categoryId === cat.id);
  const list = items
    .map(
      (prod) => `
    <a class="product-row" href="${p}${productPath(prod)}">
      <div>
        <h3>${esc(prod.name)}</h3>
        <p>${esc(prod.summary)}</p>
      </div>
      <div class="product-row-meta">
        <span><strong>Max capacity</strong> ${esc(prod.maxCapacity)}</span>
        <span><strong>Max voltage</strong> ${esc(prod.maxVoltage)}</span>
      </div>
    </a>`,
    )
    .join("\n");

  return (
    head({
      title: `${cat.name} | Energy Plus`,
      description: cat.description,
      depth,
    }) +
    header(depth, "transformers") +
    `
<main id="main">
  <div class="page-hero">
    <div class="container">
      ${breadcrumb(
        [
          { label: "Home", href: "" },
          { label: "Transformers", href: "transformers/" },
          { label: cat.name },
        ],
        depth,
      )}
      <h1>${esc(cat.name)}</h1>
      <p class="lede">${esc(cat.tagline)}</p>
    </div>
  </div>
  <section class="section">
    <div class="container catalog-layout">
      <div class="product-list">${list}</div>
      <aside class="side-card">
        <img src="${p}${cat.image}" alt="" class="side-card-img">
        <p class="eyebrow">${items.length} products in this line</p>
        <p>Need something outside this list? We source custom configurations to project specs.</p>
        <a class="btn btn-accent" href="${p}quote/">Request a quote</a>
        ${phoneA(esc(PHONE), "contact-phone btn btn-outline")}
      </aside>
    </div>
  </section>
  ${quoteCta(depth)}
</main>` +
    footer(depth)
  );
}

function productPage(prod, cat) {
  const depth = 3;
  const p = prefix(depth);
  const siblings = products.filter(
    (x) => x.categoryId === cat.id && x.id !== prod.id,
  );
  const apps = prod.applications.map((a) => esc(a)).join(" · ");
  const paras = prod.description.map((para) => `<p>${esc(para)}</p>`).join("\n");
  const related =
    siblings.length === 0
      ? ""
      : `<div class="side-card">
        <p class="eyebrow">Related products</p>
        <ul class="related-list">
          ${siblings.map((s) => `<li><a href="${p}${productPath(s)}">${esc(s.shortName)}</a></li>`).join("\n")}
        </ul>
      </div>`;

  return (
    head({
      title: `${prod.name} | Energy Plus`,
      description: prod.summary,
      depth,
    }) +
    header(depth, "transformers") +
    `
<main id="main">
  <div class="page-hero">
    <div class="container">
      ${breadcrumb(
        [
          { label: "Home", href: "" },
          { label: "Transformers", href: "transformers/" },
          { label: cat.name, href: categoryPath(cat.id) },
          { label: prod.shortName },
        ],
        depth,
      )}
      <h1>${esc(prod.name)}</h1>
    </div>
  </div>
  <article class="section section-tight">
    <div class="container product-layout">
      <div>
        <div class="apps-box">
          <p class="eyebrow accent">Applications</p>
          <p>${apps}</p>
        </div>
        <dl class="capacity-row">
          <div><dt>Max capacity</dt><dd>${esc(prod.maxCapacity)}</dd></div>
          <div><dt>Max voltage</dt><dd>${esc(prod.maxVoltage)}</dd></div>
        </dl>
        <div class="product-desc">
          <h2 class="eyebrow">Description</h2>
          ${paras}
        </div>
        <div class="callout">
          <h3>Quotation requirements</h3>
          <p>${esc(prod.quoteRequirements)} Our engineering and sales team will review your project requirements and provide a formal quotation, supported by technical assistance from quotation through delivery, commissioning, and after-sales support.</p>
        </div>
        <div class="product-cta">
          <p><strong>Text, email, or submit specs for a quote.</strong></p>
          <div class="cta-actions">
            ${phoneA(esc(PHONE), "contact-phone btn btn-accent")}
            ${emailA(esc(EMAIL), "contact-email btn btn-outline")}
            <a class="btn btn-outline" href="${p}quote/?product=${encodeURIComponent(prod.name)}">Submit specs online</a>
          </div>
        </div>
      </div>
      <aside>
        <div class="side-card">
          <img src="${p}${cat.image}" alt="" class="side-card-img">
          <p class="eyebrow">Product line</p>
          <a class="side-link" href="${p}${categoryPath(cat.id)}">${esc(cat.name)}</a>
        </div>
        ${related}
      </aside>
    </div>
  </article>
</main>` +
    footer(depth)
  );
}

function quotePage() {
  const depth = 1;
  const options = categories
    .map((c) => {
      const opts = products
        .filter((x) => x.categoryId === c.id)
        .map((prod) => `<option value="${esc(prod.name)}">${esc(prod.name)}</option>`)
        .join("\n");
      return `<optgroup label="${esc(c.name)}">${opts}</optgroup>`;
    })
    .join("\n");

  return (
    head({
      title: "Request a Quote | Energy Plus",
      description: `Submit transformer specifications for a formal quote. Call ${PHONE} or email ${EMAIL}.`,
      depth,
    }) +
    header(depth, "quote") +
    `
<main id="main">
  <div class="page-hero">
    <div class="container">
      ${breadcrumb([{ label: "Home", href: "" }, { label: "Request a Quote" }], depth)}
      <h1>Request a quote</h1>
      <p class="lede">Include transformer type, rated capacity, voltages, cooling class, installation environment, standards, and required delivery date.</p>
    </div>
  </div>
  <section class="section">
    <div class="container quote-layout">
      <form class="quote-form" id="quote-form">
        <h2>Project & contact details</h2>
        <div class="form-grid">
          <label>Full name *<input name="name" required autocomplete="name"></label>
          <label>Company *<input name="company" required autocomplete="organization"></label>
          <label>Email *<input type="email" name="email" required autocomplete="email"></label>
          <label>Phone<input type="tel" name="phone" autocomplete="tel"></label>
        </div>
        <h2>Transformer specifications</h2>
        <div class="form-grid">
          <label class="full">Product / type *
            <select name="product" id="product-select" required>
              <option value="">Select a product type…</option>
              ${options}
              <option value="Other / custom">Other / custom</option>
            </select>
          </label>
          <label>Capacity (MVA / kVA / MVAr)<input name="capacity" placeholder="e.g. 40 MVA"></label>
          <label>Required delivery<input name="delivery" placeholder="e.g. Q2 2027"></label>
          <label>Primary voltage (kV)<input name="primary"></label>
          <label>Secondary voltage (kV)<input name="secondary"></label>
          <label class="full">Application / installation<input name="application" placeholder="e.g. Utility substation, data center"></label>
          <label class="full">Additional notes<textarea name="notes" rows="4" placeholder="Cooling class, standards, vector group, impedance, special testing…"></textarea></label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-accent btn-lg">Submit request</button>
          <p class="form-note">Sends securely via Formspree to ${esc(EMAIL)}. No email app required. Independent procurement service. Not a manufacturer.</p>
          <div id="form-status" class="form-status" hidden></div>
        </div>
      </form>
      <aside class="side-card sticky">
        <h3>Prefer to call or email?</h3>
        <p>Speak with our team about your project timeline and specs.</p>
        ${phoneA(esc(PHONE), "contact-phone btn btn-primary")}
        ${emailA(esc(EMAIL), "contact-email btn btn-outline")}
        <hr>
        <h3>What to include</h3>
        <ul class="check-list">
          <li>Transformer or reactor type</li>
          <li>Rated capacity (MVA / kVA / MVAr)</li>
          <li>Primary & secondary voltages</li>
          <li>Cooling class & standards</li>
          <li>Installation environment</li>
          <li>Required delivery date</li>
        </ul>
      </aside>
    </div>
  </section>
</main>` +
    footer(depth)
  );
}

const CSS = readFileSync(join(ROOT, "scripts/static-styles.css"), "utf8");
const JS = readFileSync(join(ROOT, "scripts/static-site.js"), "utf8");

console.log("Generating static site →", OUT);
mkdirSync(join(OUT, "assets/css"), { recursive: true });
mkdirSync(join(OUT, "assets/js"), { recursive: true });
mkdirSync(join(OUT, "assets/img"), { recursive: true });

const imgSrc = join(ROOT, "public/images");
if (existsSync(imgSrc)) {
  cpSync(imgSrc, join(OUT, "assets/img"), { recursive: true });
}
const fav = join(OUT, "assets/img/logo-icon.png");
if (existsSync(fav)) {
  cpSync(fav, join(OUT, "assets/img/favicon.png"));
}

writeFileSync(join(OUT, "assets/css/styles.css"), CSS);
writeFileSync(join(OUT, "assets/js/site.js"), JS);
writeFileSync(join(OUT, ".nojekyll"), "");
writeFileSync(
  join(OUT, "README.md"),
  `# Energy Plus — Transformer Procurement

Static site for GitHub Pages.

**Live:** https://danknowsaguy-web.github.io/transformers/

## Contact

- Phone: 864-777-0688
- Email: dan@yourenergyplus.com
- Web: YourEnergyPlus.com

## Local preview

\`\`\`bash
python3 -m http.server 8080
\`\`\`

## Update content

Edit \`scripts/site-data.json\`, then:

\`\`\`bash
node scripts/generate-static-site.mjs
# copy static-export/* to site root and push
\`\`\`
`,
);

write("index.html", homePage());
write("transformers/index.html", catalogPage());
write("quote/index.html", quotePage());

for (const cat of categories) {
  write(`transformers/${cat.id}/index.html`, categoryPage(cat));
  for (const prod of products.filter((x) => x.categoryId === cat.id)) {
    write(
      `transformers/${cat.id}/${prod.id}/index.html`,
      productPage(prod, cat),
    );
  }
}

write(
  "404.html",
  head({
    title: "Page not found | Energy Plus",
    description: "Page not found",
    depth: 0,
  }) +
    header(0) +
    `<main id="main" class="section"><div class="container" style="text-align:center">
      <h1 class="section-title">Page not found</h1>
      <p class="lede" style="margin-inline:auto">That page is not in our catalog.</p>
      <a class="btn btn-outline" href="transformers/">Browse transformers</a>
    </div></main>` +
    footer(0),
);

console.log("Done.");
