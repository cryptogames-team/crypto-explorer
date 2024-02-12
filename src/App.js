import logo from './logo.svg';
import './App.css';
import { Route, Routes, Link, useLocation, useParams,useNavigate,Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Account from './pages/Account/Account';
import Vote from './pages/Vote/Vote';
import BlockInfo from './pages/BlockInfo/BlockInfo';
import ErrorPage from './pages/BlockError/BlockError';
import { useState , useRef,useEffect } from 'react';
import { JsonRpc } from 'eosjs';
import WhiteLogo from './assets/hep_white_name_logo.png';
import Logo from './assets/hep_logo.png';
import home_img from './assets/home.png';
import BlockError from './pages/BlockError/BlockError';
import AccountError from './pages/AccountError/AccountError';
import TransactionError from './pages/TransactionError/TransactionError';
import Transaction from './pages/Transaction/Transaction';

function App() {
  const location = useLocation();
  const [inputData,setinpuData] = useState('');
   const [UserKey,setUserKey] = useState('');
   const [UserName,setUserName] = useState('');
   const [isLogin,setIsLogin] = useState(false);
   const [buttonId, setButtonId] = useState('login');
  const navigate = useNavigate();
  const handleLogin = async (key,name) => {
    if(UserKey===''){
      const url = 'http://221.148.25.234:4000/login';
      try {
        const response = await fetch(url, {
          method: 'POST',
          mode : 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserKey: key, UserName: name }),
        });
        setUserKey(key);
        setUserName(name);
        console.log(response.data.result);
      }catch(error){
        console.log(error)
      }
    }
  };
  const userNameRef = useRef();
  const userKeyRef = useRef();
  const fetchUserData = async () => {
    if(isLogin == false){
      console.log("dd")
    const url = 'http://cryptoexplorer.store/userdata';
      try {
        const response = await fetch(url, {
          method: 'POST',
          mode : 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserKey: userKeyRef.current.value, UserName: userNameRef.current.value }),
        });
        const result = await response.json();
        setUserName(result.UserName);
        setUserKey(result.UserKey);
        userKeyRef.current.value = result.UserKey;
        userNameRef.current.value = result.UserName;
        if(result.UserKey !== undefined ){
          setIsLogin(true);
          setButtonId("set")
        }
        
      }catch(error){
        console.log(error)
      }
    }
  };
  useEffect(() => {
    if(!isLogin){
      fetchUserData();
    }
    
  });
  
  const fetchLogin =  async() => {

    console.log(isLogin)
    if(isLogin == false){
      console.log("test")
      const url = 'http://cryptoexplorer.store/login';
      try {
        const response = await fetch(url, {
          method: 'POST',
          mode : 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserKey: userKeyRef.current.value, UserName: userNameRef.current.value }),
        });
        setUserName(userNameRef.current.value);
        
        setUserKey(userKeyRef.current.value);
        setIsLogin(true);
        setButtonId("set")
      }catch(error){
        console.log(error)
      }
      
    }
     
    
  };
  
const handleSearch = async() => {
    if(inputData.startsWith('#')){
      const remainingText = inputData.slice(1);
      navigate(`/BlockInfo/${remainingText}`);
    }else if(inputData.startsWith('EOS')){
      const rpc = new JsonRpc('https://heptagon-producer1.store');
      try {
        const result = await rpc.history_get_key_accounts(inputData);
        const accountName = result.account_names[0];
        navigate(`/Account/${accountName}`);
        window.location.reload()
      }catch(error){
        console.error(error)
      }
    
    }else {
      navigate(`/Account/${inputData}`);
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <div className="App">
      <div className="all_header">
        <div className="header">
          <Link to="/"><span className="logo"><img src={WhiteLogo}></img></span></Link>
          <span className="title">CryptoExplorer</span>
          <button className="login" value={null} id={buttonId} >{UserKey ? UserKey : "login"}</button>
          <button id="login_complete" style={{display: "none"}} onClick={fetchLogin}></button>
          <input ref={userNameRef} id="UserName" type="hidden" />
          <input ref={userKeyRef} id="UserKey" type="hidden" />
        </div>

        <div className="menuheader">
          <div className="uiContainer">

          <div className="logo_container">
            <span className="hep_logo"><img src={Logo}></img></span>
            <span className="hep_name">HEP</span>
          </div>

            <div className="content_container">
              <div className="search-container">
                <input type="text" className="search-input" onKeyDown={handleKeyPress} onChange={(e) => setinpuData(e.target.value)} placeholder="Search by Block # / Account / Public Key"/>
                <button className="search-button" onClick={handleSearch}>search</button>
              </div>
              <div className="category_all_container">
                <div className="category_container">
                  <Link to="/" className={`item ${isLinkActive(location.pathname,'/',true,'BlockInfo') ? 'active' : ''}`} >
                    <img className="home_icon" src={home_img} alt="Home"></img>
                  </Link>
                  <Link to="/Account/eosio" className={`item ${isLinkActive(location.pathname,'/Account') ? 'active' : ''}`}>
                     Account
                  </Link>
                  <Link to="/Vote" className={`item ${isLinkActive(location.pathname,'/Vote') ? 'active' : ''}`}>
                    Vote
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>  
      </div>

      <div className='body'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Account/:AccountName" element={<Account />} />
        <Route path="/Account" element={<Account />} />
        <Route path="/Vote" element={<Vote isLogin={isLogin}/>} />
        <Route path="/BlockInfo/:blockNum" element={<BlockInfo />} />
        <Route path="/Transaction/:Txn" element={<Transaction />} />
        <Route path="/BlockError" element={<BlockError />} />
        <Route path="/TransactionError" element={<TransactionError />} />
        <Route path="/AccountError" element={<AccountError />} />
      </Routes>
      </div>
    </div>
  );
  function isLinkActive(currentPath, route, exact = false, other) {
    if (exact) {
      return currentPath === route;
    }
    return currentPath.startsWith(route);
  }
}

export default App;
