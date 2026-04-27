import React from "react";
import { Download, X, Waves } from "lucide-react";
import "./SonarDashboard.css";

const Results = ({
  classificationResult,
  onReset,
  onBack,
  onToggleBookmark,
  isBookmarked,
}) => {

  const primary = classificationResult?.classifications?.[0];

  const triggerDownload = (href, name) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadResults = () => {
    const blob = new Blob(
      [JSON.stringify(classificationResult, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    triggerDownload(
      url,
      `${classificationResult.filename.replace(/\.[^/.]+$/, "")}_report.json`
    );

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadProcessed = () => {
    triggerDownload(
      classificationResult.processed || classificationResult.original,
      `classified_${classificationResult.filename}`
    );
  };

  if (!classificationResult) {
    return (
      <div className="results-container results--empty">
        <div className="empty">
          <Waves size={64} color="#64748b" />
          <h2>No Analysis Results</h2>
          <p>Please upload and analyze a SONAR image first</p>

          <button onClick={onBack} className="back-button btn muted">
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const ImageCard = ({ title, src, children }) => (
    <div className="image-card">
      <h4>{title}</h4>
      <div className="image-container">
        <img src={src} alt={title} loading="lazy" />
      </div>
      {children}
    </div>
  );

  return (
    <div className="results-container">

      {/* HEADER */}
      <div className="results-header">
        <div className="header-content">
          <div className="header-title">
            <Waves size={32} color="#60a5fa" />
            <h1>SONAR AI Analysis Results</h1>
          </div>

          <div className="header-actions">
            <button
              onClick={downloadResults}
              className="download-button cyan btn"
            >
              <Download size={16} /> Download JSON
            </button>

            <button
              onClick={downloadProcessed}
              className="download-button green btn"
            >
              <Download size={16} /> Download Image
            </button>

            <button
              onClick={onToggleBookmark}
              className={`bookmark-button ${
                isBookmarked ? "amber" : "purple"
              } btn`}
            >
              {isBookmarked ? "Remove Bookmark" : "Bookmark"}
            </button>

            <button onClick={onReset} className="reset-button muted btn">
              <X size={16} /> New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="results-content">
        <div className="results-grid">

          {/* LEFT */}
          <div className="main-column">

            {/* Description */}
            <div className="analysis-card">
              <h3>AI Analysis Description</h3>
              <div className="description-box">
                <p>{classificationResult.aiDescription}</p>
              </div>
              <p className="description-note">
                Automatically generated description based on AI analysis
              </p>
            </div>

            {/* Images */}
            <div className="images-grid">

              <ImageCard
                title="Original SONAR Image"
                src={classificationResult.original}
              >
                <div className="image-meta">
                  <span>{classificationResult.filename}</span>
                </div>
              </ImageCard>

              {classificationResult.gradcamHeatmap && (
                <ImageCard
                  title="Grad-CAM Heatmap"
                  src={classificationResult.gradcamHeatmap}
                >
                  <div className="heatmap-legend">
                    <span>Low</span>
                    <div className="legend-colors">
                      <div className="color-blue"></div>
                      <div className="color-green"></div>
                      <div className="color-yellow"></div>
                      <div className="color-red"></div>
                    </div>
                    <span>High</span>
                  </div>
                </ImageCard>
              )}

              {classificationResult.limeHeatmap && (
                <ImageCard
                  title="LIME Explanation"
                  src={classificationResult.limeHeatmap}
                />
              )}

            </div>

            {/* Metadata */}
            <div className="metadata-card">
              <h4>SONAR Parameters</h4>

              <div className="metadata-item">
                <span className="metadata-label">Processed:</span>
                <span className="metadata-value">
                  {classificationResult.metadata?.timestamp || "-"}
                </span>
              </div>

              <div className="metadata-item">
                <span className="metadata-label">Uploaded By:</span>
                <span className="metadata-value">
                  {classificationResult.metadata?.uploadedBy || "-"}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="sidebar-column">

            {/* Classifications */}
            <div className="classifications-card">
              <h4>AI Classifications</h4>

              <div className="classifications-list">
                {classificationResult.classifications.map((c, i) => (
                  <div className="classification-item" key={i}>

                    <div className="classification-header">
                      <div className="classification-info">
                        <div className="classification-icon">{c.icon}</div>
                        <span className="classification-name">{c.category}</span>
                      </div>

                      <span className="classification-confidence">
                        {Number(c.confidence || 0).toFixed(1)}%
                      </span>
                    </div>

                    <div className="confidence-bar-bg">
                      <div
                        className="confidence-bar"
                        style={{
                          width: `${c.confidence}%`,
                          "--target-width": `${c.confidence}%`,
                        }}
                      />
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="summary-card">
              <h4>Analysis Summary</h4>

              <div className="summary-list">
                <div className="summary-item">
                  <span className="summary-label">Primary Detection:</span>
                  <span className="summary-value">
                    {primary?.category || "—"}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Confidence:</span>
                  <span className="summary-value high-confidence">
                    {Number(primary?.confidence || 0).toFixed(1)}%
                  </span>
                </div>

                <div className="summary-item">
                  <span className="summary-label">Model Version:</span>
                  <span className="summary-value">v2.1.4</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;