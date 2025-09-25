'use client';
import { CircleAlert, BookAIcon, BookOpen, ArrowLeft, Pencil, Book, BookAlert, BookOpenText, CircleAlertIcon, InfoIcon, Mail, Calendar, CardSim, IdCard, IdCardIcon, UserX2Icon, UserCheckIcon, UserCircle, UserCog2, Calendar1Icon, Building2Icon, Contact, UserRound, Settings2, Settings, KeyIcon, Key, KeyRound, LibraryBig, PenSquare, ArrowBigLeft, ArrowBigRight, Loader2Icon, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { Card } from "@mui/material";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { I18nextProvider } from "react-i18next"; 
import { t } from "i18next";

export default function Profile() {
    // Translation
    const { t } = useTranslation();

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
    const [changePasswordModal, setChangePasswordModal] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false); 
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState("");
    const [editProfileModal, setEditProfileModal] = useState(false);
    const [step, setStep] = useState(1);

    //Edit Information
    const [editPreferredName, setEditPreferredName] = useState("");
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editDateOfBirth, setEditDateOfBirth] = useState("");
    const [editGender, setEditGender] = useState("");

    // step2
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editSecondaryEmail, setEditSecondaryEmail] = useState("");
    const [editMobile, setEditMobile] = useState("");
    const [editSecondaryPhone, setEditSecondaryPhone] = useState("");

    //step 3
    const [editAddress, setEditAddress] = useState("");
    const [editAddress2, setEditAddress2] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editState, setEditState] = useState("");
    const [editZipcode, setEditZipcode] = useState("");
    const [editCountry, setEditCountry] = useState("");

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
    if (profile) {
        setEditPreferredName(profile.preferred_name ?? "");
        setEditFirstName(profile.firstname ?? "");
        setEditLastName(profile.surname ?? "");
        setEditDateOfBirth(profile.date_of_birth ?? "");
        setEditGender(profile.gender ?? "");
        setEditEmail(profile.email ?? "");
        setEditPhone(profile.phone ?? "");
        setEditSecondaryEmail(profile.secondary_email ?? "");
        setEditMobile(profile.mobile ?? "");
        setEditSecondaryPhone(profile.secondary_phone ?? "");
        setEditAddress(profile.address ?? "");
        setEditAddress2(profile.address2 ?? "");
        setEditCity(profile.city ?? "");
        setEditState(profile.state ?? "");
        setEditZipcode(profile.zipcode ?? "");
        setEditCountry(profile.country ?? "");
    }
    }, [profile]);

    useEffect(() => {
        const savedLang = localStorage.getItem("appLanguage");
        if (savedLang && savedLang !== i18n.language) {
            i18n.changeLanguage(savedLang);
        }
    }, []);

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
            handleToast(`${t("profile_unvailable_please_login_first")}`, "error");
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
                handleToast(`${t("hold_cancelled_successfully")}`, "success");
                setCancelModal(false);
                // reload the page for 2seconds before refreshing
                // setTimeout(()=> {
                window.location.reload();
                // }, 2000)
            } else {
                handleToast(`${t("hold_cancellation_failed")}`, "error");
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
                handleToast(`${t("book_renewed_successfully")}`, "success");
                setRenewModal(false);
                window.location.reload();
            } else {
                handleToast(`${t("failed_to_renew_book")}`, "error");
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
                setCheckoutHistory(data); 
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

    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        if (!patronId ) {
            handleToast(`${t("patron_id_required")}`, "error");
            setIsUpdatingProfile(false);
            return;
        }
        if (!cardNumber ) {
            handleToast(`${t("card_number_required")}`, "error");
            setIsUpdatingProfile(false);
            return;
        }
        if (!profile) {
            handleToast(`${t("profile_information_required")}`, "error");
            setIsUpdatingProfile(false);
            return;
        }
        if (editLastName === null || editLastName.trim() === "") {
            handleToast(`${t("last_name_required")}`, "error");
            setIsUpdatingProfile(false);
            return;
        }

        try {
            const url = `${kohaAPI}/api/v1/patrons/${patronId}`;
            const basicAuth = `Basic ${btoa(unescape(encodeURIComponent(`${kohaUsername}:${kohaPassword}`)))}`;

            // Only include fields that are not null/empty/undefined
            const updatedFields: any = {};
            updatedFields.patron_id = patronId; // Always include patron_id
            updatedFields.cardnumber = cardNumber; // Always include cardnumber
            // updatedFields.extended_attributes = {
            //     extended_attribute_id: 0,
            //     type: "patron",
            //     value: patronId
            // }
            updatedFields.library_id = profile.library_id; // Always include library_id
            updatedFields.category_id = profile.category_id; // Always include category_id
            if (editPreferredName) updatedFields.preferred_name = editPreferredName;
            if (editFirstName) updatedFields.firstname = editFirstName;
            if (editLastName) updatedFields.surname = editLastName;
            if (editDateOfBirth) updatedFields.date_of_birth = editDateOfBirth;
            if (editGender) updatedFields.gender = editGender;
            if (editEmail) updatedFields.email = editEmail;
            if (editPhone) updatedFields.phone = editPhone;
            if (editSecondaryEmail) updatedFields.secondary_email = editSecondaryEmail;
            if (editMobile) updatedFields.mobile = editMobile;
            if (editSecondaryPhone) updatedFields.secondary_phone = editSecondaryPhone;
            if (editAddress) updatedFields.address = editAddress;
            if (editAddress2) updatedFields.address2 = editAddress2;
            if (editCity) updatedFields.city = editCity;
            if (editState) updatedFields.state = editState;
            if (editZipcode) updatedFields.postal_code = editZipcode;
            if (editCountry) updatedFields.country = editCountry;

            console.log("Updating with fields:", updatedFields);
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": basicAuth,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify(updatedFields)
            });

            if (res.ok) {
                const data = await res.json();
                handleToast(`${t("profile_updated_successfully")}`, "success");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                handleToast(`${t("failed_to_update_profile")}`, "error");
                console.error("Failed to update profile:", res.statusText);
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        } finally {
            setIsUpdatingProfile(false);
        }
    }


    const handleChangePassword = async () => {
        // Validate new password requirements
        if (newPassword.length < 8) {
            handleToast(`${t("password_must_be_at_least_8_characters")}`, "warning");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            handleToast(`${t("passwords_do_not_match")}`, "warning");
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
        if (!passwordRegex.test(newPassword)) {
            handleToast(`${t("password_must_contain_at_least_one_uppercase_lowercase_digit_special_character")}`, "warning");
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
                    handleToast(`${t("password_updated_successfully")}`, "success");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setTimeout(() => {
                        setIsChangingPassword(false); 
                        setChangePasswordModal(false);
                    }, Math.max(2000 - (Date.now() - startTime), 0));
                    return;
                } else {
                    const errorData = await res.json();
                    handleToast(errorData.message || `${t("failed_to_update_password")}`, "error");
                }
            } else {
                handleToast(`${t("current_password_incorrect")}`, "error");
            }
        } catch (err) {
            console.error("Error validating/changing password:", err);
            handleToast(`${t("an_error_occurred_please_try_again")}`, "error");
        }
        setTimeout(() => {
            setIsChangingPassword(false); // <-- End loading after minimum 2s
        }, Math.max(2000 - (Date.now() - startTime), 0));
    }
    return (
        <I18nextProvider i18n={i18n}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-black text-white">
            {/* Header */}
                <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="sticky top-0 z-10 bg-slate-950 border-b border-white/10 shadow-md px-6 py-4 flex items-center justify-between" >
                    <div className="flex items-center justify-between w-full gap-3">
                        <button onClick={() => window.location.href = "/chat-window"} className="flex items-center gap-2 text-sm text-white hover:text-orange-400 transition cursor-pointer" >
                            <ArrowLeft className="w-4 h-4" /> {t("back_to_chats")}
                        </button>
                        <button>
                            {/* change language */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white/70">{t("language")}:</span>
                                <select
                                    value={i18n.language}
                                    onChange={e => {
                                        const newLocale = e.target.value;
                                        i18n.changeLanguage(newLocale);
                                        localStorage.setItem("appLanguage", newLocale);
                                    }}
                                    className="bg-slate-800 text-white rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                >
                                    <option value="en">🇺🇸 English</option>
                                    <option value="ja">🇯🇵 日本語</option>
                                </select>
                            </div>
                        </button>
                    </div>
                    
                    <div>
                    </div>
                </motion.div>

                {/* Content */}
                {profile && holds && (
                <div className="flex flex-col lg:flex-row justify-center lg:items-start items-center gap-6 px-4 py-6">
                    {/* Left Panel */}
                    <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-xl space-y-6" >
                        {/* Profile Card */}
                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 shadow-xl p-6 space-y-5">
                            <div className="flex flex-col sm:flex-row w-full gap-2 items-center space-y-3">
                                <Image src="/default-user.webp" alt="User Profile" width={112} height={112} className="w-28 h-28 rounded-full ring-2 ring-orange-400 shadow-md object-cover hover:scale-105 transition-transform duration-200 cursor-pointer" />
                                <div className="flex flex-col justify-center items-center sm:items-start space-y-1">
                                    <h2 className="text-3xl font-bold text-orange-400">{profile.firstname ?? t('n/a')} {profile.surname ?? ""}</h2>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 inline-block text-white/60 mr-1" />
                                        <p className="text-sm text-gray-300">{profile.email ?? t('n/a')}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1  mt-1 select-none ">
                                        <p className="text-sm text-gray-300 bg-blue-500/50 px-3 py-1 mr-2 rounded-lg shadow-md cursor-pointer">
                                            {profile.category_id === "ST" ? t("student") : profile.category_id ?? t('n/a')}
                                        </p>
                                        <p className="text-sm text-gray-300 bg-green-500/50 px-3 py-1 rounded-lg shadow-md cursor-pointer">{profile.address ?? t('n/a')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-wrap items-center justify-center gap-5 select-none sm:flex-row sm:justify-between sm:flex-nowrap">
                                <div className="p-5 rounded-2xl w-80 sm:w-70 md:w-50 bg-white/10 flex flex-col justify-center items-center cursor-pointer hover:bg-white/20 shadow-md">
                                    <Calendar className="w-6 h-6 mb-1" />
                                    <span className="text-green-400 text-[11px]">{t("member_since")}</span>
                                    <p className="text-lg font-bold text-gray-300">{profile.date_enrolled ?? "N/A"}</p>
                                </div>
                                <div className="p-5 rounded-2xl w-80 sm:w-70 md:w-50 bg-white/30 flex flex-col justify-center items-center cursor-pointer hover:bg-white/40 shadow-md">
                                    <IdCard className="w-6 h-6 mb-1" />
                                    <span className="text-green-400 text-[11px]">{t("card_number")}</span>
                                    <p className="text-lg font-bold text-gray-300">{profile.cardnumber ?? "N/A"}</p>
                                </div>
                                <div className="p-5 rounded-2xl w-80 sm:w-70 md:w-50 bg-white/10 flex flex-col justify-center items-center cursor-pointer hover:bg-white/20 shadow-md">
                                    <UserCheckIcon className="w-6 h-6 mb-1" />
                                    <span className="text-green-400 text-[11px]">{t("patron_id")}</span>
                                    <p className="text-lg font-bold text-gray-300">{profile.patron_id ?? "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 shadow-xl p-6 space-y-4">
                            <div className="flex items-center mb-2 gap-2">
                                <UserCog2 className="w-6 h-6 text-white" />
                                <h3 className="text-lg font-semibold">{t("additional_details")}</h3>
                            </div>
                            <div className="flex flex-row justify-between ">
                                {/* Left */}
                                <div className="flex flex-col gap-4 text-sm text-white/90">
                                    <div className="flex items-center">
                                        <Calendar1Icon className="w-5 h-5 text-white/60 mr-2" />
                                        <div className="flex flex-col w-full">
                                            <span className="text-[12px]">{t("date_of_birth")}</span>
                                            <span className="text-lg font-bold">{profile.date_of_birth ?? "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Building2Icon className="w-5 h-5 text-white/60 mr-2" />
                                        <div className="flex flex-col w-full">
                                            <span className="text-[12px]">{t("registered_library")}</span>
                                            <span className="text-lg font-bold">{profile.library_id ?? "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <InfoIcon className="w-5 h-5 text-white/60 mr-2" />
                                        <div className="flex flex-col w-full">
                                            <span className="text-[12px]">{t("membership_expiry")}</span>
                                            <span className="text-lg font-bold">{profile.expiry_date ?? "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Right */}
                                <div className="flex flex-col gap-4 text-sm text-white/90">
                                    <div className="flex items-center">
                                        <Contact className="w-5 h-5 text-white/60 mr-2" />
                                        <div className="flex flex-col w-full">
                                            <span className="text-[12px]">{t("updated_on")}</span>
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
                                            <span className="text-[12px]">{t("phone_number")}</span>
                                            <span className="text-lg font-bold">{profile.phone ?? "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <UserRound className="w-5 h-5 text-white/60 mr-2" />
                                        <div className="flex flex-col w-full">
                                            <span className="text-[12px]">{t("gender")}</span>
                                            <span className="text-lg font-bold">
                                                {profile.gender == null
                                                    ? "N/A"
                                                    : (profile.gender === "M" || profile.gender === "m")
                                                        ? t("male")
                                                        : (profile.gender === "F" || profile.gender === "f")
                                                            ? t("female")
                                                            : t("other")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                        {/* Profile Actions */}
                        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 shadow-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold mb-2">{t("profile_actions")}</h3>
                            <div className="flex justify-between gap-2 ">
                                <div className="flex items-center gap-2 justify-center w-1/2 bg-orange-600 rounded-lg px-3 py-2 cursor-pointer hover:bg-orange-500 shadow-lg">
                                    <button 
                                        onClick={() => setEditProfileModal(true)}
                                        className="flex items-center gap-2 justify-center w-full">
                                        <Settings className="w-4 h-4 text-white" />
                                        <div className="text-sm hover:text-white text-white cursor-pointer">{t("edit_profile")}</div>
                                        </button>
                                </div>
                                <button 
                                    onClick={() => setChangePasswordModal(true)}
                                    className="flex items-center gap-2 justify-center w-1/2 bg-white select-none rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 shadow-lg">
                                    <KeyRound className="w-4 h-4 text-black" />
                                    <div className="text-sm hover:text-black text-black cursor-pointer">{t("change_password")}</div>
                                </button>
                            </div>
                        </div>                    
                    </motion.div>

                    {/* Right Panel */}
                    <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="w-full max-w-2xl space-y-6" >
                    {/* Overview */}
                        <SectionCard title={`📊 ${t('account_overview')}`}>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <StatCard label={t("borrowed_books")} value={borrowed.length ?? 0}color="orange" />
                                <StatCard label={t("books_on_hold")} value={holds.length ?? 0} color="blue" />
                                <StatCard label={t("overdue_items")} value={overdues.length ?? 0} color="red" />
                            </div>
                            <p className="text-sm text-white/60">{t("keep_track_of_your_account_status_to_avoid_overdue_items_and_fines")}</p>
                            <div className="gap-4 text-sm flex flex-wrap p-3">
                                <button className="cursor-pointer flex justify-center items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                    onClick={() => {
                                        setBorrowedHistoryModal(true);
                                        fetchCheckoutHistory();
                                    }}
                                >
                                    <BookOpenText className="w-5 h-5" />
                                    {t("view_history")}
                                </button>
                                <button className="cursor-pointer flex justify-center items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                                    onClick={() => {
                                        setAccountInformationModal(true);
                                        fetchAccountInformation();
                                    }}
                                >
                                    <LibraryBig className="w-5 h-5" />
                                    {t("account_credits")}
                                </button>
                            </div>
                        </SectionCard>

                        {/* Overdues */}
                        <SectionCard title={`${t("overdue_items")}`} icon={<CircleAlert className="w-5 h-5" />} textColor="text-red-400" bg="from-red-900/60 to-slate-800" border="border-red-500/20">
                            {overdues.length > 0 ? (
                                overdues.map((book, index) => (
                                    <BookCard
                                        key={index}
                                        title={`📚 ${overdueBookdetails[index]?.title ?? book.title ?? t("untitled")}`}
                                        author={overdueBookdetails[index]?.author ?? book.author ?? t("unknown_author")}
                                        due={new Date(book.due_date ?? t("n/a")).toLocaleString("en-US", { timeZone: "Asia/Singapore", year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        actions={[{
                                            label: t("return_button"),
                                            style: "red",
                                            onClick: () => {
                                                setSelectedBook({ ...overdues[index], borrowedBooks: borrowedBooks[index] });
                                                setReturnModal(true);
                                            }
                                        }]}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-sm text-white/50">{t("no_overdue_items")}</p>
                            )}
                        </SectionCard>

                        {/* Borrowed Books */}
                        <SectionCard title={`${t("borrowed_books")}`} icon={<BookAIcon className="w-5 h-5" />}>
                            {borrowed.length > 0 ? (
                                borrowed
                                    .filter((_, index) => {
                                        const dueDate = new Date(borrowedBooks[index]?.due_date);
                                        return dueDate >= new Date(); // Only show books not overdue
                                    })
                                    .map((book, index) => (
                                        <BookCard
                                            key={index}
                                            title={`📚 ${book.title ?? t("untitled")}`}
                                            author={book.author ?? t("unknown_author")}
                                            due={new Date(borrowedBooks[index]?.due_date ?? t("n/a")).toLocaleString("en-US", { timeZone: "Asia/Singapore", year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            actions={[
                                                {
                                                    label: t("renew_button"),
                                                    style: "orange",
                                                    onClick: () => {
                                                        setSelectedBook({ ...borrowed, borrowedBooks: borrowedBooks[index] });
                                                        fetchRenewDetails(borrowedBooks[index]);
                                                        setRenewModal(true);
                                                    }
                                                },
                                                {
                                                    label: t("return_button"),
                                                    style: "red",
                                                    onClick: () => {
                                                        setReturnModal(true);
                                                    }
                                                }
                                            ]}
                                        />
                                    ))
                            ) : (
                                <p className="text-center text-sm text-white/50">{t("no_borrowed_books")}</p>
                            )}
                        </SectionCard>

                        {/* Books on Hold */}
                        <SectionCard
                            title={`${t("books_on_hold")}`}
                            icon={<BookOpen className="w-5 h-5" />}
                            textColor="text-purple-400"
                            bg="from-purple-900/60 to-slate-800"
                            border="border-purple-400/30"
                        >
                            {books.length > 0 ? (
                                books.map((book, index) => (
                                    <BookCard
                                        key={index}
                                        title={`📚 ${book.title ?? t("untitled")}`}
                                        author={book.author ?? t("unknown_author")}
                                        due={holds[index]?.expiration_date ? new Date(holds[index].expiration_date).toLocaleString("en-US", { year: '2-digit', month: '2-digit', day: '2-digit' }) : t("n/a")}
                                        pickup
                                        actions={[
                                            { 
                                                label: t("more_info_button"), 
                                                style: "green", 
                                                onClick: () => {
                                                    setSelectedBook({ ...book, hold: holds[index] }); 
                                                    setShowBookModal(true);
                                                } 
                                            },
                                            { 
                                                label: t("cancel_button"), 
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
                            <p className="text-center text-sm text-white/50">{t("no_books_on_hold")}</p>
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
                                        {t("cancel_hold")}
                                    </h3>
                                    <div className="mt-2">
                                    <p className="text-sm text-white/80">
                                        {t("_this_action_cannot_be_undone_if_you_have_any_questions_please_contact_your_library")}
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
                                    {t("continue")}
                                </button>
                                <button
                                    onClick={() => {
                                        setCancelModal(false);
                                        setSelectedBook(null);
                                        }}
                                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    type="button"
                                    >
                                    {t("back")}
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
                                        {t("hello")}, {userName}!
                                    </h3>
                                    <div className="mt-2">
                                    <p className="text-sm text-white/80">
                                        {t("please_be_informed_that_returning_books_is_not_supported_by_this_application._you_will_have_to_go_to_the_library_to_return_books._kindly_note_that_fees_may_apply_if_books_are_not_returned_on_or_before_the_due_date._thank_you_for_your_understanding,_and_please_contact_your_library_if_you_have_any_questions.")}
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
                                    {t("understood")}
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
                                        {t("renew_checked-out_books")}
                                    </h3>

                                        <div className="mt-4 space-y-4">
                                            <p className="text-sm text-white/90 text-justify">
                                            {t("renewing_the_book_will_extend_its_return_date_by_another_week_or_more_depending_on_your_librarys_policy_renewal_is_not_guaranteed_if_the_book_is_reserved_by_another_patron_or_if_you_have_reached_your_renewal_limit")}
                                            {t("if_it_is_already_overdue_you_must_return_it_to_the_library")}
                                            </p>

                                            <div className="rounded-lg border border-gray-200 p-4 shadow-sm">
                                                <h4 className="text-sm font-bold text-orange-400 mb-2">{t("renewal_details")}</h4>
                                                <ul className="space-y-1 text-sm text-white-600 flex flex-col justify-between w-full">
                                                    <li><span className="font-medium text-white/40">{t("automatic_renewal")}:</span> {renew.auto_renew ? "Yes" : "No"}</li>
                                                    <li><span className="font-medium text-white/40">{t("checkout_id")}:</span> {renew.checkout_id}</li>
                                                    <li><span className="font-medium text-white/40">{t("library")}:</span> {renew.library_id}</li>
                                                    <li>
                                                    <span className="font-medium text-white/40">{t("last_renewed_on")}:</span>{" "}
                                                    {renew.last_renewed_date
                                                        ? new Intl.DateTimeFormat("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "2-digit",
                                                        }).format(new Date(renew.last_renewed_date))
                                                        : ""}
                                                    </li>
                                                    <li><span className="font-medium text-white/40">{t("renewals_count")}:</span> {renew.renewals_count}</li>
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
                                    {t("continue")}
                                </button>
                                <button
                                    onClick={() => {
                                        setRenewModal(false)
                                        setSelectedBook(null);
                                    }}
                                    className="cursor-pointer mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    type="button"
                                    >
                                    {t("back")}
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
                                        {t("borrowed_history")}
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
                                                            <span className="font-semibold text-orange-500">{t("checkout_id")}:</span>
                                                            <span className="text-white">{item.checkout_id}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-orange-300">{t("item_id")}:</span>
                                                            <span className="text-white">{item.item_id}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-orange-300">{t("library")}:</span>
                                                            <span className="text-white">{item.library_id}</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-orange-300">{t("checked_out_date")}:</span>
                                                            <span className="text-gray-200">{new Date(item.checkout_date).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-orange-300">{t("checked_in_date")}:</span>
                                                            <span className="text-gray-200">{new Date(item.checkin_date).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-orange-300">{t("due_date")}:</span>
                                                            <span className="text-gray-200">{new Date(item.due_date).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-orange-300">{t("renewals")}:</span>
                                                            <span className="text-gray-200">{item.renewals_count}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
                                                            {item.onsite_checkout ? t("onsite") : t("take_home")}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10">
                                            <BookOpenText className="w-10 h-10 text-gray-300 mb-2" />
                                            <p className="text-base text-orange-300 font-medium">{t("no_borrowed_history_found")}</p>
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
                                    {t("close")}
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
                                        Account Credits
                                    </h3>
                                    {accountInformation ? (
                                        <div className="space-y-4">
                                            <div>
                                                <span className="font-semibold text-orange-400">{t("balance")}:</span>
                                                <span className="ml-2 text-white">{accountInformation.balance}</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-green-400">{t("outstanding_credits")}:</span>
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
                                                <span className="font-semibold text-red-400">{t("outstanding_debits")}:</span>
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
                                        <p className="text-base text-orange-300 font-medium">{t("no_account_information_found")}</p>
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
                                    {t("close")}
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
                                            {t("change_password")}
                                        </h3>
                                    </div>
                                    {isChangingPassword ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500 mx-auto"></div>
                                            <h2 className="text-zinc-900 dark:text-white mt-4">{t("loading")}</h2>
                                            <p className="text-zinc-600 dark:text-zinc-400">
                                                {t("changing_your_password_please_wait")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-white/90 text-justify">
                                                {t("please_enter_your_old_password_below")}
                                            </p>
                                            <div className=" w-full">
                                                <input
                                                    type="password"
                                                    placeholder={t("old_password_placeholder")}
                                                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                    onChange={e => setCurrentPassword(e.target.value)}
                                                />
                                            </div>
                                            <p className="text-sm text-white/90 text-justify">
                                                {t("now_enter_your_new_password_below_make_sure_it_is_strong_and_secure")}
                                            </p>
                                            <div className=" w-full">
                                                <input
                                                    type="password"
                                                    placeholder={t("new_password_placeholder")}
                                                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                    value={newPassword}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        setNewPassword(value);
                                                        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{9,}$/;
                                                        if (!passwordRegex.test(value)) {
                                                            setNewPasswordError(t("password_must_be_8_characters_include_lowercase_uppercase_number_and_special_character"));
                                                        } else {
                                                            setNewPasswordError("");
                                                        }
                                                        // Also check confirm password match in real time
                                                        if (!confirmNewPassword) {
                                                            setConfirmNewPasswordError("");
                                                        } else if (value !== confirmNewPassword) {
                                                            setConfirmNewPasswordError(t("passwords_do_not_match"));
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
                                                {t("finally_confirm_your_new_password_by_entering_it_again_below")}
                                            </p>
                                            <div className=" w-full">
                                                <input
                                                    type="password"
                                                    placeholder={t("confirm_new_password_placeholder")}
                                                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                                    value={confirmNewPassword}
                                                    onChange={e => {
                                                        const value = e.target.value;
                                                        setConfirmNewPassword(value);
                                                        if (!value) {
                                                            setConfirmNewPasswordError("");
                                                        } else if (newPassword && value !== newPassword) {
                                                            setConfirmNewPasswordError(t("passwords_do_not_match"));
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
                                        {t("change_password")}
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
                                        {t("close")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {editProfileModal && (
                <div className="fixed h-screen bg-black/80 z-100 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-800 rounded-lg rounded-b-none px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        
                        {/* Header */}
                        <div className="mt-4 p-3">
                            <h3 className="text-2xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                            <PenSquare className="w-6 h-6 text-orange-500" />
                                {t("edit_profile_information")}
                            </h3>
                        </div>

                        {/* Progress Bar */}
                        <div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-xs text-gray-500">{t("step")} {step} {t("of")} 3</span>
                            <span className="text-xs text-gray-500">
                                {Math.round((step / 3) * 100)}%
                            </span>
                            </div>
                        </div>

                        {/* Steps Content */}
                        <div className="space-y-4 mt-6">
                            {step === 1 && (
                            <>
                                <h4 className="text-lg font-semibold text-center text-white">{t("basic_information")}</h4>
                                <label className="text-[12px]">{t("first_name")}:</label>
                                <input
                                    type="text"
                                    placeholder={t("first_name")}
                                    className="inputStyle"
                                    onChange={e => setEditFirstName(e.target.value)}
                                    value={editFirstName}
                                />
                                <label className="text-[12px]">{t("last_name")}:</label>
                                <input
                                    type="text"
                                    placeholder={t("last_name")}
                                    className="inputStyle"
                                    onChange={e => setEditLastName(e.target.value)}
                                    value={editLastName}
                                />
                                <label className="text-[12px]">{t("preferred_name")}:</label>
                                <input
                                    type="text"
                                    placeholder={t("preferred_name")}
                                    className="inputStyle"
                                    value={editPreferredName}
                                    onChange={e => setEditPreferredName(e.target.value)}
                                />
                                <label className="text-[12px]">{t("date_of_birth")}:</label>
                                <input
                                    type="date"
                                    placeholder={t("date_of_birth")}
                                    className="inputStyle"
                                    onChange={e => setEditDateOfBirth(e.target.value)}
                                    value={editDateOfBirth}
                                />
                                <label className="text-[12px]">{t("gender")}:</label>
                                <select
                                    className="inputStyle"
                                    value={editGender}
                                    onChange={e => setEditGender(e.target.value)}
                                >
                                    <option disabled value="">{t("select_gender")}</option>
                                    <option value="M">{t("male")}</option>
                                    <option value="F">{t("female")}</option>
                                    <option value="O">{t("other")}</option>
                                </select>
                            </>
                            )}

                            {step === 2 && (
                            <>
                                <h4 className="text-lg font-semibold text-center text-white">{t("contact_information")}</h4>

                                <label className="text-[12px]">{t("email_address")}:</label>
                                <input
                                    type="email" placeholder={t("email_address")} className="inputStyle"
                                    onChange={e => setEditEmail(e.target.value)}
                                    value={editEmail}
                                />
                                <label className="text-[12px]">{t("secondary_email_address")}:</label>
                                <input
                                    type="email" placeholder={t("secondary_email_address")} className="inputStyle"
                                    onChange={e => setEditSecondaryEmail(e.target.value)}
                                    value={editSecondaryEmail}
                                />
                                <label className="text-[12px]">{t("phone_number_optional")}:</label>
                                <input
                                    type="text" placeholder={t("phone_number_optional")} className="inputStyle"
                                    onChange={e => setEditPhone(e.target.value)}
                                    value={editPhone}
                                />
                                <label className="text-[12px]">{t("mobile_phone")}:</label>
                                <input
                                    type="text" placeholder={t("mobile_phone")} className="inputStyle"
                                    onChange={e => setEditMobile(e.target.value)}
                                    value={editMobile}
                                />
                                <label className="text-[12px]">{t("secondary_phone")}:</label>
                                <input
                                    type="text" placeholder={t("secondary_phone")} className="inputStyle"
                                    onChange={e => setEditSecondaryPhone(e.target.value)}
                                    value={editSecondaryPhone}
                                />
                            </>
                            )}

                            {step === 3 && (
                            <>
                                <h4 className="text-lg font-semibold text-center text-white">{t("address_information")}</h4>
                                <label className="text-[12px]">{t("address_line_1")}:</label>
                                <input 
                                    type="text" placeholder={t("address_line_1")} className="inputStyle" 
                                    onChange={e => setEditAddress(e.target.value)}
                                    value={editAddress}
                                />
                                <label className="text-[12px]">{t("address_line_2")}:</label>
                                <input 
                                    type="text" placeholder={t("address_line_2")} className="inputStyle" 
                                    onChange={e => setEditAddress2(e.target.value)}
                                    value={editAddress2}
                                />
                                <label className="text-[12px]">{t("city")}:</label>
                                <input 
                                    type="text" placeholder={t("city")} className="inputStyle" 
                                    onChange={e => setEditCity(e.target.value)}
                                    value={editCity}
                                />
                                <label className="text-[12px]">{t("state")}:</label>
                                <input 
                                    type="text" placeholder={t("state")} className="inputStyle" 
                                    onChange={e => setEditState(e.target.value)}
                                    value={editState}
                                />
                                <label className="text-[12px]">{t("zipcode")}:</label>
                                <input 
                                    type="text" placeholder={t("zipcode")} className="inputStyle" 
                                    onChange={e => setEditZipcode(e.target.value)}
                                    value={editZipcode}
                                />
                                <label className="text-[12px]">{t("country")}:</label>
                                <input 
                                    type="text" placeholder={t("country")} className="inputStyle" 
                                    onChange={e => setEditCountry(e.target.value)}
                                    value={editCountry}
                                />
                            </>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(prev => Math.max(prev - 1, 1))}
                                className="cursor-pointer inline-flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
                                disabled={step === 1}
                            >
                                <ArrowBigLeft className="w-4 h-4" />
                            </button>
                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(prev => Math.min(prev + 1, 3))}
                                    className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                                    >
                                    <ArrowBigRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    disabled={isUpdatingProfile}
                                    onClick={() => handleUpdateProfile()}
                                    className="cursor-pointer inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                                    >
                                    {isUpdatingProfile ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                            )}
                            </div>
                        </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            onClick={() => setEditProfileModal(false)}
                            className="mb-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 sm:ml-3 sm:w-auto"
                            type="button"
                        >
                            {t("close")}
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {/* TOAST CONTAINER */}
                <ToastContainer/>
            </motion.div>
        </I18nextProvider>
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
                    {pickup ? t("pickup_before") : t("due")}: {due}
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
                                {book?.title ?? t("unknown")}
                            </h3>
                            <h5 className="text-md pl-5 text-white/80">
                                by: {book?.author ?? t("unknown")}
                            </h5>
                            <h5 className="text-sm pl-5 text-white/60">
                                {book?.publisher ?? t("unknown")}
                            </h5>
                            <h5 className="text-[10px] pl-5 text-white/60">
                                {book?.abstract ?? t("no_description_available")}
                            </h5>
                        </div>

                        {book?.hold && (
                            <div className="max-h-120 p-3 overflow-y-auto grid grid-cols-1 gap-4 cursor-pointer ">
                                    <div
                                        className="rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border border-gray-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-200"
                                    >
                                        <div className="flex flex-col justify-between items-center gap-2 mb-2">
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-semibold text-orange-500">{t("hold_date")}:</span>
                                                <span className="text-green-500">{book.hold.hold_date ?? t("unknown")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full">
                                                <span className="font-semibold text-orange-500">{t("queue_number")}:</span>
                                                <span className="text-red-600">{book.hold.priority ?? t("unknown")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-semibold text-orange-300">{t("status")}:</span>
                                                <span className="text-blue">{book.hold.status ?? t("pending")}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 text-sm">
                                            <div className="flex justify-between items-center  w-full">
                                                <span className="font-medium text-orange-300">{t("patron_id")}:</span>
                                                <span className="text-gray-200">{book.hold.patron_id ?? t("unknown")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-medium text-orange-300">{t("pickup_library")}:</span>
                                                <span className="text-gray-200">{book.hold.pickup_library_id ?? t("unknown")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-medium text-orange-300">{t("expiration_date")}:</span>
                                                <span className="text-gray-200">{book.hold.expiration_date ?? t("n/a")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-medium text-orange-300">{t("item_id")}:</span>
                                                <span className="text-gray-200">{book.hold.item_id ?? t("n/a")}</span>
                                            </div>
                                            <div className="flex justify-between items-center  w-full ">
                                                <span className="font-medium text-orange-300">{t("item_level")}:</span>
                                                <span className="text-gray-200">{book.hold.item_level ?? t("unknown")}</span>
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
                        {t("close")}
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
