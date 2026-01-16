import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 링크 */}
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
          <Link to="#" className="text-gray-600 hover:text-black transition-colors">
            이용약관
          </Link>
          <Link to="#" className="text-gray-600 hover:text-black transition-colors">
            개인정보처리방침
          </Link>
          <Link to="#" className="text-gray-600 hover:text-black transition-colors">
            자주 묻는 질문
          </Link>
          <Link to="#" className="text-gray-600 hover:text-black transition-colors">
            고객센터
          </Link>
        </div>

        {/* 회사 정보 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">butaxi</p>
          <p>대표: 홍성윤 | 사업자등록번호: 000-00-00000</p>
          <p>주소: 서울특별시 강남구</p>
          <p>고객센터: 010-4922-0573 | 이메일: support@butaxi.com</p>
        </div>

        {/* 저작권 */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            © {currentYear} butaxi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
