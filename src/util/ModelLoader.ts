import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export const ModelLoaderOBJ = (url: string) => {
    return new Promise((resolve: (model: THREE.Mesh) => void, reject) => {
        // instantiate a loader
        const loader = new OBJLoader();
        // load a resource
        loader.load(
            // resource URL
            process.env.PUBLIC_URL + url,
            // called when resource is loaded, assumes we get a group back, this might be bad
            function ( { children } ) {


                if(!children[0]) return 

                const child = children[0];
                resolve(child as THREE.Mesh);

            },
            // called when loading is in progresses
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );
                reject(error);

            }
        );
    })
}