import useFaumally from '@faumally/react';
import React, {createRef, useCallback, useEffect} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import {Headline, useTheme} from 'react-native-paper';
import Button from '../shared/components/Button';
import Notification from '../shared/components/Notification';
import PasswordInput from '../shared/components/PasswordInput';
import Screen from '../shared/components/Screen';
import Spacer from '../shared/components/Spacer';
import {put} from '../shared/http';
import authStore from '../shared/stores/auth';
import useSettings, {colorSchemeSelector} from '../shared/stores/settings';

const MSG = 'Password change successful, login to continue';

export default function PasswordChange() {
  const {primaryDark} = useTheme().colors;
  const password = createRef<RNTextInput>();
  const colorScheme = useSettings(colorSchemeSelector);

  const isDark = colorScheme === 'dark';

  const color = isDark ? 'white' : primaryDark;

  const {
    set,
    error,
    values,
    submit,
    errors,
    handlers,
    submitted,
    isSubmitting,
  } = useFaumally<{oldPassword: string; newPassword: string}, void>({
    schema: {
      oldPassword: {required: true},
      newPassword: {required: true},
    },
    validate: ({newPassword, oldPassword}) => {
      if (newPassword === oldPassword) {
        return {
          oldPassword: '',
          newPassword: 'Cannot be the same as the old password',
        };
      }
    },
    onSubmit: async ({oldPassword, newPassword}) => {
      try {
        const data = {oldPassword, newPassword};
        const res = await put('/users/change-password')(data);
        return res;
      } catch (e) {
        const err = (e as any)?.response?.data;
        throw err ?? e;
      }
    },
  });

  const clearError = useCallback(() => {
    set({name: 'error', value: undefined});
  }, [set]);

  useEffect(() => {
    if (submitted && !error) {
      Alert.alert('Password change', MSG, [
        {
          text: 'OK',
          onPress: () => {
            authStore.getState().logout();
          },
        },
      ]);
    }
  }, [error, submitted]);

  return (
    <>
      <Notification
        status="error"
        onDismiss={clearError}
        visible={Boolean(error)}
        message={error?.message as string}
      />

      <Screen>
        <Spacer gap={40}>
          <Headline>Change Password</Headline>

          <View>
            <Spacer gap={20}>
              <KeyboardAvoidingView>
                <PasswordInput
                  label="Old Password"
                  returnKeyType="next"
                  returnKeyLabel="next"
                  autoCompleteType="off"
                  value={values.oldPassword}
                  textContentType="password"
                  error={errors.has('oldPassword')}
                  errorMessage={errors.get('oldPassword')}
                  onChangeText={handlers.oldPassword.onChange}
                  onSubmitEditing={() => password.current?.focus()}
                />
              </KeyboardAvoidingView>

              <KeyboardAvoidingView>
                <PasswordInput
                  ref={password}
                  label="New Password"
                  returnKeyType="done"
                  returnKeyLabel="done"
                  autoCompleteType="off"
                  onSubmitEditing={submit}
                  value={values.newPassword}
                  textContentType="newPassword"
                  error={errors.has('newPassword')}
                  errorMessage={errors.get('newPassword')}
                  onChangeText={handlers.newPassword.onChange}
                />
              </KeyboardAvoidingView>
            </Spacer>
          </View>

          <Button color={color} loading={isSubmitting} onPress={submit}>
            Change Password
          </Button>
        </Spacer>
      </Screen>
    </>
  );
}
