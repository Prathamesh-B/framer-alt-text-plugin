import { framer, CanvasNode, ImageAsset } from "framer-plugin"
import { useState, useEffect } from "react"
import "./App.css"


framer.showUI({
    position: "top right",
    width: 300,
    height: 400,
})


function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

export function App() {
    const selection = useSelection()
    const layer = selection.length === 1 ? "layer" : "layers"
    const [images, setImages] = useState<ImageAsset[]>([])
    const [isLoading, setIsLoading] = useState(false)


    useEffect(() => {
        async function fetchImages() {
            setIsLoading(true)
            try {
                const imageNodes = await framer.getNodesWithAttributeSet("backgroundImage")
                const imageAssets: ImageAsset[] = imageNodes
                    .filter(node => node.backgroundImage) // ensure backgroundImage exists
                    .map(node => node.backgroundImage!)
                setImages(imageAssets)
            } catch (error) {
                console.error("Error fetching images:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchImages()
    }, [])

    return (
        <main style={{ padding: "16px", fontFamily: "Arial" }}>
            <p>
                Welcome! Check out the{" "}
                <a href="https://framer.com/developers/plugins/introduction" target="_blank">
                    Docs
                </a>{" "}
                to start. You have {selection.length} {layer} selected.
            </p>
            <h3>Images on Canvas</h3>
            {isLoading ? (
                <p>Loading images...</p>
            ) : images.length === 0 ? (
                <p>No images found on the canvas.</p>
            ) : (
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "8px",
                                border: "1px solid #ddd",
                                padding: "8px",
                            }}
                        >
                            <img
                                src={image.url}
                                alt={image.altText || "Image thumbnail"}
                                style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "8px" }}
                            />
                            <input
                                type="text"
                                defaultValue={image.altText || ""}
                                placeholder="Alt text"
                                style={{ width: "100%" }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}