---
layout: post
title: "Continuous Integration for .NET (Core)"
date: 2021-01-28 21:30:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration dotnet msbuild
series: 2020-about-continuous-integration
---

A lot of work has been made in the last few years (almost 5 now) to revamp the whole .NET Platform and lead it confidently into this new decade. Going through [.NET Core](https://en.wikipedia.org/wiki/.NET_Core), .NET is now free, open-source and multiplatform. Sign of the times, the console addicts can now take advantage of [the .NET CLI](https://docs.microsoft.com/en-us/dotnet/core/tools/) while everyone can enjoy the still evolving best parts of the eco-system: the C# language and MSBuild (amongst other things). So now is a good opportunity as ever to revisit [my practices of Continuous Integration for the .NET Framework](/blog/software-craftsmanship/2020/09/07/continuous-integration-for-the-net-framework.html) as well.

This might look at first as easy as a combination of various `dotnet build`, `dotnet test`, `dotnet pack` and/or `dotnet publish` commands. This might work for some (and if it does then this is very fine), but to me this comes too close to breaking [my *Build in 1 step* rule](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration%}#build-in-1-step.html) and I think I will keep on basing my builds on... MSBuild:
* all those `dotnet` commands have to be coordinated in some way, and I also want to be able to execute the build locally. If we are to create cross-platform scripts then our options become quite limited outside of MSBuild.
* MSBuild has the perfect logging infrastructure that allows to have both an understandable console output **and** a complete file log that can prove very valuable when things go wrong. Oh, and [the Structured Log Viewer](https://msbuildlog.com/) is just an amazing piece of software that has no equivalent that I know of on other technologies.
* most of the `dotnet` commands are just wrappers around MSBuild targets anyway...


## A simple project
If you want to see these principles in action please go and check [Vigicrues.Client](https://github.com/mcartoixa/Vigicrues.Client) ([https://github.com/mcartoixa/Vigicrues.Client](https://github.com/mcartoixa/Vigicrues.Client)), a .NET wrapper for [the Vigicrues API](https://www.vigicrues.gouv.fr/services/1/) which reports information about flooding hazards in France. What I need for Continuous Integration are:
* [A solution file](#the-solution) (`Vigicrues.Client.sln`).
* [A build file](#the-build-file) (`Vigicrues.Client.proj`), written in MSBuild.
* [A script file](#the-script-file) (`build.bat`) that helps executing the build file locally.
* [A CI configuration file](#the-ci-configuration-file) (`appveyor.yml`).
The rest of the project is either code of infrastructure.

### The solution
Solutions are ([still](/blog/software-craftsmanship/2020/09/07/continuous-integration-for-the-net-framework.html)) [Visual Studio](https://docs.microsoft.com/en-us/visualstudio/ide/) *speak* for [a collection of related projects](https://docs.microsoft.com/en-us/visualstudio/get-started/tutorial-projects-solutions). You can load them (with Visual Studio), and you can also build them (with [MSBuild](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild)).

In this context, solutions have 2 purposes:
* they are an entry point for developers to edit the code. Specifically the [`Vigicrues.Client-dev.sln`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/Vigicrues.Client-dev.sln) solution should be used for that.
* they are an entry point for the build scripts to generate a deployable package. This is [`Vigicrues.Client.sln`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/Vigicrues.Client.sln).

In the full .NET Framework we also had a solution dedicated to automated tests but this could not work here [because of a bug in the test framework](https://github.com/Microsoft/vstest/issues/411). More on that later.

The main point here is that developers can still use their usual toolkit to develop (Visual Studio in this case).

### The build file
The architecture of the build is quite simple:
* execute the MSBuild equivalent of the various `dotnet` commands on the [`Vigicrues.Client.sln`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/Vigicrues.Client.sln) solution.
* add a sprinkle of execution of various external dependencies and tools (like [the cloc utility](https://github.com/AlDanial/cloc)) to make the whole thing more interesting.

The gist of the [`Vigicrues.Client.proj`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/Vigicrues.Client.proj) is very simple:
```xml
<Project DefaultTargets="Rebuild" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <ItemGroup>
    <Projects Include="Vigicrues.Client.sln" />
  </ItemGroup>

  <Import Project="$(MSBuildProjectDirectory)\build\Common.targets" />
</Project>
```
We define a list of solutions to act on, and there is only one in this case. The rest is imported from another MSBuild file ([`build\Common.targets`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/build/Common.targets)) which is quite specific at this time but may evolve into a generic reusable build file over time. This is where define my own standard targets:
* [*Clean*](#clean): cleans the build.
  * This is usually a simple matter of deleting the `tmp\` folder, as every other target generates its outputs there.
* [*Compile*](#compile): compiles the specified solutions.
* [*Test*](#test): compiles the tests and executes them.
  * Also performs code coverage analysis and generates a human readable report about it.
* [*Analyze*](#analyze): performs some analysis on the project.
  * Right now it gathers statistics using [the cloc utility](https://github.com/AlDanial/cloc).
* [*Package*](#package): generates a deployable package (in the `tmp\out\bin` folder). In our case this will be a NuGet file (NuGet being [the dependency manager of choice on the .NET platform](https://www.nuget.org/)).
* *Build*: shortcut for the combination of *Compile*, *Test* and *Analyze*.
* *Rebuild*: shortcut for the combination of *Clean* and *Build*.
* *Release*: shortcut for the combination of *Clean*, *Build* and *Package*.

#### Clean
As planned the *Clean* target is quite simple:
```xml
<Target Name="Clean" DependsOnTargets="CleanDirectories" />
<Target Name="CleanDirectories">
  <RemoveDir Directories="tmp\" />
</Target>
```

There is actually a bit more to it to take [bug #3485](https://github.com/dotnet/sdk/issues/3485) into account but this is a detail for this article.

#### Compile

The *Compile* target consists simply of calling MSBuild on the target solutions (instead of `dotnet build` which actually does the same thing):
```xml
<Target Name="Compile" DependsOnTargets="CompileProject" />
<Target Name="CompileProject">
  <PropertyGroup>
    <_BaseOutputPath>tmp\bin\%(Projects.FileName)\</_BaseOutputPath>
    <_BaseIntermediateOutputPath>tmp\obj\bin\%(Projects.FileName)\</_BaseIntermediateOutputPath>
  </PropertyGroup>
  <MSBuild
    Projects="%(Projects.Identity)"
    RebaseOutputs="True"
    Properties="Configuration=%(Projects.Configuration);Platform=%(Projects.Platform);BaseOutputPath=$(_BaseOutputPath);BaseIntermediateOutputPath=$(_BaseIntermediateOutputPath);%(Projects.Properties)"
    Targets="Restore;Build"
  />
</Target>
```

The only trick here is to redirect the outputs (including intermediate files) into subfolders of the `tmp\` folder. This is what made the *Clean* target so easy to write.

#### Test
At the core of the *Test* target is another call to MSBuild (instead of `dotnet test`), very much like above. Specificities include:
* not using solutions here but finding projects which name end with `.Tests.csproj`. This is partially because of [bug #411](https://github.com/Microsoft/vstest/issues/411) which prevented the use of solutions in the execution of tests. It may have been fixed now, but in the meantime I got used to not having a dedicated solution for tests...
* not redirecting intermediates, because of [bug #3485](https://github.com/dotnet/sdk/issues/3485) again.
* adding custom properties to the build (like `dotnet test` would). For instance:
  * I use [xUnit](https://xunit.net/) for my tests, so I will configure [the xUnit Test Logger](https://github.com/spekt/xunit.testlogger).
  * I can dynamically add another logger by using the `%VSTEST_LOGGER%` environment variable (cf. [the CI configuration file](#the-ci-configuration-file)).
  * I activate [code coverage collection](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage) ([Coverlet](https://github.com/coverlet-coverage/coverlet) is already a dependency of my tests).
* lastly, generated XML reports are copied under the `tmp\` folder where every report is expected.

And this gives someting like:
```xml
<Target Name="Test" DependsOnTargets="TestProject" />
<ItemGroup>
  <TestProjects Include="*\*.Tests.csproj" />
</ItemGroup>
<Target Name="TestProject"
  Outputs="tmp\tst\results\%(TestProjects.Filename)\TestResults.xml"
>
  <ItemGroup>
    <_VsTestLoggers Include="xunit" />
    <_VsTestLoggers Condition="'$(VSTEST_LOGGER)' != ''" Include="$(VSTEST_LOGGER)" />
  </ItemGroup>
  <PropertyGroup>
    <_BaseOutputPath>tmp\tst\bin\%(TestProjects.Filename)\</_BaseOutputPath>
    <_VSTestResultsPath>tmp\tst\results\%(TestProjects.Filename)\</_VSTestResultsPath>
    <_VsTestLogger>@(_VsTestLoggers->'&quot;%(Identity)&quot;')</_VsTestLogger>
  </PropertyGroup>
  <ItemGroup>
    <_TestProperties Include="IsTestProject=True" />
    <_TestProperties Include="VSTestNoLogo=True" />
    <_TestProperties Include="VSTestNoBuild=False" />
    <_TestProperties Include="VSTestBlame=True" />
    <_TestProperties Include="VSTestVerbosity=normal" />
    <_TestProperties Include="VSTestResultsDirectory=$(_VSTestResultsPath)" />
    <_TestProperties Include="VSTestTestAdapterPath=$(InputPath)" />
    <_TestProperties Include="VSTestCollect=XPlat Code Coverage" />
    <_TestProperties Include="VSTestLogger=$(_VsTestLogger)" />
  </ItemGroup>

  <RemoveDir Directories="$(_VSTestResultsPath)" />
  <MSBuild
    Projects="%(TestProjects.Identity)"
    RebaseOutputs="True"
    Properties="Configuration=Release;BaseOutputPath=$(_BaseOutputPath);@(_TestProperties);%(Projects.Properties)"
    Targets="Restore;VSTest"
  />
  <Copy Condition="Exists('$(_VSTestResultsPath)TestResults.xml')" SourceFiles="$(_VSTestResultsPath)TestResults.xml" DestinationFiles="tmp\%(TestProjects.Filename)-xunit-results.xml" />
</Target>
```

Hey, but what about the actual code coverage? It is collected but not exploited yet: we will use [ReportGenerator](https://danielpalme.github.io/ReportGenerator/) for this. This is a NuGet dependency that we can define and restore in the project file itself by defining the right properties:
```xml
<PropertyGroup>
  <RestoreGraphProjectInput>$(MSBuildProjectFullPath)</RestoreGraphProjectInput>
  <TargetFramework>netstandard2.1</TargetFramework>
  <MSBuildProjectExtensionsPath>tmp\obj\</MSBuildProjectExtensionsPath>
</PropertyGroup>
<ItemGroup>
  <PackageReference Include="ReportGenerator" Version="4.8.4" />
</ItemGroup>

<Import Project="$(MSBuildToolsPath)\NuGet.targets" />

<Target Name="Prepare" DependsOnTargets="Restore">
  <MakeDir Directories="$(TmpOutputPath)" />
</Target>

<Import Project="$(MSBuildProjectExtensionsPath)$(MSBuildProjectFile).nuget.g.props" />
<Import Project="$(MSBuildProjectExtensionsPath)$(MSBuildProjectFile).nuget.g.targets" />
```

Now we can use *ReportGenerator* on all the code coverage results and generate:
* a nice HTML report for humans to consume.
* a XML report, under the `tmp\` directory along withy other reports.

```xml
<Target Name="GenerateTestReports"
  Returns="@(CoverageResults)"
>
  <ItemGroup>
    <CoverageResults Include="tmp\tst\results\**\coverage.cobertura.xml" />
  </ItemGroup>
</Target>

<Target Name="_GenerateTestReports"
  Condition="'@(CoverageResults)' != ''"
  AfterTargets="GenerateTestReports"
>
  <ReportGenerator ReportFiles="@(CoverageResults)" TargetDirectory="tmp\tst\" ReportTypes="HtmlInline;Cobertura" VerbosityLevel="Info" />
  <Move SourceFiles="tmp\tst\Cobertura.xml" DestinationFiles="tmp\tst\$(MSBuildProjectName)-cobertura-results.xml" />
</Target>
```

As a side note you may notice that the tests results are not part of the output due to poor integration of the Test Platform with MSBuild (cf. [bug #680](https://github.com/microsoft/vstest/issues/680)), but we are working on that.

#### Analyze
This target is just a matter of executing [the cloc utility](https://github.com/AlDanial/cloc). The only trick is to execute the Perl script when not on Windows:
```xml
  <Target Name="Analyze" DependsOnTargets="CountLoc" />
  <Target Name="CountLoc">
    <PropertyGroup>
      <ClocResultsFile>tmp\cloc-results.xml</ClocResultsFile>
      <_ClocCommand Condition="'$(OS)'=='Windows_NT'">&quot;.tmp\cloc.exe&quot;</_ClocCommand>
      <_ClocCommand Condition="'$(_ClocCommand)'==''">perl &quot;.tmp/cloc.pl&quot;</_ClocCommand>
    </PropertyGroup>
    <Exec
      Command="$(_ClocCommand) &quot;$(InputPath)&quot; --exclude-dir=.tmp,.vs,.vscode,bin,build,doc,lib,obj,tmp,GeneratedCode --exclude-ext=csproj,dbmdl,proj,sln,sqlproj,suo,user --3 --quiet --progress-rate=0 --xml --report_file=&quot;$(ClocResultsFile)&quot;"
      YieldDuringToolExecution="True"
      IgnoreExitCode="True"
    />
  </Target>
```
#### Package
In the case of a library like we have, the *Package* target is just calling the MSBuild equivalent of `dotnet pack`:
```xml
<Target Name="Package" DependsOnTargets="Prepare;Project" />
<Target Name="PackageProject">
  <PropertyGroup>
    <_BaseOutputPath>tmp\pck\%(Projects.FileName)\</_BaseOutputPath>
    <_BaseIntermediateOutputPath>tmp\obj\bin\%(Projects.FileName)\</_BaseIntermediateOutputPath>
  </PropertyGroup>
  <ItemGroup>
    <_PackageProperties Include="PackageOutputPath=tmp\out\bin" />
  </ItemGroup>
  <MSBuild
    Projects="%(Projects.Identity)"
    RebaseOutputs="True"
    Properties="Configuration=%(Projects.Configuration);Platform=%(Projects.Platform);BaseOutputPath=$(_BaseOutputPath);BaseIntermediateOutputPath=$(_BaseIntermediateOutputPath);@(_PackageProperties);%(Projects.Properties)"
    Targets="Restore;Pack"
  />
</Target>
```

We will expect every final artefact to be generated in the `tmp\out\bin` folder.

### The script file
There are actually 2 script files here:
* [`build.bat`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/build.bat) on Windows.
* [`build.sh`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/build.sh) on Linux and MacOS.

They both do the same thing on different platforms so I will detail only one of them. It is just a matter of interpreting command line parameters to create the right environment variables before executing the build:
```
dotnet.exe tool restore
dotnet.exe msbuild Vigicrue.Client.proj /nologo /t:Build /m /r /fl /flp:logfile=build.log;verbosity=%_VERBOSITY%;encoding=UTF-8 /nr:False /v:normal
```

One external dependency has to be installed prior to this execution though: [the cloc utility](https://github.com/AlDanial/cloc). This is done in various stages:
* version for this dependency is defined in the [`build\versions.env`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/build/versions.env) file.
  ```
  _CLOC_VERSION=1.82
  ```
* in the [`build\SetEnv.bat`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/build/SetEnv.bat) script versions are set as environment variables:
  ```
  IF EXIST build\versions.env (
      FOR /F "eol=# tokens=1* delims==" %%i IN (build\versions.env) DO (
          SET "%%i=%%j"
          ECHO SET %%i=%%j
      )
      ECHO.
  )
  ```
* the right version of the tool is downloaded and extracted in the `.tmp` folder (if necessary):
  ```
  IF NOT EXIST "%CD%\.tmp\cloc.exe" GOTO SETENV_CLOC
  FOR /F %%i IN ('"%CD%\.tmp\cloc.exe" --version') DO (
      IF "%%i"=="%_CLOC_VERSION%" GOTO END
  )
  :SETENV_CLOC
  powershell.exe -NoLogo -NonInteractive -ExecutionPolicy ByPass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest https://github.com/AlDanial/cloc/releases/download/$Env:_CLOC_VERSION/cloc-$Env:_CLOC_VERSION.exe -OutFile .tmp\cloc.exe; }"
  :END
  ```

The `build\SetEnv.bat` is then simply called in the `build.bat` script file. The same architecture could be used for other tools that cannot be retrieved with NuGet.

### The CI configuration file
I will use [AppVeyor](https://www.appveyor.com/) as a platform, but as usual the configuration will be very simple because all the complexity has been handled above. I could very simply switch to any other tool with minimal reconfiguration. The [`appveyor.yml`](https://github.com/mcartoixa/Vigicrues.Client/blob/v0.1/appveyor.yml) can simply be:
```yaml
version: 0.1.{build}.0
image: Visual Studio 2019

install:
  - cmd: CALL build\SetEnv.bat
  - cmd: dotnet tool restore

build_script:
  - cmd: dotnet msbuild Vigicrues.Client.proj /nologo /t:Release /m /r /l:"C:\Program Files\AppVeyor\BuildAgent\dotnetcore\Appveyor.MSBuildLogger.dll" /fl /flp:logfile=build.log;verbosity=diagnostic;encoding=UTF-8 /nr:False /v:normal
```

In pratice I will add a few tweaks though:
* upload the coverage results to [the Codecov platform](https://codecov.io/gh/mcartoixa/Vigicrues.Client):

  ```yaml
  install:
    - cmd: dotnet tool update Codecov.Tool --version 1.12.4
  on_success:
    - cmd: dotnet tool run codecov -f "tmp\*-cobertura-results.xml"
  ```
* use [the AppVeyor test logger](https://github.com/spekt/appveyor.testlogger) to automatically report test results to the platform (remember the `%VSTEST_LOGGER%` environment variable?):

  ```yaml
  environment:
    VSTEST_LOGGER: Appveyor
  install:
    - cmd: dotnet add Vigicrues.Tests\Vigicrues.Tests.csproj package Appveyor.TestLogger --version 2.0.0
  ```

## Going further
These scripts are still in early phase and they will evolve over time. In fact they might have already evolved at the time you read this post, but I guess I could still add:
* the ability to handle the packaging of native applications, which is a simple matter of translating `dotnet publish` into MSBuild scripts.
* the ability to handle the packaging of web applications which whould also involve `dotnet publish` and a small touch of [Web Deploy](https://www.iis.net/downloads/microsoft/web-deploy) (I love this tool).

When everything is stable enough maybe I could extract most of the files in the `build\` directory into a proper NuGet package and reuse them over all my projects. `dotnet make`, anyone?
<blockquote class="twitter-tweet" data-conversation="none"><p lang="en" dir="ltr">dotnet make</p>&mdash; David Fowler 🇧🇧 (@davidfowl) <a href="https://twitter.com/davidfowl/status/1219923246373425152?ref_src=twsrc%5Etfw">January 22, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
