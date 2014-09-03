#jQuery Popup#

###Intro###
Popup extension to make controls like a automatic collapsed controls, i.e. popup menu, volume controls and etc.


###How to install###
1. Add to `bower.json` of your project:
```javascript
{
	// ...
	"dependencies": {
		// ...
		"jquery.ui-popup": "git://github.com/DenisIzmaylov/jquery.ui-popup.git"
	}
}
```

2. Run `bower install`.
3. To any place at your HTML (just for example):
```html
<link href="path/to/plugin/css/jquery.ui-popup.css" rel="stylesheet" />
<script src="path/to/plugin/js/jquery.ui-popup.js"></script>
<script src="javascript">
	
	$(document).ready(function () {
		
		$('#myButton').UIPopup({
            timeout: 1500
		});

	});
	
</script>
<button id="myButton" type="button" data-target="#myPanel">Title</button>
<div id="myPanel" class="panel"></div>
```
4. You can also look example in `example.html`.


###Todo###
1. Add touch devices support
2. Add closeByTarget and closeByWindow support
3. Add position and detached DOM elements in target property support
