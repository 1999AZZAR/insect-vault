/**
 * InsectDraw: Micro-Entomological Anatomy Vector Synthesis Engine
 * Version: 1.0.0
 * Design System: Swiss-Archival Standard (19th-Century Field Study)
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

  // --- 2. Compact Hershey Simplex Vector Font Engine ---
  var HERSHEY_RAW = {
    ' ': " 1 -9  9",
    '.': " 6 -2  2 R  1  9 R  2  8 R  2  9 R  1 10 R  0  9 R  1  8",
    ',': " 8 -2  2 R  1  9 R  2  8 R  2  9 R  1 10 R  0  9 R  1  8 R  1 10 R  0 12",
    '-': " 3 -3  3 R -3  3 R  3  3",
    '(': " 7 -4  1 R  0 -8 R -2 -4 R -2  0 R -2  4 R  0  8",
    ')': " 7 -1  4 R -2 -8 R  0 -4 R  0  0 R  0  4 R -2  8",
    '0': "12 -5  5 R -3 -5 R -1 -7 R  1 -7 R  3 -5 R  3  5 R  1  7 R -1  7 R -3  5 R -3 -5",
    '1': " 5 -3  3 R -1 -5 R  0 -7 R  0  7",
    '2': "10 -5  5 R -3 -5 R -1 -7 R  1 -7 R  3 -5 R  3 -3 R -3  7 R  3  7",
    '3': "13 -5  5 R -3 -7 R  3 -7 R  0 -3 R  2 -3 R  3 -1 R  3  3 R  1  7 R -2  7 R -3  5",
    '4': " 7 -5  5 R  1  7 R  1 -7 R -3  2 R  3  2",
    '5': "12 -5  5 R  2 -7 R -3 -7 R -3 -2 R  2 -2 R  3  0 R  3  4 R  1  7 R -2  7 R -3  5",
    '6': "13 -5  5 R  2 -7 R -1 -7 R -3 -3 R -3  4 R -1  7 R  1  7 R  3  4 R  3  0 R  1 -2 R -3 -2",
    '7': " 6 -5  5 R -3 -7 R  3 -7 R -1  7",
    '8': "17 -5  5 R -1 -7 R  1 -7 R  3 -5 R  3 -3 R  1 -1 R -1 -1 R -3  1 R -3  5 R -1  7 R  1  7 R  3  5 R  3  1 R  1 -1 R -1 -1 R -3 -3 R -3 -5 R -1 -7",
    '9': "13 -5  5 R  3  2 R -1  2 R -3  0 R -3 -4 R -1 -7 R  1 -7 R  3 -4 R  3  3 R  1  7 R -2  7",
    'A': " 9 -6  6 R  0 -7 R -4  7 R  0 -7 R  4  7 R -3  2 R  3  2",
    'B': "16 -5  5 R -3 -7 R -3  7 R -3 -7 R  1 -7 R  3 -5 R  3 -3 R  1 -1 R -3 -1 R  1 -1 R  3  1 R  3  5 R  1  7 R -3  7",
    'C': "11 -6  5 R  3 -5 R  1 -7 R -2 -7 R -4 -4 R -4  4 R -2  7 R  1  7 R  3  5",
    'D': "11 -5  5 R -3 -7 R -3  7 R -3 -7 R  1 -7 R  3 -5 R  3  5 R  1  7 R -3  7",
    'E': "11 -5  5 R -3 -7 R -3  7 R -3 -7 R  3 -7 R -3  0 R  1  0 R -3  7 R  3  7",
    'F': " 9 -5  5 R -3 -7 R -3  7 R -3 -7 R  3 -7 R -3  0 R  1  0",
    'G': "14 -6  5 R  3 -5 R  1 -7 R -2 -7 R -4 -4 R -4  4 R -2  7 R  1  7 R  3  5 R  3  1 R  0  1",
    'H': " 9 -6  6 R -4 -7 R -4  7 R -4  0 R  4  0 R  4 -7 R  4  7",
    'I': " 3 -1  1 R  0 -7 R  0  7",
    'J': " 8 -4  4 R  2 -7 R  2  4 R  0  7 R -2  7 R -3  5",
    'K': " 9 -5  5 R -3 -7 R -3  7 R -3  1 R  3 -7 R -1 -1 R  3  7",
    'L': " 6 -5  4 R -3 -7 R -3  7 R  3  7",
    'M': "12 -7  7 R -5  7 R -5 -7 R  0  2 R  5 -7 R  5  7",
    'N': " 9 -6  6 R -4  7 R -4 -7 R  4  7 R  4 -7",
    'O': "13 -6  6 R -2 -7 R  2 -7 R  4 -4 R  4  4 R  2  7 R -2  7 R -4  4 R -4 -4 R -2 -7",
    'P': "10 -5  5 R -3  7 R -3 -7 R  1 -7 R  3 -5 R  3 -2 R  1  0 R -3  0",
    'Q': "16 -6  6 R -2 -7 R  2 -7 R  4 -4 R  4  4 R  2  7 R -2  7 R -4  4 R -4 -4 R -2 -7 R  1  3 R  4  7",
    'R': "13 -5  5 R -3  7 R -3 -7 R  1 -7 R  3 -5 R  3 -2 R  1  0 R -3  0 R  0  0 R  3  7",
    'S': "13 -5  5 R  3 -5 R  1 -7 R -2 -7 R -3 -5 R  3  0 R  3  5 R  1  7 R -2  7 R -3  5",
    'T': " 6 -5  5 R  0 -7 R  0  7 R -4 -7 R  4 -7",
    'U': " 9 -6  6 R -4 -7 R -4  4 R -2  7 R  2  7 R  4  4 R  4 -7",
    'V': " 6 -6  6 R -4 -7 R  0  7 R  4 -7",
    'W': "12 -7  7 R -5 -7 R -3  7 R  0  0 R  3  7 R  5 -7",
    'X': " 6 -6  6 R -4 -7 R  4  7 R -4  7 R  4 -7",
    'Y': " 7 -6  6 R -4 -7 R  0 -1 R  0  7 R  0 -1 R  4 -7",
    'Z': " 8 -5  5 R -3 -7 R  3 -7 R -3  7 R  3  7",
    'a': "14 -4  4 R  3 -2 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  1 R  3 -3 R  3  3",
    'b': "14 -4  4 R -3 -7 R -3  3 R -3  0 R -1 -4 R  1 -4 R  3 -2 R  3  1 R  1  3 R -1  3 R -3  1",
    'c': "10 -4  4 R  3 -2 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  1",
    'd': "14 -4  4 R  3 -7 R  3  3 R  3  0 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  1",
    'e': "13 -4  4 R -3  0 R  3  0 R  3 -2 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  2",
    'f': " 9 -3  3 R  2 -7 R  0 -7 R -1 -5 R -1  3 R -3 -3 R  1 -3",
    'g': "18 -4  4 R  3 -2 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  1 R  3 -3 R  3  5 R  1  7 R -2  7 R -3  5",
    'h': "10 -4  4 R -3 -7 R -3  3 R -3  0 R -1 -4 R  1 -4 R  3 -2 R  3  3",
    'i': " 7 -1  2 R  0 -4 R  0  3 R  0 -7 R  0 -6",
    'j': "10 -2  2 R  0 -4 R  0  5 R -1  7 R -2  7 R  0 -7 R  0 -6",
    'k': " 9 -4  3 R -3 -7 R -3  3 R -3  0 R  2 -4 R -1 -1 R  2  3",
    'l': " 5 -1  2 R  0 -7 R  0  2 R  1  3",
    'm': "15 -6  6 R -4 -4 R -4  3 R -4  0 R -2 -4 R  0 -4 R  1 -2 R  1  3 R  1  0 R  3 -4 R  4 -2 R  4  3",
    'n': "10 -4  4 R -3 -4 R -3  3 R -3  0 R -1 -4 R  1 -4 R  3 -2 R  3  3",
    'o': "13 -4  4 R -1 -4 R  1 -4 R  3 -2 R  3  1 R  1  3 R -1  3 R -3  1 R -3 -2 R -1 -4",
    'p': "14 -4  4 R -3 -4 R -3  7 R -3 -1 R -1 -4 R  1 -4 R  3 -2 R  3  1 R  1  3 R -1  3 R -3  1",
    'q': "14 -4  4 R  3 -4 R  3  7 R  3 -1 R  1 -4 R -1 -4 R -3 -2 R -3  1 R -1  3 R  1  3 R  3  1",
    'r': " 8 -3  3 R -2 -4 R -2  3 R -2 -1 R -1 -4 R  1 -4 R  2 -3",
    's': "12 -3  3 R  2 -3 R  0 -4 R -1 -4 R -2 -3 R  1 -1 R  2  0 R -1  3 R -2  2",
    't': " 7 -3  2 R -1 -7 R -1  2 R  1  3 R -3 -4 R  1 -4",
    'u': "10 -4  4 R -3 -4 R -3  1 R -1  3 R  1  3 R  3  1 R  3 -4 R  3  3",
    'v': " 6 -4  4 R -3 -4 R  0  3 R  3 -4",
    'w': "12 -5  5 R -4 -4 R -2  3 R  0 -1 R  2  3 R  4 -4",
    'x': " 6 -4  4 R -3 -4 R  3  3 R -3  3 R  3 -4",
    'y': "10 -4  4 R -3 -4 R -3  1 R -1  3 R  1  3 R  3  1 R  3 -4 R  3  5 R  1  7 R -2  7",
    'z': " 8 -4  4 R -2 -4 R  2 -4 R -2  3 R  2  3"
  };

  var HERSHEY_CACHE = {};
  function compileHershey(ch) {
    if (HERSHEY_CACHE[ch]) return HERSHEY_CACHE[ch];
    var raw = HERSHEY_RAW[ch] || HERSHEY_RAW[' '];
    var parts = raw.trim().split(/\s+/);
    var xmin = parseInt(parts[1], 10);
    var xmax = parseInt(parts[2], 10);
    var polylines = [];
    var curr = [];
    for (var i = 3; i < parts.length; i++) {
      if (parts[i] === 'R') {
        if (curr.length > 0) { polylines.push(curr); curr = []; }
      } else {
        var x = parseInt(parts[i], 10);
        var y = parseInt(parts[++i], 10);
        curr.push([x, y]);
      }
    }
    if (curr.length > 0) polylines.push(curr);
    var res = { xmin: xmin, xmax: xmax, polylines: polylines };
    HERSHEY_CACHE[ch] = res;
    return res;
  }

  function putHersheyText(txt) {
    var polylines = [];
    var curX = 0;
    for (var i = 0; i < txt.length; i++) {
      var glyph = compileHershey(txt[i]);
      var shiftX = curX - glyph.xmin;
      for (var p = 0; p < glyph.polylines.length; p++) {
        var line = [];
        for (var pt = 0; pt < glyph.polylines[p].length; pt++) {
          line.push([glyph.polylines[p][pt][0] + shiftX, glyph.polylines[p][pt][1]]);
        }
        polylines.push(line);
      }
      curX += (glyph.xmax - glyph.xmin) + 2;
    }
    return [curX, polylines];
  }

  function hersheyToSvgPaths(text, x, y, scale) {
    var out = putHersheyText(text);
    var polylines = out[1];
    var pathData = [];
    for (var i = 0; i < polylines.length; i++) {
      var pts = polylines[i];
      if (pts.length < 2) continue;
      var d = "M " + (x + pts[0][0] * scale).toFixed(2) + " " + (y + pts[0][1] * scale).toFixed(2);
      for (var j = 1; j < pts.length; j++) {
        d += " L " + (x + pts[j][0] * scale).toFixed(2) + " " + (y + pts[j][1] * scale).toFixed(2);
      }
      pathData.push('<path d="' + d + '" fill="none" />');
    }
    return pathData.join("\n    ");
  }

  // --- 3. Entomological Taxa Nomenclature ---
  var TAXA_COLEOPTERA = [
    { genus: "Dynastes", species: "hercules", common: "Hercules Beetle", family: "Scarabaeidae" },
    { genus: "Lucanus", species: "cervus", common: "European Stag Beetle", family: "Lucanidae" },
    { genus: "Titanus", species: "giganteus", common: "Titan Longhorn Beetle", family: "Cerambycidae" },
    { genus: "Chrysina", species: "resplendens", common: "Resplendent Jewel Scarab", family: "Rutelinae" },
    { genus: "Goliathus", species: "regius", common: "Royal Goliath Beetle", family: "Cetoniinae" },
    { genus: "Cerambyx", species: "cerdo", common: "Great Capricorn Beetle", family: "Cerambycidae" },
    { genus: "Chalcosoma", species: "atlas", common: "Atlas Rhinoceros Beetle", family: "Dynastinae" },
    { genus: "Buprestis", species: "aurulenta", common: "Golden Jewel Beetle", family: "Buprestidae" },
    { genus: "Macrodontia", species: "cervicornis", common: "Sabertooth Longhorn", family: "Prioninae" },
    { genus: "Plusiotis", species: "limbata", common: "Silver Mirror Scarab", family: "Rutelinae" }
  ];

  var TAXA_LEPIDOPTERA = [
    { genus: "Morpho", species: "hecuba", common: "Sunset Morpho", family: "Nymphalidae" },
    { genus: "Attacus", species: "atlas", common: "Atlas Silk Moth", family: "Saturniidae" },
    { genus: "Papilio", species: "ulysses", common: "Blue Emperor Swallowtail", family: "Papilionidae" },
    { genus: "Actias", species: "luna", common: "Moon Lunar Moth", family: "Saturniidae" },
    { genus: "Troides", species: "brookiana", common: "Rajah Brooke Birdwing", family: "Papilionidae" },
    { genus: "Ornithoptera", species: "priamus", common: "Priam's Green Birdwing", family: "Papilionidae" },
    { genus: "Thysania", species: "agrippina", common: "White Witch Moth", family: "Erebidae" },
    { genus: "Kallima", species: "inachus", common: "Dead Leaf Butterfly", family: "Nymphalidae" },
    { genus: "Chrysiridia", species: "rhipheus", common: "Madagascan Sunset Moth", family: "Uraniidae" },
    { genus: "Heliconius", species: "melpomene", common: "Postman Heliconian", family: "Nymphalidae" }
  ];

  var TAXA_ODONATA = [
    { genus: "Anax", species: "imperator", common: "Emperor Dragonfly", family: "Aeshnidae" },
    { genus: "Calopteryx", species: "virgo", common: "Beautiful Demoiselle", family: "Calopterygidae" },
    { genus: "Megaloprepus", species: "caerulatus", common: "Helicopter Damselfly", family: "Pseudostigmatidae" },
    { genus: "Sympetrum", species: "flaveolum", common: "Yellow-Winged Darter", family: "Libellulidae" },
    { genus: "Aeshna", species: "cyanea", common: "Southern Hawker", family: "Aeshnidae" },
    { genus: "Cordulegaster", species: "bidentata", common: "Sombre Goldenring", family: "Cordulegastridae" },
    { genus: "Erythemis", species: "simplicicollis", common: "Eastern Pondhawk", family: "Libellulidae" },
    { genus: "Libellula", species: "quadrimaculata", common: "Four-Spotted Chaser", family: "Libellulidae" },
    { genus: "Epiophlebia", species: "superstes", common: "Ancient Relict Dragonfly", family: "Epiophlebiidae" },
    { genus: "Gomphus", species: "vulgatissimus", common: "Common Clubtail", family: "Gomphidae" }
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
      wingTint: "rgba(139, 110, 80, 0.08)",
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
      chitin: "#2E2A27",
      wingTint: "rgba(194, 130, 44, 0.12)",
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
      wingTint: "rgba(224, 225, 221, 0.10)",
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
      wingTint: "rgba(158, 42, 43, 0.08)",
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
      wingTint: "rgba(40, 74, 61, 0.09)",
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

    // Pick Insect Order
    var orderKeys = ['coleoptera', 'lepidoptera', 'odonata'];
    var forcedOrder = options.order && orderKeys.indexOf(options.order) !== -1 ? options.order : null;
    var orderKey = forcedOrder || orderKeys[Math.floor(rng() * orderKeys.length)];

    var taxonPool = orderKey === 'coleoptera' ? TAXA_COLEOPTERA : (orderKey === 'lepidoptera' ? TAXA_LEPIDOPTERA : TAXA_ODONATA);
    var taxon = taxonPool[Math.floor(rng() * taxonPool.length)];

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
    var margin = options.margin || Math.round(minDim * 0.024);
    var borderGap = Math.max(3, Math.round(minDim * 0.007));

    // Morphological Parameters
    var bodyLength = (60 + rng() * 50) * scaleFactor;
    var wingspan = (orderKey === 'odonata' ? 220 + rng() * 80 : (orderKey === 'lepidoptera' ? 240 + rng() * 100 : 120 + rng() * 60)) * scaleFactor;
    var chitinHardness = (2.8 + rng() * 2.2).toFixed(1);
    var venationCells = Math.floor(250 + rng() * 1800);

    var antennaeTypes = {
      coleoptera: ["Flabellate Lamellar", "Geniculate Elbowed", "Serrate Pectinate", "Moniliform Beads"],
      lepidoptera: ["Bipectinate Plumose", "Clavate Clubbed", "Setaceous Tapered", "Dentate Feathered"],
      odonata: ["Setaceous Micro-Spur", "Subulate Aristate", "Filiform Vestigial"]
    };
    var antennaeForm = antennaeTypes[orderKey][Math.floor(rng() * antennaeTypes[orderKey].length)];

    var meanings = [
      "Pin-mounted holotype with hyper-reticulated membranous venation & sclerotized tergites.",
      "Cabinet-of-curiosities field anatomy featuring dorsal puncture striae and carinate pleurites.",
      "Micro-dissected anatomical study displaying segmented tarsomeres and faceted compound ommatidia.",
      "Exemplar specimen mounted with enameled brass entomological pin at the mesothoracic disc.",
      "Taxonomic plate delineating radial venation symmetry and striated chitinous cuticle."
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
        wingspanStr: (wingspan * 0.35).toFixed(1) + " mm // " + (bodyLength * 0.35).toFixed(1) + " mm Body",
        meaning: meaning,
        hashHex: "0x" + hexHash,
        epoch: "Anno 1884 // Muséum d'Histoire Naturelle"
      }
    };
  }

  // --- 6. Procedural Anatomy Vector Generator ---
  function generateInsectPaths(specimen, p) {
    var rng = Mulberry32(specimen.hashVal);
    var cx = specimen.cx;
    var cy = specimen.cy;
    var s = specimen.scaleFactor;
    var order = specimen.order;

    var paths = [];

    // Center shift to balance pin mounting aesthetic
    var pinY = cy - 15 * s;

    // Helper for symmetrical vector path
    function symPath(coords, isClosed, fill, stroke, strokeWidth, strokeOpacity) {
      fill = fill || "none";
      stroke = stroke || p.ink;
      strokeWidth = strokeWidth || (1.0 * s).toFixed(2);
      strokeOpacity = strokeOpacity || 1.0;

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

      return '<path d="' + dRight + ' ' + dLeft + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + strokeWidth + '" stroke-opacity="' + strokeOpacity + '" stroke-linecap="round" stroke-linejoin="round" />';
    }

    // 1. Thorax Morphology (Pronotum, Mesonotum, Metanotum)
    var pronoW = (order === 'coleoptera' ? 32 + rng() * 12 : (order === 'lepidoptera' ? 18 + rng() * 6 : 14 + rng() * 4));
    var pronoH = (order === 'coleoptera' ? 24 + rng() * 8 : (order === 'lepidoptera' ? 20 + rng() * 6 : 16 + rng() * 4));
    var pronoY = pinY - 10 * s;

    // Pronotal shield
    var pronoCoords = [
      [0, pronoY / s - pronoH * 0.5],
      [pronoW * 0.6, pronoY / s - pronoH * 0.45],
      [pronoW, pronoY / s - pronoH * 0.1],
      [pronoW * 0.95, pronoY / s + pronoH * 0.4],
      [pronoW * 0.5, pronoY / s + pronoH * 0.5],
      [0, pronoY / s + pronoH * 0.48]
    ];
    paths.push(symPath(pronoCoords, true, p.chitin, p.ink, (1.2 * s).toFixed(2), 0.95));

    // Pronotal internal striae / micro-shading
    for (var psi = 1; psi <= 4; psi++) {
      var subW = pronoW * (0.8 - psi * 0.16);
      var subY = pronoY / s + (psi - 2.5) * 4;
      var strCoords = [
        [subW * 0.2, subY],
        [subW * 0.8, subY + 1],
        [subW, subY + 3]
      ];
      paths.push(symPath(strCoords, false, "none", p.ink, (0.5 * s).toFixed(2), 0.5));
    }

    // 2. Head & Mouthparts
    var headW = (order === 'odonata' ? 26 + rng() * 6 : (order === 'coleoptera' ? 18 + rng() * 8 : 12 + rng() * 4));
    var headH = (order === 'coleoptera' ? 18 + rng() * 6 : 14 + rng() * 4);
    var headY = pronoY - pronoH * 0.5 * s - headH * 0.5 * s;

    var headCoords = [
      [0, headY / s - headH * 0.5],
      [headW * 0.5, headY / s - headH * 0.4],
      [headW * 0.85, headY / s],
      [headW * 0.7, headY / s + headH * 0.45],
      [0, headY / s + headH * 0.5]
    ];
    paths.push(symPath(headCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 0.95));

    // Compound Eyes (Ommatidial Facets)
    var eyeR = (order === 'odonata' ? 9 + rng() * 3 : 5 + rng() * 2) * s;
    var eyeX = (order === 'odonata' ? headW * 0.85 * s : headW * 0.75 * s);
    var eyeY = headY - 1 * s;
    paths.push('<circle cx="' + (cx + eyeX).toFixed(2) + '" cy="' + eyeY.toFixed(2) + '" r="' + eyeR.toFixed(2) + '" fill="' + p.paper + '" stroke="' + p.ink + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />');
    paths.push('<circle cx="' + (cx - eyeX).toFixed(2) + '" cy="' + eyeY.toFixed(2) + '" r="' + eyeR.toFixed(2) + '" fill="' + p.paper + '" stroke="' + p.ink + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />');
    // Ommatidia facet stippling
    for (var foi = 0; foi < 5; foi++) {
      var fAng = foi * (Math.PI / 2.5);
      var fx = Math.cos(fAng) * (eyeR * 0.55);
      var fy = Math.sin(fAng) * (eyeR * 0.55);
      paths.push('<circle cx="' + (cx + eyeX + fx).toFixed(2) + '" cy="' + (eyeY + fy).toFixed(2) + '" r="' + (0.75 * s).toFixed(2) + '" fill="' + p.ink + '" />');
      paths.push('<circle cx="' + (cx - eyeX - fx).toFixed(2) + '" cy="' + (eyeY + fy).toFixed(2) + '" r="' + (0.75 * s).toFixed(2) + '" fill="' + p.ink + '" />');
    }

    // Mandibles (Coleoptera horns or pinchers)
    if (order === 'coleoptera') {
      var hornLen = (20 + rng() * 35);
      var hornCoords = [
        [headW * 0.25, headY / s - headH * 0.4],
        [headW * 0.4, headY / s - headH * 0.8],
        [headW * 0.35, headY / s - headH * 0.8 - hornLen * 0.6],
        [headW * 0.05, headY / s - headH * 0.8 - hornLen],
        [headW * 0.15, headY / s - headH * 0.8 - hornLen * 0.4],
        [headW * 0.1, headY / s - headH * 0.4]
      ];
      paths.push(symPath(hornCoords, true, p.chitin, p.ink, (1.1 * s).toFixed(2), 0.9));
    } else if (order === 'lepidoptera') {
      // Coiled proboscis
      var probR = 5 * s;
      var py0 = headY - headH * 0.5 * s - 3 * s;
      paths.push('<path d="M ' + cx.toFixed(2) + ' ' + (headY - headH * 0.4 * s).toFixed(2) + ' C ' + (cx + probR).toFixed(2) + ' ' + py0.toFixed(2) + ', ' + (cx - probR).toFixed(2) + ' ' + (py0 - probR).toFixed(2) + ', ' + cx.toFixed(2) + ' ' + (py0 - probR * 1.5).toFixed(2) + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
    }

    // Antennae
    var antLen = (order === 'lepidoptera' ? 45 + rng() * 25 : (order === 'coleoptera' ? 40 + rng() * 35 : 12 + rng() * 6));
    var antBaseX = headW * 0.4 * s;
    var antBaseY = headY - headH * 0.3 * s;
    var antTipX = antBaseX + (30 + rng() * 35) * s;
    var antTipY = antBaseY - antLen * s;

    // Antenna shaft
    var antD_R = "M " + (cx + antBaseX).toFixed(2) + " " + antBaseY.toFixed(2) + " Q " + (cx + antBaseX + 15 * s).toFixed(2) + " " + (antBaseY - antLen * 0.5 * s).toFixed(2) + " " + (cx + antTipX).toFixed(2) + " " + antTipY.toFixed(2);
    var antD_L = "M " + (cx - antBaseX).toFixed(2) + " " + antBaseY.toFixed(2) + " Q " + (cx - antBaseX - 15 * s).toFixed(2) + " " + (antBaseY - antLen * 0.5 * s).toFixed(2) + " " + (cx - antTipX).toFixed(2) + " " + antTipY.toFixed(2);
    paths.push('<path d="' + antD_R + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.1 * s).toFixed(2) + '" stroke-linecap="round" />');
    paths.push('<path d="' + antD_L + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (1.1 * s).toFixed(2) + '" stroke-linecap="round" />');

    // Bipectinate / Clavate feathers or clubs
    if (order === 'lepidoptera') {
      for (var bi = 1; bi <= 12; bi++) {
        var t = bi / 13;
        var px = antBaseX + (antTipX - antBaseX) * t;
        var py = antBaseY + (antTipY - antBaseY) * t;
        var featherLen = Math.sin(t * Math.PI) * 12 * s;
        paths.push('<line x1="' + (cx + px).toFixed(2) + '" y1="' + py.toFixed(2) + '" x2="' + (cx + px + featherLen).toFixed(2) + '" y2="' + (py - 2 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.6 * s).toFixed(2) + '" />');
        paths.push('<line x1="' + (cx - px).toFixed(2) + '" y1="' + py.toFixed(2) + '" x2="' + (cx - px - featherLen).toFixed(2) + '" y2="' + (py - 2 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.6 * s).toFixed(2) + '" />');
      }
    } else if (order === 'coleoptera' && rng() > 0.4) {
      // Lamellate fan at tip
      for (var fi = 0; fi < 4; fi++) {
        var lX = antTipX + fi * 3 * s;
        var lY = antTipY - fi * 4 * s;
        paths.push('<line x1="' + (cx + antTipX).toFixed(2) + '" y1="' + antTipY.toFixed(2) + '" x2="' + (cx + lX + 12 * s).toFixed(2) + '" y2="' + (lY - 5 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
        paths.push('<line x1="' + (cx - antTipX).toFixed(2) + '" y1="' + antTipY.toFixed(2) + '" x2="' + (cx - lX - 12 * s).toFixed(2) + '" y2="' + (lY - 5 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
      }
    }

    // 3. Abdomen (Urotergites & Segmental Sternites)
    var abdoY0 = pronoY + pronoH * 0.5 * s;
    var abdoLen = (order === 'odonata' ? 140 + rng() * 40 : (order === 'coleoptera' ? 80 + rng() * 30 : 65 + rng() * 25)) * s;
    var segCount = (order === 'odonata' ? 10 : 8);

    for (var si = 0; si < segCount; si++) {
      var segT = si / segCount;
      var curSegY = abdoY0 + segT * abdoLen;
      var segH = (abdoLen / segCount) * 0.95;
      var segMaxW = (order === 'odonata' ? (9 - segT * 4) : (order === 'coleoptera' ? (28 - segT * 18) : (18 - segT * 12))) * s;

      var segCoords = [
        [0, curSegY / s],
        [segMaxW * 0.7, curSegY / s + 2],
        [segMaxW, curSegY / s + segH * 0.5 / s],
        [segMaxW * 0.85, curSegY / s + segH / s],
        [0, curSegY / s + segH / s]
      ];
      paths.push(symPath(segCoords, true, p.chitin, p.ink, (0.85 * s).toFixed(2), 0.9));
    }

    // 4. Six Jointed Legs (Thoracic Appendages)
    // Prothoracic (Fore), Mesothoracic (Mid), Metathoracic (Hind)
    var legPairs = [
      { y: pronoY - 4 * s, spanX: 55 * s, liftY: -45 * s, clawY: -55 * s },
      { y: pinY + 2 * s, spanX: 75 * s, liftY: 10 * s, clawY: 35 * s },
      { y: abdoY0 + 15 * s, spanX: 95 * s, liftY: 65 * s, clawY: 110 * s }
    ];

    legPairs.forEach(function (leg, lIdx) {
      var femurW = (3.2 * s).toFixed(2);
      var tibiaW = (2.2 * s).toFixed(2);
      var tarsusW = (1.2 * s).toFixed(2);

      var lx1 = pronoW * 0.45 * s;
      var ly1 = leg.y;
      var lx2 = leg.spanX * 0.55;
      var ly2 = leg.y + leg.liftY * 0.4;
      var lx3 = leg.spanX;
      var ly3 = leg.y + leg.liftY;
      var lx4 = leg.spanX * 0.92;
      var ly4 = leg.y + leg.clawY;

      // Right leg
      paths.push('<line x1="' + (cx + lx1).toFixed(2) + '" y1="' + ly1.toFixed(2) + '" x2="' + (cx + lx2).toFixed(2) + '" y2="' + ly2.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + femurW + '" stroke-linecap="round" />');
      paths.push('<line x1="' + (cx + lx2).toFixed(2) + '" y1="' + ly2.toFixed(2) + '" x2="' + (cx + lx3).toFixed(2) + '" y2="' + ly3.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + tibiaW + '" stroke-linecap="round" />');
      paths.push('<line x1="' + (cx + lx3).toFixed(2) + '" y1="' + ly3.toFixed(2) + '" x2="' + (cx + lx4).toFixed(2) + '" y2="' + ly4.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + tarsusW + '" stroke-linecap="round" />');

      // Left leg
      paths.push('<line x1="' + (cx - lx1).toFixed(2) + '" y1="' + ly1.toFixed(2) + '" x2="' + (cx - lx2).toFixed(2) + '" y2="' + ly2.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + femurW + '" stroke-linecap="round" />');
      paths.push('<line x1="' + (cx - lx2).toFixed(2) + '" y1="' + ly2.toFixed(2) + '" x2="' + (cx - lx3).toFixed(2) + '" y2="' + ly3.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + tibiaW + '" stroke-linecap="round" />');
      paths.push('<line x1="' + (cx - lx3).toFixed(2) + '" y1="' + ly3.toFixed(2) + '" x2="' + (cx - lx4).toFixed(2) + '" y2="' + ly4.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + tarsusW + '" stroke-linecap="round" />');

      // Tibial spines
      for (var spi = 0; spi < 3; spi++) {
        var st = 0.3 + spi * 0.25;
        var tx = lx2 + (lx3 - lx2) * st;
        var ty = ly2 + (ly3 - ly2) * st;
        paths.push('<line x1="' + (cx + tx).toFixed(2) + '" y1="' + ty.toFixed(2) + '" x2="' + (cx + tx + 3 * s).toFixed(2) + '" y2="' + (ty - 2 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.8 * s).toFixed(2) + '" />');
        paths.push('<line x1="' + (cx - tx).toFixed(2) + '" y1="' + ty.toFixed(2) + '" x2="' + (cx - tx - 3 * s).toFixed(2) + '" y2="' + (ty - 2 * s).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.8 * s).toFixed(2) + '" />');
      }

      // Tarsal Claws (Ungues)
      paths.push('<path d="M ' + (cx + lx4).toFixed(2) + ' ' + ly4.toFixed(2) + ' q 3 -3 5 0 m -5 0 q 3 3 5 0" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
      paths.push('<path d="M ' + (cx - lx4).toFixed(2) + ' ' + ly4.toFixed(2) + ' q -3 -3 -5 0 m 5 0 q -3 3 -5 0" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.9 * s).toFixed(2) + '" />');
    });

    // 5. Wing Systems (Order Specific)
    if (order === 'coleoptera') {
      // Scutellum triangle
      var scuCoords = [
        [0, abdoY0 / s],
        [8, abdoY0 / s],
        [0, abdoY0 / s + 10]
      ];
      paths.push(symPath(scuCoords, true, p.ink, p.ink, (1.0 * s).toFixed(2), 1.0));

      // Elytra (Hardened Wing Sheaths)
      var elyW = (pronoW * 1.15);
      var elyH = (abdoLen * 0.85);
      var elyCoords = [
        [1, abdoY0 / s + 1],
        [elyW * 0.6, abdoY0 / s + 3],
        [elyW, abdoY0 / s + elyH * 0.3 / s],
        [elyW * 0.95, abdoY0 / s + elyH * 0.7 / s],
        [elyW * 0.4, abdoY0 / s + elyH / s],
        [1, abdoY0 / s + elyH / s]
      ];
      paths.push(symPath(elyCoords, true, p.chitin, p.ink, (1.3 * s).toFixed(2), 0.98));

      // Suture line down the dorsal midline
      paths.push('<line x1="' + cx.toFixed(2) + '" y1="' + abdoY0.toFixed(2) + '" x2="' + cx.toFixed(2) + '" y2="' + (abdoY0 + elyH).toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (1.2 * s).toFixed(2) + '" />');

      // Elytral longitudinal costae & puncture striae
      for (var eti = 1; eti <= 6; eti++) {
        var eRatio = eti / 7;
        var pX1 = elyW * eRatio * 0.6;
        var pX2 = elyW * eRatio;
        var pX3 = elyW * eRatio * 0.6;

        var elyStriaR = "M " + (cx + pX1 * s).toFixed(2) + " " + (abdoY0 + 4 * s).toFixed(2) + " Q " + (cx + pX2 * s).toFixed(2) + " " + (abdoY0 + elyH * 0.5).toFixed(2) + " " + (cx + pX3 * s).toFixed(2) + " " + (abdoY0 + elyH - 4 * s).toFixed(2);
        var elyStriaL = "M " + (cx - pX1 * s).toFixed(2) + " " + (abdoY0 + 4 * s).toFixed(2) + " Q " + (cx - pX2 * s).toFixed(2) + " " + (abdoY0 + elyH * 0.5).toFixed(2) + " " + (cx - pX3 * s).toFixed(2) + " " + (abdoY0 + elyH - 4 * s).toFixed(2);
        paths.push('<path d="' + elyStriaR + ' ' + elyStriaL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.65 * s).toFixed(2) + '" stroke-dasharray="2,2" stroke-opacity="0.75" />');
      }

    } else if (order === 'lepidoptera') {
      // Forewings (Expansive triangular / falcate)
      var fwSpan = specimen.wingspan * 0.5;
      var fwH = fwSpan * 0.65;
      var fwRootY = pinY - 8 * s;

      var fwCoords = [
        [pronoW * 0.45, fwRootY / s],
        [fwSpan * 0.5 / s, (fwRootY - fwH * 0.6) / s],
        [fwSpan / s, (fwRootY - fwH * 0.75) / s], // Apex
        [fwSpan * 0.92 / s, (fwRootY + fwH * 0.1) / s], // Outer margin
        [fwSpan * 0.65 / s, (fwRootY + fwH * 0.45) / s], // Tornus
        [pronoW * 0.45, (fwRootY + fwH * 0.3) / s]
      ];
      paths.push(symPath(fwCoords, true, p.wingTint, p.ink, (1.4 * s).toFixed(2), 0.95));

      // Hindwings (Rounded / Tailed)
      var hwSpan = fwSpan * 0.65;
      var hwH = fwH * 0.75;
      var hwRootY = pinY + 6 * s;

      var hwCoords = [
        [pronoW * 0.4, hwRootY / s],
        [hwSpan * 0.7 / s, (hwRootY + hwH * 0.2) / s],
        [hwSpan / s, (hwRootY + hwH * 0.75) / s],
        [hwSpan * 0.55 / s, (hwRootY + hwH * 1.05) / s],
        [hwSpan * 0.2 / s, (hwRootY + hwH * 0.95) / s],
        [pronoW * 0.4, (hwRootY + hwH * 0.65) / s]
      ];
      paths.push(symPath(hwCoords, true, p.wingTint, p.ink, (1.3 * s).toFixed(2), 0.95));

      // Discal Cell (Forewing Closed Polygonal Cell)
      var dcCoords = [
        [pronoW * 0.45, fwRootY / s],
        [fwSpan * 0.3 / s, (fwRootY - fwH * 0.25) / s],
        [fwSpan * 0.4 / s, (fwRootY - fwH * 0.1) / s],
        [fwSpan * 0.32 / s, (fwRootY + fwH * 0.1) / s],
        [pronoW * 0.45, (fwRootY + fwH * 0.05) / s]
      ];
      paths.push(symPath(dcCoords, true, "none", p.accent, (0.85 * s).toFixed(2), 0.8));

      // Primary Radial & Medial Veins radiating from Discal Cell
      var fwMargins = [
        [fwSpan * 0.7 / s, (fwRootY - fwH * 0.7) / s],
        [fwSpan * 0.88 / s, (fwRootY - fwH * 0.5) / s],
        [fwSpan / s, (fwRootY - fwH * 0.2) / s],
        [fwSpan * 0.95 / s, (fwRootY + fwH * 0.05) / s],
        [fwSpan * 0.82 / s, (fwRootY + fwH * 0.25) / s],
        [fwSpan * 0.65 / s, (fwRootY + fwH * 0.45) / s]
      ];
      fwMargins.forEach(function (tgt) {
        var veinR = "M " + (cx + fwSpan * 0.38).toFixed(2) + " " + (fwRootY - fwH * 0.1).toFixed(2) + " Q " + (cx + (tgt[0] * 0.7) * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2) + " " + (cx + tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
        var veinL = "M " + (cx - fwSpan * 0.38).toFixed(2) + " " + (fwRootY - fwH * 0.1).toFixed(2) + " Q " + (cx - (tgt[0] * 0.7) * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2) + " " + (cx - tgt[0] * s).toFixed(2) + " " + (tgt[1] * s).toFixed(2);
        paths.push('<path d="' + veinR + ' ' + veinL + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.7 * s).toFixed(2) + '" stroke-opacity="0.8" />');
      });

      // Submarginal Scallop / Lunule Eyespots
      var ocelliR = 7 * s;
      var ocX = fwSpan * 0.75;
      var ocY = fwRootY - fwH * 0.05;
      paths.push('<circle cx="' + (cx + ocX).toFixed(2) + '" cy="' + ocY.toFixed(2) + '" r="' + ocelliR.toFixed(2) + '" fill="none" stroke="' + p.accent + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />');
      paths.push('<circle cx="' + (cx - ocX).toFixed(2) + '" cy="' + ocY.toFixed(2) + '" r="' + ocelliR.toFixed(2) + '" fill="none" stroke="' + p.accent + '" stroke-width="' + (1.0 * s).toFixed(2) + '" />');
      paths.push('<circle cx="' + (cx + ocX).toFixed(2) + '" cy="' + ocY.toFixed(2) + '" r="' + (ocelliR * 0.45).toFixed(2) + '" fill="' + p.ink + '" />');
      paths.push('<circle cx="' + (cx - ocX).toFixed(2) + '" cy="' + ocY.toFixed(2) + '" r="' + (ocelliR * 0.45).toFixed(2) + '" fill="' + p.ink + '" />');

    } else if (order === 'odonata') {
      // 4 Long Horizontal Vitreous Wings (Forewing & Hindwing pair)
      var odSpan = specimen.wingspan * 0.52;
      var odChord = (odSpan * 0.22);

      var wingPairs = [
        { y: pinY - 10 * s, tilt: -6 * s, isFore: true },
        { y: pinY + 8 * s, tilt: 4 * s, isFore: false }
      ];

      wingPairs.forEach(function (wp) {
        var wY = wp.y;
        var tipX = odSpan;
        var tipY = wY + wp.tilt;

        var odCoords = [
          [pronoW * 0.35, wY / s],
          [odSpan * 0.45 / s, (wY - odChord * 0.5 + wp.tilt * 0.4) / s], // Nodus
          [tipX / s, tipY / s], // Apex
          [odSpan * 0.75 / s, (wY + odChord * 0.5 + wp.tilt * 0.7) / s],
          [odSpan * 0.35 / s, (wY + odChord * 0.55 + wp.tilt * 0.3) / s],
          [pronoW * 0.35, (wY + 4 * s) / s]
        ];
        paths.push(symPath(odCoords, true, p.wingTint, p.ink, (1.3 * s).toFixed(2), 0.95));

        // Pterostigma (Darkened Rectangular Cell near Apex)
        var ptX = odSpan * 0.82;
        var ptY = wY - odChord * 0.35 * s + wp.tilt * 0.8;
        var ptW = 14 * s;
        var ptH = 3.5 * s;
        paths.push('<rect x="' + (cx + ptX).toFixed(2) + '" y="' + ptY.toFixed(2) + '" width="' + ptW.toFixed(2) + '" height="' + ptH.toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.8 * s).toFixed(2) + '" transform="rotate(3, ' + (cx + ptX) + ', ' + ptY + ')" />');
        paths.push('<rect x="' + (cx - ptX - ptW).toFixed(2) + '" y="' + ptY.toFixed(2) + '" width="' + ptW.toFixed(2) + '" height="' + ptH.toFixed(2) + '" fill="' + p.accent + '" stroke="' + p.ink + '" stroke-width="' + (0.8 * s).toFixed(2) + '" transform="rotate(-3, ' + (cx - ptX - ptW) + ', ' + ptY + ')" />');

        // Primary Longitudinal Veins (Costa, Radius, Medius, Cubitus)
        for (var vi = 1; vi <= 4; vi++) {
          var vyOff = (vi - 2.5) * (odChord * 0.22);
          var vD_R = "M " + (cx + pronoW * 0.35 * s).toFixed(2) + " " + wY.toFixed(2) + " Q " + (cx + odSpan * 0.5).toFixed(2) + " " + (wY + vyOff + wp.tilt * 0.5).toFixed(2) + " " + (cx + tipX - 4 * s).toFixed(2) + " " + (tipY + vyOff * 0.4).toFixed(2);
          var vD_L = "M " + (cx - pronoW * 0.35 * s).toFixed(2) + " " + wY.toFixed(2) + " Q " + (cx - odSpan * 0.5).toFixed(2) + " " + (wY + vyOff + wp.tilt * 0.5).toFixed(2) + " " + (cx - tipX + 4 * s).toFixed(2) + " " + (tipY + vyOff * 0.4).toFixed(2);
          paths.push('<path d="' + vD_R + ' ' + vD_L + '" fill="none" stroke="' + p.ink + '" stroke-width="' + (0.75 * s).toFixed(2) + '" stroke-opacity="0.85" />');
        }

        // Procedural Reticulation / Voronoi Crossveins Mesh
        for (var ri = 1; ri <= 24; ri++) {
          var rx = pronoW * 0.4 * s + ri * (odSpan * 0.038);
          var ryTop = wY - odChord * 0.4 * s + wp.tilt * (ri / 24);
          var ryBot = wY + odChord * 0.45 * s + wp.tilt * (ri / 24);
          paths.push('<line x1="' + (cx + rx).toFixed(2) + '" y1="' + ryTop.toFixed(2) + '" x2="' + (cx + rx + (ri % 2 === 0 ? 2 : -2) * s).toFixed(2) + '" y2="' + ryBot.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.45 * s).toFixed(2) + '" stroke-opacity="0.55" />');
          paths.push('<line x1="' + (cx - rx).toFixed(2) + '" y1="' + ryTop.toFixed(2) + '" x2="' + (cx - rx - (ri % 2 === 0 ? 2 : -2) * s).toFixed(2) + '" y2="' + ryBot.toFixed(2) + '" stroke="' + p.ink + '" stroke-width="' + (0.45 * s).toFixed(2) + '" stroke-opacity="0.55" />');
        }
      });
    }

    // 6. Cabinet-of-Curiosities Entomological Mounting Pin Head
    // Rendered at the morphological center of the mesothorax
    var pinHeadR = 4.2 * s;
    paths.push('  <!-- Central Enameled Brass Entomological Mounting Pin -->');
    paths.push('  <g class="entomological-pin" filter="drop-shadow(0px 2px 3px rgba(42,37,32,0.35))">');
    paths.push('    <circle cx="' + cx.toFixed(2) + '" cy="' + pinY.toFixed(2) + '" r="' + pinHeadR.toFixed(2) + '" fill="#1A1715" stroke="' + p.pinBrass + '" stroke-width="' + (1.2 * s).toFixed(2) + '" />');
    paths.push('    <circle cx="' + (cx - 1.0 * s).toFixed(2) + '" cy="' + (pinY - 1.0 * s).toFixed(2) + '" r="' + (pinHeadR * 0.4).toFixed(2) + '" fill="' + p.paper + '" fill-opacity="0.45" />');
    paths.push('  </g>');

    return paths.join("\n  ");
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
    var cursiveScale = Math.max(0.24, (minDim / 600) * 0.32);
    var cursiveY = height - margin - Math.max(12, Math.round(minDim * 0.025));
    var textOut = putHersheyText(specimen.binomen);
    var cursiveW = textOut[0] * cursiveScale;
    var cursiveX = (width - cursiveW) / 2;
    var hersheySvgPaths = hersheyToSvgPaths(specimen.binomen, cursiveX, cursiveY, cursiveScale);

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
      '    <text x="0" y="0" font-size="' + captionFontSize + '" font-weight="600" fill="' + strokeColor + '" letter-spacing="1">ORDO // ' + specimen.order.toUpperCase() + ' (' + specimen.taxon.family.toUpperCase() + ')</text>',
      '    <text x="0" y="' + (captionFontSize + 4) + '" font-size="' + (captionFontSize - 1) + '" fill="' + metaColor + '">PIN-MOUNTED HOLOTYPE ANATOMY // ' + specimen.accessionId + '</text>',
      '  </g>',
      '  <g class="archival-top-right" transform="translate(' + (innerX + innerW - 10) + ', ' + (innerY + 14) + ')">',
      '    <text x="0" y="0" font-size="' + captionFontSize + '" font-weight="600" fill="' + strokeColor + '" text-anchor="end">' + specimen.metrics.hashHex + '</text>',
      '    <text x="0" y="' + (captionFontSize + 4) + '" font-size="' + (captionFontSize - 1) + '" fill="' + metaColor + '" text-anchor="end">' + specimen.metrics.hardness.split(' ')[0] + ' ' + specimen.metrics.hardness.split(' ')[1] + '</text>',
      '  </g>',
      '',
      '  <!-- Anatomical Specimen Vector Layer -->',
      '  ' + insectElements,
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
    version: "1.0.0",
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
