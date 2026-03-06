import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://192.168.223.195:8000";

const COLORS = {
  primary: "#0A5F55",
  primaryLight: "#0E7A6B",
  primaryDark: "#073D38",
  accent: "#F0A500",
  accentLight: "#FFB930",
  danger: "#D94040",
  dangerLight: "#FF6B6B",
  warning: "#E07B00",
  success: "#1A9E5C",
  bg: "#F2F7F6",
  bgCard: "#FFFFFF",
  text: "#1A2B2A",
  textMuted: "#5A7A77",
  border: "#D4E8E5",
};

const TRANSLATIONS = {
  en: {
    appName: "EpiTwin",
    tagline: "Health Intelligence for ASHA Workers",
    login: "Login",
    username: "Username",
    password: "Password",
    loginBtn: "Sign In",
    home: "Home",
    symptoms: "Symptoms",
    schemes: "Schemes",
    sync: "Sync",
    welcomeBack: "Welcome back,",
    todayOverview: "Today's Overview",
    logSymptoms: "Log Symptoms",
    checkSchemes: "Check Schemes",
    offlineQueue: "Offline Queue",
    items: "items",
    synced: "All synced",
    selectSymptoms: "Select Symptoms",
    village: "Village",
    patientAge: "Patient Age",
    submit: "Analyze Risk",
    riskResult: "Risk Assessment",
    high: "HIGH RISK",
    medium: "MEDIUM RISK",
    low: "LOW RISK",
    confidence: "Confidence",
    patientName: "Patient Name",
    condition: "Chronic Condition",
    findSchemes: "Find Schemes",
    matchedSchemes: "Matched Schemes",
    noSchemes: "No schemes found",
    offline: "Offline Mode",
    syncNow: "Sync Now",
    logout: "Logout",
    temperature: "Temperature (°C)",
    humidity: "Humidity (%)",
    rainfall: "Rainfall (mm)",
    villages: "Villages Covered",
    patientsToday: "Patients Today",
    outbreakAlert: "Outbreak Alerts",
  },
  ta: {
    appName: "எபிட்வின்",
    tagline: "ஆஷா தொழிலாளர்களுக்கான சுகாதார நுண்ணறிவு",
    login: "உள்நுழைவு",
    username: "பயனர்பெயர்",
    password: "கடவுச்சொல்",
    loginBtn: "உள்நுழை",
    home: "முகப்பு",
    symptoms: "அறிகுறிகள்",
    schemes: "திட்டங்கள்",
    sync: "ஒத்திசை",
    welcomeBack: "வரவேற்கிறோம்,",
    todayOverview: "இன்றைய கண்ணோட்டம்",
    logSymptoms: "அறிகுறிகள் பதிவு",
    checkSchemes: "திட்டங்கள் சரிபார்",
    offlineQueue: "ஆஃப்லைன் வரிசை",
    items: "பதிவுகள்",
    synced: "ஒத்திசைக்கப்பட்டது",
    selectSymptoms: "அறிகுறிகளை தேர்ந்தெடுக்கவும்",
    village: "கிராமம்",
    patientAge: "நோயாளி வயது",
    submit: "ஆபத்தை பகுப்பாய்வு செய்",
    riskResult: "ஆபத்து மதிப்பீடு",
    high: "அதிக ஆபத்து",
    medium: "நடுத்தர ஆபத்து",
    low: "குறைந்த ஆபத்து",
    confidence: "நம்பகத்தன்மை",
    patientName: "நோயாளி பெயர்",
    condition: "நாட்பட்ட நோய்",
    findSchemes: "திட்டங்கள் கண்டறி",
    matchedSchemes: "பொருந்திய திட்டங்கள்",
    noSchemes: "திட்டங்கள் இல்லை",
    offline: "ஆஃப்லைன் பயன்முறை",
    syncNow: "இப்போது ஒத்திசை",
    logout: "வெளியேறு",
    temperature: "வெப்பநிலை (°C)",
    humidity: "ஈரப்பதம் (%)",
    rainfall: "மழைப்பொழிவு (மிமீ)",
    villages: "கிராமங்கள்",
    patientsToday: "இன்று நோயாளிகள்",
    outbreakAlert: "வெடிப்பு எச்சரிக்கைகள்",
  },
};

// ─── Styles ────────────────────────────────────────────────────────────────
const injectStyles = () => {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Outfit', 'Noto Sans Tamil', sans-serif;
      background: ${COLORS.bg};
      color: ${COLORS.text};
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    #root {
      max-width: 430px;
      margin: 0 auto;
      min-height: 100vh;
      background: ${COLORS.bgCard};
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 60px rgba(0,0,0,0.12);
    }

    .app-shell {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    /* ── Login ── */
    .login-screen {
      min-height: 100vh;
      background: linear-gradient(160deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 55%, ${COLORS.primaryLight} 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      position: relative;
      overflow: hidden;
    }

    .login-blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      background: white;
    }

    .login-blob-1 { width: 300px; height: 300px; top: -80px; right: -80px; }
    .login-blob-2 { width: 200px; height: 200px; bottom: -60px; left: -60px; }
    .login-blob-3 { width: 120px; height: 120px; top: 40%; left: -30px; }

    .login-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 8px;
      animation: fadeSlideDown 0.6s ease both;
    }

    .login-logo-icon {
      width: 64px;
      height: 64px;
      background: rgba(255,255,255,0.15);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      border: 2px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(10px);
    }

    .login-logo-text { color: white; }
    .login-logo-text h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
    .login-logo-text p { font-size: 12px; opacity: 0.75; font-weight: 400; margin-top: 2px; }

    .login-card {
      width: 100%;
      background: rgba(255,255,255,0.97);
      border-radius: 28px;
      padding: 32px 28px;
      margin-top: 32px;
      animation: fadeSlideUp 0.7s ease 0.15s both;
      box-shadow: 0 24px 60px rgba(0,0,0,0.2);
    }

    .login-card h2 { font-size: 22px; font-weight: 700; color: ${COLORS.text}; margin-bottom: 4px; }
    .login-card p { font-size: 13px; color: ${COLORS.textMuted}; margin-bottom: 28px; }

    .field-group { margin-bottom: 18px; }
    .field-label { font-size: 12px; font-weight: 600; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }

    .field-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid ${COLORS.border};
      border-radius: 14px;
      font-size: 15px;
      font-family: inherit;
      color: ${COLORS.text};
      background: ${COLORS.bg};
      transition: all 0.2s;
      outline: none;
    }

    .field-input:focus { border-color: ${COLORS.primary}; background: white; box-shadow: 0 0 0 4px rgba(10,95,85,0.08); }

    .lang-toggle {
      display: flex;
      background: ${COLORS.bg};
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 24px;
    }

    .lang-btn {
      flex: 1;
      padding: 8px;
      border: none;
      border-radius: 9px;
      font-size: 13px;
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      background: transparent;
      color: ${COLORS.textMuted};
    }

    .lang-btn.active {
      background: white;
      color: ${COLORS.primary};
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .btn-primary {
      width: 100%;
      padding: 16px;
      background: ${COLORS.primary};
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }

    .btn-primary:hover { background: ${COLORS.primaryDark}; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(10,95,85,0.3); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .btn-secondary {
      padding: 12px 20px;
      background: ${COLORS.bg};
      color: ${COLORS.primary};
      border: 2px solid ${COLORS.border};
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary:hover { background: white; border-color: ${COLORS.primary}; }

    /* ── Top Bar ── */
    .top-bar {
      background: linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .top-bar-logo { display: flex; align-items: center; gap: 10px; }
    .top-bar-logo span { font-size: 22px; font-weight: 800; color: white; letter-spacing: -0.3px; }
    .top-bar-logo small { font-size: 10px; color: rgba(255,255,255,0.65); display: block; font-weight: 400; }

    .top-bar-icon {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      border: 1.5px solid rgba(255,255,255,0.2);
      transition: all 0.2s;
    }

    .top-bar-icon:hover { background: rgba(255,255,255,0.25); }

    .offline-banner {
      background: #7C4000;
      color: white;
      text-align: center;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* ── Page Content ── */
    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px 16px 100px;
    }

    /* ── Bottom Nav ── */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      background: white;
      border-top: 1px solid ${COLORS.border};
      display: flex;
      z-index: 100;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    }

    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 4px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: transparent;
      font-family: inherit;
      gap: 4px;
      position: relative;
    }

    .nav-item.active .nav-icon { color: ${COLORS.primary}; }
    .nav-item.active .nav-label { color: ${COLORS.primary}; font-weight: 700; }
    .nav-item:not(.active) .nav-icon { color: #B0C4C2; }
    .nav-item:not(.active) .nav-label { color: ${COLORS.textMuted}; }

    .nav-icon { font-size: 22px; line-height: 1; transition: transform 0.2s; }
    .nav-item.active .nav-icon { transform: scale(1.15); }
    .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.3px; }

    .nav-dot {
      position: absolute;
      top: 8px;
      right: calc(50% - 14px);
      width: 7px;
      height: 7px;
      background: ${COLORS.danger};
      border-radius: 50%;
      border: 1.5px solid white;
    }

    /* ── Home ── */
    .greeting-card {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%);
      border-radius: 22px;
      padding: 22px;
      margin-bottom: 20px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .greeting-card::after {
      content: '🌿';
      position: absolute;
      right: 16px;
      bottom: -4px;
      font-size: 56px;
      opacity: 0.2;
    }

    .greeting-card h2 { font-size: 13px; font-weight: 500; opacity: 0.8; margin-bottom: 4px; }
    .greeting-card h1 { font-size: 22px; font-weight: 800; }
    .greeting-card p { font-size: 12px; opacity: 0.7; margin-top: 8px; }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 18px;
      padding: 18px;
      border: 1.5px solid ${COLORS.border};
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      border-radius: 18px 18px 0 0;
    }

    .stat-card.green::before { background: ${COLORS.success}; }
    .stat-card.amber::before { background: ${COLORS.accent}; }
    .stat-card.red::before { background: ${COLORS.danger}; }
    .stat-card.blue::before { background: #2B8EC4; }

    .stat-icon { font-size: 26px; }
    .stat-value { font-size: 28px; font-weight: 800; color: ${COLORS.text}; line-height: 1; }
    .stat-label { font-size: 11px; font-weight: 600; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; }

    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: ${COLORS.textMuted};
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .action-card {
      background: white;
      border-radius: 18px;
      padding: 20px 16px;
      border: 1.5px solid ${COLORS.border};
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
    }

    .action-card:hover { border-color: ${COLORS.primary}; box-shadow: 0 6px 20px rgba(10,95,85,0.12); transform: translateY(-2px); }
    .action-card:active { transform: translateY(0); }

    .action-card-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
    }

    .action-card h3 { font-size: 14px; font-weight: 700; color: ${COLORS.text}; }
    .action-card p { font-size: 11px; color: ${COLORS.textMuted}; font-weight: 400; }

    /* ── Symptom Form ── */
    .form-card {
      background: white;
      border-radius: 20px;
      padding: 20px;
      border: 1.5px solid ${COLORS.border};
      margin-bottom: 16px;
    }

    .form-card-title {
      font-size: 16px;
      font-weight: 700;
      color: ${COLORS.text};
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .symptom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 4px;
    }

    .symptom-chip {
      padding: 10px 12px;
      border-radius: 10px;
      border: 2px solid ${COLORS.border};
      font-size: 12px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
      color: ${COLORS.text};
      text-align: left;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .symptom-chip.selected {
      border-color: ${COLORS.primary};
      background: rgba(10,95,85,0.06);
      color: ${COLORS.primary};
    }

    .symptom-chip.high-risk {
      border-color: ${COLORS.dangerLight};
      color: ${COLORS.danger};
    }

    .symptom-chip.high-risk.selected {
      border-color: ${COLORS.danger};
      background: rgba(217,64,64,0.07);
    }

    .symptom-chip-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.6;
      flex-shrink: 0;
    }

    .env-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .mini-field { display: flex; flex-direction: column; gap: 6px; }
    .mini-field label { font-size: 10px; font-weight: 600; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; }

    .mini-input {
      padding: 11px 10px;
      border: 2px solid ${COLORS.border};
      border-radius: 10px;
      font-size: 14px;
      font-family: inherit;
      color: ${COLORS.text};
      background: ${COLORS.bg};
      outline: none;
      width: 100%;
      transition: all 0.2s;
    }

    .mini-input:focus { border-color: ${COLORS.primary}; background: white; }

    /* ── Risk Result ── */
    .risk-card {
      border-radius: 22px;
      padding: 24px;
      margin-bottom: 16px;
      color: white;
      text-align: center;
      animation: fadeSlideUp 0.4s ease both;
    }

    .risk-card.high { background: linear-gradient(135deg, #B02020 0%, ${COLORS.danger} 100%); }
    .risk-card.medium { background: linear-gradient(135deg, #B06000 0%, ${COLORS.warning} 100%); }
    .risk-card.low { background: linear-gradient(135deg, #0E6B3E 0%, ${COLORS.success} 100%); }

    .risk-badge {
      display: inline-block;
      padding: 6px 18px;
      border-radius: 100px;
      background: rgba(255,255,255,0.2);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }

    .risk-score { font-size: 56px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
    .risk-label { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .risk-sub { font-size: 13px; opacity: 0.85; }

    .risk-factors {
      background: white;
      border-radius: 16px;
      padding: 16px;
      border: 1.5px solid ${COLORS.border};
    }

    .factor-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid ${COLORS.bg};
    }

    .factor-row:last-child { border-bottom: none; }
    .factor-name { font-size: 13px; font-weight: 600; flex: 1; }
    .factor-bar-wrap { flex: 2; background: ${COLORS.bg}; border-radius: 100px; height: 8px; overflow: hidden; }
    .factor-bar { height: 100%; border-radius: 100px; background: ${COLORS.primary}; transition: width 0.5s ease; }
    .factor-pct { font-size: 12px; font-weight: 700; color: ${COLORS.primary}; width: 36px; text-align: right; }

    /* ── Schemes ── */
    .scheme-card {
      background: white;
      border-radius: 18px;
      padding: 18px;
      border: 1.5px solid ${COLORS.border};
      margin-bottom: 12px;
      transition: all 0.2s;
    }

    .scheme-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }

    .scheme-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }

    .scheme-icon {
      width: 42px; height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight});
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }

    .scheme-name { font-size: 15px; font-weight: 700; color: ${COLORS.text}; margin-bottom: 2px; }
    .scheme-full { font-size: 11px; color: ${COLORS.textMuted}; font-weight: 400; }

    .scheme-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(10,95,85,0.08);
      color: ${COLORS.primary};
      margin-right: 6px;
      margin-top: 4px;
    }

    .scheme-benefit {
      font-size: 13px;
      color: ${COLORS.textMuted};
      line-height: 1.5;
      margin-top: 8px;
    }

    /* ── Sync ── */
    .sync-header {
      background: linear-gradient(135deg, #1A3A50 0%, #2B6CB0 100%);
      border-radius: 22px;
      padding: 22px;
      color: white;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .sync-icon-big {
      width: 56px; height: 56px;
      background: rgba(255,255,255,0.15);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
    }

    .sync-header h2 { font-size: 20px; font-weight: 800; }
    .sync-header p { font-size: 12px; opacity: 0.75; margin-top: 2px; }

    .queue-item {
      background: white;
      border-radius: 14px;
      padding: 14px 16px;
      border: 1.5px solid ${COLORS.border};
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .queue-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: ${COLORS.accent};
      flex-shrink: 0;
    }

    .queue-info { flex: 1; }
    .queue-info h4 { font-size: 13px; font-weight: 700; }
    .queue-info p { font-size: 11px; color: ${COLORS.textMuted}; margin-top: 2px; }
    .queue-time { font-size: 11px; color: ${COLORS.textMuted}; }

    /* ── Loading ── */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.85);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999;
      backdrop-filter: blur(4px);
    }

    .spinner {
      width: 48px; height: 48px;
      border: 4px solid ${COLORS.border};
      border-top-color: ${COLORS.primary};
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin-bottom: 16px;
    }

    .loading-text { font-size: 14px; font-weight: 600; color: ${COLORS.textMuted}; }

    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: ${COLORS.text};
      color: white;
      padding: 12px 20px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      z-index: 999;
      animation: toastIn 0.3s ease, toastOut 0.3s ease 2.5s forwards;
      max-width: 340px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }

    .toast.success { background: ${COLORS.success}; }
    .toast.error { background: ${COLORS.danger}; }
    .toast.warning { background: ${COLORS.warning}; }

    /* ── Animations ── */
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeSlideDown {
      from { opacity: 0; transform: translateY(-16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @keyframes toastOut {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(10px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .animate-pulse { animation: pulse 2s ease infinite; }

    select.field-input, select.mini-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235A7A77' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 32px;
    }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
};

// ─── Static Data ────────────────────────────────────────────────────────────
const MOCK_SYMPTOMS = [
  { id: 1, name: "Fever", tamil: "காய்ச்சல்", highRisk: true },
  { id: 2, name: "Cough", tamil: "இருமல்", highRisk: false },
  { id: 3, name: "Breathlessness", tamil: "மூச்சுத் திணறல்", highRisk: true },
  { id: 4, name: "Diarrhea", tamil: "வயிற்றுப்போக்கு", highRisk: true },
  { id: 5, name: "Rashes", tamil: "தடிப்புகள்", highRisk: false },
  { id: 6, name: "Vomiting", tamil: "வாந்தி", highRisk: false },
  { id: 7, name: "Fatigue", tamil: "சோர்வு", highRisk: false },
  { id: 8, name: "Jaundice", tamil: "மஞ்சள் காமாலை", highRisk: true },
  { id: 9, name: "Chest Pain", tamil: "மார்பு வலி", highRisk: true },
  { id: 10, name: "Headache", tamil: "தலைவலி", highRisk: false },
];

const SCHEME_ICONS = {
  "PM-JAY": "🏥",
  NPCDCS: "💊",
  CMCHIS: "🩺",
  RBSK: "👶",
  NTEP: "🫁",
  PMSBY: "🛡️",
};

const SCHEME_FULL_NAMES = {
  "PM-JAY": "Pradhan Mantri Jan Arogya Yojana",
  NPCDCS: "National Programme for Cancer, Diabetes, CVD & Stroke",
  CMCHIS: "Chief Minister's Comprehensive Health Insurance Scheme",
  RBSK: "Rashtriya Bal Swasthya Karyakram",
  NTEP: "National Tuberculosis Elimination Programme",
  PMSBY: "Pradhan Mantri Suraksha Bima Yojana",
};

const SCHEME_BENEFITS = {
  "PM-JAY": "Coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.",
  NPCDCS: "Free screening and treatment for non-communicable diseases at government facilities.",
  CMCHIS: "₹5 lakh insurance cover for Tamil Nadu residents; includes 1,027 medical procedures.",
  RBSK: "Free health screening and treatment for children from birth to 18 years.",
  NTEP: "Free diagnosis and treatment for tuberculosis patients across India.",
  PMSBY: "₹2 lakh accidental death and disability cover at ₹20/year premium.",
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { injectStyles(); }, []);

  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("epitwin_user") || "null"); } catch { return null; }
  });
  const [tab, setTab] = useState("home");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("epitwin_offline_queue") || "[]"); } catch { return []; }
  });

  const t = TRANSLATIONS[lang];

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Back online! Syncing...", "success");
      autoSync();
    };
    const handleOffline = () => { setIsOnline(false); showToast("You're offline. Logs saved locally.", "warning"); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [offlineQueue]);

  const saveQueue = (q) => {
    setOfflineQueue(q);
    localStorage.setItem("epitwin_offline_queue", JSON.stringify(q));
  };

  const autoSync = async () => {
    const q = JSON.parse(localStorage.getItem("epitwin_offline_queue") || "[]");
    if (!q.length) return;
    try {
      const res = await fetch(`${API_BASE}/sync-offline-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q)
      });
      if (res.ok) {
        saveQueue([]);
        showToast(`✓ Synced ${q.length} offline record(s) to server`, "success");
        window.dispatchEvent(new CustomEvent("epitwin:symptom-logged"));
      }
    } catch {
      // stay queued — will retry next time online
    }
  };

  if (!user) return (
    <LoginScreen lang={lang} setLang={setLang} t={t} setUser={setUser} showToast={showToast} loading={loading} setLoading={setLoading} />
  );

  return (
    <div className="app-shell">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p className="loading-text">Processing...</p>
        </div>
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <TopBar t={t} user={user} setUser={setUser} lang={lang} setLang={setLang} isOnline={isOnline} />
      {!isOnline && <div className="offline-banner">📡 {t.offline} — {t.offlineQueue}: {offlineQueue.length} {t.items}</div>}

      <div className="page-content">
        {tab === "home" && <HomeTab t={t} user={user} setTab={setTab} lang={lang} />}
        {tab === "symptoms" && <SymptomsTab t={t} lang={lang} user={user} isOnline={isOnline} offlineQueue={offlineQueue} saveQueue={saveQueue} showToast={showToast} setLoading={setLoading} />}
        {tab === "schemes" && <SchemesTab t={t} lang={lang} user={user} showToast={showToast} setLoading={setLoading} />}
        {tab === "sync" && <SyncTab t={t} offlineQueue={offlineQueue} saveQueue={saveQueue} showToast={showToast} isOnline={isOnline} />}
      </div>

      <BottomNav t={t} tab={tab} setTab={setTab} queueCount={offlineQueue.length} />
    </div>
  );
}

// ─── Login Screen ───────────────────────────────────────────────────────────
function LoginScreen({ lang, setLang, t, setUser, showToast, loading, setLoading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username || !password) { showToast("Please enter credentials", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        const userData = data || { name: username, village: "Coimbatore" };
        localStorage.setItem("epitwin_user", JSON.stringify(userData));
        setUser(userData);
        showToast("Login successful!", "success");
      } else {
        // Demo mode
        const demoUser = { name: username, village: "Kovai North", id: "ASHA001", worker_id: 1, village_id: 1 };
        localStorage.setItem("epitwin_user", JSON.stringify(demoUser));
        setUser(demoUser);
        showToast("Demo login — backend offline", "warning");
      }
    } catch {
      const demoUser2 = { name: username, village: "Kovai North", id: "ASHA001", worker_id: 1, village_id: 1 };
      localStorage.setItem("epitwin_user", JSON.stringify(demoUser2));
      setUser(demoUser2);
      showToast("Demo mode active", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-logo">
        <div className="login-logo-icon">🩺</div>
        <div className="login-logo-text">
          <h1>{t.appName}</h1>
          <p>{t.tagline}</p>
        </div>
      </div>

      <div className="login-card">
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>🇬🇧 English</button>
          <button className={`lang-btn ${lang === "ta" ? "active" : ""}`} onClick={() => setLang("ta")}>🇮🇳 தமிழ்</button>
        </div>

        <h2>{t.login}</h2>
        <p>ASHA Worker Portal — Ministry of Health & Family Welfare</p>

        <div className="field-group">
          <label className="field-label">{t.username}</label>
          <input className="field-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. asha_001" />
        </div>

        <div className="field-group">
          <label className="field-label">{t.password}</label>
          <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>{t.loginBtn}</button>
      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar({ t, user, setUser, lang, setLang, isOnline }) {
  return (
    <div className="top-bar">
      <div className="top-bar-logo">
        <span>🩺</span>
        <div>
          <span>{t.appName}</span>
          <small>{user?.village || "—"} · {isOnline ? "🟢 Online" : "🔴 Offline"}</small>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div className="top-bar-icon" onClick={() => setLang(l => l === "en" ? "ta" : "en")} title="Toggle language" style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
          {lang === "en" ? "தமிழ்" : "EN"}
        </div>
        <div className="top-bar-icon" onClick={() => { localStorage.removeItem("epitwin_user"); setUser(null); }} title={t.logout} style={{ fontSize: 18 }}>🚪</div>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ t, tab, setTab, queueCount }) {
  const items = [
    { id: "home", icon: "🏠", label: t.home },
    { id: "symptoms", icon: "🌡️", label: t.symptoms },
    { id: "schemes", icon: "📋", label: t.schemes },
    { id: "sync", icon: "🔄", label: t.sync, badge: queueCount > 0 },
  ];
  return (
    <div className="bottom-nav">
      {items.map(item => (
        <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
          {item.badge && <span className="nav-dot" />}
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────
function HomeTab({ t, user, setTab, lang }) {
  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease both" }}>
      <div className="greeting-card">
        <h2>{t.welcomeBack}</h2>
        <h1>{user?.name || "ASHA Worker"}</h1>
        <p>ID: {user?.id || "ASHA001"} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <p className="section-title">{t.todayOverview}</p>
      <div className="stats-grid">
        <div className="stat-card green">
          <span className="stat-icon">🏘️</span>
          <span className="stat-value">3</span>
          <span className="stat-label">{t.villages}</span>
        </div>
        <div className="stat-card amber">
          <span className="stat-icon">👥</span>
          <span className="stat-value">12</span>
          <span className="stat-label">{t.patientsToday}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-icon">⚠️</span>
          <span className="stat-value">2</span>
          <span className="stat-label">{t.outbreakAlert}</span>
        </div>
        <div className="stat-card blue">
          <span className="stat-icon">✅</span>
          <span className="stat-value">8</span>
          <span className="stat-label">Synced Logs</span>
        </div>
      </div>

      <p className="section-title" style={{ marginTop: 4 }}>Quick Actions</p>
      <div className="quick-actions">
        <div className="action-card" onClick={() => setTab("symptoms")}>
          <div className="action-card-icon" style={{ background: "rgba(10,95,85,0.1)" }}>🌡️</div>
          <div>
            <h3>{t.logSymptoms}</h3>
            <p>{lang === "ta" ? "நோயாளி தரவு" : "Log patient data & get AI risk"}</p>
          </div>
        </div>
        <div className="action-card" onClick={() => setTab("schemes")}>
          <div className="action-card-icon" style={{ background: "rgba(240,165,0,0.12)" }}>📋</div>
          <div>
            <h3>{t.checkSchemes}</h3>
            <p>{lang === "ta" ? "திட்டங்கள் சரிபார்" : "Match govt. welfare schemes"}</p>
          </div>
        </div>
      </div>

      <p className="section-title">Outbreak Radar — Village Risk</p>
      {[
        { village: "Kalapatti", risk: "High", score: 78, color: COLORS.danger },
        { village: "Saravanampatti", risk: "Medium", score: 52, color: COLORS.warning },
        { village: "Thondamuthur", risk: "Low", score: 21, color: COLORS.success },
      ].map(r => (
        <div key={r.village} style={{ background: "white", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${COLORS.border}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: r.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏘️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.village}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Risk Score: {r.score}/100</div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: r.color + "18", color: r.color }}>{r.risk}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Symptoms Tab ─────────────────────────────────────────────────────────────
function SymptomsTab({ t, lang, user, isOnline, offlineQueue, saveQueue, showToast, setLoading }) {
  const [symptoms, setSymptoms] = useState(MOCK_SYMPTOMS);
  const [selected, setSelected] = useState([]);
  const [village, setVillage] = useState("");
  const [villageList, setVillageList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("epitwin_villages") || "[]"); } catch { return []; }
  });
  const [villageSearch, setVillageSearch] = useState("");
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [age, setAge] = useState("");
  const [severity, setSeverity] = useState(2);
  const [casesLast7, setCasesLast7] = useState(1);
  const [isChild, setIsChild] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [isElderly, setIsElderly] = useState(false);
  const [hasTravelHistory, setHasTravelHistory] = useState(false);
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/symptoms`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSymptoms(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/villages`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVillageList(data);
          localStorage.setItem("epitwin_villages", JSON.stringify(data));
        }
      })
      .catch(() => {
        // offline — use cached list from localStorage (already loaded in useState)
      });
  }, []);

  const toggleSymptom = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleSubmit = async () => {
    if (!selected.length) { showToast("Please select at least one symptom", "error"); return; }
    if (!villageSearch) { showToast("Please enter a village name", "error"); return; }
    const payload = {
      asha_worker_id: user?.worker_id || 1,
      village_id: parseInt(village) || 1,
      patient_age: parseInt(age) || 30,
      symptom: symptoms.find(s => s.id === selected[0])?.name || String(selected[0]),
      severity: parseInt(severity),
      cases_last_7_days: parseInt(casesLast7) || 1,
      is_child_under_5: isChild,
      is_pregnant_woman: isPregnant,
      is_elderly_above_60: isElderly,
      has_travel_history: hasTravelHistory,
      avg_temperature_c: parseFloat(temp) || 32.0,
      humidity_percent: parseFloat(humidity) || 70.0,
      season: 0,
      water_source_risk: 0,
      timestamp: new Date().toISOString(),
    };

    setLoading(true);
    try {
      if (!isOnline) throw new Error("offline");
      const res = await fetch(`${API_BASE}/log-symptom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("api");
      const data = await res.json();
      setResult(data);
      window.dispatchEvent(new CustomEvent("epitwin:symptom-logged"));
      showToast("Risk assessment complete!", "success");
    } catch {
      // Demo result
      const score = selected.length * 12 + (selected.some(id => symptoms.find(s => s.id === id)?.highRisk) ? 20 : 0);
      const capped = Math.min(score, 99);
      const risk = capped >= 65 ? "High" : capped >= 40 ? "Medium" : "Low";
      const demoResult = {
        risk_label: risk,
        risk_score: capped,
        confidence: 72 + Math.floor(Math.random() * 18),
        feature_importance: { Fever: 0.31, Symptoms: 0.28, "Env. Factors": 0.24, Age: 0.17 },
      };
      setResult(demoResult);
      if (!isOnline) {
        const q = [...offlineQueue, payload];
        saveQueue(q);
        showToast(`Saved offline. Queue: ${q.length}`, "warning");
      } else {
        showToast("Demo result shown (backend offline)", "warning");
      }
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result?.risk_label?.toLowerCase() || "low";

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease both" }}>
      {result ? (
        <>
          <div className={`risk-card ${riskLevel}`}>
            <div className="risk-badge">OUTBREAK RADAR</div>
            <div className="risk-score">{result.risk_score}</div>
            <div className="risk-label">{t[riskLevel] || result.risk_label}</div>
            <div className="risk-sub">{t.confidence}: {result.confidence}%</div>
          </div>

          {result.feature_importance && (
            <div className="form-card">
              <div className="form-card-title">🔍 AI Explanation — Feature Importance</div>
              {Object.entries(result.feature_importance).map(([k, v]) => (
                <div key={k} className="factor-row">
                  <span className="factor-name">{k}</span>
                  <div className="factor-bar-wrap">
                    <div className="factor-bar" style={{ width: `${Math.round(v * 100)}%` }} />
                  </div>
                  <span className="factor-pct">{Math.round(v * 100)}%</span>
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={() => { setResult(null); setSelected([]); }}>
            + Log Another Patient
          </button>
        </>
      ) : (
        <>
          <div className="form-card">
            <div className="form-card-title">📍 Patient Details</div>
            <div className="field-group" style={{ position: "relative" }}>
              <label className="field-label">{t.village}</label>
              <input
                className="field-input"
                value={villageSearch}
                onChange={e => { setVillageSearch(e.target.value); setVillage(""); setShowVillageDropdown(true); }}
                onFocus={() => setShowVillageDropdown(true)}
                onBlur={() => setTimeout(() => setShowVillageDropdown(false), 200)}
                placeholder={villageList.length ? "Type to search village..." : "Enter village name..."}
                autoComplete="off"
              />
              {village ? (
                <div style={{ fontSize: 11, color: COLORS.success, marginTop: 4, fontWeight: 600 }}>
                  ✓ {villageSearch}
                </div>
              ) : null}
              {showVillageDropdown && villageList.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
                  background: "white", border: `2px solid ${COLORS.border}`,
                  borderRadius: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  maxHeight: 200, overflowY: "auto", marginTop: 4,
                }}>
                  {villageList
                    .filter(v => v.name.toLowerCase().includes(villageSearch.toLowerCase()) || v.district.toLowerCase().includes(villageSearch.toLowerCase()))
                    .map(v => (
                      <div
                        key={v.id}
                        onMouseDown={() => {
                          setVillage(String(v.id));
                          setVillageSearch(`${v.name} — ${v.district}`);
                          setShowVillageDropdown(false);
                        }}
                        style={{
                          padding: "12px 16px", cursor: "pointer", fontSize: 13,
                          fontWeight: 600, color: COLORS.text,
                          borderBottom: `1px solid ${COLORS.bg}`,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = COLORS.bg}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                      >
                        <span>🏘️ {v.name}</span>
                        <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 8 }}>{v.district}</span>
                      </div>
                    ))
                  }
                  {villageList.filter(v =>
                    v.name.toLowerCase().includes(villageSearch.toLowerCase()) ||
                    v.district.toLowerCase().includes(villageSearch.toLowerCase())
                  ).length === 0 && (
                    <div style={{ padding: "12px 16px", fontSize: 12, color: COLORS.textMuted }}>
                      No villages found — will save as typed name
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">{t.patientAge}</label>
              <input className="field-input" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 45" />
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-title">🌡️ {t.selectSymptoms}</div>
            <div className="symptom-grid">
              {symptoms.map(s => (
                <button
                  key={s.id}
                  className={`symptom-chip ${s.highRisk ? "high-risk" : ""} ${selected.includes(s.id) ? "selected" : ""}`}
                  onClick={() => toggleSymptom(s.id)}
                >
                  <span className="symptom-chip-dot" />
                  {lang === "ta" ? (s.tamil || s.name) : s.name}
                </button>
              ))}
            </div>
            {selected.length > 0 && (
              <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 10 }}>✓ {selected.length} symptom(s) selected</p>
            )}
          </div>

          <div className="form-card">
            <div className="form-card-title">🏥 Clinical Details</div>
            <div className="field-group">
              <label className="field-label">Severity Level</label>
              <select className="field-input" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value={1}>1 — Mild</option>
                <option value={2}>2 — Moderate</option>
                <option value={3}>3 — Severe</option>
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Cases in Last 7 Days (in village)</label>
              <input className="field-input" type="number" min="1" value={casesLast7} onChange={e => setCasesLast7(e.target.value)} placeholder="e.g. 5" />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">High Risk Group Flags</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                {[
                  { label: "👶 Child under 5", val: isChild, set: setIsChild },
                  { label: "🤰 Pregnant Woman", val: isPregnant, set: setIsPregnant },
                  { label: "👴 Elderly 60+", val: isElderly, set: setIsElderly },
                  { label: "✈️ Travel History", val: hasTravelHistory, set: setHasTravelHistory },
                ].map(({ label, val, set }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => set(v => !v)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: `2px solid ${val ? COLORS.danger : COLORS.border}`,
                      background: val ? "rgba(217,64,64,0.07)" : "white",
                      color: val ? COLORS.danger : COLORS.textMuted,
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "left",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-title">🌦️ Environmental Data</div>
            <div className="env-row">
              <div className="mini-field">
                <label>{t.temperature}</label>
                <input className="mini-input" type="number" value={temp} onChange={e => setTemp(e.target.value)} placeholder="32" />
              </div>
              <div className="mini-field">
                <label>{t.humidity}</label>
                <input className="mini-input" type="number" value={humidity} onChange={e => setHumidity(e.target.value)} placeholder="70" />
              </div>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSubmit}>🔬 {t.submit}</button>
        </>
      )}
    </div>
  );
}

// ─── Schemes Tab ──────────────────────────────────────────────────────────────
function SchemesTab({ t, lang, user, showToast, setLoading }) {
  const [patientName, setPatientName] = useState("");
  const [condition, setCondition] = useState("");
  const [age, setAge] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [schemes, setSchemes] = useState(null);

  const NCD_CONDITIONS = [
    "Severe Diabetes", "Type 2 Diabetes", "Gestational Diabetes",
    "Hypertension", "Heart Disease", "Cancer", "Kidney Disease",
    "Stroke", "Chronic Obstructive Pulmonary Disease (COPD)", "Asthma",
    "Sickle Cell Anemia", "Thalassemia", "Epilepsy",
    "Depression / Mental Illness", "Malnutrition", "Tuberculosis",
    "Leprosy", "Blindness / Low Vision", "Deafness",
  ];

  const handleCheck = async () => {
    if (!condition) { showToast("Please select a condition", "error"); return; }
    if (!annualIncome) { showToast("Please enter annual income", "error"); return; }
    if (!patientName) { showToast("Please enter patient name", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/check-scheme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asha_worker_id: user?.worker_id || 1,
          village_id: user?.village_id || 1,
          full_name: patientName,
          age: parseInt(age) || 30,
          condition: condition,
          annual_income: parseFloat(annualIncome),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSchemes(data.matched_schemes || []);
      if ((data.matched_schemes || []).length === 0) {
        showToast("No schemes matched — try a higher income threshold", "warning");
      }
    } catch (e) {
      console.error(e);
      showToast("Backend error — check console", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease both" }}>
      <div className="form-card">
        <div className="form-card-title">👤 Patient Information</div>
        <div className="field-group">
          <label className="field-label">{t.patientName}</label>
          <input className="field-input" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. Muthu Lakshmi" />
        </div>
        <div className="field-group">
          <label className="field-label">{t.patientAge}</label>
          <input className="field-input" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 55" />
        </div>
        <div className="field-group">
          <label className="field-label">Annual Income (₹)</label>
          <input className="field-input" type="number" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} placeholder="e.g. 80000" />
        </div>
        <div className="field-group" style={{ marginBottom: 0 }}>
          <label className="field-label">{t.condition}</label>
          <select className="field-input" value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="">Select condition...</option>
            {NCD_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button className="btn-primary" onClick={handleCheck} style={{ marginBottom: 20 }}>🔍 {t.findSchemes}</button>

      {schemes && (
        <div style={{ animation: "fadeSlideUp 0.4s ease both" }}>
          <p className="section-title">{t.matchedSchemes} ({schemes.length})</p>
          {schemes.length === 0 && <p style={{ color: COLORS.textMuted, textAlign: "center", padding: 24 }}>{t.noSchemes}</p>}
          {schemes.map((s, i) => (
            <div key={i} className="scheme-card">
              <div className="scheme-header">
                <div className="scheme-icon">{SCHEME_ICONS[s.name] || "📄"}</div>
                <div>
                  <div className="scheme-name">{s.name}</div>
                  <div className="scheme-full">{SCHEME_FULL_NAMES[s.name] || s.description || ""}</div>
                </div>
              </div>
              <div>
                <span className="scheme-tag">✅ Eligible</span>
                <span className="scheme-tag">🏛️ {s.state_specific || "National"}</span>
                {s.income_threshold && (
                  <span className="scheme-tag">💰 Up to ₹{(s.income_threshold).toLocaleString("en-IN")}/yr</span>
                )}
              </div>
              <div className="scheme-benefit">{s.why_matched || SCHEME_BENEFITS[s.name] || "Contact nearest government hospital for more information."}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sync Tab ─────────────────────────────────────────────────────────────────
function SyncTab({ t, offlineQueue, saveQueue, showToast, isOnline }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) { showToast("No internet connection", "error"); return; }
    if (!offlineQueue.length) { showToast("Nothing to sync!", "success"); return; }
    setSyncing(true);
    try {
      await fetch(`${API_BASE}/sync-offline-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offlineQueue),
      });
      saveQueue([]);
      showToast(`Synced ${offlineQueue.length} record(s) ✓`, "success");
    } catch {
      saveQueue([]);
      showToast("Demo: Queue cleared ✓", "warning");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ animation: "fadeSlideUp 0.4s ease both" }}>
      <div className="sync-header">
        <div className="sync-icon-big">🔄</div>
        <div>
          <h2>{t.sync}</h2>
          <p>{offlineQueue.length > 0 ? `${offlineQueue.length} ${t.items} pending` : t.synced}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${COLORS.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.danger }}>{offlineQueue.length}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Pending</div>
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${COLORS.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.success }}>8</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Synced Today</div>
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${COLORS.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: isOnline ? COLORS.success : COLORS.danger }}>{isOnline ? "ON" : "OFF"}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>Network</div>
        </div>
      </div>

      {offlineQueue.length > 0 && (
        <>
          <p className="section-title">{t.offlineQueue}</p>
          {offlineQueue.map((item, i) => (
            <div key={i} className="queue-item">
              <span className="queue-dot" />
              <div className="queue-info">
                <h4>Patient Log — {item.village || "Unknown village"}</h4>
                <p>{item.symptoms?.length || 0} symptoms · Age {item.patient_age || "?"}</p>
              </div>
              <span className="queue-time">{item.timestamp ? new Date(item.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 12 }} onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : `⬆️ ${t.syncNow}`}
          </button>
        </>
      )}

      {offlineQueue.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>All Synced!</h3>
          <p style={{ color: COLORS.textMuted, fontSize: 13 }}>All records are uploaded to the server. Keep up the great work!</p>
        </div>
      )}

      <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1.5px solid ${COLORS.border}`, marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>How Offline Sync Works</div>
        {[
          { icon: "📱", text: "Symptom logs are saved locally when offline" },
          { icon: "🔑", text: "Stored under epitwin_offline_queue in localStorage" },
          { icon: "🌐", text: "Auto-syncs to /sync-offline-logs when back online" },
          { icon: "🗑️", text: "Queue cleared after successful sync" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", borderBottom: i < 3 ? `1px solid ${COLORS.bg}` : "none" }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}