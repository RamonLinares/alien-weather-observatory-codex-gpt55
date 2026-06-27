const CLIMATES = [
  {
    key: "opal-drizzle",
    name: "Opal Drizzle",
    sky: "pearl rain bands",
    weather: "reverse rain",
    terrain: "tidal glass plains",
    behavior: "mist beads climb from the valleys toward the terminator line",
    palette: {
      low: "#77b8b8",
      mid: "#cad3a8",
      high: "#eaa7a8",
      peak: "#fff5eb",
      atmosphere: "#aee8e1",
      cloud: "#f8fbff",
      weather: "#ef8d88",
      accent: "#d97972",
      skyTop: "#dbeeee",
      skyMid: "#eef1df",
      skyBottom: "#f8dfd6",
      ink: "#263b44",
    },
    discoveries: [
      ["Suspended Rainline", "Droplets rise for nine minutes before vanishing into a pale magnetic shelf."],
      ["Quiet Glass Basin", "A basin stores sound as faint rings and releases it during the cold hour."],
      ["Opal Vapor Vein", "Subsurface vapor refracts coral light through the upper cloud deck."],
      ["Reversed Dew Cycle", "Dew forms below the soil crust before migrating into the open air."],
      ["Moonlit Barometer", "Pressure pulses match the shadow of an unseen moon."],
    ],
  },
  {
    key: "moss-aurora",
    name: "Moss Aurora",
    sky: "green dawn curtain",
    weather: "polar static",
    terrain: "soft crater wetlands",
    behavior: "aurora strands comb the moss seas and charge the crater rims",
    palette: {
      low: "#6ea88f",
      mid: "#b9c98f",
      high: "#d8b6bf",
      peak: "#f4efe2",
      atmosphere: "#b7e1b8",
      cloud: "#edf7e7",
      weather: "#8bcfc6",
      accent: "#6aa89e",
      skyTop: "#d8eadc",
      skyMid: "#f1e7d3",
      skyBottom: "#f5d8cf",
      ink: "#273d35",
    },
    discoveries: [
      ["Moss Charge Bloom", "Wetlands glow where the aurora combs static through the spores."],
      ["Crater Hum Layer", "The crater floor vibrates at a frequency close to a sleeping heartbeat."],
      ["Pale Ion Thread", "Charged threads stitch the polar air into a stable luminous curtain."],
      ["Thermal Lichen Wake", "Warm lichen trails mark the passage of invisible crosswinds."],
      ["Northward Memory", "Clouds retain compass direction after the wind has stopped."],
    ],
  },
  {
    key: "coral-saltstorm",
    name: "Coral Saltstorm",
    sky: "pink mineral haze",
    weather: "salt lightning",
    terrain: "ridged mineral dunes",
    behavior: "salt grains spark when the desert shadow moves faster than the sun",
    palette: {
      low: "#a7b7b4",
      mid: "#d7bc8a",
      high: "#ee9d87",
      peak: "#fff1dc",
      atmosphere: "#f1b8a8",
      cloud: "#fff4e8",
      weather: "#f17770",
      accent: "#cf706b",
      skyTop: "#e8dfe2",
      skyMid: "#f3e0c9",
      skyBottom: "#f4c3b4",
      ink: "#3d3635",
    },
    discoveries: [
      ["Salt Flash Meridian", "Lightning follows mineral seams instead of the moving cloud front."],
      ["Amber Pressure Trough", "Low pressure hides inside a dune valley with no measurable wind."],
      ["Coral Dust Halo", "Storm dust arranges itself into a thin ring above the equator."],
      ["Mirage Condenser", "Heat shimmer condenses into a readable atmospheric layer."],
      ["Tuning Fork Dune", "One ridge sings when struck by charged salt grains."],
    ],
  },
  {
    key: "blue-ember-fog",
    name: "Blue Ember Fog",
    sky: "cool fire mist",
    weather: "ember fog",
    terrain: "basalt islands",
    behavior: "blue sparks move through fog pockets without burning the surface",
    palette: {
      low: "#5f8c9b",
      mid: "#9cb7ac",
      high: "#c8a2a0",
      peak: "#efe9d8",
      atmosphere: "#9fc8d8",
      cloud: "#e7f2f4",
      weather: "#ffb088",
      accent: "#df7e67",
      skyTop: "#d4e4e8",
      skyMid: "#e8eadb",
      skyBottom: "#f0cfbd",
      ink: "#243a45",
    },
    discoveries: [
      ["Cold Ember Parcel", "Fog carries blue sparks that cool every object they touch."],
      ["Basalt Breathing Vent", "The islands exhale pressure waves through microscopic vents."],
      ["Luminous Low Cloud", "Cloud bases brighten when temperature drops below the ash point."],
      ["Copper Rain Shadow", "A metallic scent appears before every visible precipitation band."],
      ["Silent Flame Front", "A flame-shaped front crosses the sea without heat or sound."],
    ],
  },
  {
    key: "lilac-cryosea",
    name: "Lilac Cryosea",
    sky: "frosted violet noon",
    weather: "crystal tide",
    terrain: "floating ice shelves",
    behavior: "ice shelves drift above liquid cloud and ring softly when probes pass",
    palette: {
      low: "#8db9c6",
      mid: "#b6b9d5",
      high: "#d3a3bd",
      peak: "#f9f4f0",
      atmosphere: "#cbb8df",
      cloud: "#f7f1f8",
      weather: "#99c8dd",
      accent: "#b27ca3",
      skyTop: "#d9e4ed",
      skyMid: "#e6dfeb",
      skyBottom: "#f2d6dc",
      ink: "#33384d",
    },
    discoveries: [
      ["Crystal Tide Clock", "Ice shelves rise on a tide that does not follow any visible moon."],
      ["Lilac Thermal Pocket", "A warm pocket survives between two layers of frozen cloud."],
      ["Singing Shelf Edge", "Shelf edges emit clean tones as the upper wind shears past."],
      ["Vapor Snow Bridge", "Snow grains briefly connect into bridges before falling apart."],
      ["Subzero Halo", "A halo forms where cold vapor meets warmer starlight."],
    ],
  },
  {
    key: "saffron-sporefall",
    name: "Saffron Sporefall",
    sky: "golden pollen dusk",
    weather: "spore monsoon",
    terrain: "terraced fungal highlands",
    behavior: "spores fall in measured pulses and mark invisible wind stairs",
    palette: {
      low: "#8da47f",
      mid: "#c7c88f",
      high: "#dda292",
      peak: "#fff3df",
      atmosphere: "#d7dda2",
      cloud: "#fff7e6",
      weather: "#d89a55",
      accent: "#8f9f72",
      skyTop: "#dceadb",
      skyMid: "#edf0df",
      skyBottom: "#f1d5ca",
      ink: "#3c382a",
    },
    discoveries: [
      ["Spore Pulse Ladder", "Falling spores reveal stacked wind layers above the terraces."],
      ["Fungal Heat Orchard", "Highlands store solar heat in slow glowing root systems."],
      ["Saffron Rain Pause", "Every monsoon pulse pauses at the same altitude before descent."],
      ["Pollen Compass", "Dry spores align themselves to a magnetic field before blooming."],
      ["Terrace Cloud Seed", "Clouds begin as bright motes released from the highest shelves."],
    ],
  },
];

const NAME_PREFIXES = ["Ari", "Mira", "Sora", "Nami", "Kiri", "Ivo", "Luma", "Eto", "Rin", "Yura"];
const NAME_SUFFIXES = ["velle", "mora", "theta", "lune", "hara", "miri", "ossa", "nara", "syl", "cair"];

export function createRng(seed) {
  let value = seed >>> 0;

  return function rng() {
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRandomSeed() {
  return Math.floor(Math.random() * 0x7fffffff) + 1;
}

export function makePlanet(seed) {
  const normalizedSeed = Math.max(1, Number(seed) >>> 0);
  const rng = createRng(normalizedSeed);
  const climate = CLIMATES[Math.floor(rng() * CLIMATES.length)];
  const prefix = NAME_PREFIXES[Math.floor(rng() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
  const catalogNumber = Math.floor(100 + rng() * 900);
  const terrainScale = 1.4 + rng() * 1.9;
  const terrainLift = 0.09 + rng() * 0.07;
  const cloudTilt = -0.65 + rng() * 1.3;
  const spinRate = 0.0018 + rng() * 0.0018;
  const particlePhase = rng() * Math.PI * 2;

  return {
    seed: normalizedSeed,
    name: `${prefix}${suffix}`,
    catalogId: `AO-${catalogNumber}`,
    climate,
    terrainScale,
    terrainLift,
    cloudTilt,
    spinRate,
    particlePhase,
  };
}

export function createNextPlanetSeed(currentSeed) {
  const currentClimate = makePlanet(currentSeed).climate.key;
  let candidate = createRandomSeed();

  for (let index = 0; index < 24; index += 1) {
    if (makePlanet(candidate).climate.key !== currentClimate) {
      return candidate;
    }

    candidate = (candidate + 104729 + index * 7919) >>> 0;
  }

  return candidate || createRandomSeed();
}

export function getDiscoveries(planet) {
  return planet.climate.discoveries.map(([title, detail], index) => ({
    id: `${planet.seed}-${index}`,
    title,
    detail,
  }));
}

export function countDiscoveries(mask) {
  let count = 0;
  let value = mask & 31;

  while (value) {
    count += value & 1;
    value >>= 1;
  }

  return count;
}

export function firstLockedDiscovery(mask) {
  for (let index = 0; index < 5; index += 1) {
    if ((mask & (1 << index)) === 0) {
      return index;
    }
  }

  return -1;
}

export function makeProbeReading(planet, discoveryIndex, sampleNumber) {
  const rng = createRng(planet.seed + discoveryIndex * 9137 + sampleNumber * 389);
  const discovery = getDiscoveries(planet)[discoveryIndex];
  const pressure = 0.62 + rng() * 2.7;
  const temperature = Math.round(-118 + rng() * 236);
  const wind = Math.round(18 + rng() * 178);
  const charge = Math.round(12 + rng() * 86);
  const vapor = Math.round(20 + rng() * 74);

  return {
    id: `${planet.seed}-${discoveryIndex}-${sampleNumber}`,
    label: `Probe ${String(sampleNumber).padStart(2, "0")}`,
    discoveryTitle: discovery.title,
    pressure: `${pressure.toFixed(2)} atm`,
    temperature: `${temperature} C`,
    wind: `${wind} km/h`,
    charge: `${charge}% ion`,
    vapor: `${vapor}% vapor`,
    note: discovery.detail,
  };
}

export function makeRecoveredReadings(planet, mask) {
  const readings = [];

  for (let index = 0; index < 5; index += 1) {
    if ((mask & (1 << index)) !== 0) {
      readings.unshift(makeProbeReading(planet, index, index + 1));
    }
  }

  return readings;
}

export function sampleFocus(planet, latitude, longitude) {
  const rng = createRng(
    planet.seed + Math.round((latitude + 90) * 13) + Math.round((longitude + 180) * 17),
  );
  const albedo = Math.round(28 + rng() * 54);
  const turbulence = Math.round(8 + rng() * 74);
  const drift = Math.round(-42 + rng() * 84);

  return {
    latitude: `${latitude >= 0 ? "N" : "S"} ${Math.abs(latitude).toFixed(1)}`,
    longitude: `${longitude >= 0 ? "E" : "W"} ${Math.abs(longitude).toFixed(1)}`,
    albedo: `${albedo}%`,
    turbulence: `${turbulence}%`,
    drift: `${drift} m/s`,
  };
}
