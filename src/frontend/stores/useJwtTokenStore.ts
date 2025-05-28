import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserPublicFieldsStore } from '@/types/auth';

interface JwtTokenState extends UserPublicFieldsStore {
  jwtToken: string | null;
  setJwtTokenAndUname: (token: string) => void;
  clearJwtTokenAndUname: () => void;
}

export const useJwtTokenStore = create<JwtTokenState>()(
  persist(
    (set) => ({
      jwtToken: '',
      uname: '',
      isAdmin: false,
      setJwtTokenAndUname: (token) => {
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
      clearJwtTokenAndUname: () => set({ jwtToken: null, uname: null, isAdmin: null }),
    }),
    {
      name: 'JWT_TOKEN',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
