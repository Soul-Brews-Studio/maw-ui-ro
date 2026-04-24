import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PinLock } from "./components/PinLock";
import { isReadonlyBuild } from "./lib/api";

// RO build bypasses PinLock entirely — the pin protects mutating fleet
// actions, and RO has no mutations to protect. Viewers should see the UI
// immediately without the gate.
// The `.ro-mode` class on <body> drives a global CSS rule in index.css that
// nukes every input / textarea / select / form across the inherited upstream
// UI in one pass. Simpler than per-component VITE_READONLY_BUILD guards on
// 30+ components — turn RO on or off by flipping one class.
if (isReadonlyBuild) {
  document.body.classList.add("ro-mode");
}

const body = isReadonlyBuild ? <App /> : <PinLock><App /></PinLock>;

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {body}
  </ErrorBoundary>
);
