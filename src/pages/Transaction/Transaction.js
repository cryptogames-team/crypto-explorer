import transaction_img from '../../assets/account_transactions.png'
import transactions_img from '../../assets/transactions.png'
import { useParams,Link,useNavigate } from 'react-router-dom';
import './Transaction.css';
import { useState,useEffect } from 'react';
import { JsonRpc } from 'eosjs';

const Transaction = () => {
    const navigate = useNavigate();
    const [BlockNum, setBlockNum] = useState('');
    const [BlockTime, setBlockTime] = useState('');
    const [Status, setStatus] = useState('');
    const [CpuUsage, setCpuUsage] = useState('');
    const [NetUsage, setNetUsage] = useState('');
    const [Traces,setTraces] = useState([]);
    const [Actions,setActions] = useState([]);
    const tableData = [
        ['Block Number:', (
          <span>
            <Link to={`/BlockInfo/${BlockNum}`} className="arrow" >{BlockNum.toLocaleString()}</Link>
          </span>
        )],
        ['Block Time:', BlockTime],
        ['Status:', (<span className='status_box'>{Status}</span>)]
    ];
    const tableData2 = [
        ['CPU Usage:', CpuUsage + ' ms'],
        ['Net Usage:', NetUsage + ' Bytes'],
        ['Actions/Traces:', Array.isArray(Actions) ? Actions.length : 1 +"/" + Traces.length],
        ['Actions:', Actions.length > 0 ?  Actions[0].name : 'onblock']
      ];
    const { Txn } = useParams();
    useEffect(()=>{
    const fetchDataFromHep = async () => {
        const rpc = new JsonRpc('https://heptagon-producer1.store');
      
        try {
          const transaction_data = await rpc.history_get_transaction(Txn);
          console.log(transaction_data);
          setBlockNum(transaction_data.block_num);
          setBlockTime(transaction_data.block_time);
          if(transaction_data.traces.length > 10){
            setStatus("Executed");  
            setCpuUsage('0');
            setNetUsage('0');
            setTraces(transaction_data.traces);
            setActions(transaction_data.traces[0].act);
          }else if(transaction_data.traces.length < 10 && transaction_data.traces[0].act.name ==='onblock'){
            setStatus("Executed");  
            setCpuUsage('0');
            setNetUsage('0');
            setTraces(transaction_data.traces);
            setActions(transaction_data.traces[0].act);
            console.log(Actions)
          }else {
            setStatus(transaction_data.trx.receipt.status);  
            setCpuUsage(transaction_data.trx.receipt.cpu_usage_us);
            setNetUsage(transaction_data.trx.receipt.net_usage_words);
            setTraces(transaction_data.traces);
            setActions(transaction_data.trx.trx.actions);
          }

        } catch (error) {
          console.error('Error fetching data from server:', error);
          navigate('/TransactionError');
        }
      };
      fetchDataFromHep();
    },[BlockNum]);
    return (
      <div className='all_container'>
        <div className='Transaction_container'>
            <div className='transaction_header'>
                <img src={transactions_img}></img>
                <div className='transaction_id_container'>
                    <h2>Transaction:
                    </h2>  
                    <span>{Txn}</span>
                </div>
            </div>
            <div className='transaction_info_container'>
                <div className='transaction_info_left_container'>
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
                <div className='transaction_info_right_container'>
                    <table className='right_table'>
                        <thead>
                            <tr>
                                <th className='Information_th'>Additional</th>
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
        <div className='actions_container'>
          <div className='actions_header'>
            <h2><img src={transaction_img} className='action_img'></img> Actions</h2>
          </div>
          <div className='transaction_container'>
            <table className='transaction_table'>
              <thead>
                <tr>
                <th className='transaction_table_Contract'>Contract</th>
                <th className='transaction_table_Name'>Name</th>
                <th className='transaction_table_Authorization'>Authorization</th>
                <th className='transaction_table_Data'>Data</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(Actions) ? 
                Actions.map((action,index) => (
                    <tr className="transaction_tr" key={index}>
                      <td>{action.account}</td>
                      <td>{action.name}</td>
                      <td>{action.authorization[0].actor + '@' + action.authorization[0].permission}</td>
                      <td>{JSON.stringify(action.data)}</td>
                    </tr>
                  )) :
                  <tr className="transaction_tr">
                      <td>{Actions.account}</td>
                      <td>{Actions.name}</td>
                      <td>{'eosio@active'}</td>
                      <td>{JSON.stringify(Actions.data)}</td>
                    </tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default Transaction;