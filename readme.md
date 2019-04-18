

node-simplesitegen
===========

A simplistic static site generator aimed at creating quick click dummies for prototypes. Transpiles handlebars templates, optimizes images and has a live reloading dev server. 

**In the example folder you find boilerplate utilities for inline visibility toggling, moveable notes and toggleable clickable area highlighting (for anchors and imagemaps).**

When creating mockups, I like to use simple original designs (instead of a list of premade elements like Moqups) for flexibility and uniqueness. Its also nice to have possibility to showcase more complex components with quick inline js (eg dropdowns and hierarchically toggled items). Static site generators like Jekyll/Hugo/Gatsby etc are way overgrown for such tasks and would need to be shoehorned because they have different aims and are opinionated.

## Installation and usage

Having installed Node for your OS, just type `npm i` in the project root.
The `src` folders should contain folders for each product/wireframe. This way you can maintain a single repo for your mockups.

The root of the folder should contain the html templates (only these are rendered) which can include HBS syntax, any
partial or block placed anywhere within in the product folder can be referenced.

Subdirectories in the product folder are called resource directories, and can be listed as comma delimited
list of paths with the --resDirs argument. They should contain partials and assets referenced by the template or the partials.
Files in these folders are processed this way: image files (_jpg, jpeg, png, gif, svg_) are optimized and then copied, all other files 
are just copied according to folder structure - except .html files, they are ignored everywhere.

As resource dirs/contents are copied as is, you can reference them from the root of the resource directories in the partials/components, paths will not change.

To quickly create designs, imagemaps is a great, albeit old-fashioned, but compatible way: just include the images,
then add maps for links. You can create maps easily online or with offline apps [like](https://www.image-map.net/) [these](https://www.softpedia.com/get/Internet/WEB-Design/Web-Design-related/Meracl-ImageMap-Generator.shtml)
[ones](https://handy-image-mapper.soft112.com/), if you have CC access Dreamweaver also has a great imageMap editor. 

# Syntax:
 
`node wireframe.js --product=tsweb --OP --title=Example prototype --templateFileType=html --resDirs=folder,folder/subfolder`

* **product** (required) a folder within the src directory
* **OP** (optional | build) leave it empty or `--build` to process the whole folder once. 
`--watch` will make a build once and then create a server (from the `dist folder`), and then 
autoreload on any file change within the product folder.
* **title** (optional | _product name_) will be used for page titles
* **resDirs** (optional | 'res' ) you can define multiple folders (paths) within the product folder that will be handled
as resource folders (see above).
* **noImageOptim** (optional | false) Turn off image optimization, simply copy images 