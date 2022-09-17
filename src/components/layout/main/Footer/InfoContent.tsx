import { FC } from "react";
import { APP_NAME, APP_VERSION } from "configs";
import cl from "./InfoContent.module.scss";

export const InfoContent: FC = () => (
  <div className={cl.root}>
    <h1>
      <code>{APP_NAME}</code> <span>v{APP_VERSION}</span>
    </h1>
    <p>
      <code>{APP_NAME}</code> is Supaplex levels editor in browser.
    </p>

    <h2>How it works</h2>
    <p>
      First you either open existing file from your device, or create new one
      from scratch. After that the file is stored in browser memory. You can
      open or create several file at the same time.
    </p>
    <p>Files in browser memory:</p>
    <ul>
      <li>
        are <b>not</b> related and are <b>not</b> linked to source file you
        loaded into browser, because browsers work so;
      </li>
      <li>
        will <b>not</b> be sent to anywhere since everything is operating
        locally right in your browser;
      </li>
      <li>
        <b>could</b> be remembered in browser when you close, suspense or leave
        this web page (this should work fine in most of modern browsers unless
        private mode).
      </li>
    </ul>
    <p>So:</p>
    <ul>
      <li>
        To save edited file from browser memory back to device you should
        "download" file from browser with appropriate button on the page.
      </li>
      <li>
        You can drop unneeded files from memory with appropriate button on the
        page.
      </li>
      <li>
        <b>DO NOT</b> rely to the fact, that files are remembering in browser's
        memory. <b>DO</b> save <b>BACKUPS</b>. Browser can clean storage.
      </li>
      <li>
        This page uses <code>indexedDB</code> and <code>localStorage</code>{" "}
        (which both are similar to Cookies in terms of privacy) for better user
        experience.
      </li>
    </ul>

    <h3>UI</h3>
    <p>User Interface, I hope, should be intuitive enough.</p>
    <ol>
      <li>
        Top row is to manipulate with Files:
        <ol>
          <li>"Create new file..." button;</li>
          <li>"Open files..." button;</li>
          <li>Scrollable list of opened files;</li>
          <li>"Save file from memory" button;</li>
          <li>"Rename file" button;</li>
          <li>
            "Remove file from memory" button will cause the browser to forget
            everything about the file and remove all its data from memory.
          </li>
        </ol>
      </li>
      <li>
        When a File is Active, the second row is to manipulate with Levels in
        the File:
        <ol>
          <li>Levels select;</li>
          <li>Scrollable list of opened levels;</li>
          <li>
            "Insert new level" button will insert new empty level in current
            level offset, so all the levels starting from current will be
            shifted forward;
          </li>
          <li>
            "Append new level" button will add new empty level in the end after
            the last level in file;
          </li>
          <li>
            "Delete level" button will delete the level from file without "undo"
            possibility, so be careful;
          </li>
          <li>
            "Close level" button just cause the level to gone from opened levels
            list without any data loss.
          </li>
        </ol>
      </li>
      <li>
        All the rest area but page footer is related to current level only.
      </li>
    </ol>
  </div>
);
