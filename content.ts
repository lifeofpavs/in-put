interface AutocompleteOverlay extends HTMLDivElement {
	input: HTMLInputElement;
	secondaryInput: HTMLInputElement;
	modelSelect: HTMLSelectElement;
	submitButton: HTMLButtonElement;
	settingsLink: HTMLAnchorElement;
	spinner: HTMLDivElement;
	warningMessage: HTMLDivElement;
	errorMessage: HTMLDivElement;
	originalInput: HTMLInputElement | HTMLTextAreaElement;
	previewArea: HTMLDivElement;
	applyButton: HTMLButtonElement;
}

let currentOverlay: AutocompleteOverlay | null = null;
let fullPromptContext = "";

const defaultModels = [
	{ value: "o1-mini-2024-09-12", label: "o1 Mini (OpenAI)" },
	{ value: "chatgpt-4o-latest", label: "GPT-4o (OpenAI)" },
	{ value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 (Anthropic)" },
];

function createAutocompleteOverlay(
	input: HTMLInputElement | HTMLTextAreaElement,
): AutocompleteOverlay {
	const styleElement = document.createElement("style");
	styleElement.textContent = `
		:root {
			--background-color: #2A2A2B;
			--text-color-dark: #FFFFFF;
			--text-link: #3498db;
		}

		#in-put-overlay {
			background-color: var(--background-color);
			color: var(--text-color);
		}
      a {
        color: var(--text-link)
      }


	`;

	document.head.appendChild(styleElement);
	const overlay = document.createElement("div") as AutocompleteOverlay;
	overlay.id = "in-put-overlay";

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

	const secondaryInput = document.createElement("input");
	secondaryInput.type = "text";
	secondaryInput.placeholder = "Refine your prompt (optional)...";
	secondaryInput.style.cssText = `
		width: 100%;
		padding: 5px;
		margin-top: 5px;
		box-sizing: border-box;
		display: none;
	`;

	const controlsDiv = document.createElement("div");
	controlsDiv.style.cssText = `
		display: flex;
		align-items: center;
		margin-top: 8px;
		margin-bottom: 8px;
		width: 100%;
	`;
	controlsDiv.style.gap = "8px"; // Equivalent to space-x-2

	const modelSelect = document.createElement("select");
	modelSelect.style.cssText = `
  border-radius: 4px;
  flex-grow: 1;
      `;

	chrome.storage.local.get(["settings"], (result) => {
		const defaultModel =
			result.settings?.defaultModel ?? "claude-3-5-sonnet-20240620";

		const sortedModels = defaultModels.sort((a, b) =>
			a.value === defaultModel ? -1 : b.value === defaultModel ? 1 : 0,
		);

		modelSelect.innerHTML = sortedModels
			.map(
				(model) =>
					`<option value="${model.value}"${
						model.value === defaultModel ? " selected" : ""
					}>${model.label}</option>`,
			)
			.join("");
	});

	// Add default select values if modelSelect innerHTML is empty
	if (!modelSelect.innerHTML) {
		modelSelect.innerHTML = defaultModels
			.map((model) => `<option value="${model.value}">${model.label}</option>`)
			.join("");

		// Set Claude 3.5 as the default selected option
		modelSelect.value = "claude-3-5-sonnet-20240620";
	}
	modelSelect.style.padding = "5px";

	const submitButton = document.createElement("button");
	submitButton.textContent = "Submit";
	submitButton.style.cssText = `
		padding: 0.25rem 0.75rem;
		background-color: #f3f4f6;
		border-radius: 4px;
		color: #1f2937;
		font-size: 12pxrem;
		cursor: pointer;
		margin-left: 0.5rem;
    border: 0px;
		transition: background-color 0.2s ease-in-out;
	`;

	// Add hover effect
	submitButton.addEventListener("mouseenter", () => {
		submitButton.style.backgroundColor = "#9ca3af";
	});

	submitButton.addEventListener("mouseleave", () => {
		submitButton.style.backgroundColor = "#f3f4f6";
	});

	// Add dark mode styles
	if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
		submitButton.style.backgroundColor = "#374151";
		submitButton.style.borderColor = "#4b5563";
		submitButton.style.color = "#e5e7eb";

		submitButton.addEventListener("mouseenter", () => {
			submitButton.style.backgroundColor = "#4b5563";
		});

		submitButton.addEventListener("mouseleave", () => {
			submitButton.style.backgroundColor = "#374151";
		});
	}

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
		color: #B30000;
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
	settingsLink.style.cssText = `
		display: block;
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: #3498db;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	`;
	settingsLink.addEventListener("mouseenter", () => {
		settingsLink.style.textDecoration = "underline";
	});
	settingsLink.addEventListener("mouseleave", () => {
		settingsLink.style.textDecoration = "none";
	});

	const previewArea = document.createElement("div");
	previewArea.style.cssText = `
		width: 100%;
		padding: 5px;
		margin-top: 10px;
		border: 1px solid #ccc;
		border-radius: 4px;
		max-height: 100px;
		overflow-y: auto;
		display: none;
	`;

	const previewText = document.createElement("p");
	previewText.className = "dark:text-white";
	previewArea.appendChild(previewText);

	const applyButton = document.createElement("button");
	applyButton.textContent = "Apply Changes";
	applyButton.style.cssText = `
		padding: 8px 16px;
		background-color: #10B981;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
    border: 0px;
		transition: background-color 0.2s ease-in-out;
    display: none;
		float: right;
		margin-top: 10px;
	`;

	applyButton.addEventListener("mouseenter", () => {
		applyButton.style.backgroundColor = "#059669";
	});

	applyButton.addEventListener("mouseleave", () => {
		applyButton.style.backgroundColor = "#10B981";
	});

	applyButton.addEventListener("disabled", () => {
		applyButton.style.opacity = "0.5";
		applyButton.style.cursor = "not-allowed";
	});

	overlay.appendChild(autocompleteInput);
	overlay.appendChild(secondaryInput);
	overlay.appendChild(controlsDiv);
	overlay.appendChild(warningMessage);
	overlay.appendChild(errorMessage);
	overlay.appendChild(settingsLink);
	overlay.appendChild(previewArea);
	overlay.appendChild(applyButton);
	overlay.input = autocompleteInput;
	overlay.secondaryInput = secondaryInput;
	overlay.modelSelect = modelSelect;
	overlay.submitButton = submitButton;
	overlay.settingsLink = settingsLink;
	overlay.spinner = spinner;
	overlay.warningMessage = warningMessage;
	overlay.errorMessage = errorMessage;
	overlay.originalInput = input;
	overlay.previewArea = previewArea;
	overlay.applyButton = applyButton;
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
		// Reset the overlay state
		currentOverlay.input.value = "";
		currentOverlay.input.placeholder = "Enter prompt for autocomplete...";
		const previewText = currentOverlay.previewArea.querySelector("p");
		if (previewText) {
			previewText.textContent = "";
		}
		currentOverlay.previewArea.style.display = "none";
		currentOverlay.applyButton.style.display = "none";
		// Reset the full prompt context
		fullPromptContext = "";
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
	let currentCompletion = "";

	async function handleSubmit() {
		const primaryPrompt = overlay.input.value;

		if (fullPromptContext) {
			fullPromptContext += `, ${primaryPrompt}`;
		} else {
			fullPromptContext = primaryPrompt;
		}

		const prompt = `${fullPromptContext}. CURRENT_INPUT_VALUE: ${overlay.getAttribute(
			"data-current-input",
		)}`;
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
			currentCompletion = completion;

			// Show preview instead of directly applying
			const previewText = overlay.previewArea.querySelector("p");
			if (previewText) {
				previewText.textContent = completion;
			}
			overlay.previewArea.style.display = "block";
			overlay.applyButton.style.display = "block";

			// Clear input and update placeholder for refinement
			overlay.input.value = "";
			overlay.input.placeholder = "Refine your prompt (optional)...";
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

	function applyChanges() {
		overlay.originalInput.value = currentCompletion;
		hideOverlay();
	}

	overlay.submitButton.addEventListener("click", handleSubmit);
	overlay.applyButton.addEventListener("click", applyChanges);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			hideOverlay();
		}
	}

	overlay.input.addEventListener("keydown", handleKeydown);
	overlay.secondaryInput.addEventListener("keydown", handleKeydown);

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
