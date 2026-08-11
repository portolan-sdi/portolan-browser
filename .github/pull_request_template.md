<!-- ops-sync:begin — synced from portolan-sdi/portolan-ops. Edit there, not here. -->

<!-- Title in conventional-commit form: it becomes the squash commit message. -->

## What this changes

<!-- Two or three sentences. What behaves differently once this merges. -->

## Why

<!-- One or two sentences. Reference the issue (#N) rather than restating
     it. CI requires the reference unless the waiver below is ticked. -->

## Verification

<!-- Re-run the reproduction from the linked issue and paste the command
     and output here, in a fenced block. Name the data it read: a URL or a
     catalog path. Show the reported behavior changed, not that a command
     runs. Green tests are not verification. -->

<!-- Keep the checkbox wording intact: CI matches its exact phrase. -->

- [ ] This change does not alter behavior (docs, chore, or CI only).

## Related issues

<!--
Budget: 200 words outside code blocks, no section longer than six lines. A
reviewer should finish this in under a minute. Prose follows the Portolan
voice: https://github.com/portolan-sdi/portolan-ops/blob/main/VOICE.md

CI checks the budget and the verification evidence on every push and edit.
-->

<!-- ops-sync:end -->

## Checklist

- [ ] Added [changelog entry](CHANGELOG.md)
- [ ] Added translations for new or changed UI strings
- [ ] Executed linter (`npm run lint`)
- [ ] Added and executed tests (`npm test`)
