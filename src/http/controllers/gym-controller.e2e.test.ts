import { app } from "@/app";
import { createAndAuthenticateUser } from "@/utils/test/create-and-auth-user";
import { describe } from "node:test";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";
import request from "supertest";
import { prisma } from "@/lib/prisma";

describe("#Gym (e2e)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await prisma.$transaction([
      prisma.gym.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  describe("[Create]", async () => {
    test("should be able to create a gym", async () => {
      const { token } = await createAndAuthenticateUser(app, true);

      const response = await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "JavaScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.2092052,
          longitude: -49.6401091,
        });

      expect(response.statusCode).toEqual(201);
    });
  });

  describe("[List]", async () => {
    test("should be able to list nearby gyms", async () => {
      const { token } = await createAndAuthenticateUser(app, true);

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "JavaScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.2092052,
          longitude: -49.6401091,
        });

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "TypeScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.0610928,
          longitude: -49.5229501,
        });

      const response = await request(app.server)
        .get("/gyms/nearby")
        .query({
          latitude: -27.2092052,
          longitude: -49.6401091,
        })
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.statusCode).toEqual(200);
      const gyms = response.body.gyms;
      expect(gyms).toHaveLength(1);
      expect(gyms).toMatchObject([
        {
          title: "JavaScript Gym",
        },
      ]);
    });

    test("should be able to list nearby gyms", async () => {
      const { token } = await createAndAuthenticateUser(app, true);

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "JavaScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.2092052,
          longitude: -49.6401091,
        });

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "TypeScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.0610928,
          longitude: -49.5229501,
        });

      const response = await request(app.server)
        .get("/gyms/nearby")
        .query({
          latitude: -27.2092052,
          longitude: -49.6401091,
        })
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.statusCode).toEqual(200);
      const gyms = response.body.gyms;
      expect(gyms).toHaveLength(1);
      expect(gyms).toMatchObject([
        {
          title: "JavaScript Gym",
        },
      ]);
    });

    test("should be able to search gyms by title", async () => {
      const { token } = await createAndAuthenticateUser(app, true);

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "JavaScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.2092052,
          longitude: -49.6401091,
        });

      await request(app.server)
        .post("/gyms")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "TypeScript Gym",
          description: "Some description.",
          phone: "1199999999",
          latitude: -27.2092052,
          longitude: -49.6401091,
        });

      const response = await request(app.server)
        .get("/gyms/search")
        .query({
          q: "JavaScript",
        })
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(response.statusCode).toEqual(200);
      expect(response.body.gyms).toHaveLength(1);
      expect(response.body.gyms).toEqual([
        expect.objectContaining({
          title: "JavaScript Gym",
        }),
      ]);
    });
  });
});
