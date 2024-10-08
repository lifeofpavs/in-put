(()=>{"use strict";let t=null;function e(e){var o;t?t.originalInput=e:(t=function(t){const e=document.createElement("style");e.textContent="\n\t\t:root {\n\t\t\t--background-color-light: #ffffff;\n\t\t\t--text-color-light: #000000;\n\t\t\t--background-color-dark: #121212;\n\t\t\t--text-color-dark: #ffffff;\n      --border-color: #\n\t\t}\n\n\t\t#in-put-overlay {\n\t\t\tbackground-color: var(--background-color-light);\n\t\t\tcolor: var(--text-color-light);\n\t\t}\n\n    @media (prefers-color-scheme: dark) {\n\t\t\t#in-put-overlay {\n\t\t\tbackground-color: var(--background-color-dark);\n\t\t\tcolor: var(--text-color-dark);\n\t\t}\n\t}\n\t";const n=window.matchMedia?.("(prefers-color-scheme: dark)").matches,o=n?"var(--background-color-dark)":"var(--background-color-light)",r=n?"var(--text-color-dark)":"var(--text-color-light)";document.documentElement.style.setProperty("--current-background-color",o),document.documentElement.style.setProperty("--current-text-color",r),document.head.appendChild(e);const a=document.createElement("div");a.id="in-put-overlay",a.style.cssText="\n\t\tposition: absolute;\n\t\tz-index: 9999;\n\t\tpadding: 20px;\n\t\tbox-shadow: 0 2px 5px rgba(0,0,0,0.2);\n\t\tdisplay: none;\n\t\tborder-radius: 8px;\n\t\twidth: 400px;\n\t",a.setAttribute("data-current-input",t.value);const i=document.createElement("input");i.type="text",i.placeholder="Enter prompt for autocomplete...",i.style.cssText="\n\t\twidth: 100%;\n\t\tpadding: 5px;\n\t\tmargin-top: 5px;\n\t\tbox-sizing: border-box;\n\t";const s=document.createElement("div");s.className="flex justify-end items-center mt-2";const l=document.createElement("select");l.style.cssText="\n  \t\tborder-radius: 2px;",l.innerHTML='\n    <option value="o1-mini-2024-09-12">o1 Mini (OpenAI)</option>\n    <option value="chatgpt-4o-latest">GPT-4o (OpenAI)</option>\n    <option value="claude-3-5-sonnet-20240620">Claude 3.5 (Anthropic)</option>\n\t',l.style.padding="5px";const d=document.createElement("button");d.textContent="Submit",d.className="\n\t\tpx-3 py-2\n\t\tbg-gray-100 dark:bg-gray-700\n\t\tborder border-gray-300 dark:border-gray-600\n\t\trounded\n\t\ttext-gray-800 dark:text-gray-200\n\t\ttext-sm\n\t\tcursor-pointer\n\t\tml-2\n\t\ttransition-colors duration-200 ease-in-out\n\t\thover:bg-gray-200 dark:hover:bg-gray-600\n\t";const c=document.createElement("div");c.className="spinner",c.style.cssText="\n\t\tdisplay: none;\n\t\twidth: 20px;\n\t\theight: 20px;\n\t\tborder: 2px solid #f3f3f3;\n\t\tborder-top: 2px solid #3498db;\n\t\tborder-radius: 50%;\n\t\tanimation: spin 1s linear infinite;\n\t\tmargin-left: 10px;\n\t";const p=document.createElement("div");p.style.cssText="\n\t\tcolor: #A30000;\n\t\tfont-size: 12px;\n\t\tmargin-top: 5px;\n\t\tdisplay: none;\n\t",p.textContent="No API key available. Please set up your API key in the settings.";const u=document.createElement("div");u.style.cssText="\n\t\tcolor: red;\n\t\tfont-size: 12px;\n\t\tmargin-top: 5px;\n\t\tdisplay: none;\n\t";const m=document.createElement("style");m.textContent="\n\t\t@keyframes spin {\n\t\t\t0% { transform: rotate(0deg); }\n\t\t\t100% { transform: rotate(360deg); }\n\t\t}\n\t",document.head.appendChild(m),s.appendChild(l),s.appendChild(d),s.appendChild(c);const g=document.createElement("a");return g.textContent="Open Settings ↗ ",g.href=chrome.runtime.getURL("options.html"),g.id="go-to-options",g.className="\n\t\tblock\n\t\tmt-2\n\t\ttext-xs\n\t\ttext-blue-600 dark:text-blue-400\n\t\tno-underline\n\t\tcursor-pointer\n\t\ttransition-all duration-200 ease-in-out\n\t\thover:underline\n\t",a.appendChild(i),a.appendChild(s),a.appendChild(p),a.appendChild(u),a.appendChild(g),a.input=i,a.modelSelect=l,a.submitButton=d,a.settingsLink=g,a.spinner=c,a.warningMessage=p,a.errorMessage=u,a.originalInput=t,a}(e),document.body.appendChild(t),function(t){async function e(){const e=`${t.input.value}. CURRENT_INPUT_VALUE: ${t.getAttribute("data-current-input")}`,o=t.modelSelect.value;t.spinner.style.display="inline-block",t.submitButton.disabled=!0,t.submitButton.style.opacity="0.5",t.errorMessage.style.display="none";try{const r=await async function(t,e){return new Promise((n=>{chrome.runtime.sendMessage({action:"getCompletion",prompt:t,model:e},(t=>{n(t.completion)}))}))}(e,o);if("Error: Unable to get completion"===r)throw new Error("Unable to get completion");t.originalInput.value=r,n()}catch(e){t.errorMessage.textContent="Failed to get completion. Please try again or change the model.",t.errorMessage.style.display="block"}finally{t.spinner.style.display="none",t.submitButton.disabled=!1,t.submitButton.style.opacity="1"}}t.submitButton.addEventListener("click",e),t.input.addEventListener("keydown",(t=>{"Enter"===t.key?(t.preventDefault(),e()):"Escape"===t.key&&(t.preventDefault(),n())})),t.settingsLink.addEventListener("click",(t=>{t.preventDefault(),chrome.runtime.sendMessage({action:"openSettingsPage"})})),t.modelSelect.addEventListener("change",(()=>{t.errorMessage.style.display="none"}))}(t)),function(t){const e=t.originalInput.getBoundingClientRect();t.style.left=`${e.left+window.scrollX}px`,t.style.top=`${e.bottom+window.scrollY+5}px`}(t),t.style.display="block",o=t,chrome.storage.local.get(["settings"],(t=>{const e=t.settings||{},n=e.openaiKey||e.anthropicKey;o.input.disabled=!n,o.submitButton.disabled=!n,o.warningMessage.style.display=n?"none":"block"})),t.input.focus()}function n(){t&&(t.style.display="none",t.originalInput.focus())}function o(t){"k"===t.key&&(t.metaKey||t.ctrlKey)&&(t.preventDefault(),e(t.target))}document.addEventListener("focusin",(t=>{const e=t.target;"INPUT"!==e.tagName&&"TEXTAREA"!==e.tagName||e.addEventListener("keydown",o)})),document.addEventListener("focusout",(t=>{const e=t.target;"INPUT"!==e.tagName&&"TEXTAREA"!==e.tagName||e.removeEventListener("keydown",o)})),document.addEventListener("keydown",(e=>{"Escape"===e.key&&t&&(e.preventDefault(),n())})),document.addEventListener("click",(e=>{t&&!t.contains(e.target)&&e.target!==t.originalInput&&n()})),chrome.runtime.onMessage.addListener(((t,n,o)=>{if("activateAutocomplete"===t.action){const t=document.activeElement;(t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement)&&e(t)}}))})();