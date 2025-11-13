import {useNavigation, useRoute} from '@react-navigation/native';
import {formatDistanceToNow} from 'date-fns';
import {compose, keys, pick} from 'ramda';
import React from 'react';
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {
  Colors,
  Divider,
  Headline,
  Paragraph,
  Subheading,
  useTheme,
} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SharedElement} from 'react-navigation-shared-element';
import {sentenceCase} from 'sentence-case';
import {match} from 'ts-pattern';
import X from '../../../../../assets/svg/sf/xmark.svg';
import Spacer from '../../../../../shared/components/Spacer';
import useSettingsStore, {
  colorSchemeSelector,
} from '../../../../../shared/stores/settings';
import {Project} from '../../../../../shared/types/project';
import {projectTypes} from '../../../../../shared/utils';

const valuesToPick = ['type', 'copyright', 'createdAt', 'feature'];

const displayKeys = compose(keys, pick(valuesToPick));

const styles = StyleSheet.create({
  title: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  card: {
    padding: 20,
    minWidth: '90%',
    shadowRadius: 20,
    borderRadius: 15,
    shadowOpacity: 0.4,
    shadowColor: Colors.grey800,
    shadowOffset: {width: 2, height: 5},
  },
  container: {
    flex: 1,
    paddingVertical: 25,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#4e4e4eab',
  },
  close: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 100,
    backgroundColor: Colors.grey200,
  },
});

export default function Popup() {
  const nav = useNavigation();
  const {colors} = useTheme();
  const {params = {}} = useRoute();
  const colorScheme = useSettingsStore(colorSchemeSelector);

  const {id, name, description, ...rest} = (params as any).project as Project;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      <SafeAreaView style={styles.container}>
        <SharedElement style={{maxHeight: '80%'}} id={`project-${id}`}>
          <View style={[styles.card, {backgroundColor: colors.background}]}>
            <View style={{alignSelf: 'flex-end'}}>
              <TouchableOpacity
                style={styles.close}
                onPress={() => nav.goBack()}>
                <X width={15} height={15} color="#585858" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{padding: 10}}>
              <Spacer gap={10}>
                <View>
                  <Headline style={{fontWeight: '600'}}>{name}</Headline>
                  <Paragraph>{description}</Paragraph>
                </View>

                <Divider />

                <View>
                  <Spacer>
                    {displayKeys(rest).map((k) => {
                      const key = k as keyof Project;
                      const value = (rest as Project)[key];

                      return (
                        <View key={key}>
                          <Subheading style={styles.title}>
                            {sentenceCase(key)}
                          </Subheading>

                          <Paragraph>
                            {match(key)
                              .with('type', () => {
                                return projectTypes[value as Project['type']];
                              })
                              .with('createdAt', () => {
                                return formatDistanceToNow(
                                  new Date(value as string),
                                  {addSuffix: true},
                                );
                              })
                              .otherwise(() => value)}
                          </Paragraph>
                        </View>
                      );
                    })}
                  </Spacer>
                </View>
              </Spacer>
            </ScrollView>
          </View>
        </SharedElement>
      </SafeAreaView>
    </>
  );
}
