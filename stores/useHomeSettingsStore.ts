import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type HomeBackdrop = 'plain' | 'stars' | 'aurora';

interface HomeSettingsState {
  backdrop: HomeBackdrop;
  sound: boolean;
  setBackdrop: (backdrop: HomeBackdrop) => void;
  setSound: (sound: boolean) => void;
}

// 메인 폴더 페이지의 설정 카드에서 고른 값 (테마는 next-themes가 따로 저장한다)
const useHomeSettingsStore = create<HomeSettingsState>()(
  persist(
    (set) => ({
      backdrop: 'plain',
      sound: false,
      setBackdrop: (backdrop) => set({ backdrop }),
      setSound: (sound) => set({ sound }),
    }),
    {
      name: 'home-settings',
      // 서버에서는 window가 없어 저장소를 쓰지 않는다 (Node의 전역 localStorage를 건드리지 않게)
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

export default useHomeSettingsStore;
