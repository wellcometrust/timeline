Timeline
========

* Copyright (c) 2013 [The Wellcome Library](http://wellcomelibrary.org/)
* License: [MIT](http://en.wikipedia.org/wiki/MIT_License)
* Uses: [jQuery](https://github.com/jquery/jquery), [jQueryUI](https://github.com/jquery/jquery-ui), [moment](https://github.com/timrwood/moment), [iScroll](https://github.com/cubiq/iscroll), [jQuery Address](https://github.com/asual/jquery-address), [easyXDM](https://github.com/oyvindkinsey/easyXDM), [json2](https://github.com/douglascrockford/JSON-js)


The timeline can be [seen in action here](http://wellcomelibrary.org/using-the-library/subject-guides/genetics/makers-of-modern-genetics/genetics-timeline/)

The aim of the project was to provide a reusable presentation mechanism that was easily integrated into the Wellcome Library’s content management system and other data sources. The timeline can be embedded on any page, much like a YouTube video. Instead of a video file it loads a chunk of data in JSON format that provides it with text and graphics for all the events it needs to render. Anyone who can provide a file in this format can use the timeline to render their own events.

In this example the JSON is generated from a CMS – but it could come from any data source, or even be hand-crafted. [Here is an example](http://digirati-timeline-1.azurewebsites.net/Home/SavedTimelineByName?name=Battles-of-the-Hundred-Years-War) of the same timeline component loading JSON data generated from a SPARQL query to DBpedia:

The timeline shows more events as you zoom in, smoothly expanding the canvas until there is enough room for the chosen event.


## Embedding

You will notice that the [Example Timeline](http://wellcomelibrary.org/using-the-library/subject-guides/genetics/makers-of-modern-genetics/genetics-timeline/) has an 'embed' option in the bottom-left corner.

You can use the code in this panel to embed the timeline on your own website, e.g:

	<div class="timeline" data-uri="/content/timelines/history-of-genetics-timeline/" data-eventid="" style="width:600px; height:600px; background-color: #000"></div>
	<script type="text/javascript" src="http://wellcomelibrary.org/plugins/timeline/embed.min.js"></script><script type="text/javascript">/* wordpress fix */</script>

The timeline also supports 'deep linking' to events, where a hash value is appended to the Url as you browse e.g:

[http://wellcomelibrary.org/.../genetics-timeline/#16121](http://wellcomelibrary.org/using-the-library/subject-guides/genetics/makers-of-modern-genetics/genetics-timeline/#16121)


##Developers

The timeline project uses a [`build.ps1`](https://github.com/wellcomelibrary/timeline/blob/master/build.ps1) [PowerShell](http://en.wikipedia.org/wiki/Windows_PowerShell) script in the root of the project to combine and minify the various JavaScript files into [`embed.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/embed.min.js) and [`wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js), (right click > Run with PowerShell).
You will need [Google Closure Compiler](https://developers.google.com/closure/compiler/) - and a Java runtime - and will need to edit the build.ps1 file to point to it).

* [`embed.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/embed.min.js) - creates an iframe within `div.timeline` to host [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html).
* [`wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js) - contains all the jQueryUI widgets used to create the user interface, plus a few utility scripts.


To get the project running on localhost, create a website pointing to the `/src` directory with a virtual directory called 'build' pointing to the `/build` directory.

Alternatively, to run with Visual Studio's built-in web server 'Cassini' open the `/src` directory as a Web Site and change the solution's Virtual Path in the properties panel to `/`.
It is not possible to create a virtual directory to `/build` with Cassini, so follow the steps in the next paragraph to use the unminified scripts.

To debug individual scripts, open [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html), comment out [`wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js) and uncomment the scripts directly underneath.
Also open [`index.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/index.html) and change the src of the script tag from [`build/embed.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/embed.min.js) to [`js/embed.js`](https://github.com/wellcomelibrary/timeline/blob/master/js/embed.js)


### Data Format

The [example timeline data](http://wellcomelibrary.org/content/timelines/history-of-genetics-timeline/) employs the use of [Julian days](http://en.wikipedia.org/wiki/Julian_day). These are useful for plotting applications as they represent a calendar-independent, absolute unit of time.

However, the code controlling the main user interface only deals in [`moment`](https://github.com/timrwood/moment) objects.

The timeline loosely employs the [Provider Model](http://en.wikipedia.org/wiki/Provider_model), which abstracts the date parsing out to [`wellcomeTimelineProvider.js`](https://github.com/wellcomelibrary/timeline/blob/master/src/js/wellcomeTimelineProvider.js).

Providers could be created to work with any arbitrary date format that can be converted to [`moment`](https://github.com/timrwood/moment) objects.

To change the provider, edit the `provider` option of the `wellcomeTimeline` widget in [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html).

Use the `data-uri` attribute of `div.timeline` to set the path to your custom data source.

### Notes

The `/* wordpress fix */` empty script in the embed code is for convenience when using the Wordpress WYSIWYG editor, which will otherwise strip out the script tags.


