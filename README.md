# WordPress to Markdown Exporter (Typescript version)

Based on idea of https://github.com/dreikanter/wp2md

# Current state: early ALPHA

I am still playing around with the code and copying the working features from wp2md.py

# Next Steps

- json2yaml the front matter 
    - final format https://jekyllrb.com/docs/frontmatter/
    - npm  https://www.npmjs.com/package/json2yaml
    - online converter https://www.json2yaml.com/
- loop through all items
- [Command Line Arguments and Interface](https://github.com/vilic/clime)
- Take Filename, output & date arguments
- Get Channel data ("def dump_channel" in the python module => index.md) 
- throw error when more than one channel

# Setup 

## Configure git ssh on Windows

1. Add openssh Key to git https://github.com/settings/keys
2. [SSH to Server via GUI to get around "Store key in cache?" error](https://stackoverflow.com/questions/33240137/git-clone-pull-continually-freezing-at-store-key-in-cache)
3. Set the env Var GIT_SSH:

    export GIT_SSH="C:\Program Files (x86)\PuTTY\plink.exe"

or in Powershell:

    [Environment]::SetEnvironmentVariable("GIT_SSH", "C:\Program Files (x86)\PuTTY\plink.exe", "User")

test with: 

    ssh -T git@github.com

4. Set upstream: 

    git branch -u github/master

We created the repo locally and created one remotely

5. Force Push Online/Upstream:

    git push --set-upstream github master --force

## Installation

Prerequisites:

    npm install
    (npm install -g typescript)
    (npm install -g ts-node) only for https://stackoverflow.com/questions/33535879/how-to-run-typescript-files-from-command-line for ts-node option
    ( tsc --init ) if no tsconfig.json is present

## Compile (and watch) Typescript (in a git bash)

    tsc

## Run:

    node dist/wp2md    