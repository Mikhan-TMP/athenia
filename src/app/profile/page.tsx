'use client';
import { CircleAlert, BookAIcon, BookOpen, ArrowLeft, Pencil, Book, BookAlert, BookOpenText, CircleAlertIcon, InfoIcon, Mail, Calendar, CardSim, IdCard, IdCardIcon, UserX2Icon, UserCheckIcon, UserCircle, UserCog2, Calendar1Icon, Building2Icon, Contact, UserRound, Settings2, Settings, KeyIcon, Key, KeyRound, LibraryBig } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Card } from "@mui/material";


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
    const [checkoutHistory, setCheckoutHistory] = useState<any[]>([]);
    const [accountInformation, setAccountInformation] = useState<any>(null);
    const [cardNumber, setCardNumber] = useState<string | null>(null);
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);

    // MODALS
    const [bookModal , setShowBookModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [cancelModal, setCancelModal] = useState(false);
    const [returnModal, setReturnModal] = useState(false);
    const [renewModal, setRenewModal] = useState(false);
    const [borrowedHistoryModal, setBorrowedHistoryModal] = useState(false);
    const [accountInformationModal, setAccountInformationModal] = useState(false);
    const [changePasswordModal, setChangePasswordModal] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false); // <-- Add this state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");

    // renewal
    const [renew, setRenew] = useState<any>(null);
    // FETCH THE PATRON FROM LOCAL STORAGE
    useEffect(() => {
        const storedPatronId = localStorage.getItem('patron_id');
        const storedCardNumber = localStorage.getItem('cardNumber');
        const storedUsername = localStorage.getItem('username');
        setPatronId(storedPatronId);
        setCardNumber(storedCardNumber);
        setUserName(storedUsername);

        if (!storedPatronId) {
            handleToast("Profile Unavailable. Please login first.", "error");
            setTimeout(() => {
                router.push("/chat-window");
            })
        }
    }, []);

    // Fetch profile details on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const url = `${kohaAPI}/api/v1/patrons/${patronId}`;
                // console.log('url', url);
                const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
                const res = await fetch(url, {
                    headers: {
                        "Authorization": basicAuth,
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                // if category_id is ST, then display Student
                if (data.category_id === "ST") {
                    data.category_name = "Student";
                }

                console.log(data);
                // console.log(profileWithCategoryNames + " fetched");
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
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setHolds(data);
                // console.log("holds", data)s;

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
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                // console.log("checkouts", data);
                setBorrowedBooks(data);

                const today = new Date();
                const overdues = data.filter((checkout: any) => {
                    const dueDate = new Date(checkout.due_date);
                    return dueDate < today;
                });
                setOverDue(overdues);
                // console.log("overdues", overdues);

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
                            "Accept": "application/json",
                            "ngrok-skip-browser-warning": "true",
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
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true",
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

    const handleCancelHold = async (holdId: number) => {
        try {
            const url = `${kohaAPI}/api/v1/holds/${holdId}`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Authorization": basicAuth,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
            });

            if (res.ok) {
                handleToast("Hold cancelled successfully.", "success");
                setCancelModal(false);
                // reload the page for 2seconds before refreshing
                // setTimeout(()=> {
                window.location.reload();
                // }, 2000)
            } else {
                handleToast("Failed to cancel hold.", "error");
            }
        } catch (err) {
            console.error("Failed to cancel hold:", err);
        }
    };

    const handleRenewHold = async (checkout: any) => {
        // console.log(checkout)
        // console.log(checkout.borrowedBooks.checkout_id);
        try {
            let checkoutId = checkout.borrowedBooks.checkout_id
            const url = `${kohaAPI}/api/v1/checkouts/${checkoutId}/renewals`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;
            
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": basicAuth,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    "checkout_id": checkoutId
                })
            });

            if (res.ok) {
                handleToast("Book renewed sucessfully.", "success");
                setRenewModal(false);
                window.location.reload();
            } else {
                handleToast("Failed to renew the book. Please contact support.", "error");
                setRenewModal(false);
            }

        }catch{

        }
    }

    const fetchRenewDetails = async (checkout: any) => {
        setRenew(checkout);
        // console.log(checkout);
    }

    const fetchCheckoutHistory = async () => {
        try {
            const url = `${kohaAPI}/api/v1/checkouts/?patron_id=${patronId}&checked_in=true`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": basicAuth,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (res.ok) {
                const data = await res.json();
                setCheckoutHistory(data); // <-- Populate the modal with history data
                // console.log("Checkout History:", data);
            } else {
                console.error("Failed to fetch checkout history:", res.statusText);
            }
        }catch (err) {
            console.error("Error fetching checkout history:", err);
        }
    }
    
    const fetchAccountInformation = async () => {
        try {
            const url = `${kohaAPI}/api/v1/patrons/${patronId}/account`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": basicAuth,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (res.ok) {
                const data = await res.json();
                setAccountInformation(data); 
                console.log("Account Information:", data);
            } else {
                console.error("Failed to fetch account information:", res.statusText);
            }
        }catch (err) {
            console.error("Error fetching account information:", err);
        }
    }


    const handleChangePassword = async () => {
        // Validate new password requirements
        if (newPassword.length < 8) {
            handleToast("Password must be at least 8 characters long.", "warning");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            handleToast("Passwords do not match.", "warning");
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
        if (!passwordRegex.test(newPassword)) {
            handleToast("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.", "warning");
            return;
        }

        setIsChangingPassword(true); // <-- Start loading
        const startTime = Date.now();

        try {
            const validationUrl = `${kohaAPI}/api/v1/auth/password/validation` ;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

            const validationRes = await fetch(validationUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": basicAuth,
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    identifier: cardNumber,
                    password: currentPassword
                })
            });

            if (validationRes.status === 200 || validationRes.status === 201) {
                const url = `${kohaAPI}/api/v1/patrons/${patronId}/password`;
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": basicAuth,
                        "Accept": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    },
                    body: JSON.stringify({
                        password: newPassword,
                        password_2: confirmNewPassword
                    })
                });
                if (res.ok) {
                    handleToast("Password changed successfully.", "success");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setTimeout(() => {
                        setIsChangingPassword(false); // <-- End loading after minimum 2s
                        setChangePasswordModal(false);
                    }, Math.max(2000 - (Date.now() - startTime), 0));
                    return;
                } else {
                    const errorData = await res.json();
                    handleToast(errorData.message || "Failed to change password.", "error");
                }
            } else {
                handleToast("Current password is incorrect.", "error");
            }
        } catch (err) {
            console.error("Error validating/changing password:", err);
            handleToast("An error occurred during password validation.", "error");
        }
        setTimeout(() => {
            setIsChangingPassword(false); // <-- End loading after minimum 2s
        }, Math.max(2000 - (Date.now() - startTime), 0));
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-black text-white">
        {/* Header */}
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="sticky top-0 z-10 bg-slate-950 border-b border-white/10 shadow-md px-6 py-4 flex items-center justify-between" >
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.href = "/chat-window"} className="flex items-center gap-2 text-sm text-white hover:text-orange-400 transition cursor-pointer" >
                        <ArrowLeft className="w-4 h-4" /> Back to Chat
                    </button>
                </div>
                <div>
                {/* <button className="cursor-pointer flex items-center gap-2 text-sm bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg shadow transition">
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                </button> */}
                </div>
            </motion.div>

            {/* Content */}
            {profile && holds && (
            <div className="flex flex-col lg:flex-row justify-center lg:items-start items-center gap-6 px-4 py-6">
                {/* Left Panel */}
                <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-xl space-y-6" >
                    {/* Profile Card */}
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 shadow-xl p-6 space-y-5">
                        <div className="flex w-full gap-2 items-center space-y-3">
                            <Image src="/default-user.webp" alt="User Profile" width={112} height={112} className="w-28 h-28 rounded-full ring-2 ring-orange-400 shadow-md object-cover hover:scale-105 transition-transform duration-200 cursor-pointer" />
                            <div className="">
                                <h2 className="text-3xl font-bold text-orange-400">{profile.preferred_name ?? "N/A"} {profile.surname ?? ""}</h2>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 inline-block text-white/60 mr-1" />
                                    <p className="text-sm text-gray-300">{profile.email ?? "N/A"}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1  mt-1 select-none ">
                                    <p className="text-sm text-gray-300 bg-blue-500/50 px-3 py-1 mr-2 rounded-lg shadow-md cursor-pointer">{profile.category_name ?? "N/A"}</p>
                                    <p className="text-sm text-gray-300 bg-green-500/50 px-3 py-1 rounded-lg shadow-md cursor-pointer">{profile.address ?? "N/A"}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-wrap items-center justify-center gap-5 select-none sm:flex-row sm:justify-between sm:flex-nowrap">
                            <div className="p-5 rounded-2xl w-50 bg-white/10 flex flex-col justify-center items-center cursor-pointer hover:bg-white/20 shadow-md">
                                <Calendar className="w-6 h-6 mb-1" />
                                <span className="text-green-400 text-[11px]">Member Since</span>
                                <p className="text-lg font-bold text-gray-300">{profile.date_enrolled ?? "N/A"}</p>
                            </div>
                            <div className="p-5 rounded-2xl w-50 bg-white/30 flex flex-col justify-center items-center cursor-pointer hover:bg-white/40 shadow-md">
                                <IdCard className="w-6 h-6 mb-1" />
                                <span className="text-green-400 text-[11px]">Card Number</span>
                                <p className="text-lg font-bold text-gray-300">{profile.cardnumber ?? "N/A"}</p>
                            </div>
                            <div className="p-5 rounded-2xl w-50 bg-white/10 flex flex-col justify-center items-center cursor-pointer hover:bg-white/20 shadow-md">
                                <UserCheckIcon className="w-6 h-6 mb-1" />
                                <span className="text-green-400 text-[11px]">Patron ID</span>
                                <p className="text-lg font-bold text-gray-300">{profile.patron_id ?? "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 shadow-xl p-6 space-y-4">
                        <div className="flex items-center mb-2 gap-2">
                            <UserCog2 className="w-6 h-6 text-white" />
                            <h3 className="text-lg font-semibold">Additional Details</h3>
                        </div>
                        <div className="flex flex-row justify-between ">
                            {/* Left */}
                            <div className="flex flex-col gap-4 text-sm text-white/90">
                                <div className="flex items-center">
                                    <Calendar1Icon className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Date of Birth</span>
                                        <span className="text-lg font-bold">{profile.date_of_birth ?? "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Building2Icon className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Registered Library</span>
                                        <span className="text-lg font-bold">{profile.library_id ?? "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <InfoIcon className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Membership Expiration</span>
                                        <span className="text-lg font-bold">{profile.expiry_date ?? "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Right */}
                            <div className="flex flex-col gap-4 text-sm text-white/90">
                                <div className="flex items-center">
                                    <Contact className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Updated On</span>
                                        <span className="text-lg font-bold">
                                            {profile.updated_on
                                                ? new Date(profile.updated_on).toLocaleString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                : "N/A"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Contact className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Phone Number</span>
                                        <span className="text-lg font-bold">{profile.phone ?? "N/A"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <UserRound className="w-5 h-5 text-white/60 mr-2" />
                                    <div className="flex flex-col w-full">
                                        <span className="text-[12px]">Gender</span>
                                        <span className="text-lg font-bold">{profile.gender ?? "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    {/* Profile Actions */}
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 shadow-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold mb-2">Profile Actions</h3>
                        <div className="flex justify-between gap-2 ">
                            <div className="flex items-center gap-2 justify-center w-1/2 bg-orange-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-orange-500 shadow-lg">
                                <Settings className="w-4 h-4 text-white" />
                                <button className="text-sm text-white/90 hover:text-white">Edit Profile</button>
                            </div>
                            <button 
                                onClick={() => setChangePasswordModal(true)}
                                className="flex items-center gap-2 justify-center w-1/2 bg-white select-none rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 shadow-lg">
                                <KeyRound className="w-4 h-4 text-black" />
                                <div className="text-sm hover:text-black text-black cursor-pointer">Change Password</div>
                            </button>
                        </div>
                    </div>                    
                </motion.div>

                {/* Right Panel */}
                <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="w-full max-w-2xl space-y-6" >
                {/* Overview */}
                    <SectionCard title="📊 Account Overview">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <StatCard label="Borrowed Books" value={borrowed.length ?? 0}color="orange" />
                            <StatCard label="Books on Hold" value={holds.length ?? 0} color="blue" />
                            <StatCard label="Overdue Items" value={overdues.length ?? 0} color="red" />
                        </div>
                        <p className="text-sm text-white/60">Keep track of your account status and avoid overdue items.</p>
                        <div className="gap-4 text-sm flex flex-wrap p-3">
                            <button className="cursor-pointer flex justify-center items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                onClick={() => {
                                    setBorrowedHistoryModal(true);
                                    fetchCheckoutHistory();
                                }}
                            >
                                <BookOpenText className="w-5 h-5" />
                                View History
                            </button>
                            <button className="cursor-pointer flex justify-center items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                onClick={() => {
                                    setAccountInformationModal(true);
                                    fetchAccountInformation();
                                }}
                            >
                                <LibraryBig className="w-5 h-5" />
                                Account Credits
                            </button>
                        </div>
                    </SectionCard>

                    {/* Overdues */}
                    <SectionCard title="Overdue Items" icon={<CircleAlert className="w-5 h-5" />} textColor="text-red-400" bg="from-red-900/60 to-slate-800" border="border-red-500/20">
                        {overdues.length > 0 ? (
                            overdues.map((book, index) => (
                                <BookCard
                                    key={index}
                                    title={`📚 ${overdueBookdetails[index]?.title ?? book.title ?? "Untitled"}`}
                                    author={overdueBookdetails[index]?.author ?? book.author ?? "Unknown"}
                                    due={new Date(book.due_date ?? "N/A").toLocaleString("en-US", { timeZone: "Asia/Singapore", year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    actions={[{
                                        label: "Return",
                                        style: "red",
                                        onClick: () => {
                                            setSelectedBook({ ...overdues[index], borrowedBooks: borrowedBooks[index] });
                                            setReturnModal(true);
                                        }
                                    }]}
                                />
                            ))
                        ) : (
                            <p className="text-center text-sm text-white/50">No overdue books.</p>
                        )}
                    </SectionCard>

                    {/* Borrowed Books */}
                    <SectionCard title="Borrowed Books" icon={<BookAIcon className="w-5 h-5" />}>
                        {borrowed.length > 0 ? (
                            borrowed
                                .filter((_, index) => {
                                    const dueDate = new Date(borrowedBooks[index]?.due_date);
                                    return dueDate >= new Date(); // Only show books not overdue
                                })
                                .map((book, index) => (
                                    <BookCard
                                        key={index}
                                        title={`📚 ${book.title ?? "Untitled"}`}
                                        author={book.author ?? "Unknown"}
                                        due={new Date(borrowedBooks[index]?.due_date ?? "N/A").toLocaleString("en-US", { timeZone: "Asia/Singapore", year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        actions={[
                                            {
                                                label: "Renew",
                                                style: "orange",
                                                onClick: () => {
                                                    setSelectedBook({ ...borrowed, borrowedBooks: borrowedBooks[index] });
                                                    fetchRenewDetails(borrowedBooks[index]);
                                                    setRenewModal(true);
                                                }
                                            },
                                            {
                                                label: "Return",
                                                style: "red",
                                                onClick: () => {
                                                    setReturnModal(true);
                                                }
                                            }
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
                                    due={holds[index]?.expiration_date ? new Date(holds[index].expiration_date).toLocaleString("en-US", { year: '2-digit', month: '2-digit', day: '2-digit' }) : "N/A"}
                                    pickup
                                    actions={[
                                        { 
                                            label: "More Info", 
                                            style: "green", 
                                            onClick: () => {
                                                setSelectedBook({ ...book, hold: holds[index] }); 
                                                setShowBookModal(true);
                                            } 
                                        },
                                        { 
                                            label: "Cancel", 
                                            style: "red", 
                                            onClick: () => {
                                                setSelectedBook({ ...book, hold: holds[index] });
                                                setCancelModal(true); 
                                                }
                                            }
                                            ,
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

            {/* Book Modal */}
            {bookModal && selectedBook && (
                <Modal
                    book={selectedBook}
                    onClose={() => {
                        setSelectedBook(null);
                        setShowBookModal(false);
                    }}
                />
            )}
            {/* CancelHold Modal */}
            {cancelModal && selectedBook && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                        <div className="relative transform overflow-hidden rounded-lg bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  border border-gray-800 rounded-b-none text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                        <div className="bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10  rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10" >
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
                                    className="text-base font-semibold leading-6 text-red-700"
                                    >
                                    Cancel Hold
                                </h3>
                                <div className="mt-2">
                                <p className="text-sm text-white/80">
                                    Are you sure you want to cancel this hold? This action cannot be undone. If you have any questions, please contact support.
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => handleCancelHold(selectedBook?.hold?.hold_id)}
                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Continue
                            </button>
                            <button
                                onClick={() => {
                                    setCancelModal(false);
                                    setSelectedBook(null);
                                    }}
                                className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                type="button"
                                >
                                Back
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Return Modal */}
            {returnModal && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                        <div className="relative transform overflow-hidden bg-clip-padding rounded-lg backdrop-filter backdrop-blur-sm bg-opacity-10 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                        <div className="bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border rounded-lg border-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10" >
                                <CircleAlertIcon style={{color: "blue"}}/> 
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3
                                    id="modal-title"
                                    className="text-base font-semibold leading-6 text-orange-500"
                                    >
                                    Hello, {userName}!
                                </h3>
                                <div className="mt-2">
                                <p className="text-sm text-white/80">
                                    Please be informed that returning books is not supported by this application. You will have to go to the library to return books. Kindly note that fees may apply if books are not returned on or before the due date. Thank you for your understanding, and please contact support if you have any questions.
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => setReturnModal(false)}
                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Understood
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Renew Modal */}
            {renewModal &&  (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" >
                        <div className="relative transform overflow-hidden rounded-lg  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                        <div className=" bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10" >
                                    <CircleAlertIcon style={{color: "red"}}/> 
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3
                                    id="modal-title"
                                    className="text-2xl font-semibold leading-6 text-orange-600"
                                >
                                    Renew Checked-out Book
                                </h3>

                                    <div className="mt-4 space-y-4">
                                        <p className="text-sm text-white/90 text-justify">
                                        Renewing the book will extend its return date by another week.
                                        If it is already overdue, you must return it to the library.
                                        Renewal is not allowed if the book is reserved by another user.
                                        For questions, please contact the library staff.
                                        </p>

                                        <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                            <h4 className="text-sm font-bold text-orange-400 mb-2">Renewal Details</h4>
                                            <ul className="space-y-1 text-sm text-white-600 flex flex-col justify-between w-full">
                                                <li><span className="font-medium text-white/40">Auto Renew:</span> {renew.auto_renew ? "Yes" : "No"}</li>
                                                <li><span className="font-medium text-white/40">Checkout ID:</span> {renew.checkout_id}</li>
                                                <li><span className="font-medium text-white/40">Library:</span> {renew.library_id}</li>
                                                <li>
                                                <span className="font-medium text-white/40">Last Renewed:</span>{" "}
                                                {renew.last_renewed_date
                                                    ? new Intl.DateTimeFormat("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "2-digit",
                                                    }).format(new Date(renew.last_renewed_date))
                                                    : "N/A"}
                                                </li>
                                                <li><span className="font-medium text-white/40">Renewals Count:</span> {renew.renewals_count}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => {
                                    setRenewModal(false);
                                    handleRenewHold(selectedBook);
                                }}

                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Continue 
                            </button>
                            <button
                                onClick={() => {
                                    setRenewModal(false)
                                    setSelectedBook(null);
                                }}
                                className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                type="button"
                                >
                                Back
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout History Modal */}
            {borrowedHistoryModal && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto  ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 " >
                        <div className="relative transform overflow-hidden rounded-lg  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                        <div className="  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="mt-4 p-3">
                                <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                    <BookOpenText className="w-6 h-6 text-orange-500" />
                                    Borrowed History
                                </h3>
                                {checkoutHistory.length > 0 ? (
                                    <div className="max-h-120 p-3 overflow-y-auto grid grid-cols-1 gap-4 cursor-pointer  ">
                                        {checkoutHistory.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200"
                                            >
                                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-orange-500">Checkout ID:</span>
                                                        <span className="text-white">{item.checkout_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-orange-300">Item ID:</span>
                                                        <span className="text-white">{item.item_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-orange-300">Library:</span>
                                                        <span className="text-white">{item.library_id}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-orange-300">Checked Out</span>
                                                        <span className="text-gray-200">{new Date(item.checkout_date).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-orange-300">Checked In</span>
                                                        <span className="text-gray-200">{new Date(item.checkin_date).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-orange-300">Due Date</span>
                                                        <span className="text-gray-200">{new Date(item.due_date).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-orange-300">Renewals</span>
                                                        <span className="text-gray-200">{item.renewals_count}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                                                        {item.onsite_checkout ? "Onsite" : "Take-home"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10">
                                        <BookOpenText className="w-10 h-10 text-gray-300 mb-2" />
                                        <p className="text-base text-orange-300 font-medium">No borrowed history found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => {
                                    setBorrowedHistoryModal(false);
                                }}
                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Close
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Information Modal */}
            {accountInformationModal && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto  ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 " >
                        <div className="relative transform overflow-hidden rounded-lg  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                        <div className="  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="mt-4 p-3">
                                <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                    <LibraryBig className="w-6 h-6 text-orange-500" />
                                    Account Information
                                </h3>
                                {accountInformation ? (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="font-semibold text-orange-400">Balance:</span>
                                            <span className="ml-2 text-white">{accountInformation.balance}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-green-400">Outstanding Credits:</span>
                                            <span className="ml-2 text-white">{accountInformation.outstanding_credits.total}</span>
                                            {accountInformation.outstanding_credits.lines.length > 0 && (
                                                <ul className="mt-2 pl-4 list-disc text-white/80">
                                                    {accountInformation.outstanding_credits.lines.map((line: any, idx: number) => (
                                                        <li key={idx}>{JSON.stringify(line)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-red-400">Outstanding Debits:</span>
                                            <span className="ml-2 text-white">{accountInformation.outstanding_debits.total}</span>
                                            {accountInformation.outstanding_debits.lines.length > 0 && (
                                                <ul className="mt-2 pl-4 list-disc text-white/80">
                                                    {accountInformation.outstanding_debits.lines.map((line: any, idx: number) => (
                                                        <li key={idx}>{JSON.stringify(line)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-base text-orange-300 font-medium">No account information found.</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <button
                                onClick={() => {
                                    setAccountInformationModal(false);
                                }}
                                className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                type="button"
                                >
                                Close
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {changePasswordModal && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto  ">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 " >
                            
                                
                        <div className="relative transform overflow-hidden rounded-lg  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
                            <div className="  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                
                                <div className="mt-4 p-3">
                                    <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                                        <KeyRound className="w-6 h-6 text-orange-500" />
                                        Change Password
                                    </h3>
                                </div>
                                {isChangingPassword ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 bosrder-dashed rounded-full animate-spin border-yellow-500 mx-auto"></div>
                                        <h2 className="text-zinc-900 dark:text-white mt-4">Loading...</h2>
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            Changing your password, please wait.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-white/90 text-justify">
                                            Please enter your old password below.
                                        </p>
                                        <div className=" w-full">
                                            <input
                                                type="password"
                                                placeholder="Old Password"
                                                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                onChange={e => setCurrentPassword(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-sm text-white/90 text-justify">
                                            Now, enter your new password below. Make sure it is strong and secure.
                                        </p>
                                        <div className=" w-full">
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                value={newPassword}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    setNewPassword(value);
                                                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
                                                    if (!passwordRegex.test(value)) {
                                                        setNewPasswordError("Password must be >8 characters, include lowercase, uppercase, number, and special character.");
                                                    } else {
                                                        setNewPasswordError("");
                                                    }
                                                    // Also check confirm password match in real time
                                                    if (!confirmNewPassword) {
                                                        setConfirmNewPasswordError("");
                                                    } else if (value !== confirmNewPassword) {
                                                        setConfirmNewPasswordError("Passwords do not match.");
                                                    } else {
                                                        setConfirmNewPasswordError("");
                                                    }
                                                }}
                                            />
                                            <span className="text-[12px] text-red-600/90 px-3 text-right ">
                                                {newPassword && newPasswordError ? newPasswordError : ""}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/90 text-justify">
                                            Finally, confirm your new password by entering it below.
                                        </p>
                                        <div className=" w-full">
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                value={confirmNewPassword}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    setConfirmNewPassword(value);
                                                    if (!value) {
                                                        setConfirmNewPasswordError("");
                                                    } else if (newPassword && value !== newPassword) {
                                                        setConfirmNewPasswordError("Passwords do not match.");
                                                    } else {
                                                        setConfirmNewPasswordError("");
                                                    }
                                                }}
                                            />
                                            <span className="text-[12px] text-red-600/90 px-3 text-right ">
                                                {confirmNewPassword && confirmNewPasswordError ? confirmNewPasswordError : ""}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button
                                    onClick={() => {
                                        if (!isChangingPassword) handleChangePassword();
                                    }}
                                    className={`mb-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto ${isChangingPassword ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={isChangingPassword}
                                >
                                    Change Password
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isChangingPassword) {
                                            setChangePasswordModal(false);
                                            setNewPassword("");
                                            setConfirmNewPassword("");
                                            setNewPasswordError("");
                                            setConfirmNewPasswordError("");
                                        }
                                    }}
                                    className={`mb-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-white-500 sm:ml-3 sm:w-auto ${isChangingPassword ? "opacity-50 cursor-not-allowed" : ""}`}
                                    type="button"
                                    disabled={isChangingPassword}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
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

            <div className="space-y-3 max-h-300 overflow-y-auto pr-1">{children}</div>
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
        actions: { label: string; style: "red" | "blue" | "green" | "yellow" | "orange"; onClick?: () => void }[];
        }) => (
        <div className="p-4 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-start | flex-col  sm:flex-row gap-2">
            <div className="flex flex-col |  w-full">
                <span className="font-semibold">{title}</span>
                <span className="text-sm text-white/60">by: {author}</span>
            </div>
            <div className="flex flex-col text-right items-end gap-2 | w-full ">
                <span className="text-sm text-white/50">
                    {pickup ? "Pickup before" : "Due"}: {due}
                </span>
                <div className="flex gap-2">
                    {actions.map((action, i) => (
                    <button
                        key={i}
                        onClick={action.onClick}
                        className={`cursor-pointer px-3 py-1 text-xs bg-${action.style}-500 hover:bg-${action.style}-600 rounded-md text-white font-medium transition`}
                    >
                        {action.label}
                    </button>
                    ))}
                </div>
            </div>
        </div>
    );

const Modal = ({ book, onClose }: { book: any; onClose: () => void }) => (
    <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto  ">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 " >
            <div className="relative transform overflow-hidden rounded-lg  text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg" >
            <div className="  bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mt-4 p-3">
                    <div className="flex flex-col ">
                        <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center gap-2">
                            <BookOpenText className="w-6 h-6 text-orange-500" />
                            {book?.title ?? "Unknown"}
                        </h3>
                        <h5 className="text-md pl-5 text-white/80">
                            by: {book?.author ?? "Unknown"}
                        </h5>
                        <h5 className="text-sm pl-5 text-white/60">
                            {book?.publisher ?? "Unknown"}
                        </h5>
                        <h5 className="text-[10px] pl-5 text-white/60">
                            {book?.abstract ?? "No description available"}
                        </h5>
                    </div>

                    {book?.hold && (
                        <div className="max-h-120 p-3 overflow-y-auto grid grid-cols-1 gap-4 cursor-pointer ">
                                <div
                                    className="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200"
                                >
                                    <div className="flex flex-col justify-between items-center gap-2 mb-2">
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-semibold text-orange-500">Hold Date:</span>
                                            <span className="text-green-500">{book.hold.hold_date ?? "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full">
                                            <span className="font-semibold text-orange-5efsddsdasda00">Queue #: </span>
                                            <span className="text-red-600">{book.hold.priority ?? "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-semibold text-orange-300">Status:</span>
                                            <span className="text-blue">{book.hold.status ?? "Pending"}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div className="flex justify-between items-center  w-full">
                                            <span className="font-medium text-orange-300">Patron ID:</span>
                                            <span className="text-gray-200">{book.hold.patron_id ?? "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-medium text-orange-300">Pickup Library:</span>
                                            <span className="text-gray-200">{book.hold.pickup_library_id ?? "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-medium text-orange-300">Expiration Date:</span>
                                            <span className="text-gray-200">{book.hold.expiration_date ?? "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-medium text-orange-300">Item ID:</span>
                                            <span className="text-gray-200">{book.hold.item_id ?? "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center  w-full ">
                                            <span className="font-medium text-orange-300">Item level:</span>
                                            <span className="text-gray-200">{book.hold.item_level ?? "Unknown"}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                                            {book.hold.hold_id}
                                        </span>
                                    </div>
                                </div>
                        </div>
                    )}

                </div>
            </div>
            <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                    onClick={onClose}
                    className="cursor-pointer inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    type="button"
                    >
                    Close
                </button>
            </div>
            </div>
        </div>
    </div>
);

// const Modal = ({ book, onClose }: { book: any; onClose: () => void }) => (
//     <div className="fixed px-5 inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
//         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl max-w-md w-full text-white shadow-2xl border border-white/10">
            
//             {/* Title + Author */}
//             <h2 className="text-2xl font-bold text-orange-400 mb-1">{book?.title}</h2>
//             <p className="text-sm text-white/60 mb-4">by {book?.author ?? "Unknown"}</p>
            
//             {/* Publisher & Description */}
//             <div className="mb-4">
//             <p className="text-sm"><strong className="text-white/70">Publisher:</strong> {book?.publisher ?? "Unknown"}</p>
//             <p className="text-sm mt-2 text-white/80">
//                 {book?.abstract ?? "No description available."}
//             </p>
//             </div>

//             {/* Hold Info */}
//             {book?.hold && (
//             <div className="bg-slate-700/40 p-4 rounded-xl border border-slate-600/40 space-y-3">
                
//                 {/* Highlighted Row */}
//                 <div className="flex justify-between items-center">
//                 <span className="text-sm font-semibold text-white/70">Hold Date:</span>
//                 <span className="text-base font-bold text-green-400">
//                     {book.hold.hold_date}
//                 </span>
//                 </div>

//                 <div className="flex justify-between items-center">
//                 <span className="text-sm font-semibold text-white/70">Priority:</span>
//                 <span className={`text-base font-bold ${book.hold.priority === 1 ? "text-yellow-400" : "text-blue-400"}`}>
//                     {book.hold.priority}
//                 </span>
//                 </div>

//                 <hr className="border-slate-600/40" />

//                 {/* Other Info */}
//                 <p className="text-sm"><strong>Hold ID:</strong> {book.hold.hold_id}</p>
//                 <p className="text-sm"><strong>Patron ID:</strong> {book.hold.patron_id}</p>
//                 <p className="text-sm"><strong>Pickup Library:</strong> {book.hold.pickup_library_id}</p>
//                 <p className="text-sm"><strong>Expiration Date:</strong> {book.hold.expiration_date}</p>
//                 <p className="text-sm"><strong>Item ID:</strong> {book.hold.item_id}</p>
//                 <p className="text-sm"><strong>Item Level:</strong> {book.hold.item_level ? "Yes" : "No"}</p>
//                 <p className="text-sm"><strong>Status:</strong> {book.hold.status ?? "Pending"}</p>
//             </div>
//             )}

//             {/* Actions */}
//             <div className="flex justify-end gap-3 mt-6">
//             <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm cursor-pointer">
//                 Close
//             </button>
//             </div>
//         </div>
//     </div>
// );
