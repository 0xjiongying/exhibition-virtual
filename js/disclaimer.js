// Disclaimer content + panel helpers — museum product layer.
// Copy is structured for readability; wording stays informational, not legal advice.

/** @typedef {{ hackathon?: boolean, openSource?: boolean, portfolio?: boolean, externalServices?: boolean, testnet?: boolean, mainnet?: boolean }} DisclaimerFlags */

/**
 * Resolve which conditional blocks apply.
 * Prefer explicit flags from exhibition.json; fall back to chain / repo signals.
 * @param {object} exhibition
 * @returns {DisclaimerFlags}
 */
export function resolveDisclaimerFlags(exhibition = {}) {
  const explicit = exhibition.disclaimer || {};
  const chainName = String(exhibition.chain?.name || '').toLowerCase();
  return {
    hackathon: explicit.hackathon ?? true,
    openSource: explicit.openSource ?? !!exhibition.github,
    portfolio: explicit.portfolio ?? false,
    externalServices: explicit.externalServices ?? true,
    testnet: explicit.testnet ?? (chainName.includes('testnet') || Number(exhibition.chain?.chainId) === 10143),
    mainnet: explicit.mainnet ?? false,
  };
}

/**
 * Build ordered sections for the disclaimer panel.
 * Each section has a short heading and one or more concise paragraphs.
 * @param {DisclaimerFlags} flags
 * @returns {{ id: string, title: string, paragraphs: string[] }[]}
 */
export function buildDisclaimerSections(flags = {}) {
  const sections = [
    {
      id: 'purpose',
      title: 'About this project',
      paragraphs: [
        'This project is an independent community-created educational and demonstration project intended to help users learn, explore, and better understand the technologies, concepts, products, and ecosystems presented throughout this website.',
      ],
    },
    {
      id: 'affiliation',
      title: 'Independence',
      paragraphs: [
        'Unless explicitly stated otherwise, this project is not affiliated with, endorsed by, sponsored by, maintained by, or officially associated with any protocol, foundation, company, organization, government agency, product, service, or trademark referenced on this website.',
      ],
    },
    {
      id: 'ip',
      title: 'Names & trademarks',
      paragraphs: [
        'References to third-party names, trademarks, logos, products, or services are used solely for identification, educational, informational, commentary, interoperability, or compatibility purposes. All intellectual property rights remain with their respective owners.',
      ],
    },
    {
      id: 'accuracy',
      title: 'Information quality',
      paragraphs: [
        'The content provided on this website is published in good faith for educational and informational purposes only. While reasonable efforts may be made to keep information accurate and up to date, no guarantee or representation is made regarding its completeness, accuracy, reliability, availability, suitability, or timeliness.',
      ],
    },
    {
      id: 'no-advice',
      title: 'Not advice',
      paragraphs: [
        'Nothing on this website constitutes financial, investment, trading, legal, tax, accounting, engineering, cybersecurity, professional, or other regulated advice.',
      ],
    },
    {
      id: 'responsibility',
      title: 'Your responsibility',
      paragraphs: [
        'Users remain solely responsible for independently evaluating information and consulting official documentation or qualified professionals where appropriate before making decisions or interacting with software, blockchain networks, wallets, APIs, smart contracts, digital assets, or third-party services.',
      ],
    },
    {
      id: 'risks',
      title: 'Risks',
      paragraphs: [
        'Participation in blockchain ecosystems, decentralized networks, and experimental technologies involves technical, operational, financial, security, regulatory, and market risks. Users interact entirely at their own discretion and responsibility.',
      ],
    },
    {
      id: 'changes',
      title: 'Changes without notice',
      paragraphs: [
        'Information, documentation, software behavior, network parameters, and referenced services may change without prior notice.',
      ],
    },
    {
      id: 'lawful-use',
      title: 'Lawful use',
      paragraphs: [
        'Nothing contained within this project should be interpreted as encouraging unlawful activity, regulatory evasion, fraud, market manipulation, sanctions violations, money laundering, or any other prohibited conduct.',
        'Users are responsible for ensuring that their use of this website and any referenced technologies complies with the laws and regulations applicable within their own jurisdiction.',
      ],
    },
    {
      id: 'relationship',
      title: 'No professional relationship',
      paragraphs: [
        'Accessing or using this website does not create any contractual, fiduciary, advisory, employment, agency, partnership, or professional relationship between users and the contributors of this project.',
      ],
    },
    {
      id: 'ai',
      title: 'AI-assisted content',
      paragraphs: [
        'Where artificial intelligence assists in generating content, users should independently verify important information before relying upon it.',
      ],
    },
  ];

  /** Context-specific notes — only when the project actually fits that category. */
  const contextParas = [];
  if (flags.hackathon) {
    contextParas.push(
      'This project was developed as a hackathon prototype intended to demonstrate ideas, technical capabilities, and product concepts. Some features may be experimental, incomplete, or unsuitable for production use.',
    );
  }
  if (flags.openSource) {
    contextParas.push(
      'This project is independently maintained by the community. Contributions, issue reports, and suggestions are welcome.',
    );
  }
  if (flags.portfolio) {
    contextParas.push(
      'This project is intended to demonstrate technical implementation, product thinking, and software engineering capabilities.',
    );
  }
  if (flags.externalServices) {
    contextParas.push(
      'Third-party websites, APIs, documentation, wallets, smart contracts, infrastructure providers, and other external services operate independently and remain subject to their own terms, privacy policies, security practices, and availability.',
    );
  }
  if (flags.testnet) {
    contextParas.push(
      'This project may interact with blockchain test networks. Testnet assets generally have no monetary value and functionality may change without notice.',
    );
  }
  if (flags.mainnet) {
    contextParas.push(
      'Users should carefully verify wallet addresses, network configuration, transaction details, permissions, and applicable fees before interacting with production blockchain networks.',
    );
  }

  if (contextParas.length) {
    sections.push({
      id: 'context',
      title: 'About this build',
      paragraphs: contextParas,
    });
  }

  sections.push({
    id: 'dyor',
    title: 'Do your own research',
    paragraphs: ['Always conduct your own research (DYOR).'],
  });

  return sections;
}

/**
 * Render sections into a container using DOM APIs (no raw HTML injection).
 * @param {HTMLElement} container
 * @param {ReturnType<typeof buildDisclaimerSections>} sections
 */
export function renderDisclaimerSections(container, sections) {
  if (!container) return;
  container.replaceChildren();

  for (const section of sections) {
    const block = document.createElement('section');
    block.className = 'mp-block mp-disclaimer-section';
    block.setAttribute('aria-labelledby', `disclaimer-${section.id}`);

    const heading = document.createElement('h4');
    heading.id = `disclaimer-${section.id}`;
    heading.textContent = section.title;
    block.appendChild(heading);

    for (const text of section.paragraphs) {
      const p = document.createElement('p');
      p.className = section.id === 'dyor' ? 'mp-body mp-disclaimer-dyor' : 'mp-body';
      p.textContent = text;
      block.appendChild(p);
    }

    container.appendChild(block);
  }
}

/**
 * Fill the mounted disclaimer panel from exhibition data.
 * @param {object} exhibition
 */
export function populateDisclaimer(exhibition = {}) {
  const body = document.getElementById('disclaimerBody');
  if (!body) return;
  const flags = resolveDisclaimerFlags(exhibition);
  renderDisclaimerSections(body, buildDisclaimerSections(flags));
}

/**
 * Markup for the disclaimer dialog — mounted once with other product panels.
 */
export function disclaimerPanelMarkup() {
  return `
    <aside id="panelDisclaimer" class="mp-panel mp-panel-legal" role="dialog" aria-modal="true" aria-labelledby="disclaimerTitle" hidden>
      <header class="mp-panel-h">
        <h3 id="disclaimerTitle">Disclaimer</h3>
        <button type="button" class="mp-close" data-close="panelDisclaimer" aria-label="Close disclaimer">×</button>
      </header>
      <p class="mp-muted">Plain-language notices about this educational demonstration. This is not legal advice.</p>
      <div id="disclaimerBody" class="mp-disclaimer"></div>
    </aside>
  `;
}

/**
 * Markup fragment for the footer disclaimer control (extends existing footer).
 */
export function disclaimerFooterControlMarkup() {
  return `
    <button type="button" id="btnDisclaimer" class="mp-footer-link" aria-expanded="false" aria-controls="panelDisclaimer">Disclaimer</button>
  `;
}
