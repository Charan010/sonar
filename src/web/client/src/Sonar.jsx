import React, { useState, useRef, useEffect } from "react";

import {
  Upload, Home, Clock, LogOut, Loader2, X,
  BookOpen, Satellite, Search
} from "lucide-react";

import Results from "./Results";
import "./SonarDashboard.css";

import {
  uploadImage,
  getHistory,
  deleteImage,
} from "./services/api.service";

import { mapPredictionToResult } from "./utils/mapper";

const formatDate = (d = new Date()) => new Date(d).toLocaleString();

export default function Sonar() {
  const [username, setUsername] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem("jwt");

  const isUserReady = username !== null;

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, []);


  const fetchHistory = async () => {
    const token = getToken();
    if (!token) return;

    try {

      const data = await getHistory(token);
      setHistory(data.images || []);

    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (isUserReady) fetchHistory();
  }, [isUserReady]);

  useEffect(() => {
    if (!isUserReady)
        return;
    const saved = localStorage.getItem(`sonar_bookmarks_${username}`);
    setBookmarks(saved ? JSON.parse(saved) : []);

  }, [username, isUserReady]);

  useEffect(() => {
    if (!isUserReady) return;
    localStorage.setItem(
      `sonar_bookmarks_${username}`,
      JSON.stringify(bookmarks)
    );
  }, [bookmarks, username, isUserReady]);

  const processImage = async (file, imgDataUrl) => {
    setIsProcessing(true);
    setUploadError("");
    setShowResults(false);

    try {
      const token = getToken();
      if (!token) throw new Error("No auth token");

      const raw = await uploadImage(file, token);

      const result = mapPredictionToResult(
        raw.model_prediction,
        file,
        imgDataUrl,
        username

      );

      setClassificationResult(result);
      setShowResults(true);

      await fetchHistory();
    } catch (err) {
      console.error(err);
      setUploadError("Prediction failed — check backend.");
    }

    setIsProcessing(false);
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return;

      const imgDataUrl = e.target.result;
      setUploadedImage(imgDataUrl);
      processImage(file, imgDataUrl);
    };

    reader.readAsDataURL(file);
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setShowResults(false);
    setClassificationResult(null);
    setUploadError("");
  };

  // 🗑 Delete
  const deleteHistoryImage = async (name) => {
    const token = getToken();
    if (!token) return;

    await deleteImage(name, token);
    await fetchHistory();
  };

  const toggleBookmark = () => {
  if (!classificationResult) return;

    setBookmarks(prev =>
      prev.some(b => b.filename === classificationResult.filename)
        ? prev.filter(b => b.filename !== classificationResult.filename)
        : [{ ...classificationResult, bookmarkedAt: new Date().toISOString() }, ...prev]
      );
  };

  const isCurrentBookmarked = () =>
    bookmarks.some(
      (b) => b.filename === classificationResult?.filename
    );


  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("username");
    window.location.reload();
  };

  if (!isUserReady)
  return <div className="empty">Loading...</div>;

  return (
    <div className="sonar-dashboard">

      <nav className="navbar">
        <div className="nav-container">

          <div className="nav-left">
            <div className="logo-wrapper">
              <div className="logo-glow" />
              <div className="logo-box">
                <Satellite size={20} />
              </div>
            </div>

            <div className="logo-text">
              <div className="brand">SONAR AI</div>
              <div className="brand-sub">{username}</div>
            </div>
          </div>

          <div className="nav-right">
            <button
              className={`nav-button ${currentPage === "home" ? "active" : ""}`}
              onClick={() => setCurrentPage("home")}
            >
              <Home size={14} />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-button ${currentPage === "history" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("history");
                fetchHistory();
              }}
            >
              <Clock size={14} />
              <span>History</span>
            </button>

            <button
              className={`nav-button ${currentPage === "bookmarks" ? "active" : ""}`}
              onClick={() => setCurrentPage("bookmarks")}
            >
              <BookOpen size={14} />
              <span>Bookmarks</span>
            </button>

            <button className="nav-button logout" onClick={handleLogout}>
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="main-content">

        {showResults && classificationResult ? (
          <Results
            classificationResult={classificationResult}
            onReset={clearUpload}
            onBack={() => setCurrentPage("home")}
            onToggleBookmark={toggleBookmark}
            isBookmarked={isCurrentBookmarked()}
          />
        ) : currentPage === "home" ? (

          <div className="home-page">

            <header className="page-header">
              <div className="header-left">
                <Search size={20} />
                <div>
                  <h2>SONAR IMAGE CLASSIFICATION</h2>
                  <p className="subtitle">
                    Hello, {username}. Upload SONAR images for AI analysis.
                  </p>
                </div>
              </div>
            </header>

            <section
              className={`upload-zone ${uploadedImage ? "has-image" : ""} ${isDragging ? "is-dragging" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files[0]);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="file-input"
              />

              {!uploadedImage ? (
                <div className="upload-prompt">
                  <Upload size={64} />
                  <h3>Upload SONAR Image</h3>
                  <p>Click or drag & drop</p>

                  {uploadError && (
                    <p className="text--error">{uploadError}</p>
                  )}
                </div>
              ) : (
                <div className="preview-area">
                  <div className="preview-image-wrap">

                    <img
                      className="preview-image"
                      src={uploadedImage}
                      alt="preview"
                    />

                    <button
                      className="clear-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearUpload();
                      }}
                    >
                      <X size={16} />
                    </button>

                    {isProcessing && (
                      <div className="processing-overlay">
                        <Loader2 />
                        <span>Analyzing...</span>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </section>
          </div>

        ) : currentPage === "history" ? (

          <div className="history-page">
            <div className="history-header">
              <h3>Classification History</h3>
            </div>

            {!history.length ? (
              <div className="empty">No history yet</div>
            ) : (
              <div className="history-list">
                {history.map((h, i) => (
                  <div key={i} className="history-item">

                    <div className="history-main">
                      <div className="history-filename">{h.name}</div>
                      <div className="history-time">
                        {formatDate(h.uploadedAt)}
                      </div>
                    </div>

                    <div className="history-ops">
                      <button
                        className="btn muted"
                        onClick={() => deleteHistoryImage(h.name)}
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (

          <div className="bookmarks-page">
            <div className="bookmarks-header">
              <h3>Bookmarks</h3>
            </div>

            {!bookmarks.length ? (
              <div className="empty">No bookmarks yet</div>
            ) : (
              <div className="bookmarks-list">
                {bookmarks.map((b, i) => (
                  <div key={i} className="bookmark-item">

                    <div className="bookmark-main">
                      <div className="bookmark-filename">{b.filename}</div>
                    </div>

                    <div className="bookmark-ops">
                      <button
                        className="btn cyan"
                        onClick={() => {
                          setClassificationResult(b);
                          setShowResults(true);
                          setCurrentPage("home");
                        }}
                      >
                        Open
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        )}

      </main>
    </div>
  );
}