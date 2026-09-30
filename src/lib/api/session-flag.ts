"use client";

import { useSyncExternalStore } from "react";

/** A readable cookie the API sets next to the httpOnly refresh token.
 *
 *  It is not a credential — it only answers "is somebody signed in?", so the
 *  public site can show the right menu entry without calling the API on every
 *  page view. The real session still lives in the httpOnly cookie. */
const COOKIE = "nnt_session";
const CHANGE_EVENT = "nnt-session-flag-change";

function read(): boolean {
  try {
    return document.cookie.split("; ").some((entry) => entry === `${COOKIE}=1`);
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  // Cookies fire no events, so re-read when the tab comes back into focus —
  // that covers signing in or out in another tab.
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

/** True when a newsroom session exists. Server-renders as false, so the markup
 *  matches and the signed-in entry appears right after hydration. */
export function useSignedIn(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Call after signing in or out so an open menu updates immediately. */
export function notifySessionChanged() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
