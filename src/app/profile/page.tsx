'use client';
import { CircleAlert, BookAIcon, BookOpen, ArrowLeft, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';


export default function Profile() {
    // API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const kohaAPI = process.env.NEXT_PUBLIC_KOHA_URL;
    const kohaUsername = process.env.NEXT_PUBLIC_KOHA_USERNAME;
    const kohaPassword = process.env.NEXT_PUBLIC_KOHA_PASSWORD;
    const [profile, setProfile] = useState<any>(null);
    const [holds, setHolds] = useState<any>(null);
    const [overdues, setOverDue]  = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);
    const [borrowed, setBorrowedBookDetails] = useState<any[]>([]);
    const [overdueBookdetails, setOverdueBookDetails] = useState<any[]>([]);
    const [borrowedBooks, setBorrowedBooks] = useState<any>(null);
    const [patronId, setPatronId] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState<string | null>(null);
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);



    useEffect(() => {
        const storedPatronId = localStorage.getItem('patron_id');
        const storedCardNumber = localStorage.getItem('cardNumber');
        const storedUsername = localStorage.getItem('username');
        setPatronId(storedPatronId);
        setCardNumber(storedCardNumber);
        setUserName(storedUsername);

    }, []);


    // Fetch profile details on mount
    useEffect(() => {
        console.log(patronId);
            const fetchProfile = async () => {
                try {
                    const url = `${kohaAPI}/api/v1/patrons/${patronId}`;
                    // console.log('url', url);
                    const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                    const res = await fetch(url, {
                        headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                    });

                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    // console.log(data);
                    setProfile(data);
                } catch (err) {
                    console.error("Failed to fetch profile:", err);
                }
            };
        
            const fetchHolds = async () => {
                try {
                    const url = `${kohaAPI}/api/v1/patrons/${patronId}/holds`;
                    const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                    const res = await fetch(url, {
                        headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                    });
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    setHolds(data);
                    console.log("holds", data);

                    // Fetch all book details in parallel using type "biblio"
                    const bookDetails = await Promise.all(
                        data.map(async (hold: any) => {
                            return await fetchBookDetails(hold.biblio_id, "biblio");
                        })
                    );
                    setBooks(bookDetails.filter(Boolean));
                } catch (err) {
                    console.error("Failed to fetch patron holds:", err);
                }
            };

            const fetchUserCheckouts = async () => {
                try {
                    const url = `${kohaAPI}/api/v1/patrons/${patronId}/checkouts`;
                    const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                    const res = await fetch(url, {
                        headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                    });

                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    const data = await res.json();
                    console.log("checkouts", data);
                    setBorrowedBooks(data);

                    const today = new Date();
                    const overdues = data.filter((checkout: any) => {
                        const dueDate = new Date(checkout.due_date);
                        return dueDate < today;
                    });
                    setOverDue(overdues);
                    console.log("overdues", overdues);

                    // Fetch all book details in parallel using type "item"
                    const bookDetails = await Promise.all(
                        data.map(async (checkout: any) => {
                            return await fetchBookDetails(checkout.item_id, "item");
                        })
                    );
                    setBorrowedBookDetails(bookDetails.filter(Boolean)); 

                    //fetch all book details in parallel using type "item" where due_date is past today's date.
                    const overdueBookDetails = await Promise.all(
                        overdues.map(async (checkout: any) => {
                            return await fetchBookDetails(checkout.item_id, "item");
                        })
                    );
                    setOverdueBookDetails(overdueBookDetails.filter(Boolean))
                } catch (err) {
                    console.error("Failed to fetch patron checkouts:", err);
                }
            };

            const fetchBookDetails = async (id: number, type: "biblio" | "item") => {
                try {
                    let biblioId = id;

                    // If it's an item_id, fetch item details first to get the biblio_id
                    if (type === "item") {
                        const itemUrl = `${kohaAPI}/api/v1/items/${id}`;
                        const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                        const itemRes = await fetch(itemUrl, {
                            headers: {
                                "Authorization": basicAuth,
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                            },
                        });

                        if (!itemRes.ok) throw new Error(`Item fetch error! status: ${itemRes.status}`);
                        const itemData = await itemRes.json();
                        biblioId = itemData.biblio_id; 
                    }

                    const biblioUrl = `${kohaAPI}/api/v1/biblios/${biblioId}`;
                    const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                    const biblioRes = await fetch(biblioUrl, {
                        headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                    });


                    if (!biblioRes.ok) throw new Error(`Biblio fetch error! status: ${biblioRes.status}`);
                    const biblioData = await biblioRes.json();
                    return biblioData;

                } catch (err) {
                    console.error("Failed to fetch book details:", err);
                    return null;
                }
            };


            if (patronId) {
                fetchProfile();
                fetchHolds();
                fetchUserCheckouts();
            }
    }, [patronId]);


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
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-black text-white"
            >
        {/* Header */}
            <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="sticky top-0 z-10 bg-slate-950 border-b border-white/10 shadow-md px-6 py-4 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                <button
                    onClick={() => window.location.href = "/chat-window"}
                    className="flex items-center gap-2 text-sm text-white hover:text-orange-400 transition cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Chat
                </button>
                </div>
                <div>
                <button className="cursor-pointer flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg shadow transition">
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                </button>
                </div>
            </motion.div>

            {/* Content */}
            {profile && holds && (
            <div className="flex flex-col lg:flex-row justify-center lg:items-start items-center gap-6 px-4 py-6">
                {/* Left Panel */}
                <motion.div
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-xl space-y-6"
                    >
                    {/* Profile Card */}
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 shadow-xl p-6 space-y-5">
                        <div className="flex flex-col items-center text-center space-y-3">
                        <img
                            src="/User.jfif"
                            alt="User Profile"
                            className="w-28 h-28 rounded-full ring-2 ring-orange-400 shadow-md object-cover hover:scale-105 transition-transform duration-200"
                        />
                        <div>
                            <h2 className="text-2xl font-bold">{profile.preferred_name ?? "N/A"} {profile.surname ?? ""}</h2>
                            <p className="text-sm text-gray-300">{profile.email ?? "N/A"}</p>
                        </div>
                        </div>
                        <div className="gap-4 flex flex-col text-sm text-white/90">
                        <div className="flex justify-between">
                            <span className="font-medium text-white/60">Member Since:</span>
                            <span>{profile.date_enrolled ?? "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-white/60">Card Number:</span>
                            <span>{profile.cardnumber ?? "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-orange-400">Patron ID:</span>
                            <span>{profile.patron_id ?? "N/A"}</span>
                        </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 shadow-xl p-6 space-y-4">
                        <div className="flex flex-col gap-4 text-sm text-white/90">
                        <InfoRow label="Category ID" value={profile.category_id ?? "N/A"} />
                        <InfoRow label="Date of Birth" value={profile.date_of_birth ?? "N/A"} />
                        <InfoRow label="Registered Library" value={profile.library_id ?? "N/A"} />
                        <InfoRow label="Expires" value={profile.expiry_date ?? "N/A"} />
                        <InfoRow label="Gender" value={profile.gender ?? "N/A"} />
                        <InfoRow label="Phone" value={profile.phone ?? "N/A"} />
                        </div>
                    </div>
                </motion.div>

                {/* Right Panel */}
                <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="w-full max-w-2xl space-y-6"
                >
                {/* Overview */}
                    <SectionCard title="📊 Account Overview">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                        <StatCard label="Borrowed Books" value={borrowed.length ?? 0}color="orange" />
                        <StatCard label="Books on Hold" value={holds.length ?? 0} color="blue" />
                        <StatCard label="Overdue Items" value={overdues.length ?? 0} color="red" />
                        </div>
                    </SectionCard>

                    {/* Overdues */}
                    <SectionCard title="Overdue Items" icon={<CircleAlert className="w-5 h-5" />} textColor="text-red-400" bg="from-red-900/60 to-slate-800" border="border-red-500/20">
                        {overdues.length > 0 ? (
                            overdues.map((book, index) => (
                                <BookCard
                                title="📚 The Midnight Library"
                                author="Jake Napay"
                                due="2023-10-23"
                                actions={[{ label: "Return", style: "red" }]}
                                />
                            ))
                        ) : (
                            <p className="text-center text-sm text-white/50">No overdued books.</p>
                        )}
                        
                    </SectionCard>

                    {/* Borrowed Books */}
                    <SectionCard title="Borrowed Books" icon={<BookAIcon className="w-5 h-5" />}>
                        {borrowed.length > 0 ? (
                            borrowed.map((book, index) => (
                                <BookCard
                                    key={index}
                                    title={`📚 ${book.title ?? "Untitled"}`}
                                    author={book.author ?? "Unknown"}
                                    due={new Date(borrowedBooks[index]?.due_date ?? "N/A").toLocaleString("en-US", { timeZone: "Asia/Singapore", year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    actions={[
                                        { label: "Renew", style: "blue" },
                                        { label: "Return", style: "red" }
                                    ]}
                                />
                            ))
                        ) : (
                            <p className="text-center text-sm text-white/50">No borrowed books.</p>
                        )}
                    </SectionCard>

                    {/* Books on Hold */}
                    <SectionCard
                        title="Books on Hold"
                        icon={<BookOpen className="w-5 h-5" />}
                        textColor="text-purple-400"
                        bg="from-purple-900/60 to-slate-800"
                        border="border-purple-400/30"
                    >
                        {books.length > 0 ? (
                            books.map((book, index) => (
                                <BookCard
                                    key={index}
                                    title={`📚 ${book.title ?? "Untitled"}`}
                                    author={book.author ?? "Unknown"}
                                    due={holds[index]?.expiration_date ?? "N/A"} 
                                    pickup
                                    actions={[
                                        { label: "More Info", style: "blue" },
                                        { label: "Cancel", style: "red" }
                                    ]}
                                />
                            ))
                        ) : (
                        <p className="text-center text-sm text-white/50">No books on hold.</p>
                        )}
                    </SectionCard>

                </motion.div>
            </div>
            )}
            {/* TOAST CONTAINER */}
            <ToastContainer/>
        </motion.div>
    );
}

    const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between">
        <span className="font-semibold text-white/60">{label}:</span>
        <span>{value}</span>
    </div>
    );

    const StatCard = ({ label, value, color }: { label: string; value: any; color: string }) => (
    <div className={`bg-slate-700 rounded-xl p-4 shadow flex flex-col items-center select-none`}>
        <span className={`text-2xl font-bold text-${color}-400`}>{value}</span>
        <span className="text-white/70">{label}</span>
    </div>
    );

    const SectionCard = ({
        title,
        icon,
        children,
        textColor = "text-white",
        bg = "from-slate-800 via-slate-900 to-slate-800",
        border = "border-white/10"
        }: {
        title: string;
        icon?: React.ReactNode;
        children: React.ReactNode;
        textColor?: string;
        bg?: string;
        border?: string;
        }) => (
        <div className={`rounded-3xl bg-gradient-to-br ${bg} border ${border} shadow-lg p-6 space-y-4`}>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${textColor}`}>
            {icon} {title}
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">{children}</div>
        </div>
    );

    const BookCard = ({
    title,
    author,
    due,
    pickup = false,
    actions
    }: {
    title: string;
    author: string;
    due: string;
    pickup?: boolean;
    actions: { label: string; style: "red" | "blue" }[];
    }) => (
    <div className="p-4 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-start">
        <div className="flex flex-col">
            <span className="font-semibold">{title}</span>
            <span className="text-sm text-white/60">by: {author}</span>
        </div>
        <div className="flex flex-col text-right items-end gap-2">
            <span className="text-sm text-white/50">
                {pickup ? "Pickup before" : "Due"}: {due}
            </span>
        <div className="flex gap-2">
            {actions.map((action, i) => (
            <button
                key={i}
                className={`cursor-pointer px-3 py-1 text-xs bg-${action.style}-500 hover:bg-${action.style}-600 rounded-md text-white font-medium transition`}
            >
                {action.label}
            </button>
            ))}
        </div>
        </div>
    </div>
    );
