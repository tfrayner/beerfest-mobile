// Mock @expo/vector-icons so react-native-paper doesn't warn about
// missing icon libraries in the test environment.
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Component = (props: Record<string, unknown>) =>
    React.createElement(Text, { testID: `icon-${props.name}` });
  Component.displayName = 'MockMaterialCommunityIcons';
  return { default: Component, __esModule: true };
});
