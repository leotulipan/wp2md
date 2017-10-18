# WordPress to Markdown Exporter (Typescript version)

Based on the idea of [wp2md](https://github.com/dreikanter/wp2md)
Adding relevant info to a [frontmatter section](https://jekyllrb.com/docs/frontmatter/)

# Current state: early ALPHA

I am still playing around with the code and copying the working features from wp2md.py

# Next Steps

- [Continue linux WSL setup](https://stackoverflow.com/questions/44450218/how-do-i-use-bash-on-ubuntu-on-windows-wsl-for-my-vs-code-terminal)
- Get Channel data ("def dump_channel" in the python module => index.md) 
    line 464 z:\OneDrive\Projekt WP2MD\wp2md\wp2md.py
- output index (channel) to file
- throw error when more than one channel
- calling "-f test" w/o extension: crash => auto-add xml
- create a book.txt for leanpub.com
    one .md file per line
    sorted e.g. by tags
    maybe have a e.g. tagname.md file with just a h1 # TAGNAME in between the files
- add option -c (--clean): check and remove unnessecary (html) content (e.g. theme/builder markup, CTAs like newsletter forms, etc)
- refactor interface/getter/setter parser._items
- refactor WPNamespace + Class into one nested module https://stackoverflow.com/questions/13495107/any-way-to-declare-a-nest-class-structure-in-typescript
- Take date arguments
- make debugging work in vcode https://stackoverflow.com/questions/31169259/how-to-debug-typescript-files-in-visual-studio-code
- Maybe? Refactor js yargs to [Command Line Arguments and Interface](https://github.com/vilic/clime)
- test cases / test xml files provided in repo

# Setup 

## Configure git ssh on Windows

1. Add openssh Key to git https://github.com/settings/keys
2. [SSH to Server via GUI to get around "Store key in cache?" error](https://stackoverflow.com/questions/33240137/git-clone-pull-continually-freezing-at-store-key-in-cache)
    - Start Putty
    - Connect to git@github.com
    - Do *never* close window on exit
    - You get:
```
Using username "git".
Authenticating with public key "passphrase: XYZ SSH" from agent
Server refused to allocate pty
Hi USERNAME! You've successfully authenticated, but GitHub does not provide shell access.
```    
    
3. Set the env Var GIT_SSH:

    export GIT_SSH="C:\Program Files\PuTTY\plink.exe"
    Powershell:  [Environment]::SetEnvironmentVariable("GIT_SSH", "C:\Program Files\PuTTY\plink.exe", "User")

    to have this [permanent](http://www.cgranade.com/blog/2016/06/06/ssh-keys-in-vscode.html):
    Right-click on `My Computer` or `This PC` in Windows/File Explorer, and select `Properties`. From there, click `Advanced system settings` in the sidebar to the left. On the Advanced tab, press the `Environment Variables...` button at the bottom. Finally, click `New...` on the user variables pane (top), and add a new variable named **GIT_SSH** with the value

test with: 

    ssh -T git@github.com
    (Note: even though putty above works this still throws an erros)

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