import './Home.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import producer_img from '../../assets/producer.png'
import block_img from '../../assets/hb.png'
import transactions_img from '../../assets/transactions.png'
import link_img from '../../assets/web.png'

const Home = () => {
  const [blockProducer, setBlockProducer] = useState('');
  const [headBlockNum, setHeadBlockNum] = useState('');
  const [transactions, setTransactions] = useState('');
  const [irrBlockNum, setIrrBlockNum] = useState('');
  const [irr_hb, setIrrHb] = useState('');
  const [producers, setProducers] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(fetchDataFromHep, 500);
    GetProducers();

    return () => clearInterval(intervalId);
  }, []);

  const fetchDataFromHep = async () => {
    const rpc = new JsonRpc('http://14.63.34.160:8888');
    const signatureProvider = new JsSignatureProvider(['5K8Usi9sYmkBSBpLsHeqEGQ8K3vAxBoUWrTnxRfLmDfeAwys93Q']);
    try {
      const info = await rpc.get_info();
      const latestBlockNum = info.head_block_num;
      const block = await rpc.get_block(latestBlockNum);
      setBlockProducer(block.producer);
      setHeadBlockNum(latestBlockNum.toLocaleString());
      setTransactions(block.transactions.length.toLocaleString());
      setIrrBlockNum(info.last_irreversible_block_num.toLocaleString());
      setIrrHb(latestBlockNum - info.last_irreversible_block_num);
    } catch (error) {
      console.error('Error fetching data from server:', error);
    }
  };
  const GetProducers = async () => {
    const rpc = new JsonRpc('http://14.63.34.160:8888');
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

  const isProducing = (producer) => {
    return blockProducer === producer;
  };

  return (
    <div className="container">
      {/* 정보테이블 */}
      <div className="info_table">
        {/* 프로듀서 */}
        <div className="producer_table">
          <img src={producer_img} alt="Producer" />
          <Link to={`/Account/${blockProducer}`} className="hb_text">
            <span className="info">{blockProducer}</span>
          </Link>
          <span className="info_text">PRODUCER</span>
        </div>
        {/* 헤드블록 */}
        <div className="head_block_table">
          <img src={block_img} alt="Head Block" />
          <span className="info with-tooltip" data-tooltip="Head Block">
            <Link to={`/BlockInfo/${headBlockNum}`} className="hb_text">
              {headBlockNum}
            </Link>
          </span>
          <span className="info_text with-tooltip" data-tooltip="last irreversible(LIB)">
            <Link to={`/BlockInfo/${irrBlockNum}`} className="irrb_text">
              {irrBlockNum}(-{irr_hb})
            </Link>
          </span>
        </div>
        {/* 트랜잭션 */}
        <div className="transactions_table">
          <img src={transactions_img} alt="Transactions" />
          <span className="info">{transactions}</span>
          <span className="info_text">Transactions / HB</span>
        </div>
      </div>
      {/* 프로듀서리스트 */}
      <div className="producers_table">
        <div className="producer_table_header">
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
      {/* 프로듀서리스트 */}
    </div>
  );
  };
  
  export default Home;