#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$APP_DIR/.." && pwd)"

export JAVA_HOME="$ROOT_DIR/.tools/jdk-17.0.19+10/Contents/Home"
export MAVEN_USER_HOME="$APP_DIR/car-sales/.m2"
export PATH="$JAVA_HOME/bin:$PATH"

cd "$APP_DIR/car-sales"
exec ./mvnw test

