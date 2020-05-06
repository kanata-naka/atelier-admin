import GlobalNav from "./GlobalNav"

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
