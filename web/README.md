This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Machine ID import

Use **Importer les IDs** above the processing table to upload CSV, TSV, XLSX or XLS files. The first row must contain column names. `N°Lot` is recognized automatically as the custom ID; choose a timestamp column or separate date and time columns. IDs retain leading zeros when stored as text or formatted with zeros in Excel.

Choose the file's date format and timezone (browser local time by default, or UTC). ISO timestamps with explicit offsets retain those offsets. A full calendar date is required; time-only records cannot identify a day safely. The default maximum difference is **10 seconds**, adjustable from 0 to 300 seconds in either direction.

The preview compares all platform events within the file's time window, across pages and regardless of table filters. Both sequences are sorted chronologically (source row and event ID break equal-time ties). Matching maximizes the number of one-to-one pairs, then minimizes their total time difference without crossing the order. Equally optimal alternatives are flagged as ambiguous. Existing IDs, sent events, duplicate lots, conflicts and unmatched rows are left unchanged. Invalid file rows must be corrected before previewing.

Review the event times and differences, then click **Importer … ID(s)** to save. The server checks authentication and recalculates the preview inside a transaction. If the relevant data changed since previewing, recalculate the preview; no partial import is saved. Limits: 5 MB, 2,000 data rows, and 4 million comparison cells (use a shorter time window for larger files).

Run the parser, ordered-matching and save-path tests with `npm run test:import`. No database is required for these tests.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
