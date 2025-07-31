"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { MapPin, Phone, Clock, ExternalLink, BookOpen, Users, Wifi } from "lucide-react"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null)

const libraries = [
    {
    id: "1",
    name: "Central Library",
    address: "123 Main Street, Downtown",
    phone: "(555) 123-4567",
    hours: "Mon-Fri: 9AM-8PM, Sat-Sun: 10AM-6PM",
    features: ["Free WiFi", "Study Rooms", "Computer Lab", "Children's Section"],
    },
    {
    id: "2",
    name: "Westside Branch",
    address: "456 Oak Avenue, Westside",
    phone: "(555) 234-5678",
    hours: "Mon-Fri: 10AM-7PM, Sat: 9AM-5PM, Sun: Closed",
    features: ["Free WiFi", "Meeting Rooms", "Teen Zone", "Local History"],
    },
    {
    id: "3",
    name: "University Library",
    address: "789 College Drive, Campus",
    phone: "(555) 345-6789",
    hours: "24/7 during semester, Limited hours during breaks",
    features: ["24/7 Access", "Research Support", "Group Study", "Digital Archives"],
    },
]

return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
        </div>
        <DialogTitle className="text-2xl font-bold">Get Your Library Card</DialogTitle>
        <DialogDescription className="text-slate-300 text-lg">
            To access the full AI Librarian experience, you'll need to register at your local library branch. Choose a
            location below to get started!
        </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
            {/* Benefits Section */}
            <div className="
                bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm
                bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-slate-700">
                <div className="p-6 " >
                <h3 className="text-xl font-semibold mb-4 text-center">What You'll Get</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                        <BookOpen className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="font-medium">Full AI Access</h4>
                    <p className="text-sm text-slate-300">Unlimited conversations with our AI librarian</p>
                    </div>
                    <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="font-medium">Personalized Service</h4>
                    <p className="text-sm text-slate-300">Recommendations based on your interests</p>
                    </div>
                    <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                        <Wifi className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="font-medium">Digital Resources</h4>
                    <p className="text-sm text-slate-300">Access to e-books, databases, and more</p>
                    </div>
                </div>
                </div>
            </div>

          {/* Library Locations */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Choose Your Library Branch</h3>
                <div className="grid gap-4">
                    {libraries.map((library) => (
                    <div
                        key={library.id}
                        className={`
                        bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm
                        cursor-pointer transition-all duration-200 border-2 ${
                        selectedLibrary === library.id
                            ? "border-orange-400 bg-orange-500/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                        }`}
                        onClick={() => setSelectedLibrary(library.id)}
                    >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white">{library.name}</h4>
                                <div className="flex items-center space-x-2 text-slate-300 mt-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{library.address}</span>
                                </div>
                            </div>
                            {selectedLibrary === library.id && (
                                <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-slate-300">
                                <Phone className="w-4 h-4" />
                                <span>{library.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-slate-300">
                                <Clock className="w-4 h-4" />
                                <span>{library.hours}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-slate-400 mb-2">Available Features:</p>
                            <div className="flex flex-wrap gap-2">
                                {library.features.map((feature, index) => (
                                <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                                    {feature}
                                </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    onClick={onClose}
                    className=" text-sm
                        sm:h-8 sm:rounded-md sm:gap-1.5 sm:px-3 sm:has-[>svg]:px-2.5
                        lg:h-10 lg:rounded-md px-6 lg:has-[>svg]:px-4
                        cursor-pointer transition-all duration-200
                        h-9 px-4 py-2 has-[>svg]:px-3
                        border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50
                        w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 bg-transparent"
                >
                    Maybe Later
                </button>
                <button
                    disabled={!selectedLibrary}
                    className={`
                                sm:h-8 sm:rounded-md sm:gap-1.5 sm:px-3 sm:has-[>svg]:px-2.5
                                lg:h-10 lg:rounded-md px-6 lg:has-[>svg]:px-4
                                cursor-pointer transition-all duration-200
                                inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive
                                w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50
                                bg-primary text-primary-foreground shadow-xs hover:bg-primary/90
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                                `}
                    onClick={() => {
                        if (selectedLibrary) {
                        const library = libraries.find((l) => l.id === selectedLibrary)
                        console.log("Selected library:", library)
                        }
                    }}
                >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Selected Library
                </button>

            {/* Additional Info */}
            <div className="text-center text-sm text-slate-400 border-t border-slate-700 pt-4">
                <p>
                Registration is free and typically takes just a few minutes. Bring a valid ID and proof of address to get
                started.
                </p>
            </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
