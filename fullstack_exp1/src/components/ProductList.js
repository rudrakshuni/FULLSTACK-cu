import { useDispatch, useSelector } from "react-redux";
import { addProduct, removeProduct } from "../redux/productsSlice";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProductList() {
  const products = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const { role } = useContext(AuthContext);

  return (
    <div className="card">
      <h3>Product Catalog</h3>

      {role === "admin" && (
        <button
          onClick={() =>
            dispatch(addProduct({ id: Date.now(), name: "Product " + Date.now() }))
          }
        >
          + Add Product
        </button>
      )}

      {products.length === 0 ? (
        <p className="empty">No products available</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <h4>{p.name}</h4>
              {role === "admin" && (
                <button
                  className="danger"
                  onClick={() => dispatch(removeProduct(p.id))}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
