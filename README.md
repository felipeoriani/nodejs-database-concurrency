# Node.JS Database Concurrency

In this repository, I aim to explore various _Database Concurrency Strategies_ in different databases including `Postgres`, `MySQL` and `Microsoft SQL Server` using `Node.JS` and `Typescript`. It covers strategies such as:

- Optimistic Concurrency Control
- Pessimistic Concurrency Control
- Hybrid Concurrency Control

The goal is to demonstrate these strategies in different databases and their respective packages. For instance, for `Postgres`, we'll explore implementations using the [`pg`](https://www.npmjs.com/package/pg) package, as well as _ORMs_ like [`Prisma`](https://www.prisma.io/) and [`Sequelize`](https://sequelize.org/). This repository serves as a reference for myself and anyone interested in learning how to apply these concurrency strategies.

:warning: _The code in this repository is still in progress._

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
