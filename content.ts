import { OpenAI } from "openai";
interface AutocompleteOverlay extends HTMLDivElement {
	input: HTMLInputElement;
	modelSelect: HTMLSelectElement;
	submitButton: HTMLButtonElement;
	settingsLink: HTMLAnchorElement;
	spinner: HTMLDivElement;
	warningMessage: HTMLDivElement;
	errorMessage: HTMLDivElement;
	originalInput: HTMLInputElement | HTMLTextAreaElement;
}

let currentOverlay: AutocompleteOverlay | null = null;

function createAutocompleteOverlay(
	input: HTMLInputElement | HTMLTextAreaElement,
): AutocompleteOverlay {
	const styleElement = document.createElement("style");
	styleElement.textContent = `
		:root {
			--background-color-light: #ffffff;
			--text-color-light: #000000;
			--background-color-dark: #121212;
			--text-color-dark: #ffffff;
      --border-color: #
		}

		#barvis-overlay {
			background-color: var(--background-color-light);
			color: var(--text-color-light);
		}

    @media (prefers-color-scheme: dark) {
			#barvis-overlay {
			background-color: var(--background-color-dark);
			color: var(--text-color-dark);
		}
	}
	`;

	const isDarkMode = window.matchMedia?.(
		"(prefers-color-scheme: dark)",
	).matches;
	const backgroundColor = isDarkMode
		? "var(--background-color-dark)"
		: "var(--background-color-light)";
	const textColor = isDarkMode
		? "var(--text-color-dark)"
		: "var(--text-color-light)";

	document.documentElement.style.setProperty(
		"--current-background-color",
		backgroundColor,
	);
	document.documentElement.style.setProperty("--current-text-color", textColor);
	document.head.appendChild(styleElement);
	const overlay = document.createElement("div") as AutocompleteOverlay;
	overlay.id = "barvis-overlay";

	overlay.style.cssText = `
		position: absolute;
		z-index: 9999;
		padding: 20px;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		display: none;
		border-radius: 8px;
		width: 400px;
	`;

	overlay.setAttribute("data-current-input", input.value);

	const autocompleteInput = document.createElement("input");
	autocompleteInput.type = "text";
	autocompleteInput.placeholder = "Enter prompt for autocomplete...";
	autocompleteInput.style.cssText = `
		width: 100%;
		padding: 5px;
		margin-top: 5px;
		box-sizing: border-box;
	`;

	const controlsDiv = document.createElement("div");
	controlsDiv.className = "flex justify-end items-center mt-2";

	const modelSelect = document.createElement("select");
	modelSelect.style.cssText = `
  		border-radius: 2px;`;

	modelSelect.innerHTML = `
    <option value="o1-mini-2024-09-12">o1 Mini (OpenAI)</option>
    <option value="chatgpt-4o-latest">GPT-4o (OpenAI)</option>
    <option value="claude-3-5-sonnet-20240620">Claude 3.5 (Anthropic)</option>
	`;
	modelSelect.style.padding = "5px";

	const submitButton = document.createElement("button");
	submitButton.textContent = "Submit";
	submitButton.className = `
		px-3 py-2
		bg-gray-100 dark:bg-gray-700
		border border-gray-300 dark:border-gray-600
		rounded
		text-gray-800 dark:text-gray-200
		text-sm
		cursor-pointer
		ml-2
		transition-colors duration-200 ease-in-out
		hover:bg-gray-200 dark:hover:bg-gray-600
	`;

	const spinner = document.createElement("div");
	spinner.className = "spinner";
	spinner.style.cssText = `
		display: none;
		width: 20px;
		height: 20px;
		border: 2px solid #f3f3f3;
		border-top: 2px solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-left: 10px;
	`;

	const warningMessage = document.createElement("div");
	warningMessage.style.cssText = `
		color: #A30000;
		font-size: 12px;
		margin-top: 5px;
		display: none;
	`;
	warningMessage.textContent =
		"No API key available. Please set up your API key in the settings.";

	const errorMessage = document.createElement("div");
	errorMessage.style.cssText = `
		color: red;
		font-size: 12px;
		margin-top: 5px;
		display: none;
	`;

	const style = document.createElement("style");
	style.textContent = `
		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	`;
	document.head.appendChild(style);

	controlsDiv.appendChild(modelSelect);
	controlsDiv.appendChild(submitButton);
	controlsDiv.appendChild(spinner);

	const settingsLink = document.createElement("a");
	settingsLink.textContent = "Open Settings ↗ ";
	settingsLink.href = chrome.runtime.getURL("options.html");
	settingsLink.id = "go-to-options";
	settingsLink.className = `
		block
		mt-2
		text-xs
		text-blue-600 dark:text-blue-400
		no-underline
		cursor-pointer
		transition-all duration-200 ease-in-out
		hover:underline
	`;

	overlay.appendChild(autocompleteInput);
	overlay.appendChild(controlsDiv);
	overlay.appendChild(warningMessage);
	overlay.appendChild(errorMessage);
	overlay.appendChild(settingsLink);
	overlay.input = autocompleteInput;
	overlay.modelSelect = modelSelect;
	overlay.submitButton = submitButton;
	overlay.settingsLink = settingsLink;
	overlay.spinner = spinner;
	overlay.warningMessage = warningMessage;
	overlay.errorMessage = errorMessage;
	overlay.originalInput = input;
	return overlay;
}

function positionOverlay(overlay: AutocompleteOverlay): void {
	const rect = overlay.originalInput.getBoundingClientRect();
	overlay.style.left = `${rect.left + window.scrollX}px`;
	overlay.style.top = `${rect.bottom + window.scrollY + 5}px`;
}

function showOverlay(input: HTMLInputElement | HTMLTextAreaElement): void {
	if (!currentOverlay) {
		currentOverlay = createAutocompleteOverlay(input);
		document.body.appendChild(currentOverlay);
		setupOverlayListeners(currentOverlay);
	} else {
		currentOverlay.originalInput = input;
	}
	positionOverlay(currentOverlay);
	currentOverlay.style.display = "block";
	checkApiKeyAvailability(currentOverlay);
	currentOverlay.input.focus();
}

function hideOverlay(): void {
	if (currentOverlay) {
		currentOverlay.style.display = "none";
		currentOverlay.originalInput.focus();
	}
}

function checkApiKeyAvailability(overlay: AutocompleteOverlay): void {
	chrome.storage.local.get(["settings"], (result) => {
		const settings = result.settings || {};
		const hasApiKey = settings.openaiKey || settings.anthropicKey;

		overlay.input.disabled = !hasApiKey;
		overlay.submitButton.disabled = !hasApiKey;
		overlay.warningMessage.style.display = hasApiKey ? "none" : "block";
	});
}

function setupOverlayListeners(overlay: AutocompleteOverlay): void {
	async function handleSubmit() {
		const prompt = `${
			overlay.input.value
		}. CURRENT_INPUT_VALUE: ${overlay.getAttribute("data-current-input")}`;
		const model = overlay.modelSelect.value;

		// Show spinner and disable submit button
		overlay.spinner.style.display = "inline-block";
		overlay.submitButton.disabled = true;
		overlay.submitButton.style.opacity = "0.5";
		overlay.errorMessage.style.display = "none";

		try {
			const completion = await requestCompletion(prompt, model);
			if (completion === "Error: Unable to get completion") {
				throw new Error("Unable to get completion");
			}
			overlay.originalInput.value = completion;
			hideOverlay();
		} catch (error) {
			overlay.errorMessage.textContent =
				"Failed to get completion. Please try again or change the model.";
			overlay.errorMessage.style.display = "block";
		} finally {
			// Hide spinner and enable submit button
			overlay.spinner.style.display = "none";
			overlay.submitButton.disabled = false;
			overlay.submitButton.style.opacity = "1";
		}
	}

	overlay.submitButton.addEventListener("click", handleSubmit);
	overlay.input.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			hideOverlay();
		}
	});

	overlay.settingsLink.addEventListener("click", (e) => {
		e.preventDefault();
		chrome.runtime.sendMessage({ action: "openSettingsPage" });
	});

	overlay.modelSelect.addEventListener("change", () => {
		overlay.errorMessage.style.display = "none";
	});
}

async function requestCompletion(
	prompt: string,
	model: string,
): Promise<string> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{ action: "getCompletion", prompt, model },
			(response) => {
				resolve(response.completion);
			},
		);
	});
}

// Event delegation for handling input focus and keydown events
document.addEventListener("focusin", (e: FocusEvent) => {
	const target = e.target as HTMLElement;
	if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
		target.addEventListener("keydown", handleInputKeydown);
	}
});

document.addEventListener("focusout", (e: FocusEvent) => {
	const target = e.target as HTMLElement;
	if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
		target.removeEventListener("keydown", handleInputKeydown);
	}
});

function handleInputKeydown(e: KeyboardEvent): void {
	if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
		e.preventDefault();
		showOverlay(e.target as HTMLInputElement | HTMLTextAreaElement);
	}
}

// Global event listeners
document.addEventListener("keydown", (e: KeyboardEvent) => {
	if (e.key === "Escape" && currentOverlay) {
		e.preventDefault();
		hideOverlay();
	}
});

document.addEventListener("click", (e: MouseEvent) => {
	if (
		currentOverlay &&
		!currentOverlay.contains(e.target as Node) &&
		e.target !== currentOverlay.originalInput
	) {
		hideOverlay();
	}
});

// Listen for the keyboard shortcut
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "activateAutocomplete") {
		const activeElement = document.activeElement;
		if (
			activeElement instanceof HTMLInputElement ||
			activeElement instanceof HTMLTextAreaElement
		) {
			showOverlay(activeElement);
		}
	}
});
