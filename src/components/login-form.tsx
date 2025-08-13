'use client'; 

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Lock, CreditCard, Eye, EyeOff, BookOpen, Shield } from "lucide-react"
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import { useRouter } from 'next/navigation';


type guestProps = {
  setIsGuest: (value: boolean) => void;
};

export function LoginForm({ setIsGuest }: guestProps) {
    const [cardNumber, setCardNumber] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<{ cardNumber?: string; password?: string }>({})
    const [isLoading, setIsLoading] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const kohaAPI = process.env.NEXT_PUBLIC_KOHA_URL;
    const kohaUsername = process.env.NEXT_PUBLIC_KOHA_USERNAME;
    const kohaPassword = process.env.NEXT_PUBLIC_KOHA_PASSWORD;
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const newErrors: { cardNumber?: string; password?: string } = {}

        if (cardNumber && cardNumber.length < 8) {
        newErrors.cardNumber = "Card number must be at least 8 characters"
        } else if (cardNumber && !/^\d+$/.test(cardNumber)) {
        newErrors.cardNumber = "Card number must contain only numbers"
        }

        if (password && password.length < 6) {
        newErrors.password = "Password must be at least 6 characters"
        }

        setErrors(newErrors)
    }, [cardNumber, password])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!cardNumber || !password) {
            setError("Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

            const response = await axios.post(
                `${kohaAPI}/api/v1/auth/password/validation`,
                {
                    identifier: cardNumber,
                    password: password
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": basicAuth,
                        "ngrok-skip-browser-warning": "true", // Uncomment if using ngrok
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log("Login successful", response.data);
                handleToast("Login successful!", "success");

                // Save cardNumber to local storage
                const data = response.data as { cardnumber: string, patron_id: number, userid: string };
                localStorage.setItem("cardNumber", data.cardnumber);
                localStorage.setItem("patron_id", String(data.patron_id));
                localStorage.setItem("username", String(data.userid));
                localStorage.setItem("isGuest", "false");


                
                setIsLoading(true);


                //direct to the chatwindow
                router.push('/chat-window');
            } else {
                handleToast("Incorrect username or password. Please try again.", "error");
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error("Login error:", error?.response);

            const apiMsg =
                // error?.response?.data?.error ||
                // error?.response?.data?.message ||
                "Login failed. Please check your credentials.";
            handleToast(apiMsg, "error");
            setIsLoading(false);

        }
    };

    const handleGuestLogin = () => {
        handleToast("Continuing as guest. Limited access.", "info");
        // in 2 seconds, direct to the chatwindow
        setTimeout(() => {
            // destroy the localstorage
            localStorage.removeItem("cardNumber");
            localStorage.removeItem("patron_id");
            localStorage.setItem("isGuest", "true");
            // global variable isGuest is set to true
            setIsGuest(true);
            router.push('/chat-window');
        }, 2000);
    }
    const handleForgotPassword = async (email: string) => {
        // Handle forgot password logic
        console.log("Password reset requested for:", email)
        setShowForgotPassword(false)
    }
    const handleToast = (message: string, type: "success" | "error" | "info") => {
        if (type === "success") {
            toast.success(message, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (type === "error") {
            toast.error(message, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (type === "info") {
            toast.error(message, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    return (
    <div className="space-y-6 z-10">
        {/* Header */}
        <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Image src="/ChatBot.gif" alt="Logo" width={48} height={48} className="w-12 h-12" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Librarian</h1>
                <p className="text-blue-200 text-lg">Your Digital Knowledge Assistant</p>
                <p className="text-blue-300 text-sm mt-1">Access your personalized library experience</p>
            </div>
        </div>
        {/* Login Card */}
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            {/* Login Header */}
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [@container/card-header].border-b:pb-6 text-center pb-4">
                <h1 className="text-white text-xl leading-none font-semibold">
                    Library Access
                </h1>
                <p className="text-muted-foreground text-sm text-blue-200">
                    Enter your library credentials to continue.
                </p>
            </div>
            {/* Content */}
            <div className="space-y-6 px-6">
                {/* {showForgotPassword ? (
                    <ForgotPasswordForm onSubmit={handleForgotPassword} onCancel={() => setShowForgotPassword(false)} />
                ) : ( */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Card Number Field */}
                    <div className="space-y-2">
                        <label htmlFor="cardNumber" className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-white font-medium">
                            Library Card Number
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                            <input
                                id="cardNumber"
                                type="text"
                                placeholder="Enter your library card number"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className={`text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm 
                                    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
                                    aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
                                    pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-orange-400 focus:ring-orange-400/20 ${
                                    errors.cardNumber && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                                }`}
                                required
                            />

                            {cardNumber && !errors.cardNumber && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
                            )}
                        </div>
                        <p className="text-xs text-blue-300">Usually found on the back of your library card</p>
                        {errors.cardNumber && <p className="text-xs text-red-400">{errors.cardNumber}</p>}
                    </div>
                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-white font-medium">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm 
                                    focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
                                    aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
                                    pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-300 focus:border-orange-400 focus:ring-orange-400/20 ${
                                    errors.password && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                                }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                    </div>
                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="cursor-pointer text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                        >
                            Forgot your password?
                        </button>
                    </div>
                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading || Object.keys(errors).length > 0}
                        className={`
                            sm:h-8 sm:rounded-md sm:gap-1.5 sm:px-3 sm:has-[>svg]:px-2.5
                            lg:h-10 lg:rounded-md px-6 lg:has-[>svg]:px-4
                            cursor-pointer transition-all duration-200
                            inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
                            w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50
                            bg-primary text-primary-foreground shadow-xs hover:bg-primary/90
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                            `}
                    >
                        {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Accessing Library...</span>
                        </div>
                        ) : (
                        <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>Access Library</span>
                        </div>
                        )}
                    </button>
                    {/* Sign Up Link */}
                    <div className="text-center">
                        <span className="text-blue-200 text-sm">{"Don't have a library card? "}</span>
                        <button
                        type="button"
                        // onClick={}
                        className="cursor-pointer text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                        >
                        Get one here
                        </button>
                    </div>
                </form>
                {/* )} */}
                {/* Guest Access */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-transparent text-blue-200">or</span>
                    </div>
                </div>

                <button
                    onClick={handleGuestLogin}
                    className=" text-sm
                    sm:h-8 sm:rounded-md sm:gap-1.5 sm:px-3 sm:has-[>svg]:px-2.5
                    lg:h-10 lg:rounded-md px-6 lg:has-[>svg]:px-4
                    cursor-pointer transition-all duration-200
                    h-9 px-4 py-2 has-[>svg]:px-3
                    border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50
                    w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 bg-transparent"
                >
                    Continue as Guest (Limited Access)
                </button>
            </div>
        </div>
        {/* Security Notice */}
        <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-300 text-xs">
            <Shield className="w-3 h-3" />
            <span>Your library data is protected with enterprise-grade security</span>
            </div>
        </div>
        <ToastContainer/>
    </div>
    )
}

