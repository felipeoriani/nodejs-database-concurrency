import { pool } from './pg/index.js'

export async function main() {
  const script = `
DROP TABLE IF EXISTS "Seat" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "Seat" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NULL,
  "version" INTEGER NOT NULL DEFAULT 1,

  CONSTRAINT "PK_Seat" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "name" TEXT,

  CONSTRAINT "PK_User" PRIMARY KEY ("id")
);

ALTER TABLE "Seat" ADD CONSTRAINT "FK_User_on_a_Seat" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
`
  const client = await pool.connect()

  console.log('Resetting database...')
  await client.query(script)

  console.log('Inserting data...')

  await client.query('BEGIN;')
  for (let i = 1; i <= 1200; i++) {
    await client.query(`INSERT INTO "User" ("name") VALUES ('User ${i}');`)
  }
  for (let i = 1; i <= 1000; i++) {
    await client.query(`INSERT INTO "Seat" ("version") VALUES (1);`)
  }
  await client.query('COMMIT;')

  client.release()
  console.log('Database reset successfully!')
}
