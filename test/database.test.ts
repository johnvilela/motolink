import pg from "pg";
import { afterEach, describe, expect, it } from "vitest";
import { cleanDatabase } from "./helpers/clean-database";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
});

afterEach(async () => {
	await cleanDatabase();
});

describe("Database test suite", () => {
	it("should insert and query a user", async () => {
		await pool.query(
			`INSERT INTO users (id, name, email, role, status, "updatedAt")
			 VALUES ($1, $2, $3, $4, $5, NOW())`,
			["test-id-1", "John Doe", "john@example.com", "USER", "PENDING"],
		);

		const result = await pool.query("SELECT * FROM users WHERE id = $1", [
			"test-id-1",
		]);

		expect(result.rows).toHaveLength(1);
		expect(result.rows[0].name).toBe("John Doe");
		expect(result.rows[0].email).toBe("john@example.com");
	});

	it("should have a clean database after previous test", async () => {
		const result = await pool.query("SELECT * FROM users");
		expect(result.rows).toHaveLength(0);
	});
});
