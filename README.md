# git ssh in Windows

1. Add openssh Key to git https://github.com/settings/keys
2. [SSH to Server via GUI to get around "" error])https://stackoverflow.com/questions/33240137/git-clone-pull-continually-freezing-at-store-key-in-cache)
2: Set the env Var GIT_SSH 
```$ export GIT_SSH="C:\Program Files (x86)\PuTTY\plink.exe"```
or in Powershell:
```[Environment]::SetEnvironmentVariable("GIT_SSH", "C:\Program Files (x86)\PuTTY\plink.exe", "User")```