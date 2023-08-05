#!/bin/bash

#BIN_FILE=
#BIN_FILE_DEBUG=
#ARCH=
#VERSION=
#DEB_TPL_DIR=
#OUT_FILE=

if [ -z "$BIN_FILE" -o ! -f "$BIN_FILE" ]; then
  echo 'E! Env var BIN_FILE must refer to production binary file' >&2
  exit 1
fi
if [ -z "$BIN_FILE_DEBUG" ]; then
  echo 'I: No BIN_FILE_DEBUG, skip debug binary' >&2
elif [ ! -f "$BIN_FILE_DEBUG" ]; then
  echo 'E! Env var BIN_FILE_DEBUG must refer to debug binary, or empty/unset to skip' >&2
  exit 1
fi
if [ -z "$ARCH" ]; then
  echo 'E! Env var ARCH was not set' >&2
  exit 1
fi
if [ -z "$VERSION" ]; then
  echo 'E! Env var VERSION was not set' >&2
  exit 1
fi
if [ -z "$DEB_TPL_DIR" -o ! -d "$DEB_TPL_DIR" ]; then
  echo 'E! Env var DEB_TPL_DIR must refer to debug binary file' >&2
  exit 1
fi
if [ -z "$OUT_FILE" ]; then
  echo 'E! Env var OUT_FILE must set output file path/name' >&2
  exit 1
fi

echo Building deb package
echo "  BIN_FILE:       $BIN_FILE" >&2
echo "  BIN_FILE_DEBUG: $BIN_FILE_DEBUG" >&2
echo "  ARCH:           $ARCH" >&2
echo "  VERSION:        $VERSION" >&2
echo "  DEB_TPL_DIR:    $DEB_TPL_DIR" >&2
echo "  OUT_FILE:       $OUT_FILE" >&2

WORKDIR="$( mktemp -d )" || {
  echo 'E! Could not make temp work dir' >&2
  exit 1
}

function _cleanup_exit() {
  local CODE=$?
  if [ -n "$1" ]; then
    echo "$1" >&2
  fi
  rm -fr "$WORKDIR"
  exit $CODE
}

function _tpl_replace() {
  local CONTENT
  read -rs -d '' CONTENT
  CONTENT="${CONTENT//'{{ARCH}}'/"$ARCH"}"
  CONTENT="${CONTENT//'{{VERSION}}'/"$VERSION"}"
  echo "$CONTENT"
  return 0
}

function _tpl_file() {
  local IN_FILE="$1"
  local OUT_FILE="${IN_FILE%.in}"
  _tpl_replace < "$IN_FILE" > "$OUT_FILE" \
    || _cleanup_exit "E! Failed to process template file '$IN_FILE'"
  rm "$IN_FILE" \
    || _cleanup_exit "E! Cannot delete template file '$IN_FILE'"
  return 0
}
function _tpl_files() {
  local FILE
  while read -rs -d $'\0' FILE ; do
    _tpl_file "$FILE"
  done
  return 0
}

function _prepare_dir() {
  cp -r "$DEB_TPL_DIR"/* "$WORKDIR" \
    || _cleanup_exit "E! Cannot copy template directory"

  find "$WORKDIR" -type f -name '*.in' -print0 | _tpl_files \
    || _cleanup_exit "E! Cannot process template files"

  find "$WORKDIR" -type f -name .gitkeep -delete \
    || _cleanup_exit "E! Cannot clean files in template dir"

  cp "$BIN_FILE" "$WORKDIR/usr/bin/sple-desktop" \
    || _cleanup_exit "E! Cannot copy '$BIN_FILE' to temp dir"

  if [ -n "$BIN_FILE_DEBUG" ]; then
    cp "$BIN_FILE_DEBUG" "$WORKDIR/usr/bin/sple-desktop-debug" \
      || _cleanup_exit "E! Cannot copy '$BIN_FILE_DEBUG' to temp dir"
  fi

  return 0
}

_prepare_dir
dpkg-deb --build --root-owner-group "$WORKDIR" "$OUT_FILE" \
  || _cleanup_exit "E! Failed to build deb package"
_cleanup_exit
