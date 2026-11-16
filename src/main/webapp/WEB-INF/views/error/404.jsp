<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>페이지를 찾을 수 없습니다 | 해봄</title>
    <style>
        :root {
            color-scheme: light;
            font-family: "Pretendard", "Noto Sans KR", Arial, sans-serif;
            color: #18324b;
            background: #f4f8fb;
        }

        * { box-sizing: border-box; }

        body {
            min-width: 320px;
            min-height: 100vh;
            margin: 0;
            display: grid;
            place-items: center;
            padding: 24px;
        }

        .error-card {
            width: min(100%, 620px);
            padding: clamp(32px, 7vw, 64px);
            border: 1px solid #e1eaf1;
            border-radius: 28px;
            background: #fff;
            box-shadow: 0 20px 60px rgb(25 62 92 / 10%);
            text-align: center;
        }

        .error-code {
            margin: 0;
            color: #176b9b;
            font-size: clamp(5rem, 20vw, 9rem);
            font-weight: 800;
            letter-spacing: -.08em;
            line-height: 1;
        }

        .error-label {
            margin: 20px 0 8px;
            color: #47718e;
            font-size: .85rem;
            font-weight: 700;
            letter-spacing: .16em;
        }

        h1 {
            margin: 0;
            font-size: clamp(1.45rem, 5vw, 2rem);
            line-height: 1.4;
        }

        .error-description {
            margin: 14px 0 28px;
            color: #607487;
            line-height: 1.7;
            word-break: keep-all;
        }

        .home-link {
            display: inline-flex;
            min-height: 48px;
            align-items: center;
            justify-content: center;
            padding: 0 24px;
            border-radius: 999px;
            background: #176b9b;
            color: #fff;
            font-weight: 700;
            text-decoration: none;
        }

        .home-link:hover,
        .home-link:focus-visible {
            background: #10577f;
        }

        .home-link:focus-visible {
            outline: 3px solid #9bd7f5;
            outline-offset: 3px;
        }
    </style>
</head>
<body>
    <main class="error-card" aria-labelledby="error-title">
        <p class="error-code" aria-hidden="true">404</p>
        <p class="error-label">PAGE NOT FOUND</p>
        <h1 id="error-title">페이지를 찾을 수 없어요</h1>
        <p class="error-description">
            주소가 잘못 입력되었거나 페이지가 이동 또는 삭제되었을 수 있습니다.
            메인 화면으로 돌아가 다시 이용해 주세요.
        </p>
        <a class="home-link" href="${pageContext.request.contextPath}/">
            해봄 메인으로 이동
        </a>
    </main>
</body>
</html>
