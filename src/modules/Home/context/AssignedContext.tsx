import React, {createContext, useContext, ReactNode} from 'react';
import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {httpClient} from '../../../api';
import {AssignedData} from '../../../types';
import {QUERY_KEYS} from '../../../utils';
import {useAuthStore} from '../../../stores';

const getAssigned = async (): Promise<AssignedData[]> => {
  const response = await httpClient.get('/mobile/data');
  return response.data;
};

export const AssignedContext = createContext<
  UseQueryResult<AssignedData[], unknown>
>({} as any);

export const useAssigned = () => useContext(AssignedContext);

type AssignedProviderProps = {
  children: ReactNode;
};

export const AssignedProvider = ({children}: AssignedProviderProps) => {
  const isAuthenticated = useAuthStore((state) => !!state.token);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ASSIGNED],
    queryFn: getAssigned,
    enabled: isAuthenticated,
    initialData: [],
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });

  return (
    <AssignedContext.Provider value={query}>
      {children}
    </AssignedContext.Provider>
  );
};
