import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enJSON from "./locales/en.json";
import hiJSON from "./locales/hi.json";
import mrJSON from "./locales/mr.json";

// Try to get language from localStorage if running in browser
const getSavedLanguage = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("language") || "en";
    }
    return "en";
};

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enJSON },
        hi: { translation: hiJSON },
        mr: { translation: mrJSON },
    },
    lng: getSavedLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
