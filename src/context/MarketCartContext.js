import { createContext, useContext, useState } from 'react';

const MarketCartContext = createContext();

export const useMarketCart = () => {
    const context = useContext(MarketCartContext);
    if (!context) {
        throw new Error('useMarketCart must be used within a MarketCartProvider');
    }
    return context;
};

export const MarketCartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        // Create a unique ID for the cart item (timestamp based)
        const newItem = {
            ...item,
            cartId: Date.now().toString() + Math.random().toString(36).substring(7)
        };
        setCartItems((prev) => [...prev, newItem]);
    };

    const removeFromCart = (cartId) => {
        setCartItems((prev) => prev.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartCount = () => {
        return cartItems.length;
    };

    return (
        <MarketCartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartCount }}>
            {children}
        </MarketCartContext.Provider>
    );
};
