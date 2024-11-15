Kubiki - 3D library with fluent interface (WIP)
===

**NOTE: some things may not work yet ⚠️ library is still under development (i.e. WIP)**

Kubiki is wrapper over Three.js which allows for less boilerplate and more intuitive coding. 

```js
import * as K from 'kubiki/src/kubiki.js';

const box = K.box().position(0, -1, 0).scale(2, 2, 2).color(0.3, 1.0, 0.3).on('click', () => {
	alert(1);
})

const kubiki = K.init({
		width: 1024, height: 768, controls: 'orbit',
	}).mount(document.body);

kubiki.add(box);

function update(t) {
	kubiki.render(t);
	box.rotation(x => x + 0.03, y => y + 0.01, z => z);
	requestAnimationFrame(update);
}

requestAnimationFrame(update)
```
- [x] no need for creating renderer, camera, lights manually 
- [ ] but it will be possible to configure cameras, lights etc.
- [x] fluent-interface (jQuery-like)
- [x] DOM rendering (for e.g. labels)
- [x] easy adding events
- [x] utility for creating room geometries (width, height, where are doors, windows...)
- [x] scene tree (which allows for nesting objects)
- [ ] reactivity out of the box
- [ ] utility for areas (SceneObject::findArea)
- [ ] dev tools
- [ ] utils for shaders
