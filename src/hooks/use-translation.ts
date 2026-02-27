
'use client';

import { useState, useEffect } from 'react';

export type Language = 'es' | 'hn';

const translations = {
  es: {
    dashboard: "Panel de Control",
    monitoring: "Monitoreo",
    diagnosis: "Diagnóstico IA",
    community: "Comunidad",
    farms: "Fincas",
    settings: "Configuración",
    welcome: "Bienvenido",
    farmer: "Agricultor",
    iot_station: "Estación IoT",
    soil_humidity: "Humedad Suelo",
    humidity_air: "Hum. Aire",
    air_temp: "Temperatura",
    dew_point: "Punto Rocío",
    evapotranspiration: "Evapotransp. (ET)",
    risk_analysis: "Análisis de Riesgo",
    community_network: "Red Comunitaria",
    radar_active: "RADAR ACTIVO",
    hands_free: "Dictar Síntomas",
    get_solution: "OBTENER SOLUCIÓN",
    recent_alerts: "Alertas Recientes",
    report_outbreak: "Reportar Brote",
    risk_prediction: "Predicción de Riesgo",
    recommended_action: "Acción Recomendada",
    analyze_ai: "Analizar con IA",
    online: "En Línea",
    offline: "Desconectado",
    status: "Estado",
    sync: "Sincronizado",
    health_history: "Historial de Salud",
    sensor_data: "Dato del Sensor",
    change_lang: "Cambiar a Hñähñu",
    logout: "Salir",
    live: "Vivo",
    today: "Hoy",
    week: "Semana",
    download_report: "Descargar Reporte",
    sensor_analytics: "Analítica de Sensores",
    crop_history: "Historial de Cultivo",
    measured_params: "Monitoreo de 5 parámetros en tiempo real.",
    no_anomalies: "No se han registrado anomalías.",
    digital_diagnosis: "Diagnóstico Digital",
    pest_identifier: "Identificador de Plagas",
    diagnosis_prompt: "Usa tu cámara o **dicta por voz** los síntomas para una respuesta rápida.",
    upload_photo: "Sube una foto del daño",
    describe_dictate: "Describe o dicta el problema",
    dictate_symptoms: "Dictar Síntomas",
    listening: "Escuchando...",
    obtaining_solution: "OBTENER SOLUCIÓN",
    placeholder_symptoms: "Ej: Colonias blancas algodonosas en las hojas...",
    new_query: "Nueva Consulta",
    report_outbreak_btn: "Reportar Brote",
    precision_diagnosis: "Diagnóstico de Precisión",
    severity: "Severidad",
    confidence: "Confianza",
    actions: "Acciones",
    buy: "Compra",
    bio: "Bio",
    near_stores: "Ver Tiendas Cercanas",
    online_quote: "Cotizar Online",
    ingredients: "Ingredientes:",
    instructions: "Instrucciones:",
    fallback_mode: "MODO RESPALDO",
    voice_captured: "Voz capturada",
    voice_captured_desc: "Hemos añadido lo que dijiste al formulario.",
    not_compatible: "No compatible",
    not_compatible_desc: "Tu navegador no soporta reconocimiento de voz.",
    missing_data: "Faltan datos",
    missing_data_desc: "Sube una foto o dicta los síntomas."
  },
  hn: {
    dashboard: "Ñut’i Ja’i",
    monitoring: "Hyandi",
    diagnosis: "Pa̱di IA",
    community: "Munthe",
    farms: "B’o̱za",
    settings: "Xo̱fo",
    welcome: "Xi’ño",
    farmer: "’Yomfeni",
    iot_station: "M’u̱i IoT",
    soil_humidity: "De’mthe Hoi",
    humidity_air: "De’mthe Ndähi",
    air_temp: "Pa",
    dew_point: "N’yu Dehe",
    evapotranspiration: "Hño Dehe",
    risk_analysis: "Hyandi n’u",
    community_network: "M’u̱i Munthe",
    radar_active: "SU’U",
    hands_free: "Ma̱ hñä",
    get_solution: "HYANDI XI’ÑO",
    recent_alerts: "Hyandi xi’ño",
    report_outbreak: "Ma̱ n’u",
    risk_prediction: "Hyandi n’u n’e",
    recommended_action: "Hahni ja’i",
    analyze_ai: "Pa̱di ko IA",
    online: "Ja nthe",
    offline: "Hotho",
    status: "M’u̱i",
    sync: "Hyandi",
    health_history: "M’u̱i b’o̱za",
    sensor_data: "Dato IoT",
    change_lang: "Mpengi ja Español",
    logout: "Poni",
    live: "Ja nthe",
    today: "Na’ya",
    week: "N’onda",
    download_report: "Xo̱fo Reporte",
    sensor_analytics: "Analítica IoT",
    crop_history: "M’u̱i b’o̱za",
    measured_params: "Hyandi 5 parámetros ja nthe.",
    no_anomalies: "Hotho n’u ja ya.",
    digital_diagnosis: "Pa̱di Digital",
    pest_identifier: "Pa̱di Plagas",
    diagnosis_prompt: "Hyandi ko ya cámara o **ma̱ hñä** pa da hñeti xi’ño.",
    upload_photo: "Xo̱fo n’a ya foto",
    describe_dictate: "Ma̱ hñä ya n’u",
    dictate_symptoms: "Ma̱ hñä",
    listening: "Hyandi...",
    obtaining_solution: "HYANDI XI’ÑO",
    placeholder_symptoms: "N’udi: Ya n’u ja ya xi...",
    new_query: "Hño hyandi",
    report_outbreak_btn: "Ma̱ n’u",
    precision_diagnosis: "Pa̱di xi’ño",
    severity: "N’u",
    confidence: "Hño",
    actions: "Hahni",
    buy: "Pa̱",
    bio: "Hño",
    near_stores: "Hyandi ya tienda",
    online_quote: "Pa̱ ja nthe",
    ingredients: "Ya hño:",
    instructions: "Hahni:",
    fallback_mode: "RESPALDO",
    voice_captured: "Hñä captured",
    voice_captured_desc: "Ja hño hñä.",
    not_compatible: "Hotho compatible",
    not_compatible_desc: "Navegador hotho hñä.",
    missing_data: "Hotho datos",
    missing_data_desc: "Xo̱fo foto o ma̱ hñä."
  }
};

export function useTranslation() {
  const [lang, setLang] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'es' ? 'hn' : 'es';
    setLang(next);
    localStorage.setItem('app_lang', next);
  };

  const t = (key: keyof typeof translations['es']) => {
    return translations[lang][key] || translations['es'][key];
  };

  return { t, lang, toggleLanguage };
}
