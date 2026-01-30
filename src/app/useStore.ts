import { create } from 'zustand'

interface Store {
    isMobile: boolean | null,
    setIsMobile: (isMobile: boolean) => void

    openContact: boolean,
    setOpenContact: (openContact: boolean) => void

    shouldShuffle: boolean,
    setShouldShuffle: (shouldShuffle: boolean) => void

    loaded: boolean,
    setLoaded: (loaded: boolean) => void
}

export const useStore = create<Store>((set) => ({
    isMobile: null,
    setIsMobile: (isMobile) => set({ isMobile }),

    openContact: false,
    setOpenContact: (openContact) => set({ openContact }),

    shouldShuffle: false,
    setShouldShuffle: (shouldShuffle) => set({ shouldShuffle }),

    loaded: false,
    setLoaded: (loaded) => set({ loaded }),
}))