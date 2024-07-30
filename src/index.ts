console.log(`
NODEJS DATABASE CONCURRENCY CONTROL

In this repository I am to emplore strategy for database concurrency control in NodeJs
using popular packages for database.

To correctly use it, you need to have a PostgreSQL database running on your machine configured at the .env file. 
You can easly do it using:

> docker compose up -d

Then you can run the following commands to explore the strategies:

npm run db:pg:optimistic
npm run db:pg:pessimistic
npm run db:pg:hybrid

or using yarn:

yarn db:pg:optimistic
yarn db:pg:pessimistic
yarn db:pg:hybrid

Most of them will reset the database, seed and run the strategy. You can check the files to understand each strategy.

Thank you!

@felipeoriani
\n`)
process.exit(0)
