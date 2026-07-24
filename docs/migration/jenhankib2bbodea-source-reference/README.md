# Quarantined source-repo documents — NOT razer policy

The files in this directory came from `sayurihanki/jenhankib2bbodea` at `834527d`. They
describe **that repository's own** earlier migrations and troubleshooting history.

They are retained for provenance only. They are **not** current razer migration policy and
must not be followed as instructions.

They were moved here (rather than imported to the repo root, where they originally lived)
specifically so they cannot be mistaken for the active plan. Current policy lives in
`docs/migration/README.md` and in the migration plan itself.

| File | What it actually is |
|---|---|
| `GLOBAL-MIGRATION-PLAN.md` | The source repo's own prior global migration plan |
| `MASTER_MIRROR_PROMPT.md` | A prompt used to mirror content within the source repo |
| `CATEGORY_PAGES_TROUBLESHOOTING_RUNBOOK.md` | Source-repo category-page debugging notes |
| `blocks-library-cleaned.csv` | Source block-library index; its DA-library URLs point at the **source** mount and are stale for razer |

Notably, `blocks-library-cleaned.csv` contains `jenhankib2bbodea` DA-library URLs. Because
this file is reference-only and no longer wired into any runtime path, its URLs are left
as-authored to preserve provenance; the operational remapping wave rewrites only *active*
routing references. If this CSV is ever reactivated as a block-library source, its URLs
must be remapped to `razer` first.
