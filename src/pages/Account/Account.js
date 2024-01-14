import { useParams,Link,useNavigate } from 'react-router-dom';
import './Account.css';
import { JsonRpc } from 'eosjs';
import { useEffect, useState } from 'react';
import Hep_logo from '../../assets/hep_logo.png'
import wallet from '../../assets/wallet.png'
import transaction_img from '../../assets/account_transactions.png'


const Account = () => {
  const navigate = useNavigate();
const {AccountName} = useParams();
const [CreateDate, setCreateDate] = useState('');
const [Balance, setBalance] = useState('');
const [Available, setAvailable] = useState('');
const [Refunding, setRefunding] = useState('');
const [CPU_Staked, setCPU_Staked] = useState('');
const [NET_Staked, setNET_Staked] = useState('');
const [Rex, setRex] = useState('');
const [Ram_Limit, setRam_Limit] = useState('');
const [Ram_used, setRam_used] = useState('');
const [CPU_Limit, setCPU_Limit] = useState('');
const [CPU_used, setCPU_used] = useState('');
const [Net_Limit, setNet_Limit] = useState('');
const [Net_used, setNet_used] = useState('');
const [ram_per, setram_per] = useState('');
const [cpu_per, setcpu_per] = useState('');
const [net_per, setnet_per] = useState('');
const [Actions, setActions] = useState([]);
useEffect(()=>{
  const fetchDataFromHep = async () => {
    const rpc = new JsonRpc('https://heptagon-producer1.store');
    let actions = null;
    let actionsLength = 0;
    while(actionsLength < 1){
      try {
        actions = await rpc.history_get_actions(AccountName);
        break;
      }catch {
        //await new Promise(resolve => setTimeout(resolve,1000));
      }
    }
    try {
      const account = await rpc.get_account(AccountName);
      setActions(actions.actions)
      let core_balance = parseInt(account.core_liquid_balance);
      console.log(account)
      let cpu_stake = '∞';
      let net_stake = '∞';
      let total_balance = core_balance.toLocaleString();
      if(AccountName != 'eosio'){
        cpu_stake = parseInt(account.total_resources.cpu_weight);
        net_stake = parseInt(account.total_resources.net_weight);
        total_balance = (core_balance + cpu_stake + net_stake).toLocaleString();
      }
        
     
      setCreateDate(account.created);
      setBalance(total_balance);
      setAvailable(core_balance);
      setCPU_Staked(cpu_stake);
      setNET_Staked(net_stake);
      setRam_Limit(account.ram_quota);
      setRam_used(account.ram_usage);
      setCPU_Limit(parseInt(account.cpu_limit.max));
      setCPU_used(parseInt(account.cpu_limit.used));
      setNet_Limit(parseInt(account.net_limit.max));
      setNet_used(parseInt(account.net_limit.used));
      setram_per((parseInt(Ram_used) / parseInt(Ram_Limit)) * 100);
      setcpu_per((parseInt(CPU_used) / parseInt(CPU_Limit)) * 100);
      setnet_per((parseInt(Net_used) / parseInt(Net_Limit)) * 100);

      console.log(Ram_Limit)
      if(account.refund_request != null){
        setRefunding(parseInt(account.refund_request.cpu_amount) + parseInt(account.refund_request.net_amount));
      }else {
        setRefunding(0);
      }
      if(account.rex_info != null){
        setRex(account.rex_info);
      }else{
        setRex(0);
      }
      if(AccountName === 'eosio'){
        setcpu_per(100)
        setnet_per(100)
        setram_per(100)
        setRam_Limit('∞');
        setRam_used('∞');
        setCPU_Limit('∞');
        setCPU_used('∞');
        setNet_Limit('∞');
        setNet_used('∞');
      }
      console.log(account);
      console.log(Actions)
    } catch (error) {
      console.error('Error fetching data from server:', error);
      //navigate('/AccountError');
    }
  };
  fetchDataFromHep();
},[AccountName,ram_per]);

    return (
      <div className='all_container'>
        <div className='account_info_container_all'>
          <div className='account_info_container'>
            <div className='account_name_info_container'>
              <img src={Hep_logo}></img>
              <div className='account_name_info'>
                <span className='account_name'>{AccountName}</span>
                <span className='create_date'>{CreateDate}</span>
              </div>
            </div>
            <div className='account_balance_info'>
              <span className='total_balance_text'>Total HeP Balance:&nbsp;&nbsp;&nbsp;  </span>
              <span className='total_balance'>{Balance} HEP</span>
            </div>
          </div>
        </div>

        <div className='resource_container'>
          <div className='resource_title'>
            <h2 className='resource_title_h2'>
            <img className='wallet_img' src={wallet}></img>
            <span className='Resources_text'>Resources</span>
            </h2>
          </div>
          <div className='resource_all_data_container'>
            <div className='resource_data_container'>
              <table className='resource_table'>
                <tbody>
                <tr>
                  <td className='resource_text'>Available:</td>
                  <td className='resource_info'>{Available.toLocaleString()}&nbsp;HEP</td>
                </tr>
                <tr>
                  <td className='resource_text'>Refunding:</td>
                  <td className='resource_info'>{Refunding.toLocaleString()}&nbsp;HEP</td>
                </tr>
                <tr>
                  <td className='resource_text'>CPU Staked:</td>
                  <td className='resource_info'>{CPU_Staked.toLocaleString()}&nbsp;HEP</td>
                </tr>
                <tr>
                  <td className='resource_text'>NET Staked:</td>
                  <td className='resource_info'>{(NET_Staked).toLocaleString()}&nbsp;HEP</td>
                </tr>
                <tr>
                  <td className='resource_text'>Staked by Others:</td>
                  <td className='resource_info'>0&nbsp;HEP</td>
                </tr>
                <tr>
                  <td className='resource_text'>Total REX:</td>
                  <td className='resource_info'>{Rex.toLocaleString()}&nbsp;HEP</td>
                </tr>
                </tbody>
              </table>  
            </div>
            <div className='resource_graph'>
              <div className='ram_container'>
                <span className='ram_title'>RAM:</span>
                <div className='ram_chart_container' style={{ width: '100%',height:'25px', backgroundColor:'#0000001A',borderRadius:5 }}>
                  <div className='ram_chart_data' style={{ width: `${parseInt(ram_per)}%` ,height:'25px',minWidth: '10px',backgroundColor:'#00B5AD',borderRadius:5,textAlign:'end',justifyContent:'center',color:'white'}}>{parseInt(ram_per)}%</div>
                </div>
              </div>
              <div className='ram_lable'> Ram used - {Ram_used.toLocaleString()}KB / {Ram_Limit.toLocaleString()}KB</div>
              <div className='cpu_container'>
              <span className='cpu_title'>CPU:</span>
                <div className='cpu_chart_container'  style={{ width: '100%',height:'25px', backgroundColor:'#0000001A' ,borderRadius:5}}>
                  <div className='cpu_chart_data' style={{ width: `${parseInt(cpu_per)}%` ,height:'25px',minWidth: '10px',backgroundColor:'#2185D0',borderRadius:5,textAlign:'end',justifyContent:'center',color:'white'}}><p>{parseInt(cpu_per)}%</p></div>
                </div>
              </div>
              <div className='cpu_lable'>CPU used - {CPU_used.toLocaleString()}µs / {CPU_Limit.toLocaleString()}µs</div>
              <div className='net_container'>
              <span className='net_title'>NET:</span>
                <div className='net_chart_container' style={{ width: '100%',height:'25px', backgroundColor:'#0000001A' ,borderRadius:5}}>
                  <div className='net_chart_data' style={{ width: `${parseInt(net_per)}%` ,height:'25px',minWidth: '10px',backgroundColor:'#21BA45',borderRadius:5,textAlign:'end',justifyContent:'center',color:'white'}}>{parseInt(net_per)}%</div>
                </div>
              </div>
              <div className='net_lable'>NET used - {Net_used.toLocaleString()} Bytes / {Net_Limit.toLocaleString()}Bytes</div>
            </div>
          </div>
        </div>

        <div className='transactions_container'>
          <div className='transactions_header'>
            <img src={transaction_img} className='transaction_img'></img>
            <h2 className='transaction_text'>&nbsp;&nbsp;Transactions</h2>
          </div>
          <div className='transactions_data_container'>
            <table className='transaction_table'>
              <thead>
                <tr>
                  <th className='tx_th'>TX</th>
                  <th className='date_th'>Date</th>
                  <th className='action_th'>Action</th>
                  <th className='data_th'>Data</th>
                  <th className='memo_th'>Memo</th>
                </tr>
              </thead>
              <tbody>
                {Actions.map((action, index)=>(
                  <tr key={index}>
                    <td>
                    <Link to={`/Transaction/${action.action_trace.trx_id}`} className="arrow" >{action.action_trace.trx_id}</Link>
                    </td>
                    <td>
                      {action.block_time}
                    </td>
                    <td>
                     {action.action_trace.act.name}
                    </td>
                    <td>
                    {action.action_trace.act.data.from} {action.action_trace.act.name === 'transfer' ? '→' : ''} {action.action_trace.act.data.to} {action.action_trace.act.data.quantity}

                    </td>
                    <td>
                    {action.action_trace.act.data.memo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default Account;