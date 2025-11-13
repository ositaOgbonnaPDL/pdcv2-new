import {NetInfoState, useNetInfo} from '@react-native-community/netinfo';
import React, {createContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {Colors, Text} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Wifi from '../assets/svg/sf/wifi.exclamationmark.svg';
import Spacer from '../shared/components/Spacer';

export const Context = createContext<NetInfoState | undefined | null>(null);

function NetworkState({children}: {children: any}) {
  const state = useNetInfo();

  return (
    <Context.Provider value={state}>
      <View style={{flex: 1}}>
        {children}
        {state.isConnected !== null && !state.isConnected && (
          <SafeAreaView>
            <View style={styles.networkState}>
              <Spacer horizontal>
                <Wifi width={20} height={20} color="white" />
                <Text style={styles.label}>You're offline</Text>
              </Spacer>
            </View>
          </SafeAreaView>
        )}
      </View>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  networkState: {
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: Colors.grey800,
  },
  label: {
    color: Colors.white,
  },
});

export default NetworkState;
