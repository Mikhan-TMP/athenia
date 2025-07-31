'use client';
import { AnimatedBackground } from "@/components/animated-background";
import { LoginForm } from "@/components/login-form";
// import { SignUpModal } from "@/components/signup-modal";


import { useState } from "react";
export default function Home() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  return (
  <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm onShowSignUp={() => setShowSignUpModal(true)} />
        </div>
      </div>

      {/* <SignUpModal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} /> */}
    </div>
  )
}

