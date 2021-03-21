interface QueryTable {
    [key: string] : {
        index: number;
        queue: number[][];
    }
}

export interface BoardState {
    map: string[][];
    queryTable: QueryTable;
    currentTurn: string;
}

export const FENLoader = (FEN: string): BoardState => {
    const map: string[][] = [];
    const queryTable: QueryTable = {}; 

    const FENSplit = FEN.split(' ');
    const positions = FENSplit[0];
    const currentTurn = FENSplit[1];
    const rows = positions.split('/');

    for(let i = 0; i < rows.length; i++) {
        const row = rows[i];
        map.push([]);
        for(let j = 0; j < row.length; j++) {
            if(!!Number(row[j])) {
                for(let k = 0; k < Number(row[j]); k++) 
                    map[i].push("");

                continue;
            }
            map[i].push(row[j]);
            if(!queryTable[row[j]]) 
                queryTable[row[j]] = {
                    index: 0,
                    queue: [],
                }
            queryTable[row[j]].queue.push([i, j]);
        }
    };

    return { map, queryTable, currentTurn };
}

export const ResetQueryTable = (BoardState: BoardState): BoardState => {
    BoardState.queryTable = {};
    const rows = BoardState.map;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < row.length; j++) {
            if (!BoardState.queryTable[row[j]])
                BoardState.queryTable[row[j]] = {
                    index: 0,
                    queue: [],
                }
            BoardState.queryTable[row[j]].queue.push([i, j]);
        }
    }
    return BoardState;
}