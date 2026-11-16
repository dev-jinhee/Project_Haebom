<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="_csrf" content="${_csrf.token}">
    <meta name="_csrf_header" content="${_csrf.headerName}">
    <title><tiles:insertAttribute name="title" ignore="true" /></title>
    <tiles:insertAttribute name="head" ignore="true" />
</head>
<tiles:useAttribute name="bodyClass" id="bodyClass" classname="java.lang.String" ignore="true" />
<body class="${bodyClass}">
    <tiles:insertAttribute name="header" ignore="true" />
    <tiles:insertAttribute name="content" />
    <tiles:insertAttribute name="footer" ignore="true" />
    <tiles:insertAttribute name="scripts" ignore="true" />
</body>
</html>
