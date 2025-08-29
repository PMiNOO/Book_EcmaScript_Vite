## 프로젝트 구조

```
book-es6-vite/
├── index.html
├── package.json  
├── vite.config.js
└── src/
    ├── main.js              # 메인 앱 로직
    ├── modules/
    │   ├── api.js           # API 통신 담당
    │   ├── validation.js    # 유효성 검사 담당
    │   └── ui.js            # UI 관리 담당
    ├── utils/
    │   └── helpers.js       # 유틸리티 함수들
    └── css/
        └── style.css        # 스타일시트
```