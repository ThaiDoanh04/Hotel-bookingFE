import logo from '/Users/doandoanhthai/Java/Hotel-bookingFE/Hotel-booking/src/assets/logo/logo.jpg';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import HamburgerMenu from '../hamburger-menu/HamburgerMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import NavbarItems from '../navbar-items/NavbarItems';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
const GlobalNavbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  const onHamburgerMenuToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative flex flex-wrap items-center justify-between px-4 md:px-12 bg-blue-600 border-b border-blue-600 shadow-md">
      <div className="flex">
        <Link to="/">
          <img src={logo} alt="site logo" className="site-logo__img" />
        </Link>
      </div>
      <ul className="list-none hidden md:flex">
        <NavbarItems isAuthenticated={isAuthenticated} />
      </ul>
      {/* <FontAwesomeIcon
        data-testid="menu-toggle__button"
        icon={faBars}
        size="2x"
        color="#fff"
        className="block md:hidden"
        onClick={onHamburgerMenuToggle}
      /> */}
      {/* <HamburgerMenu
        isVisible={isVisible}
        onHamburgerMenuToggle={onHamburgerMenuToggle}
        isAuthenticated={isAuthenticated}
      /> */}
    </div>
  );
};

export default GlobalNavbar;