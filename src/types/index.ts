export interface User {
  username: string;
  secureWord: string;
  issuedAt: number;
  hashedPassword?: string;
  mfaAttempts: number;
  isLocked: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type:
    | "Credit"
    | "Debit"
    | "Bank Transfer"
    | "Digital Wallets"
    | "Cryptocurrency ";
  balance: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
