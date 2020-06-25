# ScrollScale
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/appleple/SmartPhoto/master/LICENSE)

JavaScript program makes video enlarge when it appeares in the center of the window.

## Requirements
+ ES6
+ CSS3

## Usage
Install javascript and css program.
```html
<script src="js/ScrollScale.js"></script>
<link rel="stylesheet" href="css/ScrollScale.css">
```

Wrap video you want to enlarge with ScrollScale class.
```html
<div class="ScrollScale">
  <video src=""/>
</div>
```

js
```js
document.addEventListener('DOMContentLoaded',function(){
    new ScrollScale("id name");
});
```

You can create some contants layer on the video to place these between div of contants class.
```html
<div class="ScrollScale">
  <video src=""/>
  <div class="contants">
    <p>This text appear when video is enlarge. </p>
  </div>
</div>
```

### Basic Standalone Usage
```html
<div class="ScrollScale" id="ScrollScale1">
  <video src="video/sample.mp4" muted="muted" loop></video>
  <div class="contants">
	<div>
	  <h3>You can create some contants layer on the video.</h3>
	</div>
	<div>
	  <h3>contants class</h3>
	  <span>This is sample. This is sample. This is sample. This is sample.</span>
	  <a href="#">Button</a>
	</div>
  </div>
</div>

<script>
window.addEventListener('DOMContentLoaded', function(){
	new ScrollScale("ScrollScale1");
});
</script>
```

### Option
<table>
	<tr>
		<th>variable</th>
		<th>description</th>
		<th>default</th>
	</tr>
	<tr>
		<td>size</td>
		<td>small/middle/large size video</td>
		<td>middle</td>
	</tr>
	<tr>
		<td>animation</td>
		<td>animation of contants</td>
		<td>true</td>
	</tr>
</table>

Set Options
```js
window.addEventListener('DOMContentLoaded', function(){
  new ScrollScale("ScrollScale1", {
    size: "large",
    animation: false,
  });
});
```

## Caution
If you want to publish the site equiped this program for smartphone, you shoud write "poster" in video tag. 
