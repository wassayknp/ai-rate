const {
  withDangerousMod,
  withAppBuildGradle,
} = require('@expo/config-plugins');
const fs = require('fs-extra'); // ✅ Import entire module
const path = require('path');

module.exports = (config) => {
  // 1. ✅ Create libs.versions.toml
  config = withDangerousMod(config, [
    'android',
    async (innerConfig) => {
      const androidDir = path.join(innerConfig.modRequest.platformProjectRoot);
      const gradleDir = path.join(androidDir, 'gradle');
      const tomlPath = path.join(gradleDir, 'libs.versions.toml');

      // ✅ Use fs.ensureDir (not ensureDirectory)
      await fs.ensureDir(gradleDir);

      // ✅ Use fs.writeFile
      await fs.writeFile(
        tomlPath,
        `
[versions]
kotlin = "1.9.22"
agp = "8.3.0"

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-gradle-plugin = { id = "org.jetbrains.kotlin:kotlin-gradle-plugin", version.ref = "kotlin" }
        `.trim()
      );

      return innerConfig;
    },
  ]);

  // 2. ✅ Fix Gradle syntax
  config = withAppBuildGradle(config, (innerConfig) => {
    if (innerConfig.modResults.language === 'groovy') {
      innerConfig.modResults.contents = innerConfig.modResults.contents
        .replace(/url\s+"([^"]+)"/g, 'url = "$1"')
        .replace(/name\s+"([^"]+)"/g, 'name = "$1"')
        .replace(/displayName\s+"([^"]+)"/g, 'displayName = "$1"')
        .replace(/ext\.kotlinVersion\s*=\s*['"].*['"]/g, '')
        .replace(/kotlinVersion\s*=\s*['"].*['"]/g, '');
    }
    return innerConfig;
  });

  return config;
};