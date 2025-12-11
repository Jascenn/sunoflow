'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary, Locale, DictionaryKey } from '@/lib/i18n/locales';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: DictionaryKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        // Load persisted locale on client side
        const savedLocale = localStorage.getItem('sunoflow-locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('sunoflow-locale', newLocale);
    };

    const t = (key: DictionaryKey): string => {
        return dictionary[locale][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
