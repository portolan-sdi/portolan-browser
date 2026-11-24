# Release process

Portolan Browser releases from `main` with a version bump, a changelog cut, and a
git tag. The package is private, so there is no npm publish. The live instance at
<https://browser.portolan-sdi.org> redeploys on every push to `main`, so cutting a
release deploys nothing on its own.

1. Start a branch from `main`, such as `release/0.2.0`.
2. In `CHANGELOG.md`, rename the `Unreleased` heading to the new version with
   today's date. Update the link definitions at the bottom of the file: point
   `[Unreleased]` at a compare link from the new tag to `HEAD`, and add a
   release-tag link definition for the new version. Add a short introduction
   under the heading that states the Portolan specification version this
   release implements.
3. Update the version in `package.json` and in the version sentence of the
   README's "Relationship to STAC Browser" section.
4. Check that the README's "What This Fork Adds" section and documentation table
   cover the features the release adds.
5. Run `pnpm run lint`, `pnpm run docs:lint`, and `pnpm test`. Fix what they report.
6. Open a pull request and squash-merge it once the checks pass.
7. Tag the merge commit on `main` with an annotated tag:
   `git tag -a vX.Y.Z -m "Portolan Browser X.Y.Z" <merge-commit>` and push it with
   `git push origin vX.Y.Z`.
8. Create the GitHub release on that tag. Lead with what the release means for a
   catalog publisher, then link the changelog section for the details.

The fork versions independently of upstream STAC Browser. The changelog records
the upstream version each sync merges.
