import { stringUtils } from '../utils/helpers';

//destructuring assignment
const { isEmpty, safeTrim } = stringUtils;

// 유효성 검사 모듈 - 구조분해할당과 화살표 함수 사용

// 정규식 패턴들 - 각 필드의 유효한 형식을 정의
export const patterns = {
    // 학번 패턴: 영문 1글자 + 숫자 5글자 (예: S12345, A98765)
    // ^ : 문자열 시작, [A-Za-z] : 대소문자 영문 1글자, \d{5} : 숫자 5개, $ : 문자열 끝
    studentNumber: /^[A-Za-z]\d{5}$/,
    
    // 전화번호 패턴: 숫자, 하이픈(-), 공백만 허용 (예: 010-1234-5678, 02 123 4567)
    // [0-9-\s] : 숫자, 하이픈, 공백문자, + : 1개 이상
    phoneNumber: /^[0-9-\s]+$/,
    
    // 이메일 패턴: 기본적인 이메일 형식 검증 (예: user@domain.com)
    // [^\s@]+ : 공백과 @가 아닌 문자 1개 이상, @ : @ 기호, \. : 점(.) 문자
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}

// 에러 메시지들을 타입별로 분류하여 관리
export const messages = {
    // 필수 입력 필드가 비어있을 때 표시할 메시지들
    required: {
        name: '이름을 입력해주세요.',
        studentNumber: '학번을 입력해주세요.',
        address: '주소를 입력해주세요.',
        phoneNumber: '전화번호를 입력해주세요.',
        email: '이메일을 입력해주세요.'
    },
    
    // 입력 형식이 올바르지 않을 때 표시할 메시지들
    format: {
        studentNumber: '학번은 영문(1글자) + 숫자(5자리)로 입력해주세요. 예: S12345',
        phoneNumber: '올바른 전화번호 형식이 아닙니다. 예: 010-1234-5678',
        email: '올바른 이메일 형식이 아닙니다. 예: user@example.com'
    }
}

// 개별 필드별 검증 함수들을 담은 객체 (화살표 함수 사용)
const validators = {
    // 이름 필드 검증 함수
    name: (name) => {
        // 1단계: 필수 입력 확인 - 값이 없거나 공백만 있는 경우
        // !name : null, undefined, 빈 문자열을 체크
        // name.trim().length === 0 : 공백만 있는 문자열을 체크
        if (isEmpty(name)) {
            return { 
                isValid: false,                    // 검증 실패
                message: messages.required.name,   // 에러 메시지
                field: 'name'                      // 문제가 발생한 필드명
            }
        }
        
        // 2단계: 최소 길이 확인 - 이름은 최소 2글자 이상이어야 함
        if (safeTrim(name).length < 2) {
            return { 
                isValid: false, 
                message: '이름은 최소 2글자 이상이어야 합니다.', 
                field: 'name' 
            }
        }
        
        // 3단계: 모든 검증 통과
        return { isValid: true }
    },
    
    // 학번 필드 검증 함수
    studentNumber: (studentNumber) => {
        // 1단계: 필수 입력 확인
        if (isEmpty(studentNumber)) {
            return { 
                isValid: false, 
                message: messages.required.studentNumber, 
                field: 'studentNumber' 
            }
        }
        
        // 2단계: 정규식 패턴 매칭 확인
        // patterns.studentNumber.test() : 정규식이 문자열과 매치되는지 확인 (true/false 반환)
        // .trim() : 앞뒤 공백 제거 후 검사
        if (!patterns.studentNumber.test(safeTrim(studentNumber))) {
            return { 
                isValid: false, 
                message: messages.format.studentNumber, 
                field: 'studentNumber' 
            }
        }
        
        // 3단계: 모든 검증 통과
        return { isValid: true }
    },
    
    // 주소 필드 검증 함수
    address: (address) => {
        // 1단계: 필수 입력 확인
        if (isEmpty(address)) {
            return { 
                isValid: false, 
                message: messages.required.address, 
                field: 'address' 
            }
        }
        
        // 2단계: 최소 길이 확인 - 주소는 너무 짧으면 유효하지 않을 가능성이 높음
        if (safeTrim(address).length < 5) {
            return { 
                isValid: false, 
                message: '주소는 최소 5글자 이상 입력해주세요.', 
                field: 'address' 
            }
        }
        
        // 3단계: 모든 검증 통과
        return { isValid: true }
    },
    
    // 전화번호 필드 검증 함수
    phoneNumber: (phoneNumber) => {
        // 1단계: 필수 입력 확인
        if (isEmpty(phoneNumber)) {
            return { 
                isValid: false, 
                message: messages.required.phoneNumber, 
                field: 'phoneNumber' 
            }
        }
        
        // 2단계: 전화번호 형식 확인 - 숫자, 하이픈, 공백만 허용
        if (!patterns.phoneNumber.test(safeTrim(phoneNumber))) {
            return { 
                isValid: false, 
                message: messages.format.phoneNumber, 
                field: 'phoneNumber' 
            }
        }
        
        // 3단계: 모든 검증 통과
        return { isValid: true }
    },
    
    // 이메일 필드 검증 함수
    email: (email) => {
        // 1단계: 필수 입력 확인
        if (isEmpty(mail)) {
            return { 
                isValid: false, 
                message: messages.required.email, 
                field: 'email' 
            }
        }
        
        // 2단계: 이메일 형식 확인 - 기본적인 이메일 패턴 매칭
        if (!patterns.email.test(safeTrim(email))) {
            return { 
                isValid: false, 
                message: messages.format.email, 
                field: 'email' 
            }
        }
        
        // 3단계: 모든 검증 통과
        return { isValid: true }
    }
}

// 메인 검증 함수 - 학생 객체 전체를 검증 (구조분해할당 사용)
export const validateStudent = (student) => {
    // 1단계: 입력 데이터 자체가 존재하는지 확인
    if (!student) {
        return { isValid: false, message: '학생 데이터가 필요합니다.' }
    }
    
    // 2단계: 구조분해할당으로 필요한 데이터 추출
    // student 객체에서 name, studentNumber, detailRequest 속성을 추출
    const { name, studentNumber, detailRequest } = student
    
    // 3단계: 기본 필드들 순차적 검증 (name, studentNumber)
    
    // 이름 검증
    const nameResult = validators.name(name)
    if (!nameResult.isValid) {
        return nameResult  // 검증 실패 시 즉시 결과 반환 (Early Return 패턴)
    }
    
    // 학번 검증
    const studentNumberResult = validators.studentNumber(studentNumber)
    if (!studentNumberResult.isValid) {
        return studentNumberResult  // 검증 실패 시 즉시 결과 반환
    }
    
    // 4단계: 상세 정보(detailRequest)가 있는 경우에만 세부 검증 수행
    if (detailRequest) {
        // 구조분해할당으로 상세 정보에서 필요한 필드들 추출
        const { address, phoneNumber, email } = detailRequest
        
        // 주소 검증
        const addressResult = validators.address(address)
        if (!addressResult.isValid) {
            return addressResult  // 검증 실패 시 즉시 결과 반환
        }
        
        // 전화번호 검증
        const phoneResult = validators.phoneNumber(phoneNumber)
        if (!phoneResult.isValid) {
            return phoneResult  // 검증 실패 시 즉시 결과 반환
        }
        
        // 이메일 검증
        const emailResult = validators.email(email)
        if (!emailResult.isValid) {
            return emailResult  // 검증 실패 시 즉시 결과 반환
        }
    }
    
    // 5단계: 모든 검증을 통과한 경우
    return { isValid: true }
}

// 실시간 검증 함수 - 사용자가 입력하는 중에 개별 필드를 검증할 때 사용
export const validateField = (fieldName, value) => {
    // 1단계: 해당 필드명에 대응하는 검증 함수가 있는지 확인
    // validators 객체에서 fieldName에 해당하는 함수를 찾음
    const validator = validators[fieldName]
    
    // 2단계: 검증 함수가 없는 경우 (잘못된 필드명)
    if (!validator) {
        return { 
            isValid: true,  // 알 수 없는 필드는 일단 통과로 처리
            message: '알 수 없는 필드입니다.' 
        }
    }
    
    // 3단계: 해당 검증 함수 실행하여 결과 반환
    return validator(value)
}

/*
사용 예시:

// 전체 학생 데이터 검증
const studentData = {
    name: '홍길동',
    studentNumber: 'S12345',
    detailRequest: {
        address: '서울시 강남구',
        phoneNumber: '010-1234-5678',
        email: 'hong@example.com'
    }
}

const result = validateStudent(studentData)
if (!result.isValid) {
    console.log(`검증 실패: ${result.message}`)
    console.log(`문제 필드: ${result.field}`)
}

// 개별 필드 검증 (실시간 검증용)
const emailResult = validateField('email', 'invalid-email')
if (!emailResult.isValid) {
    console.log(`이메일 오류: ${emailResult.message}`)
}
*/