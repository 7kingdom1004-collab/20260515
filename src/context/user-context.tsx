import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserContextType {
  userRole: string;
  userName: string;
  userTier: string;
  userEmail: string;
  loadingRole: boolean;
}

const UserContext = createContext<UserContextType>({ userRole: 'user', userName: '', userTier: 'free', userEmail: '', loadingRole: true });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState('user');
  const [userName, setUserName] = useState('');
  const [userTier, setUserTier] = useState('free');
  const [userEmail, setUserEmail] = useState('');
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserRole('user');
        setUserName('');
        setUserTier('free');
        setUserEmail('');
        setLoadingRole(false);
        return;
      }

      setUserName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? '');
      setUserEmail(user.email ?? '');

      if (user.email) {
        const { data } = await supabase
          .from('users')
          .select('name, role, tier')
          .eq('email', user.email)
          .single();
        if (data) {
          setUserName(data.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? '');
          setUserRole(data.role ?? 'user');
          setUserTier(data.tier ?? 'free');
        }
      }
      setLoadingRole(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUserRole('user');
        setUserName('');
        setUserTier('free');
        setUserEmail('');
        setLoadingRole(false);
      } else {
        setLoadingRole(true);
        loadUser();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return <UserContext.Provider value={{ userRole, userName, userTier, userEmail, loadingRole }}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
