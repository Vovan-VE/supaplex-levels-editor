export const moveAfter = <K, V>(
  map: ReadonlyMap<K, V>,
  moveKey: K,
  afterKey: K,
): ReadonlyMap<K, V> => {
  if (!map.has(moveKey) || !map.has(afterKey) || moveKey === afterKey) {
    return map;
  }

  let entries = [...map];
  let moveIndex = -1;
  let afterIndex = -1;
  for (let i = 0, left = 2; i < entries.length && left > 0; i++) {
    switch (entries[i][0]) {
      case moveKey:
        moveIndex = i;
        left--;
        break;
      case afterKey:
        afterIndex = i;
        left--;
        break;
    }
  }

  const [move] = entries.splice(moveIndex, 1);
  if (moveIndex > afterIndex + 1) {
    // -- -- after -- -- -- move -- -- --
    // ^^^^^^^^^^^ ^^^^^^^^ ^^^^ ^^^^^^^^
    //                    <=>
    entries.splice(afterIndex + 1, 0, move);
  } else if (moveIndex < afterIndex) {
    // -- -- move -- -- -- after -- --
    // ^^^^^ ^^^^ ^^^^^^^^^^^^^^ ^^^^^
    //          <=>
    entries.splice(afterIndex, 0, move);
  } else {
    return map;
  }

  return new Map(entries);
};
