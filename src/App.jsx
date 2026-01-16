import { useState } from "react";
import axios from "axios";

import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);

  //產品資料
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  // 表單輸入處理
  const eventHandler = (e) => {
    const { value, name } = e.target;
    setFormData((prevData) => ({
      ...prevData, // 保留原有屬性
      [name]: value, // 更新特定屬性
    }));
    // console.log(name, value);
  };

  //串接登入Api
  const onSubmit = async (e) => {
    try {
      e.preventDefault(); //避免預設事件
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(res.data);
      const { token, expired } = res.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common["Authorization"] = token;
      //取得產品資料
      getProducts();
      //設定登入狀態
      setIsAuth(true);
    } catch (error) {
      //設定登入狀態
      setIsAuth(false);
      console.log(error.response);
    }
  };

  //確認登入驗證
  const checkLogin = async () => {
    try {
      // 讀取 Cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common["Authorization"] = token;
      const res = await axios.post(`${API_BASE}/api/user/check`);
      console.log(res.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  //取得產品資料
  const getProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>會員登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="username"
                name="username"
                placeholder="name@example.com"
                onChange={(e) => eventHandler(e)}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                onChange={(e) => eventHandler(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="container">
            <div className="row mt-2">
              <div className="col-md-6">
                <button
                  className="btn btn-danger mb-5"
                  type="button"
                  onClick={() => checkLogin()}
                >
                  確認是否登入
                </button>
                <h2>產品列表</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">產品名稱</th>
                      <th scope="col">原價</th>
                      <th scope="col">售價</th>
                      <th scope="col">是否啟用</th>
                      <th scope="col">查看細節</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setTempProduct(product)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h2>產品明細</h2>
                {tempProduct ? (
                  <div className="card">
                    <img
                      src={tempProduct.imageUrl}
                      style={{ height: "500px" }}
                      className="card-img-top"
                      alt="主圖"
                    />
                    <div className="card-body">
                      <h5 className="card-title">{tempProduct.title}</h5>
                      <p className="card-text">
                        商品描述:{tempProduct.description}
                      </p>
                      <p className="card-text">
                        商品內容:{tempProduct.content}
                      </p>
                      <div className="d-flex">
                        <del className="text-secondary">
                          {tempProduct.origin_price}
                        </del>
                        <div> 元/ {tempProduct.price} 元</div>
                      </div>
                      <h5 className="card-title">更多圖片</h5>
                      <div className="d-flex ">
                        {tempProduct.imagesUrl.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            style={{ height: "100px" }}
                            className="card-img-top"
                            alt="附圖"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>請選擇產品</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
