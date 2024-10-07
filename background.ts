import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { TextBlock } from "@anthropic-ai/sdk/resources";

interface Settings {
	openaiKey: string;
	anthropicKey: string;
	defaultModel: string;
}

let anthropic: Anthropic;
let openai: OpenAI;

function initializeClients(settings: Settings) {
	if (settings.anthropicKey) {
		anthropic = new Anthropic({
			apiKey: settings.anthropicKey,
			defaultHeaders: {
				"anthropic-dangerous-direct-browser-access": "true",
			},
		});
	}

	if (settings.openaiKey) {
		openai = new OpenAI({ apiKey: settings.openaiKey });
	}
}

function loadSettings() {
	chrome.storage.local.get(["settings"], (result) => {
		const settings: Settings = result.settings || {};
		initializeClients(settings);
	});
}

// Initialize settings
loadSettings();

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
	if (namespace === "local" && changes.settings) {
		const newSettings: Settings = changes.settings.newValue;
		initializeClients(newSettings);
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getCompletion") {
		getCompletion(request.prompt, request.model).then(sendResponse);
		return true; // Indicates that the response is asynchronous
	}
	if (request.action === "openSettingsPage") {
		chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
	}
});

async function getCompletion(
	prompt: string,
	model: string,
): Promise<{ completion: string; error: unknown; prompt: string }> {
	try {
		let completion: string;

		if (model === "claude-3-5-sonnet-20240620" && anthropic) {
			const response = await anthropic.messages.create({
				model,
				messages: [{ role: "user", content: prompt }],
				system:
					"You are a helpful assistant which objective is to generate input data based on used prompt. The generated data would be used as the input of an input html text element and must be concise yet have meaning. If there is any current input value under CURRENT_INPUT_VALUE, use it for context of the prompt. Do not text back any other information other than the new input value ",
				max_tokens: 4096,
			});

			completion = (response.content[0] as TextBlock).text;
		} else if (openai) {
			const response = await openai.chat.completions.create({
				model: model,
				messages: [
					{
						role: "system",
						content:
							"You are a helpful assistant which objective is to generate input data based on used prompt. The generated data would be used as the input of an input html text element and must be concise yet have meaning. If there is any current input value under CURRENT_INPUT_VALUE, use it for context of the prompt. Do not text back any other information other than the new input value ",
					},
					{ role: "user", content: prompt },
				],

				max_tokens: 4096,
			});

			completion = response.choices[0].message.content || "";
		} else {
			throw new Error("Unsupported model or API key not set");
		}

		return { completion: completion, error: "", prompt };
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
