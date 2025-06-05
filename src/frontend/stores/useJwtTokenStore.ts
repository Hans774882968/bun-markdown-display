import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface JwtTokenState {
  uname: string | null
  isAdmin: boolean | null
  jwtToken: string | null;
  // eslint-disable-next-line no-unused-vars
  setJwtTokenState: (token: string) => void;
  clearJwtTokenState: () => void;
}

export const useJwtTokenStore = create<JwtTokenState>()(
  persist(
    (set) => ({
      jwtToken: '',
      uname: '',
      isAdmin: false,
      setJwtTokenState: (token) => {
        if (!token) {
          set({ jwtToken: null, uname: null, isAdmin: null });
          return;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 > Date.now()) {
            set({ jwtToken: token, uname: payload.uname, isAdmin: payload.isAdmin });
          } else {
            set({ jwtToken: null, uname: null, isAdmin: null });
          }
        } catch {
          set({ jwtToken: null, uname: null, isAdmin: null });
        }
      },
      clearJwtTokenState: () => set({ jwtToken: null, uname: null, isAdmin: null }),
    }),
    {
      name: 'JWT_TOKEN',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
