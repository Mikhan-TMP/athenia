"use client";

import { useRef, useEffect, useState } from "react";
import { SettingsIcon, LogOutIcon, BadgeCheckIcon, PanelLeftIcon, SendIcon, User2Icon, MicIcon, Settings, CrossIcon, SidebarCloseIcon, CircleX, Book, BookIcon, BookOpenText, EllipsisIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
// Import image
import Image from "next/image";


const books = [
    {
        title: "Book Title 1",
        author: "Author Name 1",
        year: 2000,
        publisher: "Publisher Name 1",
        isbn: "1234567890123",
        available: 3,
    }
];
// type isGuestProps = {
//   isGuest: (value: boolean) => void;
// };

type ChatWindowProps = {
    onSidebarToggle: () => void;
    sidebarOpen: boolean;
    // isGuest: boolean;
};



export default function ChatWindow({
        onSidebarToggle,
        sidebarOpen,
        // isGuest,
    }: ChatWindowProps) {

    // Health Check
    const [backendOnline, setBackendOnline] = useState<boolean>(true);

    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 1;

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    // API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const kohaAPI = process.env.NEXT_PUBLIC_KOHA_URL;
    const kohaUsername = process.env.NEXT_PUBLIC_KOHA_USERNAME;
    const kohaPassword = process.env.NEXT_PUBLIC_KOHA_PASSWORD;
    // BOOK DETAILS MODAL
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    // RESERVE BOOK MODAL
    const [reserveModalOpen, setReserveModalOpen] = useState(false);
    const [reserveData, setReserveData] = useState<{ patron_id: number; biblio_id: number; book_title: string } | null>(null);
    const [holdDate, setHoldDate] = useState<string>("");
    const [holdModal, setHoldModal] =  useState<any>(null);
    const [holdModalOpen, setHoldModalOpen] = useState(false);
    const [holdModalLoading, setHoldModalLoading] = useState(false);
    const [holdModalError, setHoldModalError] = useState<string | null>(null);
    // Libraries
    const [libraries, setLibraries] = useState<Array<{ library_id: string; name: string }>>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<string>("");
    // ITEMS
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState<Item[]>([]);
    const [availableCount, setAvailableCount] = useState(0);
    // RECEIPT
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [booksPages, setBooksPages] = useState<{ [idx: number]: number }>({}); 

    //Profile
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    
    // Logout
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);


    //Local State
    const [patronId, setPatronId] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    // Show all modal
    const [showAllModalOpen, setShowAllModalOpen] = useState(false);
    const [showAllBooks, setShowAllBooks] = useState<Array<{
        title: string;
        author: string;
        year: number;
        publisher: string;
        isbn: string;
        quantity_available: number;
        biblio_id: number;
    }> | null>(null);


    //Loading
    const [loadingOpen, setIsLoadingOpen] = useState(false);

    //Router
    const router = useRouter();

    // Item
    type Item = {
        item_id: number;
        [key: string]: any;
    };

    //guest
    const [isGuest, setIsGuest] = useState<boolean>(false);



    // Load the Local Storage Variables.
    useEffect(() => {
        const storedPatronId = localStorage.getItem('patron_id');
        const storedCardNumber = localStorage.getItem('cardNumber');
        const storedUsername = localStorage.getItem('username');
        const guestValue = localStorage.getItem("isGuest") === "true";
        setIsGuest(guestValue);
        setPatronId(storedPatronId);
        setCardNumber(storedCardNumber);
        setUserName(storedUsername);

    }, []);


    type ChatMessage = | { type: "ai"; message: string } | { type: "user"; message: string } | { type: "booksearch" | "recommendation" | "lookup" | "specific_book_search"; 
            message: string;
            books: Array<{
            title: string;
            author: string;
            year : number;
            publisher: string;
            isbn: string;
            quantity_available: number;
            biblio_id: number;
        }> };


    const reminders = {
        reminder1: "Try to be as specific as possible in your queries.",
        reminder2: "Search for books by title, author, or ISBN number.",
        reminder3: "Don't be afraid to ask for recommendations."
    }


    const handleReserve = async () => {
        if (!selectedLibrary){
            handleToast("Please select a pickup library.", "error");
            return
        }
        // if (holdDate === ""){
        //     handleToast("Please select a hold date.", "error");
        //     return
        // }
        if (selectedItem.length === 0){
            handleToast("No available items to reserve.", "error");
            return
        }
        if (localStorage.getItem("patron_id") === null){
            handleToast("Please log in to reserve a book.", "error");
            return
        }
        console.log(holdDate); 

        for (const item of selectedItem) {
            try {
                const url = `${kohaAPI}/api/v1/holds`;
                const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

                //build payload
                const payload = {
                    patron_id: reserveData?.patron_id ?? 0,
                    biblio_id: reserveData?.biblio_id ?? 0,
                    item_id: item.item_id,
                    pickup_library_id: selectedLibrary,
                    // hold_date: holdDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                };

                console.log(payload);
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": basicAuth
                    },
                    body: JSON.stringify({
                        ...payload,
                        // patron_id: reserveData?.patron_id ?? 0,
                        // biblio_id: reserveData?.biblio_id ?? 0,
                        // item_id: item.item_id,
                        // pickup_library_id: selectedLibrary,
                        // hold_date: holdDate ??
                        //     new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    })
                });

                if (response.status === 200 || response.status === 201) {
                    const receipt = await response.json();
                    handleToast("Reservation successful!", "success");
                    setReserveModalOpen(false);
                    setSelectedLibrary("");
                    setAvailableCount(0);
                    setSelectedItem([]);
                    setReceiptData({ ...receipt, patron_id: reserveData?.patron_id ?? 0 });
                    setReceiptModalOpen(true);
                    return;
                } else if (response.status === 403) {
                    try {
                        const errorJson = await response.json();
                        let reason = errorJson?.error || "Reservation failed due to restriction.";
                        if (reason.includes("itemAlreadyOnHold")){
                            reason = "You already have this item on hold.";
                        }
                        else if (reason.includes("tooManyHoldsForThisRecord")){
                            reason = "You are not allowed to have two or more holds for this record.";
                        }
                        handleToast(`Item ${item.item_id} could not be reserved: ${reason}`, "warning");
                        continue;
                    } catch (parseErr) {
                        handleToast(`Item ${item.item_id} could not be reserved (403 Forbidden).`, "warning");
                    }
                } else {
                    handleToast(`Item ${item.item_id} could not be reserved (status: ${response.status}).`, "warning");
                    continue; 
                }
            } catch (error) {
                console.error(`Network error for item ${item.item_id}:`, error);
                continue; 
            }
        }
    };

    const formatAnswer = (answer: string) => {
        const lines = answer.split("\n");
        return lines.map((line, idx) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g); // split by bold tokens
            return (
                <p key={idx}>
                    {parts.map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </p>
            );
        });
    };
    const handleSend = async () => {
        if (loading || !message.trim()) return;
        if (!backendOnline) {
            handleToast("The AI Chatbot is offline. Please try again later.", "error");
            return;
        }
        setChatHistory((prev) => [...prev, { type: "user", message }]);
        setLoading(true);
        setMessage("");
        console.log("cardNumber", cardNumber);


        try {
            const res = await fetch(`${backendUrl}/api/query/query_router`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                query: message,
                sessionId: Date.now() / 1000 | 0,
                cardNumber: cardNumber
            })
            });
            const data = await res.json();
            const responseType = data?.response?.[0]?.type;

            // Handle response types
            console.log(data);

            if (!data.response || data.response.length === 0) {
                // GENERAL CHAT
                setChatHistory((prev) => [
                    ...prev,
                    { 
                        type: "ai", 
                        message: data.answer || "Sorry, I couldn't find an answer to your question." }
                ]);
            }else{
            if (["booksearch", "recommendation", "lookup", "specific_book_search"].includes(responseType)) {
                setChatHistory((prev) => [
                    ...prev,
                    {
                        type: "booksearch",
                        message: data.response[0].answer,
                        books: data.response[0].books
                    }
                ]);
                setBooksPages({}); 
            } else {
                setChatHistory((prev) => [
                    ...prev,
                    {
                        type: "ai",
                        message: "Sorry, I couldn't process your request."
                    }
                ]);
            }

            }
        } catch (err) {
            // console.error(err);
            setChatHistory((prev) => [
            ...prev,
            { type: "ai", message: "Network error. Please try again." }
            ]);
        }
        setLoading(false);
    };
    const totalPages = Math.ceil(books.length / booksPerPage);
    const currentBooks = books.slice(
        (currentPage - 1) * booksPerPage,
        currentPage * booksPerPage
    );
    async function handleMoreInfo(biblio_id: number) {
        setModalLoading(true);
        setModalError(null);
        setModalOpen(true);

        try {
            const url = `${kohaAPI}/api/v1/biblios/${biblio_id}`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": basicAuth,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error(`Error ${res.status}`);
            const data = await res.json();
            console.log("Book details response:", data);

            if (!data) {
                setModalError("No details found for this book.");
                setModalData(null);
            } else {
                setModalData(data); 
            }
        } catch (err: any) {
            setModalError("Could not load book details.");
            setModalData(null);
        }
        setModalLoading(false);
    }

    const handleToast = (message: string, type: "success" | "error" | "warning") => {
        if (type === "success") {
            toast.success(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (type === "error") {
            toast.error(message, {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        else if (type === "warning") {
            toast.warning(message, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const handleProfile = () => {
        if (!localStorage.getItem('cardNumber') || !localStorage.getItem('patron_id')) {
            handleToast("Not logged in. Please login first.", "error");
        } else {
            setIsLoadingOpen(true);
            setTimeout(() => {
                router.push("/profile");
            }, 3000);
        }
    }

    const handleLogOut = () => {
        setLogoutModalOpen(true);
    }

    // SCROLL
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);
    // LIBRARY FETCHING
    useEffect(() => {
        const fetchLibraries = async () => {
            try {
                console.log(kohaAPI, kohaUsername, kohaPassword);

                const url = `${kohaAPI}/api/v1/libraries`;
                const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": basicAuth,
                        'Accept': 'application/json'
                    }
                });
                if (!res.ok) throw new Error(`Error ${res.status}`);
                const data = await res.json();
                console.log(data);
                setLibraries(data);
            } catch (err) {
                console.error("Failed to fetch libraries", err);
            }
        };

        fetchLibraries();
    }, []);
    // ITEMS FETCHING
    useEffect(() => {
        if (!reserveModalOpen) return; 
        const fetchItems = async () => {
            if (reserveModalOpen && reserveData?.biblio_id) {
                try {
                    const url = `${kohaAPI}/api/v1/biblios/${reserveData.biblio_id}/items`;
                    const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                    
                    const res = await fetch(url, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": basicAuth,
                            "Accept": "application/json"
                        }
                    });

                    if (!res.ok) throw new Error(`Error ${res.status}`);
                    
                    const data = await res.json();
                    console.log("items_fetched", data);
                    setItems(data);
                    const available = data.filter((item: Item) => item.checked_out_date === null);
                    setAvailableCount(available.length);
                    // console.log(available.length);
                    // console.log (available);
                    setSelectedItem(available || null);
                } catch (err) {
                    console.error("Failed to fetch items:", err);
                    setItems([]);
                    setAvailableCount(0);
                    setSelectedItem([]);
                }
            }
        };
        fetchItems();
    }, [reserveModalOpen, reserveData?.biblio_id]);
    // // Backend Health Check
    // useEffect(() => {
    //     const checkBackend = async () => {
    //         try {
    //             const res = await fetch(`${backendUrl}/health`, {
    //                 method: 'GET',
    //                 headers: { 'Accept': 'application/json' }
    //             });
    //             const data = await res.json();
    //             setBackendOnline(data.status === "healthy");
    //         } catch {
    //             handleToast("Athenia is offline. Please refresh the page.", "error");
    //             setBackendOnline(false);
    //         }
    //     };
    //     checkBackend();
    //     const interval = setInterval(checkBackend, 10000); 
    //     return () => clearInterval(interval);
    // }, []);
    
    return (
        <div className="flex shrink-0 items-center flex-col h-screen w-full">
            {/* Header */}
            <div className="z-15 flex w-full h-25 items-center justify-between select-none border-b border-white/10 px-4 bg-gradient-to-r from-slate-800/40 via-blue-900/30 to-slate-800/40 backdrop-blur-lg">
                <div className="flex justify-start items-center gap-2">
                    <PanelLeftIcon
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={onSidebarToggle}
                    />
                    {/* <div className="border-l border-white/50 h-5 mx-2" />
                        <img
                        src="/Athenia2.png"
                        alt="Athenia Profile Image"
                        className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                        />
                    <div className="flex flex-col justify-start ">
                        <h1 className="text-xl font-bold text-white ">
                            Athenia
                        </h1>
                        <span className="flex items-center gap-1 text-xs">
                            <span className={`w-2 h-2 rounded-full ${backendOnline ? "bg-green-500" : "bg-red-500"}`}></span>
                            <span className={`${backendOnline ? "text-green-500" : "text-red-500"}`}>
                                {backendOnline ? "Online" : "Offline"}
                            </span>

                        </span>
                    </div> */}
                </div>
                <div className="relative">
                    <div className="flex flex-col gap-1 items-center justify-center border-l border-white/50 h-5 mx-2 px-5">
                        <Image
                            src={isGuest ? "/Default_User.jpg" : "/default-user.webp"}
                            alt="User"
                            width={40}
                            height={40}
                            className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute right-4 top-10 w-64 rounded-xl shadow-lg backdrop-blur-xl bg-[rgba(26,30,44,1)] border border-white/10 text-white ${
                            dropdownOpen ? '' : 'hidden'
                        }`}
                    >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                        <BadgeCheckIcon className="w-5 h-5 text-green-400" />
                        <div className="text-sm">
                            <p className="text-gray-300">Signed in as</p>
                            <p className="font-semibold text-white">{isGuest ? 'Guest' : userName || "N/A"}</p>
                        </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 space-y-1">
                        <a
                            className="flex items-center gap-3 px-5 py-2 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => {handleProfile(); setDropdownOpen(false);}}
                        >
                        <User2Icon className="w-4 h-4 text-white/80" />
                        <span className="text-white r" >My Profile</span>
                        </a>

                        <a
                        href="#"
                        className="flex items-center gap-3 px-5 py-2 text-sm hover:bg-white/10 transition-colors"
                        >
                        <SettingsIcon className="w-4 h-4 text-white/80" />
                        <span className="text-white">Settings</span>
                        </a>

                        <a
                            onClick={() => {handleLogOut(); }}
                            className="flex items-center gap-3 px-5 py-2 text-sm hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                        <LogOutIcon className="w-4 h-4 text-red-400" />
                        <span className="text-red-300">Logout</span>
                        </a>
                    </div>
                    </motion.div>


                </div>
            </div>

            {/* Chats */}
            <div
                ref={chatContainerRef}
                className="h-screen w-full  py-10 px-2 md:px-15 sm:px-10 lg:px-30 z-10 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 140px)" }} 
            >
            {chatHistory.length === 0 && !loading && (
                <div className="flex flex-1 justify-center items-center select-none ">
                    <div className="mx-auto p-8 w-150 rounded-2xl bg-gradient-to-r from-slate-900/50 to-slate-800/50 text-white text-center shadow-lg">
                        <Image
                            src="/Athenia2.png"
                            alt="Athenia Avatar"
                            width={120}
                            height={120}
                            className="mx-auto mb-3 w-30 h-30 rounded-full ring-2 ring-orange-300/50"
                        />
                        <h2 className="text-3xl font-bold text-white drop-shadow">Welcome to AI Ask Librarian!</h2>
                        <p className="text-white/90 text-base">
                            Hi there! I am Athenia, your friendly library assistant.<br />
                            <span className="text-orange-600 font-semibold">Try these:</span>
                        </p>
                        <ul className="text-white/80 text-sm text-center mx-auto ">
                            <li>🔍 <span className="font-medium">Find a book:</span> <span className="italic text-white/90">"Find books by J.K. Rowling"</span></li>
                            <li>📚 <span className="font-medium">Search Book Details:</span> <span className="italic text-white/90">"Search details for The Hobbit"</span></li>
                            <li>❓ <span className="font-medium">Ask anything:</span> <span className="italic text-white/90">"How do I renew a loan?"</span></li>
                        </ul>
                        <div className="pt-2">
                            <span className="text-white/60 text-xs">Powered by AI • Secure & private</span>
                        </div>
                    </div>
                </div>
            )}
            {chatHistory.map((item, idx) => {
                if (item.type === "user") {
                return (

                        <div key={idx} className="flex w-full justify-end items-center text-wrap gap-3 p-4">
                            <div className="p-3 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white shadow-orange-500/20">
                                <p>{item.message}</p>
                            </div>
                            
                            <div>
                                <Image
                                    src={isGuest ? "/Default_User.jpg" : "/default-user.webp"}
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                />
                            </div>
                        </div>

                );
                } else if (item.type === "ai") {
                return (
                    <div key={idx} className="flex w-full justify-start text-wrap gap-3 p-4">
                        <div>
                            <Image
                            src="/Athenia2.png"
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                            />
                        </div>
                        <div className="p-3 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-white border border-slate-500/30 backdrop-blur-sm shadow-slate-900/20">
                            <p>{item.message}</p>
                        </div>
                    </div>
                );
                } else if (item.type === "booksearch") {
                // Pagination logic
                const totalPages = Math.ceil(item.books.length / booksPerPage);
                const booksPage = booksPages[idx] || 1;
                const startIdx = (booksPage - 1) * booksPerPage;
                const currentBooks = item.books.slice(startIdx, startIdx + booksPerPage);

                return (
                    <div key={idx} className="flex flex-col w-[100%] ">
                        {/* GENERAL CHAT */}
                        <div className="flex w-full justify-start text-wrap gap-3 p-4">
                            <div>
                                <Image
                                src="/Athenia2.png"
                                alt="Avatar"
                                width={40}
                                height={40}
                                className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                                />
                            </div>
                            <div className="p-5 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-white border border-slate-500/30 backdrop-blur-sm shadow-slate-900/20">
                            <p>{item.message}</p>
                            </div>
                        </div>
                        {/* BOOKS LIST */}
                        {currentBooks.map((book: {
                            title: string;
                            author: string;
                            year: number;
                            publisher: string;
                            isbn: string;
                            quantity_available: number;
                            biblio_id : number
                        }, bIdx: number) => (

                        <div key={bIdx} className="flex w-full justify-start text-wrap gap-3 p-4">
                            <div>
                                <Image
                                src="/Athenia2.png"
                                alt="Avatar"
                                width={40}
                                height={40}
                                className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                                />
                            </div>

                            <div className="w-full max-w-[80%] lg:max-w-[80%] sm:max-w-[100%] md:max-w-[80%] h-full p-3 sm:p-5 md:p-6 lg:p-7 space-y-4 
                                bg-gradient-to-r from-slate-700/80 to-slate-600/80 
                                text-white 
                                rounded-xl shadow-md 
                                border-l-4 border-orange-500/100
                                backdrop-blur-sm bg-opacity-80 bg-clip-padding
                                hover:shadow-lg transition-shadow duration-300 ">
                                <div className="flex gap-2 h-12 justify-between items-center">
                                    <h1 className="text-sm sm:text-lg lg:text-2xl capitalize font-bold w-3/4 line-clamp-2">
                                        {book.title.length > 60 ? `${book.title.substring(0, 57)}...` : book.title}
                                    </h1>
                                    <span className={`text-sm text-center font-semibold ${book.quantity_available > 0 ? 'bg-green-500' : 'bg-red-400'} text-white px-3 py-1 rounded-full `}>
                                        {book.quantity_available} <span className="hidden  sm:inline md:inline lg:inline">AVAILABLE</span>
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                <div>
                                    <span className="block text-[rgb(255,255,255,0.5)]">Author</span>
                                    <span className="font-semibold text-[rgb(255,255,255)]">{book.author}</span>
                                </div>
                                <div>
                                    <span className="block text-[rgb(255,255,255,0.5)]">Year</span>
                                    <span className="font-semibold text-[rgb(255,255,255)]">{book.year}</span>
                                </div>
                                </div>
                                <div className="border border-gray-200 rounded-md px-4 py-3 bg-gray-50 text-sm">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-gray-500 w-1/2">Publisher</span>
                                        <span className="font-medium text-black w-1/2">{book.publisher}</span>
                                    </div>
                                    <hr className="border-gray-300 w-full my-3" />
                                    <div className="flex justify-between mt-1 gap-2">
                                        <span className="text-gray-500 w-1/2">ISBN</span>
                                        <span className="text-black w-1/2">{book.isbn}</span>
                                    </div>
                                    <hr className="border-gray-300 w-full my-3" />
                                    <div className="flex justify-between mt-1 gap-2">
                                        <span className="text-gray-500 w-1/2">Bilbio ID</span>
                                        <span className="text-black w-1/2">{book.biblio_id}</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-medium text-sm"
                                        onClick={() => {
                                            setReserveData({
                                                // patron_id: localStorage.getItem("patron_id") ? Number(localStorage.getItem("patron_id")) : 0,
                                                patron_id: patronId ? Number(patronId) : 0,
                                                book_title: book.title,
                                                biblio_id: book.biblio_id,
                                            });
                                            setReserveModalOpen(true);
                                        }}
                                    >
                                        📚 Reserve Book
                                    </button>
                                    <button
                                        className="cursor-pointer flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium text-sm"
                                        onClick={() => handleMoreInfo(book.biblio_id)}
                                        >
                                    🧾 More Info
                                    </button>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex flex-wrap gap-2 items-center mt-1   justify-between">
                                    <div>
                                    {/* <button
                                        className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md"
                                            onClick={() => {
                                                setShowAllBooks(item.books);
                                                setShowAllModalOpen(true);
                                            }}
                                        >
                                            Show All
                                    </button> */}
                                    </div>
                                    <div className=" flex items-center gap-2">
                                        <button
                                            className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md disabled:opacity-50"
                                            disabled={booksPage === 1}
                                            onClick={() =>
                                                setBooksPages((prev) => ({
                                                    ...prev,
                                                    [idx]: Math.max(1, (prev[idx] || 1) - 1),
                                                }))
                                            }
                                        >
                                            ←
                                        </button>
                                        <span className="text-sm ">
                                            {booksPage} of {totalPages}
                                        </span>
                                        <button
                                            className=" cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md disabled:opacity-50"
                                            disabled={booksPage === totalPages}
                                            onClick={() =>
                                                setBooksPages((prev) => ({
                                                    ...prev,
                                                    [idx]: Math.min(totalPages, (prev[idx] || 1) + 1),
                                                }))
                                            }
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                        ))}
                    </div>
                );
                }
                return null;
            })}
            {loading && (
                <div className="flex w-full justify-start text-wrap gap-3 p-4 opacity-60">
                    <div>
                        <Image
                        src="/Athenia2.png"
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                        />
                    </div>
                    <div className="p-5 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-white border border-slate-500/30 backdrop-blur-sm shadow-slate-900/20">
                        <div className="flex flex-row gap-2">
                            <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:.7s]"></div>
                            <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:.3s]"></div>
                            <div className="w-1 h-1 rounded-full bg-slate-500 animate-bounce [animation-delay:.7s]"></div>
                        </div>
                    </div>
                </div>
            )}
            </div>

            {/* Chat Input */}
            <div className="w-full flex justify-center pb-8 pt-2">
                <div className="flex items-center bg-[rgba(24,28,44,0.88)] shadow-lg rounded-2xl px-3 py-2 gap-2 max-w-2xl border border-slate-800/40 backdrop-blur-sm lg:w-full w-3/4">
                    <input type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} className=" flex-1 bg-transparent border-none outline-none text-base px-3 py-3 text-white placeholder:text-slate-400 font-medium" onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={loading} />
                    <AnimatePresence mode="wait" initial={false}>
                        {!message.trim() ? (
                            <motion.button key="mic" className=" w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-blue-500/90 text-blue-400 hover:text-white rounded-full transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer " onClick={() => {handleToast("Feature coming soon!", "warning"); }}
                                type="button"
                                aria-label="Start voice input"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.22 }}
                                disabled={loading}
                            >
                                <MicIcon style={{ width: 22, height: 22 }} />
                            </motion.button>
                        ) : (
                            <motion.button key="send" className=" w-11 h-11 flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white rounded-full transition-all shadow focus:outline-none focus:ring-2 focus:ring-orange-400 " onClick={handleSend} type="button" aria-label="Send message" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.22 }} disabled={loading} >
                                <SendIcon style={{ width: 22, height: 22 }} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>



            {/* Book Info Modal */}
            {modalOpen && (
                <div className="z-99 h-screen bg-black/80 w-full absolute ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                        <div className="relative transform overflow-hidden rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-b-none text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                            <div className="w-[100%] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                        <div className="mt-2">
                                            {modalLoading ? (
                                                <div className="animate-pulse flex flex-col items-center gap-4 w-full justify-center">
                                                    <div>
                                                        <div className="w-48 h-6 bg-slate-400 rounded-md"></div>
                                                        <div className="w-28 h-4 bg-slate-400 mx-auto mt-3 rounded-md"></div>
                                                    </div>
                                                    <div className="h-7 bg-slate-400 w-full rounded-md"></div>
                                                    <div className="h-7 bg-slate-400 w-full rounded-md"></div>
                                                    <div className="h-7 bg-slate-400 w-full rounded-md"></div>
                                                    <div className="h-7 bg-slate-400 w-1/2 rounded-md"></div>
                                                </div>
                                            ): modalError ? (
                                                <div className="text-center py-10 text-red-400 font-semibold text-lg">
                                                    {modalError}
                                                </div>
                                            ): modalData ? (
                                                <div className="flex flex-col text-left">
                                                    <div className="flex flex-col ">
                                                        <h3 className="text-2xl font-bold text-orange-400 mb-2 flex items-center gap-2">
                                                            {/* <BookOpenText className="w-auto h-auto text-orange-500" /> */}
                                                            {modalData.title ?? "Unknown"}
                                                        </h3>
                                                        <h5 className="text-md text-white/80">
                                                            by: {modalData.author ?? "Unknown"}
                                                        </h5>
                                                        <h5 className="text-sm text-white/60">
                                                            {modalData.publisher ?? "Unknown"}
                                                        </h5>
                                                    </div>
                                                    <div className="max-h-120 p-3 overflow-y-auto grid grid-cols-1 gap-4 cursor-pointer ">
                                                        <div className="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">\
                                                            <div className="max-h-80 overflow-y-auto flex flex-col justify-between items-center gap-2 mb-2">
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-500">Publication Place:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.publication_place ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-500">Year of Publication:</span>
                                                                    <span className="text-gray-200">{modalData.copyright_date ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">ISBN:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.isbn ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Biblio Id:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.biblio_id ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Item Type:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.item_type ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Series:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.series_title ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Edition:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.edition_statement ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Collection:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.collection_title ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Note:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.notes ?? "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Abstract:</span>
                                                                    <span className="text-gray-200 text-right">{modalData.abstract ?? "-"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="mt-5 text-center text-white/60 italic text-sm">Biblio record last updated: {modalData.timestamp?.replace("T", " ").replace("+08:00", "") || "—"}</span>
                                                </div>
                                                
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    onClick={() => {
                                        setModalOpen(false);
                                        setModalData(null);
                                        setModalError(null);
                                        setModalLoading(false);
                                    }}
                                    className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                    type="button"
                                    >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Reservation Modal */}
            {reserveModalOpen && reserveData && (
                <div className="z-99 h-screen bg-black/80 w-full absolute ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                        <div className="relative transform overflow-hidden rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-b-none text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                            <div className="w-[100%] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                        <div className="mt-2">
                                                <div className="flex flex-col text-left">
                                                    <div className="flex flex-col ">
                                                        <h3 className="text-2xl font-bold text-orange-400 mb-2 flex items-center gap-2">
                                                            <BookOpenText className="w-auto h-auto text-orange-500" />
                                                            <span>Reserve Book</span>
                                                        </h3>
                                                        <p className="text-sm italic text-white/70">
                                                            Reserve a copy of <span className="font-bold text-orange-600">{reserveData.book_title}. </span> Please provide your details below and make sure to select a pickup library.
                                                        </p>
                                                    </div>
                                                    <div className="max-h-120 p-3 overflow-y-auto grid grid-cols-1 gap-4 cursor-pointer ">
                                                        <div className="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 rounded-2xl px-4 shadow-lg hover:shadow-xl transition-shadow duration-200">\
                                                            <div className="max-h-80 overflow-y-auto flex flex-col justify-between items-center gap-2 ">
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Name:</span>
                                                                    <span className="text-gray-200 text-right">{userName ? userName : "Please Login first."}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Patron ID:</span>
                                                                    <span className="text-gray-200 text-right">{reserveData.patron_id ? reserveData.patron_id : "Please Login first."}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Biblio ID:</span>
                                                                    <span className="text-gray-200 text-right">{reserveData.biblio_id ?? "N/A"}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center  w-full ">
                                                                    <span className="font-semibold text-orange-300">Available Copies:</span>
                                                                    <span className="text-gray-200 text-right">
                                                                        {availableCount === 0 || availableCount === null
                                                                            ? "No available items to reserve."
                                                                            : availableCount}
                                                                        </span>
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label htmlFor="library" className="block text-orange-300 mb-2 text-sm">
                                                                        Select Pickup Library:
                                                                    </label>
                                                                    <select
                                                                        id="library"
                                                                        value={selectedLibrary}
                                                                        onChange={(e) => setSelectedLibrary(e.target.value)}
                                                                        className="w-full bg-slate-900 text-white border border-purple-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                    >
                                                                        <option value="" disabled>--</option>
                                                                        {libraries.map((lib) => (
                                                                            <option key={lib.library_id} value={lib.library_id}>
                                                                            {lib.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    onClick={() => {
                                        handleReserve();
                                    }}
                                    className="mb-2 cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                    type="button"
                                    >
                                    Continue
                                </button>
                                <button
                                    onClick={() => {
                                        setReserveModalOpen(false);
                                        setReserveData(null);
                                    }}
                                    className="mb-2 cursor-pointer inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                    type="button"
                                    >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            // <div className="fixed inset-0 z-50 p-5 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            //     <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-800 via-purple-900/90 to-slate-700 text-white rounded-2xl shadow-2xl ring-1 ring-purple-400/30 border border-purple-300/20 p-6 sm:p-8">
            //     {/* Close Button */}
            //     <button onClick={() => setReserveModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer" aria-label="Close">
            //         <CircleX size={24} />
            //     </button>
            //     {/* Header */}
            //     <h2 className="text-3xl font-semibold text-purple-300 mb-6">Reserve Book</h2>
            //     {/* Patron & Biblio Info */}
            //     <div className="space-y-3 mb-4 text-sm sm:text-base">
            //         <div className="flex justify-between">
            //             <span className="text-slate-400">Patron ID:</span>
            //             <span className="text-slate-100 font-medium">
            //             {reserveData.patron_id ? reserveData.patron_id : "Please Login first."}
            //             </span>
            //         </div>
            //         <div className="flex justify-between">
            //             <span className="text-slate-400">Biblio ID:</span>
            //             <span className="text-slate-100 font-medium">{reserveData.biblio_id}</span>
            //         </div>
            //         <div className="flex justify-between">
            //             <span className="text-slate-400">Available Copies:</span>
            //             <span className="text-slate-100 font-medium">
            //             {availableCount === 0 || availableCount === null
            //                 ? "No available items to reserve."
            //                 : availableCount}
            //             </span>
            //         </div>
            //     </div>
            //         {/* Library Selector */}
            //         <div className="mb-2">
            //             <label htmlFor="library" className="block text-slate-400 mb-2 text-sm">
            //             Select Pickup Library:
            //             </label>
            //             <select
            //                 id="library"
            //                 value={selectedLibrary}
            //                 onChange={(e) => setSelectedLibrary(e.target.value)}
            //                 className="w-full bg-slate-900 text-white border border-purple-500 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            //             >
            //                 <option value="">-- Select a Library --</option>
            //                 {libraries.map((lib) => (
            //                     <option key={lib.library_id} value={lib.library_id}>
            //                     {lib.name}
            //                     </option>
            //                 ))}
            //             </select>
            //         </div>
            //         {/* Footer Buttons */}
            //         <div className="flex justify-end gap-3">
            //             <button
            //                 onClick={() => {handleReserve(); }}
            //                 className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition cursor-pointer"
            //             >
            //                 Confirm Reserve
            //             </button>
            //         </div>
            //     </div>
            // </div>
            )}

            {/* Reservation receipt */}
            
            {receiptModalOpen && receiptData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-gradient-to-br from-white via-gray-100 to-white rounded-2xl shadow-2xl border border-gray-300 p-8">
                        {/* Close Button */}
                        <button
                            onClick={() => setReceiptModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <CircleX size={24} />
                        </button>
                        {/* Receipt Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Reservation Receipt</h2>
                            <span className="block text-sm text-gray-500">Thank you for reserving!</span>
                        </div>
                        {/* Receipt Details */}
                        <div className="space-y-4 text-base font-mono">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Patron ID:</span>
                                <span className="font-semibold text-gray-800">{receiptData.patron_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Biblio ID:</span>
                                <span className="font-semibold text-gray-800">{receiptData.biblio_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Item ID:</span>
                                <span className="font-semibold text-gray-800">{receiptData.item_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hold Date:</span>
                                <span className="font-semibold text-gray-800">{receiptData.hold_date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Hold ID:</span>
                                <span className="font-semibold text-gray-800">{receiptData.hold_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Pickup Library:</span>
                                <span className="font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">{receiptData.pickup_library_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Priority:</span>
                                <span className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">{receiptData.priority}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className="font-semibold text-gray-800">{receiptData.status ?? "Pending"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Timestamp:</span>
                                <span className="font-semibold text-gray-800">{receiptData.timestamp?.replace("T", " ").replace("+08:00", "")}</span>
                            </div>
                        </div>
                        {/* Divider */}
                        <div className="mt-6 border-t border-gray-300 pt-4 text-center text-xs text-gray-400">
                            <span>Keep this receipt for your records.</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Logout Modal */}
            {logoutModalOpen && (
                <div className="border absolute h-screen bg-black/50 z-100 w-screen overflow-y-auto">
                    <div
                        className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
                    >
                        <div
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                        >
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                            <div
                                className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                            >
                                <svg
                                aria-hidden="true"
                                stroke="currentColor"
                                stroke-width="1.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-6 w-6 text-red-600"
                                >
                                <path
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                ></path>
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3
                                id="modal-title"
                                className="text-base font-semibold leading-6 text-gray-900"
                                >
                                Logout account
                                </h3>
                                <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to logout your account? All of your
                                    unsaved data will be removed. This action cannot be undone.
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => {
                                    setLogoutModalOpen(false);
                                    setIsLoadingOpen(true);
                                    setTimeout(() => {
                                        localStorage.clear();
                                        // render loading
                                        router.push("/");
                                    }, 5000);
                                }}
                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Logout
                            </button>
                            <button
                            onClick={() => {
                                    setLogoutModalOpen(false);
                                }}
                            className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            type="button"
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>

            )}
            {loadingOpen && (
                <div className="z-999 absolute flex-col gap-4 w-full flex items-center justify-center bg-black/50 h-screen">
                    <div
                        className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full"
                    >
                        <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"
                        ></div>
                    </div>
                </div>
            )}
            {/* Show All Modal */}
            {showAllModalOpen && showAllBooks && (
                <div className="fixed inset-0 z-15 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2">
                    <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800 via-blue-900/90 to-slate-700 text-white  shadow-2xl ring-1 ring-orange-400/30 border border-orange-300/20 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowAllModalOpen(false)}
                            className="fixed top-4 right-4 text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <CircleX size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-orange-300">All Results</h2>
                        {showAllBooks.length === 0 ? (
                            <div className="text-center py-10 text-red-400 font-semibold text-lg">
                                No books found.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {showAllBooks.map((book, bIdx) => (
                                    <div key={bIdx} className="w-full p-4 space-y-3 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-xl shadow-md border-l-4 border-orange-500/100">
                                        <div className="flex gap-2 h-12 justify-between items-center">
                                            <h1 className="text-lg font-bold w-3/4 line-clamp-2">
                                                {book.title.length > 60 ? `${book.title.substring(0, 57)}...` : book.title}
                                            </h1>
                                            <span className={`text-sm text-center font-semibold ${book.quantity_available > 0 ? 'bg-green-500' : 'bg-red-400'} text-white px-3 py-1 rounded-full`}>
                                                {book.quantity_available} AVAILABLE
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-gray-300 text-sm">
                                            <div>
                                                <span className="block text-white/50">Author</span>
                                                <span className="font-semibold">{book.author}</span>
                                            </div>
                                            <div>
                                                <span className="block text-white/50">Year</span>
                                                <span className="font-semibold">{book.year}</span>
                                            </div>
                                        </div>
                                        <div className="border border-gray-200 rounded-md px-4 py-3 bg-gray-50 text-sm text-black">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-gray-500 w-1/2">Publisher</span>
                                                <span className="font-medium w-1/2">{book.publisher}</span>
                                            </div>
                                            <hr className="border-gray-300 w-full my-3" />
                                            <div className="flex justify-between mt-1 gap-2">
                                                <span className="text-gray-500 w-1/2">ISBN</span>
                                                <span className="w-1/2">{book.isbn}</span>
                                            </div>
                                            <hr className="border-gray-300 w-full my-3" />
                                            <div className="flex justify-between mt-1 gap-2">
                                                <span className="text-gray-500 w-1/2">Biblio ID</span>
                                                <span className="w-1/2">{book.biblio_id}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-medium text-sm"
                                                onClick={() => {
                                                    setReserveData({
                                                        // patron_id: localStorage.getItem("patron_id") ? Number(localStorage.getItem("patron_id")) : 0,
                                                        patron_id: patronId ? Number(patronId) : 0,
                                                        book_title: book.title,
                                                        biblio_id: book.biblio_id,
                                                    });
                                                    setReserveModalOpen(true);
                                                    // setShowAllModalOpen(false);
                                                }}
                                            >
                                                📚 Reserve Book
                                            </button>
                                            <button
                                                className="cursor-pointer flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium text-sm"
                                                onClick={() => {
                                                    handleMoreInfo(book.biblio_id);
                                                    // setShowAllModalOpen(false);
                                                }}
                                            >
                                                🧾 More Info
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Toast */}
            <ToastContainer/>

        </div>
    );
}
