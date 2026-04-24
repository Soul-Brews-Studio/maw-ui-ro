import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PinLock } from "./components/PinLock";
import { isReadonlyBuild } from "./lib/api";

// RO build bypasses PinLock entirely — the pin protects mutating fleet
// actions, and RO has no mutations to protect. Viewers should see the UI
// immediately without the gate.
const body = isReadonlyBuild ? <App /> : <PinLock><App /></PinLock>;

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {body}
  </ErrorBoundary>
);
