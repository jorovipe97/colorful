var container,
  renderer,
  scene,
  camera,
  material,
  quad,
  texture,
  start = Date.now(),
  fov = 30;

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
	// Loads the texture
	if (sex === 'girl')
	{
		texture = new THREE.TextureLoader().load( '../img/girl-bg.jpg' );
	}
	else if (sex === 'boy')
	{
		texture = new THREE.TextureLoader().load( '../img/boy-bg.jpg' );
	}
	else // Default background
	{
		texture = new THREE.TextureLoader().load('../img/default-bg.jpg');
	}

	
	// Initialize the Threejs scene
	sceneSetup();
	
	// create a wireframe material
	/*material = new THREE.MeshBasicMaterial( {
		map: texture
		//wireframe: true
	} );*/

	/*material = new THREE.ShaderMaterial( {
	  vertexShader: document.getElementById( 'vertexShader' ).textContent,
	  fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
	  uniforms:
	  {
	  	res: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
	  	tex: { type: 't', value: texture}
	  }
	} );
	let geometry = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight);

	// create a sphere and assign the material
	quad = new THREE.Mesh(
		geometry,
		material
	);
	scene.add( quad );*/

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
	camera.position.z = 100;

	// create the renderer and attach it to the DOM
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	container.appendChild( renderer.domElement );
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
		UpdateMousePosition(event.clientX,event.clientY)
	}
}

function UpdateMousePosition(X,Y){
	var mouseX = X;
	var mouseY = window.innerHeight - Y; // DOM Coordinate system is inverted
	bufferMaterial.uniforms.mouse.value.x = mouseX;
	bufferMaterial.uniforms.mouse.value.y = mouseY;
}

// Resizes canvas
window.addEventListener('resize', function () {
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