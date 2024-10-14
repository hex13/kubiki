import * as K from './kubiki.js';

K.init({width: 1024, height: 768, background: [0, 0, 0.4, 1]})
	.render()
	.mount(document.body);