# Web Frontend Tips

Right now i use this file to collection my messy ideas about web, later im gonna format these in a better way. for now im just collecting my ideas.

---

Always use semantic html tags, if they exist.

If not using aria roles, and example would be `[role="group"]`

HTML is not DOM, html is a language that generates the DOM. in dom everything is a node, childnode, element, or htmlelement, and etc. For example if you try to have nested form elements, html will not parse that as you would expect. html also wouldnt let you append anything inside `<img>` element for example. but you can do all of these using js to manipulate the DOM. so html is just data like json, it html gets parsed into the DOM. your dom is not html. but you can serilize it into html with some loss.

in js prefer modern DOM methods such as `.append()`, `.prepend()`, etc... in favor of `.appendChild()` for example.

## Use Modern Display Property
while writing `display` properties use modern syntax. 

for example: 
- not `grid` but `block grid`
- not `inline-flex` but `inline flex`
- not `block` but `block flow` 
- etc. 

it more explicit and explains the intent better.

## Use `em` as your default unit

while sizing things in css always use `em` units. ALWAYS. 

it let's you size anything relatively, just by changing the font-size. really useful. 

if you wanna change a text size, change the font-size on the direct element text is in.

## Prefer Logical Properties
- never prefer using `width/height`, `top/bottom/left/right`, etc. 

instead use: 
- `block-size`, `inline-size`, 
- `inset-block-start`, 
- `padding-inline`, `padding-block-end`, 
- `border-start-start-radius` 
- etc... 

always use the logical alternatives.

also never use these as well:
- `padding: 1em 2em`
- `margin: 1em 2em`

because these above examples implicit way of using `left/right/top/bottom`

Why:
- first of all if you change the direction in your app, like for example instead of `ltr` you wanna use `rtl`, if you used logical properties everywhere, everything will just work out.
- also layouts like `grid`, and `flex`, uses logical `start/end` as well. so if you are using `left/right/top/bottom/width/height/etc` you are mixing different systems. and will cause issues to you later.

When not to use:
- of course there are rare times you need `left/right/top/bottom/width/height/etc`
- for example you might use js to get position or width and height of something, and your js modifies the styles based on those, you should use `left/right/top/bottom/width/height/etc` 
- lets say you have a canvas, and have object on the canvas, when you click on the object, you wanna open a popover on the dom and position it on that object on the canvas, then you should use `left/right/top/bottom/width/height/etc`.
- or you click somehwere and wanna open a context menu. then you should use `left/right/top/bottom/width/height/etc` too. 

so basically if you are working with layout, never use `left/right/top/bottom/width/height/etc`, but if you are getting position and size of things on the screen, then use them.

## Modals (`<dialog>` vs `[popover]`)

we used to had to make our own modals and popovers, but now there are standards, so we should follow them for consistent user experience, and accessiblity.

when to use `<dialog>`
- if you are using dialogs, my rule is never use `.show()`, only use `showModal()`. because if you are using `.show()`, you should probably be using `[popover]` which came out after `<dialog>`.
- while positioning dialog, 

...gonna continue writing

(talk about font-family: system-ui)
(talk about currentcolor color-mix and relative colors, and colors)
(talk about respecting the user's browser settings and defaults)
(talk about custom-elements)
(talk about how shadowdom is seperated and not have to be used with custom-elements, and when they should be used instead)
(talk about layout shifts, sizing things, layout, grid, and how flex shouldnt be your default choise)
(talk about using semantic html with scoped classless css, mention tags like, small, search, dd,dt,dl, ul, ol, li, article, section+aria-label, etc...)
(talk about css container queries and style selectors, how they can be used)
