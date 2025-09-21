export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} EcoGreen. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          <a className="hover:text-teal-700" href="/ve-chung-toi">Về chúng tôi</a>
          <a className="hover:text-teal-700" href="/lien-he">Liên hệ</a>
          <a className="hover:text-teal-700" href="/chinh-sach">Chính sách</a>
        </nav>
      </div>
    </footer>
  )
}
