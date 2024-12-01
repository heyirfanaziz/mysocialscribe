import ModeToggle from '@/components/components/mode-toggle'
import Logo from '@/components/components/logo'
import UserMenu from '@/components/components/user-menu'

const Header = () => {
  return (
    <>
      <header className="relative py-4 pb-4 md:pt-8">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 md:px-0">
          <Logo />

          <div className="flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-200/30 to-neutral-200/0" />
    </>
  )
}

export default Header
