#!/bin/bash
# ─── ساخت APK اندروید اپ «ضد هک» (WebView آفلاین) ───
# پیش‌نیاز: JDK (java)، ECJ (کامپایلر جاوا)، Android build-tools + platform android.jar
set -e

SDK_BT="${SDK_BT:-/home/z/android-build/sdk/android-14}"          # build-tools 34
PLATFORM="${PLATFORM:-/home/z/android-build/sdk/android-34/android.jar}"
ECJ="${ECJ:-/home/z/android-build/ecj.jar}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"                           # android/
APP="$ROOT/app"
OUT="$ROOT/build"
KEYSTORE="$ROOT/scripts/release.keystore"
VERSION="${VERSION:-1.4.0}"

rm -rf "$OUT"
mkdir -p "$OUT/classes" "$OUT/dex" "$OUT/compiled-res" "$OUT/gen"

echo "── ۱) کامپایل جاوا با ECJ ──"
java -jar "$ECJ" -source 8 -target 8 -encoding UTF-8 \
  -bootclasspath "$PLATFORM" \
  -d "$OUT/classes" \
  $(find "$APP/src/main/java" -name "*.java") 2>&1 | grep -E "ERROR|problems" || true

echo "── ۲) تبدیل به DEX با d8 ──"
java -cp "$SDK_BT/lib/d8.jar" com.android.tools.r8.D8 \
  --lib "$PLATFORM" --release --output "$OUT/dex" \
  $(find "$OUT/classes" -name "*.class")

echo "── ۳) کامپایل و لینک منابع با aapt2 ──"
find "$APP/src/main/res" -type f | while read -r f; do
  "$SDK_BT/aapt2" compile --dir "$APP/src/main/res" -o "$OUT/compiled-res" >/dev/null 2>&1 || true
  break
done
"$SDK_BT/aapt2" compile --dir "$APP/src/main/res" -o "$OUT/compiled-res.zip"
"$SDK_BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$PLATFORM" \
  --manifest "$APP/src/main/AndroidManifest.xml" \
  --auto-add-overlay \
  "$OUT/compiled-res.zip"

echo "── ۴) افزودن classes.dex و assets ──"
cd "$OUT"
cp "$OUT/dex/classes.dex" "$OUT/classes.dex"
zip -q -j "$OUT/base.apk" "$OUT/classes.dex"
if [ -d "$APP/src/main/assets" ]; then
  zip -q -r "$OUT/base.apk" assets -x ".*" || true
  (cd "$APP/src/main" && zip -q -r "$OUT/base.apk" assets)
fi

echo "── ۵) zipalign ──"
"$SDK_BT/zipalign" -f 4 "$OUT/base.apk" "$OUT/aligned.apk"

echo "── ۶) ساخت keystore و امضا ──"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias antihack \
    -keyalg RSA -keysize 2048 -validity 10950 \
    -storepass antihack1404 -keypass antihack1404 \
    -dname "CN=Anti Hack, OU=AbbasTech, O=AbbasTech, L=Tehran, C=IR" >/dev/null 2>&1
fi
"$SDK_BT/apksigner" sign --ks "$KEYSTORE" --ks-pass pass:antihack1404 \
  --key-pass pass:antihack1404 --out "$OUT/ZHack-v$VERSION-com.z.hack.apk" "$OUT/aligned.apk"

"$SDK_BT/apksigner" verify --print-certs "$OUT/ZHack-v$VERSION-com.z.hack.apk" | head -5
ls -la "$OUT/ZHack-v$VERSION-com.z.hack.apk"
echo "✓ APK ساخته شد: $OUT/ZHack-v$VERSION-com.z.hack.apk (package: com.z.hack)"
