// Author: Matthew Anderson
// CSC 385 Computer Graphics
// Version: Winter 2020
// Project 2: User classes
//
// Classes to help move the user.  The class UserRig internalizes the
// position of the VR headset and controllers.  Move the UserRig
// object to cause the user to change positions in VR.  The class
// UserPlatform represents platforms for the user to teleport to by
// clicking on, the small green circle indicates the front of the
// platform.

import * as THREE from '../extern/build/three.module.js';
import * as GUIVR from './GuiVR.js';

export class UserRig extends THREE.Group {

    constructor(camera, xr){
	super();

	this.add(camera); // Add camera to the rig.
	this.xr = xr;

	// Set up the controller to be represented as a line.
	// This code use to be in init() in main.js.
	for (var i = 0; i < 1; i++){
	    var controller = xr.getController(i);
	    if (controller != undefined){
		controller.addEventListener('selectstart',
					    (ev) => (this.onSelectStartVR(ev)));
		this.add(controller); // Add controller to the rig.
		var controllerPointer =
		    new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([
			    new THREE.Vector3(0, 0, 0),
			    new THREE.Vector3(0, 0, -1)]),
			new THREE.LineBasicMaterial({
			    color: 0xff0000,
			    linewidth: 4}));
		controllerPointer.name = 'pointer';
		controllerPointer.scale.z = 20;
		controller.add(controllerPointer.clone());
	    }
	}
    }

    onSelectStartVR(event){
	// VR trigger event handler.  Use to be in main.js, but
	// otherwise does what it did before.
	
	if (!(event instanceof MouseEvent) && this.xr.isPresenting()){
	    // Handle controller click in VR.
	    
	    // Retrieve the pointer object.
	    var controller = event.target;
	    var controllerPointer = controller.getObjectByName('pointer');
	    
	    // Create raycaster from the controller position along the
	    // pointer line.
	    var tempMatrix = new THREE.Matrix4();
	    tempMatrix.identity().extractRotation(controller.matrixWorld);
	    var raycaster = new THREE.Raycaster();
	    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
	    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
	    
	    // Register the click into the GUI.
	    var hit = GUIVR.intersectObjects(raycaster);
	    if (hit){
		//debugWrite("Hit something");
	    }
	    
	    //DEBUG.displaySession(this.xr);
	    //DEBUG.displaySources(this.xr);
	    //DEBUG.displayNavigator(navigator);
	}
    }
}


export class UserPlatform extends GUIVR.GuiVR {

    constructor(userRig){
	super();

	// Make the shape of a platform.
	var platform = new THREE.Mesh(
	    new THREE.CylinderGeometry(1, 1, 1, 32),
	    new THREE.MeshPhongMaterial({color: 0x0000FF}));

	var front = new THREE.Mesh(
	    new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32),
	    new THREE.MeshPhongMaterial({color: 0x00FF00}));

	// The front direction of the platform is -z.
	front.position.y = 0.55;	
	front.position.z = -1;
	this.add(front);

	this.add(platform);
	this.collider = platform;

	this.userRig = userRig;
    }

    
    collide(uv, pt){
	// When the user clicks on this platform, move the user to it.
	this.add(this.userRig);
    }
}
