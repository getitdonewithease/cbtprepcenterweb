# Malware scan

In November 2026 an attacker force-pushed rewritten commits into this
organisation's repositories. The payloads were obfuscated JavaScript hidden
after long runs of whitespace in build config files, loader files started from
npm scripts, JavaScript disguised as font files that a VS Code task ran on
folder open, and `.gitignore` lines hiding the attacker's push tooling.

`scan-malware.sh` checks a commit for all of those patterns. It runs in two places:

| Where | When | Catches |
| --- | --- | --- |
| `.githooks/pre-push` | before each `git push` from your machine | your own pushes, before they leave the PC |
| `.github/workflows/malware-scan.yml` | on GitHub, every push and pull request | every push, including ones that skip local hooks |

## Set up (once per clone)

```sh
git config core.hooksPath .githooks
```

## Run it yourself

```sh
sh scripts/security/scan-malware.sh            # current commit
sh scripts/security/scan-malware.sh origin/main
```

Exit code 0 means clean and 1 means something was flagged. A flag is a reason
to stop and look, not proof of malware: do not build, run or open the flagged
code in an editor until someone has checked it.

## On GitHub

In the branch protection rules for the default and release branches:

- block force pushes;
- require a pull request before merging;
- require the `malware-scan` status check to pass.

A pushed commit can edit this script or the workflow itself, so review changes
to `scripts/security/`, `.githooks/` and `.github/workflows/` with extra care.
