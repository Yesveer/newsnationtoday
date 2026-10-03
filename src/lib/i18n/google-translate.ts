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

export function writeTranslateCookie(target: string, source: string = SOURCE_LANGUAGE) {
  const value = `/${source}/${target}`;
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
export function applyTranslateTarget(target: string, source: string = SOURCE_LANGUAGE) {
  if (target === source) clearTranslateCookie();
  else writeTranslateCookie(target, source);
}

/** Runs during HTML parsing, before anything else.
 *
 *  Two jobs, both of which have to happen early:
 *
 *  1. Put the reader's stored language on Google's cookie. Google reads it
 *     exactly once at init, so the page arrives already translated instead of
 *     flipping a moment later.
 *  2. Define the init callback. Google's element.js calls
 *     `googleTranslateElementInit` as soon as it loads; if the callback is
 *     defined later by a React-rendered script, the call can land first and
 *     the page silently never translates.
 *
 *  The language list is inlined by the server, so it is whatever the newsroom
 *  configured. */
export function translateBootstrapScript(
  defaultLanguage: string = DEFAULT_LANGUAGE,
  source: string = SOURCE_LANGUAGE,
  includedLanguages: string[] = [],
): string {
  const included = includedLanguages.length > 0 ? includedLanguages.join(",") : defaultLanguage;

  return `(function(){
/* Google Translate rewrites the page's text nodes in place. React still holds
   references to the originals, so the next re-render calls removeChild on a
   node that now has a different parent and the whole tree unmounts with
   "NotFoundError: The node to be removed is not a child of this node".
   Nothing in React can prevent that from the outside, so the two DOM calls it
   affects are made tolerant: if the node has already been moved, do the right
   thing instead of throwing. This is the only reason these are patched. */
try{
  var removeChild=Node.prototype.removeChild;
  Node.prototype.removeChild=function(child){
    if(child.parentNode!==this){
      if(child.parentNode)return removeChild.call(child.parentNode,child);
      return child;
    }
    return removeChild.call(this,child);
  };
  var insertBefore=Node.prototype.insertBefore;
  Node.prototype.insertBefore=function(node,before){
    if(before&&before.parentNode!==this){
      if(before.parentNode)return insertBefore.call(before.parentNode,node,before);
      return this.appendChild(node);
    }
    return insertBefore.call(this,node,before);
  };
}catch(e){}
try{
var stored=localStorage.getItem("newshub-language")||${JSON.stringify(defaultLanguage)};
var source=${JSON.stringify(source)};
var host=location.hostname;
var domains=(host==="localhost"||/^[\\d.]+$/.test(host))?[""]:["",";domain="+host,";domain=."+host];
for(var i=0;i<domains.length;i++){
  document.cookie="googtrans="+(stored===source?"":"/"+source+"/"+stored)+";path=/"+domains[i]+";max-age="+(stored===source?0:31536000);
}
}catch(e){}
window.googleTranslateElementInit=function(){
  if(!window.google||!window.google.translate)return;
  new window.google.translate.TranslateElement({
    pageLanguage:${JSON.stringify(source)},
    includedLanguages:${JSON.stringify(included)},
    autoDisplay:false
  },"google_translate_element");
};
})();`;
}
