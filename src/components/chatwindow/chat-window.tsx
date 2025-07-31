"use client";

import { useRef, useEffect, useState } from "react";
import { PanelLeftIcon, SendIcon, User2Icon, MicIcon, Settings, CrossIcon, SidebarCloseIcon, CircleX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
// Dummy Book Data
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

export default function ChatWindow({ onSidebarToggle, sidebarOpen }: { onSidebarToggle: () => void, sidebarOpen: boolean }) {
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 1;
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const kohaAPI = process.env.NEXT_PUBLIC_KOHA_URL;
    const kohaUsername = process.env.NEXT_PUBLIC_KOHA_USERNAME;
    const kohaPassword = process.env.NEXT_PUBLIC_KOHA_PASSWORD;
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    type ChatMessage =
        | { type: "ai"; message: string }
        | { type: "user"; message: string }
        | { type: "booksearch" | "recommendation" | "lookup"; 
            message: string;
            books: Array<{
            title: string;
            author: string;
            copyright_date : number;
            publisher: string;
            isbn: string;
            quantity_available: number;
        }> };

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [booksPages, setBooksPages] = useState<{ [idx: number]: number }>({}); // key: chat idx, value: page
    const reminders = {
        reminder1: "Try to be as specific as possible in your queries.",
        reminder2: "Search for books by title, author, or ISBN number.",
        reminder3: "Don't be afraid to ask for recommendations."
    }

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

        setChatHistory((prev) => [...prev, { type: "user", message }]);
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch(`${backendUrl}/api/query/query_router`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: message })
            });
            const data = await res.json();
            const formattedAnswer = formatAnswer(data.response[0].answer);
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
            if (["booksearch", "recommendation", "lookup"].includes(responseType)) {
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
            setChatHistory((prev) => [
            ...prev,
            { type: "ai", message: "Network error. Please try again." }
            ]);
        }
        setLoading(false);
    };

    const totalPages = Math.ceil(books.length / booksPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const currentBooks = books.slice(
        (currentPage - 1) * booksPerPage,
        currentPage * booksPerPage
    );
    async function handleMoreInfo(title: string) {
        setModalLoading(true);
        setModalError(null);
        setModalOpen(true);

        try {
            const queryJson = JSON.stringify({ "title": { "-like": `%${title}%` } });
            const encodedQuery = encodeURIComponent(queryJson);
            const url = `${kohaAPI}/api/v1/biblios?q=${encodedQuery}`;
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
            console.log("Book details response:", data[0]);

            if (!data) {
                setModalError("No details found for this book.");
                setModalData(null);
            } else {
                setModalData(data[0]); // show the first matching result
            }
        } catch (err: any) {
            setModalError("Could not load book details.");
            setModalData(null);
        }
        setModalLoading(false);
    }

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    return (
        <div className="flex shrink-0 items-center flex-col h-screen w-full">
            {/* Header */}
            <div className="flex w-full h-25 items-center justify-between select-none border-b border-white/10 px-4 bg-gradient-to-r from-slate-800/40 via-blue-900/30 to-slate-800/40 backdrop-blur-lg">
                <div className="flex justify-start items-center gap-2">
                    <PanelLeftIcon
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={onSidebarToggle}
                    />
                    <div className="border-l border-white/50 h-5 mx-2" />
                        <img
                        src="/Athenia2.png"
                        alt="Athenia Profile Image"
                        className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                        />
                    <div className="flex flex-col justify-start ">
                        <h1 className="text-xl font-bold text-white ">
                            Athenia
                        </h1>
                        <span className="text-xs text-orange-500">AI Chat Assistant</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 px-4">
                    <img 
                        src="/User.png"
                        alt="User"
                        className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                    />
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
                        <img
                            src="/Athenia2.png"
                            alt="Athenia Avatar"
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
                    <div key={idx} className="flex w-full justify-end text-wrap gap-3 p-4">
                    <div className="p-5 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white shadow-orange-500/20">
                        <p>{item.message}</p>
                    </div>
                    <div>
                        <img 
                            src="/User.png"
                            alt="User"
                            className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                        />
                    </div>
                    </div>
                );
                } else if (item.type === "ai") {
                return (
                    <div key={idx} className="flex w-full justify-start text-wrap gap-3 p-4">
                        <div>
                            <img
                            src="/Athenia2.png"
                            alt="Avatar"
                            className="w-10 h-10  bg-white cursor-pointer rounded-full ring-2 ring-white/30"
                            />
                        </div>
                        <div className="p-5 max-w-[80%] rounded-lg space-y-4 bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-white border border-slate-500/30 backdrop-blur-sm shadow-slate-900/20">
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
                                <img
                                src="/Athenia2.png"
                                alt="Avatar"
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
                            copyright_date: number;
                            publisher: string;
                            isbn: string;
                            quantity_available: number;
                        }, bIdx: number) => (

                        <div key={bIdx} className="flex w-full justify-start text-wrap gap-3 p-4">
                            <div>
                                <img 
                                    src="/Athenia2.png"
                                    alt="AI Avatar"
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
                                {/* Book details as before, but use book.quantity_available */}
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
                                    <span className="font-semibold text-[rgb(255,255,255)]">{book.copyright_date}</span>
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
                                </div>
                                <div className="flex gap-4">
                                    <button className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-medium text-sm">
                                        📚 Reserve Book
                                    </button>
                                    <button
                                        className="cursor-pointer flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium text-sm"
                                        onClick={() => handleMoreInfo(book.title)}
                                        >
                                    🧾 More Info
                                    </button>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex flex-wrap gap-2 items-center mt-1   justify-between">
                                    <div>
                                        <button className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md">
                                            Show All
                                        </button>
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
                        <img
                        src="/Athenia2.png"
                        alt="Avatar"
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



            {/* Reminders */}
            {/* {reminders && (
                <div className="w-full flex flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center pt-3 px-1">
                    <div className=" cursor-pointer select-none z-11 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-yellow-200 dark:hover:bg-yellow-800 transform hover:scale-105">
                        <p className="text-xs font-semibold">
                            {}
                        </p>
                    </div>
                    <div className=" cursor-pointer select-none z-11 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-yellow-200 dark:hover:bg-yellow-800 transform hover:scale-105">
                        <p className="text-xs font-semibold">
                            Warning - Anton is not working.
                        </p>
                    </div>
                    <div className=" cursor-pointer select-none z-11 bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-yellow-200 dark:hover:bg-yellow-800 transform hover:scale-105">
                        <p className="text-xs font-semibold">
                            Warning - Anton is not working.
                        </p>
                    </div>
                </div>
            )} */}



            {/* Chat Input */}
            <div className="w-full flex justify-center pb-8 pt-2">
                <div className="
                    flex items-center
                    bg-[rgba(24,28,44,0.88)]
                    shadow-lg
                    rounded-2xl
                    px-3
                    py-2
                    gap-2
                    max-w-2xl
                    border border-slate-800/40
                    backdrop-blur-sm
                    lg:w-full
                    w-3/4
                ">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="
                            flex-1
                            bg-transparent
                            border-none
                            outline-none
                            text-base
                            px-3
                            py-3
                            text-white
                            placeholder:text-slate-400
                            font-medium
                        "
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <AnimatePresence mode="wait" initial={false}>
                        {!message.trim() ? (
                            <motion.button
                                key="mic"
                                className="
                                    w-11 h-11
                                    flex items-center justify-center
                                    bg-white/10 hover:bg-blue-500/90
                                    text-blue-400 hover:text-white
                                    rounded-full
                                    transition-all
                                    shadow
                                    focus:outline-none focus:ring-2 focus:ring-blue-400
                                "
                                onClick={() => {
                                    // TODO: Add mic/voice recognition logic here
                                    alert("Voice input coming soon!");
                                }}
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
                            <motion.button
                                key="send"
                                className="
                                    w-11 h-11
                                    flex items-center justify-center
                                    bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500
                                    hover:from-orange-600 hover:to-orange-600
                                    text-white
                                    rounded-full
                                    transition-all
                                    shadow
                                    focus:outline-none focus:ring-2 focus:ring-orange-400
                                "
                                onClick={handleSend}
                                type="button"
                                aria-label="Send message"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.22 }}
                                disabled={loading}
                            >
                                <SendIcon style={{ width: 22, height: 22 }} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" style={{ backdropFilter: "blur(2px)" }}>
                <div className=" relative bg-gradient-to-br from-slate-800 via-blue-900/90 to-slate-700 p-8 rounded-2xl max-w-xl md-w-full p-5 shadow-2xl ring-1 ring-slate-700/50 text-white border border-orange-400/30">
                    <button className="cursor-pointer absolute top-3 right-3 text-slate-400 hover:text-orange-500 text-xl font-bold"
                        onClick={() => setModalOpen(false)}
                    >
                        <CircleX style={{ width: 24, height: 24 }} />
                    </button>

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
                ) : modalError ? (
                    <div className="text-center py-10 text-red-400 font-semibold text-lg">
                    {modalError}
                    </div>
                ) : modalData ? (
                    <div>
                    <h2 className="text-3xl font-bold mb-2 leading-tight text-orange-400 drop-shadow">
                        {modalData.title || "Untitled"}
                    </h2>
                    <div className="mb-6 text-slate-200 italic text-base">
                        {modalData.subtitle}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 text-base">
                        <div>
                        <span className="text-slate-400">Author:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.author || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Year:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.copyright_date || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Publisher:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.publisher || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Publication Place:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.publication_place || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">ISBN:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.isbn || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Biblio ID:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.biblio_id || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Item Type:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.item_type || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Series Title:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.series_title || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Edition:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.edition_statement || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Collection Title:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.collection_title || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Notes:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.notes || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Abstract:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.abstract || "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Availability:</span>
                        <span className="ml-2 text-green-300 font-semibold">
                            {modalData.quantity_available ?? "—"}
                        </span>
                        </div>
                        <div>
                        <span className="text-slate-400">Created:</span>
                        <span className="ml-2 text-slate-100 font-semibold">
                            {modalData.creation_date?.slice(0,10) || "—"}
                        </span>
                        </div>
                        {/* You can continue for other fields as needed */}
                    </div>

                    {/* Divider */}
                    <div className="mt-6 border-t border-slate-600/50 pt-4 text-slate-400 text-xs">
                        <span>Biblio record last updated: {modalData.timestamp?.replace("T", " ").replace("+08:00", "") || "—"}</span>
                    </div>
                    </div>
                ) : null}
                </div>
            </div>
            )}

        </div>
    );
}
