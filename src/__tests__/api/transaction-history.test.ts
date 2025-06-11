/**
 * @jest-environment node
 */

import { GET } from "../../app/api/transaction-history/route";

describe("/api/transactions", () => {
  it("returns mock transactions data", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);

    const firstTransaction = data.data[0];
    expect(firstTransaction).toHaveProperty("id");
    expect(firstTransaction).toHaveProperty("date");
    expect(firstTransaction).toHaveProperty("description");
    expect(firstTransaction).toHaveProperty("amount");
    expect(firstTransaction).toHaveProperty("type");
    expect(firstTransaction).toHaveProperty("balance");
  });

  it("returns transactions with correct mock data", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.data).toMatchObject([
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
    ]);
  });
});
