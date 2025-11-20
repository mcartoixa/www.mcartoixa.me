---
layout: post
title: "Software Factory vs Usine Logicielle"
date: 2007-04-20 15:07:00 +0200
category: software-craftsmanship
tags: opinion software-factory
---

Software Factory is a term that has been very closely related to [Microsoft](https://www.microsoft.com/), ever since the company began promoting it. In [this two pages advertisement](http://www.softwarefactories.com/ScreenShots/MS-WP-04.pdf) (June 2004), you can read:
> A software factory is a product line that configures extensible development tools like Microsoft Visual Studio Team System (VSTS) with packaged content and guidance, carefully designed for building specific kinds of applications.

<a data-flickr-embed="true" href="https://www.flickr.com/photos/cartoixa/457417578/" title="P3080003"><img align="right" src="https://live.staticflickr.com/228/457417578_95491f7678_m.jpg" width="240" height="180" alt="P3080003"></a>
The advertisement is a mashup of a [666](https://en.wikipedia.org/wiki/Number_of_the_Beast) pages book named "[Software Factories](http://www.softwarefactories.com/TheBook.html)". The book is a complete tour of what a Software Factory is, written in a rather heavy and poor style, which is probably why [a lot of people still argue about the term definition](https://en.wikipedia.org/wiki/Software_factory).

But even more controversial, I found, is its french translation: literally "Usine Logicielle". Read [Keith Short](http://blogs.msdn.com/keith_short/) (co-author of the above cited book) in this article:

> "The key is not to think of a factory like a turn-of-the-century sweatshop," Short says. "The image we’d like people to have in mind when they see the word ‘factory’ is much more like a production line staffed by robots, where humans are doing the creative tasks in setting up the production line, but the rote or menial steps are done by robots."

So what am I supposed to think of when I read this article in [01 Informatique](https://www.01net.com/), a quite renowned french magazine, about [Software Factory plants](http://www.01net.com/editorial/283181/go/pilote-d-usine-logicielle/)? It describes how software developers are packed in production centers (I am to blame for the translation):
> Pour planifier, suivre et réagir au plus vite, le responsable de production s'appuie sur une multitude de tableaux de bord. D'ailleurs, à voir le PC de Benoît Mompon, on se croirait dans la cabine de pilotage d'un avion long courrier. Voyants, tableaux, et graphiques en tout genre lui fournissent en temps réel les indicateurs de productivité, d'avancement des projets, de niveau de satisfaction des clients. (...) Il s'agirait donc, à première vue, d'une simple transposition des pratiques de l'industrie. A une nuance près : « Ce sont des hommes, et non des machines que nous gérons », martèle Benoît Mompon.

> In order to establish plans, follow them and still be highly reactive, the production manager relies on many indicators. Benoît Mompon's computer could easily make you think you were in a long-flight jet cockpit. Indicators, tables and graphs of many kinds provide him with real-time metrics for productivity, projects advancement, clients satisfaction level. (...) It would seem, at first sight, like a simple transposition of standard industry methods. With one nuance though : « We are dealing with men, not machines », hammers Benoît Mompon.

<a data-flickr-embed="true" href="https://www.flickr.com/photos/cartoixa/404389148/" title="PC100091"><img align="left" src="https://live.staticflickr.com/166/404389148_f75d378053_m.jpg" width="180" height="240" alt="PC100091"></a>
No April's fools, no joke, no false friends: some people here do think (and I suspect dream) that a Software Factory can be a sweatshop! Let them do.

More common now are people who think a Software Factory is in fact a set of breaking edge and almost never heard of but allegedly highly efficient tools like Software Configuration Management, Unit Testing, Bug Tracking, Continuous Integration server... Yes, it seems actually that a vast majority of open source projects would be based on a Software Factory (without most of them being aware of it, I guess ;-)! Take a look at [NovaForge](http://www.bull.com/integration/novaforge.html), which is exactly that: the english version reads "software forge" (subtle difference), while the [french version](http://www.bull.com/fr/services/novaforge.php) reads "usine de développement logicielle" (no difference at all).

But the worst part is that even [Microsoft France](href="http://www.microsoft.com/fr/fr/default.aspx) uses the term "Usine Logicielle" in this acception. In this [success story description](https://www.microsoft.com/france/temoignages/2007/info.asp?mar=/france/temoignages/2007/p_Cimail_0107.html), they describe how, by automating their tests and their deployment (thanks to VSTS, of course), they could create "une véritable usine de développement logiciel".  Well, excuse me, but I see it more like a way to get the 4 cheapest points (out of 12) in [the Joel Test](http://www.joelonsoftware.com/articles/fog0000000043.html). 4 is far better than 0 allright, but this is far from giving you a Software Factory!

I am working on an actual Software Factory at [NourY Solutions](http://www.nourysolutions.com/) right now. And we are going all the way through our product line definition, our Software Factory Schema definition, our Domain Specific Languages definition. We are creating our own set of tools as well as configuring existing ones, developing our own set of libraries as well as integrating existing ones. Our work is still incomplete, but one thing is for sure: there is far more to a Software Factory than to use [Subversion](http://subversion.tigris.org/) and [CruiseControl](http://cruisecontrol.sourceforge.net/). I even took it for granted that nobody could seriously develop software without these tools anyway ;-)

<script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>
