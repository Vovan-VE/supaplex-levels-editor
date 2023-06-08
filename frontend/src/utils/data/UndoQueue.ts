export class UndoQueue<T> {
  #maxLength: number;
  #prev: readonly T[];
  #current: T;
  #next: readonly T[];

  constructor(current: T, maxLength = 100) {
    this.#maxLength = maxLength;
    this.#prev = [];
    this.#current = current;
    this.#next = [];
  }

  get current() {
    return this.#current;
  }

  done(next: T) {
    if (next === this.#current) {
      return this;
    }
    const L = this.#maxLength;
    const copy = new UndoQueue(next, L);
    copy.#prev = [
      ...(this.#prev.length < L
        ? this.#prev
        : this.#prev.slice(this.#prev.length - L + 1)),
      this.#current,
    ];
    return copy;
  }

  get canUndo() {
    return this.#prev.length > 0;
  }

  undo() {
    if (!this.canUndo) {
      return this;
    }
    const copy = new UndoQueue(
      this.#prev[this.#prev.length - 1],
      this.#maxLength,
    );
    copy.#prev = this.#prev.slice(0, this.#prev.length - 1);
    copy.#next = [this.#current, ...this.#next];
    return copy;
  }

  get canRedo() {
    return this.#next.length > 0;
  }

  redo() {
    if (!this.canRedo) {
      return this;
    }
    const copy = new UndoQueue(this.#next[0], this.#maxLength);
    copy.#prev = [...this.#prev, this.#current];
    copy.#next = this.#next.slice(1);
    return copy;
  }
}
