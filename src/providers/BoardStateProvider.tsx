import React, { Dispatch, SetStateAction, useContext, useState } from 'react';

interface BoardStateContextInterface {
    isLoading?: boolean;
    setIsLoading?: Dispatch<SetStateAction<boolean>>
}

interface BoardStateProviderProps {
    children: React.ReactChildren | React.ReactNode;
}

const BoardStateContext =  React.createContext({} as BoardStateContextInterface)

const BoardStateProvider = (props: BoardStateProviderProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const value: BoardStateContextInterface = { isLoading, setIsLoading };
    return (
        <BoardStateContext.Provider value={value}>
            {props.children}
        </BoardStateContext.Provider>
    )
}

const useBoardContext = () => {
    const context = useContext(BoardStateContext);
    if(!context)   
        throw new Error('useBoardContext cannot be used outside of a BoardStateProvider')
    return context;
}

export { BoardStateProvider, useBoardContext, BoardStateContext };