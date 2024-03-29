import React, { useState, useEffect } from "react";
import "../../styles/common/header.scss";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { auth } from "../../_actions/user_actions";
import { logoutUser } from "../../_actions/user_actions";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //키, 값을 매개변수로 받는 sessionStorage setItem 하는 함수
  const setLoginedItem = (key, value) => {
    if (key === null || value === null) {
      return;
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); //[Yana] 30분 후에 만료

    const item = {
      value: value,
      expiry: now,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  };

  useEffect(() => {
    dispatch(auth()).then((response) => {
      //sessionStorage에 LOGINEDID를 만드는 함수에 response에서 받아온 id넣음
      if (response.payload._id) {
        setLoginedItem("LOGINEDID", response.payload._id);
      }
      if (response.payload._id === null || response.payload._id === "") {
        sessionStorage.clear();
      }
    });
    //로컬스토리지에 LOGINEDID가 있을 경우 실행
    if (sessionStorage.getItem("LOGINEDID")) {
      //로그인된 아이디의 만료시간
      const expireTime = new Date(
        JSON.parse(sessionStorage.getItem("LOGINEDID")).expiry
      );

      //현재시간이 LOGINEDID 만료시간보다 길면 sessionStorage에 있는 LOGINEDID 삭제
      const loginTimeOut = setInterval(() => {
        const nowTime = new Date().getTime();

        if (nowTime > expireTime) {
          sessionStorage.removeItem("LOGINEDID");
          //[야나] 로컬스토리지 값 만료시 자동으로 로그아웃 실행되도록 추가
          onClickHandler();
          //[야나] 실행중인 setInterval무효화
          clearInterval(loginTimeOut);
        }
      }, 300000); //[Yana] 5분마다 재검사
    }
  }, [window.location]);

  const onClickHandler = () => {
    sessionStorage.removeItem("LOGINEDID");
    dispatch(logoutUser()).then((response) => {
      if (response.payload.logoutSucess) {
        location.reload("/");
      } else {
        alert("로그아웃 실패..!");
      }
    });
  };

  // const onClickMypage = () => {
  //   const sendData = {
  //     currentId: JSON.parse(sessionStorage.getItem("LOGINEDID")).value,
  //     sort: sort,
  //     sortBy: sortBy,
  //   };
  //   axios
  //     .post("/api/post/getMypage", sendData)
  //     .then(function (res) {
  //       setMypageList(res.data.mypageList);
  //       setNeedToReciveData(false);
  //     })
  //     .catch((err) => console.log("에러발생" + err));
  // };

  const goMain = () => {
    if (window.location.href === "http://localhost:3000/") {
      location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="headerWrapper">
        <div className="skipNav">
          <Link to="/">홈 바로가기</Link>
        </div>
        <div className="logo" onClick={goMain}>
          <img src={require("../../img/common/logo.png")} alt="logo" />
        </div>
        <div className="headerRight">
          {sessionStorage.getItem("LOGINEDID") ? (
            <Link to="/mypage" className="headLink">
              my page
            </Link>
          ) : (
            <Link to="/Login" className="headLink">
              my page
            </Link>
          )}
          {sessionStorage.getItem("LOGINEDID") ? (
            <a href="#" className="headLink" onClick={onClickHandler}>
              logout
            </a>
          ) : (
            <Link to="/Login" className="headLink">
              log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
