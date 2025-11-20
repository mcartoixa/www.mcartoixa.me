---
layout: post
title: "apt commands fail (Connection timed out) in Debian based containers on Windows"
date: 2024-02-03 19:23:00 +0200
category: software-craftsmanship
tags: docker windows debian
---

The last few years have given me several opportunities to discover the Ruby language, and its ecosystem. I am very much a .NET guy, and I had wondered for a long time what the hype was all about. Now I can see how it inspired many modern platforms (like node.js or .NET ~~Core~~), but boy is the operations side of it hard! I am maintaining this very blog [on GitHub Pages](https://pages.github.com/), which is based [on Jekyll](https://jekyllrb.com/), and even a simple usage like this requires [a development container](https://containers.dev/). Especially as a Windows guy, although [managing Ruby dependencies on Linux is a mess](https://talk.jekyllrb.com/t/new-video-develop-jekyll-or-github-pages-using-docker-containers/7199) by itself.

Anyway, I am not creating those containers every day, but I have had a lot of trouble lately trying to create new ones, that happen to be based on Debian images (Buster and Bullseye), like [ruby:2.7.8](https://hub.docker.com/layers/library/ruby/2.7.8/images/sha256-f4420f957a9b4fae91a8d8c7fab8ba43e5a76bd640c87cb2b20ef669039e1319?context=explore) for instance. Part of the container creation involves running `apt-get update && apt-get upgrade` to have an image that is already up to date. These commands would invariably fail, preventing me (or VS Code for that matter) to create the container. The errors showed many `Connection timed out` while trying to fetch packages from _deb.debian.org_ or _security.debian.org_... And it happened with different Debian versions, on different (Windows) hosts.

Part of the debugging process was trying to reach mirrors of the Debian repositories, [using `netselect-apt`](https://manpages.debian.org/testing/netselect-apt/netselect-apt.1.en.html). But the same thing happened with the mirrors. And the first step of using `netselect-api` was installing it, by downloading the package directly with `wget` (can't use `apt` there 😁), thus proving that the container had proper access to Internet...

Long story short, it seems that under my conditions (Debian running in a container in Docker Desktop on Windows using WSL), and for some reason, the connections established by `apt` are quite unstable. The trick was to configure `apt` so that it retries many times before giving up: I added `echo 'Acquire::Retries "100";' > /etc/apt/apt.conf.d/99custom` as the first command in all my `Dockerfile` descriptions.

That's it. I can create brand new Debian based development containers again. 🥳
