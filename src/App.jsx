import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  countDiscoveries,
  createNextPlanetSeed,
  firstLockedDiscovery,
  getDiscoveries,
  makePlanet,
  makeProbeReading,
} from "./planetCatalog.js";
import {
  decodeRecoveryCode,
  encodeRecoveryCode,
  loadProgress,
  saveProgress,
  sanitizeProgress,
} from "./storage.js";

const PlanetScene = lazy(() => import("./PlanetScene.jsx"));

const EMPTY_FOCUS = {
  latitude: "N 10.2",
  longitude: "E 32.4",
  albedo: "42%",
  turbulence: "18%",
  drift: "0 m/s",
};

function StatusPill({ icon, label, value }) {
  return (
    <div className="status-pill">
      <i className={icon} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DiscoverySlots({ discoveries, discoveryMask }) {
  return (
    <ol className="discovery-list" aria-label="Discoveries">
      {discoveries.map((discovery, index) => {
        const unlocked = (discoveryMask & (1 << index)) !== 0;

        return (
          <li className={unlocked ? "discovery-item unlocked" : "discovery-item"} key={discovery.id}>
            <span className="discovery-index">
              <i className={unlocked ? "fa-solid fa-wand-magic-sparkles" : "fa-solid fa-lock"} aria-hidden="true" />
            </span>
            <span className="discovery-copy">
              <strong>{unlocked ? discovery.title : `Discovery ${index + 1}`}</strong>
              <span>{unlocked ? discovery.detail : "Signal locked"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ReadingsPanel({ focus, readings, climate }) {
  const latest = readings[0];

  return (
    <aside className="instrument-panel readings-panel">
      <div className="panel-heading">
        <span className="panel-icon">
          <i className="fa-solid fa-temperature-half" aria-hidden="true" />
        </span>
        <div>
          <h2>Readings</h2>
          <p>{climate.behavior}</p>
        </div>
      </div>

      <div className="focus-grid" aria-label="Inspection focus">
        <StatusPill icon="fa-solid fa-location-dot" label="Lat" value={focus.latitude} />
        <StatusPill icon="fa-solid fa-compass" label="Lon" value={focus.longitude} />
        <StatusPill icon="fa-solid fa-circle-half-stroke" label="Albedo" value={focus.albedo} />
        <StatusPill icon="fa-solid fa-wind" label="Shear" value={focus.drift} />
      </div>

      <div className="latest-reading">
        {latest ? (
          <>
            <div className="reading-title">
              <span>{latest.label}</span>
              <strong>{latest.discoveryTitle}</strong>
            </div>
            <div className="metric-grid">
              <span>
                <small>Pressure</small>
                <strong>{latest.pressure}</strong>
              </span>
              <span>
                <small>Temp</small>
                <strong>{latest.temperature}</strong>
              </span>
              <span>
                <small>Wind</small>
                <strong>{latest.wind}</strong>
              </span>
              <span>
                <small>Vapor</small>
                <strong>{latest.vapor}</strong>
              </span>
            </div>
          </>
        ) : (
          <div className="empty-reading">
            <i className="fa-solid fa-wave-square" aria-hidden="true" />
            <span>Awaiting probe telemetry</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function RecoveryPanel({ recoveryCode, restoreCode, onCodeChange, onRestore, restoreMessage, onCopy }) {
  return (
    <section className="recovery-panel" aria-label="Recovery Code">
      <div className="recovery-copy">
        <h2>Recovery Code</h2>
        <div className="code-box">
          <code>{recoveryCode}</code>
          <button className="icon-only" type="button" onClick={onCopy} aria-label="Copy recovery code">
            <i className="fa-regular fa-copy" aria-hidden="true" />
          </button>
        </div>
      </div>

      <form className="restore-form" onSubmit={onRestore}>
        <label htmlFor="restore-code">Restore</label>
        <div className="restore-row">
          <input
            id="restore-code"
            value={restoreCode}
            onChange={(event) => onCodeChange(event.target.value)}
            placeholder="AWO-7K2Q-3-0-H9"
            autoComplete="off"
          />
          <button type="submit">
            <i className="fa-solid fa-key" aria-hidden="true" />
            <span>Restore</span>
          </button>
        </div>
        {restoreMessage ? <p className="restore-message">{restoreMessage}</p> : null}
      </form>
    </section>
  );
}

function App() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [launchId, setLaunchId] = useState(0);
  const [recenterId, setRecenterId] = useState(0);
  const [probeInFlight, setProbeInFlight] = useState(false);
  const [focus, setFocus] = useState(EMPTY_FOCUS);
  const [restoreCode, setRestoreCode] = useState("");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const transitionTimerRef = useRef(null);

  const planet = useMemo(() => makePlanet(progress.planetSeed), [progress.planetSeed]);
  const discoveries = useMemo(() => getDiscoveries(planet), [planet]);
  const discoveryCount = countDiscoveries(progress.discoveryMask);
  const missionComplete = discoveryCount >= 5;
  const recoveryCode = useMemo(() => encodeRecoveryCode(progress), [progress]);
  const sceneVars = useMemo(
    () => ({
      "--sky-top": planet.climate.palette.skyTop,
      "--sky-mid": planet.climate.palette.skyMid,
      "--sky-bottom": planet.climate.palette.skyBottom,
      "--accent": planet.climate.palette.accent,
      "--weather": planet.climate.palette.weather,
      "--planet-ink": planet.climate.palette.ink,
    }),
    [planet],
  );

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (!missionComplete) {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      return undefined;
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setProgress((current) => {
        const safe = sanitizeProgress(current);
        return {
          ...safe,
          planetSeed: createNextPlanetSeed(safe.planetSeed),
          discoveryMask: 0,
          readings: [],
          archiveCount: safe.archiveCount + 1,
          updatedAt: Date.now(),
        };
      });
      setFocus(EMPTY_FOCUS);
      setProbeInFlight(false);
      setRestoreMessage("New climate generated.");
    }, 2400);

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [missionComplete, progress.planetSeed]);

  const launchProbe = useCallback(() => {
    if (probeInFlight || missionComplete) {
      return;
    }

    setProbeInFlight(true);
    setCopyMessage("");
    setRestoreMessage("");
    setLaunchId((value) => value + 1);
  }, [missionComplete, probeInFlight]);

  const completeProbe = useCallback(() => {
    setProbeInFlight(false);
    setProgress((current) => {
      const safe = sanitizeProgress(current);
      const nextDiscovery = firstLockedDiscovery(safe.discoveryMask);

      if (nextDiscovery < 0) {
        return safe;
      }

      const currentPlanet = makePlanet(safe.planetSeed);
      const reading = makeProbeReading(
        currentPlanet,
        nextDiscovery,
        countDiscoveries(safe.discoveryMask) + 1,
      );

      return {
        ...safe,
        discoveryMask: safe.discoveryMask | (1 << nextDiscovery),
        readings: [reading, ...safe.readings].slice(0, 7),
        updatedAt: Date.now(),
      };
    });
  }, []);

  const forceNewClimate = useCallback(() => {
    if (!missionComplete) {
      return;
    }

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    setProgress((current) => {
      const safe = sanitizeProgress(current);
      return {
        ...safe,
        planetSeed: createNextPlanetSeed(safe.planetSeed),
        discoveryMask: 0,
        readings: [],
        archiveCount: safe.archiveCount + 1,
        updatedAt: Date.now(),
      };
    });
    setFocus(EMPTY_FOCUS);
    setProbeInFlight(false);
    setRestoreMessage("New climate generated.");
  }, [missionComplete]);

  const restoreProgress = useCallback(
    (event) => {
      event.preventDefault();
      const result = decodeRecoveryCode(restoreCode);

      if (!result.ok) {
        setRestoreMessage(result.error);
        return;
      }

      setProgress(result.progress);
      setRestoreCode("");
      setRestoreMessage(`Restored ${result.discoveryCount}/5 discoveries.`);
      setFocus(EMPTY_FOCUS);
      setProbeInFlight(false);
    },
    [restoreCode],
  );

  const copyRecoveryCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopyMessage("Copied.");
    } catch {
      setCopyMessage("Copy unavailable.");
    }
  }, [recoveryCode]);

  const statusLine = probeInFlight
    ? "Probe crossing upper atmosphere"
    : missionComplete
      ? "Five discoveries archived. Preparing next climate."
      : `${planet.climate.name} climate under observation`;

  return (
    <div className="app" style={sceneVars}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <i className="fa-solid fa-tower-observation" aria-hidden="true" />
          </span>
          <div>
            <h1>Alien Weather Observatory</h1>
            <p>{planet.catalogId} / {planet.name}</p>
          </div>
        </div>
        <div className="mission-status" aria-label="Discoveries unlocked">
          <i className="fa-solid fa-flask-vial" aria-hidden="true" />
          <span>{discoveryCount}/5</span>
        </div>
      </header>

      <main className="observatory-grid">
        <section className="planet-zone" aria-label="3D observatory">
          <div className="scene-frame">
            <Suspense
              fallback={
                <div className="scene-fallback">
                  <i className="fa-solid fa-circle-nodes" aria-hidden="true" />
                  <span>Calibrating observatory</span>
                </div>
              }
            >
              <PlanetScene
                planet={planet}
                launchId={launchId}
                recenterId={recenterId}
                onProbeComplete={completeProbe}
                onInspect={setFocus}
              />
            </Suspense>
            <div className="scene-overlay">
              <div className="planet-label">
                <span>{planet.climate.sky}</span>
                <strong>{planet.name}</strong>
              </div>
              <div className="weather-badge">
                <i className="fa-solid fa-cloud-bolt" aria-hidden="true" />
                <span>{planet.climate.weather}</span>
              </div>
            </div>
          </div>

          <div className="control-strip">
            <button className="launch-button" type="button" onClick={launchProbe} disabled={probeInFlight || missionComplete}>
              <i className="fa-solid fa-satellite-dish" aria-hidden="true" />
              <span>{probeInFlight ? "Probe Sailing" : "Launch Probe"}</span>
            </button>
            <button className="tool-button" type="button" onClick={() => setRecenterId((value) => value + 1)}>
              <i className="fa-solid fa-rotate-left" aria-hidden="true" />
              <span>Recenter</span>
            </button>
            <button className="tool-button" type="button" onClick={forceNewClimate} disabled={!missionComplete}>
              <i className="fa-solid fa-cloud-sun-rain" aria-hidden="true" />
              <span>New Climate</span>
            </button>
          </div>

          <div className="status-line" aria-live="polite">
            <i className="fa-solid fa-circle-nodes" aria-hidden="true" />
            <span>{statusLine}</span>
          </div>
        </section>

        <ReadingsPanel focus={focus} readings={progress.readings} climate={planet.climate} />

        <aside className="instrument-panel discovery-panel">
          <div className="panel-heading">
            <span className="panel-icon">
              <i className="fa-solid fa-book-open-reader" aria-hidden="true" />
            </span>
            <div>
              <h2>Discoveries</h2>
              <p>{planet.climate.terrain}</p>
            </div>
          </div>
          <DiscoverySlots discoveries={discoveries} discoveryMask={progress.discoveryMask} />
        </aside>
      </main>

      <RecoveryPanel
        recoveryCode={recoveryCode}
        restoreCode={restoreCode}
        onCodeChange={setRestoreCode}
        onRestore={restoreProgress}
        restoreMessage={restoreMessage || copyMessage}
        onCopy={copyRecoveryCode}
      />
    </div>
  );
}

export default App;
