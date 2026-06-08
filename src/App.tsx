import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Droplet,
  Sun,
  Wind,
  Thermometer,
  AlertTriangle,
  Scissors,
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  X,
  RefreshCw,
  Sprout,
  ChevronRight,
  BookOpen,
  Eye,
  Info
} from "lucide-react";
import { SAMPLE_PLANTS } from "./data/samplePlants";
import MetricMeter from "./components/MetricMeter";
import { PlantDetails, ChatMessage } from "./types";

export default function App() {
  const [selectedPlant, setSelectedPlant] = useState<PlantDetails>(SAMPLE_PLANTS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! I'm Flora, your personal botanical coach. 🌿 Ask me anything about care schedules, leaf troubleshooting, or repotting!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // active tab inside plant specifications
  const [activeTab, setActiveTab] = useState<"care" | "issues" | "propagation">("care");

  // Reference for file input and chat box scroll
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert File to Base64
  const processImageFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAnalysisError("Only image files (JPEG, PNG, WEBP) are supported for plant identification.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Strip the headers from Base64
        const strippedBase64 = base64String.split(",")[1];

        // Request identification to server API
        const response = await fetch("/api/identify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: strippedBase64,
            mimeType: file.type,
          }),
        });

        if (!response.ok) {
          throw new Error("Botanical Server refused analysis. Check your Gemini API key or image size.");
        }

        const data = await response.json();

        if (data.isPlant === false) {
          setAnalysisError("I didn't recognize any plant in that image. Please snap a clear, close-up photo of foliage, stems, or flowers!");
          setIsAnalyzing(false);
          return;
        }

        // Successfully parsed plant data
        const detectedPlant: PlantDetails = data;
        setSelectedPlant(detectedPlant);

        // Add a greeting chat message customized with the plant name
        const greetingText = `I've successfully identified your **${detectedPlant.name}** (${detectedPlant.scientificName})! It’s classified under standard care as **${detectedPlant.difficulty}** difficulty. How can I help you support its growth today?`;
        setChatMessages((prev) => [
          ...prev,
          {
            id: `id-noti-${Date.now()}`,
            sender: "bot",
            text: greetingText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsAnalyzing(false);
      };
    } catch (error: any) {
      console.error(error);
      setAnalysisError(error?.message || "Greenhouse network timeout error. Please retry.");
      setIsAnalyzing(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Handle file select click
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  // Set up camera fallback trigger
  const handleCameraTrigger = () => {
    fileInputRef.current?.click();
  };

  // Send message to Flora care coach
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      // Build history context (last 5 messages to avoid API limit)
      const formattedHistory = chatMessages.slice(-5).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: formattedHistory,
          currentPlantContext: selectedPlant,
        }),
      });

      if (!response.ok) {
        throw new Error("Flora had a brief server timeout. Let's water her and try again.");
      }

      const responseData = await response.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: responseData.text || "I apologize, my botanical notes got mixed up. Could you restate that?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: `⚠️ Offline Alert: I had trouble connecting: ${err?.message || "Please recheck your server setup."} Check your internet or custom secrets.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Choose color accents based on botanical difficulty state
  const getDifficultyBadge = (lvl: string) => {
    switch (lvl) {
      case "Easy":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Easy Care</span>;
      case "Moderate":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><HelpCircle className="w-3.5 h-3.5" /> Moderate Care</span>;
      case "Expert":
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200"><AlertTriangle className="w-3.5 h-3.5" /> Expert Gardener Required</span>;
      default:
        return null;
    }
  };

  return (
    <div id="greenhouse-root" className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Visual background leaf decorations (pure elegant layout CSS, matching UI guides) */}
      <div id="ambient-leaf-overlay-top" className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div id="ambient-leaf-overlay-bottom" className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Elegant Header */}
      <header id="greenhouse-header" className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-zinc-200/60 shadow-sm py-4 px-6">
        <div id="header-container" className="max-w-7xl mx-auto flex items-center justify-between">
          <div id="logo-block" className="flex items-center gap-2.5">
            <div id="logo-badge" className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/15 flex items-center justify-center">
              <Sprout id="sprout-logo" className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 id="app-title-core" className="text-xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                Gardening Assistant
              </h1>
              <p id="app-subtitle" className="text-xs font-medium text-zinc-400">
                Botanical Vision AI & Specialized Care Companion
              </p>
            </div>
          </div>
          
          <div id="badge-api-status" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-semibold font-mono border border-zinc-200">
            <span id="pulsing-green-dot" className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Flora Coach Online
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="greenhouse-content-area" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Visual Snap Tool, Matching catalog list, coach flora chat (4 grid slots) */}
        <section id="greenhouse-workspace-left" className="lg:col-span-5 space-y-6">
          
          {/* Snap & Identify Plant Card */}
          <div id="vision-analyzer-container" className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div id="vision-badge-bubble" className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 rounded-full flex items-end justify-start p-6 -z-10" />
            
            <div id="vision-header" className="flex items-start justify-between mb-4">
              <div>
                <h3 id="vision-title" className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" /> Plant Identifier AI
                </h3>
                <p id="vision-subtitle" className="text-xs text-zinc-500 mt-1">
                  Snap foliage to immediately build a customized watering, soil, & safety profile.
                </p>
              </div>
            </div>

            {/* Drag & Drop Window Area */}
            <div
              id="upload-drag-or-click-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleCameraTrigger}
              className={`relative cursor-pointer transition-all duration-300 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center outline-none ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-zinc-200 hover:border-emerald-400 bg-zinc-50 hover:bg-zinc-100/50"
              }`}
            >
              <input
                id="botanical-file-uploader"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {isAnalyzing ? (
                <div id="analyzer-loader-anim" className="flex flex-col items-center py-6">
                  <div id="spinning-loader" className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin mb-4" />
                  <p id="loader-headline" className="text-sm font-bold text-zinc-800 animate-pulse">Analyzing Botanical Anatomy...</p>
                  <p id="loader-subtext" className="text-xs text-zinc-400 mt-1">Sieving through taxonomic species libraries...</p>
                </div>
              ) : (
                <div id="upload-idle-state" className="flex flex-col items-center py-4">
                  <div id="file-uploader-circle" className="w-14 h-14 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200/50 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p id="uploader-headline" className="text-sm font-bold text-zinc-800">
                    Drag plant photo here or <span className="text-emerald-600 underline">browse</span>
                  </p>
                  <p id="uploader-formats" className="text-[11px] text-zinc-400 mt-1.5">
                    Supports high-resolution JPG, PNG, or mobile camera snapshots
                  </p>
                </div>
              )}
            </div>

            {/* Error Message Panel */}
            {analysisError && (
              <div id="vision-feedback-error" className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p id="error-title" className="text-xs font-bold text-rose-800">Taxonomic Check Problem</p>
                  <p id="error-description" className="text-[11px] text-rose-700 mt-0.5 leading-relaxed font-sans">{analysisError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Select Preset Library */}
          <div id="library-plants-card" className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm">
            <h4 id="library-headline" className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 font-sans">
              <BookOpen className="w-4 h-4 text-zinc-400" /> Instant Demonstration Library
            </h4>
            <div id="library-plants-grid" className="space-y-2.5">
              {SAMPLE_PLANTS.map((plant) => {
                const isSelected = selectedPlant.name === plant.name;
                return (
                  <button
                    id={`preset-button-${plant.name.replace(/\s+/g, '-').toLowerCase()}`}
                    key={plant.name}
                    onClick={() => {
                      setSelectedPlant(plant);
                      setAnalysisError(null);
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-emerald-50/80 border-emerald-200 shadow-sm"
                        : "border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200"
                    }`}
                  >
                    <div id={`preset-info-${plant.name.replace(/\s+/g, '-').toLowerCase()}`} className="flex items-center gap-3">
                      <div id={`preset-leaf-avatar-${plant.name.replace(/\s+/g, '-').toLowerCase()}`} className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800"
                      }`}>
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <p id={`preset-common-${plant.name.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm font-bold text-zinc-900 leading-tight">{plant.name}</p>
                        <p id={`preset-scient-${plant.name.replace(/\s+/g, '-').toLowerCase()}`} className="text-[10px] italic text-zinc-500 font-sans mt-0.5">{plant.scientificName}</p>
                      </div>
                    </div>
                    <div id={`preset-caret-${plant.name.replace(/\s+/g, '-').toLowerCase()}`} className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans ${
                        plant.difficulty === "Easy" ? "bg-emerald-100/75 text-emerald-800" :
                        plant.difficulty === "Moderate" ? "bg-amber-100/75 text-amber-800" :
                        "bg-rose-100/75 text-rose-800"
                      }`}>
                        {plant.difficulty}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Chat with Flora care coach */}
          <div id="flora-coach-chatbox" className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px]">
            {/* Header Coach info */}
            <div id="chat-header-bar" className="bg-emerald-950 text-white py-3.5 px-5 flex items-center justify-between">
              <div id="chat-header-user-badge" className="flex items-center gap-3">
                <div id="flora-avatar-container" className="w-8 h-8 bg-emerald-600 border-2 border-emerald-400 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/20">
                  🌺
                </div>
                <div>
                  <h4 id="flora-name-title" className="text-sm font-bold tracking-wide">Flora Care Coach</h4>
                  <p id="flora-typing-presence" className="text-[10px] text-emerald-300 font-medium font-sans">
                    {isChatTyping ? "Writing advice..." : "Ready to consult"}
                  </p>
                </div>
              </div>
              <span id="chat-context-tag" className="text-[10px] bg-emerald-800/80 px-2 py-1 rounded-md text-emerald-200 border border-emerald-700 font-medium">
                Focus: {selectedPlant.name}
              </span>
            </div>

            {/* Message Area */}
            <div id="chat-messages-container" className="flex-1 p-4 overflow-y-auto space-y-3 bg-zinc-50/50">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    id={`chat-msg-row-${msg.id}`}
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      id={`chat-msg-payload-${msg.id}`}
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white text-zinc-800 rounded-bl-none border border-zinc-100"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        id={`chat-msg-timestamp-${msg.id}`}
                        className={`block text-[8px] text-right mt-1.5 font-mono ${
                          isUser ? "text-emerald-100" : "text-zinc-400"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isChatTyping && (
                <div id="typing-indicator" className="flex justify-start">
                  <div id="indicator-badge" className="bg-white border border-zinc-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div id="scroll-target" ref={chatEndRef} />
            </div>

            {/* Chat inputs */}
            <form id="chat-form-element" onSubmit={handleSendMessage} className="p-3 bg-white border-t border-zinc-200/80 flex gap-2">
              <input
                id="chat-input-textbox"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask Flora about ${selectedPlant.name}...`}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-800 placeholder-zinc-400"
              />
              <button
                id="chat-send-btn"
                type="submit"
                className="w-9 h-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md active:scale-95 transition-all hover:bg-emerald-700 flex disabled:opacity-50"
                disabled={!chatInput.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </section>

        {/* RIGHT COLUMN: Highly detailed active Care Profile Dashboard (7 grid slots) */}
        <section id="greenhouse-workspace-right" className="lg:col-span-7 space-y-6">

          {/* Plant Bio overview banner */}
          <div id="plant-identity-banner" className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            {/* Soft decorative visual node element */}
            <div id="banner-accent-blobs" className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

            <div id="banner-media-container" className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex flex-col items-center justify-center relative shadow-lg shadow-emerald-700/10 border border-emerald-500/20">
              <Sprout id="banner-plant-outline-icon" className="w-10 h-10 animate-wiggle opacity-90" />
              <span id="banner-plant-difficulty-ribbon" className="absolute bottom-2 text-[10px] bg-emerald-950/40 text-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Level Lvl
              </span>
            </div>

            <div id="banner-words-container" className="flex-1 space-y-2">
              <div id="banner-header-badging" className="flex flex-wrap items-center gap-3">
                <h2 id="banner-plant-common" className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                  {selectedPlant.name}
                </h2>
                {getDifficultyBadge(selectedPlant.difficulty)}
              </div>

              <p id="banner-plant-scientific" className="text-sm italic font-medium text-emerald-700 font-serif leading-none mt-1">
                {selectedPlant.scientificName}
              </p>

              <p id="banner-plant-bio" className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed pt-2 border-t border-zinc-100 mt-2">
                {selectedPlant.description}
              </p>
            </div>
          </div>

          {/* Bento-grid of diagnostic care numbers */}
          <div id="care-diagnostics-indicators-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricMeter
              type="sunlight"
              value={selectedPlant.careStats.sunlightLevel}
              label={selectedPlant.careStats.sunlight}
            />
            <MetricMeter
              type="watering"
              value={selectedPlant.careStats.wateringLevel}
              label={selectedPlant.careStats.watering}
            />
            <MetricMeter
              type="humidity"
              value={selectedPlant.careStats.humidityLevel}
              label={selectedPlant.careStats.humidity}
            />
          </div>

          {/* Soil & Temperature Support metrics banner */}
          <div id="micro-conditions-pouch" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="soil-type-card" className="bg-white border border-zinc-200 rounded-2xl p-4 flex gap-3.5 items-start">
              <div id="soil-icon-basket" className="p-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-100/50">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <h4 id="soil-tag" className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Potting Medium</h4>
                <p id="soil-caption" className="text-xs text-zinc-800 font-semibold mt-1 leading-snug">{selectedPlant.careStats.soilType}</p>
              </div>
            </div>

            <div id="temp-comfort-card" className="bg-white border border-zinc-200 rounded-2xl p-4 flex gap-3.5 items-start">
              <div id="temp-icon-basket" className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h4 id="temp-tag" className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none">Comfort Zone</h4>
                <p id="temp-caption" className="text-xs text-zinc-800 font-semibold mt-1 leading-snug">{selectedPlant.careStats.temperature}</p>
              </div>
            </div>
          </div>

          {/* Tabbed Interactive guide selector */}
          <div id="tabbed-instructions-desk" className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
            
            {/* Header tab buttons */}
            <div id="tab-nav-panel" className="bg-zinc-50 border-b border-zinc-200/80 p-2 flex gap-1 sm:gap-2">
              <button
                id="tab-btn-care"
                onClick={() => setActiveTab("care")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "care"
                    ? "bg-white text-emerald-800 shadow-sm border border-zinc-200/50"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Guidelines
              </button>
              
              <button
                id="tab-btn-issues"
                onClick={() => setActiveTab("issues")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "issues"
                    ? "bg-white text-emerald-800 shadow-sm border border-zinc-200/50"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Doctor Diagnosis
              </button>
              
              <button
                id="tab-btn-propagation"
                onClick={() => setActiveTab("propagation")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === "propagation"
                    ? "bg-white text-emerald-800 shadow-sm border border-zinc-200/50"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Scissors className="w-4 h-4 text-sky-500" />
                Propagation Class
              </button>
            </div>

            {/* Content pane depending on selected active state */}
            <div id="tab-content-wrapper" className="p-6 md:p-8">
              
              {/* CARE INSTRUCTIONS TAB */}
              {activeTab === "care" && (
                <div id="care-instructions-layout" className="space-y-6">
                  <div id="care-grid-display" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="care-block-watering" className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-2">
                      <h5 id="care-watering-title" className="text-xs font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                        <Droplet className="w-4 h-4 text-emerald-600" /> Watering Masterclass
                      </h5>
                      <p id="care-watering-body" className="text-xs text-zinc-600 leading-relaxed font-sans">{selectedPlant.careInstructions.wateringTips}</p>
                    </div>

                    <div id="care-block-sun" className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-2">
                      <h5 id="care-sun-title" className="text-xs font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                        <Sun className="w-4 h-4 text-amber-500" /> Sourcing Sunlight
                      </h5>
                      <p id="care-sun-body" className="text-xs text-zinc-600 leading-relaxed font-sans">{selectedPlant.careInstructions.sunlightTips}</p>
                    </div>

                    <div id="care-block-feeding" className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-2">
                      <h5 id="care-feeding-title" className="text-xs font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-purple-500" /> Nutrient Feeding
                      </h5>
                      <p id="care-feeding-body" className="text-xs text-zinc-600 leading-relaxed font-sans">{selectedPlant.careInstructions.feedingTips}</p>
                    </div>

                    <div id="care-block-pruning" className="p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50 space-y-2">
                      <h5 id="care-pruning-title" className="text-xs font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wider">
                        <Scissors className="w-4 h-4 text-zinc-600" /> Grooming & Pruning
                      </h5>
                      <p id="care-pruning-body" className="text-xs text-zinc-600 leading-relaxed font-sans">{selectedPlant.careInstructions.pruningTips}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* COMMON ISSUES / DOCTOR Diagnosis */}
              {activeTab === "issues" && (
                <div id="issues-tab-layout" className="space-y-4">
                  <div id="diagnostic-header-callout" className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl flex items-start gap-3.5 mb-6">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 id="diagnostic-header-title" className="text-xs font-bold text-amber-900">Diagnosis Checklist</h5>
                      <p id="diagnostic-header-text" className="text-xs text-amber-800 leading-relaxed font-sans">
                        Foliar colors and turgor pressure communicate vital signs. Use these diagnostic benchmarks if your plant displays issues.
                      </p>
                    </div>
                  </div>

                  <div id="issues-list-wrapper" className="space-y-4">
                    {selectedPlant.commonIssues.map((issueItem, idx) => (
                      <div id={`issue-card-${idx}`} key={idx} className="p-5 border border-zinc-100 rounded-2xl hover:border-zinc-200 hover:shadow-sm transition-all bg-white relative">
                        <div id={`issue-card-inner-${idx}`} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div id={`issue-card-text-${idx}`} className="space-y-1">
                            <span id={`issue-badge-label-${idx}`} className="inline-block text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold tracking-wider uppercase mb-1">
                              Threat {idx + 1}
                            </span>
                            <h5 id={`issue-title-${idx}`} className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">{issueItem.issue}</h5>
                            <p id={`issue-symptom-${idx}`} className="text-xs text-zinc-500 font-sans">
                              <span className="font-bold text-zinc-600">Visual symptoms:</span> {issueItem.symptom}
                            </p>
                          </div>
                        </div>

                        <div id={`issue-solution-pouch-${idx}`} className="mt-4 pt-3.5 border-t border-zinc-50 bg-emerald-50/30 -mx-5 -mb-5 p-5 rounded-b-2xl">
                          <p id={`issue-solution-headline-${idx}`} className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Flora's Cure Recipe</p>
                          <p id={`issue-solution-body-${idx}`} className="text-xs text-emerald-950/80 leading-relaxed mt-1 font-sans font-medium">{issueItem.solution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROPAGATION CLASS */}
              {activeTab === "propagation" && (
                <div id="propagation-tab-layout" className="space-y-6">
                  <div id="propagation-class-banner" className="bg-sky-50/80 border border-sky-100 rounded-2xl p-4 flex gap-3.5">
                    <div id="propagation-icon-circle" className="bg-sky-100 text-sky-800 p-2 rounded-xl h-10 w-10 flex items-center justify-center">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 id="propagation-class-heading" className="text-xs font-bold text-sky-900 uppercase tracking-wider">Propagator's Blueprint</h5>
                      <p id="propagation-class-desc" className="text-xs text-sky-800 leading-relaxed font-sans">
                        Multiplying foliage creates unlimited clones with zero extra cost. Best method for this species: <strong className="font-bold">{selectedPlant.propagation.method}</strong>.
                      </p>
                    </div>
                  </div>

                  <div id="propagation-steps-timeline" className="relative pl-6 space-y-6 border-l-2 border-dashed border-sky-100">
                    {selectedPlant.propagation.steps.map((stepText, idx) => (
                      <div id={`propagation-step-${idx}`} key={idx} className="relative">
                        {/* Bullet count icon */}
                        <div id={`propagation-step-bullet-${idx}`} className="absolute -left-[35px] top-0.5 bg-sky-600 text-white font-bold font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p id={`propagation-step-text-${idx}`} className="text-xs text-zinc-700 leading-relaxed font-sans font-normal">{stepText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Plant health/fertilizer calculator micro-widget */}
          <div id="plant-pot-calculator" className="bg-emerald-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div id="calculator-aesthetic-leaves" className="absolute -left-6 -bottom-6 w-32 h-32 bg-emerald-900 rounded-full flex items-end justify-start p-6 -z-10 opacity-40 mt-6" />
            <div id="calculator-aesthetic-leaves-right" className="absolute -right-6 -top-6 w-38 h-38 bg-emerald-900 rounded-full flex items-end justify-start p-6 -z-10 opacity-30 mt-6" />
            
            <div id="calculator-header" className="space-y-1 relative">
              <h4 id="calc-headline" className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Micro-Tools</h4>
              <h2 id="calc-title" className="text-lg font-black tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Interactive Watering Reminder
              </h2>
              <p id="calc-subtitle" className="text-xs text-emerald-100/70 font-sans">
                Enter your last irrigation timestamp to discover if the root system requires fluids.
              </p>
            </div>

            <div id="calc-controls" className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 relative">
              <div id="calc-input-group" className="flex flex-col gap-1">
                <label id="calc-label-last-watered" className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Days Since Last Watered</label>
                <div id="calc-row-controls" className="flex gap-2 items-center">
                  <input
                    id="calc-days-input"
                    type="range"
                    min="0"
                    max="30"
                    defaultValue="4"
                    onChange={(e) => {
                      const days = parseInt(e.target.value);
                      const resultText = document.getElementById("water-calc-status-text");
                      const barColor = document.getElementById("water-calc-status-bar");
                      const maxWaterInterval = selectedPlant.careStats.wateringLevel === 1 ? 25 : selectedPlant.careStats.wateringLevel === 2 ? 14 : selectedPlant.careStats.wateringLevel === 3 ? 9 : selectedPlant.careStats.wateringLevel === 4 ? 6 : 3;
                      
                      if (resultText && barColor) {
                        if (days >= maxWaterInterval) {
                          resultText.innerText = `Thirsty! Overdue for water since ${days - maxWaterInterval} day(s) ago for a standard watering interval of ${maxWaterInterval} days.`;
                          barColor.className = "p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-red-200 text-xs font-medium";
                        } else if (days >= maxWaterInterval - 2) {
                          resultText.innerText = `Approaching Dryness. Monitor soil carefully. Suggested watering in ${maxWaterInterval - days} day(s).`;
                          barColor.className = "p-3 bg-amber-950/60 border border-amber-700/50 rounded-xl text-amber-200 text-xs font-medium";
                        } else {
                          resultText.innerText = `Sufficiently Moist. Roots are comfortable. Standard intervals recommend checking again in ${maxWaterInterval - days} days.`;
                          barColor.className = "p-3 bg-emerald-900/60 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs font-medium";
                        }
                      }
                    }}
                    className="w-full h-1.5 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>
              <div id="water-calc-status-bar" className="p-3 bg-emerald-900/60 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs font-medium">
                <p id="water-calc-status-text" className="font-sans leading-relaxed text-[11px]">
                  Sufficiently Moist. Roots are comfortable. Standard intervals recommend checking again in 5 days.
                </p>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* Persistent Bottom visual footer */}
      <footer id="greenhouse-footer" className="bg-white border-t border-zinc-200 py-6 px-4 text-center mt-12">
        <div id="footer-container" className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-sans gap-3">
          <p id="footer-copyright">⚡ Powered by Gemini LLM Client-Side Integration</p>
          <p id="footer-branding-label">Designed with rigorous botanical precision</p>
        </div>
      </footer>

    </div>
  );
}
