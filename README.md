# In-put: AI Autocomplete Chrome Extension

<p align="center">
  <img src="assets/icon-128.png" alt="In-put Icon" width="128" height="128">
</p>

<p align="center">
  <img src="assets/in-put-demo.gif" alt="In-put Demo" width="640">
</p>


## Description

In-put is a powerful Chrome extension that brings AI-powered autocomplete functionality to any input field on the web. Using advanced language models from OpenAI and Anthropic, In-put helps you write faster and more efficiently by providing intelligent suggestions based on your input.

## Features

- Works on any input field or textarea across the web
- Supports multiple AI models:
  - Claude 3.5 (Anthropic)
  - GPT-4 (OpenAI)
  - GPT-3.5 Turbo (OpenAI)
- Customizable settings for API keys and default model
- Easy-to-use interface with a simple keyboard shortcut
- Utilizes existing input data as context for more relevant suggestions

## How to Use

1. **Installation**: 
   - Run `pnpm run build` to build the extension
   - Load the extension in Chrome by going to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

2. **Setup**:
   - Click on the extension icon in the Chrome toolbar
   - Go to "Options" to set up your API keys for OpenAI and/or Anthropic
   - Choose your default AI model

3. **Using the Extension**:
   - Focus on any input field or textarea on a webpage
   - Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to activate the AI autocomplete overlay
   - Enter your prompt in the overlay input field
   - Select the AI model you want to use (or use the default)
   - Click "Submit" or press Enter to get the AI-generated completion
   - The generated text will be inserted into the original input field

4. **Customization**:
   - You can change the default AI model and update your API keys at any time through the extension options

## Icon

The extension icon is located in the `assets` folder:
- `icon-16.png`: 16x16 pixels
- `icon-48.png`: 48x48 pixels
- `icon-128.png`: 128x128 pixels

Make sure these icon files are present in the `assets` folder of your extension directory.

## Development

To set up the development environment:

1. Clone the repository
2. Run `pnpm install` to install dependencies
3. Use `pnpm run build` to build the extension
4. Load the unpacked extension in Chrome as described in the Installation section
5. For development with auto-reloading, use `pnpm run watch`

## Use Cases

The In-put AI Autocomplete extension can be incredibly useful in various scenarios. Here are some potential use cases:

1. **Generating Mock Data**: 
   - Quickly create realistic test data for development and testing purposes
   - Generate sample user profiles, product descriptions, or transaction records

2. **Writing Pull Requests**:
   - Draft clear and concise PR descriptions
   - Generate commit messages that follow best practices
   - Summarize code changes for easier review

3. **Composing Emails**:
   - Craft professional email responses
   - Generate email templates for common scenarios

4. **Content Creation**:
   - Brainstorm ideas for blog posts or articles
   - Generate outlines for presentations or reports

5. **Code Documentation**:
   - Write clear and informative comments for your code
   - Generate docstrings for functions and classes

6. **Answering Questions**:
   - Provide quick responses to common queries in customer support scenarios
   - Generate explanations for complex topics

7. **Form Filling**:
   - Autocomplete repetitive information in online forms
   - Generate appropriate responses for survey questions

8. **Language Translation**:
   - Get quick translations for words or phrases
   - Rephrase sentences in a different language

9. **Proofreading and Editing**:
   - Suggest improvements for grammar and style
   - Rewrite sentences for clarity and conciseness

10. **Ideation and Problem-Solving**:
    - Generate potential solutions to problems
    - Brainstorm creative ideas for projects or campaigns

Remember that while the AI can provide helpful suggestions, always review and verify the generated content to ensure accuracy and appropriateness for your specific context.



## Privacy and Security

Please note that this extension sends your input to third-party AI services. Make sure you're comfortable with this and review the privacy policies of OpenAI and Anthropic before using the extension with sensitive information.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License.

Copyright (c) [year] [fullname]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



<!-- This is AI generated -->
