# GE-Z Backend

<p align="center">
Built with: <br>
<img src=https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white>
<img src=https://img.shields.io/badge/pnpm-yellow?style=for-the-badge&logo=pnpm&logoColor=white>
<img src=https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white>
<img src=https://img.shields.io/badge/Express%20js-303030?style=for-the-badge&logo=express&logoColor=white>
<img src=https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white>
<img src=https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white>
<img src=https://img.shields.io/badge/redis-CC0000.svg?&style=for-the-badge&logo=redis&logoColor=white>
<img src=https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=Mocha&logoColor=white>
<img src=https://img.shields.io/badge/chai-A30701?style=for-the-badge&logo=chai&logoColor=white>
<img src=https://img.shields.io/badge/Amazon_AWS-EE8800?style=for-the-badge&logo=amazonaws&logoColor=white>
</p>

### 🥇 WebJam 2023 First Place Winner

> You can view the version submitted to WebJam [here](../../tree/a6de9cdc4de2bbde49d89e6c9b6d760331286244)

## About

GE-Z Backend is a REST api for course articulations using assist.org and California Virtual Campus.

See the [frontend](https://github.com/laurelin60/GE-Z-Frontend).

### Currently Supports:

-   UCI ✅
-   UCSB ✅
-   UCLA ✅

### In the Works:

-   All UCs and CSUs

> Note: the parser does not guarantee 100% accuracy. If you run into issues please let us know :+1:

## Getting Started

1. Make sure you have
   [Node.js 20.10.0](https://nodejs.org/en/download) and
   [pnpm](https://pnpm.io/installation) installed
2. Clone the repo
3. Copy `.env.example` to `.env`
4. Run:

```bash
pnpm i
```

```bash
pnpm run db:regenerate
```

```bash
pnpm run dev
```

---

Made with ❤️ by
[Uno Pasadhika](https://www.linkedin.com/in/wpasadhika/),
[Andrew Wang](https://www.linkedin.com/in/andrew-wang0/),
[Kevin Wu](https://www.linkedin.com/in/kevinwu098/)
