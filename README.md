# Alt Text Generator Framer Plugin

A Framer plugin that automatically generates concise, descriptive alt text for images on your canvas using Google's Gemini API. Improve your project's accessibility with just one click!

## Features

- **Automatic Alt Text Generation:** Uses Gemini API to generate alt text for images.
- **Manual Editing:** Edit and save alt text directly in the plugin UI.
- **Batch Support:** Works with all images on the current canvas.
- **Permission Awareness:** UI adapts if you lack permission to edit images.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Framer](https://www.framer.com/)
- A Gemini API key (for image-to-text generation)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd alt-text-plugin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure your API key:**
   - Create a `.env` file in the project root:
     ```
     VITE_API_KEY=your-gemini-api-key-here
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

- Open the plugin from the Framer canvas.
- The plugin lists all images with their current alt text.
- Click **Generate** to auto-generate alt text for an image.
- Edit alt text manually and click **Save Manual Edit** to update.
- If you lack permissions, the plugin will notify you.

## How I Made This

This plugin was built using:

- **[Framer Plugin API](https://www.framer.com/developers/plugins/introduction):** For interacting with the Framer canvas and images.
- **React + TypeScript:** For a robust, type-safe UI.
- **Vite:** For fast development and bundling.
- **Gemini API:** To generate descriptive alt text from image data.

**Development Steps:**

1. **Project Setup:** Initialized with Vite and TypeScript, added Framer plugin dependencies.
2. **Plugin UI:** Built a React UI for listing images, editing, and generating alt text.
3. **Framer Integration:** Used Framer's API to read and update image alt text.
4. **API Integration:** Connected to Gemini API for image-to-text generation, handling permissions and errors.
