"use client";

import { useEffect, useState } from "react";
import { MessageSquarePlus, Settings, Search, MoreHorizontal, Trash2, PanelLeftIcon, Globe2, MegaphoneIcon, Calendar1, Edit2Icon, Edit, Save, Cross, X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios"; // Add this import
import { ToastContainer, toast } from 'react-toastify';
import { Dialog } from "@headlessui/react"; // Add this import (or use any modal library)

export default function ChatSidebar({
    onSidebarToggle,
    sidebarOpen,
    onSelectChat,
    onNewChat,
}: {
    onSidebarToggle: () => void,
    sidebarOpen: boolean,
    onSelectChat: (messages: any[], sessionId: number | null, chatName: string | null) => void,
    onNewChat: () => void,
}) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedChat, setSelectedChat] = useState<number | null>(1)
    const [isGuest, setIsGuest] = useState<boolean>(false);
    const [patronId, setPatronId] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [chatHistories, setChatHistories] = useState<any[]>([]);
    const [editIdx, setEditIdx] = useState<number | null>(null);
    const [editChatName, setEditChatName] = useState<string>("");
    const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // BACKEND URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const storedPatronId = localStorage.getItem('patron_id');
        const storedCardNumber = localStorage.getItem('cardNumber');
        const storedUsername = localStorage.getItem('username');
        const guestValue = localStorage.getItem("isGuest") === "true";
        setIsGuest(guestValue);
        setPatronId(storedPatronId);
        setCardNumber(storedCardNumber);
        setUserName(storedUsername);

        // Fetch chat history if card number exists
        if (storedCardNumber) {
            // const fetchChatHistory = async () => {
            //     try {
            //         const response = await axios.get(`${backendUrl}/api/chat/get-chat-history?cardnumber=${storedCardNumber}`);
            //         setChatHistories(response.data as any[]);
            //         console.log("Chat history fetched:", response.data);
            //     } catch (error) {
            //         console.error("Failed to fetch chat history:", error);
            //     }
            // };
            // fetchChatHistory();
        }
    }, []);

    const handleEditClick = (idx: number, currentName: string) => {
        setEditIdx(idx);
        setEditChatName(currentName || "");
    };

    const handleEditSave = async (chat: any, idx: number) => {
        try {
            const params = new URLSearchParams();
            params.append("newName", editChatName);
            await axios.put(
                `${backendUrl}/api/chat/update-chat-name/${chat.cardNumber || cardNumber}/${chat.sessionId}`,
                params,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );
            setChatHistories(prev =>
                prev.map((c, i) =>
                    i === idx
                        ? { ...c, chatName: editChatName, name: editChatName }
                        : c
                )
            );
            handleToast("Chat name updated successfully", "success");
            setEditIdx(null);
        } catch (error) {
            console.error("Failed to update chat name:", error);
            handleToast("Failed to update chat name", "error");
        }
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
    const handleDeleteClick = (idx: number) => {
        setDeleteIdx(idx);
        setShowDeleteModal(true);
    };


    const handleDeleteConfirm = async () => {
        if (deleteIdx === null) return;
        const chat = chatHistories[deleteIdx];
        try {
            await axios.delete(
                `${backendUrl}/api/chat/delete-session/${chat.cardNumber || cardNumber}/${chat.sessionId}`
            );
            setChatHistories(prev => prev.filter((_, i) => i !== deleteIdx));
            handleToast("Chat deleted successfully", "success");
        } catch (error) {
            console.error("Failed to delete chat:", error);
            handleToast("Failed to delete chat", "error");
        }
        setShowDeleteModal(false);
        setDeleteIdx(null);
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeleteIdx(null);
    };
    // const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <div className="w-80 h-screen bg-[rgba(26,30,44,1)] flex flex-col z-99 absolute md:relative ">
            <div className="flex-1 flex flex-col">
                {/* LOGO */}
                <div className="select-none flex justify-between items-center p-5.5 bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b border-white/5 bg-[rgba(26,30,44,1)]">
                    <h1 className="text-2xl font-bold text-white text-center">AI Librarian  </h1>
                    <PanelLeftIcon
                        className="md:hidden lg:hidden"
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={onSidebarToggle}
                    />
                </div>
                {/* NEW CHAT */}
                <div className="p-4 bg-[rgba(26,30,44,1)]">
                    <button
                        className="cursor-pointer rounded-lg flex justify-center items-center w-full h-12 w-full gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white border-none shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                        onClick={() => {
                            setSelectedChat(null);
                            onNewChat();
                        }}
                    >
                        <MessageSquarePlus className="h-4 w-4" />
                        New Chat
                    </button>
                </div>
                {/* SEARCH */}
                <div className="bg-[rgba(26,30,44,1)] flex min-h-0 flex-col gap-2 overflow-auto">
                    <label className="text-sidebar-foreground/70 ring-sidebar-ring flex shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden text-[#bdb4b4f7]">
                        Search Chats
                    </label>
                    <div className="relative px-5 py-2">
                    <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-white/40 focus:border-orange-500/25 focus:ring-orange-500/20 w-full h-10 rounded-md"
                    />
                    </div>
                </div>
                {/* RECENT CHATS */}
                <div className="bg-[rgba(13, 17, 31, 1)] flex min-h-100 md:min-h-100 lg:min-h-100  mt-2 flex-col gap-2 overflow-auto overflow-y-auto max-h-[400px]">
                    <label className="text-sidebar-foreground/70 ring-sidebar-ring flex shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden text-[#bdb4b4f7]">
                        Recent Chats
                    </label>
                    <div className="group/menu-item relative p-4 flex flex-col gap-2 ">
                        {chatHistories.length === 0 ? (
                            <span className="text-white/40 text-xs">No chat history found.</span>
                        ) : (
                            chatHistories.map((chat, idx) => (
                                <div
                                    key={chat.sessionId}
                                    onClick={() => {
                                        setSelectedChat(idx);
                                        onSelectChat(chat.messages, chat.sessionId, chat.chatName);
                                    }}
                                    className={`w-full cursor-pointer rounded-xl justify-start flex-col flex p-3 h-auto hover:bg-slate-800/60 transition-all duration-200 bg-[rgba(24,27,41,1)] select-none ${
                                        selectedChat === idx
                                            ? "bg-gradient-to-r from-orange-500/20 via-orange-600/15 to-transparent border-l-2 border-orange-500 shadow-lg"
                                            : "bg-gradient-to-r from-blue-700/20 via-blue-900/15 to-transparent border-l-2 border-blue-900/50 "
                                    }`}
                                >
                                    <div className="flex items-center justify-between  ">
                                        <div className="flex text-left flex-col w-full ">
                                            {editIdx === idx ? (
                                                <form
                                                    onSubmit={e => {
                                                        e.preventDefault();
                                                        handleEditSave(chat, idx);
                                                    }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <input
                                                        type="text"
                                                        value={editChatName}
                                                        onChange={e => setEditChatName(e.target.value)}
                                                        className="text-[#e5e5e5] bg-slate-700 rounded px-2 py-1 text-sm"
                                                        autoFocus
                                                    />
                                                    <button type="submit" className="  cursor-pointer text-green-500 hover:text-green-700">
                                                        <Save />
                                                    </button>
                                                    <button type="button" className=" rounded-2xl bg-gray-600 cursor-pointer text-white/50 hover:text-red-300" onClick={() => setEditIdx(null)}>
                                                        <X />
                                                    </button>
                                                </form>
                                            ) : (
                                                    <div className="flex flex-row items-center justify-between w-full  ">
                                                        <div className="flex flex-col ">
                                                            <span className="text-[#e5e5e5] text-left ">
                                                                {chat.name || "Chat Session"}
                                                            </span>
                                                            <span className="text-[#bdb4b4f7] text-[10px] text-left ">
                                                                {chat.startTime ? new Date(chat.startTime).toLocaleString() : ""}
                                                            </span>
                                                            <span className="text-[#bdb4b4f7] text-[10px] text-left ">
                                                                {chat.sessionId ? `Session: ${chat.sessionId}` : ""} (Debug Mode)
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {selectedChat === idx ? (
                                                                <div className="flex gap">
                                                                    <button
                                                                        className="h-8 w-8 opacity-80 cursor-pointer hover:opacity-100 text-red-400 hover:text-red-600 flex items-center justify-center"
                                                                        title="Delete"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            handleDeleteClick(idx);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-5 w-5" />
                                                                    </button>
                                                                    <button
                                                                        className="h-8 w-8 opacity-80 cursor-pointer hover:opacity-100 text-blue-400 hover:text-blue-600 flex items-center justify-center"
                                                                        title="Edit"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            handleEditClick(idx, chat.chatName);
                                                                        }}
                                                                    >
                                                                        <Edit className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button className="h-8 w-8 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white flex items-center justify-center">
                                                                    <MoreHorizontal className="h-6 w-6 text-white/60" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                            )
                                            }
                                        </div>
                                        {/* <div>
                                            {selectedChat === idx ? (
                                                <div className="flex gap">
                                                    <button className="h-8 w-8 opacity-80 cursor-pointer hover:opacity-100 text-red-400 hover:text-red-600 flex items-center justify-center" title="Delete">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        className="h-8 w-8 opacity-80 cursor-pointer hover:opacity-100 text-blue-400 hover:text-blue-600 flex items-center justify-center"
                                                        title="Edit"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleEditClick(idx, chat.chatName);
                                                        }}
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="h-8 w-8 opacity-50 cursor-pointer hover:opacity-100 text-white/60 hover:text-white flex items-center justify-center">
                                                    <MoreHorizontal className="h-6 w-6 text-white/60" />
                                                </button>
                                            )}
                                        </div> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {/* SETTINGS */}
            <div className=" bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-t border-white/5 bg-[rgba(26,30,44,1)]">
                <button className="cursor-pointer rounded-lg flex justify-start pl-4 items-center w-full h-12 w-full gap-2  text-white  transition-all duration-300">
                    <Calendar1 className="h-4 w-4" />
                    Events
                </button>
                <button className="cursor-pointer rounded-lg flex justify-start pl-4 items-center w-full h-12 w-full gap-2  text-white  transition-all duration-300">
                    <MegaphoneIcon className="h-4 w-4" />
                    Forums
                </button>
                <button className="cursor-pointer rounded-lg flex justify-start pl-4 items-center w-full h-12 w-full gap-2  text-white  transition-all duration-300">
                    <Globe2 className="h-4 w-4" />
                    Community
                </button>
                <button className="cursor-pointer rounded-lg flex justify-start pl-4 items-center w-full h-12 w-full gap-2  text-white  transition-all duration-300">
                    <Settings className="h-4 w-4" />
                    Settings
                </button>
                
                {/* Footer */}
                <div className="border-t border-white/5 p-2 w-full flex justify-center">
                    <span className="text-xs text-center text-white/60">© 2025 Ntek Systems Inc</span>
                </div>
            </div>
            <ToastContainer />

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <Dialog open={showDeleteModal} onClose={handleDeleteCancel} className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="fixed inset-0 bg-black/50" />
                        <Dialog.Panel className="bg-white rounded-lg p-6 z-50 shadow-xl">
                            <Dialog.Title className="text-lg font-bold mb-2">Delete Chat?</Dialog.Title>
                            <Dialog.Description className="mb-4">
                                Are you sure you want to delete this chat? This action cannot be undone.
                            </Dialog.Description>
                            <div className="flex gap-4 justify-end">
                                <button
                                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                    onClick={handleDeleteCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleDeleteConfirm}
                                >
                                    Delete
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
