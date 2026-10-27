<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>해봄 | 도로명주소 검색</title>
</head>
<body>
    <p id="popupStatus">도로명주소 검색창을 연결하고 있습니다.</p>

    <!-- 초기 요청에는 confmKey/returnUrl로 공식 팝업 호출,
         주소 선택 후에는 inputYn=Y와 주소 결과가 이 페이지로 POST됨 -->
    <form id="jusoForm" method="post">
        <input type="hidden" name="confmKey" id="confmKey" value="<c:out value='${jusoConfirmKey}' />">
        <input type="hidden" name="returnUrl" id="returnUrl">
        <input type="hidden" name="resultType" value="4">
    </form>

    <!-- HTML attribute 문맥에서는 c:out으로 이스케이프 후 value로 읽음 (JS 문자열에 직접 삽입하지 않음) -->
    <input type="hidden" id="inputYn" value="<c:out value='${param.inputYn}' />">
    <input type="hidden" id="roadFullAddr" value="<c:out value='${param.roadFullAddr}' />">
    <input type="hidden" id="addrDetail" value="<c:out value='${param.addrDetail}' />">
    <input type="hidden" id="roadAddrPart1" value="<c:out value='${param.roadAddrPart1}' />">
    <input type="hidden" id="jibunAddr" value="<c:out value='${param.jibunAddr}' />">
    <input type="hidden" id="zipNo" value="<c:out value='${param.zipNo}' />">
    <input type="hidden" id="admCd" value="<c:out value='${param.admCd}' />">
    <input type="hidden" id="rnMgtSn" value="<c:out value='${param.rnMgtSn}' />">
    <input type="hidden" id="bdMgtSn" value="<c:out value='${param.bdMgtSn}' />">
    <input type="hidden" id="siNm" value="<c:out value='${param.siNm}' />">
    <input type="hidden" id="sggNm" value="<c:out value='${param.sggNm}' />">
    <input type="hidden" id="emdNm" value="<c:out value='${param.emdNm}' />">
    <input type="hidden" id="udrtYn" value="<c:out value='${param.udrtYn}' />">
    <input type="hidden" id="buldMnnm" value="<c:out value='${param.buldMnnm}' />">
    <input type="hidden" id="buldSlno" value="<c:out value='${param.buldSlno}' />">

    <script>
        (function () {
            const val = id => document.getElementById(id).value;
            const status = document.getElementById("popupStatus");

            if (val("inputYn") === "Y") {
                const result = {
                    roadFullAddr: val("roadFullAddr"),
                    roadAddrPart1: val("roadAddrPart1"),
                    addrDetail: val("addrDetail"),
                    jibunAddr: val("jibunAddr"),
                    zipNo: val("zipNo"),
                    admCd: val("admCd"),
                    rnMgtSn: val("rnMgtSn"),
                    bdMgtSn: val("bdMgtSn"),
                    siNm: val("siNm"),
                    sggNm: val("sggNm"),
                    emdNm: val("emdNm"),
                    udrtYn: val("udrtYn"),
                    buldMnnm: val("buldMnnm"),
                    buldSlno: val("buldSlno")
                };

                if (window.opener && !window.opener.closed &&
                    typeof window.opener.jusoCallBack === "function") {
                    window.opener.jusoCallBack(result);
                    window.close();
                } else {
                    status.textContent = "주소를 전달할 원래 화면을 찾을 수 없습니다. 해봄 4단계에서 다시 검색해 주세요.";
                }
                return;
            }

            const form = document.getElementById("jusoForm");
            document.getElementById("returnUrl").value = window.location.href;
            form.action = "https://business.juso.go.kr/addrlink/addrLinkUrl.do";
            form.submit();
        })();
    </script>
</body>
</html>
