import prettyBytes from 'pretty-bytes';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableHighlightProps,
  View,
} from 'react-native';
import Image from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {Colors, Text} from 'react-native-paper';
import CloudUpload from '../../../assets/svg/sf/camera.svg';
import Photograph from '../../../assets/svg/sf/icloud.and.arrow.up.svg';
import Spacer from '../../../shared/components/Spacer';
import Touchable from '../../../shared/components/Touchable';
import useSettings from '../../../shared/stores/settings';
import {File} from '../../../shared/types';
import {ImageSource} from '../../../shared/types/project';
import {
  FILE_SIZE_LIMIT,
  placeholder,
  prettySizeLimit,
} from '../../../shared/utils';

import {
  Permission,
  PERMISSIONS,
  RESULTS,
  request,
  requestMultiple,
} from 'react-native-permissions';

type ImageView = {
  value: File;
  source: ImageSource;
  onChange(image: File): void;
};

const IconButton = ({
  icon,
  style,
  size = 20,
  color = 'white',
  ...props
}: TouchableHighlightProps & {
  size?: number;
  color?: string;
  icon(props: {size: number; color: string}): ReactElement;
}) => {
  const _style = {padding: 10, borderRadius: 100};

  return (
    <Touchable {...props}>
      <View style={[_style, style]}>{icon({size, color})}</View>
    </Touchable>
  );
};

const pickerOptions: ImageLibraryOptions = {quality: 0.9, mediaType: 'photo'};

function ImageView({value, source, onChange}: ImageView) {
  const {uri, fileName} = value ?? {};
  const quality = useSettings(({media}) => media.quality);
  const canSave = useSettings(({media}) => media.canSave);

  const [stat, setStat] = useState<RNFS.StatResult>();

  const fileSize = parseFloat(stat?.size ?? '0');

  const isAboveLimit = fileSize > FILE_SIZE_LIMIT;

  const hasURI = uri && uri.trim() !== '' ? true : false;

  const prettySize = useMemo(() => prettyBytes(fileSize), [fileSize]);

  const handler = useCallback(
    ({uri, type, fileName, base64}: ImagePickerResponse) => {
      if (uri) {
        /**
         * We need to massage this uri a bit based on platform to make it work.
         * Essentially, it just boils down to stripping file:// from the uri on iOS.
         */
        let _uri = Platform.select({
          android: uri,
          ios: uri.replace('file://', ''),
        });

        // Get file name from uri if file name is not available.
        // This is most likely to happen on ios.
        const name = !fileName ? _uri?.split('/').pop() : fileName;

        // @ts-ignore
        onChange({uri, type, fileName: name});
      }
    },
    [onChange],
  );

  const openLibrary = useCallback(async () => {
    launchImageLibrary(pickerOptions, handler);
  }, [handler]);

  const openCamera = useCallback(async () => {
    // if (Platform.OS === 'android') {
    //   const statuses = await requestMultiple([
    //     PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    //     PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
    //   ]);

    //   const readStatus = statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
    //   const writeStatus = statuses[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE];

    //   if (
    //     (writeStatus !== RESULTS.GRANTED && writeStatus !== RESULTS.LIMITED) ||
    //     (readStatus !== RESULTS.GRANTED && readStatus !== RESULTS.LIMITED)
    //   ) {
    //     return;
    //   }

    //   console.log('permission:android', statuses);
    // }

    // if (Platform.OS === 'ios') {
    //   const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

    //   if (status !== RESULTS.GRANTED && status !== RESULTS.LIMITED) {
    //     return;
    //   }

    //   console.log('permission:ios', status);
    // }

    launchCamera(
      {
        ...pickerOptions,
        quality,
        // includeBase64: true,
        saveToPhotos: canSave,
      },
      handler,
    );
  }, [handler, canSave, quality]);

  useEffect(() => {
    if (uri) {
      RNFS.exists(uri).then((exists) => {
        if (exists) RNFS.stat(uri).then(setStat);
      });
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      <View style={styles.image}>
        <Image
          source={{uri: hasURI ? uri : placeholder}}
          style={[StyleSheet.absoluteFillObject, {backgroundColor: '#ccc'}]}
        />

        <LinearGradient
          style={styles.details}
          colors={['transparent', 'transparent', '#333']}>
          <Spacer horizontal>
            <Text numberOfLines={1} style={styles.name}>
              {fileName}
            </Text>

            <View style={styles.buttons}>
              <Spacer horizontal>
                {source === ImageSource.any && (
                  <IconButton
                    color="black"
                    onPress={openLibrary}
                    style={styles.iconButton}
                    icon={({size, color}) => (
                      <Photograph width={size} height={size} color={color} />
                    )}
                  />
                )}

                <View>
                  <IconButton
                    color="black"
                    onPress={openCamera}
                    style={styles.iconButton}
                    icon={({size, color}) => (
                      <CloudUpload width={size} height={size} color={color} />
                    )}
                  />
                </View>
              </Spacer>
            </View>
          </Spacer>
        </LinearGradient>

        {hasURI && isAboveLimit && (
          <Text style={styles.warning}>
            File size {prettySize}, Maximum allowed size {prettySizeLimit}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    height: 200,
    width: '100%',
    justifyContent: 'flex-end',
  },
  details: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  buttons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'white',
  },
  hidden: {
    overflow: 'hidden',
  },
  name: {
    flex: 1,
    fontSize: 17,
    color: 'white',
    fontWeight: 'bold',
  },
  warning: {
    marginTop: 10,
    color: Colors.amber500,
  },
});

export default ImageView;
