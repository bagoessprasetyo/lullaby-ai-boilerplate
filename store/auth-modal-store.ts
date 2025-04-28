// store/auth-modal-store.ts
import { create } from 'zustand';

type AuthModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
