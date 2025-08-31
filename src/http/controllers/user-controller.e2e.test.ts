import { app } from "@/app";
import { describe } from "node:test";
import { afterAll, beforeAll, expect, test } from "vitest";
import request from "supertest";

describe("#User (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test("should be able to create a user", async () => {
    const response = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: "John Doe",
        email: "johndoe@example.com",
      })
    );
  });
});
