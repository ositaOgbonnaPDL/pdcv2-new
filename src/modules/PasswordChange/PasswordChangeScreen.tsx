/**
 * Password Change Screen
 * For first-time login password change
 */

import React, {createRef, useEffect} from 'react';
import {Alert, KeyboardAvoidingView, TextInput as RNTextInput, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {
  Button,
  Notification,
  PasswordInput,
  Screen,
  Spacer,
} from '../../components';
import {put} from '../../api/httpClient';
import useAuthStore from '../../stores/authStore';
import useSettingsStore, {colorSchemeSelector} from '../../stores/settingsStore';
import {primaryDark} from '../../theme';

const MSG = 'Password change successful, login to continue';

type PasswordChangeFormData = {
  oldPassword: string;
  newPassword: string;
};

export default function PasswordChangeScreen() {
  const {colors} = useTheme();
  const passwordRef = createRef<RNTextInput>();
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const logout = useAuthStore((state) => state.logout);

  const isDark = colorScheme === 'dark';
  const color = isDark ? 'white' : primaryDark;

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
    watch,
  } = useForm<PasswordChangeFormData>({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
    },
  });

  const [apiError, setApiError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const oldPassword = watch('oldPassword');
  const newPassword = watch('newPassword');

  // Validate that passwords are different
  useEffect(() => {
    if (newPassword && oldPassword && newPassword === oldPassword) {
      setError('newPassword', {
        type: 'manual',
        message: 'Cannot be the same as the old password',
      });
    }
  }, [newPassword, oldPassword, setError]);

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      setApiError(null);

      // Validate passwords are different
      if (data.newPassword === data.oldPassword) {
        setError('newPassword', {
          type: 'manual',
          message: 'Cannot be the same as the old password',
        });
        return;
      }

      await put('/users/change-password')({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setSuccess(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error.message || 'Password change failed';
      setApiError(errorMessage);
    }
  };

  useEffect(() => {
    if (success) {
      Alert.alert('Password change', MSG, [
        {
          text: 'OK',
          onPress: () => {
            logout();
          },
        },
      ]);
    }
  }, [success, logout]);

  return (
    <>
      <Notification
        status="error"
        onDismiss={() => setApiError(null)}
        visible={Boolean(apiError)}
        message={apiError || ''}
      />

      <Screen>
        <Spacer gap={40}>
          <Text variant="headlineMedium" style={{color: color}}>
            Change Password
          </Text>

          <View>
            <Spacer gap={20}>
              <KeyboardAvoidingView>
                <Controller
                  control={control}
                  name="oldPassword"
                  rules={{required: 'Old password is required'}}
                  render={({field: {onChange, onBlur, value}}) => (
                    <PasswordInput
                      label="Old Password"
                      returnKeyType="next"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={Boolean(errors.oldPassword)}
                      errorMessage={errors.oldPassword?.message}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  )}
                />
              </KeyboardAvoidingView>

              <KeyboardAvoidingView>
                <Controller
                  control={control}
                  name="newPassword"
                  rules={{required: 'New password is required'}}
                  render={({field: {onChange, onBlur, value}}) => (
                    <PasswordInput
                      ref={passwordRef}
                      label="New Password"
                      returnKeyType="done"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={Boolean(errors.newPassword)}
                      errorMessage={errors.newPassword?.message}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
              </KeyboardAvoidingView>
            </Spacer>
          </View>

          <Button
            mode="contained"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}>
            <Text style={{color: isDark ? primaryDark : 'white'}}>
              Change Password
            </Text>
          </Button>
        </Spacer>
      </Screen>
    </>
  );
}
