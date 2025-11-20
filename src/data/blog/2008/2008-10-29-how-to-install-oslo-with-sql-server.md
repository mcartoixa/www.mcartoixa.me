---
layout: post
title: "How to install Oslo with SQL Server Express Edition?"
date: 2008-10-29 18:44:00 +0200
category: software-craftsmanship
tags: howto oslo
---

As I was delving into the [Visual Studio DSL Tools](http://msdn.microsoft.com/en-us/library/bb126235.aspx) to design my first DSL for [Salamanca](http://www.codeplex.com/salamanca), I came across this new modeling platform by Microsoft: [Oslo](http://msdn.microsoft.com/en-us/oslo/default.aspx). In fact, it is so new that the first CTP has just [been released](http://code.msdn.microsoft.com/oslo/Release/ProjectReleases.aspx).

As I already wrote on the blog of Salamanca, the vision for this new tool seems to be exactly what I had been needing :

> It's actually taking the kind of models that you're seeing arising in specific domains, like software management in System Center, or your data design over in SQL, or your process activities over in BizTalk and saying, we need to take all these domains and be able to put them into one model space. In fact, we need to let people create their own domains that aren't just isolated, but that exist in this one modeling space. And that's what Oslo is about.

That's it. I just quoted Bill Gates!

So it was unavoidable that I tried to download and install the [October 2008 CTP](http://code.msdn.microsoft.com/oslo/Release/ProjectReleases.aspx?ReleaseId=1707) on my computer. Everything was OK, except for the fact that the installer could not create the repository on my SQL Server 2008 Express Edition database. The message was:
> Create repository database failed, please try later

So I tried later, as suggested in the installed ReadMe file. Indeed, my SQL Server instance not being the default instance on my system, but rather being a named instance (the name being "SQLEXPRESS"), I understand why the repository creation failed. The trouble is that the command lines included in the file to manually create the repository are incorrect. So here are the correct ones:
```
CreateRepository.exe /db:.\SQLEXPRESS
mx.exe -i:Models.mx -db:Repository -s:.\SQLEXPRESS
```


Please note that the second command failed at first with the following message :
> There is insufficient system memory in resource pool 'internal' to run this query.

But, as suggested on [this Microsoft Connect SQL Server issue](https://connect.microsoft.com/SQLServer/feedback/ViewFeedback.aspx?FeedbackID=342696), letting the server "sit for a moment" solved the problem...
