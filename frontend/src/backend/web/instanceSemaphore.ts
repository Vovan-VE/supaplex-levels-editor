import { createEvent, createStore } from "effector";
import { generateKey } from "utils/strings";

// REFACT: the following effector stuff still present in non-web build
// FIXME: hot reload in dev cause it to switch to SECONDARY

const enum InstanceMode {
  INIT,
  SECONDARY,
  MAIN,
}

const setMode = createEvent<InstanceMode>();
const $mode = createStore(InstanceMode.INIT).on(setMode, (_, p) => p);
export const $instanceIsReadOnly = $mode.map(
  (mode) => mode !== InstanceMode.MAIN,
);
export const $displayReadOnly = $mode.map(
  (mode) => mode === InstanceMode.SECONDARY,
);

//  ==========================================

// Imagine several people in a room. Everybody can speak only to all, everybody
// can hear only everybody.
//
// They are here choose the MAIN one. They are agree to someone will become MAIN
// whoever he is.
//
// 1. They all start to listening.
// 2. A silent pause.
// 3. Random one attempts: "I will be MAIN".
// 4. Everybody silently agreed, but restated the timeout to attempt again.
// 5. That one speaker becomes MAIN and says "{id} is main".
// 6. Everybody else cancel attempt and remember the MAIN id.
//
// Now if somebody else will say "I will be MAIN":
// *  If the actual MAIN will say "{id} is main".
//    1. New one cancels attempt and remember who is MAIN
//    2. All the rest are know that the MAIN is still alive.
// *  Otherwise everybody restarting attempt.

// 1. set listener
//    - on message "{id} is main":
//      - remember MAIN id, cancel attempt
//    - on message "I will be MAIN":
//      - if MAIN is me:
//        - send "{id} is main"
//      - else
//        - restart attempt
//          // If there are another MAIN still, I will receive "{id} is main"
//          // and so will cancel attempt.
//          // Otherwise my attempt will eiter fire or will be later cancelled.
// 2. restart attempt

// A very short delay may cause a wrong decision (the timeout IS triggered)
// before the message is delivered and response message is delivered back.

export const init = () => {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  const bc = new BroadcastChannel("instanceSemaphore.1");

  const id = generateKey();
  const DEBUG: boolean = false;
  const _log =
    process.env.NODE_ENV === "development" && DEBUG
      ? (...args: any) => console.log("[SEM]", Date.now(), id, ...args)
      : null;
  _log?.("Created");
  const ATTEMPT_TIMEOUT_MIN = 500;
  const ATTEMPT_TIMEOUT_MAX = 1000;
  const randomAttemptDelay = () =>
    Math.floor(
      Math.random() * (ATTEMPT_TIMEOUT_MAX - ATTEMPT_TIMEOUT_MIN) +
        ATTEMPT_TIMEOUT_MIN,
    );
  const I_WILL_BE_MAIN = "IWillBeMain.1";
  const I_AM_MAIN = "IAmMain.1";

  interface _Msg {
    readonly msg: string;
    readonly from: string;
  }

  const postMsg = (msg: _Msg) => bc.postMessage(msg);
  const isMyMsg = (v: any): v is _Msg =>
    v !== null &&
    typeof v === "object" &&
    v.hasOwnProperty("msg") &&
    v.hasOwnProperty("from") &&
    typeof v.msg === "string" &&
    typeof v.from === "string";

  class Attempt {
    readonly #action;
    #T: ReturnType<typeof setTimeout> | null = null;

    constructor(action: () => void) {
      this.#action = action;
    }

    cancel() {
      if (this.#T) {
        clearTimeout(this.#T);
      }
    }

    restart() {
      this.cancel();
      this.#T = setTimeout(this.#action, randomAttemptDelay());
    }
  }

  const Me = (() => {
    let isMain = false;
    // let whoIsMain: string | null = null;

    // Here is no way neither for MAIN, nor for Secondary to revert into initial
    // state. Once it acquired one of sides, it stays there unless physically go.
    // When MAIN just gone, others will keep being secondaries. It is intended to
    // keep them so in this version. If then new noob will arrive, it will become
    // MAIN.

    return {
      isMain: () => isMain,
      // isSecondary: () => whoIsMain !== null,
      becameMain: () => {
        isMain = true;
        _log?.("became MAIN");
        setMode(InstanceMode.MAIN);
      },
      becameSecondary: (mainId: string) => {
        isMain = false;
        // whoIsMain = mainId;
        _log?.("became Secondary in front of", mainId);
        setMode(InstanceMode.SECONDARY);
      },
    };
  })();
  const declareMe = () => {
    _log?.("declaring myself as MAIN");
    postMsg({ msg: I_AM_MAIN, from: id });
  };
  const tryDeclareMain = new Attempt(() => {
    Me.becameMain();
    declareMe();
  });
  const tryBecomeMain = new Attempt(() => {
    _log?.("attempting to be MAIN");
    postMsg({ msg: I_WILL_BE_MAIN, from: id });
    tryDeclareMain.restart();
  });
  bc.onmessage = (e) => {
    const { data } = e;
    if (isMyMsg(data)) {
      switch (data.msg) {
        case I_AM_MAIN:
          _log?.(">> another is MAIN");
          Me.becameSecondary(data.from);
          tryBecomeMain.cancel();
          tryDeclareMain.cancel();
          break;

        case I_WILL_BE_MAIN:
          _log?.(">> another is trying to become MAIN");
          if (Me.isMain()) {
            declareMe();
          } else {
            tryBecomeMain.restart();
          }
          break;

        default:
          console.warn("Unknown message", data);
      }
    }
  };
  tryBecomeMain.restart();
};
