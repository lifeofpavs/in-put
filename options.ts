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

// Load saved settings
chrome.storage.sync.get(["settings"], (result) => {
	const settings: Settings = result.settings || {};
	openaiKeyInput.value = settings.openaiKey || "";
	anthropicKeyInput.value = settings.anthropicKey || "";
	defaultModelSelect.value = settings.defaultModel || "gpt-3.5-turbo";
});

// Save settings
settingsForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const settings: Settings = {
		openaiKey: openaiKeyInput.value,
		anthropicKey: anthropicKeyInput.value,
		defaultModel: defaultModelSelect.value,
	};
	chrome.storage.sync.set({ settings }, () => {
		alert("Settings saved successfully!");
	});
});
