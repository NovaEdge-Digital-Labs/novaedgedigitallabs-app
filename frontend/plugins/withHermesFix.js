const { withAppBuildGradle } = require('@expo/config-plugins');

const withHermesFix = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const contents = config.modResults.contents;

            // Target the line that fails due to missing hermes-compiler package
            const searchString = /hermesCommand = new File\(\["node", "--print", "require\.resolve\('hermes-compiler\/package\.json', \{ paths: \[require\.resolve\('react-native\/package\.json'\)\] \}\)"\].execute\(null, rootDir\)\.text\.trim\(\)\)\.getParentFile\(\)\.getAbsolutePath\(\) \+ "\/hermesc\/%OS-BIN%\/hermesc"/;
            const replacementString = 'hermesCommand = new File(reactNativeDir, "sdks/hermesc/%OS-BIN%/hermesc").getAbsolutePath()';

            if (contents.includes("hermes-compiler/package.json")) {
                console.log("Applying Hermes resolution fix to app/build.gradle");
                config.modResults.contents = contents.replace(searchString, replacementString);
            }
        }
        return config;
    });
};

module.exports = withHermesFix;
