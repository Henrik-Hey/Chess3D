import React from  'react';
import styled from 'styled-components'
import { useBoardContext } from '../providers/BoardStateProvider'

const GUI = () => {
    const { isLoading, boardState } = useBoardContext();
    const currentTurn = boardState?.currentTurn === 'w' ? 'White' : 'Black';

    return (
        <InfoTile>
            <InfoRow>Loading State: {isLoading ? 'Loading...' : 'Done'}</InfoRow>
            <InfoRow>Current Turn: {currentTurn}</InfoRow>
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