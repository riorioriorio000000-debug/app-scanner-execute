import React from 'react';
import { Platform, ScrollView, ScrollViewProps, KeyboardAvoidingView } from 'react-native';

interface Props extends ScrollViewProps {
  children: React.ReactNode;
}

export function KeyboardAwareScrollViewCompat({ children, style, ...rest }: Props) {
  if (Platform.OS === 'android') {
    return (
      <ScrollView style={style} keyboardShouldPersistTaps="handled" {...rest}>
        {children}
      </ScrollView>
    );
  }
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView style={style} keyboardShouldPersistTaps="handled" {...rest}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
