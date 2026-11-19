# Green Voice – live admin setup (Vercel)

## What's in this folder
- `index.html` – your site. Loads saved content from `/api/content`; the gear icon now asks for a password.
- `api/login.js` – checks the password, returns a 12-hour login token.
- `api/content.js` – GET = public read of saved content. POST = save (password required).
- `api/upload.js` – saves images you upload in the admin panel (password required).
- `package.json` – installs `@vercel/blob` (the storage library).

## Steps
1. **Replace your site's files.** Put all of these files at the root of your Vercel project
   (`index.html`, `package.json`, and the `api` folder). If the project is connected to GitHub,
   commit and push. Without GitHub, run `npx vercel --prod` inside this folder.
   A single uploaded `index.html` cannot run the `api` functions, so the whole folder must be deployed.
2. **Create storage.** Vercel dashboard → your project → **Storage** → **Create** → **Blob**.
   Choose **Public** access, then connect it to the project (Production, Preview, Development).
   This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Set the password.** Project → **Settings** → **Environment Variables** → add
   `ADMIN_PASSWORD` with a long password only you know (Production at least).
4. **Redeploy.** Deployments → latest → **Redeploy** (new variables only apply to new deployments).
5. **Test.** Open the site → gear icon → enter the password → change something → **প্রকাশ করুন**.
   The first publish uploads your 10 existing images, so it takes a few seconds longer.

## Good to know
- Edits appear on the live site within about 15 seconds (CDN cache).
- A login lasts 12 hours or until you press লগআউট. Changing `ADMIN_PASSWORD` logs everyone out.
- The content built into `index.html` is only a fallback. Once you have published, the saved content wins,
  so re-deploying `index.html` will not overwrite your edits.
- Images are resized in your browser (max 900px) before upload.

## Troubleshooting
- "সার্ভারে ADMIN_PASSWORD সেট করা নেই" → step 3, then redeploy.
- "প্রকাশ করা যায়নি" → the Blob store is missing or not connected to this project (step 2), then redeploy.
- "ভুল পাসওয়ার্ড" → check the value of `ADMIN_PASSWORD`, with no extra spaces.
