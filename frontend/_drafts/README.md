# Dreampath drafts (excluded from the build)

These files belong to an experimental "dream journal" concept that does not
fit the AFFECTRA facial-emotion product. They are kept for reference only.

Excluded from the build via:

- `tsconfig.json` → `"exclude": ["node_modules", "_drafts"]`
- `eslint.config.mjs` → `globalIgnores(["_drafts/**"])`

Known gaps if this is ever revived (as of 2026-11-04):

- Missing modules: `lib/local-data.ts`, `lib/sync.ts`, `components/session/SaveButton.tsx`
- Missing types in `lib/types.ts`: `DreamSession`, `DreamInterpretation`, `EmotionValue`
- Missing backend endpoints: `POST /api/interpret`, `GET/POST/DELETE /api/sessions`
- `lib/emotions.ts` has no `emotionEmoji` / `INTERPRETATION_TIPS` exports

Nothing under `app/` imports these files, so Next.js will not route them.
