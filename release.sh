#!/bin/sh

if [ $# -ne 1 ]; then
    echo "Usage: release.sh TAG_MESSAGE"
    exit 1
fi
msg=$1

npm run version

if ! git diff HEAD --cached --quiet --exit-code; then
    echo "Uncommitted but added files exist, commit them before release!"
    exit 1
fi

ver=$(jq '.version' manifest.json -r)

git tag -a "$ver" -m "$msg"
