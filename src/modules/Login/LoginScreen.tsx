/**
 * Login Screen
 * User authentication with username and password
 */

import React, {createRef, useState, useEffect, useRef} from 'react';
import {Animated, TextInput as RNTextInput, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {
  Box,
  Button,
  Notification,
  PasswordInput,
  Screen,
  Spacer,
  TextInput,
} from '../../components';
import {login} from '../../services/authService';
import useAuthStore from '../../stores/authStore';
import useSettingsStore, {colorSchemeSelector} from '../../stores/settingsStore';
import {primaryDark} from '../../theme';

type LoginFormData = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginScreen() {
  const passwordRef = createRef<RNTextInput>();
  const colorScheme = useSettingsStore(colorSchemeSelector);
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  const setAuth = useAuthStore((state) => state.setAuth);

  const isDark = colorScheme === 'dark';
  const color = isDark ? 'white' : primaryDark;

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: true,
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      const {username, password, rememberMe} = data;
      const response = await login({username, password});

      setLoginData({...data, ...response});
      setShowSuccess(true);
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleSuccessDismiss = () => {
    setShowSuccess(false);
    if (loginData) {
      setAuth(loginData);
    }
  };

  return (
    <>
      <Notification
        status="error"
        visible={Boolean(apiError)}
        message={apiError || ''}
        onDismiss={() => setApiError(null)}
      />

      <Notification
        duration={300}
        status="success"
        visible={showSuccess}
        message="Login successful"
        onDismiss={handleSuccessDismiss}
      />

      <Screen>
        <Animated.View style={{flex: 1, opacity}}>
          <Spacer gap="20%">
            <Box marginTop="10%">
              <Text
                variant="headlineMedium"
                style={{fontWeight: 'bold', color: color}}>
                Login
              </Text>
              <Text
                variant="bodyLarge"
                style={{
                  fontWeight: '500',
                  color: isDark ? '#fff' : '#666',
                  marginTop: 8,
                }}>
                Please login to continue
              </Text>
            </Box>

            <View>
              <Spacer gap={30}>
                <View>
                  <Spacer gap={20}>
                    <Controller
                      control={control}
                      name="username"
                      rules={{required: 'Username is required'}}
                      render={({field: {onChange, onBlur, value}}) => (
                        <TextInput
                          label="Username"
                          returnKeyType="next"
                          autoCapitalize="none"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={Boolean(errors.username)}
                          errorMessage={errors.username?.message}
                          onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="password"
                      rules={{required: 'Password is required'}}
                      render={({field: {onChange, onBlur, value}}) => (
                        <PasswordInput
                          ref={passwordRef}
                          label="Password"
                          returnKeyType="done"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          error={Boolean(errors.password)}
                          errorMessage={errors.password?.message}
                          onSubmitEditing={handleSubmit(onSubmit)}
                        />
                      )}
                    />
                  </Spacer>
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  disabled={isSubmitting}>
                  <Text style={{color: isDark ? primaryDark : 'white'}}>
                    Login to my account
                  </Text>
                </Button>
              </Spacer>
            </View>
          </Spacer>
        </Animated.View>
      </Screen>
    </>
  );
}
