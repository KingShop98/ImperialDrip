import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProductVariant {
  id: number;
  product_id: number;
  size_or_ml: string;
  color: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  brand: string;
  image_url: string;
  is_featured: boolean;
  is_offer: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface AppState {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (productId: number, variantId: number) => void;
  updateQuantity: (productId: number, variantId: number, quantity: number) => void;
  clearCart: () => void;
  
  user: any | null;
  setUser: (user: any | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product, variant, quantity) =>
        set((state) => {
          const existingItem = state.cart.find(
            (item) => item.product.id === product.id && item.variant.id === variant.id
          );
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id && item.variant.id === variant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { product, variant, quantity }] };
        }),
      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.product.id === productId && item.variant.id === variantId)
          ),
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId && item.variant.id === variantId
              ? { ...item, quantity }
              : item
          ),
        })),
      clearCart: () => set({ cart: [] }),
      
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'imperial-drip-storage',
    }
  )
);
