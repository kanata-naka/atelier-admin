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
      <GlobalNavItem key="home" title="ホーム" url="/" />
      <GlobalNavItem key="topImages" title="トップ画像" url="/topImages" />
      <GlobalNavItem title="投稿管理">
        <GlobalNavItem key="works" title="WORKS" url="/works" />
        <GlobalNavItem key="gallery" title="GALLERY" url="/gallery" />
      </GlobalNavItem>
    </ul>
  )
}

const GlobalNavItem = ({ title, url, children }) => {
  return (
    <li className={"global-nav-item" + (children ? " has-children" : "")}>
      {url ? (
        <Link href={url}>
          <a className="global-nav-item__link">
            <p>{title}</p>
          </a>
        </Link>
      ) : (
        <p>{title}</p>
      )}
      {children && <ul className="global-nav">{children}</ul>}
    </li>
  )
}
