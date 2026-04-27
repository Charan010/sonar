export function mapPredictionToResult(data, file, imgDataUrl, username) {
  return {
    original: imgDataUrl,
    processed: imgDataUrl,
    gradcamHeatmap: `data:image/png;base64,${data.gradcam_image_base64}`,
    limeHeatmap: `data:image/png;base64,${data.lime_image_base64}`,
    filename: file.name,
    aiDescription: `${data.label.toUpperCase()} detected with ${(data.probability * 100).toFixed(1)}% confidence`,
    classifications: [
      {
        category: data.label,
        confidence: data.probability * 100,
      },
    ],
    metadata: { timestamp: new Date().toISOString(), uploadedBy: username },
  };
}