import { countBusySeats, pool } from './index.js'

/**
 * OPTIMISTIC CONCURRENCY CONTROL
 * In this approach we use the version column to avoid lost updates, but we don't lock the row.
 * This is a useful case when conflicts are rare and we want to avoid the overhead of locking the row since it costs performance and can lead to deadlocks.
 */

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

console.log('Seating users... (optimistic concurrency control)')

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

console.log(JSON.stringify(result, null, 2))

process.exit(0)

/**
 * Try to seat a user.
 * @param userId User id.
 * @returns Seat id or throw an error if there are no available seats.
 */
async function seatUser(userId: number): Promise<number | null> {
  // open the database connection from the pool.
  const client = await pool.connect()
  try {
    // try to get a seat that is not assigned to any user and lock the table row with `FOR UPDATE`.
    const result = await client.query('select id, version from "Seat" where "userId" is null limit 1;')

    // start a transaction.
    await client.query('BEGIN;')

    // if there are no available seats, rollback the transaction and throw an error.
    if (result.rowCount === 0) {
      await client.query('ROLLBACK;')
      throw new Error('No available seats.')
    }

    // get the seat id of the available seat.
    const seatId = result.rows[0].id
    const version = result.rows[0].version

    // Update the seat with the userId following the pessimistic concurrency control.
    // Since the table row of the seat is locked with `FOR UPDATE`,
    // no other transactions can update the seat until this transaction is finished (committed or rolled back) :)
    const rowsAffected = await client.query(
      'update "Seat" set "userId" = $1, "version" = "version" + 1 where id = $2 and "version"= $3',
      [userId, seatId, version]
    )

    if (rowsAffected.rowCount === 0) {
      await client.query('ROLLBACK;')
      throw new Error('The seat was updated by another transaction.')
    }

    // commit the transaction (it will release the lock on the table row).
    await client.query('COMMIT;')

    // show the user id  and seat id to follow the process in the console.
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
