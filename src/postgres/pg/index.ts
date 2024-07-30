import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: Number(process.env.POSTGRES_PORT) || 5432,
  idleTimeoutMillis: 30000,
})

/**
 * Count the number of busy seats (where userId column is not null).
 * @returns Number of busy seats.
 */
export async function countBusySeats(): Promise<number> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT count(*) FROM "Seat" WHERE "userId" IS NOT NULL')
    return Number(result.rows[0].count)
  } finally {
    client.release()
  }
}
