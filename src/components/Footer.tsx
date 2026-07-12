export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-base-200">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-center md:text-left">
        <h2 className="text-lg font-semibold">Contact Us</h2>

        <p>Email: speechcoach@email.com</p>

        <p className="pt-4 text-sm opacity-70">
          © {new Date().getFullYear()} Speech Coach. All rights reserved.
        </p>
      </div>
    </footer>
  );
}