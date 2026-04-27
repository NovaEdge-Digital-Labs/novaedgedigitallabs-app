const { withAppBuildGradle } = require('@expo/config-plugins');

const withHermesFix = (config) => {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            let contents = config.modResults.contents;

            console.log("Applying Hermes resolution fix to app/build.gradle");

            // Define patterns to comment out
            const patterns = [
                /reactNativeDir\s+=\s+new\s+File\(/,
                /hermesCommand\s+=\s+new\s+File\(/,
                /codegenDir\s+=\s+new\s+File\(/,
                /cliFile\s+=\s+new\s+File\(/
            ];

            // Process line by line to ensure correct commenting
            const lines = contents.split('\n');
            const updatedLines = lines.map(line => {
                if (patterns.some(pattern => pattern.test(line)) && !line.trim().startsWith('//')) {
                    console.log(`Commenting out line: ${line.trim()}`);
                    return `    // ${line.trim()} // Removed by withHermesFix plugin`;
                }
                return line;
            });

            config.modResults.contents = updatedLines.join('\n');
        }
        return config;
    });
};

module.exports = withHermesFix;
