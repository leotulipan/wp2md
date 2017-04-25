# WordPress to Markdown Exporter (Typescript version)

Based on idea of https://github.com/dreikanter/wp2md

## Configure git ssh on Windows

1. Add openssh Key to git https://github.com/settings/keys
2. [SSH to Server via GUI to get around "Store key in cache?" error](https://stackoverflow.com/questions/33240137/git-clone-pull-continually-freezing-at-store-key-in-cache)
3. Set the env Var GIT_SSH 
	export GIT_SSH="C:\Program Files (x86)\PuTTY\plink.exe"
or in Powershell:
    [Environment]::SetEnvironmentVariable("GIT_SSH", "C:\Program Files (x86)\PuTTY\plink.exe", "User")

4. Set upstream 
    git branch -u github/master
We created the repo locally and created one remotely

5. Force Push Online
    git push --set-upstream github master --force

## Installation

Prerequisites:
    npm install

Compile Typescript:
    tsc wp2md.ts
Run:
    node wp2md.js