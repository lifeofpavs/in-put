"use strict";
const settingsForm = document.getElementById("settingsForm");
const openaiKeyInput = document.getElementById("openaiKey");
const anthropicKeyInput = document.getElementById("anthropicKey");
const defaultModelSelect = document.getElementById("defaultModel");
// Load saved settings
chrome.storage.sync.get(["settings"], (result) => {
    const settings = result.settings || {};
    openaiKeyInput.value = settings.openaiKey || "";
    anthropicKeyInput.value = settings.anthropicKey || "";
    defaultModelSelect.value = settings.defaultModel || "gpt-3.5-turbo";
});
// Save settings
settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const settings = {
        openaiKey: openaiKeyInput.value,
        anthropicKey: anthropicKeyInput.value,
        defaultModel: defaultModelSelect.value,
    };
    chrome.storage.sync.set({ settings }, () => {
        alert("Settings saved successfully!");
    });
});
