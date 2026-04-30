import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart updated:', cart);
  }, [cart]);

  const clampToAvailableStock = (item, desiredQuantity) => {
    const stock = typeof item?.stock === 'number' && Number.isFinite(item.stock)
      ? Math.max(0, Math.floor(item.stock))
      : null;
    if (stock === null) return Math.max(1, desiredQuantity);
    if (stock === 0) return 0;
    return Math.min(stock, Math.max(1, desiredQuantity));
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const nextQuantity = clampToAvailableStock(
          { ...existingItem, stock: existingItem.stock ?? product.stock },
          (existingItem.quantity || 1) + quantity
        );
        if (nextQuantity <= 0) return prevCart;
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, ...product, quantity: nextQuantity }
            : item
        );
      }
      const nextQuantity = clampToAvailableStock(product, quantity);
      if (nextQuantity <= 0) return prevCart;
      return [...prevCart, { ...product, quantity: nextQuantity }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prevCart => {
        const next = prevCart.map(item => {
          if (item.id !== id) return item;
          const clamped = clampToAvailableStock(item, newQuantity);
          return { ...item, quantity: clamped };
        });
        return next.filter((item) => (item.quantity || 0) > 0);
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};