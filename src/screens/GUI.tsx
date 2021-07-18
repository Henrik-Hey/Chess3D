import React from  'react';
import styled from 'styled-components'
import { useBoardContext } from '../providers/BoardStateProvider'

const GUI = () => {
    const { isLoading } = useBoardContext();

    return (
        <InfoTile>
            {isLoading ? 'Loading...' : 'Done.'}
        </InfoTile>
    ) 
}

const InfoTile = styled.div`
    position: absolute;
    padding: 9px;
    top: 0px;
    left: 0px;
    font-size: 20px;
`

export default GUI;