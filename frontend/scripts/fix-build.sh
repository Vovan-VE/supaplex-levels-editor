#!/bin/bash

if [ -n "$1" ]; then
  echo "CD to $1" >&2
  cd "$1" || {
    echo 'E! cannot cd' >&2
    exit 1
  }
fi

echo -n 'Patching build in ' >&2
pwd >&2

for SUBDIR in ./static/media ./static/js ; do
  [[ -d "$SUBDIR" ]] || {
    echo "E! No $SUBDIR subdirectory" >&2
    exit 1
  }
done

# Fix SVG dupes.
# When same SVG is imported in JS and referred in CSS:
#
# ```ts
# import src from './foo.svg';
# ```
#
# ```css
# .foo {
#   background-image: url('./foo.svg');
# }
#
# then the SVG fill be duplicated in build:
#
# ```
# static/
#   media/
#     foo.<hash>.svg
#     foo.<hash><hash2>.svg
# ```
#
# where `hash` is 20 hex and `hash2` is 12 hex.
#
# So here we searching dupes with long hash and replacing them with regular
# hash.

function _replaceInJs() {
  local PRE='      replace js'
  [[ $# = 3 ]] || {
    echo "$PRE: expected 3 arguments" >&2
    return 2
  }
  local FILE="$1"
  local FIND_WHAT="$2"
  local REPLACE_WITH="$3"

  local CONTENT
  read -r -d '' CONTENT < "$FILE"
  # `read` returns 1 on EOF
  # redirection returns 1 on read error
  if [ -z "$CONTENT" ]; then
    echo "$PRE: cannot read $FILE" >&2
    return 1
  fi

  local NEW_CONTENT="${CONTENT//"$FIND_WHAT"/"$REPLACE_WITH"}"
  if [ "$CONTENT" = "$NEW_CONTENT" ]; then
    echo "$PRE: nothing replaced" >&2
    return 0
  fi

  echo -n "$NEW_CONTENT" > "$FILE.new" || {
    echo "$PRE: cannot write $FILE.new" >&2
    return 1
  }

  mv "$FILE" "$FILE~" || {
    echo "$PRE: cannot rename $FILE => $FILE~" >&2
    return 1
  }
  mv "$FILE.new" "$FILE" || {
    echo "$PRE: cannot rename $FILE.new => $FILE" >&2
    return 1
  }
  rm "$FILE~" || {
    echo "$PRE: cannot remove $FILE~" >&2
    return 1
  }
  echo "$PRE: replaced" >&2
  return 0
}

# searching SVG files with long 32 hash
find static/media -type f -name '*.????????????????????????????????.svg' -print0 \
  | while read -rs -d $'\0' LONG_FILE ; do
      echo "> $LONG_FILE" >&2
      SHORT_FILE="${LONG_FILE:0: -16}${LONG_FILE: -4}"
      echo -n "  $SHORT_FILE => " >&2
      [[ -f "$SHORT_FILE" ]] || {
        echo 'not exist, skip' >&2
        continue
      }

      echo 'found, check' >&2
      cmp -s "$LONG_FILE" "$SHORT_FILE" || {
        echo '    not same content, skip' >&2
        continue
      }

      echo '    same content, replacing' >&2
      # searching all JS files
      find static/js -type f -name '*.js' -print0 \
        | while read -rs -d $'\0' JS_FILE ; do
            echo "    > $JS_FILE" >&2
            # replace ...."static/media/foo.HASHLONG.svg"...
            # with        "static/media/foo.HASH.svg"    ...
            #             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
            # add places to keep length to keep *.map correct
            # so here are 12 spaces: 32-20
            _replaceInJs "$JS_FILE" "\"$LONG_FILE\"" "\"$SHORT_FILE\"            " || exit $?
          done \
        || exit $?

      echo '    delete long file' >&2
      rm "$LONG_FILE" || {
        echo '    cannot delete long file' >&2
        exit 1
      }
    done \
  || exit $?
