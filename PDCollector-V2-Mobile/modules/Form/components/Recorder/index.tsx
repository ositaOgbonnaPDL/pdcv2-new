import {useMachine} from '@xstate/react';
import {AnimatePresence, MotiView} from 'moti';
import {compose, join, split} from 'ramda';
import React, {useRef} from 'react';
import {Platform, View} from 'react-native';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
} from 'react-native-audio-recorder-player';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import RNFS from 'react-native-fs';
import {Caption, IconButton, useTheme} from 'react-native-paper';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import Microphone from '../../../../assets/svg/sf/mic.fill.svg';
import PauseIcon from '../../../../assets/svg/sf/pause.fill.svg';
import PlayIcon from '../../../../assets/svg/sf/play.fill.svg';
import DeleteIcon from '../../../../assets/svg/sf/trash.circle.fill.svg';
import Spacer from '../../../../shared/components/Spacer';
import {File} from '../../../../shared/types';
import machine from './machine';

const audioSet = {
  AVNumberOfChannelsKeyIOS: 2,
  AVFormatIDKeyIOS: AVEncodingOption.aac,
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
};

const type = 'mp4';

const toName = compose(join('_'), split(' '));

// const permissions = Platform.select({
//   ios: PERMISSIONS.IOS.MICROPHONE,
//   android: PERMISSIONS.ANDROID.RECORD_AUDIO,
// }) as any;

const audioPermission = Platform.select({
  ios: [PERMISSIONS.IOS.MEDIA_LIBRARY, PERMISSIONS.IOS.MICROPHONE],
  android: [
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  ],
}) as any[];

const icon_btn = {size: 20, color: 'white'};

export default function Recorder({
  uri,
  name,
  duration,
  onChange,
}: {
  uri: string;
  name: string;
  duration: number;
  onChange(rec: Partial<File> | null): void;
}) {
  const {colors} = useTheme();
  const recorder = useRef(new AudioRecorderPlayer()).current;
  const fileName = useRef(`${toName(name)}-${Date.now()}`).current;

  const [current, send] = useMachine(machine, {
    actions: {
      pause: () => {
        recorder.pausePlayer();
      },
      play: () => {
        recorder.startPlayer(uri);
      },
      empty: () => {
        onChange(null);

        if (uri) {
          RNFS.exists(uri).then((exists) => {
            if (exists) RNFS.unlink(uri);
          });
        }
      },
      onDone: async () => {
        const result = await recorder.stopRecorder();
        onChange({type, fileName, uri: result});
      },
    },
    services: {
      recorder: () => async (callback) => {
        const uri = `${fileName}.${type}`;

        // should give extra dir name in android. Won't grant permission to the first level of dir.
        const path = Platform.select({
          ios: uri,
          android: `${RNFS.DocumentDirectoryPath}/${uri}`,
        });

        try {
          const statuses = await requestMultiple(audioPermission);

          // const hasBlocked = A.some<Permission>((perm) => {
          //   const stat = statuses[perm];
          //   return stat === RESULTS.BLOCKED || stat === RESULTS.DENIED;
          // })

          // const hasUnavailable = A.some<Permission>((perm) => {
          //   const stat = statuses[perm];
          //   return stat === RESULTS.UNAVAILABLE;
          // });

          // if (hasUnavailable(audioPermission)) {
          //   return callback('PERMISSION_UNAVAILABLE');
          // }

          // if (hasBlocked(audioPermission)) {
          //   return callback('PERMISSION_BLOCKED');
          // }
        } catch (error) {
          return callback('ERROR');
        }

        await recorder.startRecorder(path, audioSet);

        recorder.addRecordBackListener(({current_position}: any) => {
          if (Number(current_position) >= Number(duration)) {
            return callback('Record.stop');
          }

          callback({type: 'TIME_UPDATE', time: current_position});
        });

        return () => {
          recorder.removeRecordBackListener();
        };
      },
      player: () => async (callback) => {
        await recorder.stopPlayer();

        await recorder.startPlayer(uri);

        recorder.addPlayBackListener(({duration, current_position}: any) => {
          // for some reason not wrapping the numbers makes
          // current_position greater than duration when it should not.
          if (Number(current_position) >= Number(duration)) {
            return callback('STOP');
          }

          callback({type: 'TIME_UPDATE', time: current_position});
        });

        return () => {
          recorder.removePlayBackListener();
        };
      },
    },
  });

  const {error, currentTime} = current.context;

  return (
    <View>
      <Spacer>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <AnimatedCircularProgress
            size={45}
            width={6}
            lineCap="round"
            tintColor="white"
            backgroundColor={colors.primaryDark}
            fill={(currentTime / duration) * 100}>
            {() => (
              <>
                {current.matches('empty') && (
                  <IconButton
                    size={20}
                    onPress={() => send('Record.start')}
                    icon={({size, color}) => (
                      <Microphone width={size} height={size} color={color} />
                    )}
                  />
                )}

                {current.matches('recording') && (
                  <Microphone width={20} height={20} color="white" />
                )}

                {current.matches({recorded: 'playing'}) && (
                  <IconButton
                    {...icon_btn}
                    onPress={() => send('PAUSE')}
                    icon={({size, color}) => (
                      <PauseIcon width={size} height={size} color={color} />
                    )}
                  />
                )}

                {current.matches({recorded: 'paused'}) && (
                  <IconButton
                    {...icon_btn}
                    // create visual balance given that play icons don't
                    // fit visually in the center when placed in circles
                    style={{marginStart: 9}}
                    onPress={() => send('PLAY')}
                    icon={({size, color}) => (
                      <PlayIcon width={size} height={size} color={color} />
                    )}
                  />
                )}
              </>
            )}
          </AnimatedCircularProgress>

          <AnimatePresence>
            {current.matches('recorded') && (
              <MotiView
                from={{scale: 0.5, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                exit={{scale: 0.5, opacity: 0}}>
                <IconButton
                  size={35}
                  color="white"
                  onPress={() => send('EMPTY')}
                  icon={({size, color}) => (
                    <DeleteIcon width={size} height={size} color={color} />
                  )}
                />
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {error && (
          <View>
            <Caption>{error.message}</Caption>
          </View>
        )}
      </Spacer>
    </View>
  );
}
