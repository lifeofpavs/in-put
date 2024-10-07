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

	const autocompleteInput = document.createElement("input");
	autocompleteInput.type = "text";
	autocompleteInput.placeholder = "Enter prompt for autocomplete...";
	autocompleteInput.style.width = "200px";
	autocompleteInput.style.marginRight = "5px";
	autocompleteInput.style.padding = "5px";

	const modelSelect = document.createElement("select");
	modelSelect.innerHTML = `
		<option value="gpt-3.5-turbo">GPT-3.5</option>
		<option value="gpt-4">GPT-4</option>
		<option value="calude-3.5">Claude 3.5</option>
	`;
	modelSelect.style.padding = "5px";

	const submitButton = document.createElement("button");
	submitButton.textContent = "Submit";
	submitButton.style.padding = "5px";

	const settingsLink = document.createElement("a");
	settingsLink.textContent = "Settings";
	settingsLink.href = chrome.runtime.getURL("options.html");
	settingsLink.id = "go-to-options";
	settingsLink.style.cssText = `
		display: block;
		margin-top: 5px;
		font-size: 12px;
		color: #0066cc;
		text-decoration: none;
	`;

	overlay.appendChild(autocompleteInput);
	overlay.appendChild(modelSelect);
	overlay.appendChild(submitButton);
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
		rect.top + window.scrollY - overlay.offsetHeight - 5
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
		const prompt = overlay.input.value;
		const model = overlay.modelSelect.value;
		console.log("I have been clicked");
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
