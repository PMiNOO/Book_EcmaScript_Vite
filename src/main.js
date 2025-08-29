// CSS 파일 불러오기
import './css/style.css'

// 유효성 검사 모듈과 UI 모듈 임포트
import { apiService } from './modules/api'
import { uiService } from './modules/ui'
import { validateBook } from './modules/validation'

// 전역 변수들
const API_BASE_URL = 'http://localhost:8088'
let editingBookId = null


// DOM 요소들
let bookForm
let bookTableBody
let submitButton
let cancelButton
let formErrorSpan

// 페이지가 로드되면 실행되는 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지가 로드되었습니다.')
    
    // DOM 요소들 찾기
    bookForm = document.getElementById('bookForm')
    bookTableBody = document.getElementById('bookTableBody')
    submitButton = document.querySelector('button[type="submit"]')
    cancelButton = document.querySelector('.cancel-btn')
    formErrorSpan = document.getElementById('formError')
    
    // 이벤트 설정
    setupEvents()
    
    // 도서 목록 불러오기
    loadBooks()
})

// 이벤트 설정하는 함수
function setupEvents() {
    // 폼 제출 이벤트
    bookForm.addEventListener('submit', function(event) {
        event.preventDefault()
        handleFormSubmit()
    })
    
    // 취소 버튼 이벤트
    cancelButton.addEventListener('click', function() {
        resetForm()
    })
}

// 폼 제출 처리하는 함수
async function handleFormSubmit() {
    console.log('폼이 제출되었습니다.')
    
    // 폼 데이터 가져오기
    const formData = new FormData(bookForm)
    
    // 도서 데이터 객체 만들기
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        isbn: formData.get('isbn').trim(),
        price: parseInt(formData.get('price')) || 0,
        publishDate: formData.get('publishDate') || null,
        detailRequest: {
            description: formData.get('description').trim(),
            language: formData.get('language').trim(),
            pageCount: parseInt(formData.get('pageCount')) || 0,
            publisher: formData.get('publisher').trim(),
            coverImageUrl: formData.get('coverImageUrl').trim(),
            edition: formData.get('edition').trim()
        }
    }
    
    // 입력값 검증
    const validationResult = validateBook(bookData)
    if (!validationResult.isValid) {
        uiService.showError(validationResult.message)
        return
    }
    
    console.log('검증 완료된 데이터:', bookData)
    
    // 버튼 비활성화
    uiService.setButtonLoading(submitButton, true, '처리 중...')

    try {
        // 수정 모드인지 확인
        if (editingBookId) {
            await apiService.updateBook(editingBookId, bookData)
            uiService.showSuccess('도서 정보가 성공적으로 수정되었습니다!')
        } else {
            await apiService.createBook(bookData)
            uiService.showSuccess('도서가 성공적으로 등록되었습니다!')
        }
        resetForm()
        loadBooks()
    } catch (error) {
        console.error('API 호출 오류:', error)
        uiService.showError(error.message)
    } finally {
        uiService.setButtonLoading(submitButton, false, '도서 등록')
    }
}

// 도서 삭제 함수 (전역 함수로 만들어야 HTML onclick에서 호출 가능)
window.deleteBook = async function(bookId, bookTitle) {
    if (!confirm(`제목 = '${bookTitle}' 도서를 정말로 삭제하시겠습니까?`)) {
        return
    }
    
    console.log('도서 삭제 시작:', bookId)
    
    try {
        await apiService.deleteBook(bookId)
        uiService.showSuccess('도서가 성공적으로 삭제되었습니다!')
        loadBooks()
    } catch (error) {
        console.error('삭제 오류:', error)
        uiService.showError(error.message)
    }
}

// 도서 편집 모드로 전환 함수 (전역 함수)
window.editBook = async function(bookId) {
    console.log('도서 편집 시작:', bookId)
    
    try {
        const book = await apiService.getBook(bookId)
        console.log('도서 정보:', book)
        fillFormWithBookData(book)
        setEditMode(bookId)
    } catch (error) {
        console.error('편집 오류:', error)
        uiService.showError(error.message)
    }
}

// 폼에 도서 데이터 채우는 함수
function fillFormWithBookData(book) {
    bookForm.title.value = book.title || ''
    bookForm.author.value = book.author || ''
    bookForm.isbn.value = book.isbn || ''
    bookForm.price.value = book.price || ''
    bookForm.publishDate.value = book.publishDate || ''
    
    if (book.detail) {
        bookForm.description.value = book.detail.description || ''
        bookForm.language.value = book.detail.language || ''
        bookForm.pageCount.value = book.detail.pageCount || ''
        bookForm.publisher.value = book.detail.publisher || ''
        bookForm.coverImageUrl.value = book.detail.coverImageUrl || ''
        bookForm.edition.value = book.detail.edition || ''
    }
}

// 편집 모드로 설정하는 함수
function setEditMode(bookId) {
    editingBookId = bookId
    submitButton.textContent = '도서 수정'
    cancelButton.style.display = 'inline-block'
    bookForm.title.focus()
}

// 폼 초기화 함수
function resetForm() {
    bookForm.reset()
    editingBookId = null
    submitButton.textContent = '도서 등록'
    cancelButton.style.display = 'none'
    uiService.hideMessage()
    bookForm.title.focus()
}

// 도서 목록 불러오는 함수
async function loadBooks() {
    console.log('도서 목록 불러오는 중...')
    
    try {
        const books = await apiService.getBooks()
        console.log(`${books.length}권의 도서 데이터를 받았습니다.`)
        showBookTable(books)
    } catch (error) {
        console.error('목록 로드 오류:', error)
        showErrorTable(error.message)
    }
}

// 도서 목록 테이블에 표시하는 함수
function showBookTable(books) {
    // 테이블 내용 초기화
    bookTableBody.innerHTML = ''
    
    // 도서가 없는 경우
    if (books.length === 0) {
        bookTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #666; padding: 20px;">
                    등록된 도서가 없습니다.
                </td>
            </tr>
        `
        return
    }
    
    // 각 도서 데이터로 테이블 행 만들기
    for (const book of books) {
        const row = createBookRow(book)
        bookTableBody.appendChild(row)
    }
}

// 도서 한 권의 테이블 행을 만드는 함수
function createBookRow(book) {
    const row = document.createElement('tr')
    
    // 도서 데이터 안전하게 가져오기
    const title = book.title || ''
    const author = book.author || ''
    const isbn = book.isbn || ''
    const price = book.price ? `${book.price}원` : '-'
    const publishDate = book.publishDate || '-'
    const description = book.detail ? book.detail.description || '' : ''
    
    row.innerHTML = `
        <td>${title}</td>
        <td>${author}</td>
        <td>${isbn}</td>
        <td>${price}</td>
        <td>${publishDate}</td>
        <td>${description.length > 50 ? description.substring(0, 50) + '...' : description}</td>
        <td class="action-buttons">
            <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
            <button class="delete-btn" onclick="deleteBook(${book.id}, '${title}')">삭제</button>
        </td>
    `
    
    return row
}

// 오류 테이블 표시하는 함수
function showErrorTable(errorMessage) {
    bookTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; color: #dc3545; padding: 20px;">
                오류: 데이터를 불러올 수 없습니다.<br>
                ${errorMessage}
            </td>
        </tr>
    `
}