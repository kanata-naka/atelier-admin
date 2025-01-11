import React, { ReactNode } from "react";
import { css } from "@emotion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "react-bootstrap";
import { signOut } from "@/api/firebase";
import { useSelector } from "@/hooks";
import { GlobalNavigationLinkItem } from "@/types";

function Sidebar({ id }: { id: string }) {
  return (
    <div
      css={css`
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 240px;
        padding: 12px;
        z-index: 1;
        background-color: rgb(31, 31, 31);
        color: white;
      `}
    >
      <Header />
      <hr />
      <GlobalNavigation id={id} />
      <Footer />
    </div>
  );
}

function Header() {
  const { user } = useSelector((state) => ({
    user: state.auth.user,
  }));

  if (!user) {
    return null;
  }

  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        padding: 6px 4px;
      `}
    >
      <div
        css={css`
          padding-right: 12px;
        `}
      >
        {user.photoURL && (
          <Image
            src={user.photoURL}
            width={48}
            height={48}
            alt={user.displayName || user.uid}
            css={css`
              border-radius: 50%;
            `}
          />
        )}
      </div>
      <div
        css={css`
          flex-grow: 3;
        `}
      >
        <div
          css={css`
            padding-bottom: 3px;
            font-weight: bold;
          `}
        >
          {user.displayName || user.uid}
        </div>
        <div
          css={css`
            color: lightgray;
            font-size: 0.8em;
          `}
        >
          ({user.email})
        </div>
      </div>
    </div>
  );
}

const GlobalNavigationSeparator = Symbol("separator");

const globalNavigationEntries: (GlobalNavigationLinkItem | typeof GlobalNavigationSeparator)[] = [
  {
    id: "home",
    url: "/",
    label: <span>ダッシュボード</span>,
  },
  {
    id: "topImages",
    url: "/topImages",
    label: <span>トップ画像</span>,
  },
  GlobalNavigationSeparator,
  {
    id: "works",
    url: "/works",
    label: <span>WORKS</span>,
  },
  {
    id: "gallery",
    url: "/gallery",
    label: <span>GALLERY</span>,
  },
  {
    id: "comics",
    url: "/comics",
    label: <span>COMICS</span>,
  },
];

function GlobalNavigation({ id }: { id: string }) {
  return (
    <ul
      css={css`
        padding-left: 0;
        list-style-type: none;
      `}
    >
      {globalNavigationEntries.map((item, index) => {
        if (typeof item === typeof GlobalNavigationSeparator) {
          return <hr key={index} />;
        } else {
          const linkItem = item as GlobalNavigationLinkItem;
          return (
            <GlobalNavigationItem key={index} url={linkItem.url} isActive={linkItem.id === id}>
              {linkItem.label}
            </GlobalNavigationItem>
          );
        }
      })}
    </ul>
  );
}

function GlobalNavigationItem({ url, isActive, children }: { url?: string; isActive: boolean; children: ReactNode }) {
  return (
    <li
      css={css`
        ${isActive && css``}
      `}
    >
      <p
        css={css`
          height: 56px;
          line-height: 56px;
          ${isActive &&
          css`
            background-color: white;
          `}
        `}
      >
        {url ? (
          <Link
            href={url}
            css={css`
              display: block;
              padding-left: 18px;
              color: white;
              font-weight: bold;
              text-decoration: none;
              ${isActive &&
              css`
                color: black;
              `}

              &:hover {
                background-color: gray;
                color: black;
                text-decoration: none;
              }
            `}
          >
            {children}
          </Link>
        ) : (
          children
        )}
      </p>
    </li>
  );
}

function Footer() {
  return (
    <div
      css={css`
        position: absolute;
        right: 12px;
        bottom: 12px;
        text-align: right;
      `}
    >
      <Button
        variant="secondary"
        type="button"
        className="logout-button"
        onClick={() => {
          signOut();
        }}
      >
        {"ログアウト"}
      </Button>
    </div>
  );
}

export default Sidebar;
