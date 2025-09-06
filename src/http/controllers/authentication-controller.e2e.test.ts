import { app } from "@/app";
import { describe } from "node:test";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import request from "supertest";
import { prisma } from "@/lib/prisma";

describe("#Authenticate (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  test("should be able to authenticate", async () => {
    await request(app.server).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    const response = await request(app.server).post("/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const cookies = response.get("Set-Cookie");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      token: expect.any(String),
    });
    expect(cookies).toEqual([expect.stringMatching("refresh-token=")]);
  });

  test("should be able to refresh a token", async () => {
    const x = await request(app.server).post("/users").send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    const sessionResponse = await request(app.server).post("/sessions").send({
      email: "johndoe@example.com",
      password: "123456",
    });

    const cookies = sessionResponse.get("Set-Cookie");

    const response = await request(app.server)
      .patch("/refresh")
      .set("Cookie", cookies as string[])
      .send();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      token: expect.any(String),
    });
    expect(response.get("Set-Cookie")).toMatchObject([
      expect.stringMatching("refresh-token="),
    ]);
  });
});
