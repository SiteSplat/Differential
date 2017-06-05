# Differential
An image comparison engine. Side-by-side, layered and hover comparison methods. No dependencies. Pre-release.

[Demos](https://codepen.io/Mobius1/full/MmdvQM)


## Quick Start

Add the js and css files to your document

```html
<link rel="stylesheet" type="text/css" href="path/to/differential.min.css">
<script type="text/javascript" src="path/to/differential.min.js"></script>
```

Initialise the plugin

```javascript
var diff = new Differential({
	images: [
		{
			src: "image-a.jpg",
			label: "Label for image-a"
		},
		{
			src: "image-b.jpg",
			label: "Label for image-b"
		}
	],
	type: "side-by-side",
	zoom: true,
	pan: true
});
```

## Changelog

### v0.0.1 (Pre-release)
* Initial commit

Copyright © 2017 Karl Saunders | BSD & MIT license