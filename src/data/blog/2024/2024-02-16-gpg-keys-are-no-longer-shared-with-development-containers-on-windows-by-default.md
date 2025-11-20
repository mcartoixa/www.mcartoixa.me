---
layout: post
title: "GPG keys are no longer shared with development containers on Windows by default"
date: 2024-02-16 16:51:00 +0200
header: /src/data/blog/header-keyboard.jpg
category: software-craftsmanship
tags: gpg windows vscode
---

If you are into the habit of [signing your Git commits](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work), the configuration on Windows has always been pretty straightforward: install [Gpg4win](https://www.gpg4win.org/), set up your keys in the graphical interface and you're pretty much done. And sharing those keys inside a development container with Visual Studio Code was even easier: [nothing to do](https://code.visualstudio.com/remote/advancedcontainers/sharing-git-credentials)!

Well, that was the case until version 4.2 of Gpg4win. I have been banging my head for days now on why this wouldn't work on a new machine of mine... As it turns out, the way keys are stored by Gpg4win by default has changed: [it now uses **keyboxd**](https://www.gpg4win.org/version4.2.html) and Visual Studio Code doesn't know how to handle that. Yet?

The old behaviour can simply be restored by running:
```
gpg-disable-keyboxd.bat
```
Done. You may have to recreate your containers for the keys to be picked up in your container.
