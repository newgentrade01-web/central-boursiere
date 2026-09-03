import { Link } from "react-router-dom";

const LICENCES = [
  {
    name: "FCA",
    full: "Financial Conduct Authority",
    flag: "🇬🇧",
    country: "Royaume-Uni",
    color: "#0B4D2E",
    delay: "6 semaines",
    cost: "À partir de $1,000",
    level: "Niveau 3 — Haute protection",
    desc: "L'agrément FCA est la référence mondiale en matière de régulation financière. Il permet d'exercer des activités de gestion de fonds, de trading pour compte de tiers et de conseil en investissement sur le marché britannique et dans 27 pays européens via le passeport MiFID.",
    steps: ["Dépôt de la demande en ligne sur le registre FCA", "Vérification des dirigeants (Fit & Proper test)", "Business plan et structure de capital", "Politiques KYC/AML conformes", "Examen par le département de supervision FCA", "Notification d'autorisation (6–8 semaines)"],
    docs: ["Passeport ou carte nationale d'identité", "Casier judiciaire vierge (tous les dirigeants)", "Business plan détaillé (5 ans)", "Structure actionnariat et organigramme", "Preuves de fonds propres (capital minimum £50,000)", "Politiques et procédures KYC/AML rédigées"],
  },
  {
    name: "AMF",
    full: "Autorité des Marchés Financiers",
    flag: "🇫🇷",
    country: "France",
    color: "#10C96A",
    delay: "8 semaines",
    cost: "À partir de $1,200",
    level: "Niveau 3 — Haute protection",
    desc: "L'AMF est le régulateur des marchés financiers français. L'agrément AMF permet l'exercice de services d'investissement en France et dans l'UE. Obligatoire pour tout PSAN (Prestataire de Services sur Actifs Numériques) et gérant de fonds.",
    steps: ["Enregistrement comme PSAN (optionnel) ou demande d'agrément PSI", "Vérification honorabilité et compétence des dirigeants", "Constitution du dossier réglementaire complet", "Examen par le département agrément AMF", "Instruction et retours éventuels (4-6 semaines)", "Délivrance de l'agrément"],
    docs: ["Pièce d'identité tous les dirigeants", "Curriculum vitae et diplômes", "Business plan et plan financier 3 ans", "Attestation de capital (min. €125,000)", "Manuel de procédures LCB-FT", "Plan de continuité d'activité"],
  },
  {
    name: "CySEC",
    full: "Cyprus Securities and Exchange Commission",
    flag: "🇨🇾",
    country: "Chypre / Union Européenne",
    color: "#1a7a45",
    delay: "10 semaines",
    cost: "À partir de $900",
    level: "Niveau 2 — Protection européenne",
    desc: "La licence CySEC est la passerelle vers tous les marchés européens via MiFID II. Particulièrement prisée pour sa fiscalité avantageuse, elle offre un passeport valable dans les 27 pays de l'Union Européenne. Chypre est le hub réglementaire de nombreux grands courtiers mondiaux.",
    steps: ["Création d'une entité juridique à Chypre (CIF)", "Dépôt de la demande CIF/CySEC avec dossier complet", "Nomination d'un compliance officer local agréé", "Vérification des dirigeants par CySEC", "Examen du business plan et des procédures", "Délivrance de la licence (10-14 semaines)"],
    docs: ["Documents d'identité et de résidence", "Preuve d'expertise financière des dirigeants", "Business plan détaillé + modèle économique", "Capital minimum €200,000 (Catégorie 3)", "Accord de bureau enregistré à Chypre", "Procédures de gestion des risques"],
  },
  {
    name: "MiFID II",
    full: "Markets in Financial Instruments Directive II",
    flag: "🇪🇺",
    country: "Union Européenne",
    color: "#2a9a5a",
    delay: "Inclus avec FCA/AMF/CySEC",
    cost: "Inclus dans les licences UE",
    level: "Cadre réglementaire européen",
    desc: "MiFID II n'est pas une licence autonome mais le cadre réglementaire européen harmonisé. Toute entreprise d'investissement agréée par un régulateur européen (AMF, CySEC, BaFin…) bénéficie automatiquement du passeport MiFID II pour exercer dans toute l'UE.",
    steps: ["Obtenir une licence nationale (AMF, CySEC, BaFin, etc.)", "Notification des services passeportés auprès de l'ESMA", "Enregistrement dans les pays cibles", "Respect continu des obligations de reporting MiFID II", "Déclaration des transactions (EMIR, SFTR)", "Évaluations périodiques conformité"],
    docs: ["Licence nationale d'un État membre UE", "Formulaire de notification ESMA", "Politique d'exécution des ordres (Best Execution)", "Politique de gestion des conflits d'intérêts", "Rapport suitability/appropriateness"],
  },
  {
    name: "FINRA",
    full: "Financial Industry Regulatory Authority",
    flag: "🇺🇸",
    country: "États-Unis",
    color: "#0B4D2E",
    delay: "12 semaines",
    cost: "À partir de $2,500",
    level: "Niveau 3 — Marché américain",
    desc: "FINRA est l'organisme d'autorégulation américain des courtiers en valeurs mobilières. L'enregistrement FINRA est obligatoire pour accéder aux marchés boursiers américains (NYSE, Nasdaq). Il permet d'exercer en tant que broker-dealer sur le plus grand marché financier du monde.",
    steps: ["Enregistrement de l'entité auprès de FINRA via Web CRD", "Passage des examens Series 7, 63, 65 pour les représentants", "Vérification background check complet", "Dépôt de la Form BD auprès de la SEC", "Examen par le département New Member Application", "Attribution du numéro CRD"],
    docs: ["Form BD complète pour la SEC", "Form U4 pour chaque représentant enregistré", "Résultats des examens Series 7/63/65", "Plan de continuité des activités (BCP)", "Capital minimum nette ($250,000 minimum)", "Politique de supervision et de conformité"],
  },
  {
    name: "SEC",
    full: "Securities and Exchange Commission",
    flag: "🇺🇸",
    country: "États-Unis",
    color: "#10C96A",
    delay: "16 semaines",
    cost: "À partir de $3,000",
    level: "Niveau 3 — Gestionnaire d'actifs US",
    desc: "L'enregistrement auprès de la SEC en tant qu'Investment Adviser est obligatoire pour les gestionnaires gérant plus de $100M d'actifs américains. Elle offre l'accès au plus grand bassin d'investisseurs institutionnels mondial et est une condition sine qua non pour lever des fonds aux États-Unis.",
    steps: ["Enregistrement sur IARD (Investment Adviser Registration Depot)", "Dépôt de Form ADV Part 1, 2A, 2B", "Nomination d'un Chief Compliance Officer", "Adoption d'un Code d'Éthique et politiques de conformité", "Examen par la Division of Investment Management", "Enregistrement effectif (120 jours)"],
    docs: ["Form ADV Parts 1 & 2 complètes", "Code d'éthique et politique anti-fraude", "Procédures de testing de conformité annuelles", "Contrats types de conseil en investissement", "Preuves de qualification CFA ou équivalent", "Accords de custody arrangements"],
  },
];

const CERTS = [
  { name: "Certificat Trading Niveau 1", desc: "Bases du trading, analyse technique, gestion du risque. Reconnu par les régulateurs européens.", duration: "2 semaines", price: "$250", badge: "Débutant" },
  { name: "Certificat Trading Niveau 2", desc: "Trading avancé, produits dérivés, stratégies quantitatives, réglementation MiFID II.", duration: "4 semaines", price: "$500", badge: "Intermédiaire" },
  { name: "Certificat Trading Niveau 3", desc: "Gestion de portefeuille institutionnel, macroéconomie, trading algorithmique, compliance.", duration: "8 semaines", price: "$1,000", badge: "Expert" },
  { name: "Partenaire CFA Institute", desc: "Programme préparatoire officiel aux examens CFA Level I, II, III. 200+ heures de cours.", duration: "6 mois", price: "$2,500", badge: "CFA Partner" },
];

const INSURANCE = [
  { name: "Couverture Essentielle", limit: "$500,000", assets: "BTC · ETH · stablecoins", premium: "0.8% / an", provider: "Lloyd's syndicates" },
  { name: "Couverture Standard", limit: "$2,000,000", assets: "Tous crypto-actifs majeurs", premium: "0.6% / an", provider: "Lloyd's of London" },
  { name: "Couverture Institutionnelle", limit: "$10,000,000", assets: "Tous actifs digitaux + NFT + DeFi", premium: "0.4% / an", provider: "Lloyd's of London · Beazley" },
];

export default function Licences() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Hero */}
      <div
        className="py-20 px-4 text-center relative"
        style={{ background: "linear-gradient(180deg, rgba(11,77,46,0.05) 0%, transparent 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 80% at 50% 20%, rgba(16,201,106,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,201,106,0.12)", color: "#0B4D2E" }}>
            Licences Boursières · Certifications · Assurances
          </span>
          <h1
            className="mt-4 mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4.5vw,54px)", fontWeight: 700, color: "#0A1F12", lineHeight: 1.15 }}
          >
            Obtenez Votre Licence<br />
            <span style={{ color: "#0B4D2E" }}>Boursière Officielle</span>
          </h1>
          <p style={{ fontSize: 16, color: "#4a6b52", lineHeight: 1.7, marginBottom: 28 }}>
            Central Boursière vous accompagne dans l'obtention des licences FCA, AMF, CySEC, FINRA et SEC. Délégation complète du processus, de la demande jusqu'à l'agrément officiel.
          </p>
          <Link to="/register" className="btn-primary px-6 py-3 rounded-xl inline-block text-base">
            Commencer ma procédure →
          </Link>
        </div>
      </div>

      {/* Licences */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="mb-10 text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: "#0A1F12" }}>
          Nos Licences & Accréditations
        </h2>
        <div className="space-y-8">
          {LICENCES.map((l) => (
            <div key={l.name} className="glass-card card-hover rounded-2xl overflow-hidden" style={{ background: "#F8FBF9" }}>
              <div className="flex flex-col lg:flex-row">
                {/* Left accent */}
                <div className="w-full lg:w-72 p-6 flex flex-col justify-between" style={{ background: l.color, position: "relative", overflow: "hidden" }}>
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                  />
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{l.flag}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "#fff" }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{l.full}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{l.country}</div>
                  </div>
                  <div className="relative z-10 mt-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>⏱</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{l.delay}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>💰</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{l.cost}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>🛡</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{l.level}</span>
                    </div>
                  </div>
                </div>
                {/* Right content */}
                <div className="flex-1 p-6">
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "#4a6b52", marginBottom: 16 }}>{l.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: 13, color: "#0A1F12", marginBottom: 8 }}>Processus d'obtention</h4>
                      <ol className="space-y-1.5">
                        {l.steps.map((s, i) => (
                          <li key={i} className="flex items-start gap-2" style={{ fontSize: 12, color: "#4a6b52" }}>
                            <span style={{ color: "#10C96A", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: 13, color: "#0A1F12", marginBottom: 8 }}>Documents requis</h4>
                      <ul className="space-y-1.5">
                        {l.docs.map((d, i) => (
                          <li key={i} className="flex items-start gap-2" style={{ fontSize: 12, color: "#4a6b52" }}>
                            <span style={{ color: "#10C96A", flexShrink: 0 }}>✓</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="mt-5 inline-block btn-primary px-5 py-2 rounded-xl text-sm"
                  >
                    Commencer la procédure {l.name} →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-4" style={{ background: "rgba(11,77,46,0.03)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-10 text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: "#0A1F12" }}>
            Tableau Comparatif
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full glass-card rounded-2xl overflow-hidden" style={{ fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#0B4D2E" }}>
                  {["Licence", "Pays / Zone", "Délai", "Capital min.", "Passeport EU", "Marchés accessibles"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "FCA", zone: "🇬🇧 UK", delay: "6 sem.", capital: "£50,000", eu: "✓ Oui", markets: "UK · EU · Global" },
                  { name: "AMF", zone: "🇫🇷 France", delay: "8 sem.", capital: "€125,000", eu: "✓ Oui", markets: "France · EU" },
                  { name: "CySEC", zone: "🇨🇾 EU", delay: "10 sem.", capital: "€200,000", eu: "✓ Oui", markets: "EU · 27 pays" },
                  { name: "MiFID II", zone: "🇪🇺 EU", delay: "Inclus", capital: "Variable", eu: "✓ Inclus", markets: "EU complet" },
                  { name: "FINRA", zone: "🇺🇸 USA", delay: "12 sem.", capital: "$250,000", eu: "✗ Non", markets: "NYSE · Nasdaq" },
                  { name: "SEC", zone: "🇺🇸 USA", delay: "16 sem.", capital: "$100M AUM", eu: "✗ Non", markets: "USA complet" },
                ].map((r, i) => (
                  <tr key={r.name} style={{ borderTop: "1px solid rgba(11,77,46,0.08)", background: i % 2 === 0 ? "#F8FBF9" : "#fff" }}>
                    <td className="px-4 py-3 font-bold" style={{ color: "#0B4D2E" }}>{r.name}</td>
                    <td className="px-4 py-3" style={{ color: "#0A1F12" }}>{r.zone}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "#6b8a72" }}>{r.delay}</td>
                    <td className="px-4 py-3" style={{ fontFamily: "var(--font-mono)", color: "#6b8a72" }}>{r.capital}</td>
                    <td className="px-4 py-3" style={{ color: r.eu.includes("✓") ? "#10C96A" : "#ff6b6b", fontWeight: 700 }}>{r.eu}</td>
                    <td className="px-4 py-3" style={{ color: "#0A1F12" }}>{r.markets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="mb-10 text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: "#0A1F12" }}>
          Certificats de Trading
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CERTS.map((c) => (
            <div key={c.name} className="glass-card card-hover rounded-2xl p-5 flex flex-col" style={{ background: "#F8FBF9" }}>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold self-start mb-3" style={{ background: "rgba(16,201,106,0.12)", color: "#0B4D2E" }}>{c.badge}</span>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "#0A1F12", marginBottom: 8, lineHeight: 1.3 }}>{c.name}</h3>
              <p style={{ fontSize: 12, color: "#4a6b52", lineHeight: 1.6, flex: 1 }}>{c.desc}</p>
              <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(11,77,46,0.1)" }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 11, color: "#6b8a72" }}>⏱ {c.duration}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0B4D2E" }}>{c.price}</span>
                </div>
                <Link to="/register" className="btn-primary block text-center py-2 rounded-lg text-xs mt-3">S'inscrire →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insurance */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <h2 className="mb-4 text-center" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", fontWeight: 700, color: "#0A1F12" }}>
          Assurance Actifs Digitaux
        </h2>
        <p className="text-center mb-10" style={{ color: "#6b8a72", fontSize: 14 }}>
          En partenariat exclusif avec Lloyd's of London · Couverture institutionnelle pour vos crypto-actifs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {INSURANCE.map((ins) => (
            <div key={ins.name} className="glass-card card-hover rounded-2xl p-6 flex flex-col" style={{ background: "#F8FBF9" }}>
              <div className="text-3xl mb-3">🛡️</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#0A1F12", marginBottom: 12 }}>{ins.name}</h3>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: "#0B4D2E", marginBottom: 12 }}>{ins.limit}</div>
              <ul className="space-y-2 flex-1">
                <li style={{ fontSize: 13, color: "#4a6b52" }}>📦 Actifs : {ins.assets}</li>
                <li style={{ fontSize: 13, color: "#4a6b52" }}>💰 Prime : {ins.premium}</li>
                <li style={{ fontSize: 13, color: "#4a6b52" }}>🏛 Assureur : {ins.provider}</li>
              </ul>
              <Link to="/register" className="btn-outline block text-center py-2.5 rounded-xl text-sm mt-4">
                Souscrire →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 px-4 text-center"
        style={{ background: "#0B4D2E", backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      >
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3.5vw,42px)", fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          Prêt à Démarrer Votre Procédure ?
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 28, fontSize: 15 }}>
          Nos experts vous accompagnent de A à Z pour l'obtention de votre licence boursière.
        </p>
        <Link to="/register" className="inline-block px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-105" style={{ background: "#10C96A", color: "#0A1F12" }}>
          Commencer ma Procédure →
        </Link>
      </section>
    </div>
  );
}
