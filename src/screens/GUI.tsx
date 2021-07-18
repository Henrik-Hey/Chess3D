import React from  'react';
import styled from 'styled-components'
import { useBoardContext } from '../providers/BoardStateProvider'

const GUI = () => {
    const { isLoading, boardState } = useBoardContext();

    console.log("" + (new Test("Hello world!")), boardState);

    return (
        <InfoTile>
            <InfoRow>{isLoading ? 'Loading...' : 'Done'}</InfoRow>
            <InfoRow>{boardState?.currentTurn === 'w' ? 'White' : 'Black'}</InfoRow>
        </InfoTile>
    ) 
}

interface InfoRowProps {
    color?: string;
}

const InfoRow = styled.p<InfoRowProps>`
    color: ${({ color }) => color ? color : 'black'};
`

const InfoTile = styled.div`
    position: absolute;
    padding: 9px;
    top: 9px;
    left: 9px;
    font-size: 0.75em;
    background-color: rgba(0,0,0,0.125);
    border: 2px solid black;
    border-radius: 9px;
`

export default GUI;

class Test {
    value: string;

    constructor(string: string) {
        this.value = string;
    }

    valueOf() {
        console.log('valueOf')
        return undefined;
    }

    toString() {
        console.log('toString');
        return "value: ";
    }
}

// {} + "hi" == NaN