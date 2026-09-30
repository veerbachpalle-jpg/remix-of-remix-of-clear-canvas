<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
## Architecture decisions
- Keep the MVP frontend-only with in-memory mock data and role-filtered views, because external localhost APIs are unavailable in hosted preview.
- The operator command centre is removed; `/` redirects to `/login` (portal). Keep all portal screens under src/routes/*.tsx and shared shell/UI in src/components/portal.tsx.
