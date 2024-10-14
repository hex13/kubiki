import * as K from './kubiki.js';

K.init({width: 1024, height: 768, background: [0, 0, 0.4, 1]})
	.mount(document.body)
	.add(K.box().position(-1.4, 0))
	.add(K.box().position(1.4, 0))
	.add(K.triangle())
	.add(K.triangle().position(0, -2.0))
	.render()


			// {position: [0, -1.3], geometry: triangleGeometry},
			// {position: [-1.3, 0], geometry: boxGeometry},
