const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to fix Gradle build errors in React Native 0.81+ / Expo 55.
 * It removes brittle manual path resolutions in the 'react {}' block that commonly
 * fail on remote builders (EAS) or due to missing 'hermes-compiler' package.
 */
const withHermesFix = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            let contents = config.modResults.contents;

            console.log("Applying Hermes resolution fix - Removing brittle path overrides");

            const lines = contents.split('\n');
            const updatedLines = lines.map(line => {
                const trimmed = line.trim();
                // Target specifically the problematic property assignments
                if (
                    trimmed.startsWith('reactNativeDir =') ||
                    trimmed.startsWith('hermesCommand =') ||
                    trimmed.startsWith('codegenDir =') ||
                    trimmed.startsWith('cliFile =')
                ) {
                    console.log(`Commenting out brittle line in build.gradle: ${trimmed}`);
                    return `    // ${trimmed} // Removed by withHermesFix`;
                }
                return line;
            });

            config.modResults.contents = updatedLines.join('\n');
        }
        return config;
    });
};

module.exports = withHermesFix;
