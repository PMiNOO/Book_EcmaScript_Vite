import { stringUtils } from '../utils/helpers';

const { isEmpty, safeTrim } = stringUtils;

// 유효성 검사 모듈
export const patterns = {
    // ISBN 패턴: 10자리 또는 13자리 숫자, 하이픈 포함 가능
    isbn: /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[-\d]+$/,
}

export const messages = {
    required: {
        title: '도서 제목을 입력해주세요.',
        author: '저자 이름을 입력해주세요.',
        isbn: 'ISBN을 입력해주세요.',
        price: '가격을 입력해주세요.',
        description: '도서 설명을 입력해주세요.',
        language: '언어를 입력해주세요.',
        pageCount: '페이지 수를 입력해주세요.',
        publisher: '출판사를 입력해주세요.',
        coverImageUrl: '표지 URL을 입력해주세요.',
        edition: '에디션을 입력해주세요.',
    },
    format: {
        isbn: '올바른 ISBN 형식이 아닙니다. (10자리 또는 13자리)',
        price: '가격은 0 이상이어야 합니다.',
        pageCount: '페이지 수는 0 이상이어야 합니다.',
    }
}

const validators = {
    title: (title) => {
        if (isEmpty(title)) {
            return { isValid: false, message: messages.required.title, field: 'title' }
        }
        return { isValid: true }
    },
    author: (author) => {
        if (isEmpty(author)) {
            return { isValid: false, message: messages.required.author, field: 'author' }
        }
        return { isValid: true }
    },
    isbn: (isbn) => {
        if (isEmpty(isbn)) {
            return { isValid: false, message: messages.required.isbn, field: 'isbn' }
        }
        if (!patterns.isbn.test(safeTrim(isbn))) {
            return { isValid: false, message: messages.format.isbn, field: 'isbn' }
        }
        return { isValid: true }
    },
    price: (price) => {
        // 숫자 0도 유효하므로, null 또는 undefined를 먼저 체크
        if (price !== null && price !== undefined) {
             if (price < 0) {
                return { isValid: false, message: messages.format.price, field: 'price' }
            }
        }
        return { isValid: true }
    },
    pageCount: (pageCount) => {
        if (pageCount !== null && pageCount !== undefined) {
            if (pageCount < 0) {
                return { isValid: false, message: messages.format.pageCount, field: 'pageCount' }
            }
        }
        return { isValid: true }
    },
    description: (description) => {
        if (isEmpty(description)) {
            return { isValid: false, message: messages.required.description, field: 'description' }
        }
        return { isValid: true }
    },
    language: (language) => {
        if (isEmpty(language)) {
            return { isValid: false, message: messages.required.language, field: 'language' }
        }
        return { isValid: true }
    },
    publisher: (publisher) => {
        if (isEmpty(publisher)) {
            return { isValid: false, message: messages.required.publisher, field: 'publisher' }
        }
        return { isValid: true }
    },
    coverImageUrl: (coverImageUrl) => {
        if (isEmpty(coverImageUrl)) {
            return { isValid: false, message: messages.required.coverImageUrl, field: 'coverImageUrl' }
        }
        return { isValid: true }
    },
    edition: (edition) => {
        if (isEmpty(edition)) {
            return { isValid: false, message: messages.required.edition, field: 'edition' }
        }
        return { isValid: true }
    }
}

// 메인 검증 함수 - 도서 객체 전체를 검증
export const validateBook = (book) => {
    if (!book) {
        return { isValid: false, message: '도서 데이터가 필요합니다.' }
    }
    
    const { title, author, isbn, price, detailRequest } = book
    
    const titleResult = validators.title(title)
    if (!titleResult.isValid) return titleResult
    
    const authorResult = validators.author(author)
    if (!authorResult.isValid) return authorResult
    
    const isbnResult = validators.isbn(isbn)
    if (!isbnResult.isValid) return isbnResult
    
    const priceResult = validators.price(price)
    if (!priceResult.isValid) return priceResult

    if (detailRequest) {
        const { description, language, pageCount, publisher, coverImageUrl, edition } = detailRequest
        
        const descriptionResult = validators.description(description)
        if (!descriptionResult.isValid) return descriptionResult
        
        const languageResult = validators.language(language)
        if (!languageResult.isValid) return languageResult
        
        const pageCountResult = validators.pageCount(pageCount)
        if (!pageCountResult.isValid) return pageCountResult

        const publisherResult = validators.publisher(publisher)
        if (!publisherResult.isValid) return publisherResult
        
        const coverImageUrlResult = validators.coverImageUrl(coverImageUrl)
        if (!coverImageUrlResult.isValid) return coverImageUrlResult

        const editionResult = validators.edition(edition)
        if (!editionResult.isValid) return editionResult
    }
    
    return { isValid: true }
}

// 실시간 검증 함수
export const validateField = (fieldName, value) => {
    const validator = validators[fieldName]
    
    if (!validator) {
        return { isValid: true, message: '알 수 없는 필드입니다.' }
    }
    
    return validator(value)
}