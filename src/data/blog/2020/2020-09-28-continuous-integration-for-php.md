---
layout: post
title: "Continuous Integration for PHP"
date: 2020-09-28 07:59:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration php phing
series: 2020-about-continuous-integration
---

It has been a very long time since I have used PHP in any capacity for web development. And I am not planning doing so again any time soon (sorry). But I have had the opportunity to apply [my practices](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html) on a very small, though still useful scale in PHP. From what I could gather it is indeed very possible to properly and continuously integrate PHP projects, provided you use the right tools for the job: a build tool and a dependency manager (optional but always recommended).

* [A simple project](#a-simple-project)
* [A more complete project](#a-more-complete-project)

## A simple project
Disclaimer: I do not condone illegal behaviour... But for research purposes I have created a custom search module for [Synology](https://www.synology.com/) [Download Manager](https://www.synology.com/en-global/knowledgebase/DSM/help/DownloadStation/DownloadStation_desc), and as it happens this requires PHP. Hence the [synology-dlm-rarbg](https://github.com/mcartoixa/synology-dlm-rarbg) project ([https://github.com/mcartoixa/synology-dlm-rarbg](https://github.com/mcartoixa/synology-dlm-rarbg)). No Laravel or Symfony involved here obviously but I want to believe that the concepts will remain the same on a more consequent project.

The main elements of the project are:
* [The build file](#the-build-file) (`build.xml`).
* [The script file](#the-script-file) (`build.bat`) that helps executing the build file locally.
* [The CI configuration file](#the-ci-configuration-file) (`.travis.yml`).

### The build file
Given my lack of recent experience with the technology I was a bit worried at first about the state of software development in PHP. But it turned out surprisingly pretty decent: you can find a fine dependency manager in [Composer](https://getcomposer.org/) and a very decent build tool in [Phing](https://www.phing.info/). It is based on the old timer [Apache Ant](https://ant.apache.org/) and so probably suffers from the same drawbacks (that I will cover in a subsequent post). But like the original: as long as you respect the tool (which involves understanding it...) you can go pretty far with it.

So [Phing](https://www.phing.info/) it is, and the `build.xml` file defines the following targets (pretty much consistent with what we have already seen in [.NET](/blog/software-craftsmanship/2020/09/07/continuous-integration-for-the-net-framework.html), [node.js](/blog/software-craftsmanship/2020/09/14/continuous-integration-for-nodejs.html) and [Ruby](/blog/software-craftsmanship/2020/09/21/continuous-integration-for-ruby.html)):
* *clean*: cleans the build (the `tmp\` directory).
* *build*: runs [PHPLint](https://github.com/overtrue/phplint) on the source code and copies the source code and the dependencies in the `tmp\out\bin` folder.
  * If I had to do it today I would probably isolate the first action in an *analyze* target. The second action would do well in the *package* target. My own consistency evolves over time...
* *test*: executes the tests using [PHPUnit](https://phpunit.de/).
* *package*: creates a package for the search module (which is an archive of the source code and its dependencies).
* *rebuild*: shortcut for the combination of *clean* and *build*.
* *release*: shortcut for the combination of *clean*, *build*, and *package*.

Before showing some code it appears that I may have over engineered this build a bit: I created a second build file [`dlm\build.xml`](https://github.com/mcartoixa/synology-dlm-rarbg/blob/master/dlm/build.xml) that is called by the first. Obviously I cannot clearly remember why right now but I think it had to do with the possibility of packaging multiple search modules in the same project. Anyway, how do you call another build file then? Simple:
```xml
<target name="test" depends="prepare.build">
  <phing phingfile="build.xml" dir="./dlm" target="test" inheritAll="true" haltonfailure="true" />
</target>
```
The *test* target must execute [PHPUnit](https://phpunit.de/) on the tests files, and it needs to have the dependencies properly downloaded before that (using [Composer](https://getcomposer.org/)):
```xml
<target name="test" depends="test.prepare">
  <phpunit printsummary="true" bootstrap="vendor/autoload.php" haltonerror="true" haltonfailure="true">
    <formatter type="plain" usefile="false" />
    <batchtest>
      <fileset dir="./tests">
        <include name="**/*Test*.php"/>
      </fileset>
    </batchtest>
  </phpunit>
</target>

<target name="test.prepare">
  <composer command="update" composer="bin/composer.phar">
    <arg value="-q" />
    <arg value="-n" />
  </composer>
</target>
```

The key in this project is to be able to package the search module in the format that is expected by the [Download Manager](https://www.synology.com/en-global/knowledgebase/DSM/help/DownloadStation/DownloadStation_desc), which is explained in [a PDF document downloadable somewhere on the Synology website](https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/DLM_Guide.pdf). I would never remember how, but now it has been described in [Phing](https://www.phing.info/) it seems pretty straightforward:
```xml
<target name="package" depends="package.prepare,build">
  <tar destfile="tmp/out/bin/mcartoixa_rarbg.dlm" compression="gzip">
    <fileset dir="tmp/bin/dlm">
      <include name="**/**" />
      <exclude name="composer.*" />
    </fileset>
  </tar>
</target>
```

### The script file
The gist of the script file [`build.bat`](https://github.com/mcartoixa/synology-dlm-rarbg/blob/master/build.bat) is simply to install the dependencies, including [Phing](https://www.phing.info/), and then run the build:
```
CALL .\bin\composer.bat install -q -n
CALL .\vendor\bin\phing.bat -f %PROJECT% %TARGET%
```

As you can see [Composer](https://getcomposer.org/) is itself stored in the repository as a [PHAR](https://www.php.net/manual/en/book.phar.php) archive. I could have chosen [to download it instead](https://getcomposer.org/doc/faqs/how-to-install-composer-programmatically.md). The key here is that the repository is ready for development: nothing to configure.

### The CI configuration file
For whatever reason I have again chosen [Travis CI](https://travis-ci.org/) as my Continuous Integration platform, which configuration is simply:
```yaml
install:
  - php bin/composer.phar install -n

script:
  - vendor/bin/phing -f build.xml prepare.version release
```

## A more complete project
Nothing much to be found here (as usual?), but I think proper foundations have been laid out above. As with every technology it is essential to delve into the build tool, understand it and use it to its full potential. For instance, if [Phing](https://www.phing.info/) is anything like [Apache Ant](https://ant.apache.org/) (and it looks like it is), understanding the core structures (like [FileList](https://www.phing.info/guide/chunkhtml/FileList.html)s of [FileSet](https://www.phing.info/guide/chunkhtml/FileSet.html)s) is very important.

Also, I would tend to install every dependency locally instead of globally (as part of the build, including frameworks like [Laravel](https://laravel.com/) for instance). It makes it easier to handle the `%PATH%` consistently for everyone (including your Continuous Integration platform) and it makes it easier to use different versions on different projects (or even branches).
