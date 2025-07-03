import { framer, ImageAsset } from "framer-plugin"

interface ImageData {
    nodeId: string
    image: ImageAsset
    altText: string
    isGenerating: boolean
    error?: string
}

export async function fetchImages(): Promise<ImageData[]> {
    const imageNodes = await framer.getNodesWithAttributeSet("backgroundImage")

    return imageNodes
        .filter(node => node.backgroundImage)
        .map(node => ({
            nodeId: node.id,
            image: node.backgroundImage!,
            altText: node.backgroundImage!.altText || "",
            isGenerating: false,
        }))
}

export async function updateImageAltText(nodeId: string, image: ImageAsset, altText: string) {
    try {
        // Check if the user has permission to call setAttributes
        if (!framer.isAllowedTo("setAttributes")) {
            throw new Error("Insufficient permissions to update alt text.")
        }

        await framer.setAttributes(nodeId, {
            backgroundImage: image.cloneWithAttributes({
                altText,
            }),
        })
    } catch (error) {
        console.error("Error updating alt text:", error)
        throw error
    }
}

export async function generateAltText(imageUrl: string): Promise<string> {
    const API_KEY = import.meta.env.VITE_API_KEY
    console.log("Generating alt text for image:", imageUrl)
    try {
        // First, fetch the image and convert to base64
        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": API_KEY,
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: "Generate a concise, descriptive alt text for this image. Focus on the main subject and key visual elements. Keep it under 100 characters."
                        },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image
                            }
                        }
                    ]
                }]
            })
        })

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.candidates[0]?.content?.parts[0]?.text || "Generated alt text"
    } catch (error) {
        console.error("Error generating alt text:", error)
        throw error
    }
}