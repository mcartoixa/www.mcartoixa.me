---
layout: post
title: "Continuous Integration for node.js"
date: 2020-09-14 07:42:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration node-js gulp-js
series: 2020-about-continuous-integration
---

Applying [the same principles](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html) to node.js is interesting because this is an entirely different world from .NET (for the best and for the worst):
* Javascript is interpreted: there is no compiler and no inherent notion of packaging.
* the platform is very fragmented: even the package manager seems to be up for grabs ([stigmergy](http://videos.ncrafts.io/video/223266261), anyone?).

And so in this this installment we will have a peak at how to implement Continuous Integration in a way that is both consistent with what we have seen before and specific to this platform:
* [A simple project](#a-simple-project)
* [A more complete project](#a-more-complete-project)

## A simple project
[leaflet-binglayer](https://github.com/mcartoixa/leaflet-binglayer) ([https://github.com/mcartoixa/leaflet-binglayer](https://github.com/mcartoixa/leaflet-binglayer)) was a plugin for [Leaflet ("an open-source Javascript library for mobile-friendly interactive maps")](https://leafletjs.com/). Its goal was essentially to integrate [Bing Maps](https://www.bing.com/maps/) layers in a way that did not consume [too many transactions](https://docs.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/understanding-bing-maps-transactions). This is a browser library, and not a proper node.js project, but the principles and the toolkits are remarkably the same.

The main elements of the project are:
* [The build file](#the-build-file) (`gulpfile.js`).
* [The script file](#the-script-file) (`build.bat`) that helps executing the build file locally.
* [The CI configuration file](#the-ci-configuration-file) (`.travis.yml`).

### The build file
I have chosen [gulp.js](https://gulpjs.com/) for the build description, mainly because it is the only build tool that allows it to be pure Javascript. It also hardly knows how to do anything by itself, which is always a good thing in a build tool I believe. Other alternatives I know of seem lacking in at least one regard:
* [grunt.js](https://gruntjs.com/) is a fine tool but the description is mainly JSON, which was only designed as a data interchange format and [notoriously lacks comments](https://justin.kelly.org.au/comments-in-json/)...
* [webpack](https://webpack.js.org/) is a very powerful *module bundler* that has so many features that it can sometimes masquerade as a build tool. But once again the description is only JSON (did I mention that it [lacked comments](https://stackoverflow.com/questions/244777/can-comments-be-used-in-json)?) and it makes complex scenarii convoluted and sometimes impossible. I like to keep it as a module bundler, which it does best, as part of a larger build described elsewhere.

Key elements of the build system are:
* you have access to native node.js functions, which allow for simple (as well as very complex) configurations:
  ```js
  gulp.task('clean', function () {
    const del = require('del')
    return del([ 'tmp/' ])
  })
  ```
* you have access to a [large library of plugins](https://gulpjs.com/plugins/) to configure common tools and scenarii ([eslint](https://eslint.org/) in this case):
  ```js
  const plugins = require('gulp-load-plugins')({ lazy: true })
  gulp.task('analysis-eslint', function () {
    return gulp.src('src/**/*.js')
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format())
      .pipe(plugins.eslint.failAfterError())
  })
  ```

Consistency reduces my cognitive load, thus the targets defined in the build file (`gulpfile.js`) are more or less the same [as in .NET](/blog/software-craftsmanship/2020/09/07/continuous-integration-for-the-net-framework.html#the-build-file):
* *clean*: cleans the build (the `tmp\` directory).
* *compile*: "compiles" (ie minifies) the source code using [UglifyJS](https://github.com/mishoo/UglifyJS#readme).
* *analysis*: performs static analysis on the project with [eslint](https://eslint.org/), and then gathers statistics using [the cloc utility](https://github.com/AlDanial/cloc).
* *package*: simply copies the minified files to the `tmp\out\bin\` folder.
* *build*: shortcut for the combination of *analysis* and *compile*.
* *rebuild*: shortcut for the combination of *clean* and *build*.
* *release*: shortcut for the combination of *clean*, *build*, and *package*.

Automated testing is hard in this configuration (a plugin based on the visual integration of an external API) and so there is no test target (what are *your* excuses?).

And then as a convenience, for ease of use and discovery of our system, these targets are referenced in the main `package.json` file, which will then be used as the main entry point:
```json
{
  "scripts": {
    "analysis": "gulp analysis",
    "clean": "gulp clean",
    "compile": "gulp compile",
    "package": "gulp package",
    "build": "gulp build",
    "rebuild": "gulp rebuild",
    "release": "gulp release"
  }
}
```

### The script file
Nothing new here, as the whole build has been described above and the script is just here to allow us to easily [build locally](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html#build-in-1-step.html):
```
CALL npm.cmd install --no-package-lock --no-shrinkwrap --loglevel info --cache .tmp\npm-cache
CALL npm.cmd run-script %TARGET% --loglevel %VERBOSITY%
```

Well, almost nothing:
* First of all as our technology is cross platform and as our scripts are very simple, it is easy to make our build work on Windows **and** MacOS for instance. Just add a simple `build.sh` file (not forgetting [the execute mode permissions](https://stackoverflow.com/questions/21691202/how-to-create-file-execute-mode-permissions-in-git-on-windows) of course):
  ```shell
  npm install --no-package-lock --no-shrinkwrap --loglevel info --cache .tmp/npm-cache
  npm run-script $_TARGET --loglevel $_VERBOSITY
  ```
* Some external dependencies have to be installed prior to the build. For instance I like to gather statistics on my projects using [the cloc utility](https://github.com/AlDanial/cloc), which is much easier installed locally (this is a simple download) outside of the proper build.
  * By convention local installations go to the `.tmp\` directory (notice the dot).
  * In the `build\` folder (by convention) I have a `SetEnv.bat` script that will be called by other build scripts on Windows that can initialize the environment for the build (detect installation paths using the mighty Windows registry, initialize environement variables, warn of missing dependencies...) and (locally) install missing ones:
    ```
    IF NOT EXIST "%CD%\.tmp\cloc.exe" (
        IF NOT EXIST .tmp MKDIR .tmp
        powershell.exe -NoLogo -NonInteractive -ExecutionPolicy ByPass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest https://github.com/AlDanial/cloc/releases/download/v$Env:_CLOC_VERSION/cloc-$Env:_CLOC_VERSION.exe -OutFile .tmp\cloc.exe; }"
    )
    ```
  * You can do the same for other platforms in a `.bashrc` file (not forgetting [the execute mode permissions](https://www.jerriepelser.com/blog/execute-permissions-with-git/)):
    ```shell
    if [ ! -d .tmp ]; then mkdir .tmp; fi
    if [ ! -f $(pwd)/.tmp/cloc.pl ]; then
        wget -nv --show-progress -O .tmp/cloc.pl https://github.com/AlDanial/cloc/releases/download/v$_CLOC_VERSION/cloc-$_CLOC_VERSION.pl
    fi
    ```

Handling your external dependencies this way as much as possible can significantly reduce the need for documentation (in the *pre-requisite* section) and cut down the time needed for a new developer to jump in your project. I know it saved *me* much time when I got back to this project 2 years later...

### The CI configuration file
Having already handled all the difficulties our configuration file could hardly be more simple, which is the goal. For instance using [Travis CI](https://travis-ci.org/), the gist of the `.travis.yml` is only:
```yaml
install:
  - . build/.bashrc
  - npm install --no-package-lock --no-shrinkwrap

script:
  - npm run-script release --loglevel notice
```

## A more complete project
Well, I do not think I have much to show you here. But every useful concept has been touched in the above (not so simple then) project. Simply know that I have been able to integrate this pipeline with success in other kinds of projects:
* Chrome extensions, which required JSON transformation of configuration files depending on the environment (to set up OAuth credentials for instance).
* proper node.js projects (backend and frontend). The main trick there is to be able to create [a deployable package](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html#create-deployable-packages): you will want to execute `npm install --production` in a temporary folder, along with a copy of your backend source files, to be sure to package only the dependencies that are relevant to production. I leave it as an exercise for you, but remember you have the whole power of Javascript at your disposal (instead of YAML or JSON), so this should be fairly achievable (I did that using [grunt.js](https://gruntjs.com/) a looong time ago).
