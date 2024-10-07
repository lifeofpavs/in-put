interface AutocompleteOverlay extends HTMLDivElement {
	input: HTMLInputElement;
	modelSelect: HTMLSelectElement;
	submitButton: HTMLButtonElement;
	settingsLink: HTMLAnchorElement;
	originalInput: HTMLInputElement | HTMLTextAreaElement;
}

let currentOverlay: AutocompleteOverlay | null = null;

function createAutocompleteOverlay(
	input: HTMLInputElement | HTMLTextAreaElement,
): AutocompleteOverlay {
	// Add Tailwind CSS CDN
	const tailwindScript = document.createElement("script");
	tailwindScript.src = "https://cdn.tailwindcss.com";
	document.head.appendChild(tailwindScript);

	const overlay = document.createElement("div") as AutocompleteOverlay;
	overlay.style.cssText = `
		position: absolute;
		z-index: 9999;
		background: white;
		border: 1px solid #ccc;
		padding: 10px;
		box-shadow: 0 2px 5px rgba(0,0,0,0.2);
		display: none;
		border-radius: 4px;

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
	modelSelect.innerHTML = `
		<option value="claude-3.5">Claude 3.5</option>
		<option value="gpt-4">GPT-4</option>
		<option value="gpt-3.5-turbo">GPT-3.5</option>
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

	controlsDiv.appendChild(modelSelect);
	controlsDiv.appendChild(submitButton);

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
	overlay.appendChild(settingsLink);
	overlay.input = autocompleteInput;
	overlay.modelSelect = modelSelect;
	overlay.submitButton = submitButton;
	overlay.settingsLink = settingsLink;
	overlay.originalInput = input;
	return overlay;
}

function positionOverlay(overlay: AutocompleteOverlay): void {
	const rect = overlay.originalInput.getBoundingClientRect();

	overlay.style.left = `${rect.left + window.scrollX}px`;
	overlay.style.top = `${
		rect.bottom + window.scrollY + 5 - overlay.offsetHeight
	}px`;
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
	currentOverlay.input.focus();
}

function hideOverlay(): void {
	if (currentOverlay) {
		currentOverlay.style.display = "none";
		currentOverlay.originalInput.focus();
	}
}

function setupOverlayListeners(overlay: AutocompleteOverlay): void {
	async function handleSubmit() {
		const prompt = `${
			overlay.input.value
		}. CURRENT_INPUT_VALUE: ${overlay.getAttribute("data-current-input")}`;
		const model = overlay.modelSelect.value;

		const completion = await requestCompletion(prompt, model);
		overlay.originalInput.value = completion;
		hideOverlay();
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
}

async function requestCompletion(
	prompt: string,
	model: string,
): Promise<string> {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{ action: "getCompletion", prompt, model },
			(response) => {
				console.log("REspoinse is", response);
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
