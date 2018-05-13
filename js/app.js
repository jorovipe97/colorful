var container,
  renderer = null,
  scene,
  camera,
  material,
  quad,
  texture,
  start = Date.now(),
  fov = 30,
  canvas = null;

  var bufferScene;
  var textureA;
  var textureB;
  var bufferMaterial;
  var plane;
  var bufferObject;
  var finalMaterial;
  var quad;

// Ensures DOM is loaded
window.addEventListener( 'load', function() {
	
	let queries = queryToJson();
	
	let sex = 'unknow';
	// Search for the sex query
	for (let i = 0; i < queries.length; i++)
	{
		if (queries[i].query === 'sex')
		{
			if (queries[i].val === 'girl') // Is the val of the sex query equals to girl?
			{
				sex = 'girl';
			}
			else if (queries[i].val === 'boy') // Is the query value is equal to 'boy'
			{
				sex = 'boy';
			}
		}
	}	
	console.log(sex);

	// Progress bar logic
	var loadicon = document.getElementById('load-icon');
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log('progress: ' + loaded / total);
  		// progressBar.style.width = (loaded / total * 100) + '%';
	};

	// Loading complete
	manager.onLoad = function ()
	{
		console.log('Loaded')
		loadicon.style.display = "none";
	}

	// Loads the texture
	if (sex === 'girl')
	{
		texture = new THREE.TextureLoader(manager).load( '/colorful/img/girl-bg.jpg' );
	}
	else if (sex === 'boy')
	{
		texture = new THREE.TextureLoader(manager).load( '/colorful/img/boy-bg.jpg' );
	}
	else // Default background
	{
		texture = new THREE.TextureLoader().load('/colorful/img/default-bg.jpg');
	}

	// If we are in mobile abort cute bg
	if (mobileAndTabletcheck())
		return;

	// Initialize the Threejs scene
	sceneSetup();

	// FRAME BUFFER TRICK
	bufferTextureSetup();
	
	// Like the update in unity
	renderBuffer();

});

function bufferTextureSetup(){
	//Create buffer scene
	bufferScene = new THREE.Scene();
	//Create 2 buffer textures
	textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );
	
	//Pass textureA to shader
	bufferMaterial = new THREE.ShaderMaterial( {
		uniforms: {
			mouse: {type: 'v3', value: new THREE.Vector2(0, 0, 0)}, // mouse: x, y, isClicked
			tex: { type: 't', value: texture},
			bufferTexture: { type: "t", value: textureA },
			res : {type: 'v2',value:new THREE.Vector2(window.innerWidth,window.innerHeight)}//Keeps the resolution
		},
		fragmentShader: document.getElementById( 'fragmentShader' ).innerHTML
	} );
	plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );
	bufferObject = new THREE.Mesh( plane, bufferMaterial );
	bufferScene.add(bufferObject);

	//Draw textureB to screen 
	// finalMaterial =  new THREE.MeshBasicMaterial({map: textureB});
	finalMaterial =  new THREE.ShaderMaterial({
		uniforms: {
			smoke: {type: 't', value: textureB},
			tex: {type: 't', value: texture},
			res: {type: 'v2',value:new THREE.Vector2(window.innerWidth,window.innerHeight)}//Keeps the resolution
		},
		fragmentShader: document.getElementById('finalFragment').innerHTML
	});
	quad = new THREE.Mesh( plane, finalMaterial );
	scene.add(quad);
}


function sceneSetup() {


	// BACKGROUND LOGIC
	container = document.getElementById('canvas-container');
	// create a scene
	scene = new THREE.Scene();

	var width = window.innerWidth;
    var height = window.innerHeight;
	// create a camera the size of the browser window
	// and place it 100 units away, looking towards the center of the scene
	camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
	camera.position.z = 2;

	// This is need for allow resizing
	if (renderer !== null)
	{
		container.removeChild(renderer.domElement);
		renderer.dispose();
	}
	// create the renderer and attach it to the DOM
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	canvas = document.getElementsByTagName('canvas')[0];
}

// Renders the scene
function render() {
  // let there be light
  renderer.render( scene, camera );
  requestAnimationFrame( render );
}

// Renders the scene frame buffer trick
function renderBuffer() {
	//Draw to textureB
	renderer.render(bufferScene,camera,textureB,true);
			
	//Swap textureA and B
	var t = textureA;
	textureA = textureB;
	textureB = t;
	quad.material.map = textureB;
	bufferMaterial.uniforms.bufferTexture.value = textureA;

	update();

	//Finally, draw to the screen
	renderer.render( scene, camera );
	requestAnimationFrame( renderBuffer );
}

function update()
{
	// Updates uniform
	document.onmousemove = function(event){
		// console.log('X: ' + event.clientX + ' Y: ' +event.clientY);
		// UpdateMousePosition(event.clientX,event.clientY)
		UpdateMousePosition(event.clientX,event.clientY)
	}
}

function UpdateMousePosition(X,Y){
	// var rect = canvas.getBoundingClientRect();
	/*var x = (X - rect.left) / canvas.clientWidth *  2 - 1;
	var y = (Y - rect.top) / canvas.clientHeight * -2 + 1;*/

	var rect = canvas.getBoundingClientRect();
	//console.log(rect);
	var mouseX = X;
	var mouseY =rect.height - Y; // DOM Coordinate system is inverted
	//console.log('X: ' + mouseX + ' Y: ' + mouseY);

	bufferMaterial.uniforms.mouse.value.x = mouseX;
	bufferMaterial.uniforms.mouse.value.y = mouseY;
}

// Resizes canvas
window.addEventListener('resize', function () {

	// If we are in mobile abort cute bg
	if (mobileAndTabletcheck())
		return;

	sceneSetup();
	// Updates the resolution uniform at quad shader
	bufferMaterial.uniforms.res.value.x = window.innerWidth;
	bufferMaterial.uniforms.res.value.y = window.innerHeight;

	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	// Resets the smoke frame buffer for avoid glitches
	bufferTextureSetup();
});

// DECODES QUERY TO JSON
function queryToJson() {	
	// example search ?sex=men&age=19
	let searchStr = window.location.search; // this is a string
	searchStr = searchStr.replace(/%20/g, ''); // Removes white spaces using regular expresions
	searchStr = searchStr.replace(/#/g, ''); // Removes # using regular expresions
	searchStr = searchStr.replace('?', ''); // removes the '?' from the received string
	console.log(searchStr);
	let searchs = searchStr.split('&');
	let searchsObj = []; // json array of searchs
	for (let i = 0; i < searchs.length; i++)
	{
		let arr = searchs[i].split('=');
		searchsObj.push({
			'query': arr[0],
			'val': arr[1]
		});
	}
	return searchsObj;
}


window.mobileAndTabletcheck = function() {
	/*
	Code from: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
	 */
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
};