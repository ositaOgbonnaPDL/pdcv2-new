import {useActor} from '@xstate/react';
import {groupBy} from 'ramda';
import React, {useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {
  Button,
  Caption,
  Colors,
  IconButton,
  Title,
  useTheme,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import CheckCloud from '../../../assets/svg/sf/checkmark.icloud.fill.svg';
import ExclamationMark from '../../../assets/svg/sf/exclamationmark.circle.fill.svg';
import XMark from '../../../assets/svg/sf/xmark.svg';
import {useTaskManager} from '../../../contexts/TaskManager';
import {Asset} from '../../../contexts/TaskManager/types';
import {mapToArray} from '../../utils';
import Screen from '../Screen';
import Spacer from '../Spacer';
import AssetView from './Asset';

const groupFn = groupBy<Asset>((file) => {
  return file.type === 'mp4' ? 'Recordings' : 'Images';
});

const styles = StyleSheet.create({
  alert: {
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    margin: 10,
    zIndex: 1000,
    position: 'relative',
    // backgroundColor: Colors.grey500,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  notification: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default function AssetsViewer({
  id,
  style,
  onClose,
  dismissOnSubmit = true,
}: {
  id: string;
  onClose(): void;
  dismissOnSubmit?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors} = useTheme();
  const {getTask} = useTaskManager();

  const task = useMemo(() => getTask(id), [getTask, id]);

  const [current, sendTask] = useActor(task);

  const {assetUploader} = current.context;

  const [{context}, send] = useActor(assetUploader);

  const {assets, errors} = context;

  const errored = current.matches('error');
  const submitted = current.matches('submitted');
  const submitting = current.matches({submitting: 'data'});

  const _assets = mapToArray(assets);

  const group = useMemo(() => {
    return groupFn(_assets);
  }, [_assets]);

  const sections = useMemo(() => {
    return Object.keys(group).map((key) => {
      return {title: key, data: group[key]};
    });
  }, [group]);

  const label = (
    <Title style={{color: 'white'}}>
      {errored ? 'An error occured' : submitted ? 'Submitted' : 'Submitting'}
    </Title>
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (submitted && dismissOnSubmit) {
      timeout = setTimeout(onClose, 700);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [submitted, dismissOnSubmit, onClose]);

  return (
    <Screen style={[{padding: 0}, style]}>
      <IconButton
        size={17}
        onPress={onClose}
        style={styles.close}
        icon={({size, color}) => (
          <XMark width={size} height={size} color={color} />
        )}
      />

      <SectionList
        style={{flex: 1}}
        sections={sections}
        keyExtractor={({id}) => id}
        contentContainerStyle={{flex: 1, padding: 20}}
        ItemSeparatorComponent={() => <View style={{height: 10}} />}
        SectionSeparatorComponent={() => <View style={{height: 20}} />}
        renderSectionHeader={({section: {title}}) => <Title>{title}</Title>}
        renderItem={({item: {id}}) => {
          const asset = assets.get(id);
          // const process = childProcesses.get(id);

          return (
            <AssetView
              // actor={process as any}
              asset={asset as Asset}
              error={errors.get(id)}
              onRetry={() => send({id, type: 'RETRY'})}
            />
          );
        }}
      />

      <View style={styles.alert}>
        <Spacer gap={15} horizontal>
          <ExclamationMark width={30} height={30} color={Colors.red600} />
          <Caption style={{flex: 1}}>
            Submission will commence after files are done uploading
          </Caption>
        </Spacer>
      </View>

      {(errored || submitting || submitted) && (
        <View style={styles.overlay}>
          <SafeAreaView>
            <View
              style={[styles.notification, {backgroundColor: colors.surface}]}>
              <Spacer>
                {submitting ? (
                  <ActivityIndicator size="large" color="white" />
                ) : null}

                {submitted ? (
                  <CheckCloud width={35} height={35} color="white" />
                ) : null}

                {errored ? (
                  <View>
                    {label}
                    <Button
                      mode="outlined"
                      style={{marginTop: 10}}
                      onPress={() => sendTask({type: 'RETRY'})}>
                      Retry
                    </Button>
                  </View>
                ) : (
                  label
                )}
              </Spacer>
            </View>
          </SafeAreaView>
        </View>
      )}
    </Screen>
  );
}
