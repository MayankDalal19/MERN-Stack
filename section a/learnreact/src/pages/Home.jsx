import { useEffect, useState } from "react";
import AddToCart from "../components/AddToCart";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";

function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetch("https://fakestoreapi.com/products");
    const result = await response.json();
    setProducts(result);
  }

  function trimContent(input, maxLength) {
    const arr = input.split(" ");
    return arr.length > maxLength
      ? arr.slice(0, maxLength).join(" ") + "..."
      : input;
  }

  return (
    <>
      <section id="product-wrapper">
        {products.length > 0 ? (
          products.map((product) => (
            <div className="product" key={product.id}>
              <div className="picture">
                <Link to={`/product/${product.id}`}>
                  <img src={product.image} alt="" />
                </Link>
              </div>
              <div className="content">
                <h3>{trimContent(product.title, 7)}</h3>
                <p>${product.price}</p>
                <AddToCart />
              </div>
            </div>
          ))
        ) : (
          <Loading />
        )}
      </section>
    </>
  );
}

export default Home;
