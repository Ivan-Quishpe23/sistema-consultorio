'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { StoreContext, getStore, subscribe, type Store } from '@/lib/store'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => getStore())

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setStore(getStore())
    })
    return unsubscribe
  }, [])

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  )
}
