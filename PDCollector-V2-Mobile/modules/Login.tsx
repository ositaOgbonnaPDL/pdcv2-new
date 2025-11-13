import useFaumally from '@faumally/react';
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Animated, TextInput as RNTextInput, View} from 'react-native';
import {Colors, Headline, Subheading} from 'react-native-paper';
import {primaryDark} from '../shared/colors';
import Box from '../shared/components/Box';
import Button from '../shared/components/Button';
import Notification from '../shared/components/Notification';
import PasswordInput from '../shared/components/PasswordInput';
import Screen from '../shared/components/Screen';
import Spacer from '../shared/components/Spacer';
import TextInput from '../shared/components/TextInput';
import {login} from '../shared/services/authentication';
import authStore from '../shared/stores/auth';
import useSettings, {colorSchemeSelector} from '../shared/stores/settings';
import {Credentials} from '../shared/types';

type Schema = Required<Omit<Credentials, 'token' | 'refreshToken'>>;

type Response = {
  token: string;
  refreshToken: string;
  firstTimeLoggedIn: boolean;
};

export default function Login() {
  const password = createRef<RNTextInput>();
  const colorScheme = useSettings(colorSchemeSelector);
  const opacity = useRef(new Animated.Value(1)).current;

  const isDark = colorScheme === 'dark';

  const {
    set,
    data,
    error,
    errors,
    values,
    submit,
    handlers,
    hasErrors,
    submitted,
    isSubmitting,
  } = useFaumally<Schema, Response>({
    schema: {
      username: {
        required: true,
        // initialValue: 'josh',
      },
      password: {
        required: true,
        // initialValue: 'Password@1',
      },
      rememberMe: {
        initialValue: true,
      },
    },
    onSubmit({rememberMe: _, ...json}) {
      return login(json);
    },
  });

  const [notifySuccess, setNotifySuccess] = useState(submitted);

  const clearErrors = useCallback(() => {
    set({name: 'errors', value: new Map()});
  }, [set]);

  useEffect(() => {
    const submittedSuccessfully = Boolean(submitted && !error);
    setNotifySuccess(submittedSuccessfully);
  }, [submitted, error]);

  const color = isDark ? 'white' : primaryDark;

  return (
    <>
      <Notification
        status="error"
        visible={hasErrors}
        onDismiss={clearErrors}
        message={Array.from(errors.values()).join('\n')}
      />

      <Notification
        status="error"
        visible={Boolean(error)}
        message={error?.message as string}
        onDismiss={() => set({name: 'error', value: undefined})}
      />

      <Notification
        duration={300}
        status="success"
        visible={notifySuccess}
        message="Login successful"
        onDismiss={() => {
          setNotifySuccess(false);
          if (data) authStore.getState().setAuth({...values, ...data});
        }}
      />

      <Screen>
        <Animated.View style={{flex: 1, opacity}}>
          <Spacer gap="20%">
            <Box marginTop="10%">
              <Headline style={{fontWeight: 'bold'}}>Login</Headline>
              <Subheading
                style={{
                  fontWeight: '500',
                  color: isDark ? Colors.white : Colors.grey600,
                }}>
                Please login to continue
              </Subheading>
            </Box>

            <View>
              <Spacer gap={30}>
                <View>
                  {/* <Spacer gap={20}> */}
                  {/* <View> */}
                  <Spacer gap={20}>
                    <TextInput
                      label="Username"
                      returnKeyType="next"
                      returnKeyLabel="next"
                      autoCapitalize="none"
                      value={values.username}
                      textContentType="username"
                      autoCompleteType="username"
                      onChangeText={handlers.username.onChange}
                      onSubmitEditing={() => password.current?.focus()}
                    />

                    <PasswordInput
                      ref={password}
                      label="Password"
                      returnKeyType="done"
                      returnKeyLabel="login"
                      value={values.password}
                      onSubmitEditing={submit}
                      textContentType="password"
                      autoCompleteType="password"
                      onChangeText={handlers.password.onChange}
                    />
                  </Spacer>
                  {/* </View> */}

                  {/* <Box alignSelf="flex-start" alignItems="center">
                      <Checkbox
                        label="Remember me"
                        labelStyle={{color}}
                        value={values.rememberMe}
                        color={isDark ? '#d0d2d6' : primaryDark}
                        iconColor={isDark ? primaryDark : Colors.white}
                        onValueChange={() => {
                          handlers.rememberMe.onChange(!values.rememberMe);
                        }}
                      />
                    </Box> */}
                  {/* </Spacer> */}
                </View>

                <Button onPress={submit} loading={isSubmitting} color={color}>
                  Login to my account
                </Button>
              </Spacer>
            </View>
          </Spacer>
        </Animated.View>
      </Screen>
    </>
  );
}
