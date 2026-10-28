import {Link} from "react-router-dom"
function Header() {
  return (
    <header>
      <h2><Link to="/">ECOMMERCE</Link></h2>
      <ul>
        <li><Link to="/categories">Categories</Link></li>
        <li><Link to="/cart">Cart <span className="cartCount">0</span></Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </header>
  )
}

export default Header