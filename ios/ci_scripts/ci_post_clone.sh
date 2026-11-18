#!/bin/zsh
# Xcode Cloud: roda depois de clonar o repositório e ANTES de compilar.
# O projeto é Expo/React Native: a pasta ios/Pods e node_modules não vão no Git, então precisam ser gerados aqui.
# (Sem isto o build falha com "Unable to open base configuration reference file ...Pods-ClubeQuinzeApp.release.xcconfig".)
set -euo pipefail

echo "▶ ci_post_clone: preparando dependências nativas"
export HOMEBREW_NO_AUTO_UPDATE=1
export HOMEBREW_NO_INSTALL_CLEANUP=1
export LANG=en_US.UTF-8

REPO_ROOT="${CI_PRIMARY_REPOSITORY_PATH:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$REPO_ROOT"

# Node e CocoaPods não vêm no runner do Xcode Cloud.
brew install node cocoapods

echo "▶ node $(node -v) / npm $(npm -v) / pod $(pod --version)"

# Dependências JS (o Podfile do Expo lê node_modules).
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

# Pods (gera Pods/Target Support Files/*.xcconfig).
cd ios
pod install

echo "✔ ci_post_clone concluído"
