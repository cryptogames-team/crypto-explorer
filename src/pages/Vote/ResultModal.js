import React, {useState, useEffect,useRef, forwardRef, } from 'react';
import { Link } from 'react-router-dom';
import './ResultModal.css';
const ResultModal = forwardRef((props, ref) =>{
    let wrapperRef = useRef(); //모달창 가장 바깥쪽 태그를 감싸주는 역할
    let result = props.VoteResult;
      useEffect(()=>{
        document.addEventListener('mousedown', handleClickOutside);
        return()=>{
          document.removeEventListener('mousedown', handleClickOutside);
        }
      })
      const handleClickOutside=(event)=>{
        if (wrapperRef && !wrapperRef.current.contains(event.target)) {
          props.setModalState(false);
        }
      }
  
      function BtnEvent(){
        props.setModalState(false);
      }
   
        return (
          <div className="modal_container" ref={wrapperRef}>
            <div className='modal_header'>
                <span className='result'>{result}</span>
                <button type='button' className='close_btn' onClick={BtnEvent}>X</button>
            </div>
            <div className='modal_body'>
                <p>{result ==="SUCCESS" ? "TX_ID :" : ""} </p>
                <Link to={`/Transaction/${props.VoteID}`} className="vote_id">
                    {props.VoteID}
                </Link>
                <p>{result === "SUCCESS" ? "실행에 성공하였습니다." : "트랜잭션 실행에 실패하였습니다."}</p>
            </div>
          </div>
        )
    
  });
  
  export default ResultModal;