# Panor

Change your website in panoramic view. By clicking and dragging you can navigate to other pages on your website. Click and drag to the left or to the right to navigate to pages on the same level. Click and drag up and down to navigate to other levels that are parent or child pages of the page you curently on.

## Instalation

### Step 1: Download the files
Download the files from the dist folder in this repository and them to your project folder.

The following step you need to repeat on each page you want to use Panor on.

### Step 2: Link the required files
Inside the page's `<head></head>` tags include the panor CSS file.

```html
<!-- Panor css file -->
<link rel="stylesheet" type="text/css" href="panor.min.css">
```

Before the `</body>` closing tag put the following JS files.

```html
<!-- JQuery -->    
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<!-- Panor js file -->
<script src="panor.min.js"></script>
```

### Step 3: Setup HTML Markup
Create the `<div class="panor">` element between the `<body></body>` tags of your page. Inside this element you can put your page content. 

```html
<div class="panor">
  <!-- 
    Page content goes here.
  -->
</div>
```

### Step 4: Intialize Panor
Call the `.panor()` on the `<div class="panor">` element. Make this call inside a `$(document).ready()` fucntion.

```javascript
$(document).ready(function() {
	$('.panor').panor({
		'http://panor.dev/demo/index.html': {},
		'http://panor.dev/demo/page.html': {}
	});
});
```

## Parameters

### Pages
The first parameter of the function is an object that defines the pages you want to scroll through. The key is the URL of the page. The value is an object for child pages underneath that page. An empty object means that the page doesn't have any child pages. You also can assign child pages to child pages and etc. For example you have an overview page with coworkers and each coworker has also it's own page. The page structure would look something like this:

```javascript
{
  'http://panor.dev/demo/coworkers.html': {
    'http://panor.dev/demo/johndoe.html' : {},
    'http://panor.dev/demo/janedoe.html' : {},
  },
}
```

### Options
The second parameter is an object for the options. For now there is only one option. An example for the options object is something like this:

```javascript
{
  showMenu: true
}
```

#### showMenu
Shows a menu of the pages on the right side of the screen.

```
default: false
options: boolean (true / false)
```

## Future
* Better mobile support
* Add more options for more customization
