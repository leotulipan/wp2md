# WordPress to Markdown Exporter (Typescript version)

Based on idea of https://github.com/dreikanter/wp2md
Adding relevant info to a [frontmatter section](https://jekyllrb.com/docs/frontmatter/)

# Current state: early ALPHA

I am still playing around with the code and copying the working features from wp2md.py

# Next Steps

- 2 yaml list "categories:" & "tags:" with just the nicenames
- loop through all/multiple items
- output items to files
- Get Channel data ("def dump_channel" in the python module => index.md) 
- output index (channel) to file
- [Command Line Arguments and Interface](https://github.com/vilic/clime)
- Take Filename, output & date arguments
- throw error when more than one channel
- make debugging work in vcode https://stackoverflow.com/questions/31169259/how-to-debug-typescript-files-in-visual-studio-code

# Setup 

## Configure git ssh on Windows

1. Add openssh Key to git https://github.com/settings/keys
2. [SSH to Server via GUI to get around "Store key in cache?" error](https://stackoverflow.com/questions/33240137/git-clone-pull-continually-freezing-at-store-key-in-cache)
    - Start Putty
    - Connect to git@github.com
    - Do *never* close window on exit
    - You get:
´´´
Using username "git".
Authenticating with public key "passphrase: XYZ SSH" from agent
Server refused to allocate pty
Hi USERNAME! You've successfully authenticated, but GitHub does not provide shell access.
´´´    
    
3. Set the env Var GIT_SSH:

    export GIT_SSH="C:\Program Files\PuTTY\plink.exe"

or in Powershell:

    [Environment]::SetEnvironmentVariable("GIT_SSH", "C:\Program Files (x86)\PuTTY\plink.exe", "User")

test with: 

    ssh -T git@github.com
    (Note even though putty above works this still throws an erros)

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