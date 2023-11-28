import { useParams,Link,useNavigate } from 'react-router-dom';
import './BlockInfo.css';
import { JsonRpc } from 'eosjs';
import block_img from '../../assets/hb.png'
import block_info_img from '../../assets/blockinfo.png'
import { useState ,useEffect} from 'react';
import BlockError from '../BlockError/BlockError'


const BlockInfo = () => {
    const navigate = useNavigate();
    const { blockNum } = useParams();
    let blockNum_int = parseInt(blockNum.replace(/,/g, ''));
    const [BlockNumInt,SetBlockNumInt] = useState('');
    const [blockProducer, setBlockProducer] = useState('');
    const [Timestamp,setTimestamp] = useState('');
    const [BlockID,setBlockID] = useState('');
    const [Transactions,setTransactions] = useState('');
    const [TotalCpuUsed,setTotalCpuUsed] = useState(0);
    const [TotalNetUsed,setTotalNetUsed] = useState(0);
    const [TransactionsData,setTransactionsData] = useState([]);
    const fetchDataAgain = async (change_block) => {
      const rpc = new JsonRpc('http://14.63.34.160:8888');
      
      try {
        console.log(change_block)
        const block = await rpc.get_block(change_block);
        setBlockProducer(block.producer);
        setBlockID(block.id);
        setTimestamp(block.timestamp);
        setTransactions(block.transactions.length);
        if(block.transactions.length > 0){
          setTransactionsData(block.transactions);
          let cpu_used = 0;
          let net_used = 0;
          for (const transaction of block.transactions) {
            cpu_used += transaction.cpu_usage_us;
            net_used += transaction.net_usage_words;
          }
          setTotalCpuUsed(cpu_used);
          setTotalNetUsed(net_used);
          
        }else {
          setTransactionsData([]);
        }
        SetBlockNumInt(change_block)
      } catch (error) {
        console.error('Error fetching data from server:', error);
        navigate('/BlockError');
      }
    };
    const tableData = [
      ['Block Height:', (
        <span>
          {BlockNumInt.toLocaleString()}&nbsp;&nbsp;&nbsp;&nbsp; 
          {/* <Link to={`/BlockInfo/${blockNum_int - 1}`} className="arrow" > */}
          <span className='arrow' onClick={() => fetchDataAgain(BlockNumInt - 1)}>
            &larr;Prev&nbsp;&nbsp;
          </span>
          <span className='arrow' onClick={() => fetchDataAgain(BlockNumInt + 1)}>
          Next&rarr;
          </span> 
        </span>
      )],
      ['Timestamp:', Timestamp],
      ['Producer Name:', (
        <Link to = {`/Account/${blockProducer}`} className="arrow"> {blockProducer}</Link>
      )],
      ['Block ID:', BlockID]
    ];

    const tableData2 = [
      ['Resources Used-CPU/NET:', TotalCpuUsed + ' μs / ' + TotalNetUsed + 'bytes'],
      ['Number of TX/Actions:', Transactions],
      ['Previous Block:',(
        <span className='arrow' onClick={() => fetchDataAgain(BlockNumInt + 1)}>
          {BlockNumInt === 1 ? '' : (BlockNumInt - 1).toLocaleString()}
        </span> 
      )],
      ['Next Blcok:',(
        <span className='arrow' onClick={() => fetchDataAgain(BlockNumInt + 1)}>
          { (BlockNumInt + 1).toLocaleString()}
        </span> 
      )],
    ];
    useEffect(()=>{
    const fetchDataFromHep = async () => {
      const rpc = new JsonRpc('http://14.63.34.160:8888');
    
      try {
        SetBlockNumInt(blockNum_int);
        const block = await rpc.get_block(blockNum_int);
        setBlockProducer(block.producer);
        setBlockID(block.id);
        setTimestamp(block.timestamp);
        setTransactions(block.transactions.length);
        if(block.transactions.length > 0){
          setTransactionsData(block.transactions);
          let cpu_used = 0;
          let net_used = 0;
          for (const transaction of block.transactions) {
            cpu_used += transaction.cpu_usage_us;
            net_used += transaction.net_usage_words;
          }
          setTotalCpuUsed(cpu_used);
          setTotalNetUsed(net_used);
          
        }else {
          setTransactionsData([]);
        }
        console.log(block)
      } catch (error) {
        console.error('Error fetching data from server:', error);
        navigate('/BlockError');
      }
    };
    fetchDataFromHep();
  },[blockNum]);
    return (
      <div className='all_container'>
        <div className='block_head_container'>
          <div className='block_num_container'>
            <img src={block_img}></img>
            <h2 className='block_num'>Block #{BlockNumInt}</h2>
          </div>
          <div className='block_head_info_container'>
            <div className='block_head_info_left_container'>
            <table className='left_table'>
              <thead>
                <tr>
                  <th className='summary_th'>Summary </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex} className='tr_box'>
                {row.map((cellData, columnIndex) => (
                  <td key={columnIndex}>{cellData}</td>
                ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className='block_head_info_right_container'>
            <table className='right_table'>
              <thead>
                <tr>
                  <th className='Information_th'>Additional Information</th>
                </tr>
              </thead>
              <tbody>
                {tableData2.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                {row.map((cellData, columnIndex) => (
                  <td key={columnIndex}>{cellData}</td>
                ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* 블록 정보 */}
        <div className='block_info_container'>
          <div className='block_info_header'>
            <h2><img src={block_info_img} className='block_info_img'></img> Block Information</h2>
          </div>
          <div className='transaction_container'>
            <table className='transaction_table'>
              <thead>
                <tr>
                <th className='transaction_table_id'>ID</th>
                <th className='transaction_table_expiration'>expiration</th>
                <th className='transaction_table_CPU'>CPU Usage</th>
                <th className='transaction_table_Net'>NET Usage</th>
                <th className='transaction_table_Number'>Number of Actions</th>
                </tr>
              </thead>
              <tbody>
                {TransactionsData.map((transaction,index) => (
                  <tr className="transaction_tr" key={index}>
                    <td><Link to={`/Transaction/${transaction.trx.id}`} className="arrow" >{transaction.trx.id}</Link></td>
                    <td>{transaction.trx.transaction.expiration}</td>
                    <td>{transaction.cpu_usage_us} μs</td>
                    <td>{transaction.net_usage_words} bytes</td>
                    <td>{transaction.trx.transaction.actions.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default BlockInfo;