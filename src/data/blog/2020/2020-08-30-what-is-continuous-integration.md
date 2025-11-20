---
layout: post
title: "What is Continuous Integration?"
date: 2020-08-30 15:27:00 +0200
header: /src/data/blog/2020/2020-about-continuous-integration.png
category: software-craftsmanship
tags: continuous-integration
series: 2020-about-continuous-integration
---

Everybody does Continuous Integration (CI) nowadays, right? Right? Right...

But what is it exactly?
* Is it a tool like [Jenkins](https://www.jenkins.io/), [Travis](https://travis-ci.org/) or [CircleCI](https://circleci.com/)?
* Is it code?
* Is it a movement, like DevOps (or even Agile)?
* Is it the same as Continuous Delivery (or Deployment)?
* Is it a burden?

***TL;DR***: the answer to all those questions is *no*.

* [Disclaimer](#disclaimer)
* [The origins of CI](#the-origins-of-ci)

## Disclaimer
I am old enough to have worked in a world without Continuous Integration (CI), and I have seen it becoming more ubiquitous by the day. And now that is seems to be everywhere I realize that people have different and wide ranging expectations of what CI is (and should be). These differences are often implicit and are rarely addressed, leading to a lot of misunderstanding, frustration and polarization (as is usual in Software Engineering [and elsewhere](https://www.wired.com/story/jeff-weiner-on-how-technology-accentuates-tribalism/)).

[![Family Tensions](https://faasandfurious.com/pages/family-tensions.png)](https://faasandfurious.com/119)

This is why I have decided to start this series of posts to try and lay down what *my views* are on this matter. The goal is not to convince anybody that I am right, but rather to engage a discussion with [those who are willing to try and understand before disagreeing](https://www.nytimes.com/2017/09/24/opinion/dying-art-of-disagreement.html):
> To disagree well you must first *understand* well.

YMMV, the scope of your projects might require a different organization based on other principles and this is fine (unless of course we happen to be working together [in which case I am right](https://www.youtube.com/watch?v=E_LUGY_ptGA), obviously).

## The origins of CI
Continuous Integration is a practice that originates from [eXtreme Programming](https://en.wikipedia.org/wiki/Extreme_programming). Software integration being an essential and beneficial (albeit potentially very painful) practice in Software Development, it was decided to try and do it as often as possible (read: [all the time](http://www.extremeprogramming.org/rules/integrateoften.html)). Gone were the days when individuals worked on different slices of a system and only tried to reconcile them every few weeks. Or months. The essentials of CI have of course [been summarized by Martin Fowler](https://martinfowler.com/articles/continuousIntegration.html):
> Continuous Integration is a software development practice where members of a team integrate their work frequently, usually each person integrates at least daily - leading to multiple integrations per day. Each integration is verified by an automated build (including test) to detect integration errors as quickly as possible.

Please read the whole article if you have not already. Some people I know may dismiss it by the mere fact that it was written *so long ago* (in 2006), automatically making it irrelevant in this day and age when a new JavaScript framework seems to take the industry by storm every 6 months or so. But to me this is just further proof that we don't know our history (hence [the eternal rediscovery of ancient concepts](https://www.youtube.com/watch?v=KjgvffBlWAg)). I think the principles laid out in the article stand.

Now you know everything about CI, let me confuse you with my own derived principles and practices.
