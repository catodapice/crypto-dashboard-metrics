import React, { createContext, useContext, useState, useEffect } from "react";
import { bitmexService } from "../services/bitmexService";

interface Account {
  name: string;
  apiKey: string;
  apiSecret: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  addAccount: (account: Account) => void;
  selectAccount: (account: Account) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const addAccount = (account: Account) => {
    setAccounts((prev) => [...prev, account]);
    setSelectedAccount(account);
    bitmexService.setCredentials(account.apiKey, account.apiSecret);
  };

  const selectAccount = (account: Account) => {
    setSelectedAccount(account);
    bitmexService.setCredentials(account.apiKey, account.apiSecret);
  };

  return (
    <AccountContext.Provider
      value={{ accounts, selectedAccount, addAccount, selectAccount }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountProvider");
  }
  return context;
};
