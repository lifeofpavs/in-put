interface Settings {
	openaiKey: string;
	anthropicKey: string;
	defaultModel: string;
}

const settingsForm = document.getElementById("settingsForm") as HTMLFormElement;
const openaiKeyInput = document.getElementById("openaiKey") as HTMLInputElement;
const anthropicKeyInput = document.getElementById(
	"anthropicKey",
) as HTMLInputElement;
const defaultModelSelect = document.getElementById(
	"defaultModel",
) as HTMLSelectElement;
const showOpenAIKeyCheckbox = document.getElementById(
	"showOpenAIKey",
) as HTMLInputElement;
const showAnthropicKeyCheckbox = document.getElementById(
	"showAnthropicKey",
) as HTMLInputElement;

// Load saved settings
function loadSettings() {
	chrome.storage.local.get(["settings"], (result) => {
		const settings: Settings = result.settings || {};
		openaiKeyInput.value = settings.openaiKey || "";
		anthropicKeyInput.value = settings.anthropicKey || "";
		defaultModelSelect.value =
			settings.defaultModel || "claude-3-5-sonnet-latest";
	});
}

// Save settings
function saveSettings(settings: Settings) {
	return new Promise<void>((resolve) => {
		chrome.storage.local.set({ settings }, () => {
			resolve();
		});
	});
}

// Initialize
loadSettings();

// Save settings
settingsForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const settings: Settings = {
		openaiKey: openaiKeyInput.value,
		anthropicKey: anthropicKeyInput.value,
		defaultModel: defaultModelSelect.value,
	};
	await saveSettings(settings);
	alert("Settings saved successfully!");
});

// Add event listener for changes
function handleSettingChange() {
	const settings: Settings = {
		openaiKey: openaiKeyInput.value,
		anthropicKey: anthropicKeyInput.value,
		defaultModel: defaultModelSelect.value,
	};
	saveSettings(settings);
}

for (const element of [openaiKeyInput, anthropicKeyInput, defaultModelSelect]) {
	element.addEventListener("change", handleSettingChange);
}

// Show/hide API keys
function togglePasswordVisibility(
	inputElement: HTMLInputElement,
	isChecked: boolean,
) {
	inputElement.type = isChecked ? "text" : "password";
}

showOpenAIKeyCheckbox.addEventListener("change", () => {
	togglePasswordVisibility(openaiKeyInput, showOpenAIKeyCheckbox.checked);
});

showAnthropicKeyCheckbox.addEventListener("change", () => {
	togglePasswordVisibility(anthropicKeyInput, showAnthropicKeyCheckbox.checked);
});
