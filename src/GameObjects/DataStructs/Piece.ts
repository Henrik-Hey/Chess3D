import { BoardState } from '../../util/BoardLoader';

interface MoveSet {
    [key: number] : number[];
};

export default class PieceHelper {
    
    static getMoveSet(x: number, y: number, BoardState: BoardState): MoveSet {
        const { map } = BoardState;
        const piece = map[x][y];
        switch(piece) {
            case 'r': 
            case 'R': 
                return PieceHelper.getRookMoves(x, y, BoardState);
            case 'n': 
            case 'N': 
                return PieceHelper.getKnightMoves(x, y, BoardState);
            case 'b': 
            case 'B': 
                return PieceHelper.getBishopMoves(x, y, BoardState);
            case 'q': 
            case 'Q': 
                return PieceHelper.getQueenMoves(x, y, BoardState);
            case 'k': 
            case 'K': 
                return PieceHelper.getKingMoves(x, y, BoardState);
            case 'p': 
            case 'P': 
                return PieceHelper.getPawnMoves(x, y, BoardState);
            default: 
                return {} as MoveSet;
        }
    }

    static isBlack(pieceID: string): boolean {
        return pieceID === pieceID.toUpperCase();
    }

    static isWhite(pieceID: string): boolean {
        return pieceID === pieceID.toLowerCase();
    }

    static isOpponent(isWhite: boolean, pieceID: string): boolean {
        if(isWhite) 
            return PieceHelper.isBlack(pieceID);
        return PieceHelper.isWhite(pieceID);
    }

    static combineMoveSets(...MoveSets: MoveSet[]): MoveSet {
        const newMoveSet: MoveSet = {};

        MoveSets.forEach(MoveSet => {
            for(let key in MoveSet) {
                if(!newMoveSet[key])
                    newMoveSet[key] = [];
                newMoveSet[key].push(...MoveSet[key]);
            }
        });

        return newMoveSet;
    }

    static addMoveIfValid(x: number, y: number, xOffset: number, yOffset: number, BoardState: BoardState): MoveSet {
        const { map } = BoardState;
        const isWhite = PieceHelper.isWhite(map[x][y]);
        const moveSet: MoveSet = {};

        const newX = x + xOffset;
        const newY = y + yOffset;
        const newPos = map[newX]?.[newY];

        if(newPos === undefined) return moveSet;

        if((newPos + "").length === 0) {
            if(!moveSet[newX])
                moveSet[newX] = [];
            moveSet[newX].push(newY);
        } else if(PieceHelper.isOpponent(isWhite, newPos)) {
            if(!moveSet[newX])
                moveSet[newX] = [];
            moveSet[newX].push(newY);
        }

        return moveSet;
    }

    static getLinearMoveSet(x: number, y: number, xIncrement: number, yIncrement: number, BoardState: BoardState, cap: number = 7): MoveSet {
        const { map } = BoardState;
        const isWhite = PieceHelper.isWhite(map[x][y]);
        const moveSet: MoveSet = {};
        let newPos, newX, newY;
        for(let i = 1; i < cap + 1; i++) {
            newX = x + (xIncrement * i);
            newY = y + (yIncrement * i);
            newPos = map[newX]?.[newY];
            if(newPos === undefined) break;
            else if((newPos + "").length === 0) {
                if(!moveSet[newX])
                    moveSet[newX] = [];
                moveSet[newX].push(newY);
            } else if(PieceHelper.isOpponent(isWhite, newPos)) {
                if(!moveSet[newX])
                    moveSet[newX] = [];
                moveSet[newX].push(newY);
                break;
            } else {
                break;
            }
        };
        return moveSet;
    }

    static getPawnMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        const { map } = BoardState;

        const isWhite = PieceHelper.isWhite(map[x][y]);
        const increment = isWhite ? 1 : -1;
        
        const moveSet: MoveSet = {};

        const xPlus1 = map[x+increment][y];
        if((xPlus1 + "").length === 0) {
            if(!moveSet[x+increment])
                moveSet[x+increment] = [];
            moveSet[x+increment].push(y);
        }

        const yPlus1 = map[x+increment]?.[y+1];
        if(yPlus1 && yPlus1 !== "" && PieceHelper.isOpponent(isWhite, yPlus1)) {
            if(!moveSet[x+increment])
                moveSet[x+increment] = [];
            moveSet[x+increment].push(y+1);
        }

        const yMinus1 = map[x+increment]?.[y-1];
        if(yMinus1 && yMinus1 !== "" && PieceHelper.isOpponent(isWhite, yMinus1)) {
            if(!moveSet[x+increment])
                moveSet[x+increment] = [];
            moveSet[x+increment].push(y-1);
        }

        return moveSet;
    }

    static getKnightMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        return PieceHelper.combineMoveSets(
            PieceHelper.addMoveIfValid(x, y, 2, 1, BoardState),
            PieceHelper.addMoveIfValid(x, y, 2, -1, BoardState),
            PieceHelper.addMoveIfValid(x, y, -2, 1, BoardState),
            PieceHelper.addMoveIfValid(x, y, -2, -1, BoardState),
            PieceHelper.addMoveIfValid(x, y, 1, 2, BoardState),
            PieceHelper.addMoveIfValid(x, y, 1, -2, BoardState),
            PieceHelper.addMoveIfValid(x, y, -1, 2, BoardState),
            PieceHelper.addMoveIfValid(x, y, -1, -2, BoardState),
        );
    }

    static getRookMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        return PieceHelper.combineMoveSets(
            PieceHelper.getLinearMoveSet(x, y, 1, 0, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 0, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, 0, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 0, -1, BoardState),
        );
    }

    static getBishopMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        return PieceHelper.combineMoveSets(
            PieceHelper.getLinearMoveSet(x, y, 1, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 1, -1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, -1, BoardState),
        );
    }

    static getKingMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        return PieceHelper.combineMoveSets(
            PieceHelper.getLinearMoveSet(x, y, 1, 0, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, 0, 1, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, -1, 0, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, 0, -1, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, 1, 1, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, -1, 1, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, 1, -1, BoardState, 1),
            PieceHelper.getLinearMoveSet(x, y, -1, -1, BoardState, 1),
        );
    }
    
    static getQueenMoves(x: number, y: number, BoardState: BoardState): MoveSet {
        return PieceHelper.combineMoveSets(
            PieceHelper.getLinearMoveSet(x, y, 1, 0, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 0, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, 0, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 0, -1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 1, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, 1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, 1, -1, BoardState),
            PieceHelper.getLinearMoveSet(x, y, -1, -1, BoardState),
        );
    }

}