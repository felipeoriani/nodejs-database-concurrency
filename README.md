# Node.JS Database Concurrency

In this repository, I aim to explore Database Concurrency strategies in different databases including `Postgres`, `MySQL` and `Microsoft SQL Server` using `Node.JS` and `Typescript`.

Here we will see strategies like:

- Optmistic Concurrency Control
- Pessimistic Concurrency Control
- Hybrid Concurrency Control

The idea is to explore these strategies in different database and its packages. For example, for `Postgres` we can use `pg` package, but also in `Prisma ORM` and `Sequelize ORM`. I want to make it as a reference for myself and anyone who check this code in terms of, _how to_.

:warning: The code in this repository is still in progress.

## How to setup

To correctly use it, you need to have a `PostgreSQL` database running on your machine configured at the `.env` file. Make sure you have match the `.env` database connection info with the `docker-compose.yml` file.

You can easly do it using:

```
docker compose up -d
```

You can run the:

```
npm start
```

Just to check some extra information and also, you can run the following `npm` commands to explore the strategies:

```
npm run db:pg:optimistic
npm run db:pg:pessimistic
npm run db:pg:hybrid
```

or using `yarn`:

```
yarn db:pg:optimistic
yarn db:pg:pessimistic
yarn db:pg:hybrid
```

Most of them will reset the database, seed and run the strategy. You can check the files to understand each strategy.

At the end of the execution, you will see the results and some explanation why you get that result.

Thank you!
