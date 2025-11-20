---
layout: post
title: "SQL Server 2005 Compact Edition released"
date: 2007-01-17 11:54:00 +0200
category: software-craftsmanship
tags: database development sql-server
---

I have been playing around with [SQLite](http://www.sqlite.org/), which is quite effective and impressive. There is even an [ADO .NET Provider](https://web.archive.org/web/20070113182409/http://sqlite.phxsoftware.com/) that embeds in the same assembly the native SQLite API, so that your single dependency is a 538Ko assembly for a fully functional self-contained database. For all this, you will not get support for distributed transactions though. That seems fair, but no exception is raised when you try to enlist a SQLite connection into such a transaction (unlike the MS Access OLE DB ADO .NET Provider for instance).

Microsoft have just released their own version of an embeddable database. It could have been called [SQL Server Everywhere Edition](https://web.archive.org/web/20070114060915/http://blogs.msdn.com/SQLServerEverywhere/), but eventually we have [SQL Server Compact Edition](https://web.archive.org/web/20070116225859/http://www.microsoft.com/sql/editions/compact/default.mspx). Obviously, its main benefit is the compatibility with other SQL Server versions (especially the SQL syntax). There are even tools to "easily" synchronize your data with plain server hosted databases.

Beware though: if you install the [SDK](http://www.microsoft.com/downloads/details.aspx?familyid=E9AA3F8D-363D-49F3-AE89-64E1D149E09B), you will also have to install the [desktop client](http://www.microsoft.com/downloads/details.aspx?FamilyId=85E0C3CE-3FA1-453A-8CE9-AF6CA20946C3) (or else you are very likely to get an error stating that the `sqlceme30.dll` file is missing...). And deployment does not come free: a private file-based deployment means to copy 8 files (including the ADO .NET provider), amounting to 1.6Mo.

The ADO .NET Provider documentation itself is rather scarce (mainly a redirection to the standard SQL Server Provider documentation). So the main thing is that distributed transactions are not supported, which is OK. Another thing is that the [`SqlCeCommandBuilder`](http://msdn2.microsoft.com/en-us/system.data.sqlserverce.sqlcecommandbuilder.aspx) class does not support named parameters (the protected [`GetParameterName(string)`](http://msdn2.microsoft.com/en-us/library/9d540wkd.aspx) method throws an exception). That is usually not a problem unless you use [this hack](http://groups.google.com/group/microsoft.public.dotnet.framework.adonet/browse_thread/thread/deb2bec6610b7f16/519e9efb82fc7f58?lnk=st&amp;q=&amp;rnum=12&amp;hl=en#519e9efb82fc7f58). Oh yeah, and the [`SqlCeConnection.GetSchema`](http://msdn2.microsoft.com/en-us/library/s98te64s.aspx) methods are not supported (throw an exception) as well...
