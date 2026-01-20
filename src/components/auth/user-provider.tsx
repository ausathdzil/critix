'use client';

import { UserPublic as User } from '@/lib/db/schema';
import {
  createContext,
  ReactNode,
  use,
  useContext,
} from 'react';

const UserContext = createContext<User | null | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  // `null` is a valid value (logged out). `undefined` means no provider.
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  const user = use(userPromise);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
