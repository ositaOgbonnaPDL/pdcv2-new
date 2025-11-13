import React, {createContext, useContext} from 'react';
import {UseQueryResult} from 'react-query';
import useEnabledQuery from '../../../shared/hooks/useEnabledQuery';
import {get} from '../../../shared/http';
import {ASSIGNED} from '../../../shared/query';

const getAssigned = async (): Promise<any[]> => {
  const {data} = await get('/mobile/data');
  return data;
};

export const Context = createContext<UseQueryResult<any[], unknown>>({} as any);

export const useAssigned = () => useContext(Context);

const AssignedProvider = ({children}: any) => {
  const query = useEnabledQuery([ASSIGNED], getAssigned, {
    initialData: [],
    refetchInterval: 10000,
  });

  return <Context.Provider value={query}>{children}</Context.Provider>;
};

export default AssignedProvider;
