This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI SDK Setup

This app includes a minimal chat UI wired to a streaming AI endpoint using the Vercel AI SDK and Google's Gemini.

1. Create `.env.local` in the project root with your Google AI API key:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

To get your Google AI API key:
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy and paste it into your `.env.local` file

2. Start the dev server:

```
npm run dev
```

3. Open the app and ask a question. The UI in `app/page.tsx` uses `useChat` which calls the server route `app/api/chat/route.ts` for streaming responses.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
