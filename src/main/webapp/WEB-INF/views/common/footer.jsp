<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>

<!-- [해봄 공통 푸터 (footer.jsp)] -->
<footer class="site-footer">
    <div class="container d-flex justify-content-between flex-wrap gap-3">
        <div>
            <b>해봄</b>
            <p class="mb-0 mt-1">정부24 생활행정 체험 플랫폼</p>
        </div>
    </div>
</footer>

<!-- 공통 알림/확인/경고 모달 팝업 include -->
<jsp:include page="/WEB-INF/views/common/modal.jsp" />

<!-- 공통 스크립트 라이브러리 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="${pageContext.request.contextPath}/js/app.js"></script>
<script src="${pageContext.request.contextPath}/js/common.js"></script>
