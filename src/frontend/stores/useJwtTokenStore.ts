import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface JwtTokenState {
  jwtToken: string | null;
  uname: string | null;
  setJwtTokenAndUname: (token: string) => void;
  clearJwtTokenAndUname: () => void;
}

export const useJwtTokenStore = create<JwtTokenState>()(
  persist(
    (set) => ({
      jwtToken: '',
      uname: '',
      setJwtTokenAndUname: (token) => {
        if (!token) {
          set({ jwtToken: null, uname: null });
          return;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            set({ jwtToken: token, uname: payload.uname });
          } else {
            set({ jwtToken: null, uname: null });
          }
        } catch {
          set({ jwtToken: null, uname: null });
        }
      },
      clearJwtTokenAndUname: () => set({ jwtToken: null, uname: null }),
    }),
    {
      name: 'JWT_TOKEN',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
