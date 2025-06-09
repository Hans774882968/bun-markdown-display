import { cn } from '@/common/utils';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LinkSchema {
  href: string;
  icon?: ReactNode;
  label: string;
}

interface Props {
  btn: ReactNode
  links: LinkSchema[]
  menuItemsClasses?: string
}

export default function NavbarMenu({ btn, links, menuItemsClasses }: Props) {
  return (
    <Menu as="div" className="relative">
      <div>
        <MenuButton className="relative p-2 data-focus:bg-white/10 focus:not-data-focus:outline-none data-hover:bg-white/10 data-open:bg-white/10">
          {btn}
        </MenuButton>
      </div>
      <MenuItems
        transition
        className={cn(
          'absolute right-0 mt-4 bg-[#1a1a1a] origin-top-right rounded-md shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in',
          menuItemsClasses
        )}
      >
        {
          links.map(({ label, href, icon }) => (
            <MenuItem key={href}>
              <Link className="flex gap-2 justify-end items-center p-2 data-focus:bg-white/10" to={href}>
                <span className="flex-shrink-0">{icon}</span>
                <strong className="truncate flex-1" title={label}>{label}</strong>
              </Link>
            </MenuItem>
          ))
        }
      </MenuItems>
    </Menu>
  );
}
