import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig.js';
import React, { useState, useEffect ,useRef} from 'react';
import ResultModal from './ResultModal.js';
import link_img from '../../assets/web.png'
import { Link } from 'react-router-dom';
import './Vote.css';

const Vote = (props) => {
    const [ModalState, setModalState] = useState(false); 
    const [producers, setProducers] = useState([]);
    const [blockProducer, setBlockProducer] = useState('');
    const [selectProducer,setselectProducer] = useState([]);
    const [VoteResult, setVoteResult] = useState('Success'); 
    const [UserKey,setUserKey] = useState('');
    const [UserName,setUserName] = useState('');
    const [isLogin,setIsLogin] = useState(false);
    const [VoteID, setVoteID] = useState('');
    useEffect(() => {
      const intervalId = setInterval(fetchDataFromHep, 500);
      GetProducers();
  
      return () => clearInterval(intervalId);
    }, []);
    const fetchDataFromHep = async () => {
      const rpc = new JsonRpc('https://heptagon-producer1.store');
      try {
        const info = await rpc.get_info();
        const latestBlockNum = info.head_block_num;
        const block = await rpc.get_block(latestBlockNum);
        setBlockProducer(block.producer);
      } catch (error) {
        console.error('Error fetching data from server:', error);
      }
    };
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
            body: JSON.stringify({}),
          });
          const result = await response.json();
          setUserName(result.UserName);
          setUserKey(result.UserKey);
          if(result.UserKey !== undefined ){
            setIsLogin(true);
            
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
    const GetProducers = async () => {
      const rpc = new JsonRpc('https://heptagon-producer1.store');
      let producerLength = 0;
      let producerData;
  
      while (producerLength <= 24) {
        producerData = await rpc.get_producers(true, '', 100);
        producerLength = producerData.rows.length;
      }
  
      producerData.rows.sort((a, b) => parseFloat(b.total_votes) - parseFloat(a.total_votes));
      setProducers(producerData.rows);
    };
    const formatVotes = (votes) => {
      const num = parseInt(votes);
      return num.toLocaleString();
    };
  
    const calculateVoteRate = (votes) => {
      const totalVotes = calculateTotalVotes();
      const producerVotes = parseFloat(votes);
      const voteRate = (producerVotes / totalVotes) * 100;
      return voteRate.toFixed(2);
    };
  
    const calculateTotalVotes = () => {
      return producers.reduce((total, producer) => total + parseFloat(producer.total_votes), 0);
    };
    const auth_name_Ref = useRef();
    const action_account_Ref = useRef();
    const action_name_Ref = useRef();
    const data_Ref = useRef();
    const result_Ref = useRef();
    const status_Ref = useRef();
    const voteFetch = async() => {
      setVoteResult(status_Ref.current.value)
      setModalState(true);
      
      let result = JSON.parse(result_Ref.current.value);
      console.log(result);
      console.log(result.transaction_id)
      setVoteID(result.transaction_id)
    }
    const handleVote = async() => {
      if(props.isLogin){
        const datas = {
          voterPrivateKey : '5Jt6Tf3s5CWjtbG1wWaQNGBa9vp1R2zxSkKC2AK8rMJGsXTfWqj',
           voterName : 'producer4',
            producerName : selectProducer
        };
        const url = 'http://221.148.25.234:8989/voteProducer';
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ datas }),
          });
          const result = await response.json();
          
          setVoteResult("SUCCESS");
          console.log(result.result)
          setVoteID(result.result.transaction_id)
          setModalState(true);
        } catch (error) {
          setVoteResult("Failed");
          setModalState(true);
          console.error('Error:', error);
        }
      }else {
        alert("로그인을 해주세요")
      }
      
    };
    const isProducing = (producer) => {
      return blockProducer === producer;
    };
    const handleCheckboxChange = (event) => {
      const value = event.target.value;
      if (selectProducer.includes(value)) {
        setselectProducer(selectProducer.filter(item => item !== value));
        action_account_Ref.current.value = "eosio";
        action_name_Ref.current.value = "voteproducer";
        auth_name_Ref.current.value = UserName;
        
        // 철희 추가. json으로 변환해서 input의 value에 추가해야됨
        const dataObject = {
          voter: auth_name_Ref.current.value,
          proxy: '',
          producers: selectProducer
        };
        data_Ref.current.value = JSON.stringify(dataObject);
        console.log(action_account_Ref.current.value)
      } else {
        setselectProducer([...selectProducer, value]);
        action_account_Ref.current.value = "eosio";
        action_name_Ref.current.value = "voteproducer";
        auth_name_Ref.current.value = UserName;
        
        // 철희 추가. json으로 변환해서 input의 value에 추가해야됨
        const dataObject = {
          voter: auth_name_Ref.current.value,
          proxy: '',
          producers: selectProducer
        };
        data_Ref.current.value = JSON.stringify(dataObject);
        console.log(auth_name_Ref.current.value)
      }
    };
    return (
      <div className="container">
          <div className="selected_View">
            <div className='selected_container_all'>
              <div className='selected_container'>
                <p>Selected Validators({selectProducer.length}/30)</p>
                <ul className='selected_ul'>
                  {selectProducer.map(item =>(
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>  
              <div className='vote_container'>
                <button type='button'id='transaction' className='vote_btn'>VOTE</button>
                <button id="transaction_complete" style={{display: "none"}} onClick={voteFetch}></button>
                <input ref={action_account_Ref} id="action_account" type="hidden" />
                <input ref={action_name_Ref} id="action_name" type="hidden" />
                <input ref={auth_name_Ref} id="auth_name" type="hidden" />
                <input ref={data_Ref} id="data" type="hidden" />
                <input ref={result_Ref} id="result" type="hidden" />
                <input ref={status_Ref} id="status" type="hidden" />
              </div>
            </div>
            
          </div>
          <div className="producers_table">
          <div className="producer_table_header">
            <p className='select_header'>Select</p>
            <p className="rank_header">Rank</p>
            <p className="producer_name_header">Validator</p>
            <p className="producer_status_header">Status</p>
            <p className="producer_link_header">Link</p>
            <p className="producer_vote_rate_header">Votes %</p>
            <p className="producer_votes_header">Total Votes</p>
            <p className="reward_per_day_header">Rewards Per Day</p>
          </div>
          {producers.map((producer, index) => (
            <div className="producer_item" key={index}>
              <input type="checkbox" value={producer.owner} className='select_container' checked={selectProducer.includes(producer.owner)} 
              onChange={handleCheckboxChange} disabled={selectProducer.length >= 30 && !selectProducer.includes(producer.owner)}/>
              <p className="rank">{index + 1}</p>
              <Link to={`/Account/${producer.owner}`} className="producer_name">
                {producer.owner}
              </Link>
              <div className="producer_status">
                <p
                  className={`producer_status_box ${
                    index > 20 ? 'standby' : isProducing(producer.owner) ? 'producing' : 'Top21'
                  }`}
                >
                  {index > 20 ? 'stand by' : isProducing(producer.owner) ? 'producing' : 'Top 21'}
                </p>
              </div>
              <a className="producer_link" href={producer.url} target="_blank" rel="noopener noreferrer">
                <img className="internet_logo" src={link_img} alt="Producer Logo" />
              </a>
              <p className="producer_vote_rate">{calculateVoteRate(producer.total_votes)}%</p>
              <p className="producer_votes">{formatVotes(producer.total_votes)}</p>
              <p className="reward_per_day">{index > 20 ? '0 HEP' : '1,728 HEP'}</p>
            </div>
        ))}
      </div>
      {ModalState === true ? //모달 상태가 true면 1번, false면 2번이 작동합니다.
      <div style={{display:"flex",position:"fixed",top:"0",left: "0", bottom: "0", right: "0",justifyContent:"center",alignItems:"center", zIndex : "100"}}>
        <ResultModal setModalState={setModalState} VoteResult={VoteResult} VoteID={VoteID}/> 
      </div>
      
      : ""}
      </div>
    );
  };
  
  export default Vote;