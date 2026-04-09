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

## API Configuration

For local development, the frontend defaults to `http://localhost:5000`.

Use these environment files:

```bash
# local development
.env.local

# production example
.env.production.example
```

Example local config:

```env
NEXT_PUBLIC_API_URL_LOCAL=http://localhost:5000
NEXT_PUBLIC_API_KEY=your_secret_api_key_for_frontend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Example production config:

```env
NEXT_PUBLIC_API_URL=https://ad-adviser-backend-2t9i7h75z-abdulla196s-projects.vercel.app
NEXT_PUBLIC_API_KEY=your_production_api_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Google Auth

The login and register pages expose Google-only social auth. The backend expects the Google ID token returned by the Google sign-in button.

Frontend:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Backend:

```env
GOOGLE_AUTH_CLIENT_ID=your_google_client_id
```

This must be a Google Cloud `Web application` OAuth client. In Google Cloud Console, add these Authorized JavaScript origins:

- `http://localhost:3000`
- your production frontend origin

If Google shows `Error 401: invalid_client` or `no registered origin`, the client ID is not configured for the current frontend origin.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
