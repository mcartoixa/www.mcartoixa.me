---
layout: post
title: "VS2005 SP1 is suckin' up your drive"
date: 2007-02-13 11:29:00 +0200
category: software-craftsmanship
tags: visual-studio windows
---

Remember [this old song about Windows 95](http://www.youtube.com/watch?v=bYi7nlRHe7)? Softwares on Windows have always been demanding on hard disks, and it seems that disk capacity will never be enough. As mine is quite fixed, I am doing my best to optimize disk usage.

First thing I do is to regularly clean my temporary folders. Here are sample command-lines for this:
```
DEL /f /s /q %SystemRoot%\Temp
DEL /f /s /q %TEMP%
DEL /f /s /q %TMP%
```

Second thing is to use the Cleanup Tool. Either use it manually (launch `%SystemRoot%\system32\cleanmgr.exe` and follow the instructions) or automate it.

But all this is not enough, and I recently checked my drive for wasted space. And I happened to find that my `%SystemRoot%\Installer` folder was taking up more than 2.6Gb! I tried to google this folder to find more about it, but I found that documentation is rather scarce. I could only find that what lies in there is very application dependent, and more research showed me that in fact a single application was responsible for about a 2.2Gb bloat : Visual Studio 2005. Or, to be more precise, VS2005 Service Pack 1 alone was responsible for this. So for those interested, here are two links about this matter and possible fixes by Heath Stewart: [about VS2005 SP1](http://blogs.msdn.com/heaths/archive/2006/10/06/VS-2005-SP1-Requires-a-lot-of-Disk-Space.aspx) and [about the patch cache](https://blogs.msdn.com/heaths/archive/2007/01/17/the-patch-cache-and-freeing-space.aspx).

IMHO, there must be something wrong in design about this cache feature...
