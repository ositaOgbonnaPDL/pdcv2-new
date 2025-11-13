/**
 * Assigned Data Context
 * Provides assigned data with automatic polling every 10 seconds
 */

import React, {createContext, useContext} from 'react';
import {UseQueryResult} from '@tanstack/react-query';
import useEnabledQuery from '../hooks/useEnabledQuery';
import {get} from '../api/httpClient';
import {ASSIGNED} from '../api/queryClient';
import {AssignedData} from '../types/project';

const getAssigned = async (): Promise<AssignedData[]> => {
  const data = await get<AssignedData[]>('/mobile/data');
  return data;
};

export const AssignedContext = createContext<
  UseQueryResult<AssignedData[], unknown>
>({} as any);

export const useAssigned = () => useContext(AssignedContext);

type AssignedProviderProps = {
  children: React.ReactNode;
};

const AssignedProvider = ({children}: AssignedProviderProps) => {
  const query = useEnabledQuery({
    queryKey: [ASSIGNED],
    queryFn: getAssigned,
    initialData: [],
    refetchInterval: 10000, // Poll every 10 seconds
  });

  return (
    <AssignedContext.Provider value={query}>
      {children}
    </AssignedContext.Provider>
  );
};

export default AssignedProvider;
