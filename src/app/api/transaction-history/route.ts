import { NextResponse } from "next/server";
import { Transaction, ApiResponse } from "@/types";

const mockTransactions: Transaction[] = [
  {
    id: "txn_001",
    date: "2024-01-15",
    description: "Online Purchase - Amazon",
    amount: -89.99,
    type: "Debit",
    balance: 2310.01,
  },
  {
    id: "txn_002",
    date: "2024-01-14",
    description: "Salary Deposit",
    amount: 2400.0,
    type: "Bank Transfer",
    balance: 2400.0,
  },
  {
    id: "txn_003",
    date: "2024-01-12",
    description: "Coffee Shop",
    amount: -4.5,
    type: "Cryptocurrency ",
    balance: 0.0,
  },
  {
    id: "txn_004",
    date: "2024-01-10",
    description: "ATM Withdrawal",
    amount: -100.0,
    type: "Debit",
    balance: 4.5,
  },
  {
    id: "txn_005",
    date: "2024-01-08",
    description: "Grocery Store",
    amount: -45.25,
    type: "Credit",
    balance: 104.5,
  },
  {
    id: "txn_006",
    date: "2024-01-05",
    description: "Freelance Payment",
    amount: 149.75,
    type: "Digital Wallets",
    balance: 149.75,
  },
];

export async function GET() {
  try {
    // if we want we can validate the token here do it here

    return NextResponse.json<ApiResponse<Transaction[]>>({
      success: true,
      data: mockTransactions,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
