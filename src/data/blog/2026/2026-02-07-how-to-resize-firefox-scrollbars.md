---
layout: post
title: "How to resize the scrollbars in Firefox"
date: 2026-02-07 08:39:00 +0200
header: /src/data/blog/header-keyboard.jpg
category: software-craftsmanship
tags: firefox windows ui
---

[What’s with the trend of tiny and hidden scrollbars?](https://discourse.gnome.org/t/whats-with-the-trend-of-tiny-and-hidden-scrollbars/18696) You can hear some people of all stripes, presumably old enough to remember a time when accessibility concerns mattered to the point that they were solved at the OS level complain about the size of scrollbars nowadays (wherever you can still find them): on [Windows](https://learn.microsoft.com/en-us/answers/questions/4018586/why-is-the-scroll-bar-in-windows-11-so-narrow-in-w), on [Linux](https://forums.linuxmint.com/viewtopic.php?t=438290), on [MacOS](https://apple.stackexchange.com/questions/467135/can-i-enlarge-the-system-scrollbar-size), on [Chrome](https://support.google.com/chrome/thread/335607960/scroll-bar-is-too-thin-it-s-hard-to-click-drag-it), on [Firefox](https://connect.mozilla.org/t5/ideas/scroll-bar-width-and-customization-options/idi-p/5320/page/6)...

People are supposedly only using scroll wheels or trackpads nowadays, so scrollbars are seen as a distraction. Maybe it's just my age showing but I still find scrollbars useful sometimes, if only as visual indicators of where I stand in a large article or a big document. And I usually find them more efficient when I only want a fine tweak of my position in a page or, to the contrary, when I want to get back quickly to the top of an infinite scrolling page.

Anyway if you think like me that you could use bigger scrollbars on Firefox, open [the configuration editor](https://support.mozilla.org/en-US/kb/about-config-editor-firefox) (_about:config_) and set the following values:
```
widget.non-native-theme.scrollbar.size.override         16
widget.non-native-theme.scrollbar.style                 4
widget.non-native-theme.win.scrollbar.use-system-size   false
```
Style 4 represents Windows 10 scrollbars, which IMHO are the most adequate for most situations, but [you can explore other options](https://searchfox.org/firefox-main/rev/997d55938096e03a72bfedb57279d42a62cd1467/modules/libpref/init/StaticPrefList.yaml#19102). 

No need to restart your browser. 😊
