import { create } from 'zustand';

interface CategoryState {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const useCategoryStore = create<CategoryState>((set) => ({
  selectedCategory: 'All',
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));

export default useCategoryStore;