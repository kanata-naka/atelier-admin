import Link from "next/link"

/**
 * サイドバー
 */
export default ({ currentKey }) => {
  return (
    <div className="sidebar">
      <GlobalNav currentKey={currentKey} />
    </div>
  )
}

/**
 * グローバルナビゲーション
 */
const GlobalNav = ({ currentKey }) => {
  return (
    <ul className="global-nav">
      {[
        {
          type: "item",
          key: "home",
          url: "/",
          text: <span>{"ダッシュボード"}</span>
        },
        {
          type: "item",
          key: "topImages",
          url: "/topImages",
          text: <span>{"トップ画像"}</span>
        },
        {
          type: "separator"
        },
        {
          type: "item",
          key: "works",
          url: "/works",
          text: <span>{"WORKS"}</span>
        },
        {
          type: "item",
          key: "gallery",
          url: "/gallery",
          text: <span>{"GALLERY"}</span>
        }
      ].map(item => {
        if (item.type === "separator") {
          return <hr />
        }
        switch (item.type) {
          case "separator":
            return <hr />
          default:
            return (
              <GlobalNavItem
                key={item.key}
                isActive={item.key === currentKey}
                url={item.url}>
                {item.text}
              </GlobalNavItem>
            )
        }
      })}
    </ul>
  )
}

const GlobalNavItem = ({ url, isActive, children }) => {
  return (
    <li className={`global-nav-item ${isActive ? "active" : ""}`}>
      {url ? (
        <Link href={url}>
          <a className="global-nav-item__link">
            <p>{children}</p>
          </a>
        </Link>
      ) : (
        <p>{children}</p>
      )}
    </li>
  )
}
