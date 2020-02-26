import Link from "next/link"

/**
 * サイドバー
 */
export default () => {
  return (
    <div className="sidebar">
      <GlobalNav />
    </div>
  )
}

/**
 * グローバルナビゲーション
 */
const GlobalNav = () => {
  return (
    <ul className="global-nav">
      <GlobalNavItem id="home" title="ホーム" url="/" />
      <GlobalNavItem id="topImages" title="トップ画像" url="/topImages" />
      <GlobalNavItem title="投稿管理">
        <GlobalNavItem id="works" title="WORKS" url="/works" />
        <GlobalNavItem id="gallery" title="GALLERY" url="/gallery" />
      </GlobalNavItem>
    </ul>
  )
}

const GlobalNavItem = ({ id, title, url, children }) => {
  return (
    <li
      key={id}
      className={"global-nav-item" + (children ? " has-children" : "")}>
      {url ? (
        <Link href={url}>
          <a className="global-nav-item__link">
            <p>{title}</p>
          </a>
        </Link>
      ) : (
        <p>{title}</p>
      )}
      <ul className="global-nav">{children}</ul>
    </li>
  )
}
