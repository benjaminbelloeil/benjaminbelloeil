# Apply this update

1. Unzip `github-profile-v5.zip`.
2. In [your profile repository](https://github.com/benjaminbelloeil/benjaminbelloeil), choose **Add file → Upload files**.
3. Upload `README.md` and the entire `assets` folder from inside the extracted bundle, preserving the folder. Commit to `main`.

This version uses your pasted README and existing `engineer.svg`. It adds a green activity graph, purple/blue Stats accents, a conditional orange current streak with white side columns, a self-contained LinkedIn badge, a rounded grey frame around both Galaga animations, and language logos in the Top Languages legend. Image sizes use GitHub-compatible attributes instead of inline styles.

## Refresh Galaga, languages, and streak colors daily

Replace the existing workflow with this version to refresh the language and streak cards daily and retain the Galaga frame. It fetches the hosted language card, replaces only its legend markers with embedded logos, and keeps its donut chart and ranking intact.

1. Open `galaga.yml` from this bundle and copy all its contents.
2. On GitHub, open `.github/workflows/galaga.yml` and click the pencil to edit it. Replace its contents with the copied text and commit to `main`.
3. If that file does not exist, use **Add file → Create new file**, enter `.github/workflows/galaga.yml` as the filename, paste the contents, and commit. GitHub creates the folders; no hidden-folder upload is needed.
4. Check **Actions → Update Galaga contribution graph**. The workflow runs when this file is committed and refreshes daily afterward. You can also run it manually.

The workflow uses the built-in `GITHUB_TOKEN` and updates the two Galaga images, `assets/top-languages.svg`, and `assets/streak.svg` on `main`. The bundled images work before the first run. Their initial contribution data was captured from your public GitHub calendar on September 21, 2026; the workflow obtains fresh data on each run.

The Galaga generator was checked locally using the captured public calendar. The language-card transformer was checked against a saved card whose ranking and donut geometry match the current hosted card. The daily workflow fetches a fresh card from the hosted endpoint. New languages without an embedded brand logo receive a neutral code icon next to their name. The revised workflow has not been installed or run remotely by Codex.

Sources: [Galaga generator](https://github.com/abozanona/pacman-contribution-graph), [LinkedIn icon](https://github.com/devicons/devicon/blob/master/icons/linkedin/linkedin-original.svg). The icon's license is included in `assets/DEVICON-LICENSE.txt`.

## Current streak color rule

On every workflow refresh, the streak SVG is fetched from the existing provider and its current value is read. A positive current streak uses orange for the number, label, ring, and flame; zero uses white. Total Contributions and Longest Streak numbers and labels always stay white. Dates remain grey. This is evaluated against the displayed value at generation time; the bundled card refreshes daily after the workflow is installed, rather than changing on every page visit.

The zero and positive cases were tested locally, including preservation of all displayed numbers and dates. The updated workflow has not been run on GitHub by Codex.
