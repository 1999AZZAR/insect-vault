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
  function generateInsectPaths(specimen, p) {
    var rng = Mulberry32(specimen.hashVal);
    var cx = specimen.cx;
    var cy = specimen.cy;
    var s = specimen.scaleFactor;
    var order = specimen.order;
    var taxon = specimen.taxon;

    var elements = [];

    // Central Pin Mount Y Coordinate (mesothoracic disc)
    var pinY = cy - 25 * s;

    // Helper: Symmetrical Path String
    function symPath(coords, isClosed, fill, stroke, strokeWidth, strokeOpacity, fillOpacity) {
      fill = fill || "none";
      stroke = stroke || p.ink;
      strokeWidth = strokeWidth || (1.0 * s).toFixed(2);
      strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
      fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;

      // Right half
      var dRight = "M " + (cx + coords[0][0] * s).toFixed(2) + " " + (coords[0][1] * s).toFixed(2);
      for (var i = 1; i < coords.length; i++) {
        dRight += " L " + (cx + coords[i][0] * s).toFixed(2) + " " + (coords[i][1] * s).toFixed(2);
      }
      if (isClosed) dRight += " Z";

      // Left half
      var dLeft = "M " + (cx - coords[0][0] * s).toFixed(2) + " " + (coords[0][1] * s).toFixed(2);
      for (var j = 1; j < coords.length; j++) {
        dLeft += " L " + (cx - coords[j][0] * s).toFixed(2) + " " + (coords[j][1] * s).toFixed(2);
      }
      if (isClosed) dLeft += " Z";

      return '<path d="' + dRight + ' ' + dLeft + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '" stroke-linecap="round" stroke-linejoin="round" />';
    }

    // Helper: Curved Symmetrical Smooth Bezier
    function symCubic(dRightCommand, dLeftCommand, fill, stroke, strokeWidth, strokeOpacity, fillOpacity) {
      fill = fill || "none";
      stroke = stroke || p.ink;
      strokeWidth = strokeWidth || (1.0 * s).toFixed(2);
      strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
      fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;
      return '<path d="' + dRightCommand + ' ' + dLeftCommand + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '" stroke-linecap="round" stroke-linejoin="round" />';
    }

    // Helper: Symmetrical Line
    function symLine(x1, y1, x2, y2, stroke, strokeWidth, strokeOpacity, dash) {
      stroke = stroke || p.ink;
      strokeWidth = strokeWidth || (0.8 * s).toFixed(2);
      strokeOpacity = strokeOpacity !== undefined ? strokeOpacity : 1.0;
      var dashAttr = dash ? ' stroke-dasharray="' + dash + '"' : '';

      return '<line x1="' + (cx + x1 * s).toFixed(2) + '" y1="' + (y1 * s).toFixed(2) + '" x2="' + (cx + x2 * s).toFixed(2) + '" y2="' + (y2 * s).toFixed(2) + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '"' + dashAttr + ' stroke-linecap="round" />\n' +
             '<line x1="' + (cx - x1 * s).toFixed(2) + '" y1="' + (y1 * s).toFixed(2) + '" x2="' + (cx - x2 * s).toFixed(2) + '" y2="' + (y2 * s).toFixed(2) + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '"' + dashAttr + ' stroke-linecap="round" />';
    }

    // Helper: Symmetrical Circle
    function symCircle(x, y, r, fill, stroke, strokeWidth, fillOpacity) {
      fill = fill || p.ink;
      stroke = stroke || "none";
      strokeWidth = strokeWidth || 0;
      fillOpacity = fillOpacity !== undefined ? fillOpacity : 1.0;
      return '<circle cx="' + (cx + x * s).toFixed(2) + '" cy="' + (y * s).toFixed(2) + '" r="' + (r * s).toFixed(2) + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" />\n' +
             '<circle cx="' + (cx - x * s).toFixed(2) + '" cy="' + (y * s).toFixed(2) + '" r="' + (r * s).toFixed(2) + '" fill="' + fill + '" fill-opacity="' + fillOpacity + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" />';
    }

    // Helper: Copperplate Engraving Hatching on Chitin Plate
    function symHatch(startX, endX, y0, y1, linesCount, strokeWidth, opacity) {
      var res = [];
      strokeWidth = strokeWidth || (0.55 * s).toFixed(2);
      opacity = opacity || 0.45;
      for (var i = 0; i < linesCount; i++) {
        var t = i / (linesCount - 1 || 1);
        var curY = y0 + (y1 - y0) * t;
        var xA = startX + (endX - startX) * (t * 0.6);
        var xB = startX + (endX - startX) * t;
        res.push(symLine(xA, curY - 2, xB, curY + 2, p.ink, strokeWidth, opacity));
      }
      return res.join("\n");
    }

    // =========================================================================
    // ORDER 1: COLEOPTERA (Beetles - Lucanidae, Scarabaeidae, Cerambycidae)
    // =========================================================================
    if (order === 'coleoptera') {
      var isHorned = taxon.morphology === 'horned_dynastes' || taxon.morphology === 'horned_atlas';
      var isStag = taxon.morphology === 'stag_lucanus';
      var isLonghorn = taxon.morphology === 'longhorn_cerambyx';

      var bL = specimen.bodyLength / s;
      var pronoW = 46 + rng() * 12;
      var pronoH = 34 + rng() * 8;
      var pronoY = pinY / s - 16;

      var headW = isStag ? 38 + rng() * 8 : (isHorned ? 26 + rng() * 6 : 24 + rng() * 4);
      var headH = 22 + rng() * 6;
      var headY = pronoY - pronoH * 0.5 - headH * 0.45;

      var elyW = pronoW * 1.25;
      var elyH = bL * 0.62;
      var abdoY0 = pronoY + pronoH * 0.5;

      // 1. Mandibles / Cephalic Horns
      if (isStag) {
        // Massive branched stag beetle mandibles
        var manLen = 55 + rng() * 30;
        var mC1 = [
          [headW * 0.35, headY - headH * 0.4],
          [headW * 0.55, headY - headH * 0.7],
          [headW * 0.68, headY - headH * 0.7 - manLen * 0.5],
          [headW * 0.52, headY - headH * 0.7 - manLen * 0.85],
          [headW * 0.15, headY - headH * 0.7 - manLen], // Pincer Tip
          [headW * 0.35, headY - headH * 0.7 - manLen * 0.8],
          [headW * 0.42, headY - headH * 0.7 - manLen * 0.45],
          [headW * 0.22, headY - headH * 0.7 - manLen * 0.25],
          [headW * 0.18, headY - headH * 0.4]
        ];
        elements.push(symPath(mC1, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));
        // Inner Serrate Teeth
        for (var mi = 1; mi <= 4; mi++) {
          var mt = mi / 5;
          var tX = (headW * 0.45 - mt * (headW * 0.3));
          var tY = (headY - headH * 0.7 - manLen * mt);
          elements.push(symLine(tX, tY, tX - 6, tY + 2, p.ink, (1.0 * s).toFixed(2), 0.9));
        }
      } else if (isHorned) {
        // Dynastes / Atlas Horns: Cephalic Horn & Pronotal Horn
        var hLen = 65 + rng() * 35;
        // Cephalic horn (from head)
        var chCoords = [
          [headW * 0.18, headY - headH * 0.4],
          [headW * 0.22, headY - headH * 0.8],
          [headW * 0.14, headY - headH * 0.8 - hLen * 0.7],
          [0, headY - headH * 0.8 - hLen], // Curved Tip
          [headW * 0.06, headY - headH * 0.8 - hLen * 0.65],
          [headW * 0.08, headY - headH * 0.4]
        ];
        elements.push(symPath(chCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));

        // Pronotal Horn (massive overarching horn)
        var prHCoords = [
          [headW * 0.15, pronoY - pronoH * 0.3],
          [headW * 0.18, pronoY - pronoH * 0.7],
          [headW * 0.12, headY - headH * 0.8 - hLen * 0.95],
          [0, headY - headH * 0.8 - hLen * 1.15],
          [headW * 0.04, headY - headH * 0.8 - hLen * 0.9],
          [headW * 0.08, pronoY - pronoH * 0.3]
        ];
        elements.push(symPath(prHCoords, true, p.chitinLight, p.ink, (1.3 * s).toFixed(2), 1.0));
        // Velvet setae fringe under pronotal horn
        for (var vsi = 1; vsi <= 8; vsi++) {
          var vt = vsi / 9;
          var vy = (pronoY - pronoH * 0.6) - vt * (hLen * 0.85);
          elements.push(symLine(headW * 0.06, vy, headW * 0.06 + 3, vy + 2, p.accent, (0.75 * s).toFixed(2), 0.85));
        }
      } else {
        // Standard dentate mandibles & sensory palpi
        var manCoords = [
          [headW * 0.2, headY - headH * 0.5],
          [headW * 0.32, headY - headH * 0.85],
          [headW * 0.05, headY - headH * 1.1],
          [headW * 0.15, headY - headH * 0.75],
          [headW * 0.08, headY - headH * 0.5]
        ];
        elements.push(symPath(manCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 1.0));
        // 4 Segmented Sensory Palpi
        elements.push(symLine(headW * 0.15, headY - headH * 0.5, headW * 0.28, headY - headH * 0.8, p.ink, (0.8 * s).toFixed(2), 0.9));
        elements.push(symLine(headW * 0.28, headY - headH * 0.8, headW * 0.22, headY - headH * 1.05, p.ink, (0.8 * s).toFixed(2), 0.9));
      }

      // 2. Head Capsule (Epicranium, Clypeus)
      var headCoords = [
        [0, headY - headH * 0.5],
        [headW * 0.45, headY - headH * 0.45],
        [headW * 0.8, headY - headH * 0.1],
        [headW * 0.75, headY + headH * 0.45],
        [headW * 0.3, headY + headH * 0.5],
        [0, headY + headH * 0.52]
      ];
      elements.push(symPath(headCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));
      // Epicranial suture line & frontal carina
      elements.push(symLine(0, headY - headH * 0.4, 0, headY + headH * 0.35, p.ink, (0.8 * s).toFixed(2), 0.85));
      elements.push(symLine(headW * 0.2, headY - headH * 0.1, headW * 0.45, headY + headH * 0.15, p.ink, (0.6 * s).toFixed(2), 0.6));

      // 3. Compound Eyes (Canthus dividing ommatidia)
      var eyeR = 6.5;
      var eyeX = headW * 0.72;
      var eyeY = headY;
      elements.push(symCircle(eyeX, eyeY, eyeR, p.paper, p.ink, (1.0 * s).toFixed(2)));
      // Ommatidia hexagonal facet stippling
      for (var fxi = -2; fxi <= 2; fxi++) {
        for (var fyi = -2; fyi <= 2; fyi++) {
          if (fxi * fxi + fyi * fyi <= 4) {
            elements.push(symCircle(eyeX + fxi * 1.8, eyeY + fyi * 1.8, 0.45, p.ink, "none", 0, 0.85));
          }
        }
      }

      // 4. Antennae (Lamellate Scarab Fans or 11-Annulate Longhorn Whips)
      var antBaseX = headW * 0.5;
      var antBaseY = headY - headH * 0.1;
      if (isLonghorn) {
        // Enormous sweeping longhorn antennae
        var antPts = [
          [antBaseX, antBaseY],
          [antBaseX + 35, antBaseY - 25],
          [antBaseX + 75, antBaseY - 45],
          [antBaseX + 115, antBaseY - 25],
          [antBaseX + 140, antBaseY + 30],
          [antBaseX + 145, antBaseY + 95]
        ];
        var dR = "M " + (cx + antPts[0][0] * s).toFixed(2) + " " + (antPts[0][1] * s).toFixed(2);
        var dL = "M " + (cx - antPts[0][0] * s).toFixed(2) + " " + (antPts[0][1] * s).toFixed(2);
        for (var api = 1; api < antPts.length; api++) {
          dR += " L " + (cx + antPts[api][0] * s).toFixed(2) + " " + (antPts[api][1] * s).toFixed(2);
          dL += " L " + (cx - antPts[api][0] * s).toFixed(2) + " " + (antPts[api][1] * s).toFixed(2);
          // Articulated node swellings
          elements.push(symCircle(antPts[api][0], antPts[api][1], 1.6, p.chitin, p.ink, (0.8 * s).toFixed(2)));
        }
        elements.push('<path d="' + dR + ' ' + dL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.2 * s).toFixed(2) + '" stroke-linecap="round" />');
      } else {
        // Lamellate Scarab Antenna (Scape + funicle + fanned leaves)
        var antMidX = antBaseX + 22;
        var antMidY = antBaseY - 32;
        var antTipX = antBaseX + 38;
        var antTipY = antBaseY - 55;
        elements.push(symLine(antBaseX, antBaseY, antMidX, antMidY, p.ink, (1.2 * s).toFixed(2), 0.95));
        elements.push(symLine(antMidX, antMidY, antTipX, antTipY, p.ink, (1.1 * s).toFixed(2), 0.95));
        // 5 Fanned Lamellar Leaf Blades
        for (var li = 0; li < 5; li++) {
          var lx = antTipX + li * 4.5;
          var ly = antTipY - li * 2.5;
          elements.push(symLine(antTipX, antTipY, lx + 16, ly - 8, p.ink, (1.0 * s).toFixed(2), 0.9));
        }
      }

      // 5. Pronotum (Sculpted Prothoracic Shield)
      var pronoCoords = [
        [0, pronoY - pronoH * 0.52],
        [pronoW * 0.45, pronoY - pronoH * 0.48],
        [pronoW * 0.88, pronoY - pronoH * 0.3],
        [pronoW * 0.98, pronoY + pronoH * 0.15],
        [pronoW * 0.82, pronoY + pronoH * 0.48],
        [pronoW * 0.35, pronoY + pronoH * 0.52],
        [0, pronoY + pronoH * 0.54]
      ];
      elements.push(symPath(pronoCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));
      // Pronotal median sulcus & lateral marginal bead
      elements.push(symLine(0, pronoY - pronoH * 0.48, 0, pronoY + pronoH * 0.5, p.ink, (1.0 * s).toFixed(2), 0.85));
      elements.push(symHatch(pronoW * 0.25, pronoW * 0.85, pronoY - pronoH * 0.25, pronoY + pronoH * 0.25, 7, (0.5 * s).toFixed(2), 0.45));

      // 6. Scutellum (Central Triangular Inter-Elytral Shield)
      var scuCoords = [
        [0, abdoY0],
        [14, abdoY0 + 2],
        [0, abdoY0 + 20]
      ];
      elements.push(symPath(scuCoords, true, p.chitinLight, p.ink, (1.1 * s).toFixed(2), 1.0));
      elements.push(symLine(0, abdoY0 + 4, 0, abdoY0 + 17, p.ink, (0.7 * s).toFixed(2), 0.7));

      // 7. Robust Segmented Legs (Coxa, Trochanter, Muscular Femur, Serrated Tibia, 5 Tarsomeres, Ungues)
      var legConfigs = [
        { name: "Prothoracic", rootY: pronoY - 4, kneeX: 65, kneeY: pronoY - 38, tibX: 95, tibY: pronoY - 65, tarX: 110, tarY: pronoY - 95, spines: 4 },
        { name: "Mesothoracic", rootY: pinY + 6, kneeX: 85, kneeY: pinY - 10, tibX: 125, tibY: pinY + 15, tarX: 145, tarY: pinY + 45, spines: 3 },
        { name: "Metathoracic", rootY: abdoY0 + 25, kneeX: 95, kneeY: abdoY0 + 65, tibX: 135, tibY: abdoY0 + 125, tarX: 155, tarY: abdoY0 + 175, spines: 3 }
      ];

      legConfigs.forEach(function (leg) {
        var rx = pronoW * 0.45;
        // Muscular Femur (bulging contour)
        var femW = 5.2;
        elements.push(symLine(rx, leg.rootY, leg.kneeX, leg.kneeY, p.chitin, (femW * s).toFixed(2), 1.0));
        elements.push(symLine(rx, leg.rootY, leg.kneeX, leg.kneeY, p.ink, (1.1 * s).toFixed(2), 0.9));
        // Femoral contour shading
        elements.push(symLine(rx + 10, leg.rootY + 2, leg.kneeX - 6, leg.kneeY + 2, p.ink, (0.6 * s).toFixed(2), 0.5));

        // Spined Tibia
        elements.push(symLine(leg.kneeX, leg.kneeY, leg.tibX, leg.tibY, p.ink, (3.2 * s).toFixed(2), 1.0));
        // Fossorial Tibial Spines / Teeth
        for (var si = 1; si <= leg.spines; si++) {
          var st = si / (leg.spines + 1);
          var sx = leg.kneeX + (leg.tibX - leg.kneeX) * st;
          var sy = leg.kneeY + (leg.tibY - leg.kneeY) * st;
          elements.push(symLine(sx, sy, sx + 7, sy - 3, p.ink, (1.2 * s).toFixed(2), 1.0));
        }
        // Terminal Tibial Calcaria (Spurs at distal joint)
        elements.push(symLine(leg.tibX, leg.tibY, leg.tibX + 5, leg.tibY + 4, p.ink, (1.1 * s).toFixed(2), 0.95));

        // 5 Articulated Tarsomeres
        var curTarX = leg.tibX;
        var curTarY = leg.tibY;
        for (var ti = 1; ti <= 5; ti++) {
          var nxtTarX = leg.tibX + (leg.tarX - leg.tibX) * (ti / 5);
          var nxtTarY = leg.tibY + (leg.tarY - leg.tibY) * (ti / 5);
          var tarStroke = ti === 5 ? (1.2 * s) : (2.0 - ti * 0.2) * s;
          elements.push(symLine(curTarX, curTarY, nxtTarX, nxtTarY, p.ink, tarStroke.toFixed(2), 1.0));
          // Joint node
          elements.push(symCircle(nxtTarX, nxtTarY, 1.1, p.ink, "none", 0, 0.9));
          curTarX = nxtTarX;
          curTarY = nxtTarY;
        }

        // Tarsal Claws (Ungues) & Pulvillus Pad
        elements.push(symLine(curTarX, curTarY, curTarX + 6, curTarY - 4, p.ink, (1.0 * s).toFixed(2), 1.0));
        elements.push(symLine(curTarX, curTarY, curTarX + 6, curTarY + 4, p.ink, (1.0 * s).toFixed(2), 1.0));
        elements.push(symCircle(curTarX + 4, curTarY, 1.2, p.accent, "none", 0, 0.85));
      });

      // 8. Convex Hardened Elytra (Dorsal Wing Sheaths)
      var elyCoords = [
        [2, abdoY0 + 2],
        [elyW * 0.45, abdoY0 + 6],
        [elyW * 0.9, abdoY0 + elyH * 0.22],
        [elyW, abdoY0 + elyH * 0.55],
        [elyW * 0.88, abdoY0 + elyH * 0.82],
        [elyW * 0.45, abdoY0 + elyH * 0.98],
        [2, abdoY0 + elyH]
      ];
      elements.push(symPath(elyCoords, true, p.chitin, p.ink, (1.4 * s).toFixed(2), 1.0));

      // Elytron Midline Suture
      elements.push(symLine(0, abdoY0, 0, abdoY0 + elyH, p.ink, (1.3 * s).toFixed(2), 1.0));
      elements.push(symLine(1.5, abdoY0 + 18, 1.5, abdoY0 + elyH - 4, p.ink, (0.5 * s).toFixed(2), 0.5));

      // Humeral Callus (Prominent shoulder bump with concentric contour shading)
      var humX = elyW * 0.65;
      var humY = abdoY0 + 20;
      elements.push(symCircle(humX, humY, 7.5, "none", p.ink, (0.6 * s).toFixed(2), 0.5));
      elements.push(symCircle(humX, humY, 4.0, "none", p.ink, (0.6 * s).toFixed(2), 0.5));

      // 10 Punctate Striae (Rows of microscopic puncture dots running longitudinally)
      for (var strI = 1; strI <= 7; strI++) {
        var strRatio = strI / 8;
        var pX1 = elyW * strRatio * 0.48;
        var pX2 = elyW * strRatio;
        var pX3 = elyW * strRatio * 0.55;

        // Curved longitudinal guide stroke
        var dStrR = "M " + (cx + pX1 * s).toFixed(2) + " " + ((abdoY0 + 12) * s).toFixed(2) +
                    " Q " + (cx + pX2 * s).toFixed(2) + " " + ((abdoY0 + elyH * 0.5) * s).toFixed(2) +
                    " " + (cx + pX3 * s).toFixed(2) + " " + ((abdoY0 + elyH - 12) * s).toFixed(2);
        var dStrL = "M " + (cx - pX1 * s).toFixed(2) + " " + ((abdoY0 + 12) * s).toFixed(2) +
                    " Q " + (cx - pX2 * s).toFixed(2) + " " + ((abdoY0 + elyH * 0.5) * s).toFixed(2) +
                    " " + (cx - pX3 * s).toFixed(2) + " " + ((abdoY0 + elyH - 12) * s).toFixed(2);
        elements.push('<path d="' + dStrR + ' ' + dStrL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.5 * s).toFixed(2) + '" stroke-opacity="0.35" stroke-dasharray="1.5,2.5" />');

        // Puncture Dots along the stria
        for (var pdi = 1; pdi <= 9; pdi++) {
          var pdt = pdi / 10;
          var curPx = pX1 * (1 - pdt) * (1 - pdt) + pX2 * 2 * (1 - pdt) * pdt + pX3 * pdt * pdt;
          var curPy = (abdoY0 + 12) * (1 - pdt) * (1 - pdt) + (abdoY0 + elyH * 0.5) * 2 * (1 - pdt) * pdt + (abdoY0 + elyH - 12) * pdt * pdt;
          elements.push(symCircle(curPx, curPy, 0.75, p.ink, "none", 0, 0.7));
        }
      }

      // Pygidium (Exposed terminal abdomen tip)
      var pygCoords = [
        [0, abdoY0 + elyH - 2],
        [elyW * 0.28, abdoY0 + elyH + 1],
        [elyW * 0.18, abdoY0 + elyH + 14],
        [0, abdoY0 + elyH + 18]
      ];
      elements.push(symPath(pygCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 1.0));
      elements.push(symHatch(elyW * 0.05, elyW * 0.22, abdoY0 + elyH + 4, abdoY0 + elyH + 12, 4, (0.5 * s).toFixed(2), 0.5));
    }

    // =========================================================================
    // ORDER 2: LEPIDOPTERA (Butterflies & Moths - Papilionidae, Saturniidae)
    // =========================================================================
    else if (order === 'lepidoptera') {
      var isTailed = taxon.morphology === 'tailed_papilio' || taxon.morphology === 'tailed_luna' || taxon.morphology === 'tailed_urania';
      var isFalcate = taxon.morphology === 'falcate_saturniid' || taxon.morphology === 'falcate_birdwing' || taxon.morphology === 'falcate_leaf';

      var bL = specimen.bodyLength / s;
      var wingspanHalf = (specimen.wingspan * 0.5) / s;

      var thoraxW = 20 + rng() * 6;
      var thoraxH = 36 + rng() * 6;
      var thoraxY = pinY / s;

      var headW = 16 + rng() * 4;
      var headH = 14 + rng() * 3;
      var headY = thoraxY - thoraxH * 0.5 - headH * 0.5;

      var abdoW = 18 + rng() * 4;
      var abdoH = bL * 0.52;
      var abdoY0 = thoraxY + thoraxH * 0.5;

      // 1. Forewings (Grand Triangular / Falcate Alae Anteriores)
      var fwSpan = wingspanHalf * 0.95;
      var fwH = fwSpan * 0.68;
      var fwRootY = thoraxY - 10;

      // Forewing Perimeter Coordinates
      var apexX = fwSpan;
      var apexY = fwRootY - fwH * 0.72;
      var tornusX = fwSpan * 0.68;
      var tornusY = fwRootY + fwH * 0.42;

      var fwCoords = [
        [thoraxW * 0.4, fwRootY],
        [fwSpan * 0.48, fwRootY - fwH * 0.62], // Costa curve
        [apexX, apexY], // Apex
        [fwSpan * 0.94, fwRootY - fwH * 0.3], // Termen outer margin
        [fwSpan * 0.84, fwRootY + fwH * 0.12],
        [tornusX, tornusY], // Tornus
        [fwSpan * 0.35, tornusY + 4], // Dorsum inner margin
        [thoraxW * 0.4, fwRootY + 12]
      ];
      elements.push(symPath(fwCoords, true, p.wingTint, p.ink, (1.4 * s).toFixed(2), 0.98));

      // 2. Hindwings (Alae Posteriores - Rounded or with Swallowtail Spatulate Tails)
      var hwSpan = fwSpan * 0.68;
      var hwH = fwH * 0.82;
      var hwRootY = thoraxY + 8;

      var hwCoords = [
        [thoraxW * 0.35, hwRootY],
        [hwSpan * 0.7, hwRootY + hwH * 0.25],
        [hwSpan * 0.95, hwRootY + hwH * 0.65],
        [hwSpan * 0.82, hwRootY + hwH * 0.95]
      ];

      if (isTailed) {
        // Long Swallowtail Spatulate Tail
        var tailLen = 42 + rng() * 25;
        hwCoords.push([hwSpan * 0.75, hwRootY + hwH * 1.05 + tailLen * 0.5]);
        hwCoords.push([hwSpan * 0.72, hwRootY + hwH * 1.05 + tailLen]); // Tail Tip
        hwCoords.push([hwSpan * 0.64, hwRootY + hwH * 1.05 + tailLen * 0.7]);
        hwCoords.push([hwSpan * 0.55, hwRootY + hwH * 1.02]);
      } else {
        hwCoords.push([hwSpan * 0.55, hwRootY + hwH * 1.08]);
      }

      hwCoords.push([hwSpan * 0.25, hwRootY + hwH * 0.96]);
      hwCoords.push([thoraxW * 0.35, hwRootY + hwH * 0.65]);
      elements.push(symPath(hwCoords, true, p.wingTint, p.ink, (1.3 * s).toFixed(2), 0.98));

      // 3. Comstock-Needham Venation: Closed Discal Cell (Forewing & Hindwing)
      var dcW = fwSpan * 0.38;
      var dcH = fwH * 0.28;
      var dcCoords = [
        [thoraxW * 0.45, fwRootY],
        [dcW * 0.7, fwRootY - dcH * 0.7],
        [dcW, fwRootY - dcH * 0.1],
        [dcW * 0.82, fwRootY + dcH * 0.55],
        [thoraxW * 0.45, fwRootY + 8]
      ];
      elements.push(symPath(dcCoords, true, "none", p.ink, (1.1 * s).toFixed(2), 0.9));

      // Radial Veins (R1, R2, R3, R4, R5) radiating to Costa and Apex
      var radTargets = [
        [fwSpan * 0.7, fwRootY - fwH * 0.68],
        [fwSpan * 0.86, fwRootY - fwH * 0.6],
        [apexX - 2, apexY + 2],
        [fwSpan * 0.95, fwRootY - fwH * 0.15],
        [fwSpan * 0.88, fwRootY + fwH * 0.05],
        [tornusX, tornusY]
      ];
      radTargets.forEach(function (tgt) {
        var dR = "M " + (cx + dcW * s).toFixed(2) + " " + ((fwRootY - dcH * 0.1) * s).toFixed(2) +
                 " Q " + (cx + (tgt[0] * 0.7) * s).toFixed(2) + " " + ((tgt[1] * 0.85 + fwRootY * 0.15) * s).toFixed(2) +
                 " " + (cx + tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
        var dL = "M " + (cx - dcW * s).toFixed(2) + " " + ((fwRootY - dcH * 0.1) * s).toFixed(2) +
                 " Q " + (cx - (tgt[0] * 0.7) * s).toFixed(2) + " " + ((tgt[1] * 0.85 + fwRootY * 0.15) * s).toFixed(2) +
                 " " + (cx - tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
        elements.push('<path d="' + dR + ' ' + dL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.75 * s).toFixed(2) + '" stroke-opacity="0.85" />');
      });

      // Hindwing Venation Radiating from Basal Stem
      var hwVeinTargets = [
        [hwSpan * 0.75, hwRootY + hwH * 0.3],
        [hwSpan * 0.92, hwRootY + hwH * 0.65],
        [hwSpan * 0.78, hwRootY + hwH * 0.95],
        [hwSpan * 0.52, hwRootY + hwH * 1.05]
      ];
      hwVeinTargets.forEach(function (htgt) {
        elements.push(symLine(thoraxW * 0.35, hwRootY + 12, htgt[0], htgt[1], p.ink, (0.75 * s).toFixed(2), 0.8));
      });

      // 4. Concentric Ocelli (Eyespots) on Forewing & Hindwing
      var ocX1 = fwSpan * 0.75;
      var ocY1 = fwRootY - fwH * 0.08;
      var ocR1 = 11.0;
      elements.push(symCircle(ocX1, ocY1, ocR1, p.paper, p.ink, (1.2 * s).toFixed(2)));
      elements.push(symCircle(ocX1, ocY1, ocR1 * 0.75, p.accent, p.ink, (0.8 * s).toFixed(2), 0.9));
      elements.push(symCircle(ocX1, ocY1, ocR1 * 0.42, p.ink, "none", 0, 1.0));
      elements.push(symCircle(ocX1 - 2.5, ocY1 - 2.5, 1.4, p.paper, "none", 0, 0.95)); // Specular highlight glint!

      // Hindwing Ocellus
      var ocX2 = hwSpan * 0.65;
      var ocY2 = hwRootY + hwH * 0.62;
      var ocR2 = 8.5;
      elements.push(symCircle(ocX2, ocY2, ocR2, p.paper, p.ink, (1.1 * s).toFixed(2)));
      elements.push(symCircle(ocX2, ocY2, ocR2 * 0.7, p.accent, "none", 0, 0.9));
      elements.push(symCircle(ocX2, ocY2, ocR2 * 0.35, p.ink, "none", 0, 1.0));

      // 5. Submarginal Scalloped Lunules (Crescents along Wing Margin)
      for (var lui = 1; lui <= 6; lui++) {
        var lut = lui / 7;
        var lx = apexX + (tornusX - apexX) * lut;
        var ly = apexY + (tornusY - apexY) * lut;
        elements.push(symCircle(lx - 10, ly - 4, 3.2, "none", p.accent, (0.85 * s).toFixed(2), 0.85));
      }

      // 6. Micro-Striation Lithograph Wing Scale Hatching
      for (var whi = 1; whi <= 10; whi++) {
        var wht = whi / 11;
        var wx1 = dcW + (fwSpan * 0.85 - dcW) * (wht * 0.4);
        var wy1 = fwRootY - dcH * 0.4 + (fwH * 0.6) * (wht * 0.3);
        var wx2 = dcW + (fwSpan * 0.85 - dcW) * wht;
        var wy2 = fwRootY - dcH * 0.4 + (fwH * 0.6) * wht;
        elements.push(symLine(wx1, wy1, wx2, wy2, p.ink, (0.45 * s).toFixed(2), 0.45, "2,3"));
      }

      // 7. Densely Pilose Thorax & Abdomen
      var thCoords = [
        [0, thoraxY - thoraxH * 0.5],
        [thoraxW * 0.7, thoraxY - thoraxH * 0.35],
        [thoraxW, thoraxY],
        [thoraxW * 0.85, thoraxY + thoraxH * 0.4],
        [0, thoraxY + thoraxH * 0.5]
      ];
      elements.push(symPath(thCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 1.0));
      // Thoracic Pilosity (Fine hair setae hatching)
      for (var thi = -4; thi <= 4; thi++) {
        var ty = thoraxY + thi * 3.5;
        elements.push(symLine(thoraxW * 0.3, ty, thoraxW * 0.95, ty + 2, p.ink, (0.6 * s).toFixed(2), 0.55));
      }

      // Abdomen: 8 Articulated Segments with Lateral Pleurite Rings
      for (var asi = 0; asi < 8; asi++) {
        var ast = asi / 8;
        var curAY = abdoY0 + ast * abdoH;
        var segH = (abdoH / 8) * 0.92;
        var segW = (abdoW - ast * (abdoW * 0.55));
        var abCoords = [
          [0, curAY],
          [segW * 0.8, curAY + 2],
          [segW, curAY + segH * 0.5],
          [segW * 0.75, curAY + segH],
          [0, curAY + segH]
        ];
        elements.push(symPath(abCoords, true, p.chitin, p.ink, (0.9 * s).toFixed(2), 0.95));
        elements.push(symLine(segW * 0.2, curAY + segH * 0.5, segW * 0.8, curAY + segH * 0.5, p.ink, (0.5 * s).toFixed(2), 0.4));
      }

      // 8. Head, Coiled Haustellum Proboscis & Feathery Plumose Antennae
      var hdCoords = [
        [0, headY - headH * 0.5],
        [headW * 0.6, headY - headH * 0.3],
        [headW * 0.85, headY + headH * 0.1],
        [headW * 0.5, headY + headH * 0.5],
        [0, headY + headH * 0.5]
      ];
      elements.push(symPath(hdCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 1.0));
      // Compound Eyes
      elements.push(symCircle(headW * 0.68, headY, 5.0, p.paper, p.ink, (1.0 * s).toFixed(2)));
      elements.push(symCircle(headW * 0.68, headY, 2.0, p.ink, "none", 0, 0.9));

      // Coiled Spiral Haustellum (Proboscis)
      var probR = 8.0;
      var py0 = headY - headH * 0.45;
      elements.push('<path d="M ' + cx.toFixed(2) + ' ' + (py0 * s).toFixed(2) +
                    ' C ' + (cx + probR * s).toFixed(2) + ' ' + ((py0 - probR * 0.5) * s).toFixed(2) +
                    ', ' + (cx - probR * 0.8 * s).toFixed(2) + ' ' + ((py0 - probR * 1.5) * s).toFixed(2) +
                    ', ' + cx.toFixed(2) + ' ' + ((py0 - probR * 2.2) * s).toFixed(2) + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.1 * s).toFixed(2) + '" />');

      // Antennae: Bipectinate Plumose Feathered Shafts
      var antBaseX = headW * 0.4;
      var antBaseY = headY - headH * 0.3;
      var antTipX = antBaseX + 55;
      var antTipY = antBaseY - 65;

      elements.push(symLine(antBaseX, antBaseY, antTipX, antTipY, p.ink, (1.2 * s).toFixed(2), 1.0));
      // 24 Pairs of Feathery Rami with micro-cilia
      for (var fbi = 1; fbi <= 20; fbi++) {
        var fbt = fbi / 21;
        var fpx = antBaseX + (antTipX - antBaseX) * fbt;
        var fpy = antBaseY + (antTipY - antBaseY) * fbt;
        var featherLen = Math.sin(fbt * Math.PI) * 16.0;
        elements.push(symLine(fpx, fpy, fpx + featherLen, fpy - 3.5, p.ink, (0.75 * s).toFixed(2), 0.9));
        elements.push(symLine(fpx, fpy, fpx - featherLen * 0.6, fpy - 2.5, p.ink, (0.65 * s).toFixed(2), 0.8));
      }

      // Delicate Legs folded beneath
      var legYs = [thoraxY - 8, thoraxY + 4, thoraxY + 16];
      legYs.forEach(function (ly, lidx) {
        elements.push(symLine(thoraxW * 0.4, ly, thoraxW * 0.4 + 25 + lidx * 8, ly + 22, p.ink, (1.0 * s).toFixed(2), 0.85));
        elements.push(symLine(thoraxW * 0.4 + 25 + lidx * 8, ly + 22, thoraxW * 0.4 + 42 + lidx * 12, ly + 48, p.ink, (0.8 * s).toFixed(2), 0.85));
      });
    }

    // =========================================================================
    // ORDER 3: ODONATA (Dragonflies - Aeshnidae, Libellulidae, Calopterygidae)
    // =========================================================================
    else {
      var bL = specimen.bodyLength / s;
      var wingspanHalf = (specimen.wingspan * 0.5) / s;

      var thoraxW = 22 + rng() * 6;
      var thoraxH = 38 + rng() * 6;
      var thoraxY = pinY / s;

      var headW = 34 + rng() * 6; // Colossal hemispherical eyes
      var headH = 18 + rng() * 4;
      var headY = thoraxY - thoraxH * 0.5 - headH * 0.4;

      var abdoW = 11 + rng() * 3;
      var abdoH = bL * 0.65;
      var abdoY0 = thoraxY + thoraxH * 0.5;

      // 1. Four Expansive Vitreous Wings (Forewing pair & Hindwing pair)
      var wingPairs = [
        { name: "Forewing", rootY: thoraxY - 14, span: wingspanHalf * 0.98, chord: wingspanHalf * 0.22, tilt: -10 },
        { name: "Hindwing", rootY: thoraxY + 10, span: wingspanHalf * 0.94, chord: wingspanHalf * 0.26, tilt: 6 }
      ];

      wingPairs.forEach(function (wp) {
        var wY = wp.rootY;
        var span = wp.span;
        var chord = wp.chord;
        var tipX = span;
        var tipY = wY + wp.tilt;
        var nodusX = span * 0.48;
        var nodusY = wY - chord * 0.42 + wp.tilt * 0.48;

        // Wing Perimeter with authentic Nodus indentation
        var wCoords = [
          [thoraxW * 0.35, wY],
          [nodusX * 0.85, wY - chord * 0.45 + wp.tilt * 0.4],
          [nodusX, nodusY + 2], // Nodus notch
          [nodusX * 1.08, nodusY - 2],
          [tipX * 0.85, wY - chord * 0.38 + wp.tilt * 0.85],
          [tipX, tipY], // Apex
          [tipX * 0.94, wY + chord * 0.32 + wp.tilt * 0.94],
          [span * 0.65, wY + chord * 0.52 + wp.tilt * 0.65],
          [span * 0.28, wY + chord * 0.48 + wp.tilt * 0.28],
          [thoraxW * 0.35, wY + 6]
        ];
        elements.push(symPath(wCoords, true, p.wingTint, p.ink, (1.3 * s).toFixed(2), 0.98));

        // Pterostigma (Opaque Rectangular Cell near Apex)
        var ptX = span * 0.82;
        var ptY = wY - chord * 0.32 + wp.tilt * 0.82;
        var ptW = 16.0;
        var ptH = 4.2;
        elements.push('<rect x="' + (cx + ptX * s).toFixed(2) + '" y="' + (ptY * s).toFixed(2) + '" width="' + (ptW * s).toFixed(2) + '" height="' + (ptH * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />\n' +
                      '<rect x="' + (cx - (ptX + ptW) * s).toFixed(2) + '" y="' + (ptY * s).toFixed(2) + '" width="' + (ptW * s).toFixed(2) + '" height="' + (ptH * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
        // Pterostigma micro-hatching
        for (var pti = 1; pti <= 4; pti++) {
          elements.push(symLine(ptX + pti * 3.2, ptY, ptX + pti * 3.2 - 2, ptY + ptH, p.paper, (0.55 * s).toFixed(2), 0.65));
        }

        // Primary Longitudinal Veins: Costa, Subcosta, Radius, Media, Cubitus
        for (var vi = 1; vi <= 5; vi++) {
          var vt = (vi - 3) / 2.5;
          var vyOff = vt * (chord * 0.32);
          var vD_R = "M " + (cx + thoraxW * 0.35 * s).toFixed(2) + " " + (wY * s).toFixed(2) +
                     " Q " + (cx + span * 0.5 * s).toFixed(2) + " " + ((wY + vyOff + wp.tilt * 0.5) * s).toFixed(2) +
                     " " + (cx + (tipX - 4) * s).toFixed(2) + " " + ((tipY + vyOff * 0.3) * s).toFixed(2);
          var vD_L = "M " + (cx - thoraxW * 0.35 * s).toFixed(2) + " " + (wY * s).toFixed(2) +
                     " Q " + (cx - span * 0.5 * s).toFixed(2) + " " + ((wY + vyOff + wp.tilt * 0.5) * s).toFixed(2) +
                     " " + (cx - (tipX - 4) * s).toFixed(2) + " " + ((tipY + vyOff * 0.3) * s).toFixed(2);
          elements.push('<path d="' + vD_R + ' ' + vD_L + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.8 * s).toFixed(2) + '" stroke-opacity="0.88" />');
        }

        // Discoidal Triangle & Supratriangle near Wing Base
        var triCoords = [
          [thoraxW * 0.35 + 14, wY + 1],
          [thoraxW * 0.35 + 26, wY + chord * 0.22],
          [thoraxW * 0.35 + 18, wY + chord * 0.35]
        ];
        elements.push(symPath(triCoords, true, "none", p.ink, (1.0 * s).toFixed(2), 0.95));

        // High-Density Voronoi / Reticulated Crossveins (36 Crossveins per wing)
        for (var cvi = 1; cvi <= 36; cvi++) {
          var cvt = cvi / 37;
          var cvx = thoraxW * 0.4 + span * 0.58 * cvt;
          var cvyTop = wY - chord * 0.35 + wp.tilt * cvt;
          var cvyBot = wY + chord * 0.42 + wp.tilt * cvt;
          var slant = (cvi % 2 === 0 ? 2.5 : -2.5);
          elements.push(symLine(cvx, cvyTop, cvx + slant, cvyBot, p.ink, (0.45 * s).toFixed(2), 0.55));
        }
      });

      // 2. Head Capsule & Colossal Hemispherical Compound Eyes
      var eyeR = 12.0;
      var eyeX = headW * 0.48;
      var eyeY = headY;
      // Dual huge compound eyes meeting at coronal seam
      elements.push(symCircle(eyeX, eyeY, eyeR, p.paper, p.ink, (1.2 * s).toFixed(2)));
      // Hexagonal ommatidial facet network
      for (var oxi = -3; oxi <= 3; oxi++) {
        for (var oyi = -3; oyi <= 3; oyi++) {
          if (oxi * oxi + oyi * oyi <= 9) {
            elements.push(symCircle(eyeX + oxi * 2.5, eyeY + oyi * 2.5, 0.65, p.ink, "none", 0, 0.75));
          }
        }
      }
      // Epicranial seam connecting eyes
      elements.push(symLine(0, eyeY - eyeR * 0.8, 0, eyeY + eyeR * 0.8, p.ink, (1.1 * s).toFixed(2), 0.9));

      // 3 Dorsal Ocelli (Median Simple Eyes on Vertex Triangle)
      elements.push('<circle cx="' + cx.toFixed(2) + '" cy="' + ((eyeY - 7) * s).toFixed(2) + '" r="' + (1.6 * s).toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.6 * s).toFixed(2) + '" />');
      elements.push(symCircle(4.5, eyeY - 3, 1.4, p.accent, p.ink, (0.6 * s).toFixed(2)));

      // Minute Sensory Bristle Antennae
      elements.push(symLine(6.0, eyeY - 8, 11.0, eyeY - 18, p.ink, (0.9 * s).toFixed(2), 0.95));

      // 3. Muscular Synthorax (Pterothorax) with Antehumeral Sclerite Stripes
      var thxCoords = [
        [0, thoraxY - thoraxH * 0.5],
        [thoraxW * 0.55, thoraxY - thoraxH * 0.45],
        [thoraxW * 0.95, thoraxY - thoraxH * 0.1],
        [thoraxW, thoraxY + thoraxH * 0.35],
        [thoraxW * 0.4, thoraxY + thoraxH * 0.5],
        [0, thoraxY + thoraxH * 0.52]
      ];
      elements.push(symPath(thxCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 1.0));
      // Antehumeral Stripes & Pleural Suture
      elements.push(symLine(thoraxW * 0.3, thoraxY - thoraxH * 0.35, thoraxW * 0.65, thoraxY + thoraxH * 0.3, p.accent, (1.8 * s).toFixed(2), 0.85));
      elements.push(symLine(thoraxW * 0.5, thoraxY - thoraxH * 0.3, thoraxW * 0.85, thoraxY + thoraxH * 0.25, p.ink, (0.9 * s).toFixed(2), 0.8));

      // 4. Predatory Basket Legs (armed with double rows of stiff spines)
      var odLegs = [
        { rY: thoraxY - 10, kX: 42, kY: thoraxY - 35, tX: 65, tY: thoraxY - 55 },
        { rY: thoraxY + 2, kX: 52, kY: thoraxY + 15, tX: 82, tY: thoraxY + 45 },
        { rY: thoraxY + 16, kX: 58, kY: thoraxY + 55, tX: 95, tY: thoraxY + 95 }
      ];
      odLegs.forEach(function (ol) {
        elements.push(symLine(thoraxW * 0.4, ol.rY, ol.kX, ol.kY, p.ink, (2.6 * s).toFixed(2), 1.0));
        elements.push(symLine(ol.kX, ol.kY, ol.tX, ol.tY, p.ink, (1.8 * s).toFixed(2), 1.0));
        // Double row of predatory spines
        for (var psi = 1; psi <= 4; psi++) {
          var pst = psi / 5;
          var px = ol.kX + (ol.tX - ol.kX) * pst;
          var py = ol.kY + (ol.tY - ol.kY) * pst;
          elements.push(symLine(px, py, px + 5, py - 3, p.ink, (1.0 * s).toFixed(2), 0.95));
          elements.push(symLine(px, py, px - 3, py + 4, p.ink, (0.9 * s).toFixed(2), 0.85));
        }
      });

      // 5. Elongated 10-Segmented Abdomen (S1 through S10) with Carina
      for (var si = 0; si < 10; si++) {
        var st = si / 10;
        var curAY = abdoY0 + st * abdoH;
        var segH = (abdoH / 10) * 0.94;
        // Natural flare at S1-S2, slender waist S3-S7, dilation at S8-S10
        var flare = (si <= 1 ? 1.2 : (si >= 7 ? 1.15 : 0.85));
        var segW = (abdoW * flare - st * 2.0);

        var segCoords = [
          [0, curAY],
          [segW * 0.75, curAY + 2],
          [segW, curAY + segH * 0.5],
          [segW * 0.8, curAY + segH],
          [0, curAY + segH]
        ];
        elements.push(symPath(segCoords, true, p.chitin, p.ink, (1.0 * s).toFixed(2), 0.95));

        // Lateral Carina & Transverse Ring
        elements.push(symLine(0, curAY + segH, segW * 0.8, curAY + segH, p.ink, (0.6 * s).toFixed(2), 0.6));
        elements.push(symLine(segW * 0.45, curAY + 2, segW * 0.5, curAY + segH - 2, p.accent, (0.8 * s).toFixed(2), 0.75));
      }

      // Terminal Caudal Claspers (Cerci & Paraprocts) at S10
      var s10Y = abdoY0 + abdoH;
      elements.push(symLine(2, s10Y, 6, s10Y + 18, p.ink, (1.5 * s).toFixed(2), 1.0));
      elements.push(symLine(6, s10Y + 18, 3, s10Y + 24, p.ink, (1.2 * s).toFixed(2), 1.0));
    }

    // =========================================================================
    // CABINET-OF-CURIOSITIES ENTOMOLOGICAL MOUNTING PIN
    // =========================================================================
    var pinHeadR = 4.8 * s;
    elements.push('  <!-- Central Enameled Brass Entomological Mounting Pin -->');
    elements.push('  <g class="entomological-pin" filter="drop-shadow(0px 3px 4px rgba(42,37,32,0.4))">');
    elements.push('    <circle cx="' + cx.toFixed(2) + '" cy="' + pinY.toFixed(2) + '" r="' + pinHeadR.toFixed(2) + '" fill="#181512" stroke="' + p.pinBrass + '" stroke-width="' + (1.4 * s).toFixed(2) + '" />');
    elements.push('    <circle cx="' + (cx - 1.2 * s).toFixed(2) + '" cy="' + (pinY - 1.2 * s).toFixed(2) + '" r="' + (pinHeadR * 0.38).toFixed(2) + '" fill="' + p.paper + '" fill-opacity="0.6" />');
    elements.push('  </g>');

    // =========================================================================
    // SCIENTIFIC LEADER CALLOUT ANNOTATIONS (Copperplate Dissection Ephemera)
    // =========================================================================
    var annotations = [];
    if (order === 'coleoptera') {
      annotations = [
        { label: "a", text: "Mandibula dentata", targetX: cx - (isStag ? 40 : 25) * s, targetY: (pinY - 60 * s), leaderX: cx - 140 * s, leaderY: (pinY - 60 * s) },
        { label: "b", text: "Pronotum convexum", targetX: cx - 35 * s, targetY: (pinY - 20 * s), leaderX: cx - 140 * s, leaderY: (pinY - 20 * s) },
        { label: "c", text: "Scutellum mesothoracicum", targetX: cx + 12 * s, targetY: (pinY + 10 * s), leaderX: cx + 140 * s, leaderY: (pinY + 10 * s) },
        { label: "d", text: "Elytron costato-punctatum", targetX: cx + 55 * s, targetY: (pinY + 55 * s), leaderX: cx + 140 * s, leaderY: (pinY + 55 * s) },
        { label: "e", text: "Tarsus 5-articulatus", targetX: cx - 80 * s, targetY: (pinY + 110 * s), leaderX: cx - 140 * s, leaderY: (pinY + 110 * s) }
      ];
    } else if (order === 'lepidoptera') {
      annotations = [
        { label: "a", text: "Haustellum spirale", targetX: cx, targetY: (pinY - 45 * s), leaderX: cx - 140 * s, leaderY: (pinY - 45 * s) },
        { label: "b", text: "Antenna bipectinata", targetX: cx - 50 * s, targetY: (pinY - 55 * s), leaderX: cx - 140 * s, leaderY: (pinY - 80 * s) },
        { label: "c", text: "Cellula discalis clausa", targetX: cx - 45 * s, targetY: (pinY - 12 * s), leaderX: cx - 140 * s, leaderY: (pinY - 15 * s) },
        { label: "d", text: "Ocellus submarginalis", targetX: cx + 110 * s, targetY: (pinY - 8 * s), leaderX: cx + 155 * s, leaderY: (pinY - 8 * s) },
        { label: "e", text: "Ala posterior caudata", targetX: cx + 75 * s, targetY: (pinY + 70 * s), leaderX: cx + 155 * s, leaderY: (pinY + 70 * s) }
      ];
    } else {
      annotations = [
        { label: "a", text: "Oculus compositus", targetX: cx - 22 * s, targetY: (pinY - 32 * s), leaderX: cx - 140 * s, leaderY: (pinY - 32 * s) },
        { label: "b", text: "Nodus alaris", targetX: cx - 95 * s, targetY: (pinY - 18 * s), leaderX: cx - 140 * s, leaderY: (pinY - 60 * s) },
        { label: "c", text: "Pterostigma apicale", targetX: cx + 145 * s, targetY: (pinY - 16 * s), leaderX: cx + 160 * s, leaderY: (pinY - 40 * s) },
        { label: "d", text: "Rete venarum reticulatum", targetX: cx + 85 * s, targetY: (pinY + 12 * s), leaderX: cx + 160 * s, leaderY: (pinY + 12 * s) },
        { label: "e", text: "Urotergita abdominalia", targetX: cx - 10 * s, targetY: (pinY + 65 * s), leaderX: cx - 140 * s, leaderY: (pinY + 65 * s) }
      ];
    }

    elements.push('  <!-- Anatomical Leader Annotation Lines -->');
    annotations.forEach(function (ann) {
      elements.push('  <g class="anatomical-callout">');
      elements.push('    <circle cx="' + ann.targetX.toFixed(2) + '" cy="' + ann.targetY.toFixed(2) + '" r="' + (1.6 * s).toFixed(2) + '" fill="' + p.accent + '" />');
      elements.push('    <line x1="' + ann.targetX.toFixed(2) + '" y1="' + ann.targetY.toFixed(2) + '" x2="' + ann.leaderX.toFixed(2) + '" y2="' + ann.leaderY.toFixed(2) + '" stroke="' + p.meta + '" stroke-width="' + (0.5 * s).toFixed(2) + '" stroke-dasharray="2,2" />');
      var isRight = ann.leaderX > cx;
      var textAnchor = isRight ? "start" : "end";
      var labelX = isRight ? ann.leaderX + 4 * s : ann.leaderX - 4 * s;
      elements.push('    <text x="' + labelX.toFixed(2) + '" y="' + (ann.leaderY + 2.5 * s).toFixed(2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + (7 * s).toFixed(1) + '" fill="' + p.meta + '" text-anchor="' + textAnchor + '">[' + ann.label + ']</text>');
      elements.push('  </g>');
    });

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
    var barW = Math.max(65, Math.round(minDim * 0.16));
    var barH = Math.max(3, Math.round(minDim * 0.006));
    var tickH = Math.max(4, Math.round(minDim * 0.008));
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
      '  <!-- Archival Double Border Frame -->',
      '  <rect x="' + margin + '" y="' + margin + '" width="' + (width - margin * 2) + '" height="' + (height - margin * 2) + '" fill="none" stroke="' + strokeColor + '" stroke-width="' + outerLineWidth.toFixed(2) + '" />',
      '  <rect x="' + innerX + '" y="' + innerY + '" width="' + innerW + '" height="' + innerH + '" fill="none" stroke="' + strokeColor + '" stroke-width="' + innerLineWidth.toFixed(2) + '" />',
      '',
      '  <!-- Corner Registration Marks -->',
      '  <path d="M ' + (innerX + 8) + ' ' + innerY + ' L ' + (innerX + 8) + ' ' + (innerY + 8) + ' L ' + innerX + ' ' + (innerY + 8) + '" fill="none" stroke="' + p.grid + '" stroke-width="0.75" />',
      '  <path d="M ' + (innerX + innerW - 8) + ' ' + innerY + ' L ' + (innerX + innerW - 8) + ' ' + (innerY + 8) + ' L ' + (innerX + innerW) + ' ' + (innerY + 8) + '" fill="none" stroke="' + p.grid + '" stroke-width="0.75" />',
      '  <path d="M ' + (innerX + 8) + ' ' + (innerY + innerH) + ' L ' + (innerX + 8) + ' ' + (innerY + innerH - 8) + ' L ' + innerX + ' ' + (innerY + innerH - 8) + '" fill="none" stroke="' + p.grid + '" stroke-width="0.75" />',
      '  <path d="M ' + (innerX + innerW - 8) + ' ' + (innerY + innerH) + ' L ' + (innerX + innerW - 8) + ' ' + (innerY + innerH - 8) + ' L ' + (innerX + innerW) + ' ' + (innerY + innerH - 8) + '" fill="none" stroke="' + p.grid + '" stroke-width="0.75" />',
      '',
      '  <!-- Top Archival Metadata Header -->',
      '  <g class="archival-header" transform="translate(' + (innerX + 10) + ', ' + (innerY + 14) + ')">',
      '    <text x="0" y="0" font-size="' + captionFontSize + '" font-weight="600" fill="' + strokeColor + '" letter-spacing="1">TAB. ' + (parseInt(specimen.metrics.hashHex.slice(-2), 16) % 30 + 1) + ' // ORDO ' + specimen.order.toUpperCase() + ' (' + specimen.taxon.family.toUpperCase() + ')</text>',
      '    <text x="0" y="' + (captionFontSize + 4) + '" font-size="' + (captionFontSize - 1) + '" fill="' + metaColor + '">HOLOTYPE ANATOMY // ' + specimen.accessionId + '</text>',
      '  </g>',
      '  <g class="archival-top-right" transform="translate(' + (innerX + innerW - 10) + ', ' + (innerY + 14) + ')">',
      '    <text x="0" y="0" font-size="' + captionFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="end">' + specimen.metrics.hashHex + '</text>',
      '    <text x="0" y="' + (captionFontSize + 4) + '" font-size="' + (captionFontSize - 1) + '" fill="' + metaColor + '" text-anchor="end">' + specimen.metrics.hardness.split(' ')[0] + ' ' + specimen.metrics.hardness.split(' ')[1] + '</text>',
      '  </g>',
      '',
      '  <!-- Anatomical Specimen Vector Layer -->',
      '  ' + insectElements,
      '',
      '  <!-- Anatomical Structure Legend -->',
      '  <text x="' + scaleBarX + '" y="' + (scaleBarY - 14) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + captionFontSize + '" fill="' + metaColor + '" letter-spacing="0.5">' + (specimen.order === "coleoptera" ? "a. Mandibula · b. Pronotum · c. Scutellum · d. Elytron · e. Tarsus" : (specimen.order === "lepidoptera" ? "a. Haustellum · b. Antenna · c. Cellula discalis · d. Ocellus · e. Ala caudata" : "a. Oculus · b. Nodus · c. Pterostigma · d. Reticulatio · e. Urotergita")) + '</text>',
      '',
      '  <!-- 5mm Micro-Metric Caliper Rule (SCALE 10:1) -->',
      '  <g class="scale-bar" transform="translate(' + scaleBarX + ', ' + scaleBarY + ')">',
      '    <line x1="0" y1="0" x2="' + barW + '" y2="0" stroke="' + strokeColor + '" stroke-width="' + (innerLineWidth * 1.5).toFixed(2) + '" />',
      '    <line x1="0" y1="' + (-tickH) + '" x2="0" y2="0" stroke="' + strokeColor + '" stroke-width="' + (innerLineWidth * 1.5).toFixed(2) + '" />',
      '    <line x1="' + (barW * 0.2) + '" y1="' + (-tickH * 0.6) + '" x2="' + (barW * 0.2) + '" y2="0" stroke="' + strokeColor + '" stroke-width="' + innerLineWidth.toFixed(2) + '" />',
      '    <line x1="' + (barW * 0.5) + '" y1="' + (-tickH * 0.8) + '" x2="' + (barW * 0.5) + '" y2="0" stroke="' + strokeColor + '" stroke-width="' + innerLineWidth.toFixed(2) + '" />',
      '    <line x1="' + barW + '" y1="' + (-tickH) + '" x2="' + barW + '" y2="0" stroke="' + strokeColor + '" stroke-width="' + (innerLineWidth * 1.5).toFixed(2) + '" />',
      '    <text x="0" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">0</text>',
      '    <text x="' + (barW * 0.5) + '" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">2.5</text>',
      '    <text x="' + barW + '" y="' + (-tickH - 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + scaleFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="middle">5.0mm</text>',
      '    <text x="0" y="' + (barH + captionFontSize + 2) + '" font-family="\'JetBrains Mono\', monospace" font-size="' + captionFontSize + '" font-weight="500" fill="' + metaColor + '">MICROMETRIC CALIPER (SCALE 10:1)</text>',
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
