'use client';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isGuest: boolean;
    cardNumber: string | null;
    patronId: string | null;
    login: (cardNumber: string, patronId: string) => void;
    continueAsGuest: () => void;
    logout: () => void;
    }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
const [cardNumber, setCardNumber] = useState<string | null>(null);
const [patronId, setPatronId] = useState<string | null>(null);
const [isGuest, setIsGuest] = useState(false);

useEffect(() => {
    const storedCard = localStorage.getItem('cardNumber');
    const storedId = localStorage.getItem('patron_id');
    const guestMode = localStorage.getItem('guest') === 'true';

    setCardNumber(storedCard);
    setPatronId(storedId);
    setIsGuest(guestMode);
}, []);

const login = (card: string, id: string) => {
    setCardNumber(card);
    setPatronId(id);
    setIsGuest(false);
    localStorage.setItem('cardNumber', card);
    localStorage.setItem('patron_id', id);
    localStorage.removeItem('guest');
};

const continueAsGuest = () => {
    setCardNumber(null);
    setPatronId(null);
    setIsGuest(true);
    localStorage.removeItem('cardNumber');
    localStorage.removeItem('patron_id');
    localStorage.setItem('guest', 'true');
};

const logout = () => {
    setCardNumber(null);
    setPatronId(null);
    setIsGuest(false);
    localStorage.clear();
};

return (
    <AuthContext.Provider
    value={{
        isAuthenticated: !!cardNumber && !isGuest,
        isGuest,
        cardNumber,
        patronId,
        login,
        continueAsGuest,
        logout
    }}
    >
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
