#!/bin/sh
# Installs the pinned lychee binary into the directory given as $1. CI and the
# Sandcastle image both use it, so `pnpm links:check` runs the same lychee in
# both. Linux only; on macOS, `brew install lychee`.
set -eu

version=0.24.2
dest=$1

case "$(uname -m)" in
x86_64) target=x86_64-unknown-linux-gnu ;;
aarch64 | arm64) target=aarch64-unknown-linux-gnu ;;
*)
	echo "install-lychee: unsupported architecture $(uname -m)" >&2
	exit 1
	;;
esac

mkdir -p "$dest"
curl -fsSL "https://github.com/lycheeverse/lychee/releases/download/lychee-v$version/lychee-$target.tar.gz" |
	tar -xz -C "$dest" --strip-components=1 "lychee-$target/lychee"
