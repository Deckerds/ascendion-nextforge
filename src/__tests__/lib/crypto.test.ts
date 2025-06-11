import {
  hashPassword,
  generateSecureWord,
  generateMfaCode,
} from "@/lib/crypto";

describe("Crypto utilities", () => {
  describe("hashPassword", () => {
    it("returns consistent hash for same password", () => {
      const password = "testpassword123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it("returns different hashes for different passwords", () => {
      const hash1 = hashPassword("password1");
      const hash2 = hashPassword("password2");

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateSecureWord", () => {
    it("generates 8-character uppercase secure word", () => {
      const secureWord = generateSecureWord("testuser", Date.now());

      expect(secureWord).toHaveLength(8);
      expect(secureWord).toMatch(/^[A-Z0-9]+$/);
    });

    it("generates different words for different users", () => {
      const timestamp = Date.now();
      const word1 = generateSecureWord("user1", timestamp);
      const word2 = generateSecureWord("user2", timestamp);

      expect(word1).not.toBe(word2);
    });
  });

  describe("generateMfaCode", () => {
    it("generates 6-digit MFA code", () => {
      const code = generateMfaCode("testuser");

      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[a-f0-9]{6}$/);
    });
  });
});
