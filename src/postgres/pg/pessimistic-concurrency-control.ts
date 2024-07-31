import { countBusySeats, pool } from './index.js'

const message = `
PESSIMISTIC CONCURRENCY CONTROL
 In this approach we use a pessimistic concurrency control strategy to avoid multiples users to get the same record by locking the row.
 This is a useful case when conflicts are common and we want to avoid lost updates.
 This approach costs more resources but it can be useful when we have a high rate of conflicts.
`
console.log('Starting the pesimistic concurrency control example...')

const result = {
  /**
   * Number of users that will try to get a seat.
   */
  users: 1200,
  /**
   * Number of seats that were updated.
   */
  updated: 0,
  /**
   * Number of users that were rejected because there were no available seats.
   */
  rejected: 0,
  /**
   * Number of busy seats.
   */
  busy: 0,
}

// all the users will try to get a seat.
const promises = []
for (let id = 1; id <= result.users; id++) {
  promises.push(seatUser(id))
}

console.log('Seating users... (pesimistic concurrency control)')

// wait for all the promises to be resolved.
await Promise.allSettled(promises)
  .then((values) => {
    result.updated = values.filter((x) => x.status === 'fulfilled').length
    result.rejected = values.filter((x) => x.status === 'rejected').length
  })
  .catch((err) => {
    console.error(err.message)
  })

// get the number of busy seats.
result.busy = await countBusySeats()

// show the results in the console.
console.clear()
console.log(message)
console.log(`
Expected Result:
{
  "users": ${result.users},
  "updated": 1000,
  "rejected": 200,
  "busy": 1000
}`)
console.log(`
Process Result:
${JSON.stringify(result, null, 2)}
`)

console.log(`
Considering we have more users than seats, some users will be rejected because there are no available seats.
Also the number of busy seats will be equal to the number of updated seats because all the seats were updated.
The conflicts were managed by the row locking for 'FOR UPDATE' in the SQL query.
`)

process.exit(0)

/**
 * Try to seat a user using the pessimistic concurrency control strategy.
 * @param userId User id.
 * @returns Seat id or throw an error if there are no available seats.
 */
async function seatUser(userId: number): Promise<number | null> {
  // open the database connection from the pool.
  const client = await pool.connect()
  try {
    // start a transaction.
    await client.query('BEGIN;')

    // try to get a seat that is not assigned to any user considering in the query:
    //`FOR UPDATE` to lock the table row and `SKIP LOCKED` to skip the rows that are already locked.
    // Reference: https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS
    const result = await client.query('select id from "Seat" where "userId" is null limit 1 FOR UPDATE SKIP LOCKED;')

    // if there are no available seats, rollback the transaction and throw an error.
    if (result.rowCount === 0) {
      await client.query('ROLLBACK;')
      throw new Error('No available seats.')
    }

    // get the seat id of the available seat.
    const seatId = result.rows[0].id

    // Update the seat with the userId following the pessimistic concurrency control.
    // Since the table row of the seat is locked with `FOR UPDATE`,
    // no other transactions can update the seat until this transaction is finished (committed or rolled back) :)
    await client.query('update "Seat" set "userId" = $1 where id = $2', [userId, seatId])

    // commit the transaction (it will release the lock on the table row).
    await client.query('COMMIT;')

    // show the user id and seat id to follow the process in the console.
    console.log(JSON.stringify({ userId, seatId }))

    // return the seat id.
    return seatId
  } catch (e) {
    const error = e as Error
    // show the seat id and user id to follow the process in the console.
    console.log(JSON.stringify({ userId, error: error.message }))

    // in case of an error, rollback the transaction and throw the error.
    await client.query('ROLLBACK;')
    throw e
  } finally {
    // release the database connection to the pool.
    client.release()
  }
}
