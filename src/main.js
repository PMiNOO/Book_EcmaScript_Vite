// CSS 파일 불러오기
import './css/style.css'

// 전역 변수들
const API_BASE_URL = 'http://localhost:8080'
let editingStudentId = null

// DOM 요소들
let studentForm
let studentTableBody
let submitButton
let cancelButton
let formErrorSpan

// 페이지가 로드되면 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지가 로드되었습니다.')
    
    // DOM 요소들 찾기
    studentForm = document.getElementById('studentForm')
    studentTableBody = document.getElementById('studentTableBody')
    submitButton = document.querySelector('button[type="submit"]')
    cancelButton = document.querySelector('.cancel-btn')
    formErrorSpan = document.getElementById('formError')
    
    // 이벤트 설정
    setupEvents()
    
    // 학생 목록 불러오기
    loadStudents()
})

// 이벤트 설정하는 함수
function setupEvents() {
    // 폼 제출 이벤트
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault()
        handleFormSubmit()
    })
    
    // 취소 버튼 이벤트
    cancelButton.addEventListener('click', function() {
        resetForm()
    })
}

// 폼 제출 처리하는 함수
function handleFormSubmit() {
    console.log('폼이 제출되었습니다.')
    
    // 폼 데이터 가져오기
    const formData = new FormData(studentForm)
    
    // 학생 데이터 객체 만들기
    const studentData = {
        name: formData.get('name').trim(),
        studentNumber: formData.get('studentNumber').trim(),
        detailRequest: {
            address: formData.get('address').trim(),
            phoneNumber: formData.get('phoneNumber').trim(),
            email: formData.get('email').trim(),
            dateOfBirth: formData.get('dateOfBirth') || null
        }
    }
    
    // 입력값 검증
    if (!checkStudentData(studentData)) {
        return
    }
    
    console.log('검증 완료된 데이터:', studentData)
    
    // 수정 모드인지 확인
    if (editingStudentId) {
        updateStudent(editingStudentId, studentData)
    } else {
        createStudent(studentData)
    }
}

// 학생 데이터 검증하는 함수
function checkStudentData(student) {
    // 이름 확인
    if (!student.name) {
        showErrorMessage('이름을 입력해주세요.')
        focusOnField('name')
        return false
    }
    
    // 학번 확인
    if (!student.studentNumber) {
        showErrorMessage('학번을 입력해주세요.')
        focusOnField('studentNumber')
        return false
    }
    
    // 학번 형식 확인 (영문 1글자 + 숫자 5글자)
    if (!isValidStudentNumber(student.studentNumber)) {
        showErrorMessage('학번은 영문(1글자) + 숫자(5글자)로 입력해주세요. 예: S12345')
        focusOnField('studentNumber')
        return false
    }
    
    // 주소 확인
    if (!student.detailRequest.address) {
        showErrorMessage('주소를 입력해주세요.')
        focusOnField('address')
        return false
    }
    
    // 전화번호 확인
    if (!student.detailRequest.phoneNumber) {
        showErrorMessage('전화번호를 입력해주세요.')
        focusOnField('phoneNumber')
        return false
    }
    
    // 전화번호 형식 확인
    if (!isValidPhoneNumber(student.detailRequest.phoneNumber)) {
        showErrorMessage('올바른 전화번호 형식이 아닙니다. 예: 010-1234-5678')
        focusOnField('phoneNumber')
        return false
    }
    
    // 이메일 확인
    if (!student.detailRequest.email) {
        showErrorMessage('이메일을 입력해주세요.')
        focusOnField('email')
        return false
    }
    
    // 이메일 형식 확인
    if (!isValidEmail(student.detailRequest.email)) {
        showErrorMessage('올바른 이메일 형식이 아닙니다. 예: user@example.com')
        focusOnField('email')
        return false
    }
    
    return true
}

// 학번 형식 검사 함수
function isValidStudentNumber(studentNumber) {
    // 정규식: 영문 1글자 + 숫자 5글자
    const pattern = /^[A-Za-z]\d{5}$/
    return pattern.test(studentNumber)
}

// 전화번호 형식 검사 함수
function isValidPhoneNumber(phoneNumber) {
    // 정규식: 숫자, 하이픈, 공백만 허용
    const pattern = /^[0-9-\s]+$/
    return pattern.test(phoneNumber)
}

// 이메일 형식 검사 함수
function isValidEmail(email) {
    // 정규식: 기본적인 이메일 형식
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email)
}

// 특정 필드에 포커스 주는 함수
function focusOnField(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`)
    if (field) {
        field.focus()
    }
}

// 새 학생 등록 함수
function createStudent(studentData) {
    console.log('학생 등록 시작')
    
    // 버튼 비활성화
    setButtonState(true, '등록 중...')
    
    // 서버에 데이터 보내기
    fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(error) {
                throw new Error(error.message || '학생 등록에 실패했습니다.')
            })
        }
        return response.json()
    })
    .then(function(result) {
        console.log('등록 성공:', result)
        showSuccessMessage('학생이 성공적으로 등록되었습니다!')
        studentForm.reset()
        loadStudents()
    })
    .catch(function(error) {
        console.error('등록 오류:', error)
        showErrorMessage(error.message)
    })
    .finally(function() {
        setButtonState(false, '학생 등록')
    })
}

// 학생 정보 수정 함수
function updateStudent(studentId, studentData) {
    console.log('학생 수정 시작:', studentId)
    
    // 버튼 비활성화
    setButtonState(true, '수정 중...')
    
    // 서버에 데이터 보내기
    fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(error) {
                throw new Error(error.message || '학생 수정에 실패했습니다.')
            })
        }
        return response.json()
    })
    .then(function(result) {
        console.log('수정 성공:', result)
        showSuccessMessage('학생이 성공적으로 수정되었습니다!')
        resetForm()
        loadStudents()
    })
    .catch(function(error) {
        console.error('수정 오류:', error)
        showErrorMessage(error.message)
    })
    .finally(function() {
        setButtonState(false, '학생 등록')
    })
}

// 학생 삭제 함수 (전역 함수로 만들어야 HTML onclick에서 호출 가능)
window.deleteStudent = function(studentId, studentName) {
    if (!confirm(`이름 = ${studentName} 학생을 정말로 삭제하시겠습니까?`)) {
        return
    }
    
    console.log('학생 삭제 시작:', studentId)
    
    // 서버에서 삭제하기
    fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'DELETE'
    })
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(error) {
                throw new Error(error.message || '학생 삭제에 실패했습니다.')
            })
        }
        console.log('삭제 성공')
        showSuccessMessage('학생이 성공적으로 삭제되었습니다!')
        loadStudents()
    })
    .catch(function(error) {
        console.error('삭제 오류:', error)
        showErrorMessage(error.message)
    })
}

// 학생 편집 모드로 전환 함수 (전역 함수)
window.editStudent = function(studentId) {
    console.log('학생 편집 시작:', studentId)
    
    // 서버에서 학생 정보 가져오기
    fetch(`${API_BASE_URL}/api/students/${studentId}`)
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(error) {
                throw new Error(error.message || '학생 정보를 가져올 수 없습니다.')
            })
        }
        return response.json()
    })
    .then(function(student) {
        console.log('학생 정보:', student)
        fillFormWithStudentData(student)
        setEditMode(studentId)
    })
    .catch(function(error) {
        console.error('편집 오류:', error)
        showErrorMessage(error.message)
    })
}

// 폼에 학생 데이터 채우는 함수
function fillFormWithStudentData(student) {
    studentForm.name.value = student.name || ''
    studentForm.studentNumber.value = student.studentNumber || ''
    
    if (student.detail) {
        studentForm.address.value = student.detail.address || ''
        studentForm.phoneNumber.value = student.detail.phoneNumber || ''
        studentForm.email.value = student.detail.email || ''
        studentForm.dateOfBirth.value = student.detail.dateOfBirth || ''
    }
}

// 편집 모드로 설정하는 함수
function setEditMode(studentId) {
    editingStudentId = studentId
    submitButton.textContent = '학생 수정'
    cancelButton.style.display = 'inline-block'
    studentForm.name.focus()
}

// 폼 초기화 함수
function resetForm() {
    studentForm.reset()
    editingStudentId = null
    submitButton.textContent = '학생 등록'
    cancelButton.style.display = 'none'
    hideMessage()
    studentForm.name.focus()
}

// 학생 목록 불러오는 함수
function loadStudents() {
    console.log('학생 목록 불러오는 중...')
    
    fetch(`${API_BASE_URL}/api/students`)
    .then(function(response) {
        if (!response.ok) {
            return response.json().then(function(error) {
                throw new Error(error.message || '학생 목록을 불러올 수 없습니다.')
            })
        }
        return response.json()
    })
    .then(function(students) {
        console.log(`${students.length}명의 학생 데이터를 받았습니다.`)
        showStudentTable(students)
    })
    .catch(function(error) {
        console.error('목록 로드 오류:', error)
        showErrorMessage(error.message)
        showErrorTable(error.message)
    })
}

// 학생 목록 테이블에 표시하는 함수
function showStudentTable(students) {
    // 테이블 내용 초기화
    studentTableBody.innerHTML = ''
    
    // 학생이 없는 경우
    if (students.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #666; padding: 20px;">
                    등록된 학생이 없습니다.
                </td>
            </tr>
        `
        return
    }
    
    // 각 학생 데이터로 테이블 행 만들기
    for (let i = 0; i < students.length; i++) {
        const student = students[i]
        const row = createStudentRow(student)
        studentTableBody.appendChild(row)
    }
}

// 학생 한 명의 테이블 행을 만드는 함수
function createStudentRow(student) {
    const row = document.createElement('tr')
    
    // 학생 데이터 안전하게 가져오기
    const name = student.name || ''
    const studentNumber = student.studentNumber || ''
    const address = student.detail ? student.detail.address : '-'
    const phoneNumber = student.detail ? student.detail.phoneNumber : '-'
    const email = student.detail ? student.detail.email : '-'
    const dateOfBirth = student.detail && student.detail.dateOfBirth ? 
        formatDate(student.detail.dateOfBirth) : '-'
    
    row.innerHTML = `
        <td>${name}</td>
        <td>${studentNumber}</td>
        <td>${address}</td>
        <td>${phoneNumber}</td>
        <td>${email}</td>
        <td>${dateOfBirth}</td>
        <td class="action-buttons">
            <button class="edit-btn" onclick="editStudent(${student.id})">수정</button>
            <button class="delete-btn" onclick="deleteStudent(${student.id}, '${name}')">삭제</button>
        </td>
    `
    
    return row
}

// 날짜를 보기 좋은 형식으로 변환하는 함수
function formatDate(dateString) {
    if (!dateString) return '-'
    
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR')
    } catch (error) {
        console.error('날짜 형식 오류:', error)
        return dateString
    }
}

// 오류 테이블 표시하는 함수
function showErrorTable(errorMessage) {
    studentTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: #dc3545; padding: 20px;">
                오류: 데이터를 불러올 수 없습니다.<br>
                ${errorMessage}
            </td>
        </tr>
    `
}

// 버튼 상태 설정하는 함수
function setButtonState(isDisabled, text) {
    submitButton.disabled = isDisabled
    submitButton.textContent = text
}

// 성공 메시지 표시 함수
function showSuccessMessage(message) {
    formErrorSpan.textContent = message
    formErrorSpan.style.display = 'block'
    formErrorSpan.style.color = '#28a745'
    formErrorSpan.style.backgroundColor = '#d4edda'
    formErrorSpan.style.borderColor = '#c3e6cb'
    
    // 3초 후 메시지 숨기기
    setTimeout(function() {
        hideMessage()
    }, 3000)
}

// 오류 메시지 표시 함수
function showErrorMessage(message) {
    formErrorSpan.textContent = message
    formErrorSpan.style.display = 'block'
    formErrorSpan.style.color = '#dc3545'
    formErrorSpan.style.backgroundColor = '#f8d7da'
    formErrorSpan.style.borderColor = '#f5c6cb'
    
    // 5초 후 메시지 숨기기
    setTimeout(function() {
        hideMessage()
    }, 5000)
}

// 메시지 숨기는 함수
function hideMessage() {
    formErrorSpan.style.display = 'none'
    formErrorSpan.style.backgroundColor = ''
    formErrorSpan.style.borderColor = ''
}