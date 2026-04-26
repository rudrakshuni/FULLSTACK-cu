import "./App.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import ProductList from "./components/ProductList";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="app-container">
          <div className="header">
            <h1>StateFlow Dashboard</h1>
          </div>

          <Login />
          <ProductList />
        </div>
      </AuthProvider>
    </Provider>
  );
}

export default App;
