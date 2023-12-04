# DynamicWeb-P4

A project for my Dynamic Web class focusing on the concept of time and space, using a web graphics library.

This project uses p5.js in its code to render a full screen application. Everything, including the click handling, was done entirely in p5.js. I'm particularly pleased with the click handling able to detect clicking within circles. As you may notice, the HTML is extraordinarily bare-bones, only existing to import the scripts and provide a body to append a canvas to. Same with the stylesheet, only existing to make the canvas fit the screen nicely.

This was a fun project. I gathered all my data from NASA's official website to generate the scales of both planet sizes and distances. The sun is to-scale in the size one, whereas it isn't in in the distance scale one. The smallness of the planets in the distance mode was necessary to make the sheer distance of the planets apart from one another visible without some overlapping or making the canvas so long it was a pain to scroll (it's already 16x the length of the window).
