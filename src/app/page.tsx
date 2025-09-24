'use client';
import { AnimatedBackground } from "@/components/animated-background";
import { LoginForm } from "@/components/login-form";
// import { SignUpModal } from "@/components/signup-modal";
import { useTranslation } from "react-i18next";

import { useEffect, useState } from "react";
export default function Home() {
  const [isGuest, setIsGuest] = useState(false);
  const { t, i18n } = useTranslation();

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("appLanguage");
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    
  <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 w-full p-3 cursor-pointer">
        {/* Button for change language */}
        <div className="flex justify-end cursor-pointer">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition cursor-pointer"
            onClick={() => {
              const newLocale = i18n.language === 'en' ? 'ja' : 'en';
              i18n.changeLanguage(newLocale);
              localStorage.setItem("appLanguage", newLocale);
            }}
          >
            {t('change_language')}
          </button>
        </div>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm setIsGuest={setIsGuest} />
        </div>
      </div>

      {/* <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} /> */}
    </div>
  )
}

