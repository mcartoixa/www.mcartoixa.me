---
layout: post
title: "Continuous Integration for Ruby"
date: 2020-09-21 09:57:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration ruby rake
series: 2020-about-continuous-integration
---

I have had to deal with a few projects in Ruby recently and I have tried to adapt [my practices](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html) to this new environment. On a personal level this means less cognitive load when I have to come back to these projects months later, even more so because Ruby is far from my area of expertise. As it happens I have had quite some trouble implementing Continuous Integration because of (seemingly) conflicting conventions. But I have tried anyway:

* [A simple project](#a-simple-project)
* [A more complete project](#a-more-complete-project)

## A simple project
[My website (which includes my blog)](https://github.com/mcartoixa/mcartoixa.github.io) ([https://github.com/mcartoixa/mcartoixa.github.io]((https://github.com/mcartoixa/mcartoixa.github.io))) is in fact based on Ruby, as it is a [Jekyll](https://jekyllrb.com/) project hosted on [GitHub Pages](https://pages.github.com/) (for now). Granted, it is not a proper Ruby project (as Ruby is not required on the target server for instance) but I find it is a good introduction to the concepts and the tools involved.

The main elements of the project are:
* [The build file](#the-build-file) (`Rakefile`).
* [The script file](#the-script-file) (`build.sh`) that helps executing the build file locally.
* [The CI configuration file](#the-ci-configuration-file) (`.travis.yml`).

### The build file
I don't think there is much choice here in the build tool to use in a Ruby environment, so [Rake](https://ruby.github.io/rake/) it is. Here is the whole file:
```rb
PROJECT_NAME ||= 'www.mcartoixa.me'
PROJECT_VERSION ||= '0.0.0'

import 'build/common.rake'
```
Alright, I cheated. I like to gather everything build related in a `build\` folder and I did that here. But what we loose in straightforwardness we gain in consistency, because in [a Rails project](https://rubyonrails.org/), where many tasks and targets are imported, I find this actually brings more readability to the project.

So, what's in there? [The build file](https://github.com/mcartoixa/mcartoixa.github.io/blob/master/build/common.rake) defines the following targets (ie *tasks* in Rake speak), overall consistent with what we have seen in other technologies:
* *build:clean*: cleans the build (the `tmp\` directory).
* *build:compile*: creates the static version of the website (using Jekyll), ready for deployment (in the `tmp\obj\bin\` folder).
* *build:test*: tests the project.
  * I want to check the links in my website using [HTMLProofer](https://github.com/gjtorikian/html-proofer). I could use [a Jekyll plugin](https://github.com/episource/jekyll-html-proofer) for this, but testing links proves rather time consuming and error prone (more on that later) and I would rather keep it out of my development workflow.
* *build:analyze*: checks deprecation and configuration issues (using Jekyll).
* *build:package*: creates a deployable archive of the static version of the website (in the `tmp\out\bin\` folder).
  * This is of little use right now as everything is handled by GitHub pages, including deployment, but this is partly a proof of concept. And I like the freedom of knowing I could host my website elsewhere at any moment.
* *build:build*: shortcut for the combination of *build:compile*, *build:test* and *build:analyze*.
* *build:rebuild*: shortcut for the combination of *build:clean* and *build:build*.
* *build:release*: shortcut for the combination of *build:clean*, *build:build*, and *build:package*.

What's remarkable here is the use of namespaces in the tasks names. Again, this proves useful (and consistent) in [a Rails project](https://rubyonrails.org/). And so the description of the *build:compile* task is simply:
```rb
namespace 'build' do
  task 'compile' do
    sh 'jekyll', 'build', '-dtmp/obj/bin/', 'JEKYLL_ENV=production', '--strict_front_matter'
  end
end
```

The *build:test* task is slightly more complicated, but is in fact mainly [HTMLProofer](https://github.com/gjtorikian/html-proofer) configuration:
```rb
require 'html-proofer'
namespace 'build' do
  task 'test' => %w[compile]
  task 'test' do
    options = {
      :allow_hash_href => true,
      :assume_extension => true,
      :check_favicon => true,
      :check_opengraph => true,
      :file_ignore => [
        /\/blog\/software-craftsmanship\/20[01]\d\//, # Do not check old blog posts
        /\/sections\//
      ],
      :root_dir => 'tmp/obj/bin/',
      :url_ignore => [
        'http://html5up.net', 'https://chrisbobbe.github.io/', # Included by the template
        'https://www.facebook.com/mathieu.cartoixa', # 404 only when checked...
        'https://www.linkedin.com/in/cartoixa/', 'https://www.linkedin.com/in/cartoixa/?trk=profile-badge' # 999 only when checked
      ]
    }
    HTMLProofer.check_directory('tmp/obj/bin/', options).run
  end
end
```

And then the *build:package* task requires an external package for the creation of the archive: the default [PackageTask](https://ruby-doc.org/stdlib-trunk/libdoc/rake/rdoc/Rake/PackageTask.html) does not seem to support well the archiving of files outside the root of the project. This gives something like:
```rb
require 'zip'
namespace 'build' do
  namespace 'package' do
    PACKAGE_FILE = 'tmp/out/bin/www.mcartoixa.me-0.0.0.zip'
    file PACKAGE_FILE =>  %w[build:compile]
    file PACKAGE_FILE do
      FileUtils.mkdir_p('tmp/out/bin/')
      Zip::File.open(PACKAGE_FILE, Zip::File::CREATE) do |zf|
        Rake::FileList.new('tmp/obj/bin/**/*').each do |f|
          zf.add(f.delete_prefix('tmp/obj/bin/'), f)
        end
      end
    end

    task 'build' => PACKAGE_FILE
  end
  task 'package' => %w[package:build]
end
```
Please note here that one of the main features of a build tool is the ability to describe dependencies between targets. This is demonstrated here:
* the *build:package* task depends on *build:package:build*.
* the *build:package:build* task depends on the rule to build *tmp/out/bin/www.mcartoixa.me-0.0.0.zip*.
* the rule to build *tmp/out/bin/www.mcartoixa.me-0.0.0.zip* depends on *build:compile* (the static website needs to have been created before attempting to package it).
This might seem a bit confusing to the newcomer but it is in fact very powerful (when used sensibly).

The last thing I would like to add here is that [HTMLProofer](https://github.com/gjtorikian/html-proofer) is a fine tool but:
* I still have to find a way for it not to complain when I just added a new blog post that it in fact does not exist (yet).
* sometimes websites will fail because... reasons, and it should not prevent my own build from succeeding. I guess I should make sure that it only triggers warnings instead of errors.

### The script file
Having managed to run an instance of [Redmine](https://www.redmine.org/) on Windows Server 2012 and IIS, I figured Ruby was a cross-platform technology. In reality I have since experienced that many dependencies that require native compilation are poorly (or not at all) maintained: running a Rails application with MariaDB and Redis connections is a nightmare (when possible at all).

Disclaimer aside (no `build.bat` then), the gist of the `build.sh` file is simply (using [Bundler](https://bundler.io/) here):
```shell
if bundle check > /dev/null; then
  bundle clean
else
  bundle install --standalone --clean
fi

bundle exec rake build:${TASK}
```

### The CI configuration file
We need a CI platform that runs MacOS or Linux, so [Travis CI](https://travis-ci.org/) will do just fine. Once again, having dealt with all the difficulties in the build file, the `.travis.yml` is just:
```yaml
before_install:
- gem install bundler
install:
- bundle install --standalone --clean --jobs=3 --retry=3
script:
- bundle exec rake build:release
```

## A more complete project
This is where the trouble really begins. Having tried to apply the same principles to a more complex Rails project I came against difficulties that seem hard to overcome. This may be because of my lack of knowledge of the environment itself, but it might also be because of conflicting conventions. I have the sense for instance that everything is done to allow the developer to achieve everything (and anything) from the command line. This might mean many things like:
* you don't have to work in another directory, and in fact you should not. It seems quite a hassle (compared to Javascript for instance) to handle a copy of the source code elsewhere where you retrieve only production dependencies for packaging purposes.
* some tools have *memory*. [Bundler](https://bundler.io/) will remember your current environment (*development*, *production*) for instance.
* worse, the so called [*Deployment Mode*](https://bundler.io/v2.1/man/bundle-install.1.html#DEPLOYMENT-MODE) will explicitely screw up your development environment.

Hard to [run your build locally](/blog/software-craftsmanship/2020/09/02/my-take-on-continuous-integration.html#build-in-1-step) with these features!... This is not intended as a rant though, and if you have some insight on how to reconcile both worlds: please share.

Though I cannot share a real and complete project here I can show Rakefile elements that can be of some use:
* how to run Ruby to check your source files syntax (this goes in the *build:compile* target):
  ```rb
  SOURCE_FILES = Rake::FileList.new('.ruby-*', 'config.ru', 'Gemfile*', 'Rakefile', 'app/**/*', 'bin/**/*', 'config/**/*', 'db/**/*', 'lib/**/*', 'public/**/*', 'vendor/**/*') do |fl|
    fl.exclude(/^config\/app_parameters.yml$/)
    fl.exclude(/\.log$/)
  end
  RUBY_FILES = Rake::FileList.new(SOURCE_FILES.dup.to_a.select do |path|
    path.ends_with?('.rb')
  end) do |fl|
    fl.exclude(/^vendor\//)
  end

  namespace 'build' do
    rule '.rb.log' => [
      proc { |tn| tn.gsub(/\.rb\.log$/, '.rb').sub(/tmp\/obj\//, '') }
    ] do |t|
      FileUtils.mkdir_p(File.dirname(t.name))
      ruby "-wc #{t.source} > #{t.name}"
    end
    task 'compile' => RUBY_FILES.gsub(/\.rb$/, '.rb.log').sub(/^/, 'tmp/obj/')
  end
  ```
  We define rules for `*.rb.log` files that will be generated by running Ruby on the corresponding `*.rb` file and storing the output. The task we define then depends on the generation of those files.
* how to run [Reek](https://github.com/troessner/reek) on your Ruby files (this creates a *reek* target):
  ```rb
  require 'reek/rake/task'
  Reek::Rake::Task.new do |t|
    t.config_file = '.reek.yml'
    t.source_files = RUBY_FILES
    t.reek_opts = '-s --force-exclusion --no-progress'
  end
  ```
* how to run [Rubocop](https://rubocop.org/) on your Ruby files (this creates a *rubocop* target):
  ```rb
  require 'rubocop/rake_task'
  RuboCop::RakeTask.new(:rubocop) do |t|
    t.formatters = ['clang', ['html', '-o', 'tmp/rubocop-results.html']]
    t.patterns = RUBY_FILES
  end
  ```

As I wrote before, should you choose to use static analysis tools such as [Reek](https://github.com/troessner/reek) and/or [Rubocop](https://rubocop.org/) (and you should), you should do it as soon as possible in the life of your project in order to avoid to have hundreds of warnings to correct at once...

Packaging proves the more challenging because when you are generating assets as part of the build (like minified Javascript files for instance), then you have to create [file lists](https://ruby-doc.org/stdlib-trunk/libdoc/rake/rdoc/Rake/FileList.html) *after* those files have been generated ([target *assets:precompile* in a Rails project](https://guides.rubyonrails.org/asset_pipeline.html#precompiling-assets)). This gives something like:
```rb
require 'rake/packagetask'
PACKAGED_FILES = Rake::FileList.new(SOURCE_FILES.dup) do |fl|
  fl.exclude(/^app\/assets\//)
end
namespace 'build' do
  namespace 'package' do
    pt = Rake::PackageTask.new('my_application', '0.0.0') do |t|
      t.need_tar_gz = true
      t.package_dir = 'tmp/obj/bin/'
      t.package_files = PACKAGED_FILES
    end

    file pt.package_dir_path + '/public/assets' => %w[assets:precompile]
    file pt.package_dir_path + '/public/assets' do
      pt.package_files = pt.package_files + Rake::FileList.new('public/assets/**/*')
    end

    task 'build' => pt.package_dir_path + '/public/assets'
    task 'build' => %w[package]
    task 'build' do
      FileUtils.mkdir_p('tmp/out/bin/')
      FileUtils.mv(File.join(pt.package_dir, pt.tar_gz_file), 'tmp/out/bin/')
    end
  end
  task 'package' => %w[package:build]
end
```

The whole build kind of works when specifying specific command lines in the CI configuration (again this cannot be part of the *local build*):
```shell
bundle install --standalone=test --deployment
RAILS_ENV=test bundle exec rake build:release
```
Not ideal as we will be packaging with *test* dependencies as well (things like [capybara](http://teamcapybara.github.io/capybara/) or [RSpec Rails](https://relishapp.com/rspec/rspec-rails/docs)). But hey: work in progress.


