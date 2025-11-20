---
layout: post
title: "Continuous Integration for the .NET Framework"
date: 2020-09-07 07:59:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration dotnet msbuild
series: 2020-about-continuous-integration
---

I realize writing this post that I have been practicing .NET development (C# in particular) since 2005 (15 years!). It is natural for [my Continuous Integration practices](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html) to have been heavily influenced by this platform during all this time. The advent of .NET Core will be the occasion to revisit these, and also the subject of another blog post. This post shows what those years of maturation led to on the (soon legacy) .NET Framework platform.

* [A simple project](#a-simple-project)
* [A more complete project](#a-more-complete-project)

## A simple project
For a starter, let's look at how the principles apply to a relatively simple (and largely unfinished) .NET Framework project: meet [NetMonkey](https://github.com/mcartoixa/NetMonkey) ([https://github.com/mcartoixa/NetMonkey](https://github.com/mcartoixa/NetMonkey)), a .NET wrapper for the [MailChimp API](https://mailchimp.com/developer/api/) (it was version 3.0 at the time). What you need are:
* [A solution file](#the-solution) (`NetMonkey.sln`).
* [A build file](#the-build-file) (`NetMonkey.proj`), written in MSBuild.
* [A script file](#the-script-file) (`build.bat`) that helps executing the build file locally.
* [A CI configuration file](#the-ci-configuration-file) (`appveyor.yml`).
The rest of the project is either code of infrastructure.

### The solution
Solutions are [Visual Studio](https://docs.microsoft.com/en-us/visualstudio/ide/) *speak* for [a collection of related projects](https://docs.microsoft.com/en-us/visualstudio/get-started/tutorial-projects-solutions). You can load them (with Visual Studio), and you can also build them (with [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild)).

In this context, solutions have 2 purposes:
* they are an entry point for developers to edit the code.
* they are an entry point for the build scripts to generate a package. This is why there are actually 2 solutions in the project:
  * The main solution, [`NetMonkey.sln`](https://github.com/mcartoixa/NetMonkey/blob/master/NetMonkey.sln) is used to generate the library.
  * The second solution [`NetMonkey.Tests.sln`](https://github.com/mcartoixa/NetMonkey/blob/master/NetMonkey.Tests.sln) also contains the associated unit tests. The main project is shared with the previous solution, so this is the one the developer will be encouraged to develop against (being more complete).

The main point here is that developers can still use their usual toolkit to develop (Visual Studio in this case).

### The build file
This is the crux of the build, written in [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild). I might also have considered [Cake](https://cakebuild.net/), or even [psake](https://psake.readthedocs.io/en/latest/) but for me nothing beats MSBuild. It is an acquired taste though, and it most certainly deserves its own dedicated blog post. Meanwhile the keypoints are:
* In .NET Framework the whole build system is based upon MSBuild, and project files are proper, editable MSBuild files (though notably solutions are not). In fact Visual Studio could be thought of as a visual editor for MSBuild projects. Using MSBuild means tighter integration with the .NET Framework platform.
* The logging capabilities of MSBuild are just amazing (yes, [really](https://github.com/KirillOsenkov/MSBuildStructuredLog)).
* I don't mind XML (yes, I'm that old).
* There were no real alternatives 15 years ago anyway; [NAnt](http://nant.sourceforge.net/) was a step back IMHO. More on that another time...

The gist of this file is deceptively simple:
```xml
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003" DefaultTargets="Rebuild" ToolsVersion="14.0">
  <ItemGroup>
    <Projects Include="NetMonkey.sln" />
  </ItemGroup>

  <Import Project="$(MSBuildProjectDirectory)\packages\Isogeo.Build.*\tools\build\Isogeo.Common.targets" />
</Project>
```

It just says that the main solution is the `NetMonkey.sln` file. As I adhere to my own conventions (as I easily tend to) I was able to abstract the essential part of the build in a library that can be shared accross many projects. The drawback is that after 15 years of trying to handle every situation (like web applications *and* native applications for instance), the common library tends to become heavy and difficult to get into (see for yourself [https://github.com/isogeo/Isogeo.Build/blob/531d173efc326afceb013a6ff841e58ffcdaff25/files/build/Isogeo.Common.targets](https://github.com/isogeo/Isogeo.Build/blob/531d173efc326afceb013a6ff841e58ffcdaff25/files/build/Isogeo.Common.targets)). But with a simple definition like the above it provides the following build targets:
* *Clean*: cleans the build.
  * This is usually a simple matter of deleting the `tmp\` folder, as every other target generates its outputs there.
* *Compile*: compiles the specified solutions.
* *Test*: tests the project.
  * More specifically, if a solution exists that has the same name as the provided solution but with a `.Tests.sln` suffix (like `NetMonkey.Tests.sln` in this case) it compiles it and executes the tests.
  * It also uses [OpenCover](https://github.com/OpenCover/opencover) to check code coverage.
* *Analysis*: performs static analysis on the project.
  * If [FxCop](https://en.wikipedia.org/wiki/FxCop) is detected it performs a [legacy analysis](https://docs.microsoft.com/en-us/visualstudio/code-quality/walkthrough-analyzing-managed-code-for-code-defects).
  * If a [SonarQube](https://www.sonarqube.org/) configuration file is present it performs an analysis.
  * It gathers statistics using [the cloc utility](https://github.com/AlDanial/cloc).
* *Document*: generates documentation (in the `tmp\out\bin` folder) for the project using [SHFB](https://github.com/EWSoftware/SHFB).
* *Package*: generates a deployable package (in the `tmp\out\bin` folder). Depending on the kind of solution being provided this can be:
  * A zip file.
  * A NuGet file for libraries (NuGet being [the dependency manager of choice on the .NET platform](https://www.nuget.org/)).
  * A [Web Deploy](https://www.iis.net/downloads/microsoft/web-deploy) package for web applications.
* *Build*: shortcut for the combination of *Compile* and *Test*.
* *Rebuild*: shortcut for the combination of *Clean* and *Build*.
* *Release*: shortcut for the combination of *Clean*, *Build*, *Document*, *Package* and *Analysis*.

Providing the same structure reduces my cognitive load when going from project to project: I always know where to start. Also note that most of the tools used generate reports (int the `tmp\` folder), that can be sent to various platforms of choice (like [AppVeyor](https://www.appveyor.com/docs/running-tests/#uploading-xml-test-results) or [CodeCov](https://docs.codecov.io/docs/about-the-codecov-bash-uploader)...).

### The script file
The script file allows for easy local execution of the build file. What may not be easy is:
* MSBuild is usually not in your `%PATH%`. I consider this a feature: it allows you to have multiple versions installed and dynamically choose the version you want at runtime, thanks to the [Windows Registry](https://www.lifewire.com/windows-registry-2625992).
* You can add advanced MSBuild arguments to improve your build. For instance [a complete log of the build](https://docs.microsoft.com/en-us/visualstudio/msbuild/obtaining-build-logs-with-msbuild) can be generated for you to inspect in order to debug anything that might be wrong.
* You could need to check hard dependencies (like the .NET Framework itself!)

Here is the core of the batch file (cf. [https://github.com/mcartoixa/NetMonkey/blob/master/build.bat](https://github.com/mcartoixa/NetMonkey/blob/master/build.bat)):
```
PUSHD .nuget
NuGet.exe restore "packages.config" -PackagesDirectory ..\packages
POPD
msbuild.exe %PROJECT% /nologo /t:%TARGET% /m:%NUMBER_OF_PROCESSORS% /p:GenerateDocumentation="%GENERATE_DOCUMENTATION%" /fl /flp:logfile=build.log;verbosity=%VERBOSITY%;encoding=UTF-8 /nr:False
```


Anyway, now you can test the build locally: `build.bat`.

### The CI configuration file
A looong time ago I used [CruiseControl.NET](https://ccnet.github.io/CruiseControl.NET) to build my projects, and it served me well. Nowadays there are many options in the cloud that are much more practical, like [AppVeyor](https://www.appveyor.com/) for instance which has provided Windows and .NET integration for many years now. It was inevitable that I made the switch at some point.

But as my build is not tied to any CI platform, the transition was very simple. It keeps my YAML very simple (check for yourself [https://github.com/mcartoixa/NetMonkey/blob/master/appveyor.yml](https://github.com/mcartoixa/NetMonkey/blob/master/appveyor.yml)), and I could easily switch again, to [Azure DevOps](https://azure.microsoft.com/en-us/services/devops/) for instance.

The configuration is the equivalent of `build.bat` for the CI platform. It only adds the handling of packages (*artifacts* in [AppVeyor speak](https://www.appveyor.com/docs/packaging-artifacts/)) and releases. All the packages being output in a single folder (`tmp\ou\bin\` by convention), the configuration is still very simple:
```yml
artifacts:
  - path: tmp\out\bin\*.nupkg
    type: NuGet
  - path: tmp\out\bin\*.zip
```

So it is mainly about releases.

## A more complete project
Meet [GeoSIK](https://github.com/mcartoixa/GeoSIK), a set of libraries that were destined to ease the development of [OGC Web Services](https://ogcapi.ogc.org/) in .NET. It provided 11 libraries that were used to either implement those services or integrate them with external geospatial libraries (like [ProjNet](https://archive.codeplex.com/?p=projnet) of [Sql Server Spatial Data types](https://docs.microsoft.com/en-us/sql/relational-databases/spatial/spatial-data-sql-server)).

Even though this project is much more complex, its structure is the same. And if you understood the structure of the simple project above you should not have too many problems delving into this one now. The only major change is that to keep things simple it was decided to have all the libraries built by 1 single solution (instead of the 11 mandated by the principle *1 package, 1 solution*). This required a specific packaging system, and so the [`GeoSIK.proj`](https://github.com/mcartoixa/GeoSIK/blob/master/GeoSik.proj) ([https://github.com/mcartoixa/GeoSIK/blob/master/GeoSik.proj](https://github.com/mcartoixa/GeoSIK/blob/master/GeoSik.proj)) is a bit more complex.

To me this shows that although it relies heavily on conventions, this build system is still quite adaptable. In fact the whole system can be adapted to other platforms.
