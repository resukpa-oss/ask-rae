# Ask Rae — deploy to Vercel

## 1. Get an Anthropic API key
Go to console.anthropic.com → create an API key. Add a small amount of
billing credit (this is pay-as-you-go, no monthly fee — a typical Q&A
exchange costs a fraction of a cent).

## 2. Edit the knowledge base
Open `api/chat.js` and replace every `[REPLACE]` line in `KNOWLEDGE_BASE`
with Willow's real admissions facts (deadlines, documents, financial aid,
contact info). This is what keeps Rae from inventing policy.

## 3. Deploy
If you already have Vercel CLI from the tour app project:

    cd ask-rae-vercel
    vercel

Follow the prompts (link to a new project, accept defaults — it's a
static site with one serverless function, no build step needed).

If you'd rather use the dashboard: push this folder to a GitHub repo,
then "Add New Project" on vercel.com and import it.

## 4. Add your API key as an environment variable
In the Vercel dashboard: Project → Settings → Environment Variables
→ add `ANTHROPIC_API_KEY` with your key from step 1 → redeploy.

Never put the key in `index.html` or any file the browser loads —
only `api/chat.js` (which runs on Vercel's servers) should reference it.

## 5. Swap in your photo (optional)
In `index.html`, find `.avatar-badge` in the `<style>` block and follow
the comment to swap the placeholder "RE" initials for a real photo.

The Willow lion emblem is already embedded directly inside `index.html`
(as base64 image data) — there's no separate image file to manage or
lose track of.

## 6. Embed on the Willow homepage
Once deployed you'll have a URL like `ask-rae.vercel.app`. Most CMS
platforms let you embed a page via an `<iframe>`:

    <iframe src="https://ask-rae.vercel.app" style="width:100%; height:640px; border:none;" title="Ask Rae — Willow Admissions"></iframe>

Check with whoever manages the Willow site template on where iframes
are allowed to go.
