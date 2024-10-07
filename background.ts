import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

interface Settings {
	openaiKey: string;
	anthropicKey: string;
	defaultModel: string;
}

let anthropic: Anthropic;

function initializeClients(settings: Settings) {
	// if (settings.openaiKey) {
	// 	openai = new OpenAI({
	// 		apiKey: settings.openaiKey, // This is the default and can be omitted
	// 	});
	// }

	if (settings.anthropicKey) {
		anthropic = new Anthropic({
			apiKey: settings.anthropicKey, // This is the default and can be omitted
		});
	}
}

chrome.storage.sync.get(["settings"], (result) => {
	const settings: Settings = result.settings || {};
	initializeClients(settings);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getCompletion") {
		getCompletion(request.prompt, request.model).then(sendResponse);
		return true; // Indicates that the response is asynchronous
	}
});

async function getCompletion(
	prompt: string,
	model: string,
): Promise<{ completion: string }> {
	try {
		let completion: string;

		// if (model.startsWith("gpt")) {
		// 	const response = await openai.chat.completions.create({
		// 		model: model,
		// 		messages: [{ role: "user", content: prompt }],
		// 		max_tokens: 50,
		// 	});
		// 	completion = response.choices[0].message?.content?.trim() || "";
		// } else
		if (model === "claude-2") {
			const response = await anthropic.completions.create({
				model: "claude-2",
				prompt: prompt,
				max_tokens_to_sample: 50,
			});
			completion = response.completion.trim();
		} else {
			throw new Error("Unsupported model");
		}

		return { completion };
	} catch (error) {
		console.error("Error getting completion:", error);
		return { completion: "Error: Unable to get completion" };
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
