import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

interface Settings {
	openaiKey: string;
	anthropicKey: string;
	defaultModel: string;
}

let anthropic: Anthropic;

function initializeClients(settings: Settings) {
	if (settings.anthropicKey) {
		anthropic = new Anthropic({
			apiKey: settings.anthropicKey,
		});
	}
}

chrome.storage.sync.get(["settings"], (result) => {
	const settings: Settings = result.settings || {};
	initializeClients(settings);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);
	if (request.action === "getCompletion") {
		getCompletion(request.prompt, request.model).then(sendResponse);
		return true; // Indicates that the response is asynchronous
	}
	if (request.action === "openSettingsPage") {
		chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
	}
});

async function getCompletion(
	prompt: string,
	model: string,
): Promise<{ completion: string; error: unknown; prompt: string }> {
	try {
		let completion: string;

		if (model === "claude-3.5") {
			const response = await anthropic.completions.create({
				model: "claude-3",
				prompt: prompt,
				max_tokens_to_sample: 50,
			});
			completion = response.completion.trim();
		} else {
			console.log("unsupported");
			return { completion: "", error: "unsupported", prompt };
			throw new Error("Unsupported model");
		}

		return { completion: "kk", error: "", prompt };
	} catch (error) {
		console.error("Error getting completion:", error, prompt);
		return {
			completion: "Error: Unable to get completion",
			error,
			prompt,
		};
	}
}

chrome.commands.onCommand.addListener((command) => {
	if (command === "_execute_action") {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0].id) {
				chrome.tabs.sendMessage(tabs[0].id, { action: "activateAutocomplete" });
			}
		});
	}
});
