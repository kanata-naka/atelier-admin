import React from "react"
import Link from "next/link"

export default class extends React.Component {
  render() {
    return (
      <ul className="global-nav">
        <GlobalNavItem href="/" id="covers" title="ホーム" />
        <GlobalNavItem href="/covers" id="covers" title="カバー画像" />
        <GlobalNavItem title="投稿管理">
          <GlobalNavItem href="/works" id="works" title="WORKS" />
          <GlobalNavItem href="/gallery" id="gallery" title="GALLERY" />
        </GlobalNavItem>
      </ul>
    )
  }
}

class GlobalNavItem extends React.Component {
  render() {
    const { href, title, children } = this.props
    return (
      <li className={"global-nav-item" + (children ? " has-children" : "")}>
        {href ? (
          <Link href={href}>
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
}
