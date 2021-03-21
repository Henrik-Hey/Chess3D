import * as THREE from 'three';

import Piece from './Piece';

interface Tile_props {
    position: THREE.Vector2;
    scale?: number;
    piece?: Piece;
}

export default class Tile {
    static SIZE: number = 1;

    private position: THREE.Vector2;
    private scale: number = 1;
    private piece?: Piece;

    constructor(props: Tile_props) {
        this.position = props.position;

        if(props.scale) 
            this.scale = props.scale;

        if(props.piece) 
            this.piece = props.piece;
    }

    getPieceIfExists(): Piece | undefined {
        return this.piece;
    } 

    getPosition(): THREE.Vector2 {
        return this.position;
    }

    getGridPosition(): THREE.Vector2 {
        const { x, y } = this.position;
        return new THREE.Vector2(
            x * this.scale, 
            y * this.scale
        );
    }
}