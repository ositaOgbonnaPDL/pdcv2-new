// Everything concerning `react-reuqey goes here e.g queryKeys and query client`

import {QueryClient} from 'react-query';

export const PROJECTS = 'projects';

export const ASSIGNED = 'assigned';

export const TRACKS = 'tracks';

export const queryClient = new QueryClient();
