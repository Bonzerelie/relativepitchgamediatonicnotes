/* =========================
   /script.js
   Identifying Diatonic Notes in Major Scales
   ========================= */
   (() => {
    "use strict";
  
    const AUDIO_DIR = "audio";
    const LS_KEY = "et_diatonic_major_scale";
    const LS_KEY_RANGE = "et_diatonic_major_range";
    const LS_KEY_NOTES = "et_diatonic_major_notes";
    const LS_KEY_NAME = "et_diatonic_major_player_name";
  
    const UI_SND_SELECT = "select1.mp3";
    const UI_SND_BACK = "back1.mp3";
  
    const UI_SND_CORRECT = "correct1.mp3";
    const UI_SND_INCORRECT = "incorrect1.mp3";
  
    // We explicitly map out all 8 degrees of the scale (1st to 8ve)
    const MAJOR_SCALE_STEPS = [0, 2, 4, 5, 7, 9, 11, 12]; 
    const DEGREE_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  
    // Mini keyboard: always show C3 to C5 (2 octaves).
    const DISPLAY_LO_PITCH = (3 * 12) + 0; // C3
    const DISPLAY_HI_PITCH = (5 * 12) + 0; // C5
  
    // Note stems (audio uses sharps)
    const PC_TO_STEM = {
      0: "c", 1: "csharp", 2: "d", 3: "dsharp", 4: "e", 5: "f",
      6: "fsharp", 7: "g", 8: "gsharp", 9: "a", 10: "asharp", 11: "b",
    };
  
    // For letter math / spelling
    const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
    const LETTER_TO_NAT_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  
    const KEY_OPTIONS = [
      { key: "C",  label: "Scale: C Major" },
      { key: "Db", label: "Scale: C#/Db Major" },
      { key: "D",  label: "Scale: D Major" },
      { key: "Eb", label: "Scale: D#/Eb Major" },
      { key: "E",  label: "Scale: E Major" },
      { key: "F",  label: "Scale: F Major" },
      { key: "Gb", label: "Scale: F#/Gb Major" },
      { key: "G",  label: "Scale: G Major" },
      { key: "Ab", label: "Scale: G#/Ab Major" },
      { key: "A",  label: "Scale: A Major" },
      { key: "Bb", label: "Scale: A#/Bb Major" },
      { key: "B",  label: "Scale: B Major" },
    ];
  
    const RANGE_OPTIONS = [
      { key: "one", label: "Range: One Octave" },
      { key: "multi", label: "Range: Multiple Octaves" },
    ];
  
    const NOTES_OPTIONS = [
      { key: "2", label: "Notes: 1-2" },
      { key: "3", label: "Notes: 1-3" },
      { key: "4", label: "Notes: 1-4" },
      { key: "5", label: "Notes: 1-5" },
      { key: "6", label: "Notes: 1-6" },
      { key: "7", label: "Notes: 1-7 (full octave)" },
    ];
  
    const $ = (id) => document.getElementById(id);
  
    const titleWrap = $("titleWrap");
    const titleImgWide = $("titleImgWide");
    const titleImgWrapped = $("titleImgWrapped");
  
    const beginBtn = $("beginBtn");
    const replayBtn = $("replayBtn");
    const nextBtn = $("nextBtn");
    const tonicBtn = $("tonicBtn");
    const refTonicBtn = $("refTonicBtn");
    const infoBtn = $("infoBtn");
  
    const phaseTitle = $("phaseTitle");
    const correctOut = $("correctOut");
    const incorrectOut = $("incorrectOut");
    const totalOut = $("totalOut");
    const accuracyOut = $("accuracyOut");
    const perNoteOut = $("perNoteOut"); 
  
    const answerButtons = $("answerButtons");
    const feedbackOut = $("feedbackOut");
    const scaleMount = $("scaleMount");
  
    const settingsBtn = $("settingsBtn");
    const settingsModal = $("settingsModal");
    const settingsScaleSelect = $("settingsScaleSelect");
    const settingsRangeSelect = $("settingsRangeSelect");
    const settingsNotesSelect = $("settingsNotesSelect");
    const settingsRestartBtn = $("settingsRestartBtn");
    const settingsCancelBtn = $("settingsCancelBtn");
  
    const introModal = $("introModal");
    const introBeginBtn = $("introBeginBtn");
    const introBeginBtnTop = $("introBeginBtnTop"); 
    const introScaleSelect = $("introScaleSelect"); 
    const introRangeSelect = $("introRangeSelect"); 
    const introNotesSelect = $("introNotesSelect"); 

    const scoreModal = $("scoreModal");
    const modalScoreMeta = $("modalScoreMeta");
    const modalPlayerNameInput = $("modalPlayerNameInput");
    const modalDownloadScorecardBtn = $("modalDownloadScorecardBtn");
    const modalCorrectOut = $("modalCorrectOut");
    const modalIncorrectOut = $("modalIncorrectOut");
    const modalTotalOut = $("modalTotalOut");
    const modalAccuracyOut = $("modalAccuracyOut");
    const modalPerNoteOut = $("modalPerNoteOut");
    const scoreModalContinueBtn = $("scoreModalContinueBtn");
  
    const infoModal = $("infoModal");
    const infoClose = $("infoClose");
  
    const scoreMeta = $("scoreMeta");
    const downloadScorecardBtn = $("downloadScorecardBtn");
    const playerNameInput = $("playerNameInput");
  
    const required = [
      beginBtn, replayBtn, nextBtn, tonicBtn, refTonicBtn, infoBtn, settingsBtn,
      introModal, introBeginBtn,
      settingsModal, settingsScaleSelect, settingsRangeSelect, settingsNotesSelect, settingsRestartBtn, settingsCancelBtn,
      phaseTitle, correctOut, incorrectOut, totalOut, accuracyOut, perNoteOut,
      answerButtons, feedbackOut, scaleMount,
      infoModal, infoClose, scoreMeta, downloadScorecardBtn,
      playerNameInput, introBeginBtnTop, introNotesSelect,
      scoreModal, modalScoreMeta, modalPlayerNameInput, modalDownloadScorecardBtn,
      modalCorrectOut, modalIncorrectOut, modalTotalOut, modalAccuracyOut,
      modalPerNoteOut, scoreModalContinueBtn
    ];
  
    if (required.some((x) => !x)) {
      alert("UI mismatch: required elements missing. Ensure index.html ids match script.js.");
      return;
    }
  
    // ---------------- title image wide/wrapped (match other games) ----------------
    function setTitleMode(mode) {
      if (!titleWrap) return;
      titleWrap.classList.toggle("titleModeWide", mode === "wide");
      titleWrap.classList.toggle("titleModeWrapped", mode === "wrapped");
    }
    function refreshTitleMode() {
      if (!titleImgWide || !titleImgWrapped) return;
      const wideOk = titleImgWide.naturalWidth > 0;
      const wrapOk = titleImgWrapped.naturalWidth > 0;
      if (!wideOk && wrapOk) setTitleMode("wrapped");
      else setTitleMode("wide");
    }
    if (titleImgWide) titleImgWide.addEventListener("load", refreshTitleMode);
    if (titleImgWrapped) titleImgWrapped.addEventListener("load", refreshTitleMode);
    window.addEventListener("resize", refreshTitleMode);
  
    // ---------------- iframe sizing (template) ----------------
    let lastHeight = 0;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.ceil(entry.contentRect.height);
        if (h !== lastHeight) {
          parent.postMessage({ iframeHeight: h }, "*");
          lastHeight = h;
        }
      }
    });
    ro.observe(document.documentElement);
  
    function postHeightNow() {
      try {
        const h = Math.max(
          document.documentElement.scrollHeight,
          document.body ? document.body.scrollHeight : 0
        );
        parent.postMessage({ iframeHeight: h }, "*");
      } catch {}
    }
    window.addEventListener("load", () => {
      postHeightNow();
      setTimeout(postHeightNow, 250);
      setTimeout(postHeightNow, 1000);
    });
    window.addEventListener("orientationchange", () => {
      setTimeout(postHeightNow, 100);
      setTimeout(postHeightNow, 500);
    });
  
    // ---------------- audio (WebAudio + synth fallback) ----------------
    let audioCtx = null;
    let masterGain = null;
  
    const bufferPromiseCache = new Map();
    const activeVoices = new Set();
    const activeUiAudios = new Set();
    let synthFallbackWarned = false;
  
    function ensureAudioGraph() {
      if (audioCtx) return audioCtx;
  
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        alert("Your browser doesn’t support Web Audio (required for playback).");
        return null;
      }
  
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.7; 
  
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -10;   
      compressor.knee.value = 12;         
      compressor.ratio.value = 12;        
      compressor.attack.value = 0.002;    
      compressor.release.value = 0.25;
  
      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);
      
      return audioCtx;
    }
  
    async function resumeAudioIfNeeded() {
      const ctx = ensureAudioGraph();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        try { await ctx.resume(); } catch {}
      }
    }
  
    function trackVoice(src, gain, startTime) {
      const voice = { src, gain, startTime };
      activeVoices.add(voice);
      src.onended = () => activeVoices.delete(voice);
      return voice;
    }
  
    function stopAllNotes(fadeSec = 0.05) {
      const ctx = ensureAudioGraph();
      if (!ctx) return;
  
      const now = ctx.currentTime;
      const fade = Math.max(0.01, Number.isFinite(fadeSec) ? fadeSec : 0.05);
  
      activeVoices.forEach((v) => {
        try {
          v.gain.gain.cancelScheduledValues(now);
          v.gain.gain.setValueAtTime(v.gain.gain.value, now);
          v.gain.gain.exponentialRampToValueAtTime(0.0001, now + fade);
          v.src.stop(now + fade + 0.05);
        } catch (e) {}
      });
      activeVoices.clear();
    }
  
    function noteUrl(stem, octaveNum) {
      return `${AUDIO_DIR}/${stem}${octaveNum}.mp3`;
    }
  
    function loadBuffer(url) {
      if (bufferPromiseCache.has(url)) return bufferPromiseCache.get(url);
  
      const p = (async () => {
        const ctx = ensureAudioGraph();
        if (!ctx) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          const ab = await res.arrayBuffer();
          return await ctx.decodeAudioData(ab);
        } catch {
          return null;
        }
      })();
  
      bufferPromiseCache.set(url, p);
      return p;
    }
  
    function playBufferAt(buffer, whenSec, gain = 1) {
      const ctx = ensureAudioGraph();
      if (!ctx || !masterGain) return null;
  
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      const safeGain = Math.max(0, Number.isFinite(gain) ? gain : 1);
      const fadeIn = 0.02; 
      
      g.gain.value = 0;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, whenSec);
      g.gain.linearRampToValueAtTime(safeGain, whenSec + fadeIn);
  
      src.connect(g);
      g.connect(masterGain);
      trackVoice(src, g, whenSec);
  
      src.start(whenSec);
      return src;
    }
  
    function playBufferWindowed(buffer, whenSec, playSec, fadeOutSec, gain = 1) {
      const ctx = ensureAudioGraph();
      if (!ctx || !masterGain) return null;
  
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      const safeGain = Math.max(0, Number.isFinite(gain) ? gain : 1);
  
      const dur = Math.max(0.02, Number.isFinite(playSec) ? playSec : 0.34);
      const fade = Math.min(Math.max(0.01, Number.isFinite(fadeOutSec) ? fadeOutSec : 0.06), dur * 0.8);
      const fadeIn = 0.02;
      const endAt = whenSec + dur;
      const fadeStart = Math.max(whenSec + 0.02, endAt - fade);
  
      g.gain.value = 0;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, whenSec);
      g.gain.linearRampToValueAtTime(safeGain, whenSec + fadeIn);
      g.gain.setValueAtTime(safeGain, fadeStart);
      g.gain.linearRampToValueAtTime(0, endAt);
  
      src.connect(g);
      g.connect(masterGain);
      trackVoice(src, g, whenSec);
  
      try {
        src.start(whenSec, 0, dur);
      } catch {
        src.start(whenSec);
        src.stop(endAt);
      }
      return src;
    }
  
    function pitchFromPcOct(pc, oct) { return (oct * 12) + pc; }
    function pcFromPitch(p) { return ((p % 12) + 12) % 12; }
    function octFromPitch(p) { return Math.floor(p / 12); }
  
    function getStemForPc(pc) { return PC_TO_STEM[(pc + 12) % 12] || null; }
  
    function pitchToFrequency(pitch) {
      const A4 = pitchFromPcOct(9, 4);
      return 440 * Math.pow(2, (pitch - A4) / 12);
    }
  
    function playSynthToneWindowed(pitch, whenSec, playSec, fadeOutSec, gain = 0.65) {
      const ctx = ensureAudioGraph();
      if (!ctx || !masterGain) return null;
  
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(pitchToFrequency(pitch), whenSec);
  
      const g = ctx.createGain();
      const safeGain = Math.max(0, Number.isFinite(gain) ? gain : 0.65);
  
      const fadeIn = 0.01;
      const endAt = whenSec + Math.max(0.05, playSec);
  
      g.gain.setValueAtTime(0, whenSec);
      g.gain.linearRampToValueAtTime(safeGain, whenSec + fadeIn);
  
      const fade = Math.max(0.015, Number.isFinite(fadeOutSec) ? fadeOutSec : 0.06);
      const fadeStart = Math.max(whenSec + 0.02, endAt - fade);
      g.gain.setValueAtTime(safeGain, fadeStart);
      g.gain.linearRampToValueAtTime(0, endAt);
  
      osc.connect(g);
      g.connect(masterGain);
  
      trackVoice(osc, g, whenSec);
      osc.start(whenSec);
      osc.stop(endAt + 0.03);
      return osc;
    }
  
    function maybeWarnSynthFallback(missingUrl) {
      if (synthFallbackWarned) return;
      synthFallbackWarned = true;
      console.warn("Audio sample(s) missing; using synthesized tones instead:", missingUrl);
      setFeedback(`Audio samples not found; using synthesized tones.<br/><small>Missing: <code>${missingUrl}</code></small>`);
    }
  
    async function loadPitchBuffer(pitch) {
      const pc = pcFromPitch(pitch);
      const oct = octFromPitch(pitch);
      const stem = getStemForPc(pc);
      if (!stem) return { missingUrl: "(unknown)", buffer: null, pitch };
  
      const url = noteUrl(stem, oct);
      const buf = await loadBuffer(url);
      if (!buf) return { missingUrl: url, buffer: null, pitch };
      return { missingUrl: null, buffer: buf, pitch };
    }
  
    async function playPitch(pitch, gain = 1) {
      await resumeAudioIfNeeded();
      const ctx = ensureAudioGraph();
      if (!ctx) return;
  
      stopAllNotesWithUi(0.06);
  
      const { missingUrl, buffer } = await loadPitchBuffer(pitch);
      const when = ctx.currentTime + 0.03; 
      if (!buffer) {
        maybeWarnSynthFallback(missingUrl);
        playSynthToneWindowed(pitch, when, 0.85, 0.08, 0.7);
        return;
      }
      playBufferAt(buffer, when, gain);
    }
  
    function stopAllUiSounds() {
      for (const a of Array.from(activeUiAudios)) {
        try { a.pause(); a.currentTime = 0; } catch {}
        activeUiAudios.delete(a);
      }
    }
  
    async function playUiSound(filename) {
      try {
        const url = `${AUDIO_DIR}/${filename}`;
        const buffer = await loadBuffer(url);
        if (!buffer) return;
  
        const ctx = ensureAudioGraph();
        if (!ctx) return;
        
        const when = ctx.currentTime;
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        
        const g = ctx.createGain();
        const UI_VOLUME_BOOST = 2.0; 
        g.gain.setValueAtTime(UI_VOLUME_BOOST, when);
  
        src.connect(g);
        g.connect(masterGain);
        trackVoice(src, g, when);
        src.start(when);
      } catch (e) {
        console.error("UI Sound error:", e);
      }
    }
  
    function playUiSoundIfSilent(filename) {
      if (activeVoices.size > 0) return;
      playUiSound(filename);
    }
  
    // ---------------- scale spelling ----------------
    function mod12(n) {
      const x = n % 12;
      return x < 0 ? x + 12 : x;
    }
  
    function accidentalFromDiff(diff) {
      if (diff === 0) return "";
      if (diff === 1) return "#";
      if (diff === 2) return "##";
      if (diff === -1) return "b";
      if (diff === -2) return "bb";
      return diff > 0 ? "#".repeat(diff) : "b".repeat(-diff);
    }
  
    function noteNameToPc(name) {
      const s = String(name).trim();
      if (!s) return null;
  
      const letter = s[0]?.toUpperCase();
      if (!LETTER_TO_NAT_PC.hasOwnProperty(letter)) return null;
  
      const acc = s.slice(1);
      let delta = 0;
      for (const ch of acc) {
        if (ch === "#") delta += 1;
        else if (ch === "b" || ch === "♭") delta -= 1;
      }
      return mod12(LETTER_TO_NAT_PC[letter] + delta);
    }
  
    function spelledMajorScale(keyName) {
      const root = String(keyName).trim();
      const rootLetter = root[0]?.toUpperCase();
      if (!LETTER_TO_NAT_PC.hasOwnProperty(rootLetter)) return null;
  
      const rootPc = noteNameToPc(root);
      if (rootPc == null) return null;
  
      const rootLetterIdx = LETTERS.indexOf(rootLetter);
      if (rootLetterIdx < 0) return null;
  
      const degrees = [];
      for (let i = 0; i < 8; i++) {
        const letter = LETTERS[(rootLetterIdx + i) % 7];
        const desiredPc = mod12(rootPc + MAJOR_SCALE_STEPS[i]);
        const naturalPc = LETTER_TO_NAT_PC[letter];
  
        let diff = desiredPc - naturalPc;
        diff = ((diff + 6) % 12) - 6;
  
        if (diff > 2) diff -= 12;
        if (diff < -2) diff += 12;
  
        const name = `${letter}${accidentalFromDiff(diff)}`;
        degrees.push({ degree: i + 1, name, pc: desiredPc });
      }
      return { key: root, rootPc, degrees };
    }
  
    function keyLabel(key) {
      const f = KEY_OPTIONS.find((k) => k.key === key);
      return f ? f.label.replace(/^Scale:\s*/, "") : `${key} Major`;
    }
  
    // ---------------- mini 2-octave keyboard SVG ----------------
    const SVG_NS = "http://www.w3.org/2000/svg";
    function el(tag, attrs = {}, children = []) {
      const n = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      for (const c of children) n.appendChild(c);
      return n;
    }
  
    function isBlackPc(pc) { return [1, 3, 6, 8, 10].includes(pc); }
    function whiteIndexInOctave(pc) {
      const m = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
      return m[pc] ?? null;
    }
    
    function buildKeyboardC3toC6(highlightPitchSet, scalePitchSet, tonicPitch, tonicLabel) {
      scaleMount.innerHTML = "";
  
      const lo = DISPLAY_LO_PITCH;
      const hi = DISPLAY_HI_PITCH;
  
      const all = [];
      for (let p = lo; p <= hi; p++) all.push(p);
  
      const WHITE_W = 24;
      const WHITE_H = 92;
      const BLACK_W = 14;
      const BLACK_H = 58;
      const BORDER = 8;
      const RADIUS = 14;
  
      const whitePitches = all.filter((p) => whiteIndexInOctave(pcFromPitch(p)) != null);
      const totalWhite = whitePitches.length;
  
      const innerW = totalWhite * WHITE_W;
      const outerW = innerW + BORDER * 2;
      const outerH = WHITE_H + BORDER * 2;
  
      const s = el("svg", {
        width: 780,
        height: 128,
        viewBox: `0 0 ${outerW} ${outerH}`,
        preserveAspectRatio: "xMidYMid meet",
        role: "img",
        "aria-label": "Keyboard from C3 to C5. Highlighted notes show active notes.",
      });
  
      const style = el("style");
      style.textContent = `
        :root{
          --scaleBlue:#4da3ff;
          --scaleBlue2:#2c7ef5;
          --scaleGlow: rgba(77,163,255,0.28);
        }
        .bg{ fill:#fff; stroke: rgba(0,0,0,0.18); stroke-width:1; }
        .frame{ fill:none; stroke: rgba(0,0,0,0.18); stroke-width:1; }
  
        .w rect{ fill:#fff; stroke:#222; stroke-width:1; }
        .w text{ font-family: Arial, Helvetica, sans-serif; font-size:11px; fill:#9a9a9a; pointer-events:none; user-select:none; }
  
        .b rect{ fill:#111; stroke:#111; stroke-width:1; }
        .b text{ font-family: Arial, Helvetica, sans-serif; font-size:10px; fill:#fff; pointer-events:none; user-select:none; opacity:0; }
  
        .w.hi rect{ fill: var(--scaleBlue); }
        .w.hi text{ fill: rgba(255,255,255,0.96); font-weight:800; }
  
        .b.hi rect{ fill: var(--scaleBlue2); }
        .b.hi text{ opacity:1; font-weight:800; }
        
        .w.in-scale rect{ fill: #e4e4e4; }
        .w.in-scale text{ fill: #aaa; }
        .b.in-scale rect{ fill: #444; }
        .b.in-scale text{ opacity: 0.3; }
  
        .tonic rect{ filter: drop-shadow(0 0 10px var(--scaleGlow)); }
        .cLbl{ font-weight:900; }
      `;
      s.appendChild(style);
  
      s.appendChild(el("rect", { class: "bg", x: 0, y: 0, width: outerW, height: outerH, rx: RADIUS, ry: RADIUS }));
      s.appendChild(el("rect", { class: "frame", x: 1, y: 1, width: outerW - 2, height: outerH - 2, rx: RADIUS, ry: RADIUS }));
  
      const gW = el("g", {});
      const gB = el("g", {});
      s.appendChild(gW);
      s.appendChild(gB);
  
      const startX = BORDER;
      const startY = BORDER;
  
      const whiteIndexByPitch = new Map();
      let wi = 0;
      for (const p of whitePitches) whiteIndexByPitch.set(p, wi++);
  
      for (const p of whitePitches) {
        const x = startX + (whiteIndexByPitch.get(p) || 0) * WHITE_W;
  
        const grp = el("g", { class: "w" });
        grp.appendChild(el("rect", { x, y: startY, width: WHITE_W, height: WHITE_H }));
  
        const lbl = (p === tonicPitch) ? tonicLabel : "";
        const text = el("text", {
          x: x + WHITE_W / 2,
          y: startY + WHITE_H - 10,
          "text-anchor": "middle",
          class: p === tonicPitch ? "cLbl" : "",
        });
        text.textContent = lbl;
        grp.appendChild(text);
  
        if (highlightPitchSet.has(p)) grp.classList.add("hi");
        else if (scalePitchSet.has(p)) grp.classList.add("in-scale");
        
        if (p === tonicPitch) grp.classList.add("tonic");
        gW.appendChild(grp);
      }
  
      for (let p = lo; p <= hi; p++) {
        const pc = pcFromPitch(p);
        if (!isBlackPc(pc)) continue;
  
        const leftPcByBlack = { 1: 0, 3: 2, 6: 5, 8: 7, 10: 9 };
        const leftPc = leftPcByBlack[pc];
        if (leftPc == null) continue;
  
        const oct = octFromPitch(p);
        const leftWhitePitch = pitchFromPcOct(leftPc, oct);
  
        const wIndex = whiteIndexByPitch.get(leftWhitePitch);
        if (wIndex == null) continue;
  
        const leftX = startX + wIndex * WHITE_W;
        const x = leftX + WHITE_W - BLACK_W / 2;
  
        const sharpNames = { 1: "C#", 3: "D#", 6: "F#", 8: "G#", 10: "A#" };
        const t = el("text", { x: x + BLACK_W / 2, y: startY + Math.round(BLACK_H * 0.55), "text-anchor": "middle" });
        t.textContent = sharpNames[pc] || "";
  
        const grp = el("g", { class: "b" });
        grp.appendChild(el("rect", { x, y: startY, width: BLACK_W, height: BLACK_H, rx: 4, ry: 4 }));
        grp.appendChild(t);
  
        if (highlightPitchSet.has(p)) grp.classList.add("hi");
        else if (scalePitchSet.has(p)) grp.classList.add("in-scale");
  
        if (p === tonicPitch) grp.classList.add("tonic");
        gB.appendChild(grp);
      }
  
      scaleMount.appendChild(s);
    }
  
    // ---------------- state ----------------
    const score = { correct: 0, incorrect: 0, lastWasCorrect: null, perNote: {} };
  
    const state = {
      started: false,
      awaitingNext: false,
      target: null, // { pitch, pc, name, degree }
      lastPitch: null,
      key: "C",
      rangeMode: "one",
      notesCount: 7,
      scale: null,
    };
  
    // ---------------- UI helpers ----------------
    function setPulseSyncDelay(el) {
      if (!(el instanceof HTMLElement)) return;
      const nowSec = (performance.now ? performance.now() : Date.now()) / 1000;
      el.style.setProperty("--pulseSyncDelay", `${-nowSec}s`);
    }
  
    function setSyncedClass(el, className, on) {
      const had = el.classList.contains(className);
      el.classList.toggle(className, !!on);
      if (on && !had) setPulseSyncDelay(el);
    }
  
    function parseCssTimeToSec(v, fallbackSec) {
      const s = String(v || "").trim();
      if (!s) return fallbackSec;
      const ms = s.match(/^(-?\d+(?:\.\d+)?)ms$/i);
      if (ms) return Number(ms[1]) / 1000;
      const sec = s.match(/^(-?\d+(?:\.\d+)?)s$/i);
      if (sec) return Number(sec[1]);
      const n = Number(s);
      return Number.isFinite(n) ? n : fallbackSec;
    }
  
    function getCssTimeSec(varName, fallbackSec) {
      try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(varName);
        const n = parseCssTimeToSec(v, fallbackSec);
        return Number.isFinite(n) ? n : fallbackSec;
      } catch {
        return fallbackSec;
      }
    }
  
    function getRefFadeOutSec() { return Math.max(0.01, getCssTimeSec("--refNoteFadeOut", 0.06)); }
    function setFeedback(html) { feedbackOut.innerHTML = html || ""; }
    function setPhase(title) { phaseTitle.textContent = title || ""; }
    function scoreTotal() { return score.correct + score.incorrect; }
  
    function scoreAccuracy() {
      const t = scoreTotal();
      if (!t) return 0;
      return (score.correct / t) * 100;
    }
  
    function renderScorePills() {
      const c = score.correct;
      const i = score.incorrect;
      const tot = c + i;
      const accStr = `${scoreAccuracy().toFixed(1)}%`;

      correctOut.textContent = String(c);
      incorrectOut.textContent = String(i);
      totalOut.textContent = String(tot);
      accuracyOut.textContent = accStr;

      if (modalCorrectOut) modalCorrectOut.textContent = String(c);
      if (modalIncorrectOut) modalIncorrectOut.textContent = String(i);
      if (modalTotalOut) modalTotalOut.textContent = String(tot);
      if (modalAccuracyOut) modalAccuracyOut.textContent = accStr;

      perNoteOut.innerHTML = "";
      if (modalPerNoteOut) modalPerNoteOut.innerHTML = "";

      if (state.scale) {
        const activeDegrees = state.scale.degrees.slice(0, state.notesCount);
        for (const d of activeDegrees) {
          const st = score.perNote[d.name] || { asked: 0, correct: 0 };
          const txt = `${d.name}: ${st.correct}/${st.asked}`;

          const el = document.createElement("div");
          el.className = "perNoteItem";
          el.textContent = txt;
          perNoteOut.appendChild(el);

          if (modalPerNoteOut) {
            const mel = document.createElement("div");
            mel.className = "perNoteItem";
            mel.textContent = txt;
            modalPerNoteOut.appendChild(mel);
          }
        }
      }
    }
  
    function drawRoundRect(ctx, x, y, w, h, r) {
      const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
  
    async function downloadScorecardPng(nameInputEl) {
      
      // LAYOUT SETTINGS - ADJUST PADDING SPACES HERE
      const LAYOUT = {
        gapAfterImage: 32,           // Space below the title image
        gapAfterUrl: 36,             // Space below the URL
        gapAfterTitle: 30,           // Space below "Score Card"
        gapAfterMeta: 28,            // Space below "Scale: C Major..."
        gapAfterName: 22,            // Space below "Name: ..." (distance to first main grid row)
        gapNoNameCompensation: 12,   // Extra space to add if no name is entered
        mainGridRowGap: 14,          // Space between the main score rows
        gapBeforePerNoteTitle: 32,   // Space before "Per Note Statistics"
        gapAfterPerNoteTitle: 26,    // Space after "Per Note Statistics"
        perNoteGridRowGap: 14,       // Space between rows in the per-note grid
      };

      const scale = keyLabel(state.key);
      const range = rangeLabel(state.rangeMode);
      const notesStr = `1-${state.notesCount}`;
      const name = safeText(nameInputEl?.value);
      if (nameInputEl) saveName(name);
  
      const correct = score.correct;
      const incorrect = score.incorrect;
      const total = scoreTotal();
      const accuracy = `${scoreAccuracy().toFixed(1)}%`;
  
      const W = 720;
      const H = 940; 
      const dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1) * 100) / 100);
  
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
  
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
  
      const pad = 34;
      const cardX = pad;
      const cardY = pad;
      const cardW = W - pad * 2;
      const cardH = H - pad * 2;
  
      ctx.fillStyle = "#f9f9f9";
      drawRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
      ctx.fill();
  
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, cardX, cardY, cardW, cardH, 18);
      ctx.stroke();
  
      const titleSrc = titleImgWide?.getAttribute("src") || "images/title.png";
      const titleImg = await loadImage(titleSrc);
  
      let yCursor = cardY + 26; // Initial top padding
  
      if (titleImg) {
        const imgMaxW = Math.min(520, cardW - 40);
        const imgMaxH = 92;
        drawImageContain(ctx, titleImg, (W - imgMaxW) / 2, yCursor, imgMaxW, imgMaxH);
        yCursor += imgMaxH + LAYOUT.gapAfterImage;
      }

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.font = "800 18px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("www.eartraininglab.com", W / 2, yCursor);
      yCursor += LAYOUT.gapAfterUrl;
  
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.font = "700 26px Arial, Helvetica, sans-serif";
      ctx.fillText("Score Card", W / 2, yCursor);
      yCursor += LAYOUT.gapAfterTitle;
  
      ctx.font = "800 18px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.70)";
      const metaLine = `Scale: ${scale}   •   Range: ${range}   •   Notes: ${notesStr}`;
      ctx.fillText(metaLine, W / 2, yCursor);
      yCursor += LAYOUT.gapAfterMeta;
  
      if (name) {
        ctx.fillText(`Name: ${name}`, W / 2, yCursor);
        yCursor += LAYOUT.gapAfterName;
      } else {
        // Keeps the grid visually balanced if name is missing
        yCursor += LAYOUT.gapNoNameCompensation; 
      }
  
      ctx.fillStyle = "#111";
      ctx.textAlign = "left";
  
      const rowX = cardX + 26;
      const rowW = cardW - 52;
      const rowH = 58;
      
      const rows = [
        ["Correct", String(correct)],
        ["Incorrect", String(incorrect)],
        ["Total Questions Asked", String(total)],
        ["Percentage Correct", accuracy],
      ];
  
      for (const [k, v] of rows) {
        ctx.fillStyle = "#ffffff";
        drawRoundRect(ctx, rowX, yCursor, rowW, rowH, 14);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.16)";
        ctx.stroke();
  
        ctx.fillStyle = "rgba(0,0,0,0.70)";
        ctx.font = "900 18px Arial, Helvetica, sans-serif";
        ctx.fillText(k, rowX + 16, yCursor + 33);
  
        ctx.fillStyle = "#111";
        ctx.font = "900 22px Arial, Helvetica, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(v, rowX + rowW - 16, yCursor + 37);
        ctx.textAlign = "left";
  
        yCursor += rowH + LAYOUT.mainGridRowGap;
      }

      yCursor += (LAYOUT.gapBeforePerNoteTitle - LAYOUT.mainGridRowGap); 
      
      ctx.textAlign = "center";
      ctx.font = "800 16px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillText("Per Note Statistics", W / 2, yCursor);
      yCursor += LAYOUT.gapAfterPerNoteTitle;

      const activeDegrees = state.scale.degrees.slice(0, state.notesCount);
      const cols = 2;
      const itemW = (rowW - LAYOUT.perNoteGridRowGap) / 2;
      const itemH = 42;
      let currentX = rowX;

      ctx.textAlign = "left";
      for (let i = 0; i < activeDegrees.length; i++) {
        const d = activeDegrees[i];
        const st = score.perNote[d.name] || {asked: 0, correct: 0};
        const pct = st.asked > 0 ? Math.round((st.correct / st.asked) * 100) : 0;
        const textLeft = `${d.name}: ${st.correct}/${st.asked}`;
        const textRight = `${pct}%`;

        ctx.fillStyle = "#ffffff";
        drawRoundRect(ctx, currentX, yCursor, itemW, itemH, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.16)";
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.font = "800 16px Arial, Helvetica, sans-serif";
        ctx.fillText(textLeft, currentX + 16, yCursor + 26);

        ctx.fillStyle = "#111";
        ctx.font = "900 16px Arial, Helvetica, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(textRight, currentX + itemW - 16, yCursor + 26);
        ctx.textAlign = "left";

        if ((i + 1) % cols === 0) {
          currentX = rowX;
          yCursor += itemH + LAYOUT.perNoteGridRowGap;
        } else {
          currentX += itemW + LAYOUT.perNoteGridRowGap;
        }
      }
  
      ctx.textAlign = "center";
      ctx.font = "800 14px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText("Identifying Diatonic Notes in Major Scales - www.eartraininglab.com", W / 2, cardY + cardH - 24);
  
      const fileBase = name ? `${sanitizeFilenamePart(name)}_scorecard` : "scorecard";
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileBase}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    }
  
    function setAnswerButtonsEnabled(enabled) {
      answerButtons.querySelectorAll("button").forEach((b) => (b.disabled = !enabled));
    }
  
    function clearAnswerButtonStates() {
      answerButtons.querySelectorAll("button").forEach((b) => {
        b.classList.remove("correct");
        b.classList.remove("incorrect");
        b.classList.remove("chosen");
        b.setAttribute("aria-pressed", "false");
      });
    }
  
    function updateControls() {
      const canReplay = state.started && !!state.target;
      replayBtn.disabled = !canReplay;
      setSyncedClass(replayBtn, "pulse", canReplay);
  
      const canUseReference = state.started;
      tonicBtn.disabled = !canUseReference;
      refTonicBtn.disabled = !canUseReference;
  
      const canNext = state.started && state.awaitingNext;
      nextBtn.disabled = !canNext;
      setSyncedClass(nextBtn, "nextReady", canNext);
  
      beginBtn.textContent = state.started ? "End/Restart Game" : "Begin Game";
      setSyncedClass(beginBtn, "pulse", !state.started);
      beginBtn.classList.toggle("primary", !state.started);
      beginBtn.classList.toggle("isRestart", state.started);
  
      setAnswerButtonsEnabled(state.started && !state.awaitingNext && !!state.target);
    }
  
    function applyScaleKey(key) {
      state.key = key;
      state.scale = spelledMajorScale(key);
      renderAnswerButtons();
      updateMiniKeyboard();
      updateControls();
      updateScoreMeta();
    }
  
    function getAppliedScaleValue() { return String(state.key); }
    function getAppliedRangeValue() { return String(state.rangeMode); }
    function getAppliedNotesValue() { return String(state.notesCount); }
    
    function isSettingsDirty() {
      return String(settingsScaleSelect.value) !== getAppliedScaleValue()
          || String(settingsRangeSelect.value) !== getAppliedRangeValue()
          || String(settingsNotesSelect.value) !== getAppliedNotesValue();
    }
    
    function updateSettingsDirtyUi() {
      const dirty = isSettingsDirty();
      settingsRestartBtn.disabled = !dirty;
      settingsRestartBtn.classList.toggle("is-disabled", !dirty);
    }
  
    function renderAnswerButtons() {
      answerButtons.innerHTML = "";
      if (!state.scale) return;
  
      const activeDegrees = state.scale.degrees.slice(0, state.notesCount);
  
      for (const d of activeDegrees) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "noteBtn";
        btn.dataset.degree = String(d.degree);
        btn.dataset.name = d.name;
        btn.setAttribute("aria-pressed", "false");
        btn.innerHTML = `<span class="note">${d.name}</span><span class="deg">${DEGREE_LABELS[d.degree - 1] || d.degree}</span>`;
        btn.addEventListener("click", () => onAnswerClick(btn));
        answerButtons.appendChild(btn);
      }
    }
  
    function updateMiniKeyboard() {
      if (!state.scale) {
        scaleMount.innerHTML = "";
        return;
      }
  
      const rootPitch = pitchFromPcOct(state.scale.rootPc, 3); // C3 as reference base
      
      // In-scale pitches (greyed out if inactive) - capped at 7 degrees to exclude top octave
      const scalePitchSet = new Set(MAJOR_SCALE_STEPS.slice(0, 7).map(i => rootPitch + i));
      
      // Active pitches (highlighted blue) - naturally capped by notesCount
      const activePitchSet = new Set(MAJOR_SCALE_STEPS.slice(0, state.notesCount).map(i => rootPitch + i));
  
      buildKeyboardC3toC6(activePitchSet, scalePitchSet, rootPitch, `${state.scale.key}3`);
    }
  
    // ---------------- game flow ----------------
    function randomInt(min, max) {
      const a = Math.ceil(min);
      const b = Math.floor(max);
      return Math.floor(Math.random() * (b - a + 1)) + a;
    }
  
    function pickRandomTargetPitch() {
      if (!state.scale) return null;
  
      const activeDegrees = state.scale.degrees.slice(0, state.notesCount);
      if (!activeDegrees.length) return null;
  
      const multiOctaves = (state.rangeMode === "multi") ? [0, 1] : [0]; 
      
      // Pick a random degree and octave directly (true randomness allowed)
      const degObj = activeDegrees[randomInt(0, activeDegrees.length - 1)];
      const degIndex = degObj.degree - 1; 
      const octOffset = multiOctaves[randomInt(0, multiOctaves.length - 1)];

      // 100% strict adherence to sequential mathematical steps above the root 
      const rootPitch3 = pitchFromPcOct(state.scale.rootPc, 3);
      const pitch = rootPitch3 + MAJOR_SCALE_STEPS[degIndex] + (octOffset * 12);
      
      return { pitch, pc: degObj.pc, name: degObj.name, degree: degObj.degree };
    }
  
    async function startRound({ autoplay = true } = {}) {
      if (!state.started) return;
  
      clearAnswerButtonStates();
      state.awaitingNext = false;
  
      const t = pickRandomTargetPitch();
      if (!t) {
        setFeedback("Could not generate a note. Check the selected scale.");
        state.target = null;
        updateControls();
        return;
      }
  
      state.target = {
        pitch: t.pitch,
        pc: t.pc,
        name: t.name,
        degree: t.degree
      };
      state.lastPitch = t.pitch;

      // Track that this note was asked
      if (score.perNote[state.target.name]) {
        score.perNote[state.target.name].asked += 1;
      }
  
      setPhase(keyLabel(state.key));
      setFeedback("Which note was that? 🔉");
      
      updateControls();
      await new Promise(requestAnimationFrame);
  
      if (autoplay) await playPitch(state.target.pitch, 1);
    }
  
    function resetScore() {
      score.correct = 0;
      score.incorrect = 0;
      score.lastWasCorrect = null;
      score.perNote = {};
      
      if (state.scale) {
        const activeDegrees = state.scale.degrees.slice(0, state.notesCount);
        for (const d of activeDegrees) {
          score.perNote[d.name] = { asked: 0, correct: 0 };
        }
      }

      renderScorePills();
    }
  
    async function startGameFromKey(key) {
      clearRefScaleTimer();
      setRefScalePlaying(false);
  
      const sc = spelledMajorScale(key);
      if (!sc) {
        setFeedback("Could not parse that key.");
        return;
      }
  
      state.key = key;
      state.scale = sc;
      renderAnswerButtons();
      updateMiniKeyboard();
  
      resetScore();
      state.started = true;
      state.awaitingNext = false;
      state.target = null;
      state.lastPitch = null;
  
      updateControls();
      updateScoreMeta();
      await startRound({ autoplay: true });
    }
  
    function returnToStartScreen({ openIntro = false } = {}) {
      stopAllNotesWithUi(0.06);
      stopAllUiSounds();
      clearRefScaleTimer();
      setRefScalePlaying(false);
  
      state.started = false;
      state.awaitingNext = false;
      state.target = null;
      state.lastPitch = null;
  
      clearAnswerButtonStates();
      resetScore();
      setPhase("Ready");
  
      if (openIntro) {
        openModal(introModal);
        try { introBeginBtn.focus(); } catch {}
      }
      setFeedback("Press <strong>Begin Game</strong> to start.");
      
      updateControls();
    }
  
    async function onAnswerClick(btn) {
      if (!state.started || state.awaitingNext || !state.target) return;
    
      const clickedDegree = Number(btn.dataset.degree);
      if (!Number.isFinite(clickedDegree)) return;
    
      clearAnswerButtonStates();
      btn.classList.add("chosen");
      btn.setAttribute("aria-pressed", "true");
    
      // 1st and 8th degree equivalence to handle "multiple octave" overlap smoothly
      const isCorrect = ((clickedDegree - 1) % 7) === ((state.target.degree - 1) % 7);
  
      const fadeOutSec = getRefFadeOutSec();
      stopAllNotesWithUi(fadeOutSec);
      stopAllUiSounds();
  
      if (isCorrect) {
        setTimeout(() => playUiSound(UI_SND_CORRECT), 20);      
      } else {
        playUiSound(UI_SND_INCORRECT);
      }
    
      score.lastWasCorrect = isCorrect;
      if (isCorrect) {
        score.correct += 1;
        if (score.perNote[state.target.name]) {
          score.perNote[state.target.name].correct += 1;
        }
      } else {
        score.incorrect += 1;
      }
    
      renderScorePills();
    
      if (isCorrect) {
        btn.classList.add("correct");
        setFeedback(`✅ Correct - nice one! That note was <strong>${state.target.name}</strong>.`);
        setPhase(keyLabel(state.key));
      } else {
        btn.classList.add("incorrect");
        const correctBtn = answerButtons.querySelector(`button[data-degree="${state.target.degree}"]`);
        if (correctBtn) correctBtn.classList.add("correct");
        setFeedback(`❌ Uh oh! That note was actually <strong>${state.target.name}</strong>. Give it another go!`);
        setPhase(keyLabel(state.key));
      }
    
      state.awaitingNext = true;
      updateControls();
    }
  
    async function replayTarget() {
      if (!state.started || !state.target) return;
      await playPitch(state.target.pitch, 1);
    }
  
    let refScaleTimer = null;
    let refScalePlaying = false;
  
    function setRefScalePlaying(on) {
      refScalePlaying = !!on;
      tonicBtn.textContent = refScalePlaying ? "Stop Playing" : "Reference - Play Scale";
      tonicBtn.setAttribute("aria-pressed", refScalePlaying ? "true" : "false");
    }
  
    function clearRefScaleTimer() {
      if (refScaleTimer) {
        clearTimeout(refScaleTimer);
        refScaleTimer = null;
      }
    }
  
    function scheduleRefScaleStopped(ms) {
      clearRefScaleTimer();
      refScaleTimer = setTimeout(() => {
        refScaleTimer = null;
        setRefScalePlaying(false);
      }, Math.max(0, ms | 0));
    }
  
    function stopAllNotesWithUi(fadeSec = 0.05) {
      stopAllNotes(fadeSec);
      if (refScalePlaying) scheduleRefScaleStopped((fadeSec + 0.03) * 1000);
    }
  
    async function playScaleReference() {
      if (!state.started || !state.scale) return;
  
      await resumeAudioIfNeeded();
      const ctx = ensureAudioGraph();
      if (!ctx) return;
  
      const fadeOutSec = getRefFadeOutSec();
  
      if (refScalePlaying) {
        stopAllNotesWithUi(fadeOutSec);
        return;
      }
  
      stopAllNotesWithUi(fadeOutSec);
      setRefScalePlaying(true);
  
      const rootPitch = pitchFromPcOct(state.scale.rootPc, 3); // X3
      const pitches = MAJOR_SCALE_STEPS.map((i) => rootPitch + i);
  
      const stepSec = 0.30; 
      const standardNoteSec = 0.70; 
      const lastNoteSec = 0.8; 
  
      const loaded = await Promise.all(pitches.map((p) => loadPitchBuffer(p)));
      const startAt = ctx.currentTime + 0.02;
      
      scheduleRefScaleStopped(((pitches.length - 1) * stepSec + lastNoteSec + fadeOutSec + 0.05) * 1000);
  
      for (let i = 0; i < loaded.length; i++) {
        const when = startAt + (i * stepSec);
        const { missingUrl, buffer, pitch } = loaded[i];
  
        const isLastNote = (i === loaded.length - 1);
        const currentNoteSec = isLastNote ? lastNoteSec : standardNoteSec;
  
        if (!buffer) {
          maybeWarnSynthFallback(missingUrl);
          playSynthToneWindowed(pitch, when, currentNoteSec, fadeOutSec, 0.65);
          continue;
        }
        playBufferWindowed(buffer, when, currentNoteSec, fadeOutSec, 0.95);
      }
    }
  
    async function playTonicReference() {
      if (!state.started || !state.scale) return;
  
      await resumeAudioIfNeeded();
      const ctx = ensureAudioGraph();
      if (!ctx) return;
  
      const fadeOutSec = getRefFadeOutSec();
      const noteSec = 7;
  
      stopAllNotesWithUi(fadeOutSec);
  
      const pitch = pitchFromPcOct(state.scale.rootPc, 3); // tonic in octave 3
      const when = ctx.currentTime + 0.03;
  
      const { missingUrl, buffer } = await loadPitchBuffer(pitch);
      if (!buffer) {
        maybeWarnSynthFallback(missingUrl);
        playSynthToneWindowed(pitch, when, noteSec, fadeOutSec, 0.7);
        return;
      }
      playBufferWindowed(buffer, when, noteSec, fadeOutSec, 0.95);
    }
  
    // ---------------- modals ----------------
    let lastFocusEl = null;
  
    function openModal(modalEl) {
      lastFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      modalEl.classList.remove("hidden");
      postHeightNow();
    }
  
    function closeModal(modalEl) {
      modalEl.classList.add("hidden");
      postHeightNow();
      if (lastFocusEl) {
        try { lastFocusEl.focus(); } catch {}
      }
    }
  
    function isVisible(modalEl) { return !modalEl.classList.contains("hidden"); }
    function loadInitialKey() { return "C"; }
    function loadInitialRange() { return "one"; }
    function loadInitialNotes() {
      const saved = localStorage.getItem(LS_KEY_NOTES);
      return saved ? String(saved) : "7"; 
    }
  
    function loadInitialName() {
      const saved = localStorage.getItem(LS_KEY_NAME);
      const v = String(saved || "").trim();
      return v.slice(0, 32);
    }
  
    function saveName(name) { try { localStorage.setItem(LS_KEY_NAME, String(name || "").trim().slice(0, 32)); } catch {} }
    function saveKey(key) { try { localStorage.setItem(LS_KEY, key); } catch {} }
    function saveRange(mode) { try { localStorage.setItem(LS_KEY_RANGE, mode); } catch {} }
    function saveNotes(notes) { try { localStorage.setItem(LS_KEY_NOTES, notes); } catch {} }
  
    function sanitizeFilenamePart(s) {
      const v = String(s || "").trim().replace(/\s+/g, "_");
      const cleaned = v.replace(/[^a-zA-Z0-9_\-]+/g, "");
      return cleaned.slice(0, 32) || "";
    }
  
    async function loadImage(src) {
      return await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });
    }
  
    function drawImageContain(ctx, img, x, y, w, h) {
      const iw = img.naturalWidth || img.width || 1;
      const ih = img.naturalHeight || img.height || 1;
      const r = Math.min(w / iw, h / ih);
      const dw = Math.max(1, iw * r);
      const dh = Math.max(1, ih * r);
      const dx = x + (w - dw) / 2;
      const dy = y + (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      return { w: dw, h: dh, x: dx, y: dy };
    }
  
    function safeText(s) { return String(s || "").replace(/[\u0000-\u001f\u007f]/g, "").trim(); }

    // Sync input fields together so user's name maps across both cards perfectly
    function syncNames(val) {
      if (playerNameInput && playerNameInput.value !== val) playerNameInput.value = val;
      if (modalPlayerNameInput && modalPlayerNameInput.value !== val) modalPlayerNameInput.value = val;
    }
    if (playerNameInput) playerNameInput.addEventListener("input", (e) => syncNames(e.target.value));
    if (modalPlayerNameInput) modalPlayerNameInput.addEventListener("input", (e) => syncNames(e.target.value));
  
    // ---------------- events ----------------
    
    // Core routing system for the new summary modal
    let scoreModalContinueCallback = null;

    function showScoreModal(onContinue) {
      scoreModalContinueCallback = onContinue;
      openModal(scoreModal);
      try { scoreModalContinueBtn.focus(); } catch {}
    }

    scoreModalContinueBtn.addEventListener("click", () => {
      playUiSound(UI_SND_SELECT);
      closeModal(scoreModal);
      if (scoreModalContinueCallback) scoreModalContinueCallback();
    });

    // Modified main page Restart routing
    beginBtn.addEventListener("click", async () => {
      if (!state.started) {
        if (introModal && !introModal.classList.contains("hidden")) closeModal(introModal);
        await startGameFromKey(state.key);
        return;
      }
      
      showScoreModal(() => {
        returnToStartScreen({ openIntro: true });
      });
    });
  
    replayBtn.addEventListener("click", async () => { await replayTarget(); });
  
    nextBtn.addEventListener("click", async () => {
      if (!state.started || !state.awaitingNext) return;
      const fadeOutSec = getRefFadeOutSec(); 
      stopAllNotesWithUi(fadeOutSec);        
      stopAllUiSounds(); 
      await startRound({ autoplay: true });
    });
  
    tonicBtn.addEventListener("click", async () => { await playScaleReference(); });
    refTonicBtn.addEventListener("click", async () => { await playTonicReference(); });
  
    // Hook up both download buttons
    downloadScorecardBtn.addEventListener("click", async () => {
      playUiSound(UI_SND_SELECT);
      await downloadScorecardPng(playerNameInput);
    });

    modalDownloadScorecardBtn.addEventListener("click", async () => {
      playUiSound(UI_SND_SELECT);
      await downloadScorecardPng(modalPlayerNameInput);
    });
  
    // ---------------- settings selects (<select>) ----------------
  
    function populateSelect(sel, options) {
      if (!sel) return;
      sel.innerHTML = "";
      for (const opt of options) {
        const o = document.createElement("option");
        o.value = opt.key;
        o.textContent = opt.label;
        sel.appendChild(o);
      }
    }
  
    function rangeLabel(mode) {
      const m = mode === "multi" ? "multi" : "one";
      const label = RANGE_OPTIONS.find((r) => r.key === m)?.label || (m === "multi" ? "Range: Multiple Octaves" : "Range: One Octave");
      return label.replace(/^Range:\s*/, "");
    }
  
    function updateScoreMeta() {
      if (scoreMeta) scoreMeta.textContent = `Scale: ${keyLabel(state.key)} • Range: ${rangeLabel(state.rangeMode)} • Notes: 1-${state.notesCount}`;
      if (modalScoreMeta) modalScoreMeta.textContent = `Scale: ${keyLabel(state.key)} • Range: ${rangeLabel(state.rangeMode)} • Notes: 1-${state.notesCount}`;
    }
  
    function updateSettingsSelectUi() {
      if (settingsScaleSelect) settingsScaleSelect.value = state.key;
      if (settingsRangeSelect) settingsRangeSelect.value = state.rangeMode;
      if (settingsNotesSelect) settingsNotesSelect.value = state.notesCount;
      updateScoreMeta();
    }
  
    function applyRangeMode(mode) {
      state.rangeMode = mode === "multi" ? "multi" : "one";
      updateSettingsSelectUi();
      updateControls();
    }
  
    function applyNotesMode(notesStr) {
      state.notesCount = parseInt(notesStr) || 7;
      updateSettingsSelectUi();
      updateControls();
    }
  
    function openSettingsModal() {
      stopAllNotesWithUi(getRefFadeOutSec());
      updateSettingsSelectUi();
      openModal(settingsModal);
      updateSettingsDirtyUi();
      try { settingsScaleSelect.focus(); } catch {}
    }
  
    settingsScaleSelect.addEventListener("change", updateSettingsDirtyUi);
    settingsRangeSelect.addEventListener("change", updateSettingsDirtyUi);
    settingsNotesSelect.addEventListener("change", updateSettingsDirtyUi);
  
    settingsBtn.addEventListener("click", () => {
      playUiSound(UI_SND_SELECT);
      openSettingsModal();
    });
  
    settingsCancelBtn.addEventListener("click", () => {
      playUiSound(UI_SND_BACK);
      updateSettingsSelectUi();
      updateSettingsDirtyUi(); 
      closeModal(settingsModal);
    });
  
    settingsRestartBtn.addEventListener("click", () => {
      if (settingsRestartBtn.disabled) return;
      const newKey = String(settingsScaleSelect.value || "C");
      const newRange = String(settingsRangeSelect.value || "one");
      const newNotes = String(settingsNotesSelect.value || "7");
  
      closeModal(settingsModal);
      playUiSound(UI_SND_SELECT);

      showScoreModal(() => {
        saveKey(newKey);
        saveRange(newRange);
        saveNotes(newNotes);
    
        stopAllNotesWithUi(0.06);
        stopAllUiSounds();
        clearRefScaleTimer();
        setRefScalePlaying(false);
    
        state.started = false;
        state.awaitingNext = false;
        state.target = null;
        state.lastPitch = null;
        
        clearAnswerButtonStates();
        
        applyRangeMode(newRange);
        applyNotesMode(newNotes);
        applyScaleKey(newKey);
        resetScore();
    
        setPhase("Ready");
        setFeedback("Press <strong>Begin Game</strong> to start.");
        updateControls();
        
        try { beginBtn.focus(); } catch {}
      });
    });
  
    // ---------------- intro modal ----------------
    function handleIntroContinue() {
      playUiSound(UI_SND_SELECT);
      
      const newKey = String(introScaleSelect.value || "C");
      const newRange = String(introRangeSelect.value || "one");
      const newNotes = String(introNotesSelect.value || "7");
  
      saveKey(newKey);
      saveRange(newRange);
      saveNotes(newNotes);
  
      applyRangeMode(newRange);
      applyNotesMode(newNotes);
      applyScaleKey(newKey);
      resetScore();
  
      if (settingsScaleSelect) settingsScaleSelect.value = newKey;
      if (settingsRangeSelect) settingsRangeSelect.value = newRange;
      if (settingsNotesSelect) settingsNotesSelect.value = newNotes;
  
      closeModal(introModal);
      setFeedback("Press <strong>Begin Game</strong> to start.");
      try { beginBtn.focus(); } catch {}
    }
  
    introBeginBtn.addEventListener("click", handleIntroContinue);
    introBeginBtnTop.addEventListener("click", handleIntroContinue);
  
    infoBtn.addEventListener("click", () => {
      stopAllNotesWithUi(getRefFadeOutSec());
      playUiSound(UI_SND_SELECT);
      openModal(infoModal);
      try { infoClose.focus(); } catch {}
    });
  
    infoClose.addEventListener("click", () => {
      playUiSound(UI_SND_BACK);
      closeModal(infoModal);
    });
  
    [infoModal, settingsModal].forEach((m) => {
      m.addEventListener("click", (e) => {
        if (e.target === m) {
          playUiSound(UI_SND_BACK);
          if (m === settingsModal) updateSettingsSelectUi();
          closeModal(m);
        }
      });
    });
  
    introModal.addEventListener("click", (e) => {
      if (e.target === introModal) {
        playUiSound(UI_SND_BACK);
      }
    });
  
    window.addEventListener("keydown", async (e) => {
      if (e.key === "Escape") {
        if (isVisible(settingsModal)) {
          playUiSound(UI_SND_BACK);
          updateSettingsSelectUi();
          closeModal(settingsModal);
          return;
        }
        if (isVisible(infoModal)) {
          playUiSound(UI_SND_BACK);
          closeModal(infoModal);
          return;
        }
        return;
      }
  
      if (isVisible(settingsModal) || isVisible(infoModal) || isVisible(introModal) || isVisible(scoreModal)) return;
  
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        await replayTarget();
        return;
      }
  
      if (e.key === " " || e.code === "Space") {
        if (!nextBtn.disabled) {
          e.preventDefault();
          await startRound({ autoplay: true });
        }
      }
    });
  
    // ---------------- init ----------------
    function init() {
      setPulseSyncDelay(beginBtn);
      setPulseSyncDelay(introBeginBtn);
      setPulseSyncDelay(introBeginBtnTop); 
  
      const initialName = loadInitialName();
      if (playerNameInput) playerNameInput.value = initialName;
      if (modalPlayerNameInput) modalPlayerNameInput.value = initialName;
  
      // Populate selects
      populateSelect(settingsScaleSelect, KEY_OPTIONS);
      populateSelect(settingsRangeSelect, RANGE_OPTIONS);
      populateSelect(settingsNotesSelect, NOTES_OPTIONS);
      
      populateSelect(introScaleSelect, KEY_OPTIONS);
      populateSelect(introRangeSelect, RANGE_OPTIONS);
      populateSelect(introNotesSelect, NOTES_OPTIONS);
  
      const initialKey = loadInitialKey();
      const initialRange = loadInitialRange();
      const initialNotes = loadInitialNotes();
      
      applyRangeMode(initialRange);
      applyNotesMode(initialNotes);
      applyScaleKey(initialKey);
      updateSettingsSelectUi();
  
      if (introScaleSelect) introScaleSelect.value = initialKey;
      if (introRangeSelect) introRangeSelect.value = initialRange;
      if (introNotesSelect) introNotesSelect.value = initialNotes;
  
      renderScorePills();
      setPhase("Ready");
      setFeedback("Press <strong>Begin Game</strong> to start.");
      updateControls();
  
      openModal(introModal);
      try { introBeginBtn.focus(); } catch {}
    }
  
    init();
  })();
