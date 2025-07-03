import { framer, ImageAsset, useIsAllowedTo } from "framer-plugin"
import { useState, useEffect } from "react"
import { fetchImages, updateImageAltText, generateAltText } from "./utils"
import "./App.css"

// Configure the plugin UI (compact size)
framer.showUI({
    position: "top right",
    width: 280,
    height: 400,
})

interface ImageData {
    nodeId: string
    image: ImageAsset
    altText: string
    isGenerating: boolean
    error?: string
}

export function App() {
    const [images, setImages] = useState<ImageData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [inputValues, setInputValues] = useState<{ [key: number]: string }>({})
    const canSetAttributes = useIsAllowedTo("setAttributes")

    useEffect(() => {
        async function loadImages() {
            setIsLoading(true)
            try {
                const fetchedImages = await fetchImages()
                setImages(fetchedImages)
                setError(null)
            } catch (err) {
                setError("Failed to load images.")
            } finally {
                setIsLoading(false)
            }
        }

        loadImages()
        return framer.subscribeToCanvasRoot(() => loadImages())
    }, [])

    const handleGenerateAltText = async (index: number) => {
        const imageData = images[index]
        // Prevent multiple clicks if already generating
        if (imageData.isGenerating) return

        // Immediately disable the button
        setImages((prev) =>
            prev.map((img, i) =>
                i === index ? { ...img, isGenerating: true, error: undefined } : img
            )
        )

        try {
            const altText = await generateAltText(imageData.image.url)
            setImages((prev) =>
                prev.map((img, i) =>
                    i === index ? { ...img, altText, isGenerating: false } : img
                )
            )
            setInputValues((prev) => ({ ...prev, [index]: altText }))
            if (canSetAttributes) {
                await updateImageAltText(imageData.nodeId, imageData.image, altText)
            } else {
                setImages((prev) =>
                    prev.map((img, i) =>
                        i === index
                            ? { ...img, isGenerating: false, error: "Cannot save: Insufficient permissions." }
                            : img
                    )
                )
            }
        } catch (err) {
            setImages((prev) =>
                prev.map((img, i) =>
                    i === index
                        ? { ...img, isGenerating: false, error: err.message || "Failed to generate." }
                        : img
                )
            )
        }
    }

    const handleInputChange = (index: number, value: string) => {
        setInputValues((prev) => ({ ...prev, [index]: value }))
    }

    return (
        <main className="main">
            <div className="header">
                <h3 className="title">Alt Text Generator</h3>
                {!canSetAttributes && (
                    <div className="error-message">Limited permissions: Cannot save changes.</div>
                )}
            </div>
            {isLoading ? (
                <div className="status-message">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : images.length === 0 ? (
                <div className="status-message">No images found.</div>
            ) : (
                <div className="image-list">
                    {images.map((imageData, index) => (
                        <div key={imageData.nodeId} className="image-item">
                            <img
                                src={imageData.image.url}
                                alt={imageData.altText || "Thumbnail"}
                                className="image-thumbnail"
                            />
                            <div className="image-content">
                                <input
                                    key={`input-${imageData.nodeId}`}
                                    type="text"
                                    value={inputValues[index] ?? imageData.altText}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    placeholder="Alt text"
                                    className="alt-text-input"
                                    disabled={!canSetAttributes}
                                />
                                {imageData.error && (
                                    <div className="item-error">{imageData.error}</div>
                                )}
                                <div className="button-group">
                                    <button
                                        onClick={() => handleGenerateAltText(index)}
                                        disabled={imageData.isGenerating || !canSetAttributes}
                                        className="generate-button"
                                    >
                                        <span className="generate-icon">✦</span>
                                        <span className="generate-text">
                                            {imageData.isGenerating ? "..." : "Generate"}
                                        </span>
                                    </button>
                                    <button className="edit-button" disabled={!canSetAttributes}>
                                        <svg
                                            className="edit-icon"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}