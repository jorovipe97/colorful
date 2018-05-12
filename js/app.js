var container,
  renderer,
  scene,
  camera,
  mesh,
  texture,
  start = Date.now(),
  fov = 30;

// Ensures DOM is loaded
window.addEventListener( 'load', function() {
	let queries = queryToJson();
	
	let sex = 'men';
	// Search for the sex query
	for (let i = 0; i < queries.length; i++)
	{
		if (queries[i].query === 'sex')
		{
			if (queries[i].val === 'girl') // Is the val of the sex query equals to girl?
			{
				sex = 'girl';
			}
		}
	}


	
	// BACKGROUND LOGIC
	container = document.getElementById('canvas-container');
	// create a scene
	scene = new THREE.Scene();

	// create a camera the size of the browser window
	// and place it 100 units away, looking towards the center of the scene
	camera = new THREE.PerspectiveCamera(
		fov,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	camera.position.z = 100;
	
	// Loads the texture
	if (sex === 'girl')
	{
		texture = new THREE.TextureLoader().load( '../img/girl-bg2-scaled.jpg' );
	}
	else
	{
		texture = new THREE.TextureLoader().load( '../img/man-bg1-scaled.jpg' );
	}

	
	// create a wireframe material
	/*material = new THREE.MeshBasicMaterial( {
		map: texture
		//wireframe: true
	} );*/

	material = new THREE.ShaderMaterial( {
	  vertexShader: document.getElementById( 'vertexShader' ).textContent,
	  fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
	  uniforms:
	  {
	  	res: { value: new THREE.Vector2(1920, 1080) },
	  	tex: {value: texture}
	  }
	} );

	let divider = 14;
	// create a sphere and assign the material
	mesh = new THREE.Mesh(
		new THREE.PlaneGeometry( 1920/divider, 1080/divider, 32 ),
		material
	);
	scene.add( mesh );

	// create the renderer and attach it to the DOM
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );

	container.appendChild( renderer.domElement );

	render();

});

// Renders the scene
function render() {

  // let there be light
  renderer.render( scene, camera );
  requestAnimationFrame( render );

}

// Resizes canvas
window.addEventListener('resize', function () {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

// DECODES QUERY TO JSON
function queryToJson()
{	
	// example search ?sex=men&age=19
	let searchStr = window.location.search; // this is a string
	searchStr = searchStr.replace(/%20/g, ''); // Removes white spaces using regular expresions
	searchStr = searchStr.replace('?', ''); // removes the '?' from the received string
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