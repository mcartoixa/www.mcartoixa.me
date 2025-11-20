---
layout: post
title: "Oracle (Not So) Instant Client"
date: 2009-05-15 11:55:00 +0200
category: software-craftsmanship
tags: howto oracle wix x64
---

Developing database oriented .NET applications is quite a no brainer once you are used to your API (ADO.NET, Enterprise Library Data Application Block…) or your ORM (NHibernate…). Just pick your database vendor ADO .NET provider, which usually consists of one assembly that you distribute with your application, and that’s it. That is how it works with SQL Server (of course), but also [Teradata](http://www.teradata.com/td/page/149889), [MySQL](http://dev.mysql.com/downloads/connector/net/6.0.html), [PostgreSQL](http://pgfoundry.org/projects/npgsql/), [SQLite](http://sqlite.phxsoftware.com/)… You name it, that is the way it works.

Oracle, you said ? Well, that must be the exception that confirms the rule (along with DB2, but I would like to focus my rant on Oracle, if I may). It works quite like this. You need an ADO .NET provider AND a native client. The problems with this are :
* it takes [more than 450Mb to download](http://www.oracle.com/technology/software/products/database/oracle10g/htdocs/10201winsoft.html)!
* you may have to install several clients on the same computer (a 11.1 client will not connect to a 8i server).
* good luck to you if you intended to [make it work from an ASP .NET application](http://support.microsoft.com/kb/255084) (especially with [impersonation](http://msdn.microsoft.com/en-us/library/aa292118(VS.71).aspx))!

But thanks to the Oracle guys, there is another solution: Oracle [Instant Client](http://www.oracle.com/technology/tech/oci/instantclient/index.html). It consists of just a few DLLs that you can distribute along with your application and that allow connection to Oracle databases. If you are not too picky about character sets and supported languages, [you can trim it down do 19Mb](http://stackoverflow.com/questions/70602/what-is-the-minimum-client-footprint-required-to-connect-c-to-an-oracle-database/70901#70901).

I became quite efficient with this: I add the necessary files as _Content_ in my Visual Studio project, and a simple Setup project makes a good enough installer for my solution.

Then this week, a client called me about how one of these applications just crashed after he installed it on a Windows 2008 Server. The fact was : it was a 64 bits Windows. As the .NET application was compiled as AnyCPU, it was automatically launched as a 64 bits application, and then you can guess by yourself what happened when the 32 bits Oracle client was loaded in memory. At this point, my options were :
* compile the application as x86, so that it would be launched as a 32 bits application even on a x64 platform. But why tweak my application when it is really Oracle that was at fault?
* leave the application as _AnyCPU_, but distribute a different client depending on the platform it is installed on. This is the (more interesting) road I took.
I decided to give up on the standard Setup project (had I any other option?) and use [WiX](http://wix.sourceforge.net/) 3.0 instead. My first attempt was to use a single installer to be used on both platforms (x86 and x64), and distribute the Oracle Instant Client 11 depending on the platform (I found that version 10 made my application crash on Windows Vista x64, while version 11 worked fine…). This is how I achieved this:

```xml
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
 <Fragment>
    <DirectoryRef Id="INSTALLLOCATION">
<?if $(sys.BUILDARCH) = "x86" ?>
      <Component Id="OracleInstantClientFiles_x86" Guid="{AA0076CE-F7B6-4cd8-9B67-199F665A8E77}" KeyPath="yes">
        <Condition>
          <![CDATA[Installed OR NOT VersionNT64]]>
        </Condition>
        <File Id="OracleInstantClientFiles_x86_msvcr71.dll" Name="msvcr71.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x86\msvcr71.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_x86_oci.dll" Name="oci.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x86\oci.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_x86_orannzsbb11.dll" Name="orannzsbb11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x86\orannzsbb11.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_x86_oraociei11.dll" Name="oraociei11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x86\oraociei11.dll" DiskId="1" />
      </Component>
<?endif ?>
      <Component Id="OracleInstantClientFiles_x64" Guid="{3CCDBDB6-D45A-4523-8CC7-730D3A8851D3}" KeyPath="yes">
        <Condition>
          <![CDATA[Installed OR VersionNT64]]>
        </Condition>
        <File Id="OracleInstantClientFiles_x64_oci.dll" Name="oci.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x64\oci.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_x64_orannzsbb11.dll" Name="orannzsbb11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x64\orannzsbb11.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_x64_oraociei11.dll" Name="oraociei11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x64\oraociei11.dll" DiskId="1" />
      </Component>
    </DirectoryRef>
  </Fragment>

  <Fragment>
    <ComponentGroup Id="OracleInstantClientFiles">
<?if $(sys.BUILDARCH) = "x86" ?>
      <ComponentRef Id="OracleInstantClientFiles_x86" />
<?endif ?>
      <ComponentRef Id="OracleInstantClientFiles_x64" />
    </ComponentGroup>
  </Fragment>
</Wix>
```

This works alright. Just reference the `OracleInstantClientFiles` component and there you have it. But I was annoyed by the fact that my application would install in the `Program Files (x86)` folder by default. So I went with the dual installer solution. And the source code became:

```xml
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
 <Fragment>
    <DirectoryRef Id="INSTALLLOCATION">
      <Component Id="OracleInstantClientFiles" Guid="{AA0076CE-F7B6-4cd8-9B67-199F665A8E77}" KeyPath="yes">
<?if $(sys.BUILDARCH) = "x86" ?>
        <File Id="OracleInstantClientFiles_x86_msvcr71.dll" Name="msvcr71.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\x86\msvcr71.dll" DiskId="1" />
<?endif ?>
        <File Id="OracleInstantClientFiles_oci.dll" Name="oci.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\$(sys.BUILDARCH)\oci.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_orannzsbb11.dll" Name="orannzsbb11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\$(sys.BUILDARCH)\orannzsbb11.dll" DiskId="1" />
        <File Id="OracleInstantClientFiles_oraociei11.dll" Name="oraociei11.dll" Source="$(sys.CURRENTDIR)..\..\lib\Oracle\InstantClient\$(sys.BUILDARCH)\oraociei11.dll" DiskId="1" />
      </Component>
    </DirectoryRef>
  </Fragment>
</Wix>
```
So now I can distribute the correct Oracle files (worth 130Mb per platform) along with my less than 2Mb application!
