---
layout: post
title: "TIL how to make MacOS behave on network shares"
date: 2020-05-10 07:50:00 +0200
category: software-craftsmanship
tags: howto til macos
---

How do you know there is a MacOS user amongst your colleagues? That has to be when you start to realize that half your folders in your network shares are gifted with a pesky `.DS_Store` file. Those files can even [spread to your repositories](https://github.com/search?q=.ds_store&type=Issues) by the way... All it takes is [1 single person to create a lot of nuisance](https://www.newsweek.com/south-korea-hailed-pandemic-response-backtracks-reopening-after-covid-19-cases-jump-1502864) for everyone else.

But hey, MacOS does what it does, and this is just something we have to live with. Right? This is what I thought for so many years.

But this is actually wrong. MacOS users: there is a way to for you to behave on network shares, and there has been for a long time! What you need is this simple command line (and a logout):
```
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool TRUE
```

It can even [speed up your browsing on network shares](https://support.apple.com/en-us/HT208209)! Don't thank me.
