/**
 * InsectDraw: Micro-Entomological Anatomy Vector Synthesis Engine
 * Version: 2.0.0 (Enriched Natural History Museum Edition)
 * Design System: Swiss-Archival Standard (19th-Century Cabinet-of-Curiosities Field Study)
 * Seal Chop: 虫豸典藏 (Chóng Zhì Diǎn Cáng · Insect Archival Collection)
 * Scale: 5mm Micro-Metric Caliper Rule (SCALE 10:1)
 * Author: Azzar Budiyanto
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.InsectDraw = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // --- 1. Deterministic PRNG & Hashing Utilities ---
  function fnv1a(str) {
    var FNV_PRIME = 0x01000193;
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, FNV_PRIME);
    }
    return hash >>> 0;
  }

  function Mulberry32(seed) {
    return function () {
      var t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Base32 crockford-esque
  function encodeBase32(val, len) {
    var res = "";
    val = val >>> 0;
    for (var i = 0; i < len; i++) {
      res = ALPHABET[val % 32] + res;
      val = Math.floor(val / 32);
    }
    return res;
  }

  function decodeBase32(str) {
    var val = 0;
    for (var i = 0; i < str.length; i++) {
      var idx = ALPHABET.indexOf(str[i].toUpperCase());
      if (idx === -1) idx = 0;
      val = val * 32 + idx;
    }
    return val >>> 0;
  }

  function generateSequenceIdentifier(hashVal, orderKey) {
    var prefix = "INV";
    var orderCode = orderKey === 'coleoptera' ? 'CO' : (orderKey === 'lepidoptera' ? 'LE' : 'OD');
    var high = (hashVal >>> 16) & 0xFFFF;
    var low = hashVal & 0xFFFF;
    var p1 = encodeBase32(high, 2);
    var p2 = encodeBase32(low, 4);
    return prefix + "-" + orderCode + "-" + p1 + p2;
  }

  function recoverHashFromId(identifier) {
    if (!identifier || typeof identifier !== 'string') return null;
    var parts = identifier.trim().toUpperCase().split('-');
    if (parts.length === 3 && parts[0] === 'INV') {
      var suffix = parts[2];
      if (suffix.length >= 6) {
        var high = decodeBase32(suffix.substring(0, 2));
        var low = decodeBase32(suffix.substring(2));
        return ((high << 16) | low) >>> 0;
      }
    }
    return null;
  }

  // --- 2. Authentic Occidental Hershey Simplex Vector Font Engine ---
  let hershey_raw = {
"501":"  9I[RFJ[ RRFZ[ RMTWT",
"502":" 24G\\KFK[ RKFTFWGXHYJYLXNWOTP RKPTPWQXRYTYWXYWZT[K[",
"503":" 19H]ZKYIWGUFQFOGMILKKNKSLVMXOZQ[U[WZYXZV",
"504":" 16G\\KFK[ RKFRFUGWIXKYNYSXVWXUZR[K[",
"505":" 12H[LFL[ RLFYF RLPTP RL[Y[",
"506":"  9HZLFL[ RLFYF RLPTP",
"507":" 23H]ZKYIWGUFQFOGMILKKNKSLVMXOZQ[U[WZYXZVZS RUSZS",
"508":"  9G]KFK[ RYFY[ RKPYP",
"509":"  3NVRFR[",
"510":" 11JZVFVVUYTZR[P[NZMYLVLT",
"511":"  9G\\KFK[ RYFKT RPOY[",
"512":"  6HYLFL[ RL[X[",
"513":" 12F^JFJ[ RJFR[ RZFR[ RZFZ[",
"514":"  9G]KFK[ RKFY[ RYFY[",
"515":" 22G]PFNGLIKKJNJSKVLXNZP[T[VZXXYVZSZNYKXIVGTFPF",
"516":" 14G\\KFK[ RKFTFWGXHYJYMXOWPTQKQ",
"517":" 25G]PFNGLIKKJNJSKVLXNZP[T[VZXXYVZSZNYKXIVGTFPF RSWY]",
"518":" 17G\\KFK[ RKFTFWGXHYJYLXNWOTPKP RRPY[",
"519":" 21H\\YIWGTFPFMGKIKKLMMNOOUQWRXSYUYXWZT[P[MZKX",
"520":"  6JZRFR[ RKFYF",
"521":" 11G]KFKULXNZQ[S[VZXXYUYF",
"522":"  6I[JFR[ RZFR[",
"523":" 12F^HFM[ RRFM[ RRFW[ R\\FW[",
"524":"  6H\\KFY[ RYFK[",
"525":"  7I[JFRPR[ RZFRP",
"526":"  9H\\YFK[ RKFYF RK[Y[",
"601":" 18I\\XMX[ RXPVNTMQMONMPLSLUMXOZQ[T[VZXX",
"602":" 18H[LFL[ RLPNNPMSMUNWPXSXUWXUZS[P[NZLX",
"603":" 15I[XPVNTMQMONMPLSLUMXOZQ[T[VZXX",
"604":" 18I\\XFX[ RXPVNTMQMONMPLSLUMXOZQ[T[VZXX",
"605":" 18I[LSXSXQWOVNTMQMONMPLSLUMXOZQ[T[VZXX",
"606":"  9MYWFUFSGRJR[ ROMVM",
"607":" 23I\\XMX]W`VaTbQbOa RXPVNTMQMONMPLSLUMXOZQ[T[VZXX",
"608":" 11I\\MFM[ RMQPNRMUMWNXQX[",
"609":"  9NVQFRGSFREQF RRMR[",
"610":" 12MWRFSGTFSERF RSMS^RaPbNb",
"611":"  9IZMFM[ RWMMW RQSX[",
"612":"  3NVRFR[",
"613":" 19CaGMG[ RGQJNLMOMQNRQR[ RRQUNWMZM\\N]Q][",
"614":" 11I\\MMM[ RMQPNRMUMWNXQX[",
"615":" 18I\\QMONMPLSLUMXOZQ[T[VZXXYUYSXPVNTMQM",
"616":" 18H[LMLb RLPNNPMSMUNWPXSXUWXUZS[P[NZLX",
"617":" 18I\\XMXb RXPVNTMQMONMPLSLUMXOZQ[T[VZXX",
"618":"  9KXOMO[ ROSPPRNTMWM",
"619":" 18J[XPWNTMQMNNMPNRPSUTWUXWXXWZT[Q[NZMX",
"620":"  9MYRFRWSZU[W[ ROMVM",
"621":" 11I\\MMMWNZP[S[UZXW RXMX[",
"622":"  6JZLMR[ RXMR[",
"623":" 12G]JMN[ RRMN[ RRMV[ RZMV[",
"624":"  6J[MMX[ RXMM[",
"625":" 10JZLMR[ RXMR[P_NaLbKb",
"626":"  9J[XMM[ RMMXM RM[X[",
"710":"  6MWRYQZR[SZRY",
};

let hershey_cache = {};

function compile_hershey(i){
  if (hershey_cache[i]){
    return hershey_cache[i];
  }
  var entry = hershey_raw[i];
  if (entry == null){
    return;
  }
  var ordR = 82;
  var bound= entry.substring(3,5);
  var xmin = bound.charCodeAt(0)-ordR;
  var xmax = bound.charCodeAt(1)-ordR;
  var content = entry.substring(5);
  var polylines = [[]];
  var j  = 0;
  while (j < content.length){
    var digit = content.substring(j,j+2);
    if (digit == " R"){
      polylines.push([]);
    }else{
      var x  = digit.charCodeAt(0)-ordR;
      var y  = digit.charCodeAt(1)-ordR;
      polylines[polylines.length-1].push([x,y]);
    }
    j+=2;
  }
  let data = {
    xmin:xmin,
    xmax:xmax,
    polylines:polylines,
  };
  hershey_cache[i] = data;
  return data;
}

  function trsl_poly(poly, tx, ty) {
    return poly.map(function(pt) { return [pt[0] + tx, pt[1] + ty]; });
  }

function put_text(txt){
  let base = 500;
  let x = 0;
  let o = [];
  for (let i = 0; i < txt.length; i++){
    let ord = txt.charCodeAt(i);
    let idx;
    if (65 <= ord && ord <= 90){
      idx = base+1+(ord-65);
    }else if (97 <= ord && ord <= 122){
      idx = base + 101+(ord-97);
    }else if (ord == 46){
      idx = 710;
    }else if (ord == 32){
      x += 10;
      continue;
    }else{
      continue;
    }
    let {xmin,xmax,polylines} = compile_hershey(idx);
    polylines = polylines.map(p=>trsl_poly(p,x-xmin,0));
    o.push(...polylines);
    x += (xmax-xmin);
  }
  return [x,o];
}

  function hersheyToSvgPaths(text, x, y, scale, shear) {
    shear = shear !== undefined ? shear : -0.22;
    var out = put_text(text);
    var polylines = out[1];
    var pathData = [];
    for (var i = 0; i < polylines.length; i++) {
      var pts = polylines[i];
      if (pts.length < 2) continue;
      var px0 = (pts[0][0] + pts[0][1] * shear) * scale + x;
      var py0 = pts[0][1] * scale + y;
      var d = "M " + px0.toFixed(2) + " " + py0.toFixed(2);
      for (var j = 1; j < pts.length; j++) {
        var px = (pts[j][0] + pts[j][1] * shear) * scale + x;
        var py = pts[j][1] * scale + y;
        d += " L " + px.toFixed(2) + " " + py.toFixed(2);
      }
      pathData.push(d);
    }
    return '<path d="' + pathData.join(" ") + '" fill="none" />';
  }
  // --- 3. Entomological Taxa Nomenclature ---
  var TAXA_COLEOPTERA = [
    { genus: "Dynastes", species: "hercules", common: "Hercules Rhinoceros Beetle", family: "Scarabaeidae", morphology: "horned_dynastes" },
    { genus: "Lucanus", species: "cervus", common: "European Stag Beetle", family: "Lucanidae", morphology: "stag_lucanus" },
    { genus: "Titanus", species: "giganteus", common: "Titan Longhorn Beetle", family: "Cerambycidae", morphology: "longhorn_cerambyx" },
    { genus: "Chrysina", species: "resplendens", common: "Resplendent Jewel Scarab", family: "Rutelinae", morphology: "scarab_jewel" },
    { genus: "Goliathus", species: "regius", common: "Royal Goliath Beetle", family: "Cetoniinae", morphology: "goliath_pattern" },
    { genus: "Cerambyx", species: "cerdo", common: "Great Capricorn Beetle", family: "Cerambycidae", morphology: "longhorn_cerambyx" },
    { genus: "Chalcosoma", species: "atlas", common: "Three-Horned Atlas Beetle", family: "Dynastinae", morphology: "horned_atlas" },
    { genus: "Buprestis", species: "aurulenta", common: "Golden Jewel Beetle", family: "Buprestidae", morphology: "scarab_jewel" },
    { genus: "Macrodontia", species: "cervicornis", common: "Sabertooth Longhorn", family: "Prioninae", morphology: "stag_lucanus" },
    { genus: "Plusiotis", species: "limbata", common: "Silver Mirror Scarab", family: "Rutelinae", morphology: "scarab_jewel" },
    { genus: "Cicindela", species: "chinensis", common: "Imperial Tiger Beetle", family: "Carabidae", morphology: "tiger_cicindela" },
    { genus: "Carabus", species: "auratus", common: "Golden Ground Beetle", family: "Carabidae", morphology: "scarab_jewel" }
  ];

  var TAXA_LEPIDOPTERA = [
    { genus: "Morpho", species: "hecuba", common: "Sunset Giant Morpho", family: "Nymphalidae", morphology: "broad_nymphalid" },
    { genus: "Attacus", species: "atlas", common: "Atlas Silk Moth", family: "Saturniidae", morphology: "falcate_saturniid" },
    { genus: "Papilio", species: "ulysses", common: "Blue Mountain Swallowtail", family: "Papilionidae", morphology: "tailed_papilio" },
    { genus: "Actias", species: "luna", common: "Moon Lunar Silk Moth", family: "Saturniidae", morphology: "tailed_luna" },
    { genus: "Troides", species: "brookiana", common: "Rajah Brooke's Birdwing", family: "Papilionidae", morphology: "falcate_birdwing" },
    { genus: "Ornithoptera", species: "priamus", common: "Priam's Emerald Birdwing", family: "Papilionidae", morphology: "broad_birdwing" },
    { genus: "Thysania", species: "agrippina", common: "White Witch Giant Moth", family: "Erebidae", morphology: "scalloped_witch" },
    { genus: "Kallima", species: "inachus", common: "Dead Leaf Butterfly", family: "Nymphalidae", morphology: "falcate_leaf" },
    { genus: "Chrysiridia", species: "rhipheus", common: "Madagascan Sunset Moth", family: "Uraniidae", morphology: "tailed_urania" },
    { genus: "Heliconius", species: "melpomene", common: "Postman Heliconian", family: "Nymphalidae", morphology: "elongate_heliconius" },
    { genus: "Argema", species: "mittrei", common: "Madagascan Comet Moth", family: "Saturniidae", morphology: "tailed_luna" },
    { genus: "Graphium", species: "weiskei", common: "Purple Spotted Swallowtail", family: "Papilionidae", morphology: "tailed_papilio" }
  ];

  var TAXA_ODONATA = [
    { genus: "Anax", species: "imperator", common: "Blue Emperor Dragonfly", family: "Aeshnidae", morphology: "giant_aeshna" },
    { genus: "Calopteryx", species: "virgo", common: "Beautiful Demoiselle", family: "Calopterygidae", morphology: "damselfly_calopteryx" },
    { genus: "Megaloprepus", species: "caerulatus", common: "Helicopter Giant Damselfly", family: "Pseudostigmatidae", morphology: "damselfly_giant" },
    { genus: "Sympetrum", species: "flaveolum", common: "Yellow-Winged Darter", family: "Libellulidae", morphology: "skimmer_sympetrum" },
    { genus: "Aeshna", species: "cyanea", common: "Southern Hawker Dragonfly", family: "Aeshnidae", morphology: "giant_aeshna" },
    { genus: "Cordulegaster", species: "bidentata", common: "Sombre Goldenring", family: "Cordulegastridae", morphology: "giant_goldenring" },
    { genus: "Erythemis", species: "simplicicollis", common: "Eastern Pondhawk Skimmer", family: "Libellulidae", morphology: "skimmer_sympetrum" },
    { genus: "Libellula", species: "quadrimaculata", common: "Four-Spotted Chaser", family: "Libellulidae", morphology: "chaser_libellula" },
    { genus: "Epiophlebia", species: "superstes", common: "Ancient Relict Dragonfly", family: "Epiophlebiidae", morphology: "relict_epiophlebia" },
    { genus: "Gomphus", species: "vulgatissimus", common: "Common Clubtail", family: "Gomphidae", morphology: "clubtail_gomphus" },
    { genus: "Neurothemis", species: "fulvia", common: "Fulvous Forest Skimmer", family: "Libellulidae", morphology: "skimmer_sympetrum" },
    { genus: "Ischnura", species: "elegans", common: "Common Bluetail Damselfly", family: "Coenagrionidae", morphology: "damselfly_calopteryx" }
  ];

  // --- 4. Archival Cabinet Palettes ---
  var PALETTES = {
    curio: {
      id: "curio",
      name: "Archival Curio",
      paper: "#EFE9DC",
      ink: "#2A2520",
      meta: "#7A7068",
      accent: "#8B1A1A",
      grid: "#DDD5C5",
      chitin: "#3E2E20",
      chitinLight: "#5A4432",
      wingTint: "rgba(139, 110, 80, 0.08)",
      wingShine: "rgba(255, 255, 255, 0.25)",
      pinBrass: "#B38F53"
    },
    scarab: {
      id: "scarab",
      name: "Scarab Melanic",
      paper: "#181614",
      ink: "#ECE5D8",
      meta: "#787169",
      accent: "#C2822C",
      grid: "#2D2824",
      chitin: "#282420",
      chitinLight: "#3E3832",
      wingTint: "rgba(194, 130, 44, 0.12)",
      wingShine: "rgba(255, 255, 255, 0.15)",
      pinBrass: "#C5A059"
    },
    cyanotype: {
      id: "cyanotype",
      name: "Prussian Cyanotype",
      paper: "#0D1B2A",
      ink: "#E0E1DD",
      meta: "#778DA9",
      accent: "#E29578",
      grid: "#1B263B",
      chitin: "#15263A",
      chitinLight: "#233D5B",
      wingTint: "rgba(224, 225, 221, 0.10)",
      wingShine: "rgba(255, 255, 255, 0.20)",
      pinBrass: "#E29578"
    },
    amber: {
      id: "amber",
      name: "Baltic Amber",
      paper: "#F6EBD9",
      ink: "#3D2612",
      meta: "#8A6E58",
      accent: "#9E2A2B",
      grid: "#E2CFA8",
      chitin: "#543317",
      chitinLight: "#734720",
      wingTint: "rgba(158, 42, 43, 0.08)",
      wingShine: "rgba(255, 255, 255, 0.30)",
      pinBrass: "#C89538"
    },
    malachite: {
      id: "malachite",
      name: "Verdigris Herbarium",
      paper: "#EAEFEA",
      ink: "#1B352B",
      meta: "#627A70",
      accent: "#B85D38",
      grid: "#CED6C9",
      chitin: "#284A3D",
      chitinLight: "#3B6957",
      wingTint: "rgba(40, 74, 61, 0.09)",
      wingShine: "rgba(255, 255, 255, 0.22)",
      pinBrass: "#A67C52"
    }
  };

  // --- 5. Micro-Entomological Synthesis Engine ---
  function synthesize(seedInput, options) {
    options = options || {};
    var rawSeed = typeof seedInput === 'string' ? seedInput.trim() : 'Micro-Entomological Field Specimen';
    var hashVal = 0;

    if (rawSeed && rawSeed.indexOf('-') > -1) {
      var rec = recoverHashFromId(rawSeed);
      hashVal = rec !== null ? rec : fnv1a(rawSeed);
    } else {
      hashVal = fnv1a(rawSeed || 'Cabinet Curiosities Specimen');
    }

    var rng = Mulberry32(hashVal);
    var lowerSeed = rawSeed.toLowerCase();

    // Intelligent Narrative Keyword Resolution
    var orderKey = null;
    var matchedTaxon = null;

    // 1. Check for specific orders in keywords
    if (/beetle|scarab|stag|hercules|dynastes|lucanus|titan|goliath|chrysina|coleopt|chalcosoma|cerambyx|buprestis|macrodontia|chitin/i.test(lowerSeed)) {
      orderKey = 'coleoptera';
    } else if (/butterfly|moth|morpho|luna|swallowtail|attacus|papilio|lepidopt|saturni|birdwing|kallima|sunset moth|witch moth/i.test(lowerSeed)) {
      orderKey = 'lepidoptera';
    } else if (/dragonfly|damselfly|anax|odonat|darner|chaser|demoiselle|skimmer|hawker|clubtail|vitreous|calopteryx|aeshna|sympetrum/i.test(lowerSeed)) {
      orderKey = 'odonata';
    }

    // Explicit override if specified in options
    if (options.order && ['coleoptera', 'lepidoptera', 'odonata'].indexOf(options.order) !== -1) {
      orderKey = options.order;
    }

    // Default fallback order via deterministic hash
    if (!orderKey) {
      var orderKeys = ['coleoptera', 'lepidoptera', 'odonata'];
      orderKey = orderKeys[Math.floor(rng() * orderKeys.length)];
    }

    var taxonPool = orderKey === 'coleoptera' ? TAXA_COLEOPTERA : (orderKey === 'lepidoptera' ? TAXA_LEPIDOPTERA : TAXA_ODONATA);

    // Try matching specific genus or common keyword
    for (var ti = 0; ti < taxonPool.length; ti++) {
      var cand = taxonPool[ti];
      if (lowerSeed.indexOf(cand.genus.toLowerCase()) !== -1 || lowerSeed.indexOf(cand.species.toLowerCase()) !== -1 || lowerSeed.indexOf(cand.common.toLowerCase()) !== -1) {
        matchedTaxon = cand;
        break;
      }
    }

    var taxon = matchedTaxon || taxonPool[Math.floor(rng() * taxonPool.length)];
    var binomen = taxon.genus + " " + taxon.species;
    var accessionId = generateSequenceIdentifier(hashVal, orderKey);
    var hexHash = (hashVal >>> 0).toString(16).toUpperCase().padStart(8, '0');

    // Dimensions
    var width = options.width || 600;
    var height = options.height || 600;
    var minDim = Math.min(width, height);
    var cx = width / 2;
    var cy = height / 2;

    var scaleFactor = minDim / 600;

    // Morphological Sizing for Plate Balance
    var bodyLength = 0;
    var wingspan = 0;

    if (orderKey === 'coleoptera') {
      bodyLength = Math.round(230 + rng() * 60) * scaleFactor;
      wingspan = Math.round(310 + rng() * 70) * scaleFactor; // Leg spread
    } else if (orderKey === 'lepidoptera') {
      wingspan = Math.round(410 + rng() * 70) * scaleFactor;
      bodyLength = Math.round(180 + rng() * 40) * scaleFactor;
    } else { // odonata
      wingspan = Math.round(440 + rng() * 60) * scaleFactor;
      bodyLength = Math.round(270 + rng() * 50) * scaleFactor;
    }

    var chitinHardness = (3.2 + rng() * 2.2).toFixed(1);
    var venationCells = orderKey === 'odonata' ? Math.floor(1400 + rng() * 2200) : (orderKey === 'lepidoptera' ? Math.floor(650 + rng() * 950) : Math.floor(180 + rng() * 320));

    var antennaeTypes = {
      coleoptera: ["Lamellate 5-Foliate", "Geniculate Elbowed 11-Annulate", "Serrate Pectinate", "Moniliform Bead-Chain"],
      lepidoptera: ["Bipectinate Plumose (Velvet Rami)", "Clavate Teardrop Clubbed", "Dentate Feathered", "Setaceous Micro-Ciliate"],
      odonata: ["Setaceous Micro-Spur", "Subulate 3-Segmented Aristate", "Filiform Vestigial Sensory"]
    };
    var antennaeForm = antennaeTypes[orderKey][Math.floor(rng() * antennaeTypes[orderKey].length)];

    var meanings = [
      "Cabinet-of-curiosities holotype plate featuring copperplate stippling & sclerotized cuticle.",
      "Pin-mounted anatomical study delineating microscopic crossvein reticulation & articulated joints.",
      "Archival field exemplar with micro-punctate striae, ommatidial facets & engraved Latin nomenclature.",
      "Natural history museum plate demonstrating bilateral symmetry & volumetric engraved cross-hatching.",
      "Taxonomic field study delineating thoracic phragma, Comstock-Needham venation & tarsal claws."
    ];
    var meaning = meanings[Math.floor(rng() * meanings.length)];

    return {
      seed: rawSeed,
      hashVal: hashVal,
      accessionId: accessionId,
      order: orderKey,
      taxon: taxon,
      binomen: binomen,
      wingspan: wingspan,
      bodyLength: bodyLength,
      antennaeForm: antennaeForm,
      chitinHardness: chitinHardness,
      venationCells: venationCells,
      cx: cx,
      cy: cy,
      scaleFactor: scaleFactor,
      metrics: {
        orderName: orderKey.toUpperCase(),
        family: taxon.family,
        commonName: taxon.common,
        antennae: antennaeForm,
        hardness: "Mohs " + chitinHardness + " / Sclerotized Cuticle",
        venation: venationCells.toLocaleString() + " Reticulated Cells",
        wingspanStr: (wingspan * 0.28).toFixed(1) + " mm // " + (bodyLength * 0.28).toFixed(1) + " mm Body",
        meaning: meaning,
        hashHex: "0x" + hexHash,
        epoch: "Anno 1884 // Muséum d'Histoire Naturelle"
      }
    };
  }

  // --- 6. Procedural Anatomy Vector Generator (Enriched Copperplate Engine) ---

  // ORDER 1: COLEOPTERA (Micro-Entomological Anatomy of the Chitin Armor)
  function drawColeoptera(specimen, p, cx, cy, pinY, s, rng, h) {
    var elements = [];
    var taxon = specimen.taxon;
    var morph = taxon.morphology;
    var isStag = morph === 'stag_lucanus';
    var isHornedDynastes = morph === 'horned_dynastes';
    var isHornedAtlas = morph === 'horned_atlas';
    var isLonghorn = morph === 'longhorn_cerambyx';
    var isGoliath = morph === 'goliath_pattern';

    var bL = specimen.bodyLength / s;
    var pronoW = 48 + rng() * 10;
    var pronoH = 36 + rng() * 8;
    var pronoY = pinY / s - 16;

    var headW = isStag ? 42 + rng() * 6 : ((isHornedDynastes || isHornedAtlas) ? 30 + rng() * 4 : 26 + rng() * 4);
    var headH = 22 + rng() * 4;
    var headY = pronoY - pronoH * 0.5 - headH * 0.45;

    var elyW = pronoW * 1.26;
    var elyH = bL * 0.65;
    var abdoY0 = pronoY + pronoH * 0.5;

    // 1. Membranous Flight Wing Tips (Alae) peeking out under the elytra apex
    var wingTipY = abdoY0 + elyH;
    var wtCoords = [
      [2, wingTipY - 6],
      [elyW * 0.35, wingTipY + 4],
      [elyW * 0.28, wingTipY + 22],
      [elyW * 0.12, wingTipY + 26],
      [2, wingTipY + 18]
    ];
    elements.push(h.symPath(wtCoords, true, p.wingTint, p.ink, (0.75 * s).toFixed(2), 0.7, 0.9));
    for (var wvi = 1; wvi <= 4; wvi++) {
      var wvt = wvi / 5;
      elements.push(h.symLine(elyW * 0.15 * wvt + 2, wingTipY - 2, elyW * 0.25 * wvt + 2, wingTipY + 20, p.ink, (0.5 * s).toFixed(2), 0.55));
    }

    // 2. Pygidium (Terminal Chitin Plate)
    var pygCoords = [
      [0, abdoY0 + elyH - 3],
      [elyW * 0.32, abdoY0 + elyH + 2],
      [elyW * 0.22, abdoY0 + elyH + 16],
      [0, abdoY0 + elyH + 20]
    ];
    elements.push(h.symPath(pygCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 1.0));
    elements.push(h.symHatch(elyW * 0.05, elyW * 0.24, abdoY0 + elyH + 4, abdoY0 + elyH + 14, 5, (0.5 * s).toFixed(2), 0.5));

    // 3. Articulated Segmented Legs (Coxa, Trochanter, Femur, Fossorial Tibia, 5 Tarsomeres, Ungues)
    var legConfigs = [
      { name: "Prothoracic", rootY: pronoY - 6, kneeX: 68, kneeY: pronoY - 42, tibX: 102, tibY: pronoY - 72, tarX: 118, tarY: pronoY - 105, isFore: true },
      { name: "Mesothoracic", rootY: pinY / s + 4, kneeX: 90, kneeY: pinY / s - 12, tibX: 132, tibY: pinY / s + 16, tarX: 154, tarY: pinY / s + 52, isFore: false },
      { name: "Metathoracic", rootY: abdoY0 + 26, kneeX: 100, kneeY: abdoY0 + 68, tibX: 142, tibY: abdoY0 + 132, tarX: 165, tarY: abdoY0 + 186, isFore: false }
    ];

    legConfigs.forEach(function (leg) {
      var rx = pronoW * 0.42;

      var femMidX = (rx + leg.kneeX) * 0.5 + 4;
      var femMidY = (leg.rootY + leg.kneeY) * 0.5 - 3;
      var femD_R = "M " + (cx + rx * s).toFixed(2) + " " + (leg.rootY * s).toFixed(2) +
                   " Q " + (cx + femMidX * s).toFixed(2) + " " + (femMidY * s).toFixed(2) +
                   " " + (cx + leg.kneeX * s).toFixed(2) + " " + (leg.kneeY * s).toFixed(2);
      var femD_L = "M " + (cx - rx * s).toFixed(2) + " " + (leg.rootY * s).toFixed(2) +
                   " Q " + (cx - femMidX * s).toFixed(2) + " " + (femMidY * s).toFixed(2) +
                   " " + (cx - leg.kneeX * s).toFixed(2) + " " + (leg.kneeY * s).toFixed(2);
      elements.push('<path d="' + femD_R + ' ' + femD_L + '" fill="none" stroke="' + p.chitin + '" stroke-width="' + (5.6 * s).toFixed(2) + '" stroke-linecap="round" />');
      elements.push('<path d="' + femD_R + ' ' + femD_L + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.2 * s).toFixed(2) + '" stroke-linecap="round" />');
      elements.push(h.symLine(rx + 8, leg.rootY + 1, leg.kneeX - 6, leg.kneeY + 1, p.ink, (0.6 * s).toFixed(2), 0.55));

      if (leg.isFore) {
        elements.push(h.symLine(leg.kneeX, leg.kneeY, leg.tibX, leg.tibY, p.ink, (3.8 * s).toFixed(2), 1.0));
        for (var fti = 1; fti <= 4; fti++) {
          var ftt = fti / 5;
          var ftx = leg.kneeX + (leg.tibX - leg.kneeX) * ftt;
          var fty = leg.kneeY + (leg.tibY - leg.kneeY) * ftt;
          var toothCoords = [
            [ftx, fty],
            [ftx + 8.5, fty - 4.5],
            [ftx + 2.5, fty + 3.0]
          ];
          elements.push(h.symPath(toothCoords, true, p.ink, p.ink, (0.8 * s).toFixed(2), 1.0));
        }
        elements.push(h.symLine(leg.tibX, leg.tibY, leg.tibX + 7, leg.tibY + 5, p.ink, (1.2 * s).toFixed(2), 1.0));
        elements.push(h.symLine(leg.tibX, leg.tibY, leg.tibX + 3, leg.tibY + 8, p.ink, (1.1 * s).toFixed(2), 1.0));
      } else {
        elements.push(h.symLine(leg.kneeX, leg.kneeY, leg.tibX, leg.tibY, p.ink, (3.2 * s).toFixed(2), 1.0));
        elements.push(h.symLine(leg.kneeX + 2, leg.kneeY + 1, leg.tibX - 2, leg.tibY - 1, p.paper, (0.7 * s).toFixed(2), 0.45));
        for (var si = 1; si <= 4; si++) {
          var st = si / 5;
          var sx = leg.kneeX + (leg.tibX - leg.kneeX) * st;
          var sy = leg.kneeY + (leg.tibY - leg.kneeY) * st;
          elements.push(h.symLine(sx, sy, sx + 6, sy - 3.5, p.ink, (1.1 * s).toFixed(2), 1.0));
        }
        elements.push(h.symLine(leg.tibX, leg.tibY, leg.tibX + 6, leg.tibY + 4, p.ink, (1.2 * s).toFixed(2), 1.0));
      }

      var curTx = leg.tibX;
      var curTy = leg.tibY;
      for (var ti = 1; ti <= 5; ti++) {
        var nxtTx = leg.tibX + (leg.tarX - leg.tibX) * (ti / 5);
        var nxtTy = leg.tibY + (leg.tarY - leg.tibY) * (ti / 5);
        var tStroke = ti === 5 ? (1.3 * s) : (2.2 - ti * 0.22) * s;
        elements.push(h.symLine(curTx, curTy, nxtTx, nxtTy, p.ink, tStroke.toFixed(2), 1.0));
        elements.push(h.symCircle(nxtTx, nxtTy, 1.2, p.ink, "none", 0, 0.95));
        if (ti < 5) {
          elements.push(h.symLine(nxtTx, nxtTy, nxtTx - 2.5, nxtTy + 3, p.accent, (0.6 * s).toFixed(2), 0.75));
        }
        curTx = nxtTx;
        curTy = nxtTy;
      }

      elements.push(h.symLine(curTx, curTy, curTx + 7, curTy - 5, p.ink, (1.2 * s).toFixed(2), 1.0));
      elements.push(h.symLine(curTx, curTy, curTx + 7, curTy + 5, p.ink, (1.2 * s).toFixed(2), 1.0));
      elements.push(h.symCircle(curTx + 4.5, curTy, 1.4, p.accent, p.ink, (0.5 * s).toFixed(2), 0.9));
    });

    // 4. Hardened Convex Elytra (Wing Cases)
    var elyCoords = [
      [2, abdoY0 + 2],
      [elyW * 0.45, abdoY0 + 5],
      [elyW * 0.92, abdoY0 + elyH * 0.22],
      [elyW * 1.02, abdoY0 + elyH * 0.54],
      [elyW * 0.9, abdoY0 + elyH * 0.82],
      [elyW * 0.48, abdoY0 + elyH * 0.98],
      [2, abdoY0 + elyH]
    ];
    elements.push(h.symPath(elyCoords, true, p.chitin, p.ink, (1.5 * s).toFixed(2), 1.0));
    elements.push(h.symLine(0, abdoY0, 0, abdoY0 + elyH, p.ink, (1.4 * s).toFixed(2), 1.0));
    elements.push(h.symLine(1.8, abdoY0 + 16, 1.8, abdoY0 + elyH - 4, p.ink, (0.6 * s).toFixed(2), 0.6));

    var humX = elyW * 0.68;
    var humY = abdoY0 + 22;
    elements.push(h.symCircle(humX, humY, 8.5, "none", p.ink, (0.65 * s).toFixed(2), 0.55));
    elements.push(h.symCircle(humX, humY, 5.0, "none", p.ink, (0.65 * s).toFixed(2), 0.6));
    elements.push(h.symCircle(humX, humY, 2.0, p.chitinLight, "none", 0, 0.8));

    // 9 Longitudinal Costae with Biseriate Punctation
    for (var strI = 1; strI <= 8; strI++) {
      var strRatio = strI / 9;
      var pX1 = elyW * strRatio * 0.46;
      var pX2 = elyW * strRatio * 0.98;
      var pX3 = elyW * strRatio * 0.54;

      var dStrR = "M " + (cx + pX1 * s).toFixed(2) + " " + ((abdoY0 + 12) * s).toFixed(2) +
                  " Q " + (cx + pX2 * s).toFixed(2) + " " + ((abdoY0 + elyH * 0.5) * s).toFixed(2) +
                  " " + (cx + pX3 * s).toFixed(2) + " " + ((abdoY0 + elyH - 12) * s).toFixed(2);
      var dStrL = "M " + (cx - pX1 * s).toFixed(2) + " " + ((abdoY0 + 12) * s).toFixed(2) +
                  " Q " + (cx - pX2 * s).toFixed(2) + " " + ((abdoY0 + elyH * 0.5) * s).toFixed(2) +
                  " " + (cx - pX3 * s).toFixed(2) + " " + ((abdoY0 + elyH - 12) * s).toFixed(2);
      elements.push('<path d="' + dStrR + ' ' + dStrL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.75 * s).toFixed(2) + '" stroke-opacity="0.75" />');

      for (var pdi = 1; pdi <= 14; pdi++) {
        var pdt = pdi / 15;
        var curPx = pX1 * (1 - pdt) * (1 - pdt) + pX2 * 2 * (1 - pdt) * pdt + pX3 * pdt * pdt;
        var curPy = (abdoY0 + 12) * (1 - pdt) * (1 - pdt) + (abdoY0 + elyH * 0.5) * 2 * (1 - pdt) * pdt + (abdoY0 + elyH - 12) * pdt * pdt;
        elements.push(h.symCircle(curPx - 1.8, curPy, 0.55, p.ink, "none", 0, 0.7));
        elements.push(h.symCircle(curPx + 1.8, curPy + 1.2, 0.55, p.ink, "none", 0, 0.7));
      }
    }

    // Lateral Intaglio Curvature Hatching
    for (var lhi = 0; lhi < 12; lhi++) {
      var lht = lhi / 11;
      var ly = abdoY0 + elyH * 0.2 + lht * (elyH * 0.6);
      var lxOuter = elyW * (0.95 - (lht - 0.5) * (lht - 0.5) * 0.2);
      var lxInner = lxOuter - 14;
      elements.push(h.symLine(lxInner, ly, lxOuter, ly + 2, p.ink, (0.55 * s).toFixed(2), 0.45));
    }

    if (isGoliath) {
      var gBands = [
        [[elyW * 0.15, abdoY0 + 20], [elyW * 0.25, abdoY0 + elyH * 0.4], [elyW * 0.2, abdoY0 + elyH * 0.75]],
        [[elyW * 0.45, abdoY0 + 35], [elyW * 0.62, abdoY0 + elyH * 0.55], [elyW * 0.5, abdoY0 + elyH * 0.85]]
      ];
      gBands.forEach(function (gb) {
        elements.push(h.symPath(gb, false, "none", p.paper, (3.2 * s).toFixed(2), 0.85));
      });
    }

    // 5. Scutellum (Heart-shaped inter-elytral shield)
    var scuCoords = [
      [0, abdoY0],
      [15, abdoY0 + 2],
      [12, abdoY0 + 14],
      [0, abdoY0 + 22]
    ];
    elements.push(h.symPath(scuCoords, true, p.chitinLight, p.ink, (1.2 * s).toFixed(2), 1.0));
    elements.push(h.symLine(0, abdoY0 + 4, 0, abdoY0 + 19, p.ink, (0.8 * s).toFixed(2), 0.8));
    elements.push(h.symStipple(5, abdoY0 + 9, 4, 5, 8, 0.5, 0.6));

    // 6. Pronotum (Sculptured Prothoracic Shield)
    var pronoCoords = [
      [0, pronoY - pronoH * 0.52],
      [pronoW * 0.42, pronoY - pronoH * 0.48],
      [pronoW * 0.88, pronoY - pronoH * 0.3],
      [pronoW * 1.02, pronoY + pronoH * 0.12],
      [pronoW * 0.84, pronoY + pronoH * 0.48],
      [pronoW * 0.35, pronoY + pronoH * 0.52],
      [0, pronoY + pronoH * 0.54]
    ];
    if (isLonghorn) {
      pronoCoords[3] = [pronoW * 1.18, pronoY - 2];
    }
    elements.push(h.symPath(pronoCoords, true, p.chitin, p.ink, (1.4 * s).toFixed(2), 1.0));
    elements.push(h.symLine(0, pronoY - pronoH * 0.48, 0, pronoY + pronoH * 0.5, p.ink, (1.1 * s).toFixed(2), 0.9));
    elements.push(h.symCircle(pronoW * 0.38, pronoY - 4, 3.2, p.chitinLight, p.ink, (0.6 * s).toFixed(2), 0.8));
    elements.push(h.symHatch(pronoW * 0.3, pronoW * 0.88, pronoY - pronoH * 0.28, pronoY + pronoH * 0.28, 9, (0.55 * s).toFixed(2), 0.5));
    elements.push(h.symStipple(pronoW * 0.45, pronoY, pronoW * 0.35, pronoH * 0.35, 18, 0.55, 0.55));

    // 7. Head Capsule & Clypeus
    var headCoords = [
      [0, headY - headH * 0.55],
      [headW * 0.45, headY - headH * 0.5],
      [headW * 0.82, headY - headH * 0.15],
      [headW * 0.78, headY + headH * 0.45],
      [headW * 0.32, headY + headH * 0.5],
      [0, headY + headH * 0.52]
    ];
    elements.push(h.symPath(headCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));
    elements.push(h.symLine(0, headY - headH * 0.45, 0, headY + headH * 0.4, p.ink, (0.9 * s).toFixed(2), 0.85));
    elements.push(h.symLine(headW * 0.18, headY - headH * 0.15, headW * 0.45, headY + headH * 0.12, p.ink, (0.7 * s).toFixed(2), 0.65));
    elements.push(h.symStipple(headW * 0.3, headY, headW * 0.25, headH * 0.3, 12, 0.5, 0.6));

    // 4-Segmented Maxillary Palpi
    elements.push(h.symLine(headW * 0.22, headY - headH * 0.5, headW * 0.38, headY - headH * 0.75, p.ink, (1.0 * s).toFixed(2), 0.95));
    elements.push(h.symLine(headW * 0.38, headY - headH * 0.75, headW * 0.32, headY - headH * 1.02, p.ink, (0.9 * s).toFixed(2), 0.95));
    elements.push(h.symCircle(headW * 0.32, headY - headH * 1.02, 1.5, p.accent, p.ink, (0.6 * s).toFixed(2), 0.9));

    // Compound Eyes with Canthus Notch
    var eyeR = 7.0;
    var eyeX = headW * 0.76;
    var eyeY = headY;
    elements.push(h.symCircle(eyeX, eyeY, eyeR, p.paper, p.ink, (1.1 * s).toFixed(2)));
    elements.push(h.symLine(eyeX - eyeR - 1, eyeY, eyeX - 0.5, eyeY, p.ink, (1.4 * s).toFixed(2), 1.0));
    for (var fxi = -3; fxi <= 3; fxi++) {
      for (var fyi = -3; fyi <= 3; fyi++) {
        if (fxi * fxi + fyi * fyi <= 6) {
          elements.push(h.symCircle(eyeX + fxi * 1.7, eyeY + fyi * 1.7, 0.45, p.ink, "none", 0, 0.8));
        }
      }
    }

    // 8. Mandibles & Cephalic Horns
    if (isStag) {
      var manLen = 65 + rng() * 30;
      var mC1 = [
        [headW * 0.35, headY - headH * 0.42],
        [headW * 0.62, headY - headH * 0.75],
        [headW * 0.78, headY - headH * 0.75 - manLen * 0.45],
        [headW * 0.64, headY - headH * 0.75 - manLen * 0.82],
        [headW * 0.18, headY - headH * 0.75 - manLen],
        [headW * 0.32, headY - headH * 0.75 - manLen * 0.88],
        [headW * 0.44, headY - headH * 0.75 - manLen * 0.65],
        [headW * 0.46, headY - headH * 0.75 - manLen * 0.42],
        [headW * 0.24, headY - headH * 0.75 - manLen * 0.22],
        [headW * 0.18, headY - headH * 0.42]
      ];
      elements.push(h.symPath(mC1, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));

      var antCarR = "M " + (cx + headW * 0.45 * s).toFixed(2) + " " + ((headY - headH * 0.55) * s).toFixed(2) +
                    " Q " + (cx + headW * 0.65 * s).toFixed(2) + " " + ((headY - headH * 0.75 - manLen * 0.5) * s).toFixed(2) +
                    " " + (cx + headW * 0.26 * s).toFixed(2) + " " + ((headY - headH * 0.75 - manLen * 0.92) * s).toFixed(2);
      var antCarL = "M " + (cx - headW * 0.45 * s).toFixed(2) + " " + ((headY - headH * 0.55) * s).toFixed(2) +
                    " Q " + (cx - headW * 0.65 * s).toFixed(2) + " " + ((headY - headH * 0.75 - manLen * 0.5) * s).toFixed(2) +
                    " " + (cx - headW * 0.26 * s).toFixed(2) + " " + ((headY - headH * 0.75 - manLen * 0.92) * s).toFixed(2);
      elements.push('<path d="' + antCarR + ' ' + antCarL + '" fill="none" stroke="' + p.paper + '" stroke-width="' + (0.7 * s).toFixed(2) + '" stroke-opacity="0.4" />');

      for (var mi = 1; mi <= 7; mi++) {
        var mt = mi / 8;
        var tX = (headW * 0.48 - mt * (headW * 0.28));
        var tY = (headY - headH * 0.75 - manLen * mt);
        elements.push(h.symLine(tX, tY, tX - 5.5, tY + 2.5, p.ink, (1.0 * s).toFixed(2), 0.95));
      }
      for (var bsi = 0; bsi < 5; bsi++) {
        elements.push(h.symLine(headW * 0.24, headY - headH * 0.45, headW * 0.28 + bsi * 2, headY - headH * 0.55 - bsi * 1.5, p.accent, (0.7 * s).toFixed(2), 0.85));
      }
    } else if (isHornedDynastes) {
      var hLen = 75 + rng() * 35;
      var chCoords = [
        [headW * 0.18, headY - headH * 0.4],
        [headW * 0.24, headY - headH * 0.85],
        [headW * 0.16, headY - headH * 0.85 - hLen * 0.65],
        [0, headY - headH * 0.85 - hLen],
        [headW * 0.08, headY - headH * 0.85 - hLen * 0.6],
        [headW * 0.1, headY - headH * 0.4]
      ];
      elements.push(h.symPath(chCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));
      elements.push(h.symLine(headW * 0.18, headY - headH * 0.85 - hLen * 0.35, headW * 0.28, headY - headH * 0.85 - hLen * 0.38, p.ink, (1.2 * s).toFixed(2), 1.0));

      var prHCoords = [
        [headW * 0.18, pronoY - pronoH * 0.3],
        [headW * 0.22, pronoY - pronoH * 0.75],
        [headW * 0.15, headY - headH * 0.85 - hLen * 0.98],
        [0, headY - headH * 0.85 - hLen * 1.22],
        [headW * 0.05, headY - headH * 0.85 - hLen * 0.9],
        [headW * 0.1, pronoY - pronoH * 0.3]
      ];
      elements.push(h.symPath(prHCoords, true, p.chitinLight, p.ink, (1.4 * s).toFixed(2), 1.0));
      for (var vsi = 1; vsi <= 24; vsi++) {
        var vt = vsi / 25;
        var vy = (pronoY - pronoH * 0.65) - vt * (hLen * 0.92);
        var vx = headW * 0.07;
        elements.push(h.symLine(vx, vy, vx + 4.5, vy + 2.5, p.accent, (0.8 * s).toFixed(2), 0.9));
      }
    } else if (isHornedAtlas) {
      var aLen = 70 + rng() * 25;
      var cAtlas = [
        [headW * 0.16, headY - headH * 0.4],
        [headW * 0.2, headY - headH * 0.8],
        [headW * 0.12, headY - headH * 0.8 - aLen * 0.75],
        [0, headY - headH * 0.8 - aLen * 1.05],
        [headW * 0.06, headY - headH * 0.8 - aLen * 0.7],
        [headW * 0.08, headY - headH * 0.4]
      ];
      elements.push(h.symPath(cAtlas, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));

      var pLatHorn = [
        [pronoW * 0.45, pronoY - pronoH * 0.4],
        [pronoW * 0.62, pronoY - pronoH * 0.75],
        [pronoW * 0.55, headY - aLen * 0.65],
        [pronoW * 0.32, headY - aLen * 0.92],
        [pronoW * 0.42, headY - aLen * 0.6],
        [pronoW * 0.38, pronoY - pronoH * 0.4]
      ];
      elements.push(h.symPath(pLatHorn, true, p.chitinLight, p.ink, (1.3 * s).toFixed(2), 1.0));
    } else {
      var manCoords = [
        [headW * 0.22, headY - headH * 0.52],
        [headW * 0.36, headY - headH * 0.88],
        [headW * 0.06, headY - headH * 1.15],
        [headW * 0.16, headY - headH * 0.78],
        [headW * 0.1, headY - headH * 0.52]
      ];
      elements.push(h.symPath(manCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));
      elements.push(h.symLine(headW * 0.22, headY - headH * 0.7, headW * 0.12, headY - headH * 0.74, p.ink, (1.0 * s).toFixed(2), 0.95));
      elements.push(h.symLine(headW * 0.18, headY - headH * 0.88, headW * 0.08, headY - headH * 0.92, p.ink, (1.0 * s).toFixed(2), 0.95));
    }

    // 9. Antennae
    var antBaseX = headW * 0.55;
    var antBaseY = headY - headH * 0.12;
    if (isLonghorn) {
      var antPts = [
        [antBaseX, antBaseY],
        [antBaseX + 38, antBaseY - 32],
        [antBaseX + 82, antBaseY - 52],
        [antBaseX + 128, antBaseY - 32],
        [antBaseX + 152, antBaseY + 28],
        [antBaseX + 158, antBaseY + 98],
        [antBaseX + 148, antBaseY + 165]
      ];
      var dR = "M " + (cx + antPts[0][0] * s).toFixed(2) + " " + (antPts[0][1] * s).toFixed(2);
      var dL = "M " + (cx - antPts[0][0] * s).toFixed(2) + " " + (antPts[0][1] * s).toFixed(2);
      for (var api = 1; api < antPts.length; api++) {
        dR += " L " + (cx + antPts[api][0] * s).toFixed(2) + " " + (antPts[api][1] * s).toFixed(2);
        dL += " L " + (cx - antPts[api][0] * s).toFixed(2) + " " + (antPts[api][1] * s).toFixed(2);
        elements.push(h.symCircle(antPts[api][0], antPts[api][1], 1.8, p.chitin, p.ink, (0.8 * s).toFixed(2)));
        elements.push(h.symLine(antPts[api][0], antPts[api][1], antPts[api][0] + 3.5, antPts[api][1] - 3.0, p.accent, (0.7 * s).toFixed(2), 0.85));
      }
      elements.push('<path d="' + dR + ' ' + dL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.3 * s).toFixed(2) + '" stroke-linecap="round" />');
    } else {
      var antMidX = antBaseX + 24;
      var antMidY = antBaseY - 35;
      var antTipX = antBaseX + 42;
      var antTipY = antBaseY - 58;
      elements.push(h.symLine(antBaseX, antBaseY, antMidX, antMidY, p.ink, (1.3 * s).toFixed(2), 1.0));
      elements.push(h.symLine(antMidX, antMidY, antTipX, antTipY, p.ink, (1.2 * s).toFixed(2), 1.0));
      for (var li = 0; li < 6; li++) {
        var lx = antTipX + li * 5.2;
        var ly = antTipY - li * 2.8;
        elements.push(h.symLine(antTipX, antTipY, lx + 18, ly - 9, p.ink, (1.1 * s).toFixed(2), 0.95));
        elements.push(h.symLine(lx + 18, ly - 9, lx + 20, ly - 11, p.accent, (0.6 * s).toFixed(2), 0.8));
      }
    }

    return elements;
  }

  // ORDER 2: LEPIDOPTERA (Butterflies & Moths - Papilionidae, Saturniidae, Nymphalidae)
  function drawLepidoptera(specimen, p, cx, cy, pinY, s, rng, h) {
    var elements = [];
    var taxon = specimen.taxon;
    var morph = taxon.morphology;
    var isTailedPapilio = morph === 'tailed_papilio';
    var isTailedLuna = morph === 'tailed_luna';
    var isFalcate = morph === 'falcate_saturniid' || morph === 'falcate_birdwing' || morph === 'falcate_leaf';

    var bL = specimen.bodyLength / s;
    var wingspanHalf = (specimen.wingspan * 0.5) / s;

    var thoraxW = 20 + rng() * 6;
    var thoraxH = 38 + rng() * 6;
    var thoraxY = pinY / s;

    var headW = 16 + rng() * 4;
    var headH = 14 + rng() * 3;
    var headY = thoraxY - thoraxH * 0.5 - headH * 0.5;

    var abdoW = 18 + rng() * 4;
    var abdoH = bL * 0.52;
    var abdoY0 = thoraxY + thoraxH * 0.5;

    var fwSpan = wingspanHalf * 0.96;
    var fwH = fwSpan * 0.70;
    var fwRootY = thoraxY - 10;

    var apexX = fwSpan;
    var apexY = fwRootY - fwH * 0.72;
    var tornusX = fwSpan * 0.68;
    var tornusY = fwRootY + fwH * 0.44;

    var fwCoords = [
      [thoraxW * 0.4, fwRootY],
      [fwSpan * 0.48, fwRootY - fwH * 0.64],
      [apexX, apexY]
    ];

    for (var si = 1; si <= 6; si++) {
      var st = si / 7;
      var baseMx = apexX + (tornusX - apexX) * st;
      var baseMy = apexY + (tornusY - apexY) * st;
      var scallopIndent = (si % 2 === 0 ? 3.5 : -1.5);
      fwCoords.push([baseMx - scallopIndent, baseMy]);
    }
    fwCoords.push([tornusX, tornusY]);
    fwCoords.push([fwSpan * 0.35, tornusY + 4]);
    fwCoords.push([thoraxW * 0.4, fwRootY + 12]);

    elements.push(h.symPath(fwCoords, true, p.wingTint, p.ink, (1.4 * s).toFixed(2), 0.98));

    for (var cii = 1; cii <= 18; cii++) {
      var cit = cii / 19;
      var cx1 = apexX + (tornusX - apexX) * cit;
      var cy1 = apexY + (tornusY - apexY) * cit;
      var color = (cii % 2 === 0 ? p.ink : p.paper);
      elements.push(h.symLine(cx1, cy1, cx1 + 2.5, cy1 + 1.2, color, (0.75 * s).toFixed(2), 0.85));
    }

    var hwSpan = fwSpan * 0.70;
    var hwH = fwH * 0.84;
    var hwRootY = thoraxY + 8;

    var hwCoords = [
      [thoraxW * 0.35, hwRootY],
      [hwSpan * 0.72, hwRootY + hwH * 0.25],
      [hwSpan * 0.96, hwRootY + hwH * 0.65],
      [hwSpan * 0.84, hwRootY + hwH * 0.95]
    ];

    if (isTailedPapilio) {
      var tailLen = 45 + rng() * 20;
      hwCoords.push([hwSpan * 0.76, hwRootY + hwH * 1.05 + tailLen * 0.5]);
      hwCoords.push([hwSpan * 0.74, hwRootY + hwH * 1.05 + tailLen]);
      hwCoords.push([hwSpan * 0.65, hwRootY + hwH * 1.05 + tailLen * 0.7]);
      hwCoords.push([hwSpan * 0.56, hwRootY + hwH * 1.02]);
    } else if (isTailedLuna) {
      var lunaLen = 85 + rng() * 30;
      hwCoords.push([hwSpan * 0.75, hwRootY + hwH * 1.05 + lunaLen * 0.4]);
      hwCoords.push([hwSpan * 0.68, hwRootY + hwH * 1.05 + lunaLen * 0.75]);
      hwCoords.push([hwSpan * 0.58, hwRootY + hwH * 1.05 + lunaLen]);
      hwCoords.push([hwSpan * 0.52, hwRootY + hwH * 1.05 + lunaLen * 0.8]);
      hwCoords.push([hwSpan * 0.55, hwRootY + hwH * 1.02]);
    } else {
      hwCoords.push([hwSpan * 0.68, hwRootY + hwH * 1.06]);
      hwCoords.push([hwSpan * 0.52, hwRootY + hwH * 1.08]);
    }

    hwCoords.push([hwSpan * 0.25, hwRootY + hwH * 0.96]);
    hwCoords.push([thoraxW * 0.35, hwRootY + hwH * 0.65]);
    elements.push(h.symPath(hwCoords, true, p.wingTint, p.ink, (1.3 * s).toFixed(2), 0.98));

    var dcW = fwSpan * 0.40;
    var dcH = fwH * 0.28;
    var dcCoords = [
      [thoraxW * 0.45, fwRootY],
      [dcW * 0.72, fwRootY - dcH * 0.75],
      [dcW, fwRootY - dcH * 0.12],
      [dcW * 0.84, fwRootY + dcH * 0.58],
      [thoraxW * 0.45, fwRootY + 8]
    ];
    elements.push(h.symPath(dcCoords, true, "none", p.ink, (1.2 * s).toFixed(2), 0.95));

    var radTargets = [
      [fwSpan * 0.68, fwRootY - fwH * 0.7],
      [fwSpan * 0.85, fwRootY - fwH * 0.62],
      [apexX - 2, apexY + 2],
      [fwSpan * 0.96, fwRootY - fwH * 0.16],
      [fwSpan * 0.88, fwRootY + fwH * 0.06],
      [tornusX, tornusY]
    ];
    radTargets.forEach(function (tgt) {
      var dR = "M " + (cx + dcW * s).toFixed(2) + " " + ((fwRootY - dcH * 0.12) * s).toFixed(2) +
               " Q " + (cx + (tgt[0] * 0.7) * s).toFixed(2) + " " + ((tgt[1] * 0.85 + fwRootY * 0.15) * s).toFixed(2) +
               " " + (cx + tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
      var dL = "M " + (cx - dcW * s).toFixed(2) + " " + ((fwRootY - dcH * 0.12) * s).toFixed(2) +
               " Q " + (cx - (tgt[0] * 0.7) * s).toFixed(2) + " " + ((tgt[1] * 0.85 + fwRootY * 0.15) * s).toFixed(2) +
               " " + (cx - tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
      elements.push('<path d="' + dR + ' ' + dL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.85 * s).toFixed(2) + '" stroke-opacity="0.9" />');
    });

    var hwTargets = [
      [hwSpan * 0.76, hwRootY + hwH * 0.28],
      [hwSpan * 0.94, hwRootY + hwH * 0.65],
      [hwSpan * 0.82, hwRootY + hwH * 0.94],
      [hwSpan * 0.62, hwRootY + hwH * 1.05],
      [hwSpan * 0.38, hwRootY + hwH * 1.02]
    ];
    hwTargets.forEach(function (htgt) {
      elements.push(h.symLine(thoraxW * 0.35, hwRootY + 14, htgt[0], htgt[1], p.ink, (0.8 * s).toFixed(2), 0.85));
    });

    for (var fbi = 0; fbi < 8; fbi++) {
      var fbt = fbi / 7;
      var bx1 = dcW * 1.05 + (apexX * 0.85 - dcW * 1.05) * fbt;
      var by1 = (fwRootY - dcH * 0.5) + (tornusY - (fwRootY - dcH * 0.5)) * fbt;
      elements.push(h.symCircle(bx1, by1, 2.2, p.accent, "none", 0, 0.85));
      if (fbi > 0) {
        var prevBx = dcW * 1.05 + (apexX * 0.85 - dcW * 1.05) * ((fbi - 1) / 7);
        var prevBy = (fwRootY - dcH * 0.5) + (tornusY - (fwRootY - dcH * 0.5)) * ((fbi - 1) / 7);
        elements.push(h.symLine(prevBx, prevBy, bx1, by1, p.accent, (0.8 * s).toFixed(2), 0.75, "2,2"));
      }
    }

    for (var lui = 1; lui <= 7; lui++) {
      var lut = lui / 8;
      var lx = apexX + (tornusX - apexX) * lut;
      var ly = apexY + (tornusY - apexY) * lut;
      elements.push(h.symCircle(lx - 9, ly - 3, 3.6, "none", p.accent, (0.9 * s).toFixed(2), 0.9));
      elements.push(h.symCircle(lx - 9, ly - 3, 1.8, p.paper, "none", 0, 0.85));
    }

    var ocX1 = fwSpan * 0.76;
    var ocY1 = fwRootY - fwH * 0.08;
    var ocR1 = 12.0;
    elements.push(h.symCircle(ocX1, ocY1, ocR1, p.paper, p.ink, (1.3 * s).toFixed(2)));
    elements.push(h.symCircle(ocX1, ocY1, ocR1 * 0.78, p.accent, p.ink, (0.85 * s).toFixed(2), 0.9));
    elements.push(h.symCircle(ocX1, ocY1, ocR1 * 0.44, p.ink, "none", 0, 1.0));
    elements.push(h.symCircle(ocX1 - 2.8, ocY1 - 2.8, 1.6, p.paper, "none", 0, 0.98));

    var ocX2 = hwSpan * 0.66;
    var ocY2 = hwRootY + hwH * 0.64;
    var ocR2 = 9.5;
    elements.push(h.symCircle(ocX2, ocY2, ocR2, p.paper, p.ink, (1.2 * s).toFixed(2)));
    elements.push(h.symCircle(ocX2, ocY2, ocR2 * 0.72, p.accent, p.ink, (0.75 * s).toFixed(2), 0.9));
    elements.push(h.symCircle(ocX2, ocY2, ocR2 * 0.38, p.ink, "none", 0, 1.0));
    elements.push(h.symCircle(ocX2 - 2.0, ocY2 - 2.0, 1.3, p.paper, "none", 0, 0.95));

    if (isFalcate) {
      var fenCoords = [
        [dcW * 0.7, fwRootY - dcH * 0.1],
        [dcW * 0.88, fwRootY - dcH * 0.25],
        [dcW * 0.82, fwRootY + dcH * 0.15]
      ];
      elements.push(h.symPath(fenCoords, true, p.paper, p.ink, (1.1 * s).toFixed(2), 1.0, 0.85));
    }

    elements.push(h.symStipple(fwSpan * 0.7, fwRootY - fwH * 0.2, fwSpan * 0.2, fwH * 0.3, 35, 0.5, 0.5));

    var thCoords = [
      [0, thoraxY - thoraxH * 0.5],
      [thoraxW * 0.75, thoraxY - thoraxH * 0.35],
      [thoraxW * 1.05, thoraxY],
      [thoraxW * 0.88, thoraxY + thoraxH * 0.4],
      [0, thoraxY + thoraxH * 0.5]
    ];
    elements.push(h.symPath(thCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));

    for (var thi = -5; thi <= 5; thi++) {
      var ty = thoraxY + thi * 3.5;
      elements.push(h.symLine(thoraxW * 0.25, ty, thoraxW * 1.15, ty + 2.5, p.accent, (0.7 * s).toFixed(2), 0.75));
      elements.push(h.symLine(thoraxW * 0.35, ty, thoraxW * 0.95, ty + 1.5, p.paper, (0.5 * s).toFixed(2), 0.4));
    }

    for (var asi = 0; asi < 8; asi++) {
      var ast = asi / 8;
      var curAY = abdoY0 + ast * abdoH;
      var segH = (abdoH / 8) * 0.94;
      var segW = (abdoW - ast * (abdoW * 0.52));
      var abCoords = [
        [0, curAY],
        [segW * 0.82, curAY + 2],
        [segW, curAY + segH * 0.5],
        [segW * 0.78, curAY + segH],
        [0, curAY + segH]
      ];
      elements.push(h.symPath(abCoords, true, p.chitin, p.ink, (0.95 * s).toFixed(2), 0.98));
      elements.push(h.symLine(segW * 0.2, curAY + segH * 0.5, segW * 0.75, curAY + segH * 0.5, p.ink, (0.55 * s).toFixed(2), 0.45));
      elements.push(h.symCircle(segW * 0.85, curAY + segH * 0.5, 0.7, p.accent, "none", 0, 0.9));
    }

    var hdCoords = [
      [0, headY - headH * 0.52],
      [headW * 0.65, headY - headH * 0.32],
      [headW * 0.88, headY + headH * 0.12],
      [headW * 0.52, headY + headH * 0.5],
      [0, headY + headH * 0.5]
    ];
    elements.push(h.symPath(hdCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));

    var eyeR = 5.5;
    var eyeX = headW * 0.72;
    var eyeY = headY;
    elements.push(h.symCircle(eyeX, eyeY, eyeR, p.paper, p.ink, (1.1 * s).toFixed(2)));
    elements.push(h.symCircle(eyeX, eyeY, eyeR * 0.55, p.accent, "none", 0, 0.85));
    elements.push(h.symCircle(eyeX, eyeY, 1.8, p.ink, "none", 0, 1.0));

    var probR = 9.5;
    var py0 = headY - headH * 0.48;
    elements.push('<path d="M ' + cx.toFixed(2) + ' ' + (py0 * s).toFixed(2) +
                  ' C ' + (cx + probR * s).toFixed(2) + ' ' + ((py0 - probR * 0.6) * s).toFixed(2) +
                  ', ' + (cx - probR * s).toFixed(2) + ' ' + ((py0 - probR * 1.8) * s).toFixed(2) +
                  ', ' + cx.toFixed(2) + ' ' + ((py0 - probR * 2.6) * s).toFixed(2) +
                  ' C ' + (cx + probR * 0.6 * s).toFixed(2) + ' ' + ((py0 - probR * 2.1) * s).toFixed(2) +
                  ', ' + (cx - probR * 0.4 * s).toFixed(2) + ' ' + ((py0 - probR * 1.2) * s).toFixed(2) +
                  ', ' + cx.toFixed(2) + ' ' + ((py0 - probR * 1.6) * s).toFixed(2) + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.2 * s).toFixed(2) + '" />');

    elements.push(h.symLine(headW * 0.25, headY - headH * 0.4, headW * 0.42, headY - headH * 0.8, p.ink, (1.2 * s).toFixed(2), 0.95));
    elements.push(h.symCircle(headW * 0.42, headY - headH * 0.8, 1.5, p.accent, p.ink, (0.6 * s).toFixed(2), 0.9));

    var antBaseX = headW * 0.42;
    var antBaseY = headY - headH * 0.32;
    var antTipX = antBaseX + 58;
    var antTipY = antBaseY - 68;

    if (isFalcate || isTailedLuna) {
      elements.push(h.symLine(antBaseX, antBaseY, antTipX, antTipY, p.ink, (1.3 * s).toFixed(2), 1.0));
      for (var fbi = 1; fbi <= 26; fbi++) {
        var fbt = fbi / 27;
        var fpx = antBaseX + (antTipX - antBaseX) * fbt;
        var fpy = antBaseY + (antTipY - antBaseY) * fbt;
        var featherLen = Math.sin(fbt * Math.PI) * 18.0;
        elements.push(h.symLine(fpx, fpy, fpx + featherLen, fpy - 4.0, p.ink, (0.8 * s).toFixed(2), 0.95));
        elements.push(h.symLine(fpx, fpy, fpx - featherLen * 0.65, fpy - 3.0, p.ink, (0.7 * s).toFixed(2), 0.85));
        elements.push(h.symLine(fpx + featherLen, fpy - 4.0, fpx + featherLen + 2.0, fpy - 5.5, p.accent, (0.5 * s).toFixed(2), 0.75));
      }
    } else {
      elements.push(h.symLine(antBaseX, antBaseY, antTipX - 6, antTipY + 8, p.ink, (1.1 * s).toFixed(2), 1.0));
      elements.push(h.symLine(antTipX - 6, antTipY + 8, antTipX, antTipY, p.ink, (2.8 * s).toFixed(2), 1.0));
      elements.push(h.symCircle(antTipX, antTipY, 2.2, p.accent, p.ink, (0.8 * s).toFixed(2), 0.95));
    }

    var legYs = [thoraxY - 8, thoraxY + 4, thoraxY + 16];
    legYs.forEach(function (ly, lidx) {
      elements.push(h.symLine(thoraxW * 0.4, ly, thoraxW * 0.4 + 26 + lidx * 8, ly + 22, p.ink, (1.0 * s).toFixed(2), 0.85));
      elements.push(h.symLine(thoraxW * 0.4 + 26 + lidx * 8, ly + 22, thoraxW * 0.4 + 45 + lidx * 12, ly + 48, p.ink, (0.85 * s).toFixed(2), 0.85));
    });

    return elements;
  }

  // ORDER 3: ODONATA (Dragonflies - Aeshnidae, Libellulidae, Calopterygidae)
  function drawOdonata(specimen, p, cx, cy, pinY, s, rng, h) {
    var elements = [];

    var bL = specimen.bodyLength / s;
    var wingspanHalf = (specimen.wingspan * 0.5) / s;

    var thoraxW = 22 + rng() * 6;
    var thoraxH = 40 + rng() * 6;
    var thoraxY = pinY / s;

    var headW = 36 + rng() * 6;
    var headH = 18 + rng() * 4;
    var headY = thoraxY - thoraxH * 0.5 - headH * 0.4;

    var abdoW = 11 + rng() * 3;
    var abdoH = bL * 0.66;
    var abdoY0 = thoraxY + thoraxH * 0.5;

    var wingPairs = [
      { name: "Forewing", rootY: thoraxY - 14, span: wingspanHalf * 0.98, chord: wingspanHalf * 0.22, tilt: -10, isHind: false },
      { name: "Hindwing", rootY: thoraxY + 10, span: wingspanHalf * 0.94, chord: wingspanHalf * 0.27, tilt: 6, isHind: true }
    ];

    wingPairs.forEach(function (wp) {
      var wY = wp.rootY;
      var span = wp.span;
      var chord = wp.chord;
      var tipX = span;
      var tipY = wY + wp.tilt;
      var nodusX = span * 0.50;
      var nodusY = wY - chord * 0.42 + wp.tilt * 0.50;

      var wCoords = [
        [thoraxW * 0.35, wY],
        [nodusX * 0.85, wY - chord * 0.45 + wp.tilt * 0.42],
        [nodusX, nodusY + 2.5],
        [nodusX * 1.08, nodusY - 2.5],
        [tipX * 0.86, wY - chord * 0.38 + wp.tilt * 0.86],
        [tipX, tipY],
        [tipX * 0.94, wY + chord * 0.32 + wp.tilt * 0.94],
        [span * 0.65, wY + chord * 0.52 + wp.tilt * 0.65],
        [span * 0.28, wY + chord * 0.48 + wp.tilt * 0.28]
      ];
      if (wp.isHind) {
        wCoords.push([span * 0.16, wY + chord * 0.58]);
        wCoords.push([thoraxW * 0.35, wY + chord * 0.35]);
      } else {
        wCoords.push([thoraxW * 0.35, wY + 6]);
      }

      elements.push(h.symPath(wCoords, true, p.wingTint, p.ink, (1.35 * s).toFixed(2), 0.98));
      elements.push(h.symLine(thoraxW * 0.35, wY, tipX, tipY, p.ink, (1.2 * s).toFixed(2), 1.0));

      var ptX = span * 0.82;
      var ptY = wY - chord * 0.32 + wp.tilt * 0.82;
      var ptW = 18.0;
      var ptH = 4.5;
      elements.push('<rect x="' + (cx + ptX * s).toFixed(2) + '" y="' + (ptY * s).toFixed(2) + '" width="' + (ptW * s).toFixed(2) + '" height="' + (ptH * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />\n' +
                    '<rect x="' + (cx - (ptX + ptW) * s).toFixed(2) + '" y="' + (ptY * s).toFixed(2) + '" width="' + (ptW * s).toFixed(2) + '" height="' + (ptH * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />');
      elements.push(h.symLine(ptX, ptY + ptH, ptX - 4, ptY + ptH + 5, p.ink, (1.1 * s).toFixed(2), 1.0));
      for (var pti = 1; pti <= 5; pti++) {
        elements.push(h.symLine(ptX + pti * 3.0, ptY, ptX + pti * 3.0 - 2, ptY + ptH, p.paper, (0.55 * s).toFixed(2), 0.7));
      }

      for (var vi = 1; vi <= 6; vi++) {
        var vt = (vi - 3.5) / 3.0;
        var vyOff = vt * (chord * 0.34);
        var endX = (vi === 1 ? nodusX : (tipX - 4));
        var endY = (vi === 1 ? nodusY : (tipY + vyOff * 0.25));

        var vD_R = "M " + (cx + thoraxW * 0.35 * s).toFixed(2) + " " + (wY * s).toFixed(2) +
                   " Q " + (cx + span * 0.5 * s).toFixed(2) + " " + ((wY + vyOff + wp.tilt * 0.5) * s).toFixed(2) +
                   " " + (cx + endX * s).toFixed(2) + " " + (endY * s).toFixed(2);
        var vD_L = "M " + (cx - thoraxW * 0.35 * s).toFixed(2) + " " + (wY * s).toFixed(2) +
                   " Q " + (cx - span * 0.5 * s).toFixed(2) + " " + ((wY + vyOff + wp.tilt * 0.5) * s).toFixed(2) +
                   " " + (cx - endX * s).toFixed(2) + " " + (endY * s).toFixed(2);
        elements.push('<path d="' + vD_R + ' ' + vD_L + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.85 * s).toFixed(2) + '" stroke-opacity="0.9" />');
      }

      var arcX = thoraxW * 0.35 + span * 0.12;
      elements.push(h.symLine(arcX, wY - 2, arcX + 2, wY + chord * 0.28, p.ink, (1.2 * s).toFixed(2), 1.0));

      var triCoords = [
        [arcX + 4, wY + 2],
        [arcX + 18, wY + chord * 0.24],
        [arcX + 8, wY + chord * 0.38]
      ];
      elements.push(h.symPath(triCoords, true, "none", p.ink, (1.1 * s).toFixed(2), 1.0));

      for (var ani = 1; ani <= 8; ani++) {
        var ant = ani / 9;
        var anx = thoraxW * 0.4 + (nodusX - thoraxW * 0.4) * ant;
        elements.push(h.symLine(anx, wY - chord * 0.42 + wp.tilt * 0.4 * ant, anx, wY - chord * 0.15 + wp.tilt * 0.4 * ant, p.ink, (0.75 * s).toFixed(2), 0.85));
      }

      for (var pni = 1; pni <= 14; pni++) {
        var pnt = pni / 15;
        var pnx = nodusX + (ptX - nodusX) * pnt;
        elements.push(h.symLine(pnx, nodusY - chord * 0.1 + wp.tilt * 0.4 * pnt, pnx, nodusY + chord * 0.15 + wp.tilt * 0.4 * pnt, p.ink, (0.65 * s).toFixed(2), 0.75));
      }

      for (var cvi = 1; cvi <= 48; cvi++) {
        var cvt = cvi / 49;
        var cvx = thoraxW * 0.4 + span * 0.58 * cvt;
        var cvyTop = wY - chord * 0.35 + wp.tilt * cvt;
        var cvyBot = wY + chord * 0.42 + wp.tilt * cvt;
        var slant = (cvi % 2 === 0 ? 3.0 : -3.0);
        elements.push(h.symLine(cvx, cvyTop, cvx + slant, cvyBot, p.ink, (0.45 * s).toFixed(2), 0.55));
      }
    });

    var eyeR = 13.0;
    var eyeX = headW * 0.48;
    var eyeY = headY;
    elements.push(h.symCircle(eyeX, eyeY, eyeR, p.paper, p.ink, (1.3 * s).toFixed(2)));
    for (var oxi = -4; oxi <= 4; oxi++) {
      for (var oyi = -4; oyi <= 4; oyi++) {
        if (oxi * oxi + oyi * oyi <= 12) {
          elements.push(h.symCircle(eyeX + oxi * 2.4, eyeY + oyi * 2.4, 0.65, p.ink, "none", 0, 0.75));
        }
      }
    }
    elements.push(h.symLine(0, eyeY - eyeR * 0.9, 0, eyeY + eyeR * 0.9, p.ink, (1.3 * s).toFixed(2), 0.95));

    elements.push('<circle cx="' + cx.toFixed(2) + '" cy="' + ((eyeY - 8) * s).toFixed(2) + '" r="' + (1.8 * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.7 * s).toFixed(2) + '" />');
    elements.push(h.symCircle(5.0, eyeY - 4, 1.5, p.accent, p.ink, (0.7 * s).toFixed(2)));

    elements.push(h.symLine(headW * 0.15, eyeY + eyeR * 0.5, headW * 0.35, eyeY + eyeR * 0.8, p.ink, (1.0 * s).toFixed(2), 0.9));
    elements.push(h.symLine(6.5, eyeY - 9, 12.0, eyeY - 20, p.ink, (0.95 * s).toFixed(2), 0.95));

    var thxCoords = [
      [0, thoraxY - thoraxH * 0.5],
      [thoraxW * 0.58, thoraxY - thoraxH * 0.45],
      [thoraxW * 0.98, thoraxY - thoraxH * 0.1],
      [thoraxW * 1.02, thoraxY + thoraxH * 0.35],
      [thoraxW * 0.42, thoraxY + thoraxH * 0.5],
      [0, thoraxY + thoraxH * 0.52]
    ];
    elements.push(h.symPath(thxCoords, true, p.chitin, p.ink, (1.4 * s).toFixed(2), 1.0));
    elements.push(h.symLine(thoraxW * 0.28, thoraxY - thoraxH * 0.38, thoraxW * 0.68, thoraxY + thoraxH * 0.32, p.accent, (2.2 * s).toFixed(2), 0.9));
    elements.push(h.symLine(thoraxW * 0.48, thoraxY - thoraxH * 0.32, thoraxW * 0.88, thoraxY + thoraxH * 0.26, p.ink, (1.0 * s).toFixed(2), 0.85));
    elements.push(h.symCircle(thoraxW * 0.85, thoraxY - 12, 2.5, p.accent, p.ink, (0.7 * s).toFixed(2), 0.9));
    elements.push(h.symCircle(thoraxW * 0.88, thoraxY + 10, 2.5, p.accent, p.ink, (0.7 * s).toFixed(2), 0.9));

    var odLegs = [
      { rY: thoraxY - 12, kX: 45, kY: thoraxY - 38, tX: 70, tY: thoraxY - 60 },
      { rY: thoraxY + 2, kX: 55, kY: thoraxY + 16, tX: 88, tY: thoraxY + 48 },
      { rY: thoraxY + 18, kX: 62, kY: thoraxY + 58, tX: 102, tY: thoraxY + 100 }
    ];
    odLegs.forEach(function (ol) {
      elements.push(h.symLine(thoraxW * 0.4, ol.rY, ol.kX, ol.kY, p.ink, (2.8 * s).toFixed(2), 1.0));
      elements.push(h.symLine(ol.kX, ol.kY, ol.tX, ol.tY, p.ink, (2.0 * s).toFixed(2), 1.0));
      for (var psi = 1; psi <= 5; psi++) {
        var pst = psi / 6;
        var px = ol.kX + (ol.tX - ol.kX) * pst;
        var py = ol.kY + (ol.tY - ol.kY) * pst;
        elements.push(h.symLine(px, py, px + 6.0, py - 3.5, p.ink, (1.1 * s).toFixed(2), 1.0));
        elements.push(h.symLine(px, py, px - 3.5, py + 4.5, p.ink, (1.0 * s).toFixed(2), 0.9));
      }
      elements.push(h.symLine(ol.tX, ol.tY, ol.tX + 5, ol.tY + 4, p.ink, (1.2 * s).toFixed(2), 1.0));
    });

    for (var si = 0; si < 10; si++) {
      var st = si / 10;
      var curAY = abdoY0 + st * abdoH;
      var segH = (abdoH / 10) * 0.95;
      var flare = (si <= 1 ? 1.25 : (si >= 7 ? 1.18 : 0.82));
      var segW = (abdoW * flare - st * 2.2);

      var segCoords = [
        [0, curAY],
        [segW * 0.76, curAY + 2],
        [segW, curAY + segH * 0.5],
        [segW * 0.82, curAY + segH],
        [0, curAY + segH]
      ];
      elements.push(h.symPath(segCoords, true, p.chitin, p.ink, (1.05 * s).toFixed(2), 0.98));
      elements.push(h.symLine(0, curAY + 1, 0, curAY + segH - 1, p.paper, (0.7 * s).toFixed(2), 0.6));
      elements.push(h.symLine(0, curAY + segH, segW * 0.82, curAY + segH, p.ink, (0.65 * s).toFixed(2), 0.7));
      elements.push(h.symLine(segW * 0.45, curAY + 2, segW * 0.5, curAY + segH - 2, p.accent, (0.85 * s).toFixed(2), 0.85));
    }

    var s10Y = abdoY0 + abdoH;
    elements.push(h.symLine(2, s10Y, 7, s10Y + 20, p.ink, (1.6 * s).toFixed(2), 1.0));
    elements.push(h.symLine(7, s10Y + 20, 3, s10Y + 28, p.ink, (1.3 * s).toFixed(2), 1.0));
    elements.push(h.symLine(0, s10Y + 2, 0, s10Y + 16, p.accent, (1.2 * s).toFixed(2), 0.85));

    return elements;
  }

  // Main Generator Function
  function generateInsectPaths(specimen, p) {
    var rng = Mulberry32(specimen.hashVal);
    var cx = specimen.cx;
    var cy = specimen.cy;
    var s = specimen.scaleFactor;
    var order = specimen.order;

    var pinY = cy - 10 * s;

    var h = {
      cx: cx,
      cy: cy,
      s: s,
      rng: rng,
      symPath: function (coords, isClosed, fill, stroke, strokeWidth, strokeOpacity, fillOpacity) {
        fill = fill || "none";
        stroke = stroke || p.ink;
        strokeWidth = strokeWidth || (1.0 * s).toFixed(2);
        strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
        fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;

        var dRight = "M " + (cx + coords[0][0] * s).toFixed(2) + " " + (coords[0][1] * s).toFixed(2);
        for (var i = 1; i < coords.length; i++) {
          dRight += " L " + (cx + coords[i][0] * s).toFixed(2) + " " + (coords[i][1] * s).toFixed(2);
        }
        if (isClosed) dRight += " Z";

        var dLeft = "M " + (cx - coords[0][0] * s).toFixed(2) + " " + (coords[0][1] * s).toFixed(2);
        for (var j = 1; j < coords.length; j++) {
          dLeft += " L " + (cx - coords[j][0] * s).toFixed(2) + " " + (coords[j][1] * s).toFixed(2);
        }
        if (isClosed) dLeft += " Z";

        return '<path d="' + dRight + ' ' + dLeft + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '" stroke-linecap="round" stroke-linejoin="round" />';
      },
      symCubic: function (dRightCommand, dLeftCommand, fill, stroke, strokeWidth, strokeOpacity, fillOpacity) {
        fill = fill || "none";
        stroke = stroke || p.ink;
        strokeWidth = strokeWidth || (1.0 * s).toFixed(2);
        strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
        fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;
        return '<path d="' + dRightCommand + ' ' + dLeftCommand + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '" stroke-linecap="round" stroke-linejoin="round" />';
      },
      symLine: function (x1, y1, x2, y2, stroke, strokeWidth, strokeOpacity, dash) {
        stroke = stroke || p.ink;
        strokeWidth = strokeWidth || (0.8 * s).toFixed(2);
        strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
        var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : '';

        return '<line x1="' + (cx + x1 * s).toFixed(2) + '" y1="' + (y1 * s).toFixed(2) + '" x2="' + (cx + x2 * s).toFixed(2) + '" y2="' + (y2 * s).toFixed(2) + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '"' + dashAttr + ' stroke-linecap="round" />\n' +
               '<line x1="' + (cx - x1 * s).toFixed(2) + '" y1="' + (y1 * s).toFixed(2) + '" x2="' + (cx - x2 * s).toFixed(2) + '" y2="' + (y2 * s).toFixed(2) + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '"' + dashAttr + ' stroke-linecap="round" />';
      },
      symCircle: function (x, y, r, fill, stroke, strokeWidth, fillOpacity) {
        fill = fill || p.ink;
        stroke = stroke || "none";
        strokeWidth = strokeWidth || 0;
        fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;
        return '<circle cx="' + (cx + x * s).toFixed(2) + '" cy="' + (y * s).toFixed(2) + '" r="' + (r * s).toFixed(2) + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" />\n' +
               '<circle cx="' + (cx - x * s).toFixed(2) + '" cy="' + (y * s).toFixed(2) + '" r="' + (r * s).toFixed(2) + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" />';
      },
      symHatch: function (startX, endX, y0, y1, linesCount, strokeWidth, opacity) {
        var res = [];
        strokeWidth = strokeWidth || (0.55 * s).toFixed(2);
        opacity = opacity || 0.45;
        for (var i = 0; i < linesCount; i++) {
          var t = i / (linesCount - 1 || 1);
          var curY = y0 + (y1 - y0) * t;
          var xA = startX + (endX - startX) * (t * 0.6);
          var xB = startX + (endX - startX) * t;
          res.push(this.symLine(xA, curY - 2, xB, curY + 2, p.ink, strokeWidth, opacity));
        }
        return res.join("\n");
      },
      symStipple: function (centerX, centerY, rx, ry, count, dotR, opacity) {
        var res = [];
        dotR = dotR || 0.65;
        opacity = opacity || 0.55;
        for (var i = 0; i < count; i++) {
          var angle = rng() * Math.PI * 2;
          var rad = Math.sqrt(rng());
          var px = centerX + Math.cos(angle) * rx * rad;
          var py = centerY + Math.sin(angle) * ry * rad;
          res.push(this.symCircle(px, py, dotR, p.ink, "none", 0, opacity));
        }
        return res.join("\n");
      }
    };

    var elements = [];

    if (order === 'coleoptera') {
      elements = drawColeoptera(specimen, p, cx, cy, pinY, s, rng, h);
    } else if (order === 'lepidoptera') {
      elements = drawLepidoptera(specimen, p, cx, cy, pinY, s, rng, h);
    } else {
      elements = drawOdonata(specimen, p, cx, cy, pinY, s, rng, h);
    }

    // Central Pin Mount Y Coordinate
    var pinHeadR = 4.8 * s;
    elements.push('  <!-- Central Enameled Brass Entomological Mounting Pin -->');
    elements.push('  <g class="entomological-pin" filter="drop-shadow(0px 3px 4px rgba(42,37,32,0.4))">');
    elements.push('    <circle cx="' + cx.toFixed(2) + '" cy="' + pinY.toFixed(2) + '" r="' + pinHeadR.toFixed(2) + '" fill="#181512" stroke="' + p.pinBrass + '" stroke-width="' + (1.4 * s).toFixed(2) + '" />');
    elements.push('    <circle cx="' + (cx - 1.2 * s).toFixed(2) + '" cy="' + (pinY - 1.2 * s).toFixed(2) + '" r="' + (pinHeadR * 0.38).toFixed(2) + '" fill="' + p.paper + '" fill-opacity="0.6" />');
    elements.push('  </g>');

    return elements.join("\n  ");
  }

  // --- 7. SVG Plate & Presentation Generator ---
  function generateSvgPlate(specimen, options) {
    options = options || {};
    var width = options.width || 600;
    var height = options.height || 600;
    var minDim = Math.min(width, height);
    var scaleFactor = minDim / 600;

    var paletteKey = options.palette || "curio";
    var p = PALETTES[paletteKey] || PALETTES.curio;
    var strokeColor = options.stroke || p.ink;
    var metaColor = options.metaColor || p.meta;

    var margin = options.margin || Math.round(minDim * 0.024);
    var borderGap = Math.max(3, Math.round(minDim * 0.007));
    var outerLineWidth = Math.max(1.0, (minDim / 600) * 1.0);
    var innerLineWidth = Math.max(0.5, (minDim / 600) * 0.5);

    var innerX = margin + borderGap;
    var innerY = margin + borderGap;
    var innerW = width - (margin + borderGap) * 2;
    var innerH = height - (margin + borderGap) * 2;

    // Scale Bar: 5mm Micro-Metric Caliper Rule (SCALE 10:1)
    var barW = Math.round(64 * scaleFactor);
    var barH = Math.max(3, Math.round(3.5 * scaleFactor));
    var segW = barW / 4;
    var tickH = Math.max(2, Math.round(3 * scaleFactor));
    var scaleFontSize = Math.max(7, Math.round(8.5 * scaleFactor));
    var captionFontSize = Math.max(6, Math.round(6.8 * scaleFactor));
    var scaleBarX = margin + borderGap + Math.round(minDim * 0.02);
    var scaleBarY = height - margin - borderGap - barH - captionFontSize - Math.max(4, Math.round(minDim * 0.012));

    // Archival Vermilion Seal Chop: 虫 豸 典 藏 (Bottom-Right)
    var sealSize = Math.max(26, Math.round(minDim * 0.062));
    var sealX = width - margin - borderGap - sealSize - Math.round(minDim * 0.02);
    var sealY = height - margin - borderGap - sealSize - Math.max(4, Math.round(minDim * 0.012));
    var sealInset = Math.max(1.5, sealSize * 0.06);
    var sealFontSize = Math.round(sealSize * 0.36);

    // Hershey Cursive Binomen at Bottom Center
    var cursiveScale = Math.max(0.55, (minDim / 600) * 0.65);
    var cursiveY = height - margin - borderGap - Math.max(18, Math.round(minDim * 0.038));
    var textOut = put_text(specimen.binomen);
    var cursiveW = textOut[0] * cursiveScale;
    var cursiveX = (width - cursiveW) / 2;
    var hersheySvgPaths = hersheyToSvgPaths(specimen.binomen, cursiveX, cursiveY, cursiveScale, -0.22);

    // Anatomical Vector Paths
    var insectElements = generateInsectPaths(specimen, p);

    var lines = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '" style="background-color: ' + p.paper + ';">',
      '  <defs>',
      '    <style>',
      '      @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&amp;family=Noto+Serif+SC:wght@700&amp;display=swap");',
      '      text { font-family: "JetBrains Mono", monospace; }',
      '    </style>',
      '  </defs>',
      '',
      '  <!-- Archival Drafting Borders (Swiss-Archival Standard) -->',
      '  <rect x="' + margin + '" y="' + margin + '" width="' + (width - margin * 2) + '" height="' + (height - margin * 2) + '" fill="none" stroke="' + strokeColor + '" stroke-width="' + outerLineWidth.toFixed(2) + '" />',
      '  <rect x="' + (margin + borderGap) + '" y="' + (margin + borderGap) + '" width="' + (width - (margin + borderGap) * 2) + '" height="' + (height - (margin + borderGap) * 2) + '" fill="none" stroke="' + metaColor + '" stroke-width="' + innerLineWidth.toFixed(2) + '" />',
      '',
      '  <!-- Anatomical Specimen Vector Layer -->',
      '  ' + insectElements,
      '',
      '  <!-- Entomological Caliper Scale Bar (5mm Micro-Metric Rule) -->',
      '  <g class="drafting-scale-bar" transform="translate(' + scaleBarX + ', ' + scaleBarY + ')">',
      '    <rect x="0" y="0" width="' + segW + '" height="' + barH + '" fill="' + strokeColor + '" />',
      '    <rect x="' + segW + '" y="0" width="' + segW + '" height="' + barH + '" fill="none" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <rect x="' + (segW * 2) + '" y="0" width="' + segW + '" height="' + barH + '" fill="' + strokeColor + '" />',
      '    <rect x="' + (segW * 3) + '" y="0" width="' + segW + '" height="' + barH + '" fill="none" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <rect x="0" y="0" width="' + barW + '" height="' + barH + '" fill="none" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <line x1="0" y1="' + (-tickH) + '" x2="0" y2="0" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <line x1="' + (segW * 2) + '" y1="' + (-tickH) + '" x2="' + (segW * 2) + '" y2="0" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <line x1="' + barW + '" y1="' + (-tickH) + '" x2="' + barW + '" y2="0" stroke="' + strokeColor + '" stroke-width="0.75" />',
      '    <text x="0" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">0</text>',
      '    <text x="' + (segW * 2) + '" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">2.5</text>',
      '    <text x="' + barW + '" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">5.0mm</text>',
      '    <text x="0" y="' + (barH + captionFontSize + 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + captionFontSize + '" font-weight="500" fill="' + metaColor + '">MICROMETRIC SCALE 10:1</text>',
      '  </g>',
      '',
      '  <!-- Archival Vermilion Seal Chop (朱砂印章 · 虫豸典藏) -->',
      '  <g class="archival-seal" transform="translate(' + sealX + ', ' + sealY + ')">',
      '    <rect width="' + sealSize + '" height="' + sealSize + '" fill="#B83227" fill-opacity="0.06" stroke="#B83227" stroke-width="' + Math.max(1.2, sealSize * 0.05).toFixed(2) + '" />',
      '    <rect x="' + sealInset + '" y="' + sealInset + '" width="' + (sealSize - sealInset * 2) + '" height="' + (sealSize - sealInset * 2) + '" fill="none" stroke="#B83227" stroke-width="' + Math.max(0.5, sealSize * 0.02).toFixed(2) + '" />',
      '    <line x1="' + (sealSize / 2) + '" y1="' + sealInset + '" x2="' + (sealSize / 2) + '" y2="' + (sealSize - sealInset) + '" stroke="#B83227" stroke-opacity="0.35" stroke-width="0.5" />',
      '    <line x1="' + sealInset + '" y1="' + (sealSize / 2) + '" x2="' + (sealSize - sealInset) + '" y2="' + (sealSize / 2) + '" stroke="#B83227" stroke-opacity="0.35" stroke-width="0.5" />',
      '    <text x="' + (sealSize * 0.28) + '" y="' + (sealSize * 0.38) + '" font-family="\'Noto Serif SC\', \'Source Han Serif\', \'Songti SC\', \'SimSun\', serif" font-weight="bold" font-size="' + sealFontSize + '" fill="#B83227" text-anchor="middle">虫</text>',
      '    <text x="' + (sealSize * 0.72) + '" y="' + (sealSize * 0.38) + '" font-family="\'Noto Serif SC\', \'Source Han Serif\', \'Songti SC\', \'SimSun\', serif" font-weight="bold" font-size="' + sealFontSize + '" fill="#B83227" text-anchor="middle">典</text>',
      '    <text x="' + (sealSize * 0.28) + '" y="' + (sealSize * 0.80) + '" font-family="\'Noto Serif SC\', \'Source Han Serif\', \'Songti SC\', \'SimSun\', serif" font-weight="bold" font-size="' + sealFontSize + '" fill="#B83227" text-anchor="middle">豸</text>',
      '    <text x="' + (sealSize * 0.72) + '" y="' + (sealSize * 0.80) + '" font-family="\'Noto Serif SC\', \'Source Han Serif\', \'Songti SC\', \'SimSun\', serif" font-weight="bold" font-size="' + sealFontSize + '" fill="#B83227" text-anchor="middle">藏</text>',
      '  </g>',
      '',
      '  <!-- Engraved Cursive Binomen (Hershey Simplex) -->',
      '  <g stroke="' + strokeColor + '" stroke-width="' + (outerLineWidth * 1.05).toFixed(2) + '" stroke-linecap="round" stroke-linejoin="round">',
      '    ' + hersheySvgPaths,
      '  </g>',
      '</svg>'
    ];

    return lines.join("\n");
  }

  // --- 8. Canvas High-Resolution Render Utility ---
  function renderToCanvas(canvas, data, options) {
    options = options || {};
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext("2d");
    var svgString = generateSvgPlate(data, {
      width: width,
      height: height,
      palette: options.palette || "curio"
    });

    var blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    return new Promise(function (resolve, reject) {
      img.onload = function () {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = function (e) {
        URL.revokeObjectURL(url);
        reject(e);
      };
      img.src = url;
    });
  }

  // Public API
  return {
    version: "2.0.0",
    synthesize: synthesize,
    generateSvgPlate: generateSvgPlate,
    renderToCanvas: renderToCanvas,
    PALETTES: PALETTES,
    fnv1a: fnv1a,
    Mulberry32: Mulberry32,
    generateSequenceIdentifier: generateSequenceIdentifier,
    recoverHashFromId: recoverHashFromId
  };
});
