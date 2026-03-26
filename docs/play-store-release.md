# Google Play release checklist

## Current Android state

- Package name: `br.academias.wemovelt`
- Min SDK: `24`
- Target SDK: `36`
- Build format: Android App Bundle (`.aab`)

## 1. Create an upload key

Example command:

```powershell
keytool -genkeypair -v -keystore android\release-upload-key.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

## 2. Configure signing

Copy the template:

```powershell
Copy-Item android\keystore.properties.example android\keystore.properties
```

Fill:

```properties
storeFile=release-upload-key.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=upload
keyPassword=YOUR_KEY_PASSWORD
```

You can also skip the file and provide the same values through environment variables:

- `ANDROID_KEYSTORE_PATH`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

## 3. Set the release version

Default values:

- `versionCode = 1`
- `versionName = 1.0.0`

Override when needed:

```powershell
$env:WEMOVELT_VERSION_CODE="2"
$env:WEMOVELT_VERSION_NAME="1.0.1"
```

## 4. Build the release bundle

```powershell
npm run android:bundle:release
```

The script auto-detects:

- `JAVA_HOME` from Android Studio when possible
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` or `%LOCALAPPDATA%\Android\Sdk`

It also refuses to build a Play release without an upload key configured, so you do not accidentally generate an unsigned bundle.

Output:

```text
android\app\build\outputs\bundle\release\app-release.aab
```

## 5. Upload to Play Console

Recommended first track:

1. Internal testing
2. Closed testing
3. Production

## 6. Store listing items you still need outside the codebase

- This repo now includes `public/privacy-policy.html`; after publishing the site, use `https://<your-domain>/privacy-policy.html`
- This repo now includes `public/account-deletion.html`; after publishing the site, use `https://<your-domain>/account-deletion.html`
- Public privacy policy URL
- Public account deletion URL
- App icon and feature graphic for Play listing
- Short description and full description
- Screenshots for phone and optional tablet
- Data safety answers
- Content rating questionnaire
- App access explanation if login is required
- Permission declarations for location and camera, if requested during review
