// API 서비스 모듈 - async/await와 구조분해할당 사용

// 서버 API의 기본 URL 주소
// 실제 배포 시에는 환경변수나 설정 파일로 관리하는 것이 좋음
const API_BASE_URL = 'http://localhost:8080'

// HTTP 요청을 위한 공통 함수 (async/await)
// 모든 API 호출에서 공통으로 사용되는 로직을 한곳에 모아둠 (DRY 원칙)
const request = async (endpoint, options = {}) => {
    // 1단계: 전체 URL 생성
    // 예: '/api/students' + 'http://localhost:8080' = 'http://localhost:8080/api/students'
    const url = `${API_BASE_URL}${endpoint}`
    
    // 2단계: 요청 옵션 설정 (구조분해할당과 기본값)
    // options 객체에서 필요한 값들을 추출하고, 없으면 기본값 사용
    const { method = 'GET', body, headers = {} } = options
    
    // 3단계: fetch API에 전달할 최종 옵션 객체 생성
    const requestOptions = {
        method,                          // HTTP 메서드 (GET, POST, PUT, DELETE)
        headers: {
            'Content-Type': 'application/json',  // JSON 데이터 전송을 위한 헤더
            ...headers                   // 추가 헤더가 있으면 병합 (스프레드 연산자)
        }
    }
    
    // 4단계: 요청 본문(body)이 있는 경우 JSON 문자열로 변환하여 추가
    // POST, PUT 요청 시 서버로 보낼 데이터
    if (body) {
        requestOptions.body = JSON.stringify(body)  // JavaScript 객체 → JSON 문자열
    }
    
    try {
        // 5단계: 개발자를 위한 로그 출력 (디버깅 목적)
        console.log(`API 요청: ${method} ${url}`)
        
        // 6단계: 실제 HTTP 요청 실행 (비동기)
        // await: fetch가 완료될 때까지 기다림
        const response = await fetch(url, requestOptions)
        
        // 7단계: 응답 상태 확인 (성공/실패 판단)
        // response.ok: 상태코드가 200-299 범위면 true, 아니면 false
        if (!response.ok) {
            // 실패한 경우: 서버에서 보낸 에러 정보를 JSON으로 파싱
            const errorData = await response.json()
            
            // 사용자 친화적인 에러 메시지 생성
            const errorMessage = getErrorMessage(response.status, errorData)
            
            // Error 객체를 생성하여 throw (catch 블록에서 처리됨)
            throw new Error(errorMessage)
        }
        
        // 8단계: DELETE 요청은 보통 응답 body가 없으므로 null 반환
        if (method === 'DELETE') {
            return null
        }
        
        // 9단계: 성공한 경우 응답 데이터를 JSON으로 파싱하여 반환
        return await response.json()  // JSON 문자열 → JavaScript 객체
        
    } catch (error) {
        // 10단계: 오류 처리 및 로깅
        console.error('API 요청 오류:', error)
        
        // 11단계: 네트워크 오류인 경우 특별 처리
        // TypeError: 네트워크 연결 실패, CORS 오류 등에서 발생
        if (error.name === 'TypeError') {
            throw new Error('네트워크 연결을 확인해주세요.')
        }
        
        // 12단계: 기타 오류는 그대로 상위로 전달
        throw error
    }
}

// 에러 메시지 생성 함수 (화살표 함수)
// HTTP 상태 코드에 따라 사용자가 이해하기 쉬운 메시지로 변환
const getErrorMessage = (status, errorData) => {
    // 서버에서 보낸 메시지가 있으면 사용하고, 없으면 기본 메시지
    const serverMessage = errorData.message || '알 수 없는 오류가 발생했습니다.'
    
    // HTTP 상태 코드별 메시지 처리
    // 각 상태코드의 의미:
    // 400: Bad Request - 잘못된 요청 형식
    // 404: Not Found - 리소스를 찾을 수 없음
    // 409: Conflict - 데이터 중복 등의 충돌
    // 500: Internal Server Error - 서버 내부 오류
    
    if (status === 400) {
        return `입력데이터 오류: ${serverMessage}`
    }
    if (status === 404) {
        return `데이커가 존재하지 않음: ${serverMessage}`
    }
    if (status === 409) {
        return `중복 오류: ${serverMessage}`
    }
    if (status === 500) {
        return `서버 오류: ${serverMessage}`
    }
    
    // 위에 정의되지 않은 상태코드는 일반 형식으로 반환
    return `오류 (${status}): ${serverMessage}`
}

// API 서비스 객체 - 모든 학생 관련 API 호출을 담당
export const apiService = {
    // 학생 목록 조회 (async/await)
    // GET /api/students - 모든 학생 정보를 배열로 반환
    getStudents: async () => {
        // request 함수 호출 시 method를 지정하지 않으면 기본값 'GET' 사용
        return await request('/api/students')
    },
    
    // 특정 학생 조회 (async/await)  
    // GET /api/students/{studentId} - ID로 특정 학생 정보 반환
    getStudent: async (studentId) => {
        // 1단계: 입력값 검증 - 방어적 프로그래밍
        if (!studentId) {
            throw new Error('학생 ID가 필요합니다.')
        }
        
        // 2단계: 동적 URL 생성하여 요청
        // 예: studentId가 1이면 '/api/students/1'
        return await request(`/api/students/${studentId}`)
    },
    
    // 학생 생성 (async/await)
    // POST /api/students - 새로운 학생 정보를 서버에 저장
    createStudent: async (studentData) => {
        // 1단계: 입력값 검증
        if (!studentData) {
            throw new Error('학생 데이터가 필요합니다.')
        }
        
        // 2단계: POST 요청으로 데이터 전송
        // body에 studentData를 포함하여 서버로 전송
        return await request('/api/students', {
            method: 'POST',
            body: studentData
        })
    },
    
    // 학생 수정 (async/await)
    // PUT /api/students/{studentId} - 기존 학생 정보를 전체적으로 수정
    updateStudent: async (studentId, studentData) => {
        // 1단계: 입력값 검증 - 두 개의 매개변수 모두 필요
        if (!studentId) {
            throw new Error('학생 ID가 필요합니다.')
        }
        if (!studentData) {
            throw new Error('학생 데이터가 필요합니다.')
        }
        
        // 2단계: PUT 요청으로 데이터 수정
        // PUT: 리소스 전체를 교체 (PATCH: 부분 수정)
        return await request(`/api/students/${studentId}`, {
            method: 'PUT',
            body: studentData
        })
    },
    
    // 학생 삭제 (async/await)
    // DELETE /api/students/{studentId} - 특정 학생 정보를 서버에서 삭제
    deleteStudent: async (studentId) => {
        // 1단계: 입력값 검증
        if (!studentId) {
            throw new Error('학생 ID가 필요합니다.')
        }
        
        // 2단계: DELETE 요청 실행
        // DELETE 요청은 body가 필요 없으므로 method만 지정
        return await request(`/api/students/${studentId}`, {
            method: 'DELETE'
        })
    }
}

/*
사용 예시:

try {
    // 모든 학생 조회
    const students = await apiService.getStudents()
    console.log('학생 목록:', students)
    
    // 특정 학생 조회
    const student = await apiService.getStudent(1)
    console.log('학생 정보:', student)
    
    // 새 학생 등록
    const newStudent = {
        name: '김철수',
        studentNumber: 'S12345',
        detailRequest: {
            address: '서울시 강남구',
            phoneNumber: '010-1234-5678',
            email: 'kim@example.com'
        }
    }
    const created = await apiService.createStudent(newStudent)
    console.log('등록 완료:', created)
    
} catch (error) {
    console.error('API 호출 실패:', error.message)
}
*/