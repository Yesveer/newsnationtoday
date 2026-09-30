import { DEFAULT_LANGUAGE, SOURCE_LANGUAGE } from "@/config/languages.config";

/** Google's website translator is driven entirely by this cookie. Writing it
 *  and reloading is the only reliable way to switch language — poking the
 *  widget's hidden <select> breaks whenever Google changes its markup. */
const COOKIE = "googtrans";

function cookieDomains(): string[] {
  const { hostname } = window.location;
  // localhost / IPs only accept a host-only cookie.
  if (hostname === "localhost" || /^[\d.]+$/.test(hostname)) return [""];
  return ["", `;domain=${hostname}`, `;domain=.${hostname}`];
}

export function readTranslateCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return null;
  // Value looks like "/hi/mr" — the second half is the target language.
  const target = decodeURIComponent(match[1]).split("/")[2];
  return target || null;
}

export function writeTranslateCookie(target: string) {
  const value = `/${SOURCE_LANGUAGE}/${target}`;
  for (const domain of cookieDomains()) {
    document.cookie = `${COOKIE}=${value};path=/${domain};max-age=${60 * 60 * 24 * 365}`;
  }
}

export function clearTranslateCookie() {
  for (const domain of cookieDomains()) {
    document.cookie = `${COOKIE}=;path=/${domain};max-age=0`;
  }
}

/** Point Google at `target`, or drop the cookie when the target *is* the
 *  language the site is written in (no translation needed). */
export function applyTranslateTarget(target: string) {
  if (target === SOURCE_LANGUAGE) clearTranslateCookie();
  else writeTranslateCookie(target);
}

/** Runs during HTML parsing, before Google's script boots.
 *
 *  Google reads the `googtrans` cookie exactly once at init, so the reader's
 *  stored language has to be on the cookie before that — otherwise the first
 *  paint stays in Hindi until they switch manually. */
export const translateBootstrapScript = `(function(){try{
var stored=localStorage.getItem("newshub-language")||"${DEFAULT_LANGUAGE}";
var host=location.hostname;
var domains=(host==="localhost"||/^[\\d.]+$/.test(host))?[""]:["",";domain="+host,";domain=."+host];
for(var i=0;i<domains.length;i++){
  document.cookie="googtrans="+(stored==="${SOURCE_LANGUAGE}"?"":"/${SOURCE_LANGUAGE}/"+stored)+";path=/"+domains[i]+";max-age="+(stored==="${SOURCE_LANGUAGE}"?0:31536000);
}
}catch(e){}})();`;
