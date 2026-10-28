import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddToCart from "../components/AddToCart";
import Loading from "../components/Loading";

function SingleProduct() {
  const [product, setProduct] = useState({});
  let { id } = useParams();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const response = await fetch("https://fakestoreapi.com/products/" + id);
    const result = await response.json();
    setProduct(result);
  }

  return (
    <>
      {Object.keys(product).length > 0 ? (
        <div className="singleProduct">
          <div className="left">
            <img src={product.image} alt={product.title} />
          </div>
          <div className="right">
            <h2>{product.title}</h2>
            <p className="category">
              Category:
              <strong>
                <em>{product.category}</em>
              </strong>
            </p>
            <h4 className="price">$ {product.price}</h4>
            <p className="description">{product.description}</p>
            <AddToCart />
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default SingleProduct;
