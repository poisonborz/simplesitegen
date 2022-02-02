

> :warning: **This project was created in a time before advanced design and prototyping tools like Figma/Sketch/XD/Canva were a thing. It might be still useful though if you have a bunch of raster images as your design document.**

simplesitegen
=============

A simplistic static site toolkit aimed at creating quick click dummies for prototypes. Transpiles handlebars templates, optimizes images and has a live reloading dev server. 

**In the example folder you find boilerplate utilities for inline visibility toggling, moveable notes and toggleable/clickable area highlighting (for anchors and imagemaps).**

When creating mockups, when available, I prefer to use original designs - instead of generic elements a'la Balsamiq or Moqups. It's also nice to have possibility 
to showcase more complex components with some quick inline js (eg dropdowns and hierarchically toggled items). Not finding suitable alternatives, this quick toolkit was created. 
It might serve as an alternative for this task to more complex generators like Jekyll/Hugo/Gatsby as they have different aims or are otherwise opinionated.

### See an [example wireframe](https://poisonborz.github.io/simplesitegen/dist/example)

## Installation and usage

Having installed Node, just type `npm i` in the project root.
The `src` folders should contain folders for each product/wireframe. This way you can maintain a single repo for multiple mockups.

The root of the folder should contain the html templates (only these are rendered) which can include [Handlebars syntax](https://handlebarsjs.com/guide/expressions.html), any
partial or block placed anywhere within in the product folder can be referenced.

Subdirectories in the product folder are called resource directories, and can be listed as comma delimited
list of paths with the --resDirs argument. They should contain partials and assets referenced by the template or the partials.
Files in these folders are processed this way: image files (_jpg, jpeg, png, gif, svg_) are optimized and then copied, all other files 
are just copied according to folder structure - except .html files, which are ignored everywhere.

As resource dirs/contents are copied as is, you can reference them from the root of the resource directories in the partials/components, paths will not change.

To quickly create designs, imagemaps is a great, albeit old-fashioned, but compatible way: just include the images,
then add maps for links. You can create maps easily online or with offline apps like [this](https://www.image-map.net/) or [this](https://www.softpedia.com/get/Internet/WEB-Design/Web-Design-related/Meracl-ImageMap-Generator.shtml)
[ones](https://handy-image-mapper.soft112.com/), if you have CC access Dreamweaver also has a great imageMap editor. 

# Syntax:
 
`node wireframe.js --product=example --OP --title=Example prototype --templateFileType=html --resDirs=folder,folder/subfolder`

* **product** (required) a folder within the src directory
* **OP** (optional | build) leave it empty or `--build` to process the whole folder once. 
`--watch` will make a build once and then create a server (from the `dist folder`), and then 
autoreload on any file change within the product folder.
* **title** (optional | _product name_) will be used for page titles
* **resDirs** (optional | 'res' ) you can define multiple folders (paths) within the product folder that will be handled
as resource folders (see above).
* **noImageOptim** (optional | false) Turn off image optimization, simply copy images 
