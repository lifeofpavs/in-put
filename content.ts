interface AutocompleteOverlay extends HTMLDivElement {
	input: HTMLInputElement;
	modelSelect: HTMLSelectElement;
	submitButton: HTMLButtonElement;
	originalInput: HTMLInputElement | HTMLTextAreaElement;
}

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
	`;

	const autocompleteInput = document.createElement("input");
	autocompleteInput.type = "text";
	autocompleteInput.placeholder = "Enter prompt for autocomplete...";
	autocompleteInput.style.width = "calc(100% - 180px)";
	autocompleteInput.style.marginRight = "5px";
	autocompleteInput.style.padding = "5px";

	const modelSelect = document.createElement("select");
	modelSelect.innerHTML = `
		<option value="gpt-3.5-turbo">GPT-3.5</option>
		<option value="gpt-4">GPT-4</option>
		<option value="claude-2">Claude 2</option>
	`;
	modelSelect.style.width = "100px";
	modelSelect.style.marginRight = "5px";
	modelSelect.style.padding = "5px";

	const submitButton = document.createElement("button");
	submitButton.textContent = "Submit";
	submitButton.style.width = "70px";
	submitButton.style.padding = "5px";

	overlay.appendChild(autocompleteInput);
	overlay.appendChild(modelSelect);
	overlay.appendChild(submitButton);
	overlay.input = autocompleteInput;
	overlay.modelSelect = modelSelect;
	overlay.submitButton = submitButton;
	overlay.originalInput = input;

	return overlay;
}

function positionOverlay(overlay: AutocompleteOverlay): void {
	const rect = overlay.originalInput.getBoundingClientRect();
	overlay.style.left = `${rect.left + window.scrollX}px`;
	overlay.style.top = `${rect.bottom + window.scrollY}px`;
	overlay.style.width = `${rect.width}px`;
}

function setupAutocomplete(
	input: HTMLInputElement | HTMLTextAreaElement,
): void {
	const overlay = createAutocompleteOverlay(input);
	document.body.appendChild(overlay);

	positionOverlay(overlay);
	window.addEventListener("resize", () => positionOverlay(overlay));
	window.addEventListener("scroll", () => positionOverlay(overlay));

	input.addEventListener("keydown", (e: Event) => {
		const keyboardEvent = e as KeyboardEvent;
		if (
			keyboardEvent.key === "k" &&
			(keyboardEvent.metaKey || keyboardEvent.ctrlKey)
		) {
			e.preventDefault();
			overlay.style.display = "block";
			overlay.input.focus();
		}
	});

	overlay.input.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			overlay.style.display = "none";
			input.focus();
		}
	});

	async function handleSubmit() {
		const prompt = overlay.input.value;
		const model = overlay.modelSelect.value;
		const completion = await requestCompletion(prompt, model);
		input.value = completion;
		overlay.style.display = "none";
		input.focus();
	}

	overlay.submitButton.addEventListener("click", handleSubmit);
	overlay.input.addEventListener("keydown", (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
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

function addAutocompleteToInputs() {
	const inputs = document.querySelectorAll<
		HTMLInputElement | HTMLTextAreaElement
	>('input[type="text"], textarea');
	inputs.forEach(setupAutocomplete);
}

// Initial setup
addAutocompleteToInputs();

// Setup for dynamically added inputs
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.type === "childList") {
			mutation.addedNodes.forEach((node) => {
				if (node instanceof HTMLElement) {
					const inputs = node.querySelectorAll<
						HTMLInputElement | HTMLTextAreaElement
					>('input[type="text"], textarea');
					inputs.forEach(setupAutocomplete);
				}
			});
		}
	});
});

observer.observe(document.body, { childList: true, subtree: true });

// Listen for the keyboard shortcut
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "activateAutocomplete") {
		const activeElement = document.activeElement;
		if (
			activeElement instanceof HTMLInputElement ||
			activeElement instanceof HTMLTextAreaElement
		) {
			const event = new KeyboardEvent("keydown", {
				key: "k",
				metaKey: true,
				bubbles: true,
			});
			activeElement.dispatchEvent(event);
		}
	}
});
