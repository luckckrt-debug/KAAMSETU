const { withSettingsGradle } = require('expo/config-plugins');

function withRn74SettingsPatch(config) {
  return withSettingsGradle(config, (modConfig) => {
    // Replace the unparameterized require.resolve on line 7
    const target = '["node", "--print", "require.resolve(\'@react-native/gradle-plugin/package.json\')"]';
    const replacement = '["node", "--print", "require.resolve(\'@react-native/gradle-plugin/package.json\', { paths: [require.resolve(\'react-native/package.json\')] })"]';
    
    if (modConfig.modResults.contents.includes(target)) {
      modConfig.modResults.contents = modConfig.modResults.contents.replace(target, replacement);
    }
    return modConfig;
  });
}

module.exports = withRn74SettingsPatch;
