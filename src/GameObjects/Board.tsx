import React, { Component, createRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three';
import * as utils from '../util/GameMaths';
import * as loaders from '../util/ModelLoader';
import { FENLoader, BoardState, ResetQueryTable, convertToFEN } from  '../util/BoardLoader';
import PieceHelper from '../GameObjects/DataStructs/Piece';
import { io } from "socket.io-client";

interface Board_props {

}

interface Board_state {

}

export default class Board extends Component<Board_props, Board_state> {

    // React stuffs
    private container = createRef<HTMLDivElement>();

    // WebGL stuffs
    private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: true });
    private camera: THREE.Camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
    private scene: THREE.Scene = new THREE.Scene();
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private mouseClick: THREE.Vector2 = new THREE.Vector2();
    private selectedPiecePos: THREE.Vector2 | undefined;
    private selectedTile: THREE.Mesh | undefined;
    private isCastingRay: boolean = false;

    // Chess stuffs
    private tileSize: number = 1;
    private darkTone: number = 0x808080;
    private lightTone: number = 0xfafafa;
    private TileUUIDs: Set<String> = new Set();
    private BoardState: BoardState = FENLoader('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    private currentTurn: string = this.BoardState.currentTurn;
    private RecalcState: boolean = false;
    private moveSet: { [key: number] : number[]; } = {};

    // Networking Stuffs
    private socketConnection = io("ws://localhost:8080");

    render() {
        return (
            <div ref={this.container}/>
        );
    }

    componentDidMount() {
        const { camera, scene, renderer, mouse, mouseClick, raycaster, tileSize, darkTone, lightTone, TileUUIDs } = this;
        let { selectedPiecePos, selectedTile, BoardState, RecalcState, isCastingRay, moveSet, currentTurn } = this;

        const init = () => {
            this.initSocket();
            console.clear(); // b/c of hot holding there are old warnings and errors

            Promise.all([
                loaders.ModelLoaderOBJ('/res/tower.obj'),
                loaders.ModelLoaderOBJ('/res/knight.obj'),
                loaders.ModelLoaderOBJ('/res/bishop.obj'),
                loaders.ModelLoaderOBJ('/res/queen.obj'),
                loaders.ModelLoaderOBJ('/res/king.obj'),
                loaders.ModelLoaderOBJ('/res/pawn.obj'),
            ]).then((Meshes: THREE.Mesh[]) => {
                let piece;
                let isBlack;
                const GeneratePiece = (meshIndex: number, i: number, j: number, cp: string) => {
                    isBlack = cp === cp.toUpperCase(); // our board is coded so that uppercase represents black pieces
                    piece = Meshes[meshIndex].clone();
                    if(meshIndex === 1) piece.rotateY(utils.DegToRad(90 * (isBlack ? 1 : -1)));
                    piece.position.set(i, -0.2, j);
                    piece.scale.divide(new THREE.Vector3(5, 5, 5)); // downscales the piece by dimensions of 5
                    // @ts-ignore
                    piece.material = new THREE.MeshPhongMaterial( {
                        color: isBlack ? darkTone : lightTone, 
                        side: THREE.DoubleSide,
                        reflectivity: .5     
                    } );
                    piece.name = cp;
                    piece.castShadow = true; //default is false
                    piece.receiveShadow = false; //default
                    scene.add( piece );
                }
                // Generate all possible pieces
                for(let i = 0; i < 8; i++) {
                    for(let j = 0; j < 8; j++) {
                        const cp = BoardState.map[i][j];
                        switch(cp) {
                            case 'r': 
                            case 'R': 
                                GeneratePiece(0, i, j, cp);
                                break;
                            case 'n': 
                            case 'N': 
                                GeneratePiece(1, i, j, cp);
                                break;
                            case 'b': 
                            case 'B': 
                                GeneratePiece(2, i, j, cp);
                                break;
                            case 'q': 
                            case 'Q': 
                                GeneratePiece(3, i, j, cp);
                                break;
                            case 'k': 
                            case 'K': 
                                GeneratePiece(4, i, j, cp);
                                break;
                            case 'p': 
                            case 'P': 
                                GeneratePiece(5, i, j, cp);
                                break;
                            default: 
                                break;
                        }
                    }
                }
            });


            camera.position.z = -3.5;
            camera.position.y = 5;
            camera.position.x = -3.5;
            camera.rotateX(utils.DegToRad(-60))

            // Create the board
            for(let i = 0; i < 8; i++) {
                for(let j = 0; j < 8; j++) {
                    const tileGeom = new THREE.BoxGeometry( tileSize, tileSize, 0.5 );
                    const material = new THREE.MeshPhongMaterial( {color: ((j + i) % 2) ? lightTone : darkTone, side: THREE.DoubleSide} );
                    const tileMesh = new THREE.Mesh( tileGeom, material );

                    tileMesh.name = "Tile";
                    tileMesh.rotateX(utils.DegToRad(-90));
                    tileMesh.position.set(i * tileSize, -0.5/2, j * tileSize);
                    tileMesh.receiveShadow = true;
                    
                    scene.add(tileMesh);
                    TileUUIDs.add(tileMesh.uuid);
                }
            }

            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(10, 10, 10);
                        //Set up shadow properties for the light
            light.shadow.mapSize.width = 2024; // default
            light.shadow.mapSize.height = 2024; // default
            light.shadow.camera.near = 1; // default
            light.shadow.camera.far = 50; // default
            light.shadow.camera.right = -20;
            light.shadow.camera.left = 20;
            light.shadow.camera.top = -20;
            light.shadow.camera.bottom = 20;
            // light.target.position.set(-5, 0, 0);
            light.castShadow = true; // default false
            scene.add(light);
            scene.add(light.target);

            scene.add( new THREE.AmbientLight( 0x404040 ) );

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setAnimationLoop(updateFunc);

            const container = this.container?.current;
            if(container) {
                container.appendChild(renderer.domElement);
                const controls = new OrbitControls(camera, container);
                controls.target.set(3.5, 0, 3.5);
                controls.update();
            }

            window.addEventListener( 'click', onMouseClick, false );
        }

        function onMouseClick(event: MouseEvent) {
        
            mouseClick.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouseClick.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            isCastingRay = true;
        
        }

        let BOARD_STATE_INDEX = 0;

        const updateFunc = (time: number) => {
            BoardState = this.BoardState;

            for( let i = 0; i < scene.children.length; i++) {
                const child = scene.children[i] as THREE.Mesh;

                if(child.name === "Tile") {
                    const { x, z } = child.position;
                    const isOdd = ((x / tileSize) + (z / tileSize)) % 2;

                    if(!!moveSet[x] && !!~moveSet[x].indexOf(z))
                        // @ts-ignore
                        child.material.color.set( 0xff0000 );
                    // @ts-ignore
                    else if(child.material) // @ts-ignore
                        child.material.color.set( isOdd ? lightTone : darkTone ); // @ts-ignore
                } else if(child.material) {
                    if(child.position.x == selectedPiecePos?.x && child.position.z == selectedPiecePos?.y) {
                        child.position.y = -0.2 + (Math.sin(time / 200)) / 10;
                        child.rotation.y += 1 / 30;
                    } else {
                        child.position.y = -0.35;
                        switch(child.name) {
                            case "n": 
                                child.rotation.y = utils.DegToRad(-90);
                                break;
                            case "N": 
                                child.rotation.y = utils.DegToRad(90);
                                break;
                            default:
                                child.rotation.y = 0;
                                break;
                        }
                    }
                    if(BoardState.queryTable[child.name]) {
                        BOARD_STATE_INDEX = BoardState.queryTable[child.name].index;

                        if(!BoardState.queryTable[child.name].queue[BOARD_STATE_INDEX]) continue;

                        child.position.x = BoardState.queryTable[child.name].queue[BOARD_STATE_INDEX][0];
                        child.position.z = BoardState.queryTable[child.name].queue[BOARD_STATE_INDEX][1];
                        BoardState.queryTable[child.name].index += 1;
                    }
                }
            }

            if(isCastingRay) {
                // update the picking ray with the camera and mouse position
                raycaster.setFromCamera( mouseClick, camera );
    
                // calculate objects intersecting the picking ray
                const isWhite = currentTurn === "w";
                const intersects = raycaster.intersectObjects( scene.children.filter(obj => obj.name === "Tile") );
    
                if(intersects.length === 0) {
                    selectedPiecePos = undefined;
                    moveSet = {};
                } else {
                    for( let i = 0; i < intersects.length; i ++ ) {
                        const intersectionEntity = intersects[i];
                        const { x, z } = intersectionEntity.object.position;
    
                        // first check if we've selected a piece 
                        const selectedBoardTile = BoardState.map[x][z];
                        if(selectedBoardTile !== "" && !PieceHelper.isOpponent(isWhite, selectedBoardTile)) {
                            if(
                                ( isWhite && PieceHelper.isWhite(selectedBoardTile)) ||
                                (!isWhite && PieceHelper.isBlack(selectedBoardTile))
                            ) {
                                selectedPiecePos = new THREE.Vector2(x, z);
                                moveSet = PieceHelper.getMoveSet(selectedPiecePos.x, selectedPiecePos.y, BoardState);
                                break;
                            }
                        } else if(!!selectedPiecePos) {
                            if(!!moveSet[x] && !!~moveSet[x].indexOf(z)) {
                                const pieceToMove = BoardState.map[selectedPiecePos.x][selectedPiecePos.y];

                                // Check if the piece we're moving to is another piece, in which case we want to remove its model
                                if(BoardState.map[x][z] !== "") {
                                    const pieces = scene.children.filter(obj => obj.name !== "Tile");
                                    for(let j = 0; j < pieces.length; j++) {
                                        if(pieces[j].position.x === x && pieces[j].position.z === z) {
                                            scene.remove(pieces[j]);
                                            break;
                                        }
                                    }
                                }

                                BoardState.map[x][z] = pieceToMove;
                                console.log(BoardState.map);
                                BoardState.map[selectedPiecePos.x][selectedPiecePos.y] = "";

                                BoardState = ResetQueryTable(BoardState);

                                this.transmitChange(BoardState);

                                moveSet = {};
                                selectedPiecePos = undefined;
                                currentTurn = isWhite ? 'b' : 'w';
                            }
                            break;
                        }
                    }
                };

                isCastingRay = false;
            }

            renderer.setClearColor( 0xffffff );
            renderer.render(scene, camera);

        }

        init();
    }

    initSocket():void {
        const { socketConnection } = this;

        // handle the event sent with socket.send()
        socketConnection.on("board-state-change", (data: any) => {
            console.log(data);
            this.BoardState = FENLoader(data);
            console.log(this.BoardState);
        });
    }

    transmitChange(BoardState: BoardState):void {
        const { socketConnection } = this;

        socketConnection.emit(
            "board-state-change", 
            convertToFEN(BoardState)
        );
    }

}