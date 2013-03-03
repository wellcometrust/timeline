Timeline
========

* Copyright (c) 2013 [The Wellcome Library](http://wellcomelibrary.org/)
* License: [MIT](http://en.wikipedia.org/wiki/MIT_License)
* Uses: [jQuery](https://github.com/jquery/jquery), [jQueryUI](https://github.com/jquery/jquery-ui), [moment](https://github.com/timrwood/moment), [iScroll](https://github.com/cubiq/iscroll), [jQuery Address](https://github.com/asual/jquery-address), [easyXDM](https://github.com/oyvindkinsey/easyXDM), [json2](https://github.com/douglascrockford/JSON-js)
* [Example Timeline](http://wellcomelibrary.org/using-the-library/subject-guides/genetics/makers-of-modern-genetics/genetics-timeline/)

##Usage

You will notice that the [Example Timeline](http://wellcomelibrary.org/using-the-library/subject-guides/genetics/makers-of-modern-genetics/genetics-timeline/) has an 'embed' option in the bottom-left corner.

You can use the code in this panel to embed the timeline on your own website: 

	<div class="timeline" data-uri="/content/timelines/history-of-genetics-timeline/" data-eventid="" style="width:600px; height:600px; background-color: #000"></div>
	<script type="text/javascript" src="http://wellcomelibrary.org/plugins/timeline/embed.min.js"></script><script type="text/javascript">/* wordpress fix */</script>

The `/* wordpress fix */` empty script is for convenience when using the Wordpress WYSIWYG editor, which will otherwise strip out the script tags.

[`embed.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/embed.min.js) creates an iframe within `div.timeline` to host [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html). [`wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js) contains all the jQueryUI widgets used to create the user interface, plus a few utility scripts.

###Data Format

[Example json data](http://wellcomelibrary.org/content/timelines/history-of-genetics-timeline/)

The example timeline employs the use of [Julian days](http://www.digirati.co.uk/Blogs/Dates/2011/8/Handling-historical-dates/).

However, the code controlling the main user interface only deals in [`moment`](https://github.com/timrwood/moment) objects.

The timeline loosely employs the [Provider Model](http://en.wikipedia.org/wiki/Provider_model), which abstracts the date parsing out to [`wellcomeTimelineProvider.js`](https://github.com/wellcomelibrary/timeline/blob/master/src/js/wellcomeTimelineProvider.js).

Providers could be created to work with any arbitrary date format that can be converted to [`moment`](https://github.com/timrwood/moment) objects.

To change the provider, edit the `provider` option of the `wellcomeTimeline` widget in [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html).

Use the `data-uri` attribute of `div.timeline` to set the path to your custom data source.

### Project

The timeline project is split into `/src` and `/build` directories, with a [`build.ps1`](https://github.com/wellcomelibrary/timeline/blob/master/build.ps1) PowerShell script in the root of the project which combines and minifies the various JavaScript files into [`/build/embed.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/embed.min.js) and [`/build/wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js).

To get the project running on localhost, create a website pointing to the `/src` directory with a virtual directory called 'build' pointing to the `/build` directory.

To debug individual scripts, open [`timeline.html`](https://github.com/wellcomelibrary/timeline/blob/master/src/timeline.html), comment out [`wellcomeTimeline.min.js`](https://github.com/wellcomelibrary/timeline/blob/master/build/wellcomeTimeline.min.js) and uncomment the scripts directly underneath.





