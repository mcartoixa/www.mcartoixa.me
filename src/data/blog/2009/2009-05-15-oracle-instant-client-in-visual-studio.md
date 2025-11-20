---
layout: post
title: "Oracle Instant Client in Visual Studio"
date: 2009-05-15 14:42:00 +0200
category: software-craftsmanship
tags: howto oracle visual-studio x64
---

In [my previous post](/blog/software-craftsmanship/2009/05/15/oracle-not-so-instant-client.html), I mentioned the fact that I added the Oracle [Instant Client](http://www.oracle.com/technology/tech/oci/instantclient/index.html) files as _Content_ files in a Visual Studio project. I would like to write more about this here.

If you intend to use your application with Instant Client, you will want to be able to debug it with Instant Client. Which means that the libraries have to be copied along your generated application in the `bin\Debug` folder. The best way to achieve this is to include then as _Content_ files in your project.

But it gets more tricky if you want to be able to debug it on 32 bits platform as well as on a 64 bits platform: the source code is the same (I am obviously writing about a .NET application, here), you just have to pick the correct library depending on the platform you are debugging on.

My way to do this is:
* I store the Instant Client libraries in an independent folder, say `lib\Oracle\Instant Client`.
* Each platform lies in a dedicated subfolder : `x86` for the 32 bits version, `x64` for the 64 bits version.
* I manually tweak the .csproj project file so that it picks the right version depending on the platform I am running Visual Studio on:

```xml
<PropertyGroup>
  <ProcessorArchitecture>x86</ProcessorArchitecture>
  <ProcessorArchitecture Condition=" '$(PROCESSOR_ARCHITECTURE)' == 'AMD64' ">x64</ProcessorArchitecture>
</PropertyGroup>
<ItemGroup>
  <Content Include="..\..\lib\Oracle\InstantClient\$(ProcessorArchitecture)\oci.dll">
    <Link>oci.dll</Link>
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
  <Content Include="..\..\lib\Oracle\InstantClient\$(ProcessorArchitecture)\orannzsbb11.dll">
    <Link>orannzsbb11.dll</Link>
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
  <Content Include="..\..\lib\Oracle\InstantClient\$(ProcessorArchitecture)\oraociei11.dll">
    <Link>oraociei11.dll</Link>
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
</ItemGroup>
<ItemGroup Condition=" '$(ProcessorArchitecture)' == 'x86' ">
  <Content Include="..\..\lib\Oracle\InstantClient\$(ProcessorArchitecture)\msvcr71.dll">
    <Link>msvcr71.dll</Link>
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </Content>
</ItemGroup>
```

This code is based on the `PROCESSOR_ARCHITECTURE` environment variable. This will be set to _x86_ on a 32 bits platform, as expected, but [to AMD64 on a 64 bits platform](http://support.microsoft.com/kb/888731). That is why I am using a custom property to get the _x64_ value back.

I could also simply rename the library subfolder to _AMD64_, but I like _x64_ more (I know: I am picky). And besides, it makes my WiX files more straightforward…
