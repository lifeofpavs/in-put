import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { TextBlock } from "@anthropic-ai/sdk/resources";

interface Settings {
	openaiKey: string;
	anthropicKey: string;
	defaultModel: string;
}

let anthropic: Anthropic;

function initializeClients(settings: Settings) {
	console.log("Initializing clients with settings:", settings.anthropicKey);

	anthropic = new Anthropic({
		apiKey:
			"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", //settings.anthropicKey,
		defaultHeaders: {
			"anthropic-dangerous-direct-browser-access": "true",
		},
	});
}

chrome.storage.sync.get(["settings"], (result) => {
	console.log(result);
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
		chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
	}
});

async function getCompletion(
	prompt: string,
	model: string,
): Promise<{ completion: string; error: unknown; prompt: string }> {
	try {
		let completion: string;

		if (model === "claude-3.5") {
			const response = await anthropic.messages.create({
				model: "claude-3-5-sonnet-20240620",
				messages: [{ role: "user", content: prompt }],
				system:
					"You are a helpful assistant which objective is to generate input data based on used prompt. The generated data would be used as the input of an input html text element and must be concise yet have meaning. If there is any current input value under CURRENT_INPUT_VALUE, use it for context of the prompt ",
				max_tokens: 1024,
			});

			completion = (response.content[0] as TextBlock).text;
		} else {
			throw new Error("Unsupported model");
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
