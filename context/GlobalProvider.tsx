import React, {createContext, useContext, useEffect, useState} from "react";
import {getCurrentUser} from "@/lib/appwrite";
import {UserSession} from "@/types";

interface GlobalContext {
  isLoggedIn: boolean,
  setIsLoggedIn:  React.Dispatch<React.SetStateAction<boolean>>,
  user: UserSession | null,
  setUser: React.Dispatch<React.SetStateAction<UserSession | null>>,
  isLoading: boolean
}

const initialGlobalState: GlobalContext = {
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  isLoading: false
}

const GlobalContext = createContext<GlobalContext>(initialGlobalState);
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({children}: {children: React.ReactNode}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    getCurrentUser().then(res => {
      if (res) {
        setIsLoggedIn(true);
        setUser(res);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    })
        .catch(() => {})
        .finally(() => setIsLoading(false))
  }, []);
  return (
      <GlobalContext.Provider
        value={{
          isLoggedIn,
          user,
          setUser,
          setIsLoggedIn,
          isLoading
        }}
      >
        {children}
      </GlobalContext.Provider>
  )
}

export default GlobalProvider